var mysql;
var connection;
var CONST;


function Gift(mysqlObject, mysqlConnection, constantsObject){
    mysql = mysqlObject;
    connection = mysqlConnection;
    CONST = constantsObject;
}


Gift.prototype.getGifts = function(user_id, callback){
    var query = "SELECT u.social_id, g.date, g.gift_id FROM game_user_gift_send as g inner join game_user as u " +
        "ON g.sender_id = u.user_id WHERE g.receiver_id=? and g.state='wait'";
    mysql.query(query, [user_id], connection, function(data){
        var gift = [];

        for (i = 0; i < data.length; i++){
            data[i].type = 'gift';
            gift.push(data[i]);
        }

        callback(gift);
    });
}

Gift.prototype.getKeys = function(user_id, callback){
    var query = "SELECT u.social_id, k.date, k.key_id FROM game_user_key_send as k inner join game_user as u " +
        "ON k.sender_id = u.user_id WHERE k.receiver_id=? and k.state='wait'";
    mysql.query(query, [user_id], connection, function(data){
        var key = [];

        for (i = 0; i < data.length; i++){
            data[i].type = 'key';
            key.push(data[i]);
        }

        callback(key);
    });
}

Gift.prototype.getGiftAsks = function(user_id, callback){
    var query = "SELECT u.social_id, s.date, s.gift_id FROM game_user_gift_ask as g inner join game_user as u " +
        "ON g.sender_id = u.user_id " +
        "LEFT JOIN game_user_gift_send as s ON g.sender_id=s.receiver_id and " +
        "s.sender_id=g.receiver_id WHERE g.receiver_id=?";
    mysql.query(query, [user_id], connection, function(data){
        var date = new Date();
        var midnight_date = date.setHours(0,0,0,0);
        var midnight = getTime(date);
        var asks = [];

        for (i = 0; i < data.length; i++){
            if (data[i].date < midnight){
                data[i].type = 'askGift';
                asks.push(data[i]);
            }
        }

        callback(asks);
    });
}

Gift.prototype.getKeyAsks = function(user_id, callback){
    var query = "SELECT u.social_id, s.date, s.key_id FROM game_user_key_ask as k inner join game_user as u " +
        "ON k.sender_id = u.user_id " +
        "LEFT JOIN game_user_key_send as s ON k.sender_id=s.receiver_id and " +
        "s.sender_id=k.receiver_id WHERE k.receiver_id=?";
    mysql.query(query, [user_id], connection, function(data){
        var date = new Date();
        var midnight_date = date.setHours(0,0,0,0);
        var midnight = getTime(date);
        var asks = [];

        for (i = 0; i < data.length; i++){
            if (data[i].date < midnight){
                data[i].type = 'askKey';
                asks.push(data[i]);
            }
        }

        callback(asks);
    });
}

Gift.prototype.askGift = function(user_id, friend_id, session_key, callback){

    checkFriends(friend_id, function(result){
        if (typeof(result) != 'number'){
            var date = new Date();
            var time = getTime(date);

            var query = "INSERT INTO game_user_gift_ask (`sender_id`, `receiver_id`, `date`) " +
                "VALUES  (" + user_id + ", " + result.user_id + ", " + time + ") " +
                "ON DUPLICATE KEY UPDATE date=" + time;

            mysql.query(query, [], connection, callback);

        } else {
            callback(result);
        }
    });

}

Gift.prototype.askGifts = function(user_id, friends, session_key, callback){
    var count = friends.length;
    for (key in friends) {
        checkFriends(friends[key], function (result) {
            if (typeof(result) != 'number') {
                var date = new Date();
                var time = getTime(date);

                var query = "INSERT INTO game_user_gift_ask (`sender_id`, `receiver_id`, `date`) " +
                    "VALUES  (" + user_id + ", " + result.user_id + ", " + time + ") " +
                    "ON DUPLICATE KEY UPDATE date=" + time;

                mysql.query(query, [], connection, function(){
                    count--;
                    if (count == 0) {
                        callback('ok');
                    }
                });

            } else {
                count--;
                if (count == 0) {
                    callback('ok');
                }
            }
        });
    }
}

Gift.prototype.askKeys = function(user_id, friends, session_key, callback){
    var count = friends.length;
    for (key in friends) {
        checkFriends(friends[key], function (result) {
            if (typeof(result) != 'number') {
                var date = new Date();
                var time = getTime(date);

                var query = "INSERT INTO game_user_key_ask (`sender_id`, `receiver_id`, `date`) " +
                    "VALUES  (" + user_id + ", " + result.user_id + ", " + time + ") " +
                    "ON DUPLICATE KEY UPDATE date=" + time;

                mysql.query(query, [], connection, function(){
                    count--;
                    if (count == 0) {
                        callback('send');
                    }
                });

            } else {
                count--;
                if (count == 0) {
                    callback('ok');
                }
            }
        });
    }
}

