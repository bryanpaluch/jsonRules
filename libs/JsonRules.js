var _     = require('underscore');
var async = require('async');
var jsonpath = require('JSONPath').eval;

function JsonRules( options){
  var options = options ? options : {};
  this.catalog = (options.catalog) ? options.catalog : {};
}
//Tests the if section of a rule returns a true callback
//if rule passes
//false if rule doesn't

JsonRules.prototype.doRule= function(rule, value, cb){
  var self= this;
  //If all else fails don't throw
  try{
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
  }catch(e){
    if(cb)
      cb(e, null);
  }
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
    if(_.isNumber(operand))
      return function(cb){cb(null, operand)};
    else if(_.isString(operand) && operand.charAt(0) != '_')
      return function(cb){cb(null, operand)};
    else if(_.has(operand, '_object'))
      return function(cb){cb(null, values[operand._object])};
    else if(_.has(operand, '_value'))
      return function(cb){cb(null, operand._value)};
    else if(_.has(operand, '_JSONPath')){
      return function(cb){cb(null, jsonpath(values, operand._JSONPath)[0])};
    }
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
      // Error while executing the if
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
      // If statement passed
      return cb(null, true);
    }else{
      // If did not pass
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
          if(_.isNumber(arg))
            return arg;
          else if(_.isString(arg))
            return arg;
          else if(arg._object)
            return values[arg._object];
          else if(arg._value)
            return arg._value;
          else if(arg._JSONPath)
            return jsonpath(values, arg._JSONPath)[0];
          else
            return null;
        });
        return (function(user, cb){
          if(!cb){
            cb = user;
          }
          return fn.apply(this,[appliedArgs, user, cb])});
      }
      else
        return (function(user, cb){
          if(!cb){
            cb = user;
          }
          return fn.apply(this, [null,user, cb])});
    }else{
      return null;
    }
}
JsonRules.prototype.getThen = function(rule, values){
  if(Array.isArray(rule.then)){
    var fns = [];
    rule.then.forEach((function(then){
      var fn = this.getWrappedCatalogFn(then._catalog, values);
      fn.fnName = then._catalog.name;
      fn.priority = then._catalog.priority || 100;
      fns.push(fn);
    }).bind(this));
    return fns;
  }else if(typeof rule.then === 'object'){
    var fn = this.getWrappedCatalogFn(rule.then._catalog, values);
    fn.fnName = rule.then._catalog.name;
    fn.priority = rule.then._catalog.priority || 100;
    return fn; 
  }else
    return null;

}
//returns an object from a period separated object ie
// "_object.foo"
// {_object: foo}
function parse(attribute){
  if(_.isString(attribute)){
    if(attribute.charAt(0) === "$"){
      //Don't actually parse JSONPath objects
      var obj = {}; 
      obj['_JSONPath'] = attribute;
      return obj;
    }
    else if(attribute.charAt(0) === "_"){
      var ar = attribute.split('.');
      var obj = {};
      obj[ar[0]] = ar[1];
      return obj;
    }else{
      return attribute;
    }
  }
  else {
    return attribute;
  }
}

module.exports =   JsonRules;
