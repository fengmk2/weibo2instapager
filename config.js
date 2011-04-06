
var weibo = require('./node-weibo');

// set weibo appkey
weibo.init('tsina', '1726331711', '25e94901457772fec1a16d52388011bf');
weibo.init('tqq', '2c19265ab67e47a4b024f98735ae35bf', 'e4faef24777082ef39a5decb307c18b1');

var debug = exports.debug = false;
var port = exports.port = 9298;
exports.home_url = 'http://rl.nodester.com';

if(debug) {
	exports.home_url = 'http://localhost:' + port;
}