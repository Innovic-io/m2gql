const MongoDB = require('mongodb');

function filterOutDistinctKeys(data) {
    let items = [data];
    if(!!data && data instanceof Array) {
        items = data || [];
    }

    const distinctItems = [];

    for (const item of items) {

        for (const key of Object.keys(item)) {

            const dataKey = toCamelCase(key);
            const dataType = makeType(item[ key ], key);

            if (distinctItems.findIndex((item) => item.dataKey === dataKey) < 0) {
                distinctItems.push({dataKey, dataType});
            }
        }
    }

    return distinctItems;
}

function makeType(element, key) {

    switch (typeof element) {
        case 'string':
            return 'String';

        case 'number':
            return (element === (element | 0)) ? 'Int' : 'Float';

        case 'boolean':
            return 'Boolean';

        case 'object': {
            if(element instanceof Date) {

                return 'Date';
            }

            if (!!element.length) {
                const [ arrayElement ] = element;

                return `[ ${makeType(arrayElement, key)} ]`;
            }

            if (element instanceof MongoDB.ObjectID && key.toLocaleLowerCase() === '_id') {

                return 'ID';
            }

            return capitilize(key);
        }
        default:
            return element;
    }
}

function capitilize(name) {
    return name[ 0 ].toUpperCase() + name.slice(1).toLowerCase();
}

function fistSmallLetter(name) {
    return name[ 0 ].toLowerCase() + name.slice(1);
}

function toCamelCase(name) {
    const fragmented = name.split(' ');

    if (fragmented.length === 1) {
        return fistSmallLetter(name);
    }

    const uppercase = fragmented.map((piece) => capitilize(piece));
    uppercase[ 0 ] = uppercase[ 0 ].toLowerCase();

    return uppercase.join('');
}

function createGraphQLType(typeName, data) {
    return `\ntype ${capitilize(typeName)} {\n${data.map((item) => `\t${item.dataKey}: ${item.dataType}`).join('\n')}\n}\n`;
}

function addSubTypes(collectionData) {

    let single;

    if(collectionData instanceof Array) {
         [ single ] = collectionData;
    } else {
        single = collectionData;
    }

    return Object
        .keys(single)
        .filter((key) => typeof single[ key ] === 'object')
        .filter((key) => !MongoDB.ObjectID.isValid(single[ key ]))
        .filter((key) => !(single[key] instanceof Date))
        .map((key) => createGraphQLType(key, filterOutDistinctKeys(single[ key ])) );
}

function createGraphQL(collectionData) {

    let graphQL = '';
    if(collectionData instanceof Array) {
        collectionData
            .forEach((collection) => graphQL += helperFunction(collection));
    } else {
        graphQL = helperFunction(collectionData);
    }

    return graphQL;
}

function helperFunction(collection) {
    return Object.keys(collection)
        .map((collectionKey) => addSubTypes(collection[ collectionKey ])
            + createGraphQLType( toSingular(collectionKey), filterOutDistinctKeys(collection[ collectionKey ]) )
        )
        .join('');
}

function toSingular(collection) {
    switch (collection.toLocaleLowerCase()) {
        case 'objects':
            return 'object';

        case 'companies':
            return 'company';

        case 'parameters':
            return 'parameter';

        case 'complexes':
            return 'complex';

        default:
            return collection.toLocaleLowerCase();
    }
}

module.exports = {
    filterOutDistinctKeys,
    fistSmallLetter,
    toCamelCase,
    createGraphQLType,
    capitilize,

    createGraphQL,
    makeType,
    toSingular,
    addSubTypes
};