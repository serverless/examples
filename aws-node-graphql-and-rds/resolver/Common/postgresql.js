exports.init = async (client) => {
    var res = await client.query(`
    CREATE TABLE IF NOT EXISTS users
    (
        id serial not null PRIMARY KEY, 
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uuid char(36) not null, 
        name varchar(100) not null
    );  
    `)
    await client.query(`
    CREATE TABLE IF NOT EXISTS posts
    (
        id serial not null PRIMARY KEY, 
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uuid char(36) not null, 
        text varchar(100) not null, 
        user_id INT not null
    );  
    `)
}
exports.getUser = async (client, uuid) => {
    var user = {};
    var userFromDb = await client.query(`
    select id, uuid, name from users where uuid = $1 
    `, [uuid])
    if (userFromDb.rows.length == 0) {
        return null;
    }
    var postsFromDb = await client.query(`
    select uuid, text from posts where user_id = $1
    `, [userFromDb.rows[0].id])

    user.UUID = userFromDb.rows[0].uuid;
    user.Name = userFromDb.rows[0].name;

    if (postsFromDb.rows.length > 0) {
        user.Posts = postsFromDb.rows.map(function (x) { return { UUID: x.uuid, Text: x.text } });
    }

    return user;
}