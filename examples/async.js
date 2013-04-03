var JsonRules = require('../index').JsonRules;
var FnCatalog = require('../index').FnCatalog;

var catalog = new FnCatalog();

var switchRelay = function(word){console.log('Switching on Relay because the temp is ' + word[0]);
return word[0]};
catalog.addFn(switchRelay, 'switchRelay', this);

var getOtherSensorByUserId = function(argArray,cb){
  var userid = argArray[0];
  var timeout = argArray[1];

  console.log("Get other relay value running for user:", userid, "with timeout: ", timeout);
  setTimeout(function(){
    if(userid === '1234')
       cb(null, 1);
    else
      cb(null, false);
  }, timeout);
};

catalog.addFn(getOtherSensorByUserId, 'getOtherSensorByUserId', this);
var ruleEngine = new JsonRules({catalog: catalog});



var ruleHeat = {
  ifs : [
    { operands: [ '_object.temp', '_object.setTemp'],
      test: '<',
    },
    { operands: [ '_object.relay', {_catalog: {name: 'getOtherSensorByUserId',
                                               args: ['_object.userId', {_value :2000}]}},
                ],
      test: '=='
    },
  ],
  then:
    {
      _catalog : {name: 'switchRelay', 
                  args: ['_object.temp']}
    }
};


for(var temp = 60; temp< 64; temp++){
  ruleEngine.doRule(ruleHeat, {temp: temp, setTemp: 62, relay: 1, userId: '1234'}, function(err, then){
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
}
