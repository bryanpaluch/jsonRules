var _     = require('underscore');
var async = require('async');


function JsonRules( options){
  var options = options ? options : {};
  this.catalog = (options.catalog) ? options.catalog : {};
}
//Tests the if section of a rule returns a true callback
//if rule passes
//false if rule doesn't

JsonRules.prototype.doRule= function(rule, value, cb){
var self= this; 
  this.test(rule.ifs, value, function(result){
    if(result){
      var fn = self.getThen(rule, value);
      if(cb){
        cb(null, fn);
      }else{
        fn();
      }
    }else{
      if(cb){
        cb(null, null);
      }
    }
  });
}
JsonRules.prototype.test = function(ifs, value, cb){
  var self = this; 
  var ifarray = (_.isArray(ifs)) ?  ifs : [ifs];
  var testFns = _.map(ifarray, function(i){
    return function(innerCb){
      self._testIf( i, value, innerCb);
    }
  });
  async.parallel(testFns, function(err, results){
    if(err)
      cb(false);
    else 
      cb(true);
  });
}

JsonRules.prototype._testIf =  function(ifstatement, value, cb){
  var operands = _.map(ifstatement.operands, parse);
  //test each attr if they are _object, _value or Catalog functions
  //return the async capatible function for returning that value
  var fns = _.map(operands, function(operand){
    if(operand._object)
      return function(cb){cb(null, value[operand._object])};
    else if(operand._value)
      return function(cb){cb(null, operand._value)};
  });
  //get values and then test
  //cb is (null, true) or ("error", false) in order to short circuit
  //rules that are false
  async.parallel(fns, function(err, results){
    var result = null;
    switch(ifstatement.test){
      case '<':
        result = results[0] < results[1];
        break;
      case '==':
        result = results[0] == results[1];
        break;
      case '>':
        result = results[0] > results[1];
        break;
      case '!=':
        result = results[0] != results[1];
        break;
      default:
        result = false;
    }
    if(result){
      cb(null, true);
    }else{
      cb("error", false);
    }
  });
}
JsonRules.prototype.getThen = function(rule, values){
  if(rule.then._catalog){
    var fn = this.catalog.getFn(rule.then._catalog.name);
    if(fn){
      if(rule.then._catalog.args){
         var argsObj = _.map(rule.then._catalog.args, function(attr){return parse(attr);});
         var appliedArgs = _.map(argsObj, function(arg){
           if(arg._object)
             return values[arg._object];
           else if(arg._value)
             return arg._value;
           else
             return null;
        });
        return (function(){return fn.apply(this,appliedArgs)});
      }
      else
        return (function(){return fn.apply(this)});
    }else{
      return null;
    }
  }else
    return null;
}
//returns an object from a period separated object ie
// "_object.foo"
// {_object: foo}
function parse(attribute){
  if(_.isString(attribute)){
    var ar = attribute.split('.');
    var obj = {};
    obj[ar[0]] = ar[1];
    return obj;
  }else if(_.isObject(attribute)){
    return attribute;
  }
}

module.exports =   JsonRules;
