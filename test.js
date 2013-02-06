var JsonRules = require('./libs/JsonRules.js');

var FnCatalog = require('./libs/FnCatalog.js');
var catalog = new FnCatalog();

var setTemp = function(word){console.log('Setting Temperature ' + word);}
catalog.addFn(setTemp, 'setTemp', this);


var ruleEngine = new JsonRules({catalog: catalog});



var ruleHeat = {
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



ruleEngine.doRule(ruleHeat, {temp: 60, setTemp: 62, relay: 1}, function(err, then){
  if(err){
    console.log("received error while applying rule logic");
  }
  if(then){
    console.log('doing action since it was returned');
    then();
  }else{
    console.log('rule did not pass, do nothing');
  }
});


ruleEngine.doRule(ruleHeat, {temp: 63, setTemp: 62, relay: 1});
