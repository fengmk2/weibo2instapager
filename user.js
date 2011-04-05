
var crypto = require('crypto')
  , path = require('path')
  , fs = require('fs');

var cache = {};
var cache_path = path.join(__dirname, 'user.cache');

function md5(s) {
	var hash = crypto.createHash('md5');
	hash.update(s);
	return hash.digest('hex');
};

function load_data() {
	path.exists(cache_path, function(exists){
		if(!exists) {
			return;
		}
		fs.readFile(cache_path, function(err, data) {
			if (err) throw err;
			cache = JSON.parse(data);
		});
	});
};
load_data();

function save_data() {
	var data = JSON.stringify(cache);
	fs.writeFile(cache_path, data, function(err){
		if (err) throw err;
	});
};

exports.save = function(user, callback) {
	if(!user.id) {
		user.id = md5(user.username);
	}
	cache[user.id] = user;
	save_data();
	callback(user);
};

exports.get = function(id, callback) {
	callback(cache[id]);
};

exports.list = function(callback) {
	var users = [];
	for(var id in cache) {
		users.push(cache[id]);
	}
	callback(users);
};