const path = require('path');
const { SCHEMA_COLLECTION_NAME } = require("../constants");
const {existsSync, mkdirSync, writeFileSync} = require('fs');

const {connectToDB} = require('../fetch/data.fetch');

function saveToFile(location, file) {
    if (!location) {
        return;
    }
    const folder = location.substring(0, location.lastIndexOf('/') + 1);

    if (!existsSync(folder)) {
        mkDirByPathSync(folder);
    }

    writeFileSync(location, file);
    process.stdout.write('File saved\n');
}

async function saveToDatabase(databaseURI, companyName, file) {
    if (!companyName) {
        return;
    }

    const graphQLSchemaPlace = 'schema';
    const insertionObject = {
        [graphQLSchemaPlace]: file,
        name: companyName
    };

    const database = await connectToDB(databaseURI);

    const alreadyExist = await database
        .collection(SCHEMA_COLLECTION_NAME)
        .findOne({name: companyName});
    if (!!alreadyExist) {

        if(file === alreadyExist[graphQLSchemaPlace]) {

            process.stdout.write('Collection unchanged\n');
            return;
        }
        const updatedSchema = await database
            .collection(SCHEMA_COLLECTION_NAME)
            .findOneAndUpdate(
                {_id: alreadyExist._id},
                insertionObject,
                {returnOriginal: false}
                );

        process.stdout.write('collection updated\n');
        process.stdout.write(''
            .concat(
                `id: ${updatedSchema.value._id.toString()}\n`,
                `name: ${updatedSchema.value.name}`
            )
        );
        return updatedSchema.value;
    }

    const insertedSchema = await database
        .collection(SCHEMA_COLLECTION_NAME)
        .insertOne(insertionObject);

    process.stdout.write('collection saved\n');
    process.stdout.write(''
        .concat(
            `id: ${insertedSchema.ops[ 0 ]._id.toString()}\n`,
            `name: ${insertedSchema.ops[ 0 ].name}`
        )
    );

    return insertedSchema.ops[ 0 ];
}

function mkDirByPathSync(targetDir, {isRelativeToScript = false} = {}) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            mkdirSync(curDir);
            process.stdout.write(`Directory ${curDir} created!`);
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }

        return curDir;
    }, initDir);
}

module.exports = {
    saveToFile,
    saveToDatabase
};