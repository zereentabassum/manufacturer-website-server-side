const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const port = process.env.PORT || 5000

const app = express();

// middleware
app.use(cors());
app.use(express.json()); 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pjhca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next();
  });
}

async function run(){
    try{
        await client.connect();
        const partCollection = client.db('manufacturer').collection('parts');
        const orderCollection = client.db('manufacturer').collection('orders');
        const userCollection = client.db('manufacturer').collection('users');
        const reviewCollection = client.db('manufacturer').collection('reviews');





        app.get('/parts', async(req, res) =>{
          const query = {};
          const cursor = partCollection.find(query);
          const parts = await cursor.toArray();
          res.send(parts);
        })

        app.get('/parts/:_id', async(req, res) =>{
          const _id = req.params._id;
          const query = {_id: ObjectId(_id)};
          const part = await partCollection.findOne(query);
          res.send(part);
      })

      app.post('/parts', async(req, res) => {
        const newPart = req.body;
        const result = await partCollection.insertOne(newPart);
        res.send(result);
    });


      app.get('/user', async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
      });

      app.get('/admin/:email', async (req, res) => {
        const email = req.params.email;
        const user = await userCollection.findOne({ email: email });
        const isAdmin = user.role === 'admin';
        res.send({ admin: isAdmin })
      })
  

      app.put('/user/admin/:email', async (req, res) => {
        const email = req.params.email;
        const requester = req.params.email;
        const requesterAccount = await userCollection.findOne({email: requester})
        // if(requesterAccount.role === 'admin'){
          const filter = { email: email };
          const options = { upsert: true };
          const updateDoc = {
            $set: {role: 'admin'},
          };
          const result = await userCollection.updateOne(filter, updateDoc, options);
          res.send(result);
        // }
        // else(
        //   res.status(403).send({message:'forbidden'})
        // )
      
      });


      app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
         const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
         console.log(token);
        res.send({result, token});
      });


      // app.get('/orders', async(req, res) => {
      //   // const customer = req.query.customerEmail;
      //   // const query = {customer:customer};
      //   // console.log('auth header', authorization);
      //   const orders = await orderCollection.find().toArray();
      //   res.send(orders);
      // })
      app.get('/order', async(req, res) => {
        const customer = req.query.customerEmail;
        const query = {customer:customer};
        // console.log('auth header', authorization);
        const orders = await orderCollection.find(query).toArray();
        res.send(orders);
      })


      app.post('/order', async(req, res) => {
        const order = req.body;
        const query = {orderName:order.orderName, quantity:order.quantity, customerEmail:order.customerEmail};
        // const exists = await orderCollection.findOne(query);
        const result = await orderCollection.insertOne(query);
        // sendOrderEmail(booking);
        // console.log(result);
         res.send(result);

         app.get('/reviews', async(req, res) =>{
          const query = {};
          const cursor = reviewCollection.find(query);
          const reviews = await cursor.toArray();
          res.send(reviews);
        })
        app.post('/reviews', async(req, res) => {
          const newReview = req.body;
          const result = await reviewCollection.insertOne(newReview);
          res.send(result);
      });
  


       
      

    //  DELETE
      app.delete('/part/:_id', async(req, res) =>{
          const _id = req.params._id;
          const query = {_id: ObjectId(_id)};
          const result = await partCollection.deleteOne(query);
          res.send(result);
      })
  
         

      });
    

    }
    finally{

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello Computer!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})