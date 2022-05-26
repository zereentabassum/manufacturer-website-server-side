const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const port = process.env.PORT || 5000

const app = express();

// middleware
app.use(cors());
app.use(express.json()); 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pjhca.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const partCollection = client.db('manufacturer').collection('parts');
        const orderCollection = client.db('manufacturer').collection('orders');
        const userCollection = client.db('manufacturer').collection('users');





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


      app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        // const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        res.send(result);
      });



      app.post('/order', async(req, res) => {
        const order = req.body;
        // const query = {orderName:order.orderName, quantity:order.quantity, customer:order.customer};
        // const exists = await orderCollection.findOne(query);
        const result = await orderCollection.insertOne(order);
        // sendOrderEmail(booking);
        // console.log(result);
         res.send(result);
         

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