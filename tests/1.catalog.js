var FnCatalog = require('../index').FnCatalog;
var assert = require("assert");
var _ = require('underscore');

var example = function(word){return word;}
describe("FnCatalog Constructor", function(){
  it("return a function", function(done){
    var catalog = new FnCatalog();
    assert.ok(catalog);
    done();
  });
});

describe("FnCatalog.addFn", function(){
  it("adds a function to the catalog object", function(done){
    var catalog = new FnCatalog();
    catalog.addFn(example, 'example', this);
    assert.ok(catalog.catalog['example']);
    done();
  });
});
describe("FnCatalog.getFn", function(){
  it("returns a function that will return same value as function that was put in", function(done){
    var catalog = new FnCatalog();
    catalog.addFn(example, 'example', this);
    var fn = catalog.getFn('example');
    var result1 = fn('word');
    var result2 = example('word');
    assert.notEqual(fn, example);
    assert.equal(result1, result2);
    done();
  });
});
