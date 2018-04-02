const { MongoClient, ObjectID } = require('mongodb');

const { capitilize, toCamelCase } = require('../convert/convert');

let database;
let collectionName;

const connectToDB = async (DatabaseUri, DatabaseName, collection) => {
    collectionName = collection;
    const connection = await MongoClient.connect(DatabaseUri);
    database = connection.db(DatabaseName)
        .collection(collectionName);
};

const getAllObjects = async () => {

    let query = {};

    const aggregation = await database.find(query).skip(0).limit(1000).toArray();
    aggregation.forEach((item) => transformObject(item));

    for (const item of aggregation) {

        if ('relations' in item) {
            for (const relation of item.relations) {
                item[relation.name] = transformObject(await database
                    .findOne({ 'meta.guid.value': relation.id, 'objectType': relation.objectType}));
            }
        }
        delete item.relations;
    }

    return { [collectionName]: aggregation};
};

const updateObject = async (_id, key, value) => {

    const op = await database
        .findOneAndUpdate({ '_id': new ObjectID(_id), 'properties.definition.name': capitilize(key)}, {
            $set: {
                'properties.$.value.value': value,
            },
        });
    const item = op.value;

    transformObject(item);

    return item;
};

/**
 * Map related object to this object.
 *
 * @param item
 */
// not exporterd
const mapRelations = (item) => {

    item.relations.forEach((relation) => {
        transformObject(relation.object);
        item[toCamelCase(relation.name)] = relation.object;
    });

    delete item.relations;
};

/**
 * Wrapper function for moving meta nad properties to top level, remove meta and properties as keys.
 *
 * @param object
 * @returns {any}
 */
// nomt
const transformObject = (object) => {

    if (!object) {
        return;
    }

    // transform meta
    const meta = object.meta;
    const properties = object.properties;

    delete object.meta;
    delete object.properties;

    return stripObject(object, meta, properties);
};

/**
 * Move from meta and properties to top level
 *
 * @param object
 * @param meta
 * @param properties
 * @returns {any}
 */
// not
const stripObject = (object, meta, properties) => {

    for (const item in meta) {

        if (meta.hasOwnProperty(item)) {
            object[item] = meta[item].value;
        }
    }

    for (const property of properties) {

        if (property.hasOwnProperty('definition')) {
            if (property.definition.hasOwnProperty('name')) {

                object[property.definition.name] = property.value.value;
            }
        }
    }

    return object;
};

module.exports = {
    updateObject,
    getAllObjects,
    connectToDB
};