# MongoDB to GraphQL

<img height="100" src="https://www.ikoula.com/sites/default/files/images/mongodb_ico.png" /> -> <img src="https://blog.savoirfairelinux.com/fr-ca/wp-content/uploads/2017/10/VQLBJ0TR_200x200.png" height="100" />


Generate GraphQL schema from data in MongoDB collection.


## Installation
```

npm install m2gql --save-dev
```

## How to use it from CLI

```
m2gql -d DB_PATH -m NAME -c COLLECTION -f ./location/file.graphql -s COMPANY
```

#### Fields:
###### -d DB_PATH
- Path to Database
- This field is *mandatory*

###### -c COLLECTION
- Specify single collection ( otherwise it will generate types from all collections in db )

###### -m NAME
- If fetched one collection, provide name of Type
- Default value is collection name

###### -f ./location/file.graphql
- File location on which to save GraphQL Types

###### - s COMPANY
- Name to write in schemas collection of Database

*File path or company name must be provided*

## How to use it from script
Function which create GraphQL types out of data provided

#### Full sintax
```
createGraphQL(collections)
```
Function return formatted string of GraphQL Types

#### Example request:
```
createGraphQL(
    {
        user: [
            {
                first_name: "John",
                last_name: "Doe"
            },
            {
                first_name: "Mike",
                last_name: "Smith"
            }
        ]
    }
)
```

#### Data must be provided in one of following ways:
- Array of collections
```
[
  {
    collectionName: [CollectionData]
  },
  {
    collectionName2: [CollectionData2]
  },
]
```
- Single collection
```
  {
    collectionName: [CollectionData]
  }
```

### createFromDB
Creating GraphQL Types from Database provided
#### Full syntax
```
createFromDB(databaseURI, collectionName, modelName, companyName)
```

#### Example request:
```
createFromDB('mongodb://localhost:25555/PinterestDB', 'users')
```
#### Elements:
###### databaseURI
- Path to Database in which to search for elements.
- This field is **mandatory**

###### collectionName
- If wanted Graphql Type of just one collection

###### modelName
- If fetched one collection, provide name of Type
- Default value is collection name

###### companyName
- Company name to write in schemas collection of Database
