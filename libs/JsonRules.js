var _     = require('underscore');
var async = require('async');


function JsonRules( options){
  this.opts = options;
  this.catalog = {};

}

//Tests the if section of a rule returns a true callback
//if rule passes
//false if rule doesn't

JsonRule.prototype.doRule= function(rule, value){



}

JsonRules.prototype.test = function(ifs, value, cb){
  var self = this; 
  var ifarray = (ifs typeOf 'array') :  ifs ? [ifs];
  var testFns = _.map(ifarray, function(i){return self._testIf(cb, i, value)});
  async.parallel(testFns, function(err, results){
    if(err){return false;}
    else return true;
  });
}

JsonRule.prototype._testIf =  function(cb, if, value){
  var attr1 = parse(if.attributes[0]);
  var attr2 = parse(if.attributes[1]);
  //test each attr if they are _object or Catalog functions
  if(attr1._object)
    var func1 = function(cb){cb(null, value[attr1._object])};
  if(attr2._object)
    var func2 = function(cb){cb(null, value[attr2._object])};

  async.parallel([func1, func2], function(err, results){
    console.log(results); 
    switch
  });
}
//returns an object from a period separated object ie
// "_object.foo"
// {_object: foo}
function parse(attribute){
  if(typeOf attribute == "string"){
    var ar = attribute.split(attribute, '.');
    var obj = {};
    obj[ar[i]] = ar[i+1];
    return obj;
  }else if(typeOf attribute == "object"){
    return attribute;
  }
}

modules.export = JsonRules;
