const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://arcade:arcade@localhost:5432/arcade' });
client.connect().then(() => {
  return client.query("SELECT code, description FROM permissions WHERE context = 'ORGANIZATION' OR code LIKE 'organization.%' ORDER BY code;");
}).then(res => {
  if (res.rows.length === 0) {
    return client.query("SELECT DISTINCT context FROM permissions;");
  }
  return res;
}).then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  client.end();
}).catch(console.error);
