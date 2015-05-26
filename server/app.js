/**
 * Main application file
 */

'use strict';

require('nodetime').profile({
	accountKey: 'f36935cd758a860d92ae49d40c8749a0bd2429a7', 
	appName: 'Plateforme-Beta MD5 Match'
});

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');

// Setup server
var app = express();
var server = require('http').createServer(app);

require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;