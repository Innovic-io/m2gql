const convert = require('./lib/convert/convert');
const { getAllObjects, connectToDB } = require('./lib/fetch/ocean.service');

async function createGraph() {

    const databaseURI = 'mongodb://localhost:25555/PinterestDB';
    const databaseName = 'PinterestDB';
    const collectionName = 'ocean';

    await connectToDB(databaseURI, databaseName, collectionName);
    let data = await getAllObjects();

    const graphQL = convert.createGraphQL(data);
    console.log(graphQL);
    process.exit(0);
}

module.exports = createGraph;