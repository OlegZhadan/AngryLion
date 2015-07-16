var mysql;
var connection;
var CONST;
var tools = require('../library/tools');

function User(mysqlObject, mysqlConnection, constantsObject){
    mysql = mysqlObject;
    connection = mysqlConnection;
    CONST = constantsObject;
}

User.prototype.saveMusic = function(social_id, music, callback) {
    query = "UPDATE game_user SET music = ? WHERE social_id=?";
    mysql.query(query,[music, social_id], connection, function(res) {
        callback('ok');
    });
}

User.prototype.saveSound = function(social_id, sound, callback) {
    query = "UPDATE game_user SET sound = ? WHERE social_id=?";
    mysql.query(query,[sound, social_id], connection, function(res) {
        callback('ok');
    });
}

User.prototype.saveUserScore = function(user_id, score, level_id, callback) {
    query = "SELECT * FROM game_user_score as us " +
        "where us.level_id=? and us.user_id=?";
    mysql.query(query, [level_id, user_id], connection, function(data){
        if (data[0].wins == 0 && data[0].fails == 0) {
            query = "UPDATE game_user_score SET score=" + score + " " +
                "WHERE user_id=? and level_id=?";
            mysql.query(query,[user_id, level_id], connection, function(res){
                callback('ok');
            })
        } else {
            callback('ok');
        }
    });
}

User.prototype.inAppPurchase = function(user_id, type, coins, level_id, callback){
    var query = "SELECT * FROM game_user_gold WHERE user_id=?";
    mysql.query(query, [user_id], connection, function(data){
        if (data[0].amount >= coins) {
            query = "UPDATE game_user_gold SET amount = amount - " + coins + " WHERE user_id=?";
            mysql.query(query,[user_id], connection, function(res) {
                var query = "INSERT INTO game_user_purchase " +
                    "(`user_id`, `level_id`, `type`, `coins`) " +
                    "VALUES (" + user_id + ", " + level_id + ", '" + type + "', " + coins + ")";
                mysql.query(query, [], connection, callback);
            });
        } else {
            callback(257);
        }
    });
}

User.prototype.getSpecialOffer = function(user_id, callback){
    var query = "SELECT * FROM game_user_special_offer WHERE user_id=?";
    mysql.query(query, [user_id], connection, function(data){
        if (data.length > 0 && data[0].status == 1) {
            callback(true);
        } else {
            callback(false);
        }
    });
}

