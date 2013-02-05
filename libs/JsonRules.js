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
  var testFns = _.map(ifarray, function(i){return self._testIf(i)});
  async.parallel(testFns, function(err, results){
    if(err){return false;}
    else return true;
  });
}

JsonRule.prototype._testIf =  function(if, value){



}



modules.export = JsonRules;
