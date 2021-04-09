const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7mlny.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json())
app.use(cors());


const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db("GadgetShop").collection("Products");
  const ordersCollection = client.db("GadgetShop").collection("Orders");

  app.post('/addProduct', (req, res) => {
    const product = req.body;
    productsCollection.find({ productKey: product.productKey })
      .toArray((err, documents) => {
        if (documents.length === 0) {
          if (product.productImageURL !== null) {
            productsCollection.insertOne(product)
              .then(result => {
                res.send(result.insertedCount > 0)
              })
          }
          else {
            res.send(false);
          }
        }
        else {
          res.send(false);
        }
      })
  })

  app.get('/products', (req, res) => {
    productsCollection.find()
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/orderProcess/:key', (req, res) => {
    const product = req.params.key;
    productsCollection.find({ productKey: product })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/orders', (req, res) => {
    ordersCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
 
  app.post('/placeOrder', (req,res) => {

    const placedOrderDetails = req.body;
    ordersCollection.insertOne(placedOrderDetails)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
    
  })


  app.delete('/delete/:key', (req, res) => {
    productsCollection.deleteOne({ productKey: req.params.key })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)