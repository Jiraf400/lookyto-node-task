const {createClient} = require('redis');

const client = createClient();

client.on('error', err => console.error('Redis Client Error', err));

module.exports = client;