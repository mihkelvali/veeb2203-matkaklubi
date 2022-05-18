const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const PORT = process.env.PORT || 5000;

let matkad;

const uri = "mongodb+srv://matka-app-2203:koolitus123@cluster0.g4czp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const loeMatkadMallu = (async () => {
  try {
    await client.connect();
    const collection = client.db('matka-app-2203').collection('treks');
    matkad = await collection.find().toArray();
  } finally {
    await client.close();
    console.log(matkad);
  }
})()

const naitaMatkaVaadet = async (req, res) => {
  let matk;
  try {
    await client.connect();
    const collection = client.db('matka-app-2203').collection('treks');
    matk = await collection.findOne({ _id: new ObjectId(req.params.matkaId) });
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
  return res.render('pages/trek', { matk });
}

const registreeriOsaleja = async (req, res) => {
  const paringuKeha = req.body;
  try {
    await client.connect();
    const collection = client.db('matka-app-2203').collection('treks');
    const filter = { _id: new ObjectId(paringuKeha.matkaId) };
    const updateDoc = {
      $push: { participants: paringuKeha.osaleja }
    };
    matk = await collection.updateOne(filter, updateDoc);
    res.json({ response: 'Töötas!' });
  } catch (error) {
    console.log(error);
    res.json({ response: 'Katki läks!' });
  } finally {
    await client.close();
  }
}

const tagastaMatkad = async (req, res) => {
  try {
    await client.connect();
    const collection = client.db('matka-app-2203').collection('treks');
    const treks = await collection.find().toArray();
    res.json(treks);
  } catch (error) {
    console.log(error);
    res.json({ response: 'Katki läks!' });
  } finally {
    await client.close();
  }
}

const salvestaMatk = async (req, res) => {
  const matkaId = req.params.matkaId;
  try {
    await client.connect();
    const collection = client.db('matka-app-2203').collection('treks');
    const filter = { _id: new ObjectId(matkaId) };
    const updateDoc = {
      $set: {
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
      }
    };
    matk = await collection.updateOne(filter, updateDoc);
    res.json({ response: 'Töötas!' });
  } catch (error) {
    console.log(error);
    res.json({ response: 'Katki läks!' });
  } finally {
    await client.close();
  }
}

express()
  .use(express.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/contact', (req, res) => res.render('pages/contact'))
  .get('/treks/:matkaId', naitaMatkaVaadet)
  .get('/treks', (req, res) => res.render('pages/treks', { matkad: matkad }))
  .get('/news', (req, res) => res.render('pages/news'))
  .get('/admin', (req, res) => res.render('pages/admin'))
  .post('/api/register', registreeriOsaleja)
  .get('/api/treks', tagastaMatkad)
  .post('/api/treks/:matkaId', salvestaMatk)
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
