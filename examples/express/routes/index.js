var express = require('express');
// requires node v23, for require esm
var agent = require('../../agent-llamaindex');

console.log(agent)

var router = express.Router();

router.post('/', function(req, res, next) {
  agent.prompt(req.body)
    .then(function(result) {
      return res.json({ message: result.message.content })
    })
    .catch(function(error) {
      console.log('ERRROR')
      console.log(error)
    })
});

module.exports = router;
