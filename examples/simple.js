var JsonRules = require('../index').JsonRules;
var FnCatalog = require('../index').FnCatalog;

var catalog = new FnCatalog();

var setTemp = function(word, user, cb){console.log('Setting Temperature ' + word + " for user " , user);
return word};
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
    console.log(err);
    console.log("received error while applying rule logic");
  }
  if(then){
    console.log('doing action since it was returned');
    var word = then('bryan');
    console.log(word);
  }else{
    console.log('rule did not pass, do nothing');
  }
});


ruleEngine.doRule(ruleHeat, {temp: 63, setTemp: 62, relay: 1});