Gift.prototype.sendGift = function(user_id, friend_id, session_key, callback){
    checkFriends(friend_id, function(result){
        if (typeof(result) != 'number'){
            sendingGift(user_id, result.user_id, callback);
        } else {
            callback(result);
        }
    });
}

Gift.prototype.sendGifts = function(user_id, friends, session_key, callback){
    var count = friends.length;
    for (key in friends) {
        checkFriends(friends[key], function (result) {
            if (typeof(result) != 'number') {
                sendingGift(user_id, result.user_id, function(){
                    count--;
                    if (count == 0) {
                        callback('ok');
                    }
                });
            } else {
                count--;
                if (count == 0) {
                    callback('ok');
                }
            }
        });
    }
}

Gift.prototype.sendKeys = function(user_id, friends, session_key, callback){
    for (key in friends) {
        checkFriends(friends[key], function (result) {
            if (typeof(result) != 'number') {
                sendingKey(user_id, result.user_id, callback);
            } else {
                callback(result);
            }
        });
    }
}

Gift.prototype.acceptGift = function(user_id, gift_id, callback){
    var query = "SELECT * FROM game_user_gift_send WHERE receiver_id=? and gift_id=? and state='wait'";
    mysql.query(query, [user_id, gift_id], connection, function(data){
        if (data.length > 0){

            query = "UPDATE game_user_lives " +
                "SET lives=IF(lives<" + CONST.MAX_LIVES +", lives+1, lives) " +
                "WHERE user_id=?";

            mysql.query(query, [user_id], connection, function(res){
                query = "UPDATE game_user_gift_send SET state='accept' WHERE receiver_id=? and gift_id=?";
                mysql.query(query, [user_id, gift_id], connection, callback);
            })
        } else {
            callback(117);
        }
    })
}

Gift.prototype.acceptKey = function(user_id, param, callback){
    var query = "SELECT * FROM game_user_key_send WHERE sender_id=? and key_id=? and state='wait'";
    mysql.query(query, [param.friend_id, param.gift_id], connection, function(data){
        if (data.length > 0){

            var query = "SELECT level_id FROM game_user_level WHERE user_id=? ";
            mysql.query(query, [user_id], connection, function(userLevel){
                var query = "SELECT * FROM game_user_viral as uv " +
                    "inner join game_level_viral as lv on lv.viral_id = uv.viral_id " +
                    "WHERE uv.user_id=? and uv.status = 0 and lv.after_level_id=?";
                mysql.query(query, [user_id, userLevel[0].level_id], connection, function(data){
                    if (data.length > 0){

                        uniq = true;
                        column = '';
                        update = '';
                        if (data[0].friend_1 === null) {
                            column = 'friend_1';
                        } else if (data[0].friend_2 === null) {
                            if (data[0].friend_1 == param.friend_id) {
                                uniq = false;
                            }
                            column = 'friend_2';
                        } else if (data[0].friend_3 === null) {
                            if (data[0].friend_1 == param.friend_id || data[0].friend_2 == param.friend_id) {
                                uniq = false;
                            }
                            column = 'friend_3';
                            update = ', status = 1';
                        }

                        if (uniq === true) {
                            query = "UPDATE game_user_viral SET " + column + "= ? " + update + " WHERE viral_id = ? and user_id = ?";
                            mysql.query(query, [param.friend_id, data[0].viral_id, user_id], connection, function (res) {
                                query = "UPDATE game_user_key_send SET state='accept' WHERE receiver_id=? and key_id=?";
                                mysql.query(query, [user_id, param.gift_id], connection, function(res){
                                    var query = "INSERT INTO game_user_viral (`user_id`, `viral_id`, `status`) " +
                                        "VALUES (" + user_id + ", " + (data[0].viral_id+1) + ", 0) " +
                                        "ON DUPLICATE KEY UPDATE status=0";
                                    mysql.query(query, [], connection, callback);
                                });
                            })
                        } else {
                            query = "UPDATE game_user_key_send SET state='accept' WHERE receiver_id=? and key_id=?";
                            mysql.query(query, [user_id, param.gift_id], connection, callback);
                        }
                    } else {
                        query = "UPDATE game_user_key_send SET state='accept' WHERE receiver_id=? and key_id=?";
                        mysql.query(query, [user_id, param.gift_id], connection, callback);
                    }
                });
            });
        } else {
            callback(117);
        }
    })
}

Gift.prototype.acceptGiftAsk = function(user_id, friend_id, callback){
    var query = "SELECT u.user_id FROM game_user_gift_ask as g inner join game_user as u " +
        "ON u.user_id=g.sender_id and u.social_id=" + friend_id + " WHERE g.receiver_id=?";

    mysql.query(query, [user_id], connection, function(data){
        if (data.length > 0){
            sendingGift(user_id, data[0].user_id, function(result){
                if (typeof(result) != 'number'){
                    query = "DELETE FROM game_user_gift_ask WHERE receiver_id=? " +
                        "AND sender_id=?";
                    mysql.query(query, [user_id, data[0].user_id], connection, callback);
                } else {
                    callback(121);
                }
            });
        } else {
            callback(118);
        }
    });
}

