const convert = require('./lib/convert/convert');

const { getAllCollectionsData, connectToDB, getAllObjects } = require('./lib/fetch/data.fetch');

async function createFromDB(databaseURI, databaseName, collectionName = '') {
    let data = '';
    await connectToDB(databaseURI, databaseName, collectionName);

    if(!!collectionName) {
        data = await getAllObjects();
    } else {
        data = await getAllCollectionsData();
    }

    return convert.createGraphQL(data);
}

module.exports = {
    createFromDB,
    createGraphQL: convert.createGraphQL,
    getAllCollectionsData: getAllCollectionsData
};