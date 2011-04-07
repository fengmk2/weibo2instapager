
var crypto = require('crypto')
  , path = require('path')
  , Cache = require('./cache').Cache
  , util = require("util");

var cache_path = path.join(__dirname, 'user.cache');

function md5(s) {
	var hash = crypto.createHash('md5');
	hash.update(s);
	return hash.digest('hex');
};

function UserCache(filepath) {
	Cache.call(this, filepath, 2);
};

util.inherits(UserCache, Cache);

UserCache.prototype.save = function(user) {
	if(!user.id) {
		user.id = md5(user.username);
	}
	this.set(user.id, user);
};

UserCache.prototype.list = function() {
	var users = [];
	for(var id in this._cache) {
		users.push(this._cache[id]);
	}
	return users;
};

var db = null;

exports.connect = function(callback) {
	if(db) {
		callback(db);
		return;
	}
	db = new UserCache(cache_path);
	db.load(function() {
		callback(db);
	});
	process.on('exit', function() {
		db.close(true);
		console.log('exit.');
	});
};