Gift.prototype.acceptKeyAsk = function(user_id, social_id, friend_id, callback){
    var query = "SELECT u.user_id, g.sender_id FROM game_user_key_ask as g " + "" +
        "INNER JOIN game_user as u ON u.user_id=g.sender_id and u.social_id=" + friend_id + " " +
        "WHERE g.receiver_id=?";

    mysql.query(query, [user_id], connection, function(data){
        if (data.length > 0){
            sendingKey(user_id, social_id, data[0].sender_id, function(result){
                console.log(result);
                if (typeof(result) != 'number'){
                    console.log(user_id);
                    console.log(data[0].sender_id);
                    query = "DELETE FROM game_user_key_ask WHERE receiver_id=? " +
                        "AND sender_id=?";
                    mysql.query(query, [user_id, data[0].sender_id], connection, callback);
                } else {
                    callback(121);
                }
            });
        } else {
            callback(118);
        }
    });
}

function sendingGift(user_id, friend_id, callback){
    var date = new Date();
    var time = getTime(date);
    var midnight_date = date.setHours(0,0,0,0);
    var midnight = getTime(date);

    var query = "SELECT * FROM game_user_gift_send WHERE receiver_id=?" +
        " AND sender_id=? AND date<? AND state = 'wait'";

    mysql.query(query, [friend_id, user_id, midnight], connection, function(data){

        if (data.length > 0){

            var query = "UPDATE game_user_gift_send SET date = " + time +
            " WHERE receiver_id=?" +
                " AND sender_id=? AND state = 'wait'";

            mysql.query(query, [friend_id, user_id], connection, callback);

        } else {

            var query = "SELECT * FROM game_user_gift_send WHERE receiver_id=?" +
                " AND sender_id=? AND date>=?";

            mysql.query(query, [friend_id, user_id, midnight], connection, function (data) {

                if (data.length > 0) {
                    callback(116);
                } else {
                    query = "INSERT INTO game_user_gift_send (`gift_id`, `sender_id`, `receiver_id`, `date`, `state`) " +
                        "VALUES  (NULL, " + user_id + ", " + friend_id + ", " + time + ", 'wait');"

                    mysql.query(query, [], connection, callback);
                }
            })
        }
    })

}

function sendingKey(user_id, social_id, friend_id, callback){
    var query = "SELECT level_id FROM game_user_level WHERE user_id=? ";
    mysql.query(query, [friend_id], connection, function(userLevel){
        var query = "SELECT * FROM game_user_viral as uv " +
            "inner join game_level_viral as lv on lv.viral_id = uv.viral_id " +
            "WHERE uv.user_id=? and uv.status = 0 and lv.after_level_id=?";
        mysql.query(query, [friend_id, userLevel[0].level_id], connection, function(data){
            if (data.length > 0){

                uniq = true;
                column = '';
                update = '';
                if (data[0].friend_1 === null || data[0].friend_1 === 0) {
                    column = 'friend_1';
                } else if (data[0].friend_2 === null || data[0].friend_2 === 0) {
                    if (data[0].friend_1 == social_id) {
                        uniq = false;
                    }
                    column = 'friend_2';
                } else if (data[0].friend_3 === null || data[0].friend_3 === 0) {
                    if (data[0].friend_1 == social_id || data[0].friend_2 == social_id) {
                        uniq = false;
                    }
                    column = 'friend_3';
                    update = ', status = 1';
                }

                if (uniq === true) {
                    query = "UPDATE game_user_viral SET " + column + " = ? " + update + " WHERE viral_id = ? and user_id = ?";
                    console.log('=====');
                    console.log(query);
                    console.log('=====');
                    mysql.query(query, [social_id, data[0].viral_id, friend_id], connection, function(res){
                        var query = "INSERT INTO game_user_viral (`user_id`, `viral_id`, `status`) " +
                            "VALUES (" + friend_id + ", " + (data[0].viral_id+1) + ", 0) " +
                            "ON DUPLICATE KEY UPDATE status=0";
                        mysql.query(query, [], connection, function(){
                            callback('ok');
                        });
                    })
                } else {
                    callback('ok');
                }
            } else {
                callback('ok');
            }
        })
    })
}

function getTime(date){
    return Math.floor(date.getTime() / 1000);
}

function checkFriends(friend_id, callback){
    var query = "SELECT user_id FROM game_user WHERE social_id = '" + friend_id + "'";
    mysql.query(query, [], connection, function(data){
        if (data.length > 0){
            callback(data[0]);
        } else {
            callback(112);
        }
    })
}

module.exports = Gift;
