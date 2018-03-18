const convert = require('./convert');
const assert = require('assert');

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
    assert.equal('type Jobs {  }', convert.createGraphQLType('Jobs', []));
})();