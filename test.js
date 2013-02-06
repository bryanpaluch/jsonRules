var JsonRules = require('./libs/JsonRules.js');
var ruleEngine = new JsonRules();
var ruleHeat = {
  ifs : [
    { operands: [ '_object.temp', '_object.setTemp'],
      test: '>',
    },
    { operands: [ '_object.relay', {_value: 1}],
      test: '==',
    },
  ],
  then:
    {
      _catalog : {name: 'setSensor', 
                  attr: [{relay1: true}]}
    }
};



ruleEngine.doRule(ruleHeat, {temp: 60, setTemp: 62, relay: 1});
