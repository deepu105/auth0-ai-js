var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');

mkdirp.sync('./var');

var db = new sqlite3.Database('./var/database.db');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS authorization_requests ( \
    id TEXT PRIMARY KEY, \
    scope TEXT, \
    notification_token TEXT, \
    is_approved INTEGER \
  )");
});

module.exports = db;
