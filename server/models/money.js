var mysql;
var connection;

function Money(mysqlObject, mysqlConnection){
	mysql = mysqlObject;
	connection = mysqlConnection;
}

Money.prototype.getMoneyPacks = function(callback){
    var date = new Date();
    var time = Math.floor(date.getTime() / 1000);
    var midnight_date = date.setHours(0,0,0,0);
    var t1 = date.getTime();
    var t2 = t1 + 24*3600;

    var query = "SELECT m.pack_id as id, m.amount, m.price, bonus, date_start, date_end " +
        "FROM game_shop_items as m LEFT JOIN game_shop_items_offer as o " +
        "on m.pack_id=o.pack_id and o.date_start<" + t1 + " and o.date_end>" + t2 + " " +
        "where active='true'";
    mysql.query(query, [], connection, function(data){

        for (i = 0; i < data.length; i++){
            data[i].time_to_end = 0;

            if (data[i].bonus == null){
                data[i].bonus = 0;
            }

            if (time < data[i].date_end && time > data[i].date_start){
                data[i].time_to_end = data[i].date_end - time;
            } else {
                data[i].bonus = 0;
            }
            delete data[i].date_start;
            delete data[i].date_end;

        }

        callback(data)
    });
}

Money.prototype.getPack = function(object_id, callback){
    if (object_id > 0){
        var date = new Date();
        var time = Math.floor(date.getTime() / 1000);
        var t1 = date.getTime();
        var t2 = t1 + 24*3600;

        var query = "SELECT m.pack_id as id, m.amount, m.price, bonus, date_start, date_end " +
            "FROM game_shop_items as m LEFT JOIN game_shop_items_offer as o " +
            "on m.pack_id=o.pack_id and o.date_start<" + t1 + " and o.date_end>" + t2 + " " +
            "where active='true' and m.pack_id=?";
        mysql.query(query, [object_id], connection, function(data){
            if (data.length > 0){

                if (time > data[0].date_end || time < data[0].date_start || data[0].bonus == null){
                    data[0].bonus = 0;
                }

                data[0].amount += data[0].bonus;

                delete data[0].bonus;
                delete data[0].date_start;
                delete data[0].date_end;

                callback(data);
            } else {
                callback();
            }

        });
    } else {
        callback();
    }

}

module.exports = Money;
