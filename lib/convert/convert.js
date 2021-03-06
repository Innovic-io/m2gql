const {isValid, ObjectID} = require('../object.id');

let entireCollectionData;
let nullType;
let replacement = 'replaceThis';

function addSubTypes(collectionData) {

    if(!collectionData) {
        return;
    }

    const collectionArray = (collectionData instanceof Array) ?
        collectionData : [ collectionData ];

    if (collectionArray.length === 0) {
        return;
    }

    return [].concat(...collectionArray
        .map((single) => Object
            .keys(single)
            .filter((key) => typeof single[ key ] === 'object')
            .filter((key) => !isValid(single[ key ]))
            .filter((key) => !!single[ key ])
            .filter((key) => !!subTypeName(single[ key ], key))
            .filter((key) => !(single[ key ] instanceof Date))
            .map((key) => createGraphQLType(
                makeTypeName(key),
                filterOutDistinctKeys(single[ key ]))
            ),
        )
        .filter((listOfResults) => listOfResults.length > 0),
    );
}

function capitilize(name) {
    return name[ 0 ].toUpperCase() + name.slice(1).toLowerCase();
}

function createGraphQLType(typeName, data) {

    const toPrint = data
        .filter((item) => !!item.dataType)
        .map((item) => `\t${item.dataKey}: ${item.dataType}`)
        .join('\n');

    return `type ${typeName} {\n${toPrint}\n}`;
}

function createGraphQL(collectionData, nullReplacement) {

    const graphQL = [];
    entireCollectionData = collectionData;

    nullType = nullReplacement;

    if (collectionData instanceof Array) {

        collectionData.forEach((collection) => graphQL.push(...helperFunction(collection)));

    } else {

        graphQL.push(...helperFunction(collectionData));

    }

    const types = [];

    graphQL
        .filter((element) => !!element)
        .map((element) => {
            const typeName = element.substring(0, element.indexOf(' {'));
            if(types.indexOf(typeName) < 0) {
                types.push(typeName)
            }
        });

    return types.map((distinctType) => graphQL
        .filter((element) => element.indexOf(distinctType) === 0)
        .sort(function (a, b) { return b.length - a.length; })[0]
    ).join('\n\n');
}

function filterOutDistinctKeys(data) {
    let items = [ data ];
    if (!!data && data instanceof Array) {
        items = data || [];
    }

    const distinctItems = [];
    const input = [];

    items
        .forEach((element) => Object.keys(element)
            .filter((objectKey) => {
                if(!element[ objectKey ]) {
                    if (typeof element[objectKey] !== 'object') {
                        return true;
                    }

                    if(!!nullType) {
                        element[objectKey] = replacement;
                    }
                }
                return !!element[objectKey];
            }) // posible
            .filter((objectKey) => objectKey !== 'relations')
            .forEach((objectKey) => input.push({[ objectKey ]: element[ objectKey ]}))
        );

    const item = Object.assign({}, ...input);
    for (const key of Object.keys(item)) {
        const dataKey = toCamelCase(key);
        const dataType = (item[ key ] === replacement) ? nullType : makeType(item[ key ], key);

        if (distinctItems.findIndex((singleItem) => singleItem.dataKey === dataKey) < 0) {
            distinctItems.push({dataKey, dataType});
        }
    }

    return distinctItems;
}

function fistSmallLetter(name) {
    return name[ 0 ].toLowerCase() + name.slice(1);
}

function helperFunction(collection) {

    return [].concat(...Object.keys(collection)
        .filter((collectionKey) => {
            if(collection[collectionKey] instanceof Array) {
                return collection[collectionKey].length > 0
            }

            return !!collection[collectionKey]
        })
        .map((collectionKey) => [].concat(
            addSubTypes(collection[ collectionKey ]),
            createGraphQLType(
                makeTypeName(collectionKey),
                filterOutDistinctKeys(collection[ collectionKey ]),
            ),
            )
        ),
    );
}

const oceanUniqueElements = ['Building', 'Property', 'Management'];

function makeType(element, key) {

    if(oceanUniqueElements.includes(key)) {
        return key;
    }

    switch (typeof element) {
        case 'string':
            return 'String';

        case 'number':
            // tslint:disable-next-line
            return (element === (element | 0)) ? 'Int' : 'Float';

        case 'boolean':
            return 'Boolean';

        case 'object': {

            if (element instanceof Date) {

                return 'Date';
            }

            if (element instanceof Array) {
                const [ arrayElement ] = element;
                if (!arrayElement) {
                    return;
                }

                return `[ ${makeType(arrayElement, key)} ]`;
            }

            if (!entireCollectionData) {

                return makeTypeName(key);
            }

            if (isValid(element)) {

                element = new ObjectID(element);
                if (key.toLocaleLowerCase() === '_id' || key.toLocaleLowerCase() === 'id') {

                    return 'ID';
                }


                const isExistingSubType = entireCollectionData
                    .map((collectionNames) => Object
                        .keys(collectionNames)
                        .map((collectionKey) => subTypeName(collectionNames[ collectionKey ], collectionKey, element))
                        .join(''),
                    )
                    .filter((foundCollections) => !!foundCollections && foundCollections.length > 0);


                if (isExistingSubType.length > 1) {
                    throw new Error('More that one collection found');
                }

                if (isExistingSubType.length === 1) {
                    return makeTypeName(isExistingSubType.join(''));
                }
            }

            let collectionArray = [ entireCollectionData ];

            if (entireCollectionData instanceof Array) {
                collectionArray = entireCollectionData;
            }

            const type = collectionArray
                .map((singleElement) => {
                    const [ elementKey ] = Object.keys(singleElement);

                    if (singleElement[ elementKey ] instanceof Array) {

                        return (!!singleElement[ elementKey ]
                            .find((objectElement) => {
                                if (isValid(element)) {
                                    return objectElement._id.equals(element);
                                }

                                if(!objectElement._id) {
                                    return;
                                }

                                return objectElement._id.equals(element._id);
                            })) ? elementKey : undefined;
                    }
                })
                .filter((objectKeys) => !!objectKeys);

            const [ references ] = type;

            if (!!references) {
                return references;
            }

            return key;
        }
        default:
            return element;
    }
}

function toCamelCase(name) {
    const fragmented = name.split(' ');

    if (fragmented.length === 1) {
        return name;
    }

    const uppercase = fragmented.map((piece) => capitilize(piece));
    uppercase[ 0 ] = uppercase[ 0 ].toLowerCase();

    return uppercase.join('');
}

function makeTypeName(entryCollection) {

    return entryCollection;
}

function subTypeName(entireCollection, collectionKey, element = '') {

    if (entireCollection instanceof Date) {
        return;
    }

    if (entireCollection instanceof Array) {

        const foundCollection = entireCollection.find((singleElement) => {

            if (isValid(singleElement)) {
                return singleElement.equals(element);
            }

            if (!singleElement._id) {
                return true
            }
            return singleElement._id.equals(element);
        });

        return (!!foundCollection) ? collectionKey : undefined;
    }

    if (!entireCollection) {
        return;
    }

    if (entireCollection instanceof Object) {

        if (!entireCollection._id) {

            return typeof entireCollection[ collectionKey ];
        }

    }

    return typeof entireCollection;
}


module.exports = {
    addSubTypes,
    capitilize,
    createGraphQL,
    createGraphQLType,
    filterOutDistinctKeys,
    fistSmallLetter,
    helperFunction,
    makeType,
    subTypeName,
    toCamelCase,
    makeTypeName,
};
