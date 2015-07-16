var http = require('http');

var CONST = require('../library/const');
var mysql = require('../library/mysql');
var tools = require('../library/tools');
var application = require('../library/application');
var VK = require('../library/vk');
var notifObject = require('../models/notification');

var responseData = {};
var connection = "";
var headers = "local";
var pack_vk = 100;

function buildResult(response){
    var resultData = JSON.stringify(responseData);
    response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': resultData.length
    });
    response.write(resultData);
    response.end();
}


function sendNotif(callback){
    var app = new application(headers);
    if (app.get()){
        var dbconf = app.getDbconf();
        connection = mysql.connectDB(dbconf);
        var notif = new notifObject(mysql, connection);
        notif.getUsers(function(result){
            if (result != undefined){
                if (result.hasOwnProperty('users')){
                    var count = Math.ceil(result.users.length / pack_vk);
                    console.log('result.users.length: ' + result.users.length);
                    console.log('count: ' + count);
                    var snconf = app.getSNconf();
                    var vk = new VK(snconf);
                    var arr2 = [];
                    var first = 0;
                    var i = 0;

                    var timer = setInterval(function () {
                        if (i == count){
                            clearInterval(timer);
                        }

                        first = i * pack_vk;
                        arr2 = result.users.slice(first, first + pack_vk);
                        console.log(arr2.join());
                        vk.sendNotification(arr2.join(), result.text, function(error, response, body) {});

                        i++;
                    }, 2000)
                }
            }
        });

    } else {
        callback();
    }
}

function onRequest(request, response) {
    headers = request.headers;
    sendNotif(function(res){
        buildResult(response);
    })
}

sendNotif(function(res){
    console.log('sent');
})

//http.createServer(onRequest).listen(2020);
//var serverConnect = http.createServer(onRequest).listen(2100, '127.0.0.1');
