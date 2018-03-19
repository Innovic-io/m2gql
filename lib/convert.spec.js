const convert = require('./convert');
const assert = require('assert');
const mongo = require('mongodb');

(function testCapitilize() {

    const name = convert.capitilize('Jobs');
    assert.equal('Jobs', name);

})();

(function testDistinct() {

    const mockData = [{
        'Name': 'John',
        'Age': 22,
        'Married': true
    }, {
        'Name': 'Alan',
        'Age': 21,
        'Married': false
    }];

    const distinct = convert.filterOutDistinctKeys(mockData);

    assert.equal(3, distinct.length);
    assert.deepEqual({ dataKey: 'name', dataType: 'String'}, distinct[0]);

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
    assert.equal(`\ntype Jobs {\n\n}\n`, convert.createGraphQLType('Jobs', []));

    const jobs = {
        name: 'CEO',
        subArray: [ {employee: 'Marko'}, {employee: 'Janko'} ]
    };
    assert.equal(`\ntype Jobs {\n\tname: String\n\tsubArray: [ Subarray ]\n}\n`,
        convert.createGraphQLType('Jobs', convert.filterOutDistinctKeys(jobs)));
})();

(function testMakeType() {
    assert.equal('Company', convert.makeType(new mongo.ObjectID(), 'company'));
    assert.equal('String', convert.makeType('company', 'company'));
    assert.equal('Float', convert.makeType(123.42, 'company'));
    assert.equal('Int', convert.makeType(123, 'company'));
    assert.equal('[ Company ]', convert.makeType([ { name: "free" } ], 'company'));
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
    const jobs = { name: 'CEO', subObject: { salary: 'a lot'}, date: new Date()};

    const secondJobs = { name: 'CEO', subArray: [{ employee: 'Marko'}, {employee: 'Janko'} ] };

    assert.deepEqual(convert.addSubTypes([jobs]), [ '\ntype Subobject {\n\tsalary: String\n}\n' ]);
    assert.deepEqual(convert.addSubTypes([secondJobs]), [ '\ntype Subarray {\n\temployee: String\n}\n' ]);
})();

(function testCreateGraphQL() {

    const result = '\n'.concat(
            `type Subobject {\n`,
            `\tsalary: String\n`,
            `}\n\n`,
            `type Object {\n`,
            `\tposition: String\n`,
            `\tdate: Date\n`,
            `\tsubObject: Subobject\n`,
            `}\n` );

        const jobs = [ {
            subObject: { salary: 'a lot'},
            objects: [ {
                position: 'CEO',
                date: new Date(),
                subObject: new mongo.ObjectID()
            } ],
        }];

        const nestedArrayJob = [{
            objects: [ {
                position: 'CEO',
                date: new Date(),
                subObject: { salary: 'a lot'}
            } ],
        }];

        const nestedJob = {
            objects: [ {
                position: 'CEO',
                date: new Date(),
                subObject: { salary: 'a lot'}
            } ],
        };

        assert.deepEqual(convert.createGraphQL(jobs), convert.createGraphQL(nestedJob));
        assert.deepEqual(convert.createGraphQL(nestedArrayJob), convert.createGraphQL(nestedJob));
        assert.deepEqual(convert.createGraphQL(jobs), result);
    }
)();
