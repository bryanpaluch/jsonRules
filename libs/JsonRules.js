var _     = require('underscore');
var async = require('async');


function JsonRules( options){
  this.catalog = options.catalog;
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
      self._testIf(innerCb, i, value);
    }
  });
  async.parallel(testFns, function(err, results){
    if(err)
      cb(false);
    else 
      cb(true);
  });
}

JsonRules.prototype._testIf =  function(cb, ifstatement, value){
  var attr1 = parse(ifstatement.operands[0]);
  var attr2 = parse(ifstatement.operands[1]);
  //test each attr if they are _object or Catalog functions
  if(attr1._object)
    var func1 = function(cb){cb(null, value[attr1._object])};
  else if(attr1._value)
    var func1 = function(cb){cb(null, attr1._value)};
  
  if(attr2._object)
    var func2 = function(cb){cb(null, value[attr2._object])};
  else if(attr2._value)
    var func2 = function(cb){cb(null, attr2._value)};
  
  async.parallel([func1, func2], function(err, results){
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
    console.log('then is a catalog type rule, grabbing from fnCatalog');
    var fn = this.catalog.getFn(rule.then._catalog.name);
    if(fn){
      console.log('got fn from catalog, testing then for attributes to pass to function');
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
        return (function(){fn.apply(this,appliedArgs)});
      }
      else
        return (function(){fn()});
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
