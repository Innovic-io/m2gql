const convert = require('../lib/convert');
const fetch = require('./data.fetch');
const MongoDB = require('mongodb');

async function bootstrap() {

    const conn = await MongoDB.MongoClient.connect('mongodb://localhost:23248/bim');
    const database = conn.db('bim');

    let data = await fetch.getAllCollectionsData(database);

    const graphQL = convert.createGraphQL(data);
    console.log(graphQL);
    process.exit(0);
}

bootstrap();