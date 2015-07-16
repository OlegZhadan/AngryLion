var mysql;
var connection;

function Friend(mysqlObject, mysqlConnection){
	mysql = mysqlObject;
	connection = mysqlConnection;
}

Friend.prototype.getFirendLevels = function(friends, callback){

	validFriendsArr(friends, function(result){
		console.log('result: ' + result);
		if (result.length > 0){
			var query = "SELECT social_id, l.level_id as active_level_id FROM game_user " +
					"inner join game_user_level as ul using(user_id) " +
					"inner join game_map_level as l on map_level_id = " +
					"(SELECT map_level_id+1 from game_map_level where level_id=ul.level_id) " +
					"WHERE social_id IN (" + result + ")";
			mysql.query(query, [], connection, function(data){
				callback(data);
			})
		} else {
			callback(0);
		}
	})
}

Friend.prototype.getFriendScore = function(level_id, friends, callback){
    validFriendsArr(friends, function(result){
        if (result.length > 0){
			var query = "SELECT u.social_id, sc.score FROM game_user as u " +
					"inner join game_user_score as sc " +
					"USING (user_id) " +
					"WHERE social_id IN (" + result + ") and sc.wins>0 and sc.level_id=?";
			mysql.query(query, [level_id], connection, function(data){
                callback(data);
			}) 
		} else {
			callback(0);
		}
	})
}

function validFriends(friends, callback){
	var valid = [];
	var fr_ids = friends.split(",");
	for (i = 0; i < fr_ids.length; i++){
		if (parseInt(fr_ids[i]) > 0) {
			valid.push(fr_ids[i]);
		}
	}
    callback(valid.join());
}

function validFriendsArr(friends, callback){
    var valid = [];
    for (i = 0; i < friends.length; i++){
        if (parseInt(friends[i]) > 0) {
            valid.push(friends[i]);
        }
    }
    callback(valid.join());
}

module.exports = Friend;