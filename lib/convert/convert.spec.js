const assert = require('assert');

const {ObjectID, isValid} = require('../object.id');
const convert = require('./convert');

const objectID = new ObjectID();

(function testCapitilize() {

    const name = convert.capitilize('Jobs');
    assert.equal('Jobs', name);

})();

(function testIsValidObjectID() {
    assert.equal(isValid(objectID), true);
    assert.equal(isValid('1234123213'), false);
})();

(function testDistinct() {

    const mockData = [
        {
            'Age': 22,
            'Married': true,
            'Name': 'John',
        },
        {
            'Age': 21,
            'Married': false,
            'Name': 'Alan',
        },
    ];
    const distinct = convert.filterOutDistinctKeys(mockData);

    assert.equal(3, distinct.length);
    assert.deepEqual({dataKey: 'Age', dataType: 'Int'}, distinct[ 0 ]);

    const emptyCollection = convert.filterOutDistinctKeys([]);
    assert.equal(0, emptyCollection.length);
})();

(function testFistSmallLetter() {

    assert.equal('myName', convert.fistSmallLetter('MyName'));
    assert.equal('myname', convert.fistSmallLetter('myname'));
    assert.equal('tEST', convert.fistSmallLetter('TEST'));
    assert.equal('two Words', convert.fistSmallLetter('Two Words'));
})();

(function testToCamelCase() {

    assert.equal('MyName', convert.toCamelCase('MyName'));
    assert.equal('twoWords', convert.toCamelCase('Two Words'));
    assert.equal('threeDistinctWords', convert.toCamelCase('Three Distinct Words'));
})();

(function testCreateGraphQLType() {
    assert.equal(`type Jobs {\n\n}`, convert.createGraphQLType('Jobs', []));

    const jobs = {
        name: 'CEO',
        subArray: [ {employee: 'Marko'}, {employee: 'Janko'} ],
    };

    assert.strictEqual(convert.createGraphQLType('Jobs', convert.filterOutDistinctKeys(jobs)),
        `type Jobs {\n\tname: String\n\tsubArray: [ subArray ]\n}`);
})();

(function testMakeType() {
    assert.equal('Company', convert.makeType(objectID, 'Company'));
    assert.equal('String', convert.makeType('company', 'company'));
    assert.equal('Float', convert.makeType(123.42, 'company'));
    assert.equal('Int', convert.makeType(123, 'company'));
    assert.equal('[ Company ]', convert.makeType([ {name: 'free'} ], 'Company'));
    assert.equal('[ Date ]', convert.makeType([ new Date() ], 'company'));
})();

(function testmakeTypeName() {
    assert.equal('companies', convert.makeTypeName('companies'));
    assert.equal('objects', convert.makeTypeName('objects'));
    assert.equal('parameters', convert.makeTypeName('parameters'));
    assert.equal('complexes', convert.makeTypeName('complexes'));
    assert.equal('nONeXISTENt', convert.makeTypeName('nONeXISTENt'));
})();

(function testAddSubTypes() {
    const jobs = {name: 'CEO', subObject: {salary: 'a lot'}, date: new Date()};

    const secondJobs = {name: 'CEO', subArray: [ {employee: 'Marko'}, {employee: 'Janko'} ]};

    assert.deepEqual(convert.addSubTypes([ jobs ]), [ 'type subObject {\n\tsalary: String\n}' ]);
    assert.deepEqual(convert.addSubTypes([ secondJobs ]), [ 'type subArray {\n\temployee: String\n}' ]);
})();

(function testCreateGraphQL() {

    const result = ''.concat(
        `type subObject {\n`,
        `\tsalary: String\n`,
        `}\n\n`,
        `type objects {\n`,
        `\tdate: Date\n`,
        `\tposition: String\n`,
        `\tsubObject: subObject\n`,
        `}`);

    const nestedArrayJob = [ {
        objects: [ {
            date: new Date(),
            position: 'QA',
            subObject: {salary: 'a lot'},
        } ],
    } ];

    const nestedJob = {
        objects: [ {
            date: new Date(),
            position: 'Developer',
            subObject: {salary: 'a lot'},
        } ],
    };

    const other123 = {
        objects: [ {
            date: new Date(),
            position: 'Developer',
            element: null,
        } ],
    };

    const nullTest = {
        objects: [ {
            position: 'Developer',
            emptyString: '',
            expectedBoolean: false,
            expectedNull: null,
        } ],
    };
    const withReplacement = ''.concat(
        `type objects {\n`,
        `\tposition: String\n`,
        `\temptyString: String\n`,
        `\texpectedBoolean: Boolean\n`,
        `\texpectedNull: String\n`,
        `}`);

    const withoutReplecement = ''.concat(
        `type objects {\n`,
        `\tposition: String\n`,
        `\temptyString: String\n`,
        `\texpectedBoolean: Boolean\n`,
        `}`);

    assert.strictEqual(convert.createGraphQL(nullTest), withoutReplecement);
    assert.strictEqual(convert.createGraphQL(nullTest, 'String'), withReplacement);

    assert.strictEqual(convert.createGraphQL(nestedArrayJob), convert.createGraphQL(nestedJob));
    assert.strictEqual(convert.createGraphQL(nestedJob), result);
})();

(function testHelperFunction() {
    const result = [
        ''.concat(`type subObject {\n`,
            `\tsalary: String\n`,
            `}`),
        ''.concat(`type Object {\n`,
            `\tdate: Date\n`,
            `\tposition: String\n`,
            `\tsubObject: subObject\n`,
            `}`)
    ];

    const nestedArrayJob = [ {
        Object: [ {
            date: new Date(),
            position: 'QA',
            subObject: {salary: 'a lot'},
        } ],
    } ];

    const nestedJob = {
        Object: [ {
            date: new Date(),
            position: 'Developer',
            subObject: {salary: 'a lot'},
        } ],
    };

    const [ nestedArray ] = nestedArrayJob.map((element) => [ ...convert.helperFunction(element) ]);

    assert.deepStrictEqual(nestedArray, convert.helperFunction(nestedJob));
    assert.deepStrictEqual(convert.helperFunction(nestedJob), result);
})();

(function testSubTypeName() {
    const date = new Date();
    const collectionKey = 'key';
    const collection = [
        {
            name: 'someName',
            [ collectionKey ]: objectID,
        },
        {
            second: 'collection',
            _id: objectID
        },
    ];

    assert.equal(convert.subTypeName(date), undefined);
    assert.equal(convert.subTypeName(collection, collectionKey, objectID),
        collectionKey);
    assert.equal(convert.subTypeName(collectionKey), 'string');
})();