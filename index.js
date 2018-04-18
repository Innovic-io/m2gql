const convert = require('./lib/convert/convert');
const { SCHEMA_COLLECTION_NAME } = require("./lib/constants");

const { connectToDB, getCollectionNames, getAllCollectionsData, getAllObjects } = require('./lib/fetch/data.fetch');

async function createFromDB({databaseURI, collectionName, modelName, companyName}) {

    if(!databaseURI) {
        throw new Error('Database URI must be provided.');
    }

    let data = '';

    const database = await connectToDB(databaseURI, collectionName);
    const collections = await getCollectionNames();

    if(collections.includes(SCHEMA_COLLECTION_NAME)) {

        const specificSchema = await database
            .collection(SCHEMA_COLLECTION_NAME)
            .find({name: companyName})
            .toArray();

        if (specificSchema.length > 0) {
            return specificSchema[ 0 ].schema;
        }
    }

    if(!!collectionName) {
        data = await getAllObjects(modelName);
    } else {
        data = await getAllCollectionsData(database);
    }

    return convert.createGraphQL(data);
}

module.exports = {
    createFromDB,
    createGraphQL: convert.createGraphQL
};