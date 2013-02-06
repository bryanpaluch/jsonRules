
var ruleHeat = {
  ifs : [ 
    { attributes: [ '_object.temp', '_object.setTemp'],
      operand: '<',
    },
  ],
  then:
    {
      _catalog : {name: 'setSensor', 
                  attr: [{relay1: true}]}
    }
};
module.exports = ruleHeat;
