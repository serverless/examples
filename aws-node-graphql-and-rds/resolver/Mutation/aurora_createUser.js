const uuidv4 = require('uuid/v4');
var common = require('../Common/aurora')
const Client = require('serverless-mysql')
exports.func = async (_, obj) => {
    var client = Client({
        config: {
            host: process.env.MYSQL_HOST,
            database: process.env.DB_NAME,
            user: process.env.USERNAME,
            password: process.env.PASSWORD
        }
    })
    await common.init(client)
    var userUUID = uuidv4();
    let user = await client.query('INSERT INTO users (uuid, name) VALUES(?,?)', [userUUID, obj.input.Name]);
    for (let index = 0; index < obj.input.Posts.length; index++) {
        const element = obj.input.Posts[index];
        await client.query('INSERT INTO posts (uuid, text, user_id) VALUES(?, ?, ?)',
            [uuidv4(), element.Text, user.insertId]);
    }
    var resp = await common.getUser(client, userUUID);
    client.quit()
    return resp;
}