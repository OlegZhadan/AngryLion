var mysql;
var connection;
var pack = 1000;

function Notif(mysqlObject, mysqlConnection){
    mysql = mysqlObject;
    connection = mysqlConnection;
}

function getActiveNotif(callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);

    // get active notification today
    var query = "SELECT notification_id, notification, date_start, date_end FROM game_notification WHERE active='true' " +
        " ORDER BY notification_id ASC";

    mysql.query(query, [], connection, function(data){

        if (data.length > 0){
            var notifications = [];
            var ids = [];
            for (i = 0; i < data.length; i++){
                if (data[i].date_start < time && data[i].date_end > time){
                    delete data[i].date_start;
                    delete data[i].date_end;
                    notifications.push(data[i]);
                    ids.push(data[i].notification_id);
                }
            }

            lastSentNotif(ids, function(result){
                if (result.length > 0){

                    getLastActiveUser(function(last_active_user){
                        var active_notif = 0;
                        var notif_count = notifications.length;
                        for (i = 0; i < notifications.length; i++){
                            if (notifications[i].notification_id == result[0].id_notif){
                                active_notif = i;
                            }
                        }

                        if (last_active_user > result[0].last_user_id){
                            result = {
                                notif: notifications[active_notif],
                                first_user: result[0].last_user_id
                            }
                            callback(result);
                        } else {
                            if (notif_count-1 > active_notif){
                                result = {
                                    notif: notifications[active_notif + 1],
                                    first_user: 0
                                }
                                callback(result);
                            } else {
                                result = {
                                    notif: notifications[0],
                                    first_user: 0
                                }
                                callback(result);
                            }
                        }
                    });
                } else {
                    if (notifications.length > 0){
                        result = {
                            notif: notifications[0],
                            first_user: 0
                        }
                        callback(result);
                    } else {
                        callback();
                    }
                }
            })
        } else {
            callback();
        }
    })
}

function getLastActiveUser(callback){
    var date = new Date();
    var midnight_date = date.setHours(0,0,0,0);
    var midnight = Math.floor(date.getTime() / 1000);
    var query = "SELECT user_id FROM game_user WHERE date_created<" + midnight + " ORDER BY user_id DESC LIMIT 1;";
    mysql.query(query, [], connection, function(data){
        var user_id = data[0].user_id
        callback(user_id);
    });
}

function getActiveUsers(first_id, callback){
    var date = new Date();
    var midnight_date = date.setHours(0,0,0,0);
    var midnight = Math.floor(date.getTime() / 1000);
    var vkTimeRestriction = midnight - 2592000; // 1 Month

    var query = "SELECT user_id, social_id FROM game_user WHERE date_last_activity > " + vkTimeRestriction + " AND " +
        " user_id > " + first_id + " ORDER BY user_id ASC LIMIT " + pack + ";";
    mysql.query(query, [], connection, function(data){
        var count = data.length;
        var users = [];
        if (count > 0){
            var last_id = data[count-1].user_id;
            for (i = 0; i < count; i++){
                users.push(data[i].social_id);
            }
            result = {
                users: users,
                last_user: last_id
            }
            callback(result);
        } else {
            callback();
        }
    });
}

function lastSentNotif(ids, callback){
    var query = "SELECT id_notif, last_user_id FROM game_notification_sent " +
        "WHERE id_notif in (" + ids + ") ORDER BY date DESC LIMIT 1;";
    mysql.query(query, [], connection, callback);
}


Notif.prototype.getUsers = function(callback){
    console.log('sendNotif');
    getActiveNotif(function(notif){
        if (typeof(notif) == 'object'){
            getActiveUsers(notif.first_user, function(res){
                console.log(res);
                saveResult(notif.notif.notification_id, res.last_user, function(res){});
                result = {
                    text: notif.notif.notification,
                    users: res.users
                }
                callback(result);
            });
        } else {
            callback();
        }

    });

}

function saveResult(notif_id, last_user, callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    var query = "INSERT INTO game_notification_sent (id_notif, date, last_user_id) " +
        "VALUES (" + notif_id + ", " + time + ", " + last_user + ")";
    mysql.query(query, [], connection, callback);
}

module.exports = Notif;