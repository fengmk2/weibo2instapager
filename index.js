
var weibo = require('./node-weibo')
  , express = require('express')
  , user_db = require('./user')
  , sync = require('./sync');

// set weibo appkey
weibo.init('tsina', '1726331711', '25e94901457772fec1a16d52388011bf');

var home_url = 'http://rl.nodester.com';
var app = express.createServer();

//use jqtpl in express
app.set("view engine", "html");
app.set('view options', {
	layout: 'layout.html'
});
app.register(".html", require("jqtpl"));

app.use(express.static(__dirname + '/public', {maxAge: 3600000 * 24 * 30}));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.errorHandler({ dumpExceptions: true }));

// handler login user
app.use(function wrap_login_user(req, res, next) {
	var uid = req.cookies.uid;
	if(uid) {
		user_db.get(uid, function(user) {
			req.current_user = user;
			next();
		});
	} else {
		next();
	}
});

function oauth_user_bind(oauth_user, referer, req, res, callback) {
	var current_user = req.current_user;
	current_user.binds = current_user.binds || {};
	var user_id = oauth_user.blogtype + ':' + oauth_user.id;
	oauth_user.user_id = user_id;
	current_user.binds[user_id] = oauth_user;
	user_db.save(current_user, function() {
		callback();
	});
};

app.use(weibo.oauth_middleware(home_url, oauth_user_bind));

app.get('/', function index(req, res, next){
	var locals = {
		user: req.current_user,
		binds: {}
	};
	if(req.current_user && req.current_user.binds) {
		var binds = req.current_user.binds;
		for(var user_id in binds) {
			var user = binds[user_id];
			locals.binds[user.blogtype] = user;
		}
	}
	res.render('index.html', locals);
});

app.post('/login', function login(req, res, next){
	var user = {
		username: req.body.username,
		password: req.body.password
	};
	weibo.instapaper.authenticate(user, function(auth_user, err){
		if(auth_user) {
			user_db.save(user, function(save_user){
				res.cookie('uid', save_user.id, {maxAge: 3600000000, path: '/'});
				res.redirect('/');
			});
		} else {
			res.send(err);
		}
	});
});

app.post('/unbind/:user_id', function unbind(req, res, next) {
	if(req.current_user && req.current_user.binds) {
		delete req.current_user.binds[req.params.user_id];
		user_db.save(current_user, function() {
			callback();
		});
	}
});

app.listen(8888);
console.log('web server start');

sync.start();
console.log('sync start');