
var user_db = require('./user')
  , weibo = require('./node-weibo')
  , tapi = weibo.tapi
  , instapaper = weibo.instapaper
  , config = require('./config');

/*
 * start sync
 */
var start = exports.start = function(seconds) {
	seconds = (seconds || 60) * 1000;
	setInterval(sync, seconds);
};

if(config.debug) {
	setTimeout(function() {
		sync();
	}, 500);
}

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
	tapi.favorites({user: t_user}, function(data, error) {
		var statuses = data.items || data;
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
		console.log(t_user.blogtype, t_user.screen_name, 
			'get', statuses.length, 'statuses', news.length, 'news');
		var finished = 0, count = news.length;
		for(var i=0; i<count; i++) {
			var status = statuses[i];
			send_to_instapaper(user, status, function(success, error) {
				if(success) {
					user.sync_count = (user.sync_count || 0) + 1;
					t_user.sync_count = (t_user.sync_count || 0) + 1;
				}
				if(++finished == count) {
					t_user.since_id = String(statuses[0].id);
					if(t_user.since_id !== since_id) {
						user_db.save(user, function(){
							console.log(t_user.blogtype, t_user.screen_name, 'done')
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
			console.log(success, m[0], error)
			callback(success, error);
		});
	} else {
		callback(false);
	}
};