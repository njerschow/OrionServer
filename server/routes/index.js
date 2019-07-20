var express = require('express');
var router = express.Router();
var mssql = require('mssql');

var mssqlConfig = {
  user:'sa',
  password: 'hTYp9Ghwj8Bn',
  server: '45.58.42.52',
  database:"orion"
}

var Drake = {
	artistName: 'Drake'
}

/* GET home page. */
router.get('/', function(req, res, next) {
	new Promise(function(resolve, reject) {
		const pool = new mssql.ConnectionPool(mssqlConfig, (err) => {
			if(err){
				reject(err);
				console.log(err);
				return;
			}
			pool.request().query("SELECT * FROM [tracks] where talentID = 'F72F1B9A-49CC-45B0-B31D-F40E43B47568' order by uploadDate desc", (err, result) => {
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
		res.render('talent', {title: 'Express', tracks: result.recordset, talent: Drake});
	});
});

module.exports = router;
