const express = require('express')
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sykxlbw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server(optional starting in v4.7)
    await client.connect();
    const userCollection = client.db('online-library').collection('users')
    const booksCollection = client.db('online-library').collection('books')
    const cartCollection = client.db('online-library').collection('cart')
    const ordersCollection = client.db('online-library').collection('orders')

    app.delete('/deleteFullCart/:email',async (req,res)=>{
      const email=req.params.email
      const query={email:email}
      const result=await cartCollection.deleteMany(query)
      res.send(result)
    })
    
    app.post('/orders', async (req, res) => {
      const orderInfo = req.body
      const result = await ordersCollection.insertOne(orderInfo)
      res.send(result) 
})

    app.get('/users', async (req, res) => {
      const cursor = userCollection.find()
      const result = await cursor.toArray()
      res.send(result)

    })

    app.delete('/deleteCart/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })
    app.delete('/deleteBook/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await booksCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/cart/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const result = await cartCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/addToCart', async (req, res) => {
      const bookInfo = req.body
      const result = await cartCollection.insertOne(bookInfo)
      res.send(result)
    })

    app.get('/user/admin/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await userCollection.findOne(query)
      let admin = false
      if (user) {
        admin = user?.role === "admin"
      }
      res.send({ admin })
    })
    app.get('/allBooks/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await booksCollection.findOne(query)
      res.send(result)

    })

    app.get('/allBooks', async (req, res) => {
      const cursor = booksCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      const userInfo = req.body
      const query = { email: userInfo.email }
      const existingUser = await userCollection.findOne(query)
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }
      const result = await userCollection.insertOne(userInfo)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on ${port}`)
})

