const assert = require('assert');

const {ObjectID, isValid} = require('./object.id');
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
    assert.deepEqual({dataKey: 'age', dataType: 'Int'}, distinct[ 0 ]);

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

    assert.equal('myName', convert.toCamelCase('MyName'));
    assert.equal('twoWords', convert.toCamelCase('Two Words'));
    assert.equal('threeDistinctWords', convert.toCamelCase('Three Distinct Words'));
})();

(function testCreateGraphQLType() {
    assert.equal(`type Jobs {\n\n}`, convert.createGraphQLType('Jobs', []));

    const jobs = {
        name: 'CEO',
        subArray: [ {employee: 'Marko'}, {employee: 'Janko'} ],
    };
    assert.equal(`type Jobs {\n\tname: String\n\tsubArray: [ Subarray ]\n}`,
        convert.createGraphQLType('Jobs', convert.filterOutDistinctKeys(jobs)));
})();

(function testMakeType() {
    assert.equal('Company', convert.makeType(objectID, 'company'));
    assert.equal('String', convert.makeType('company', 'company'));
    assert.equal('Float', convert.makeType(123.42, 'company'));
    assert.equal('Int', convert.makeType(123, 'company'));
    assert.equal('[ Company ]', convert.makeType([ {name: 'free'} ], 'company'));
    assert.equal('[ Date ]', convert.makeType([ new Date() ], 'company'));
})();

(function testToSingular() {
    assert.equal('company', convert.toSingular('companies'));
    assert.equal('object', convert.toSingular('objects'));
    assert.equal('parameter', convert.toSingular('parameters'));
    assert.equal('complex', convert.toSingular('complexes'));
    assert.equal('object', convert.toSingular('objects'));
    assert.equal('nonexistent', convert.toSingular('nONeXISTENt'));
})();

(function testAddSubTypes() {
    const jobs = {name: 'CEO', subObject: {salary: 'a lot'}, date: new Date()};

    const secondJobs = {name: 'CEO', subArray: [ {employee: 'Marko'}, {employee: 'Janko'} ]};

    assert.deepEqual(convert.addSubTypes([ jobs ]), [ 'type Subobject {\n\tsalary: String\n}' ]);
    assert.deepEqual(convert.addSubTypes([ secondJobs ]), [ 'type Subarray {\n\temployee: String\n}' ]);
})();

(function testCreateGraphQL() {

    const result = ''.concat(
        `type Subobject {\n`,
        `\tsalary: String\n`,
        `}\n\n`,
        `type Object {\n`,
        `\tdate: Date\n`,
        `\tposition: String\n`,
        `\tsubObject: Subobject\n`,
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

    assert.strictEqual(convert.createGraphQL(nestedArrayJob), convert.createGraphQL(nestedJob));
    assert.strictEqual(convert.createGraphQL(nestedJob), result);
})();

(function testHelperFunction() {
    const result = [
        ''.concat(`type Subobject {\n`,
            `\tsalary: String\n`,
            `}`),
        ''.concat(`type Object {\n`,
            `\tdate: Date\n`,
            `\tposition: String\n`,
            `\tsubObject: Subobject\n`,
            `}`)
    ];

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