import { Db, MongoClient, ObjectID } from 'mongodb';

String.prototype.camelCase = function () {
  return this
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return "";
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
};

const makeType = (element) => {
  switch (typeof element) {
    case 'string':
      return 'String';

    case 'number':
      return (element === (element|0)) ? ('Int') : 'Float';

    case 'object':
      return (ObjectID.isValid(element) ? ('ID') : element);

    case 'boolean':
      return 'Boolean';

    default:
      return undefined
  }
};

function tranferTypes(obj) {
  const transfered = {};

  Object.keys(obj)
    .forEach((value) => Object.assign(transfered,{[value]: makeType(obj[value]) }) );

  return transfered;
}

const tryAgregation = async(database: Db) => {
  
  return await database.collection('objects').aggregate([
    {
      $lookup:
        {
          from: 'parameters',
          localField: 'properties.definition',
          foreignField: '_id',
          as: 'parameters'
        }
    }]
  ).toArray();
};
async function getCollections(databaseUri: string, databaseName: string) {
  const connection: MongoClient = await MongoClient.connect(`${databaseUri}/${databaseName}`);
  const database = connection.db(databaseName);

  const agreg = await tryAgregation(database);
  console.log(JSON.stringify(agreg, null, 4));

  /*
  agreg
    .forEach(value => {
      delete value.otherField;
      const [ propertyElement ]= value
        .properties;
      propertyElement
        .name
        .map((arrayElement, index) => Object.assign(
          value,
          {[arrayElement.camelCase()]: propertyElement.value[index]})
        );
      delete value.properties;
    });
  */
  const [first] = agreg;
  // console.log(first);
  // console.log(tranferTypes(first));

  process.exit();
}

const getCollectionValues = async (database: Db, collectionNames: string[]) => {
  let result = {};
  for(let element of collectionNames) {
    result = { ...result, [element]: await readFromDB(database, element)}
  }

  return Promise.resolve(result);
};

const readFromDB = (database, name) => {
    return Promise.resolve(database
      .collection(name)
      .find()
      .toArray()
    )
};

const transferObject = (recievedObject) => {
  let transfered = {...recievedObject};

  Object
    .keys(recievedObject)
    .filter((value) => !+recievedObject[value])
    .filter((value) => ObjectID.isValid(recievedObject[value] ))
    .forEach((value) => transfered[value] = 'ID');

  return transfered;
};

getCollections(`mongodb://localhost:23248`, 'bim');
