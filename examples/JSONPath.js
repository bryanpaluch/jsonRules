var JsonRules = require('../index').JsonRules;
var FnCatalog = require('../index').FnCatalog;

var catalog = new FnCatalog();

var setTemp = function(word){console.log('Setting Temperature ' + word);
return word};
catalog.addFn(setTemp, 'setTemp', this);


var ruleEngine = new JsonRules({catalog: catalog});



var ruleHeat = {
  ifs : [
    { operands: [ '$.temp', '$.data.setTemp'],
      test: '<',
    },
  ],
  then:
    {
      _catalog : {name: 'setTemp', 
                  args: ['$.data.setTemp']}
    }
};



ruleEngine.doRule(ruleHeat, {temp: 60, data: {setTemp: 62}, relay: 1}, function(err, then){
  if(err){
    console.log(err);
    console.log("received error while applying rule logic");
  }
  if(then){
    console.log('doing action since it was returned');
    var word = then();
    console.log(word);
  }else{
    console.log('rule did not pass, do nothing');
  }
});


