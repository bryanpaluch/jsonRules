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


module.exports = ruleHeat;

