var express = require('express');
var router = express.Router();
var mssql = require('mssql');
var sess = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs')

var mssqlConfig = {
	user:'sa',
	password: 'hTYp9Ghwj8Bn',
	server: '45.58.42.52',
	database:"orion"
}

router.use(cookieParser());
router.use(sess({
	cookieName: 'clientSession',
	secret: 'JuOnDassE%f&8buniojIByvr6x4wz^D%vb899jBJ(ionbicyrez56buiBUICT9hniuo)uccrGYvyTCvyuBIU',
	duration: (24 * 60 * 60 * 1000),
	activeDuration: (24 * 60 * 60 * 1000)
}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
	extended: true
}));

/* GET home page. */
router.get('/talent/dashboard', function(req, res, next) {
	if(isLoggedIn(req) == false){
		res.redirect('/login');
	}else{
		new Promise(function(resolve, reject) {
			console.log(req.clientSession.orionUserc);
			const pool = new mssql.ConnectionPool(mssqlConfig, (err) => {
				if(err){
					reject(err);
					console.log(err);
					return;
				}
				pool.request().query("SELECT * FROM talent where username = '" + req.clientSession.orionUserc.username + "'", (err, result) => {
				if(err){
					reject(err);
					console.log(err);
					return;
				}
				resolve(result);
				});
			});
		}).then((result) => {
			var talent = result.recordset[0];
			new Promise(function(resolve, reject) {
				const pool = new mssql.ConnectionPool(mssqlConfig, (err) => {
					if(err){
						reject(err);
						console.log(err);
						return;
					}
					pool.request().query("SELECT * FROM tracks where talentID = '" + result.recordset[0].ID + "' order by uploadDate desc", (err, result) => {
					if(err){
						reject(err);
						console.log(err);
						return;
					}
					resolve(result);
					});
				});
			}).then((result) => {
				console.log(result.recordset);
				res.render('talent', {
					title: 'Express',
					tracks: result.recordset,
					talent: talent,
					id: req.clientSession.orionUserc.id
				});
			});
		});
	}
});


router.get('/login', function(req, res, next) {
	if(isLoggedIn(req)){
		res.redirect('/talent/dashboard');
		return;
	}
	res.render('login');
})


router.post('/login', (req, res, next) => {
	if(isLoggedIn(req)){
		res.redirect('/talent/dashboard');
		return;
	}
	if(req.body.username == null || req.body.password == null){
		res.render('login');
		return;
	}

	var username = req.body.username;
	var password = req.body.password;


	new Promise((resolve, reject) => {
		const pool = new mssql.ConnectionPool(mssqlConfig, (err) => {
			if(err){
				reject(err);
				console.log(err);
				return;
			}

			pool.request().query("SELECT * FROM talent WHERE username='" + username + "' COLLATE SQL_Latin1_General_CP1_CI_AS", (err, result) => {
				if(err){
					reject(err);
					console.log(err);
					return;
				}
				resolve(result);
			});
			});
	}).then((result) => {
		if(result.recordset.length == 0){
			res.render('login', {invalid: true});
		}else{
			if(result.recordset.length > 1){
				return;
			}
			var sqlUser = result.recordset[0];
			if((username.toLowerCase() == sqlUser.username.toLowerCase()) && (password == sqlUser.password)){
				var orionUser = {
						id: sqlUser.ID,
						firstname: sqlUser.firstname,
						username: sqlUser.username,
						password: sqlUser.password,
						email: sqlUser.email,
						// Sessions set to expire after one hour:
						tsexpires: (((new Date().getTime()) + ((60 * 60) * 1000))),
						totalscore: sqlUser.totalscore,
						grade: sqlUser.grade
				}
				req.clientSession.orionUserc = orionUser;
				res.redirect('/talent/dashboard');
				return;
			}else{
				res.render('login', {invalid: true});
			}

		}
	});

});

router.get('/logout', (req, res, next) => {
	req.clientSession.orionUserc = null;
	res.redirect('/login');
});



function isLoggedIn(req){
	if(req.clientSession.orionUserc){
		var currentTime = new Date().getTime();
		if(req.clientSession.orionUserc.tsexpires < currentTime){
			req.clientSession.orionUserc = null;
			return false;
		}else{
			return true;
		}
	}else{
		return false;
	}
}

function randomString(length, chars) {
		var result = '';
		for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
		return result;
}

function notIn(array) {
	return function(item) {
			return array.indexOf(item) < 0;
	};
}


module.exports = router;
