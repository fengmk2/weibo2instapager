var tapi = exports.tapi = require('./lib/tapi').tapi;

exports.init = function tapi_init() {
	tapi.init.apply(tapi, arguments);
};

exports.oauth_middleware = require('./lib/oauth_middleware');

exports.instapaper = require('./lib/instapaper').instapaper;
