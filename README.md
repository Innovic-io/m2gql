# MongoDB to GraphQL

Generate GraphQL schema from data in MongoDB collection.


## Installation
```

npm install m2gql --save-dev
```

## CLI

```
m2gql -d DB_PATH -m NAME -c COLLECTION -f ./location/file.graphql -s COMPANY
```

#### Fields:
###### -d DB_PATH
- Path to Database in which to search for elements.
- This field is **mandatory**

###### -c COLLECTION
- If wanted Graphql Type of just one collection

###### -m NAME
- If fetched one collection, provide name of Type
- Default value is collection name

###### -f ./location/file.graphql
- File location on which to save GraphQL Types

###### - s COMPANY
- Company name to write in schemas collection of Database

**File path or company name must be provided**

## createFromDB
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

## createGraphQL
Function which create GraphQL types out of collection provided

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