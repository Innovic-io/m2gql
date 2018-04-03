# MongoDB to Graphql

## mn2gql script
example request:

```
mn2ql -d DB_PATH -m NAME -c COLLECTION -f file.graphql -s COMPANY
```

Fields:
##### -d DB_PATH
- Path to Database in which to search for elements.
- This field is **mandatory**

##### -c COLLECTION
- If wanted Graphql Type of just one collection

##### -m NAME
- If fetched one collection, provide name of Type
- Default value is collection name

##### -f file.graphql
- File location on which to save GraphQL Types

##### - s COMPANY
- Company name to write in schemas collection of Database

**File path or company name must be provided**

## createFromDB
full sintax

```
createFromDB(databaseURI, collectionName, modelName, companyName)
```

Example:
```
createFromDB('mongodb://localhost:25555/PinterestDB', 'users')
```
Elements:
##### databaseURI
- Path to Database in which to search for elements.
- This field is **mandatory**

##### collectionName
- If wanted Graphql Type of just one collection

##### modelName
- If fetched one collection, provide name of Type
- Default value is collection name

#### companyName
- Company name to write in schemas collection of Database

## createGraphQL
WRITE SOMETHING

## getAllCollectionsData
WRITE SOMETHING