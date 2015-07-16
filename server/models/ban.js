var mysql;
var connection;


function Ban(mysqlObject, mysqlConnection){
    mysql = mysqlObject;
    connection = mysqlConnection;
}

Ban.prototype.checkAmount = function(social_id, callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    var period = time - 3;

    var query = "SELECT count(*) as amount FROM game_queries WHERE social_id=? AND date>" + period + ";";
    mysql.query(query, [social_id], connection, function(data){
        if (data.length > 0){
            var max = 5;
            if (data[0].amount >= max){
                callback(false);
            } else {
                callback(true);
            }
        } else {
            callback(true);
        }
    })
}


Ban.prototype.setQuery = function(social_id, callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    var query = "INSERT INTO game_queries (`social_id`, `date`) VALUES (" + social_id + ", " + time + ")";
    mysql.query(query, [], connection, callback);
}
