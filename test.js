var JsonRules = require('./libs/JsonRules.js');
var ruleEngine = new JsonRules();
var exampleRule = require('./rule.example.js');

ruleEngine.doRule(exampleRule, {temp: 60, setTemp: 65});
