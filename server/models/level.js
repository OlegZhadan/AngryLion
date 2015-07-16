/**
 * New node file
 */

var mysql;
var connection;

function Level(mysqlObject, mysqlConnection){
	mysql = mysqlObject;
	connection = mysqlConnection;
}

Level.prototype.getAllLevels = function (user_id, callback) {
    var query = "SELECT ml.pos_x, ml.pos_y, ml.level_id, ml.bg_id, ml.map_level_id, us.score, l.star_1, l.star_2, l.star_3, l.level_id " +
        "FROM game_map_level as ml " +
        "inner join game_level as l on ml.level_id = l.level_id " +
        "left join game_user_score as us on us.level_id = l.level_id and user_id = ?";
    mysql.query(query, [user_id], connection, function(data){

        var query = "SELECT * FROM game_level_goal";
        mysql.query(query, [], connection, function(goalArr){

            for (i = 0; i < data.length; i++){
                data[i].goals = [];
                for (var j = 0; j < goalArr.length; j++) {
                    if (goalArr[j].level_id == data[i].level_id) {
                        goal = {
                            level_id: goalArr[j].level_id,
                            type: goalArr[j].type,
                            object_type: goalArr[j].object_type,
                            count: goalArr[j].count
                        };
                        data[i].goals.push(goal);
                    }
                }
                if (data[i].score == null){
                    data[i].score = 0;
                }
            }
            callback(data);
        });
	});
}

Level.prototype.getMapLevelArr = function (callback) {
    var query = "SELECT * FROM game_map_level";
    mysql.query(query, [], connection, function(data){
        callback(data);
    });
}

Level.prototype.getUserCurrentLevel = function (user_id, callback) {
    var query = "SELECT level_id FROM game_user_level WHERE user_id=? ";
    mysql.query(query, [user_id], connection, function(data){
        if (data.length > 0) {
            callback(data[0].level_id);
        } else {
            callback(-1);
        }
    });
}

Level.prototype.getUserLevels = function (user_id, callback) {
    var query = "SELECT * FROM game_user_level WHERE user_id=? ";
    mysql.query(query, [user_id], connection, function(data){
        var levels = [];
        for(var key in data) {
            levels[data[key].level_id] = data[key];
        }
        callback(levels);
    });
}

Level.prototype.setViralXP = function (user_id, callback) {
    var query = "SELECT level_id FROM game_user_level WHERE user_id=? ";
    mysql.query(query, [user_id], connection, function(userLevel){
        var query = "SELECT uv.viral_id, lv.xp as exp FROM game_user_viral as uv " +
            "INNER JOIN game_level_viral as lv on lv.viral_id = uv.viral_id " +
            "WHERE uv.user_id=? and uv.status = 0 and lv.after_level_id=?";
        mysql.query(query, [user_id, userLevel[0].level_id], connection, function(data){
            if (data.length >0 ) {
                getStarAmount(user_id, function (userXP) {
                    if (userXP >= data[0].exp) {
                        query = "UPDATE game_user_viral SET status = 2 WHERE viral_id = ? and user_id = ?";
                        mysql.query(query, [data[0].viral_id, user_id], connection, function(res){
                            var query = "INSERT INTO game_user_viral " +
                                "(`user_id`, `viral_id`) " +
                                "VALUES (" + user_id + ", " + (data[0].viral_id+1) + ")";
                            mysql.query(query, [], connection, callback);
                        });
                    } else {
                        callback(255);
                    }
                });
            } else {
                callback(256);
            }
        });
    });
}

Level.prototype.setViralCoins = function (user_id, callback) {
    var query = "SELECT level_id FROM game_user_level WHERE user_id=? ";
    mysql.query(query, [user_id], connection, function(userLevel){
        var query = "SELECT uv.viral_id, lv.xp as exp, lv.coins as coins, ug.amount as gold FROM game_user_viral as uv " +
            "left join game_level_viral as lv on lv.viral_id = uv.viral_id " +
            "left join game_user_gold as ug on ug.user_id = uv.user_id " +
            "WHERE uv.user_id=? and uv.status = 0 and lv.after_level_id=?";
        mysql.query(query, [user_id, userLevel[0].level_id], connection, function(data){
            if (data.length > 0) {
                getStarAmount(user_id, function (userXP) {
                    if (userXP >= data[0].exp) {
                        query = "UPDATE game_user_viral SET status = 2 WHERE viral_id = ? and user_id = ?";
                        mysql.query(query, [data[0].viral_id, user_id], connection, callback);
                    } else if (data[0].gold >= data[0].coins) {
                        query = "UPDATE game_user_gold SET amount = amount - ? WHERE user_id = ?";
                        mysql.query(query, [data[0].coins, user_id], connection, function(res){
                            query = "UPDATE game_user_viral SET status = 3 WHERE viral_id = ? and user_id = ?";
                            mysql.query(query, [data[0].viral_id, user_id], connection, function(res){
                                var query = "INSERT INTO game_user_viral (`user_id`, `viral_id`, `status`) " +
                                    "VALUES (" + user_id + ", " + (data[0].viral_id+1) + ", 0) " +
                                    "ON DUPLICATE KEY UPDATE status=0";
                                mysql.query(query, [], connection, callback);
                            });
                        });
                    } else {
                        callback(257);
                    }
                });
            } else {
                callback(256);
            }
        });
    });
}

