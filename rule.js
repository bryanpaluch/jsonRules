
var ruleHeat = {
  if : [ 
    { attributes: [ _object.temp, _object.setTemp],
      operand: '>',
    },
  ],
  then:
    {
      Catalog['tempSensor'].set({relay1: on});
    }
};

  
