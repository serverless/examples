exports.init = async (client) => {
    await client.query(`
    CREATE TABLE IF NOT EXISTS users
    (
        id MEDIUMINT UNSIGNED not null AUTO_INCREMENT, 
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uuid char(36) not null, 
        name varchar(100) not null, 
        PRIMARY KEY (id)
    );  
    `)
    await client.query(`
    CREATE TABLE IF NOT EXISTS posts
    (
        id MEDIUMINT UNSIGNED not null AUTO_INCREMENT, 
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uuid char(36) not null, 
        text varchar(100) not null, 
        user_id MEDIUMINT UNSIGNED not null,
        PRIMARY KEY (id)
    );  
    `)
}
exports.getUser = async (client, uuid) => {
    var user = {};
    var userFromDb = await client.query(`
    select id, uuid, name from users where uuid = ? 
    `, [uuid])
    if (userFromDb.length == 0) {
        return null;
    }
    var postsFromDb = await client.query(`
    select uuid, text from posts where user_id = ?
    `, [userFromDb[0].id])

    user.UUID = userFromDb[0].uuid;
    user.Name = userFromDb[0].name;

    if (postsFromDb.length > 0) {
        user.Posts = postsFromDb.map(function (x) { return { UUID: x.uuid, Text: x.text } });
    }
    return user;
}