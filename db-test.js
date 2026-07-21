const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://arcade:arcade@localhost:5432/arcade' });
client.connect().then(() => {
  return client.query('SELECT * FROM channels WHERE id = $1', ['c2dff76c-5970-4989-85e7-8053a759f6cc']);
}).then(res => {
  console.log('Channel:', res.rows[0]);
  if (res.rows[0]) {
    return client.query('SELECT * FROM users WHERE id = $1', [res.rows[0].owner_user_id]);
  }
}).then(res => {
  if (res) console.log('User:', res.rows[0]);
  client.end();
}).catch(console.error);
