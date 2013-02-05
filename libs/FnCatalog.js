var _ = require('underscore');

function FnCatalog( options){
  this.opts = options;
  this.catalog = {};

}
FnCatalog.prototype.addFn(fn, name, context, validator){
  validator = validator ? validator : (function(){return true;});
  this.catalog[name] = { fn: _.bind(fn, context)
                         validator: validator};

}
FnCatalog.prototype.getFn(name, validate){
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
modules.export = FnCatalog;
