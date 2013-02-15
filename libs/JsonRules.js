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
  this.test(rule.ifs, value, function(err, result){
    if(err){
      if(cb)
        cb(err, null);
    }
    else if(result){
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
      return self._testIf( i, value, innerCb);
    }
  });
  async.parallel(testFns, function(err, results){
    if(err){
      if(err === "short-circuit")
        cb(null, false);
      else
        cb(err, false);
    }
    else if(_.every(results,function(i){return i})){
      cb(null, true);
    }
    else{
      cb(null, false);
    }
  });
}

JsonRules.prototype._testIf =  function(ifstatement, values, cb){
  var self = this;
  var operands = _.map(ifstatement.operands, parse);
  //test each attr if they are _object, _value or Catalog functions
  //return the async capatible function for returning that value
  var fns = _.map(operands, function(operand){
    if(_.has(operand, '_object'))
      return function(cb){cb(null, values[operand._object])};
    else if(_.has(operand, '_value'))
      return function(cb){cb(null, operand._value)};
    else if(_.has(operand,'_catalog')){
      var fn = self.getWrappedCatalogFn(operand._catalog, values);
        if(fn){
          return function(cb){return fn(cb)};
        }
        else
          return function(cb){return cb("error", false);};
    }else{
      return function(cb){cb(new Error("unsupported operand type"), false)};
    }
  });
  //get values and then test
  //cb is (null, true) or ("error", false) in order to short circuit
  //rules that are false
  async.parallel(fns, function(err, results){
    if(err){
      return cb(err, false);
    }
    var result = null;
    switch(ifstatement.test){
      case '<':
        result = results[0] < results[1];
        break;
      case '>=':
        result = results[0] >= results[1];
        break;
      case '<=':
        result = results[0] <= results[1];
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
      case '!==':
        result = results[0] !== results[1];
        break;
      case '===':
        result = results[0] === results[1];
        break;
      default:
        result = false;
    }
    if(result){
      return cb(null, true);
    }else{
      return cb("short-circuit", false);
    }
  });
}
JsonRules.prototype.getWrappedCatalogFn = function(catalog, values){
    var fn = this.catalog.getFn(catalog.name);
    if(fn){
      if(catalog.args){
        var argsObj = _.map(catalog.args, function(attr){return parse(attr);});
        var appliedArgs = _.map(argsObj, function(arg){
          if(arg._object)
            return values[arg._object];
          else if(arg._value)
            return arg._value;
          else
            return null;
        });
        return (function(cb){
          appliedArgs.push(cb); 
          return fn.apply(this,appliedArgs)});
      }
      else
        return (function(cb){return fn.apply(this, [cb])});
    }else{
      return null;
    }
}
JsonRules.prototype.getThen = function(rule, values){
  if(rule.then._catalog){
    var fn = this.getWrappedCatalogFn(rule.then._catalog, values);
    return fn; 
  } 
  else
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