User.prototype.saveSpecialOffer = function(user_id, share, callback){
    if (share === 1) {
        var query = "INSERT INTO game_user_special_offer " +
            "(`user_id`, `share`) " +
            "VALUES (" + user_id + ", " + share + ") " +
            "ON DUPLICATE KEY UPDATE share=" + share + "";
        mysql.query(query, [], connection, function(){
            callback(true);
        });
    } else {
        var query = "SELECT * FROM game_user_special_offer WHERE user_id=?";
        mysql.query(query, [user_id], connection, function(data){
            if (data.length > 0 && data[0].share == 1) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }
}

User.prototype.completeSpecialOffer = function(user_id, callback){
    var query = "SELECT * FROM game_user_special_offer WHERE user_id=? AND status = 0";
    mysql.query(query, [user_id], connection, function(data){
        if (data.length > 0) {
            var query = "INSERT INTO game_user_special_offer " +
                "(`user_id`, `share`, `status`) " +
                "VALUES (" + user_id + ", 0, 1) " +
                "ON DUPLICATE KEY UPDATE status=1";
            mysql.query(query, [], connection, function () {
                addGold(user_id, 20, function () {
                    callback(true);
                });
            });
        } else {
            callback(true);
        }
    });
}

User.prototype.startLevel = function(user_id, level_id, session_key, callback){
    console.log(user_id);
    console.log('START ' + session_key);
    var query = "INSERT INTO game_user_score " +
        "(`user_id`, `level_id`, `score`, `time`, `wins`, `fails`, `amount`) " +
        "VALUES (" + user_id + ", " + level_id + ", 0, 0, 0, 0, 1) " +
        "ON DUPLICATE KEY UPDATE amount=amount+1";
    mysql.query(query, [], connection, function(data){
        var date = new Date();
        var time = Math.floor(date.getTime() / 1000);
        query = "INSERT INTO game_user_sessions " +
            "(`user_id`, `level_id`, `date`, `session`) " +
            "VALUES (" + user_id + ", " + level_id + ", " + time + ", '" + session_key + "') " +
            "ON DUPLICATE KEY UPDATE level_id=" + level_id + ", date=" + time + ", session='" + session_key + "'";
        mysql.query(query, [], connection, function(){
            minLive(user_id, callback);
        });
    });
}

User.prototype.startLevelMoreMoves = function(user_id, level_id, session_key, callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    query = "INSERT INTO game_user_sessions " +
        "(`user_id`, `level_id`, `date`, `session`) " +
        "VALUES (" + user_id + ", " + level_id + ", " + time + ", '" + session_key + "') " +
        "ON DUPLICATE KEY UPDATE level_id=" + level_id + ", date=" + time + ", session='" + session_key + "'";
    mysql.query(query, [], connection, function(){
        callback();
    });
}

User.prototype.finishLevel = function(user_id, level_id, user_data, session_key, callback){
    var query = "SELECT * FROM game_user_sessions WHERE user_id=?";
    mysql.query(query, [user_id], connection, function(data){
//    var query = "SELECT * FROM game_user_sessions WHERE user_id=? and level_id=?";
//    mysql.query(query, [user_id, level_id], connection, function(data){
        if (data.length == 0 || data[0].session != session_key || data[0].level_id != level_id) {
            console.log('====');
            console.log(user_id);
            console.log(session_key);
            console.log(level_id);
            console.log('====');
            callback(105);
        } else {
            query = "SELECT l.star_1, sc.score, ul.level_id as last_level " +
                "FROM game_level as l " +
                "inner join game_user_score as sc using (level_id) " +
                "left join game_user_level as ul using(user_id)" +
                "where l.level_id=? and sc.user_id=?";
            mysql.query(query, [level_id, user_id], connection, function(data){

                var score = user_data.score;
                var userMoves = user_data.userMoves;
                query = "SELECT lg.type, lg.object_type, lg.count " +
                    "FROM game_level_goal as lg " +
                    "where lg.level_id=?";
                mysql.query(query, [level_id], connection, function(goalArr){
                    if (score == scoreCalc(userMoves)) {
                        var goals = [];
                        for (i = 0; i < goalArr.length; i++){
                            goal = {
                                type: goalArr[i].type,
                                object_type: goalArr[i].object_type,
                                count: goalArr[i].count
                            };
                            goals.push(goal);
                        }

                        if (objectCalc(userMoves, goals) === true && score >= data[0].star_1) {
                            var update = 'wins=wins+1';

                            if (score < data[0].score) {
                                score = data[0].score;
                            }

                            query = "UPDATE game_user_score SET score=" + score + ", " + update +
                                " WHERE user_id=? and level_id=?";
                            mysql.query(query,[user_id, level_id], connection, function(res){
                                query = "UPDATE game_user_sessions SET session = '', level_id=0 " +
                                    "WHERE user_id=?";
                                mysql.query(query,[user_id], connection, function(){});

                                if (data[0].last_level < level_id){
                                    query = "UPDATE game_user_level SET level_id=? WHERE user_id=?";
                                    mysql.query(query, [level_id, user_id], connection, function(){});
                                    addLive(user_id, function(){
                                        callback('new_level');
                                    });
                                } else {
                                    addLive(user_id, function(){
                                        callback('ok');
                                    });
                                }
                            })
                        } else {
                            query = "UPDATE game_user_score SET fails=fails+1 " +
                                " WHERE user_id=? and level_id=?";
                            mysql.query(query,[user_id, level_id], connection, function(res){});
                            query = "UPDATE game_user_sessions SET session = '', level_id=0 " +
                                "WHERE user_id=?";
                            mysql.query(query,[user_id], connection, function(){});
                            callback('ok');
                        }
                    }
                });
            });
        }
    });
}

function minLive(user_id, callback){
    var query = "SELECT * FROM game_user_lives where user_id=?";
    mysql.query(query, [user_id], connection, function(data){
        updateUserLive(data[0], function(result){
            var date = new Date();
            var time = Math.floor(date.getTime() / 1000);

            query = "UPDATE game_user_lives SET lives=lives-1, date_update='" + time + "' " +
                "WHERE user_id=?";
            mysql.query(query, [user_id], connection, function(){
                callback('ok');
            });
        });
    });
}

User.prototype.maxLives =  function(user_id, callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);

    query = "UPDATE game_user_lives SET lives=5, date_update='" + time + "' " +
        "WHERE user_id=?";
    mysql.query(query, [user_id], connection, callback);
}

function addLive(user_id, callback){
    var query = "UPDATE game_user_lives SET lives=lives+1 WHERE user_id=?";
    mysql.query(query, [user_id], connection, callback);
}

function addGold(user_id, gold, callback){
    var query = "UPDATE game_user_gold SET amount=amount+? WHERE user_id=?";
    mysql.query(query, [gold, user_id], connection, callback);
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


User.prototype.getUserResources = function(social_id, callback){
    var query = "SELECT u.user_id, g.amount as gold, l.lives, l.date_update " +
        "from game_user as u " +
        "inner join game_user_gold as g using(user_id) " +
        "inner join game_user_lives as l using(user_id) " +
        "where social_id=?";
    mysql.query(query, [social_id], connection, function(data){
        if (data.length == 0){
            callback(101);
        } else {
            updateUserLive(data[0], callback);
        }
    });
}

User.prototype.getUser = function(social_id, user_sex, user_bdate, callback){
    var query = "SELECT u.user_id, u.social_id, u.sound, u.music, g.amount as gold, " +
        "l.lives, l.date_update " +
        "from game_user as u " +
        "inner join game_user_gold as g using(user_id) " +
        "inner join game_user_lives as l using(user_id) " +
        "where social_id=?";

    mysql.query(query, [social_id], connection, function(data){
        if (data.length == 0){
            console.log('Player is not exist');
            createNewUser(social_id, user_sex, user_bdate, function(res){
                var queryNew = "SELECT u.user_id, u.social_id, u.sound, u.music, g.amount as gold, " +
                    "l.lives, l.date_update " +
                    "from game_user as u " +
                    "inner join game_user_gold as g using(user_id) " +
                    "inner join game_user_lives as l using(user_id) " +
                    "where social_id=?";
                mysql.query(queryNew, [social_id], connection, function(dataNew){
                    updateUserLive(dataNew[0], callback);
                });
            });
        } else {
            updateLastActivity(data[0], function(data){
                updateUserLive(data, callback);
            });
        }
    });
}

User.prototype.getUserLevel = function(social_id, callback){
    var query = "SELECT user_id, level_id as level FROM game_user left join game_user_level " +
        "using(user_id) WHERE social_id=?";
    mysql.query(query, [social_id], connection, function(data){
        callback(data);
    });
}

User.prototype.addResource = function(user_id, amount, callback){
    if (typeof(amount) == 'number' && typeof(user_id) == 'number'){
        var query = "UPDATE game_user_gold SET amount=amount+" + amount + " WHERE user_id=?";
        mysql.query(query, [user_id], connection, callback);
    }
}

User.prototype.addPurchase = function(user, pack, transaction_id, callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    var order_id = 0;
    var query = "INSERT INTO game_payments (`order_id`, `user_id`, `pack_id`, `amount` , `price` , `date`, `level`, `transaction_id`) " +
        "VALUES (NULL, " + user.user_id + ", " + pack.id + ", " + pack.amount + ", " +
        "" + pack.price + ", " + time + ", " + user.level + ", " + transaction_id + ");";
    mysql.query(query, [], connection, function(){
        query = "SELECT max(order_id) as order_id FROM game_payments WHERE user_id=?";
        mysql.query(query, [user.user_id], connection, function(data){

            if (data.length > 0){
                order_id = data[0].order_id;
            }
            query = "UPDATE game_user SET payer='1' WHERE user_id=?";
            mysql.query(query, [user.user_id], connection, function(){});
            callback(order_id);
        })
    })
}

User.prototype.checkOrder = function(user_id, transaction_id, callback){
    var query = "SELECT * FROM game_payments WHERE transaction_id=? AND user_id=?";
    mysql.query(query, [user_id, transaction_id], connection, function(data){
        if (data.length == 0){
            callback(true);
        } else {
            callback(false);
        }
    })
}

function updateUserLive(data, callback){
    console.log('updating of user lives');
    data.refill = 0;
    var lives = data.lives;
    if (lives < CONST.MAX_LIVES){
        var date = new Date();
        var time = Math.floor(date.getTime() / 1000);
        var time_to_refill = time - data.date_update;
        var amount = Math.floor(time_to_refill / CONST.LIVE_REFILL);

        lives += amount;
        if (lives >= CONST.MAX_LIVES){
            lives = CONST.MAX_LIVES;
            time_to_refill = 0;
        } else {
            time_to_refill =  time_to_refill - amount * CONST.LIVE_REFILL;
        }

        data.time_to_refill = time_to_refill;
        data.lives = lives;
        delete data.date_update;

        if (amount > 0) {
            query = "UPDATE game_user_lives SET lives=" + lives + ", date_update='" + time + "'" +
                " WHERE user_id=?";

            mysql.query(query, [data.user_id], connection, function(result){
                callback(data);
            });
        } else {
            callback(data);
        }
    } else {
        delete data.date_update;
        callback(data);
    }
}

function updateLastActivity(data, callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    var query = "UPDATE game_user SET date_last_activity='" + time + "' WHERE user_id=?";
    mysql.query(query, [data.user_id], connection, function(){
        callback(data);
    });
}


function createNewUser(social_id, user_sex, user_bdate, callback){

    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);

    validUserData(user_sex, user_bdate, function(result){
        if (result.bdate === null) result.bdate = '';
        var query = "INSERT INTO game_user (`user_id`, `social_id`, `date_created`, `date_last_activity`, `payer`, `sound`, `music`, `sex`, `bdate`)" +
            " VALUES (NULL, '" + social_id + "', '" + time + "', '" + time + "', '0', '1', '1', '" + result.sex + "', '" + result.bdate + "') " +
            "ON DUPLICATE KEY UPDATE date_created='" + time + "'";

        mysql.query(query, [], connection, function(data){

            query = "SELECT user_id FROM game_user WHERE social_id=?";
            mysql.query(query, [social_id], connection, function(data){
                if (data.length != 0 && data[0].user_id > 0){

                    query = "INSERT INTO game_user_gold (`user_id`, `amount`) " +
                        "VALUES (" + data[0].user_id + ", " + CONST.USER_GOLD + ") " +
                        "ON DUPLICATE KEY UPDATE amount=" + CONST.USER_GOLD + "";
                    mysql.query(query, [], connection, function(res){

                        query = "INSERT INTO game_user_lives (`user_id`, `lives`, `date_update`) " +
                            "VALUES (" + data[0].user_id + ", " + CONST.MAX_LIVES + ", '" + time + "') " +
                            "ON DUPLICATE KEY UPDATE lives=" + CONST.MAX_LIVES + ", date_update='" + time + "'";
                        mysql.query(query, [], connection, function(res){

                            query = "INSERT INTO game_user_level (`user_id`, `level_id`) " +
                                "VALUES (" + data[0].user_id + ", 0) " +
                                "ON DUPLICATE KEY UPDATE user_id=0";
                            mysql.query(query, [], connection, function(res){

                                query = "INSERT INTO game_user_viral (`user_id`, `viral_id`, `status`) " +
                                    "VALUES (" + data[0].user_id + ", 1, 0) " +
                                    "ON DUPLICATE KEY UPDATE viral_id=1, status=0";
                                mysql.query(query, [], connection, function(res){
                                    callback('ok');
                                });
                            });
                        });
                    });
                }
            })
        });
    });

}

function validUserData(user_sex, user_bdate, callback){

    var result = {
        sex: 'n',
        bdate: ''
    }

    if (user_sex != ''){
        if (user_sex == 1){
            result.sex = 'f';
        } else if (user_sex == 2) {
            result.sex = 'm';
        }
    }
    if (user_bdate != null && user_bdate.length > 0 && user_bdate.length <= 10){
        result.bdate = user_bdate;
    } else {
        result.bdate = '';
    }
    callback(result);
}


function onSuccessQuery(data)
{
    console.log(data);
}

function scoreCalc(userMoves){
    var score = 0;

    for (var i = 0; i < userMoves.length; i++) {
        var increase = 0;
        var score_0 = 0;
        var score_1 = 0;
        var score_2 = 0;
        var score_3 = 0;
        var score_4 = 0;
        var score_5 = 0;
        var score_6 = 0;
        var score_7 = 0;
        var score_8 = 0;
        var score_9 = 0;
        var score_10 = 0;
        var score_11 = 0;
        var score_12 = 0;
        var score_13 = 0;
        var score_14 = 0;

        for (var j = 0; j < userMoves[i].length; j++) {
            switch(userMoves[i][j]) {
                case 0:
                    score_0++;
                    break;
                case 1:
                    score_1++;
                    break;
                case 2:
                    score_2++;
                    break;
                case 3:
                    score_3++;
                    break;
                case 4:
                    score_4++;
                    break;
                case 5:
                    score_5++;
                    break;
                case 6:
                    score_6++;
                    break;
                case 7:
                    score_7++;
                    break;
                case 8:
                    score_8++;
                    break;
                case 9:
                    score_9++;
                    break;
                case 10:
                    score_10++;
                    break;
                case 11:
                    score_11++;
                    break;
                case 12:
                    score_12++;
                    break;
                case 13:
                    score_13++;
                    break;
                case 14:
                    score_14++;
                    break;
            }
        }

        score += (score_0 + score_1) * 100;

        if (score_1 > 0) {
            score += 400;
        }

        for (var p = 0; p < (score_0 + score_1 + score_4 + score_5); p++) {
            if (p != 0 && p % 3 == 0) {
                increase++;
            }
            score += increase * 30;
        }

        score += score_2 * 50;
        score += score_3 * 50;
        score += score_4 * 5000;
        score += score_5 * 100;
        score += score_6 * 5000;
        score += score_8 * 50;
        score += score_9 * 1500;
        score += score_10 * 5000;
        score += score_11 * 500;
        score += score_12 * 5000;
        score += score_13 * 100;
        score += score_14 * 50;
    }
    return score;
}

function objectCalc(userMoves, goals){
    var userCollectObject = {};
    userCollectObject.ruby = 0;
    userCollectObject.bubble = 0;
    userCollectObject.sand = 0;
    userCollectObject.counter = 0;
    userCollectObject.ghost = 0;
    for (var i = 0; i < userMoves.length; i++) {
        for (var j = 0; j < userMoves[i].length; j++) {
            switch(userMoves[i][j]) {
                case 3:
                    userCollectObject.bubble++;
                    break;
                case 4:
                    userCollectObject.counter++;
                    break;
                case 12:
                    userCollectObject.counter++;
                    break;
                case 6:
                    userCollectObject.ruby++;
                    break;
                case 7:
                    userCollectObject.sand++;
                    break;
                case 8:
                    userCollectObject.ghost++;
                    break;
                case 14:
                    userCollectObject.bubble++;
            }
        }
    }
    goalSuccess = true;
    for (var p = 0; p < goals.length; p++) {

        if (goals[p].type == 'object') {
            if (goals[p].object_type == 'ruby') {
                if ((goals[p].count - userCollectObject.ruby) > 0 ) {
                    goalSuccess = false;
                }
            }

            if (goals[p].object_type == 'bubble') {
                if ((goals[p].count - userCollectObject.bubble) > 0 ) {
                    goalSuccess = false;
                }
            }

            if (goals[p].object_type == 'counter') {
                if ((goals[p].count - userCollectObject.counter) > 0 ) {
                    goalSuccess = false;
                }
            }

            if (goals[p].object_type == 'sand') {
                if ((goals[p].count - userCollectObject.sand) > 0 ) {
                    goalSuccess = false;
                }
            }

            if (goals[p].object_type == 'ghost') {
                if ((goals[p].count - userCollectObject.ghost) > 0 ) {
                    goalSuccess = false;
                }
            }
        }
    }
    return goalSuccess;
}

module.exports = User;