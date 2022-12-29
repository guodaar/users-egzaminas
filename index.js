require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

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
    console.log(data);
    const con = await client.connect();
    const users = await con
      .db('users_db')
      .collection('users')
      .insertMany([
        {
          id: data[0].id,
          name: `${data[0].name}`,
          email: `${data[0].email}`,
        },
        {
          id: +data[1].id,
          name: `${data[1].name}`,
          email: `${data[1].email}`,
        },
        {
          id: +data[2].id,
          name: `${data[2].name}`,
          email: `${data[2].email}`,
        },
        {
          id: +data[3].id,
          name: `${data[3].name}`,
          email: `${data[3].email}`,
        },
        {
          id: +data[4].id,
          name: `${data[4].name}`,
          email: `${data[4].email}`,
        },
        {
          id: +data[5].id,
          name: `${data[5].name}`,
          email: `${data[5].email}`,
        },
        {
          id: +data[6].id,
          name: `${data[6].name}`,
          email: `${data[6].email}`,
        },
        {
          id: +data[7].id,
          name: `${data[7].name}`,
          email: `${data[7].email}`,
        },
        {
          id: +data[8].id,
          name: `${data[8].name}`,
          email: `${data[8].email}`,
        },
        {
          id: +data[9].id,
          name: `${data[9].name}`,
          email: `${data[9].email}`,
        },
      ]);
    const address = await con
      .db('users_db')
      .collection('address')
      .insertMany([
        {
          street: `${data[0].address.street}`,
          city: `${data[0].address.city}`,
          user_id: +data[0].id,
        },
        {
          street: `${data[1].address.street}`,
          city: `${data[1].address.city}`,
          user_id: +data[1].id,
        },
        {
          street: `${data[2].address.street}`,
          city: `${data[2].address.city}`,
          user_id: +data[2].id,
        },
        {
          street: `${data[3].address.street}`,
          city: `${data[3].address.city}`,
          user_id: +data[3].id,
        },
        {
          street: `${data[4].address.street}`,
          city: `${data[4].address.city}`,
          user_id: +data[4].id,
        },
        {
          street: `${data[5].address.street}`,
          city: `${data[5].address.city}`,
          user_id: +data[5].id,
        },
        {
          street: `${data[6].address.street}`,
          city: `${data[6].address.city}`,
          user_id: +data[6].id,
        },
        {
          street: `${data[7].address.street}`,
          city: `${data[7].address.city}`,
          user_id: +data[7].id,
        },
        {
          street: `${data[8].address.street}`,
          city: `${data[8].address.city}`,
          user_id: +data[8].id,
        },
        {
          street: `${data[9].address.street}`,
          city: `${data[9].address.city}`,
          user_id: +data[9].id,
        },
      ]);
    await con.close();
    res.send(address);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { id, name, email } = req.body;
    const { street, city, userId } = req.body.address;
    const con = await client.connect();
    const user = await con
      .db('users_db')
      .collection('users')
      .insertOne({
        id: +id,
        name: `${name}`,
        email: `${email}`,
      });
    const address = await con
      .db('users_db')
      .collection('address')
      .insertOne({
        street: `${street}`,
        email: `${city}`,
        user_id: +userId,
      });
    res.send(user, address);
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
      .aggregate([{ $project: { id: 1, name: 1 } }])
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
            localField: 'id',
            foreignField: 'user_id',
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
        { $unset: ['address._id', 'address.user_id'] },
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
