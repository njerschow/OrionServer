var express = require('express');
var router = express.Router();
var mssql = require('mssql');
var sess = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mssqlConfig = {
	user:'sa',
	password: 'hTYp9Ghwj8Bn',
	server: '45.58.42.52',
	database:"orion"
}

module.exports = function(app) {

	app.get('/talent/dashboard', function(req, res, next) {
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

}


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