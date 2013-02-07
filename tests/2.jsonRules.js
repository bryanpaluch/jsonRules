var JsonRules = require('../libs/JsonRules');
var FnCatalog = require('../libs/FnCatalog.js');
var assert = require("assert");
var _ = require('underscore');

var exampleRule = {
  ifs : [
    { operands: [ '_object.temp', '_object.setTemp'],
      test: '<',
    },
    { operands: [ '_object.relay', {_value: 1}],
      test: '==',
    },
  ],
  then:
    {
      _catalog : {name: 'setTemp',
                  args: ['_object.setTemp']}
    }
};

var ifs = exampleRule.ifs;
var then = exampleRule.then;
var value1= {temp: 60, setTemp: 70, relay: 1};
var value2= {temp: 71, setTemp: 70, relay: 1};

describe("Json Rules Constructor", function(){
  it("return a function", function(done){
    var ruleEngine = new JsonRules();
    assert.ok(ruleEngine);
    done();
  });
});

describe("JsonRules._testIf", function(){
  it("tests an individual if statement,  returns (null,true) if true", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine._testIf(ifs[0], value1, function(err, results){
      assert.equal(err, null);
      done();
    });
  });
  it("tests an individual if statement,  returns (\"error\",null) if false", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine._testIf(ifs[0], value2, function(err, results){
      assert.equal(err, "error");
      done();
    });
  });
});
describe("JsonRules.test", function(){
  it("tests an array of if statements, and callbacks true if they pass", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine.test(ifs, value1, function(result){
      assert.equal(result, true);
      done();
    });
  });
  it("tests an array of if statements, and callbacks false if they fail", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine.test(ifs, value2, function(result){
      assert.equal(result, false);
      done();
    });
  });
});
describe("JsonRules.doRule", function(){
  it("tests a rule, and callbacks with fn if it passes", function(done){
    var exampleThen = function(word){return "example"}
    var catalog = new FnCatalog();
    catalog.addFn(exampleThen, 'setTemp', this);
    var ruleEngine = new JsonRules({catalog: catalog});
    ruleEngine.doRule(exampleRule, value1, function(err, fn){
      if(fn){
      console.log('testing');
      console.log(fn());
      assert.equal(fn(), exampleThen());
      done();
      }else
      done('error');
    });
  });
  it("tests a rule, and callback with no fn if it fails ", function(done){
    var exampleThen = function(word){return "example"}
    var catalog = new FnCatalog();
    catalog.addFn(exampleThen, 'setTemp', this);
    var ruleEngine = new JsonRules({catalog: catalog});
    ruleEngine.doRule(exampleRule, value2, function(err, fn){
      assert.equal(fn, null);
      done();
    });
  });
});



