require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;
const uri = process.env.URI;

const client = new MongoClient(uri);

app.use(cors());
app.use(express.json());

app.post('/fill', async (req, res) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await response.json();
    const usersCollection = [];
    const addressCollection = [];
    data.forEach((element) => {
      const id = uuidv4();
      const user = {
        _id: id,
        name: `${element.name}`,
        email: `${element.email}`,
      };
      const address = {
        _id: id,
        street: `${element.address.street}`,
        city: `${element.address.city}`,
      };
      usersCollection.push(user);
      addressCollection.push(address);
    });
    const con = await client.connect();
    const users = await con
      .db('users_db')
      .collection('users')
      .insertMany(usersCollection);
    const addresses = await con
      .db('users_db')
      .collection('address')
      .insertMany(addressCollection);
    await con.close();
    res.send(users);
    res.send(addresses);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const { street, city } = req.body.address;
    const con = await client.connect();
    const id = uuidv4();
    const user = await con
      .db('users_db')
      .collection('users')
      .insertOne({
        _id: id,
        name: `${name}`,
        email: `${email}`,
      });
    const address = await con
      .db('users_db')
      .collection('address')
      .insertOne({
        _id: id,
        street: `${street}`,
        email: `${city}`,
      });
    res.send(user);
    res.send(address);
    res.status(400).send({
      error: 'Invalid request',
    });
    await con.close();
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.get('/users/names', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('users_db')
      .collection('users')
      .aggregate([{ $project: { _id: 1, name: 1 } }])
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.get('/users/emails', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con.db('users_db').collection('users').find().toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.get('/users/address', async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con
      .db('users_db')
      .collection('users')
      .aggregate([
        {
          $lookup: {
            from: 'address',
            localField: '_id',
            foreignField: '_id',
            as: 'address',
          },
        },
        { $unwind: '$address' },
        {
          $project: {
            name: '$name',
            address: '$address',
          },
        },
        { $unset: ['address._id'] },
      ])
      .toArray();
    await con.close();
    res.send(data);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port} port`);
});
