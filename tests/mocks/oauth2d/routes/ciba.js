var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var db = require('../db');

/* POST backchannel authentication request. */
router.post('/bc-authorize', function(req, res, next) {
  console.log('CIBA AUTHORIZE!');
  console.log(req.headers);
  console.log(req.body)
  
  var uuid = crypto.randomUUID();
  db.run('INSERT INTO authorization_requests (id, scope, notification_token) VALUES (?, ?, ?)', [
    uuid,
    req.body.scope,
    req.body.client_notification_token
  ], function(err) {
    if (err) { return next(err); }

    console.log('==========');
    console.log('Agent is requesting access to ' + req.body.scope + '.  Execute the following to allow access:\n   $ ./bin/consent -t ' + uuid);
    console.log('==========');

    var body = {
      auth_req_id: uuid,
      expires_in: 120,
      interval: 2,
    };
    res.json(body);
  });
});

module.exports = router;
