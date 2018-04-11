#!/usr/bin/env node
const { createFromDB } = require('../index');
const { saveToFile, saveToDatabase } = require('./save/save');

const params = process.argv.slice(2);

async function createFromScript() {

    try {
        const database = getElementFromArguments('-d');
        const collection = getElementFromArguments('-c');
        const model = getElementFromArguments('-m') || collection;
        const diskPlaceToSave = getElementFromArguments('-f');
        const companyName = getElementFromArguments('-s');

        if(!diskPlaceToSave && !companyName) {
            throw new Error('file path or company name must be provided.');
        }
        const graphQLTypes = await createFromDB(database, collection, model, companyName);
        saveToFile(diskPlaceToSave, graphQLTypes);
        await saveToDatabase(database, companyName, graphQLTypes);

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