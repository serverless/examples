// handler.js
import express from 'express';
import serverless from 'serverless-http';
import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

const mongoConnStr = process.env.MONGODB_URI ?? '';

const client = new MongoClient(mongoConnStr);
let connectPromise;

// Cache the connection promise so warm Lambda invocations reuse the same
// MongoDB connection instead of reconnecting on every request. On failure,
// clear the cache so the next request retries instead of being stuck with a
// rejected promise for the lifetime of the warm container.
const getDb = async () => {
  if (!connectPromise) {
    connectPromise = client.connect().catch((err) => {
      connectPromise = undefined;
      throw err;
    });
  }
  await connectPromise;
  return client.db('test');
};

const getPetType = () => (Date.now() % 2 === 0 ? 'cat' : 'dog');

const getPet = () => ({
  type: getPetType(),
  name: faker.person.fullName(),
});

const performQuery = async (db) => {
  const pets = db.collection('pets');
  const newPet = getPet();

  return {
    insertedPet: newPet,
    mongoResult: await pets.insertOne(newPet),
  };
};

const app = express();

app.get('/hello', async (req, res) => {
  try {
    const db = await getDb();
    res.json(await performQuery(db));
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

export { app };
export const hello = serverless(app);
