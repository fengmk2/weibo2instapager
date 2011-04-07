
var assert = require('assert')
  , path = require('path')
  , fs = require('fs')
  , cache = require('cache');

var values = {
	1: 123,
	'1': 123,
	'abc': [1,2,3],
	'晕': {},
	'哈哈': '测试'
};

var cache_file_path = './cache.test.db';

module.exports = {
	
	'cache.set': function() {
		var db = cache.create(cache_file_path, 1);
//		db.load(function() {
//			for(var k in values) {
//				db.set(k, values[k]);
//				assert.eql(db.get(k), values[k]);
//			}
//			setTimeout(function() {
////				db.close();
//				assert.ok(path.existsSync(cache_file_path));
//				assert.ok(fs.statSync(cache_file_path).size > 0);
////				db.close(true);
//				db.close(false, function() {
//					console.log('dbclose');
//				});
//			}, 3000);
//		});
		
		db.load(function() {
			for(var k in values) {
				db.set(k, values[k]);
				assert.eql(db.get(k), values[k]);
			}
			db.close(false, function() {
				console.log('dbclose');
			});
			assert.ok(path.existsSync(cache_file_path));
			assert.ok(fs.statSync(cache_file_path).size > 0);
		});
	}
	
//	'cache.load': function() {
//		var db = cache.create('./cache.test.db', 1);
//		db.load(function() {
//			assert.ok(db._fd);
//			for(var k in values) {
//				assert.eql(db.get(k), values[k]);
//			}
//		});
//	}
};