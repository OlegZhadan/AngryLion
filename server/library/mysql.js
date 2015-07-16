var mysql = require('mysql');
var dbconf = null;

function createConnect(conf){

    connection = mysql.createConnection(conf);

    if ((module.exports.connection) && (module.exports.connection._socket)
        && (module.exports.connection._socket.readable)
        && (module.exports.connection._socket.writable)) {
        return module.exports.connection;
    }
    console.log(((module.exports.connection) ?
        "UNHEALTHY SQL CONNECTION; RE" : "") + "CONNECTING TO SQL.");

    return connection;
}

exports.connectDB = function(conf){
    dbconf = conf;
    connection = createConnect(conf);
    connection.connect(function(err) {});
    connection.connectionState = true;
    return connection;
}


exports.closeConnect = function(connection){
    if (connection.connectionState === true) {
        connection.end();
        connection.connectionState = false;
        console.log('=DISCONNECT==');
    } else {
        console.log('= ! DISCONNECTED ! ==');
    }
}

exports.query = function(sql, inserts, connection, callback){
//    this.closeConnect(connection);
//    if (connection.connectionState === false) {
//        connection = this.connectDB(dbconf);
//    }
    var queryString = mysql.format(sql, inserts);
    var res = connection.query(queryString, function(err, result) {
        if (err) throw err;
        callback(result);
    });
};


