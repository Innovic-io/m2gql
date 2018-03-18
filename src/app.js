const convert = require('./convert/convert');

const MongoDB = require('mongodb');

async function bootstrap() {

    const conn = await MongoDB.MongoClient.connect('mongodb://localhost:27030/bim');
    const data = await conn.db().collection('jobs').find().toArray();

    const graphQL = convert.createGraphQLType('jobs', convert.filterOutDistinctKeys(data));
    console.log(graphQL);
    process.exit(0);
}

bootstrap();