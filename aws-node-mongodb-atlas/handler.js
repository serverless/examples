// handler.js
'use strict';

const express = require('express');
const serverless = require('serverless-http');
const MongoClient = require('mongodb').MongoClient;
const faker = require('faker');

const mongoClusterName = '';
const mongoUser = '';
const mongoDbName = '';
const mongoPass = '';

const mongoConnStr = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoClusterName}-tdoka.mongodb.net/${mongoDbName}?retryWrites=true`;

const getPetType = () => {
    const msNow = Date.now();
    if (msNow % 2 === 0) {
        return 'cat';
    }
    return 'dog';
}

const getPet = () => {
    return {
        type: getPetType(),
        name: faker.name.findName(),
    };
}

const client = new MongoClient(mongoConnStr, {
    useNewUrlParser: true,
});
let db;

const createConn = async () => {
    await client.connect();
    db = client.db('test');
};

const performQuery = async () => {
    const pets = db.collection('pets');

    const newPet = getPet();

    return {
        insertedPet: newPet,
        mongoResult: await pets.insertOne(newPet),
    };
};

const app = express();

app.get('/hello', async function (req, res) {
    if (!client.isConnected()) {
        // Cold start or connection timed out. Create new connection.
        try {
            await createConn();
        } catch (e) {
            res.json({
                error: e.message,
            });
            return;
        }
    }

    // Connection ready. Perform insert and return result.
    try {
        res.json(await performQuery());
        return;
    } catch (e) {
        res.send({
            error: e.message,
        });
        return;
    }
});

module.exports = {
    app,
    hello: serverless(app),
};