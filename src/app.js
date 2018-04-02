const convert = require('../lib/convert');
const { default: OceanService } = require('./ocean.service');
async function bootstrap() {
    const databaseURI = 'mongodb://localhost:25555/PinterestDB';
    const databaseName = 'PinterestDB';

    const result = new OceanService();
    await result.connectToDB(databaseURI, databaseName);
    let data = await result.getAllObjects();

    const graphQL = convert.createGraphQL(data);
    console.log(graphQL);
    process.exit(0);
}

bootstrap();