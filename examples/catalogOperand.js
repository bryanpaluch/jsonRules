var JsonRules = require('../index').JsonRules;
var FnCatalog = require('../index').FnCatalog;

var catalog = new FnCatalog();

var setTemp = function(word){console.log('Setting Temperature ' + word);
return word};
catalog.addFn(setTemp, 'setTemp', this);
//functions MUST return (error, value) format;
var getOtherSensorByUserId = function(userid, cb){
  console.log('ran other function'); 
  if(userid == '1234')
    cb(null, 1);
  else
    cb('error', null);
};

catalog.addFn(getOtherSensorByUserId, 'getOtherSensorByUserId', this);
var ruleEngine = new JsonRules({catalog: catalog});



var ruleHeat = {
  ifs : [
    { operands: [ '_object.temp', '_object.setTemp'],
      test: '<',
    },
    { operands: [ '_object.relay', {_catalog: {name: 'getOtherSensorByUserId',
                                               args: ['_object.userId']}},
                ],
      test: '==',
    },
  ],
  then:
    {
      _catalog : {name: 'setTemp', 
                  args: ['_object.setTemp']}
    }
};



ruleEngine.doRule(ruleHeat, {temp: 60, setTemp: 62, relay: 1, userId: '1234'}, function(err, then){
  console.log('returned'); 
  if(err){
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

