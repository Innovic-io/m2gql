function filterOutDistinctKeys(data) {

    const items = data || [];
    const distinctItems = [];

    for (const item of items) {

        for (const key of Object.keys(item)) {

            const dataKey = toCamelCase(key);
            const dataType = capitilize(typeof item[key]);

            if (distinctItems.findIndex((item) => item.dataKey === dataKey) < 0) {
                distinctItems.push({ dataKey, dataType });
            }
        }
    }

    return distinctItems;
}

function capitilize(name) {
    return name[0].toUpperCase() + name.slice(1).toLowerCase();
}

function fistSmallLetter(name) {
    return name[0].toLowerCase() + name.slice(1);
}

function toCamelCase(name) {
    const fragmented = name.split(' ');

    if (fragmented.length === 1) {
        return fistSmallLetter(name);
    }

    const uppercase = fragmented.map((piece) => capitilize(piece));
    uppercase[0] = uppercase[0].toLowerCase();

    return uppercase.join('');
}

function createGraphQLType(typeName, data) {

    return `type ${capitilize(typeName)} { ${data.map((item) => `${item.dataKey}: ${item.dataType}`).join('\n')} }`;
}

module.exports = {
    filterOutDistinctKeys,
    fistSmallLetter,
    toCamelCase,
    createGraphQLType,
    capitilize
};