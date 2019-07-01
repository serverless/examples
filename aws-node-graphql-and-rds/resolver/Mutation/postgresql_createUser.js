const uuidv4 = require('uuid/v4');
const { Client } = require('pg')
var common = require('../Common/postgresql')

exports.func = async (_, obj) => {
    var client = new Client({
        host: process.env.POSTGRESQL_HOST,
        port: process.env.POSTGRESQL_PORT,
        database: process.env.DB_NAME,
        user: process.env.USERNAME,
        password: process.env.PASSWORD
    })
    client.connect()
    await common.init(client)
    var userUUID = uuidv4();
    let userInserted = await client.query('INSERT INTO users (uuid, name) VALUES($1, $2) RETURNING id', [userUUID, obj.input.Name]);

    var userId = userInserted.rows[0].id
    for (let index = 0; index < obj.input.Posts.length; index++) {
        const element = obj.input.Posts[index];
        await client.query('INSERT INTO posts (uuid, text, user_id) VALUES($1, $2, $3)',
            [uuidv4(), element.Text, userId]);
    }
    var resp = await common.getUser(client, userUUID);
    client.end()
    return resp;
}