Level.prototype.getViralBlocks = function (user_id, callback) {
    var query = "SELECT lv.*, uv.status, uv.friend_1, uv.friend_2, uv.friend_3, uv.user_id FROM game_level_viral as lv " +
        "left join game_user_viral as uv on uv.viral_id = lv.viral_id and user_id=?";
    mysql.query(query, [user_id], connection, function(data){
        if (data.length > 0) {
            callback(data);
        } else {
            callback(0);
        }
    });
}

Level.prototype.getAllLevelGoal = function ( callback) {

    var query = "SELECT * FROM game_level ";
    mysql.query(query, [], connection, function(data){

        var query = "SELECT * FROM game_level_goal";
        mysql.query(query, [], connection, function(goalArr){

            for (i = 0; i < data.length; i++){
                data[i].goals = [];
                for (var j = 0; j < goalArr.length; j++) {
                    if (goalArr[j].level_id == data[i].level_id) {
                        goal = {
                            level_id: goalArr[j].level_id,
                            type: goalArr[j].type,
                            object_type: goalArr[j].object_type,
                            count: goalArr[j].count
                        };
                        data[i].goals.push(goal);
                    }
                }
            }
            callback(data);
        });
    });
}

Level.prototype.getLevelByID = function (user_id, level_id, callback) {
    var query = "SELECT *, ml.bg_id FROM game_level " +
        "inner join game_map_level as ml using (level_id) " +
        "WHERE level_id=? ";
    mysql.query(query, [level_id], connection, function(data){

        var query = "SELECT * FROM game_level_objects WHERE level_id=? ";
        mysql.query(query, [level_id], connection, function(res){

            var objects = [];
            for (i = 0; i < res.length; i++){
                object = {
                    x: res[i].x,
                    y: res[i].y,
                    object_id: res[i].object_id,
                    count: res[i].count,
                    options: res[i].options
                };
                objects.push(object);
            }

                var levelData = [];
            level = {
                level_id: data[0].level_id,
                bg_id: data[0].bg_id,
                x: data[0].x,
                y: data[0].y,
                star_1: data[0].star_1,
                star_2: data[0].star_2,
                star_3: data[0].star_3,
                fill: data[0].fill,
                max_color: data[0].max_color,
                bonus_step: data[0].bonus_step,
                moves: data[0].moves,
                objects: objects
            };
            levelData.push(level);
            callback(levelData);
        });
    });
}

Level.prototype.getLevel = function (user_id, level_id, callback) {

    isAvailableLevel(user_id, level_id, function(bool) {
        console.log('isAvailableLevel result :' + bool);
        if (bool == true) {

            var query = "SELECT l.level_id as id, l.back_id, l.start_speed, l.speed_increase, " +
                "l.max_speed, l.object_wait_time, l.random, " +
                //		"ob.object_id, " +
                "p.pattern_id, p.width, p.height, p.pattern " +
                "FROM game_levels as l " +
                //		"INNER JOIN game_level_objects as ob using(level_id) " +
                "INNER JOIN game_level_patterns as lp using(level_id) " +
                "INNER JOIN game_patterns as p using(pattern_id)	" +
                "WHERE l.active='true' and l.level_id=?";

            mysql.query(query, [level_id], connection, function(data){

                if (data.length == 0) {
                    callback(103);
                    return;
                }

                var patterns = [];
                //			var objects = [];
                var levelData = {
                    id: data[0].id,
                    back_id: data[0].back_id,
                    start_speed: data[0].start_speed,
                    speed_increase: data[0].speed_increase,
                    max_speed: data[0].max_speed,
                    object_wait_time: data[0].object_wait_time,
                    random: data[0].random
                };

                var pattern_ids = [];
                for (i = 0; i < data.length; i++){
                    /*
                     if (objects.indexOf(data[i].object_id) < 0){
                     objects.push(data[i].object_id);
                     }
                     */
                    if (pattern_ids.indexOf(data[i].pattern_id) < 0){
                        pattern_ids.push(data[i].pattern_id);

                        pattern = {
                            id: data[i].pattern_id,
                            w: data[i].width,
                            h: data[i].height,
                            p: data[i].pattern
                        };
                        patterns.push(pattern);
                    }

                }

                //			levelData.objects = objects;
                levelData.patterns = patterns;

                callback(levelData);
            });

        } else {
            callback(102);
            return;
        }

    })


}


function onSuccessUserLevel(data)
{

}

/**
 * transfer friends levels into memcache
 * @param friends
 */


Level.prototype.getFriendsLevels = function(friends){

}

function isAvailableLevel(user_id, level_id, callback){
    if (level_id == 1) {
        callback(true);
        return;
    }
    console.log('start av');

    var query = "SELECT * FROM game_user_score WHERE wins > 0 and user_id=? and level_id in " +
        "(SELECT level_id FROM game_levels WHERE sort in " +
        "(SELECT sort-1 as s FROM game_levels WHERE level_id=?))";

    mysql.query(query, [user_id, level_id], connection, function(data){
        if (data.length != 0){
            callback(true);
        } else callback(false);
    })
}

function getStarAmount(user_id, callback) {
    var userXP = 0;
    var query = "SELECT l.star_1, l.star_2, l.star_3, us.score, wins FROM game_user_score as us " +
        "inner join game_level as l on l.level_id = us.level_id " +
        "WHERE us.wins > 0 and us.user_id=?";

    mysql.query(query, [user_id], connection, function(data){
        if (data.length > 0){
            for (key in data) {
                if (data[key].score >= data[key].star_1) {
                    userXP++;
                }
                if (data[key].score >= data[key].star_2) {
                    userXP++;
                }
                if (data[key].score >= data[key].star_3) {
                    userXP++;
                }
            }
            callback(userXP);
        } else callback(false);
    })
}

module.exports = Level;