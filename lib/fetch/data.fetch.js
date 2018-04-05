// tslint:disable-next-line
const mongo = require('mongodb');
const { SCHEMA_COLLECTION_NAME } = require("../constants");

let localDatabase;
let collectionName;

async function getCollectionNames(...collectionsToOmmit) {

    return await localDatabase
        .collections()
        .then(listOfCollections => listOfCollections
                .map((collection) => collection.s.name )
                .filter((collectionName) => !collectionsToOmmit.includes(collectionName))
            ,
        );
}

async function getAllCollectionsData(database) {

    const collections = await getCollectionNames(SCHEMA_COLLECTION_NAME);

    const output = [];

    for (const collection of collections) {

        output.push({
            [ collection ]: await database
                .collection(collection)
                .find({})
                .toArray(),
        });
    }

    return output;
}

const connectToDB = async (DatabaseUri, collection) => {
    const DatabaseName = DatabaseUri.substring(DatabaseUri.lastIndexOf('/')+1);

    collectionName = collection;

    const connection = await mongo.MongoClient.connect(DatabaseUri);
    localDatabase = connection.db(DatabaseName);
    return localDatabase;
};

const getAllObjects = async (modelName) => {
    modelName = modelName || collectionName;
    let query = {};

    const aggregation = await localDatabase.collection(collectionName)
        .find(query)
        .toArray();

    return [{ [modelName]: aggregation}];
};

module.exports = {
    connectToDB,
    getAllObjects,
    getAllCollectionsData,
    getCollectionNames
};
