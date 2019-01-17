// handler.js
'use strict';

const express = require('express');
const serverless = require('serverless-http');
const pg = require('pg');
const axios = require('axios');
const parsePgConnStr = require('pg-connection-string').parse;

// Replace with your token or API key and your Heroku Postgres resource name
const herokuApiKey = '';
const herokuPostgresId = '';
const herokuClient = axios.create({
    baseURL: 'https://api.heroku.com/',
    headers: {
        'Authorization': `Bearer ${herokuApiKey}`,
        'Accept': 'application/vnd.heroku+json; version=3',
    },
});

let pgConfig;
let pgPool;

const app = express();

const createConn = async () => {
    console.log('Creating PG connection.');

    const credsResponse = await herokuClient.get(`addons/${herokuPostgresId}/config`);
    const pgConnStr = credsResponse.data[0]['value'];

    pgConfig = {
        ...parsePgConnStr(pgConnStr), ...{
            max: 1,
            ssl: true,
        },
    };

    pgPool = new pg.Pool(pgConfig);
};

const performQuery = async () => {
    const client = await pgPool.connect();
    const result = await client.query('SELECT now()');
    client.release();
    return result;
};

app.get('/hello', async function (req, res) {
    if (!pgPool) {
        // Cold start. Get Heroku Postgres creds and create pool.
        await createConn();
    } else {
        console.log('Using existing PG connection.');
    }

    try {
        const result = await performQuery();

        res.json({
            result: `According to PostgreSQL, the time is: ${result.rows[0].now}`,
            pgConfigUsed: pgConfig,
        });
        return;
    } catch (e) {
        res.json({
            error: e.message,
        });
        return;
    }

});

app.post('/onrelease', async function (req, res) {
    // Get Heroku Postgres creds and replace pool with new one.
    await createConn();

    // Response with 2xx response so Heroku knows webhook was successful.
    // Response body doesn't matter.
    res.status(204).send();
});

module.exports = {
    app,
    hello: serverless(app),
};
