const { Client } = require('pg')
var common = require('../Common/postgresql')
exports.func = async (_, { uuid }) => {
    var client = new Client({
        host: process.env.POSTGRESQL_HOST,
        port: process.env.POSTGRESQL_PORT,
        database: process.env.DB_NAME,
        user: process.env.USERNAME,
        password: process.env.PASSWORD
    })
    client.connect()
    await common.init(client)
    var resp = await common.getUser(client, uuid);
    client.end()
    return resp;
}