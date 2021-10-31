const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.byllt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    // console.log('connected to database');
    const database = client.db('tripper');
    const packagesCollection = database.collection('packages');
    const orderCollection = database.collection('orders');


    // GET PACKAGES API
    app.get('/packages', async (req, res) => {
      const cursor = packagesCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    })

    // GET Single Package
    app.get('/packages/:id', async (req, res) => {
      const id = req.params.id;
      console.log('getting specific package', id);
      const query = { _id: ObjectId(id) };
      const package = await packagesCollection.findOne(query);
      res.json(package);
    })

    // POST API
    app.post('/packages', async (req, res) => {
      const package = req.body;
      console.log('hit the post api', package);

      const result = await packagesCollection.insertOne(package);
      console.log(result);
      res.json(result);
    })

    // Add Orders API
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    })

    // MY ORDERS
    app.get("/myOrders/:email", async (req, res) => {
      const email= req.params.email;
      const result = await orderCollection.find({email}).toArray();
      res.send(result);
    });
    
    // GET Orders API
    app.get('/orders', async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    })

    // single orders DELETE API 
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    })

  }
  finally {
    // await client.close();

  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running Tripper Server')
})

app.listen(port, () => {
  console.log(`Running Tripper Server at http://localhost:${port}`)
})