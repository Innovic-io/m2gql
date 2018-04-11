#!/usr/bin/env node
const { createFromDB } = require('../index');
const { saveToFile, saveToDatabase } = require('./save/save');

const params = process.argv.slice(2);

async function createFromScript() {

    try {
        const databaseURI = getElementFromArguments('-d');
        const collectionName = getElementFromArguments('-c');
        const modelName = getElementFromArguments('-m') || collectionName;
        const diskPlaceToSave = getElementFromArguments('-f');
        const companyName = getElementFromArguments('-s');

        if(!diskPlaceToSave && !companyName) {
            throw new Error('file path or company name must be provided.');
        }
        const graphQLTypes = await createFromDB({ databaseURI, collectionName, modelName, companyName });
        saveToFile(diskPlaceToSave, graphQLTypes);
        await saveToDatabase(databaseURI, companyName, graphQLTypes);

        process.exit(0);
    } catch (e) {

        process.stdout.write(`${e.message}\n`);
        process.exit(1);
    }
}

function getElementFromArguments(element) {
    const index = params.indexOf(element) + 1;
    return (index > 0) ? params[ index ] : undefined;
}

createFromScript();