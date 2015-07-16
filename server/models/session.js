var md5 = require('MD5');
var mysql;
var connection;

function Session(mysqlObject, mysqlConnection){
	mysql = mysqlObject;
	connection = mysqlConnection;
}

Session.prototype.start = function(social_id, callback){
	var session_key = getRandomInt(0, 10000);
	session_key = md5(session_key + social_id);
	var query = "INSERT INTO game_user_session_keys (`social_id`, `session_key`, `amount`) " +
			"VALUES (" + social_id + ", '" + session_key + "', 1) " +
			"ON DUPLICATE KEY UPDATE session_key='" + session_key + "', amount = amount + 1";
	mysql.query(query, [], connection, function(){
		callback(session_key);
	})
}

Session.prototype.validKey = function(social_id, session_key, callback){
	var query = "SELECT session_key FROM game_user_session_keys WHERE social_id=?";
    mysql.query(query, [social_id], connection, function(data){
		if (data.length > 0){
			if (data[0].session_key == session_key){
				callback(true);
			} else {
				callback(124);
			}
		} else {
			callback(123);
		}
	})
}


function getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = Session;