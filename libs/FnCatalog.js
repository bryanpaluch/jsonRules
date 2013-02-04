var _ = require('underscore');

function fnCatalog( options){
  this.opts = options;
  this.catalog = {};

}
fnCatalog.prototype.addFn(fn, name, context, validator){
  validator = validator ? validator : (function(){return true;});
  this.catalog[name] = { fn: _.bind(fn, context)
                         validator: validator};

}
fnCatalog.prototype.getFn(name, validate){
  if(this.catalog[name]){
    if(validate){
      if(this.catalog[name].validator(validate));
        return this.catalog[name].fn;
      else
        return null;
    }
    else
      return this.catalog[name].fn;
  }
  else{
    return null;
  }
}
modules.export = fnCatalog;
