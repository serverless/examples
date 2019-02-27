import Sequelize from 'sequelize';

const host = process.env.MYSQL_HOST;
const port = parseInt(process.env.MYSQL_PORT, 10);
const database = process.env.MYSQL_DB;
const username = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;

export const sequelize = new Sequelize({
  host,
  port,
  database,
  username,
  password,
  dialect: 'mysql',
  operatorsAliases: false,
});

export const Task = sequelize.define('tasks', {
  title: Sequelize.STRING,
});

console.info('[db] connecting to %s@%s:%s/%s', username, host, port, database);
sequelize
  .sync()
  .then(() => console.info('[db] connected'))
  .catch(error => console.error('[db] error connecting:', error));
