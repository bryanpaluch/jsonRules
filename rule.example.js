var ruleHeat = {
  ifs : [
    { operands: [ '_object.temp', '_object.setTemp'],
      test: '<',
    },
    { operands: [ '_object.relay',  1],
      test: '==',
    },
  ],
  then:
    {
      _catalog : {name: 'setTemp', 
                  args: ['_object.setTemp', 40]}
    }
};


module.exports = ruleHeat;

