var JsonRules = require('../index').JsonRules;
var FnCatalog = require('../index').FnCatalog;
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

var catalogOperandRule = {
  ifs : [
    { operands: [ '_object.temp', '_object.setTemp'],
      test: '<',
    },
    { operands: [ '_object.relay', {_catalog: {name: 'getOtherSensorByUserId',
                                               args: [{_value: '1234'}, {_value :1000}]}},
                ],
      test: '=='
    },
  ],
  then:
    {
      _catalog : {name: 'setTemp',
                  args: ['_object.temp']}
    }
};

var shortCircuitRule = {
  ifs : [
    { operands: [ '_object.relay', {_catalog: {name: 'getOtherSensorByUserId',
                                               args: [{_value: '1234'}, {_value :5000}]}},
                ],
      test: '=='
    },
    { operands: [ '_object.relay', {_catalog: {name: 'getOtherSensorByUserId',
                                               args: [{_value: '1233'}, {_value :1000}]}},
                ],
      test: '=='
    },
  ],
  then:
    {
      _catalog : {name: 'setTemp',
                  args: ['_object.temp']}
    }
};
var badFormatIfs =
    { operands: [ '_ovject.relay', '_object.relay'
                ],
      test: '=='
    };

var getOtherSensorByUserId = function(userid, timeout,cb){
  setTimeout(function(){
    if(userid === '1234')
       cb(null, 1);
    else
      cb(null, false);
  }, timeout);
};


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
  it("tests an individual if statement,  returns (\"short-circuit\",false) if false with no errors", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine._testIf(ifs[0], value2, function(err, results){
      assert.equal(err, "short-circuit");
      assert.equal(results, false);
      done();
    });
  });
  it("tests an individual if statement,  returns (new Error,false) if there are errors", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine._testIf(badFormatIfs, value2, function(err, results){
      assert.equal(typeof err, typeof (new Error("Some error")));
      assert.equal(results, false);
      done();
    });
  });
});
describe("JsonRules.test", function(){
  it("tests an array of if statements, and callbacks(null, true) if they pass", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine.test(ifs, value1, function(err, result){
      assert.equal(result, true);
      done();
    });
  });
  it("tests an array of if statements, and callbacks (null, false) if they fail with no errors", function(done){
    var ruleEngine = new JsonRules();
    ruleEngine.test(ifs, value2, function(err, result){
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
  it("tests a rule with an catalog attribute and returns fn because it passes ", function(done){
    this.timeout(1200); 
    var exampleThen = function(word){return "example"}
    var catalog = new FnCatalog();
    catalog.addFn(exampleThen, 'setTemp', this);
    catalog.addFn(getOtherSensorByUserId, 'getOtherSensorByUserId', this);
    var ruleEngine = new JsonRules({catalog: catalog});
    ruleEngine.doRule(catalogOperandRule, value1, function(err, fn){
      if(fn){
        assert.equal(fn(), exampleThen());
        done();
      }else{
        throw(new Error("Should have received Then but didn't"));
      }
    });
  });
  it("tests a rule with an catalog attribute and returns a null fn after the first false if statement fails", function(done){
    this.timeout(2000); 
    var exampleThen = function(word){return "example"}
    var catalog = new FnCatalog();
    catalog.addFn(exampleThen, 'setTemp', this);
    catalog.addFn(getOtherSensorByUserId, 'getOtherSensorByUserId', this);
    var ruleEngine = new JsonRules({catalog: catalog});
    ruleEngine.doRule(shortCircuitRule, value1, function(err, fn){
      if(fn){
        throw(new Error("Shouldn't have returned a function")); 
      }else{
        done();
      }
    });
  });
});



