var mysql;
var connection;

function GameObjects(mysqlObject, mysqlConnection){
	mysql = mysqlObject;
	connection = mysqlConnection;
}

GameObjects.prototype.getGameObjects = function(callback){
	var query = "SELECT * FROM game_objects";
	mysql.query(query, [], connection, function(data){
        var objects = [];
        for (var i = 0; i < Object.keys(data).length; i++){
            objects[data[i].object_id] = data[i];
        }
        callback(objects);
    });
}

GameObjects.prototype.getGamePatterns = function(callback){
	var query = "SELECT * FROM game_patterns";
	mysql.query(query, [], connection, callback);
}

function onSuccessQuery(data){
	console.log(data);
}

module.exports = GameObjects;
