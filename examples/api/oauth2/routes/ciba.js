var express = require('express');
var router = express.Router();

/* POST backchannel authentication request. */
router.post('/bc-authorize', function(req, res, next) {
  console.log('CIBA AUTHORIZE!');
  console.log(req.headers);
  console.log(req.body)
  
  res.json({
    auth_req_id: 'tid-222-333',
    expires_in: 120,
    interval: 2,
    foo: 'bar'
  });
});

module.exports = router;
