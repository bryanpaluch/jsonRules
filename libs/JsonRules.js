var _     = require('underscore');
var async = require('async');


function JsonRules( options){
  this.opts = options;
  this.catalog = {};

}
//Tests the if section of a rule returns a true callback
//if rule passes
//false if rule doesn't

JsonRules.prototype.doRule= function(rule, value){
  console.log('testing rule', rule);
  this.test(rule.ifs, value, function(result){
    if(result){
      console.log('rule passed');
    }else{
      console.log('rule failed');
    }
  });
}

JsonRules.prototype.test = function(ifs, value, cb){
  var self = this; 
  var ifarray = (typeof ifs  == 'array') ?  ifs : [ifs];
  var testFns = _.map(ifarray, function(i){
      console.log('array', i); 
      return self._testIf(cb, i, value)});
  console.log(testFns); 
  async.parallel(testFns, function(err, results){
    if(err){return false;}
    else return true;
  });
}

JsonRules.prototype._testIf =  function(cb, ifstatement, value){
  console.log("testing if"); 
  console.log(cb);
  console.log(ifstatement);
  console.log(value);
  var attr1 = parse(ifstatement.attributes[0]);
  var attr2 = parse(ifstatement.attributes[1]);
  //test each attr if they are _object or Catalog functions
  if(attr1._object)
    var func1 = function(cb){cb(null, value[attr1._object])};
  if(attr2._object)
    var func2 = function(cb){cb(null, value[attr2._object])};

  async.parallel([func1, func2], function(err, results){
    console.log(results); 
    switch(ifstatement.operand){
      case '<':
        return results[0] < results[1];
        break;
      case '==':
        return results[0] == results[1];
        break;
      case '>':
        return results[0] > results[1];
        break;
      case '!=':
        return results[0] != results[1];
        break;
      default:
        return false;
    }
  });
}
//returns an object from a period separated object ie
// "_object.foo"
// {_object: foo}
function parse(attribute){
  if(typeof attribute == "string"){
    var ar = attribute.split(attribute, '.');
    var obj = {};
    obj[ar[i]] = ar[i+1];
    return obj;
  }else if(typeof attribute == "object"){
    return attribute;
  }
}

module.exports =   JsonRules;
