const { createFromDB } = require('./index');

async function createFromScript() {
    const [ url, dbName, coll ]= process.argv.slice(2);

    return await createFromDB(url, dbName, coll);
}

createFromScript();

