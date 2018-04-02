// tslint:disable-next-line
const mongo = require('mongodb');

const { capitilize, toCamelCase } = require('../convert/convert');

mongo.Collection.prototype.getData = async function () {
    switch (this.s.name) {
        case 'objects':
            return this.aggregate([
                // Stage 1
                {
                    $unwind: '$properties',
                },

                // Stage 2
                {
                    $lookup: {
                        from: 'parameters',
                        localField: 'properties.definition',
                        foreignField: '_id',
                        as: 'parameters',
                    },
                },

                // Stage 3
                {
                    $unwind: '$parameters',
                },

                // Stage 4
                {
                    $project: {
                        _id: 1,
                        model: 1,
                        company: 1,
                        type: 1,
                        complex: 1,
                        entity: 1,
                        parameter: {
                            name: '$parameters.name',
                            value: '$properties.value.current',
                        },
                    },
                },

                // Stage 5
                {
                    $group: {
                        _id: '$_id',
                        rootComapny: {$first: '$company'},
                        rootComplex: {$first: '$complex'},
                        rootEntity: {$first: '$entity'},
                        rootModel: {$first: '$model'},
                        rootType: {$first: '$type'},
                        parameters: {$push: '$parameter'},
                    },
                },

                // Stage 6
                {
                    $project: {
                        _id: 1,
                        rootComapny: 1,
                        rootComplex: 1,
                        rootEntity: 1,
                        rootModel: 1,
                        rootType: 1,
                        replacingRoot: {
                            $arrayToObject: {
                                $map: {
                                    input: '$parameters',
                                    as: 'pair',
                                    in: [ '$$pair.name', '$$pair.value' ],
                                },
                            },
                        },
                    },
                },

                // Stage 7
                {
                    $addFields: {
                        'replacingRoot.company': '$rootComapny',
                        'replacingRoot.complex': '$rootComplex',
                        'replacingRoot.type': '$rootType',
                        'replacingRoot.model': '$rootModel',
                        'replacingRoot.entity': '$rootEntity',
                        'replacingRoot._id': '$_id',
                    },
                },

                // Stage 8
                {
                    $replaceRoot: {
                        newRoot: '$replacingRoot',
                    },
                },
            ])
                .toArray();

        default:
            return this.find({}).toArray();
    }
};


let localDatabase;
let collectionName;

async function getCollectionNames() {
    return await localDatabase
        .collections()
        .then(listOfCollections => listOfCollections
            .map((collection) => collection.s.name ),
        );
}

async function getAllCollectionsData(database) {
    const databaseToManipulate = database || localDatabase;

    const collections = await getCollectionNames(databaseToManipulate);
    const output = [];

    for (const collection of collections) {

        output.push({
            [ collection ]: await databaseToManipulate.collection(collection)
                .getData(),
        });
    }

    return output;
}

const connectToDB = async (DatabaseUri, DatabaseName, collection) => {
    collectionName = collection;

    const connection = await mongo.MongoClient.connect(DatabaseUri);
    localDatabase = connection.db(DatabaseName);
};

const getAllObjects = async () => {

    let query = {};

    const aggregation = await localDatabase.collection(collectionName).find(query).skip(0).limit(1000).toArray();
    if(collectionName === 'ocean') {
        aggregation.forEach((item) => transformObject(item));

        for (const item of aggregation) {

            if ('relations' in item) {
                for (const relation of item.relations) {
                    item[ relation.name ] = transformObject(await localDatabase.collection(collectionName)
                        .findOne({'meta.guid.value': relation.id, 'objectType': relation.objectType}));
                }
            }
            delete item.relations;
        }
    }
    return [{ [collectionName]: aggregation}];
};

const updateObject = async (_id, key, value) => {

    const op = await localDatabase.collection(collectionName)
        .findOneAndUpdate({ '_id': new mongo.ObjectID(_id), 'properties.definition.name': capitilize(key)}, {
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
    connectToDB,
    getAllObjects,
    getAllCollectionsData,
    updateObject
};
