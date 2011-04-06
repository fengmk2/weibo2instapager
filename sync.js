
var user_db = require('./user')
  , weibo = require('node-weibo')
  , tapi = weibo.tapi
  , instapaper = weibo.instapaper;

/*
 * start sync
 */
exports.start = function(seconds) {
	seconds = (seconds || 60) * 1000;
	setInterval(sync, seconds);
//	setTimeout(function() {
//		sync();
//	}, 1000);
};

function sync() {
	user_db.list(function(users) {
		console.log('sync', users.length, 'users');
		for(var i=0; i<users.length; i++) {
			sync_user(users[i]);
		}
	});
};

function sync_user(user) {
	var binds = user.binds;
	if(!binds) {
		return;
	}
	console.log('sync_user', user.username, Object.keys(binds).length, 'binds');
	for(var k in binds) {
		sync_favorites(user, binds[k]);
	}
};


function sync_favorites(user, t_user) {
	var since_id = t_user.since_id;
	tapi.favorites({user: t_user}, function(statuses, error) {
		if(error) {
			t_user.last_error = error.message || String(error);
			console.log(error);
			return;
		}
		if(statuses.length == 0) {
			return;
		}
		var news = [];
		for(var i=0; i<statuses.length; i++) {
			var status = statuses[i];
			var id = String(status.id);
			if(id === since_id) {
				break;
			}
			news.push(status);
		}
		console.log('get', statuses.length, 'statuses', news.length, 'news');
		var finished = 0, count = news.length;
		for(var i=0; i<count; i++) {
			var status = statuses[i];
			send_to_instapaper(user, status, function(success, error) {
				if(++finished == count) {
					t_user.since_id = String(statuses[0].id);
					if(t_user.since_id !== since_id) {
						user_db.save(user, function(){
							console.log(t_user.screen_name, 'done')
						});
					}
				}
			});
		}
	});
};

var URL_REGEX = /https?:\/\/[^\s]+/;
function send_to_instapaper(user, status, callback) {
	var m = URL_REGEX.exec(status.text);
	if(m) {
		instapaper.add(user, {url: m[0], selection: status.text}, 
				function(success, error){
			console.log(success, {url: m[0]})
			callback(success, error);
		});
	} else {
		callback(true);
	}
};