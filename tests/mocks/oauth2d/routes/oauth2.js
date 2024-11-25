var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var db = require('../db');

/* POST backchannel authentication request. */
router.post('/token', function(req, res, next) {
  db.get('SELECT * FROM authorization_requests WHERE id = ?', [ req.body.auth_req_id ], function(err, row) {
    if (err) { return next(err); }
    if (row.is_approved == null) {
      return res.json({ error: 'authorization_pending' });
    }
    if (!row.is_approved) {
      return res.json({ error: 'access_denied' });
    }
    
    return res.json({
      access_token: 'secret'
    });
  });
});

module.exports = router;
