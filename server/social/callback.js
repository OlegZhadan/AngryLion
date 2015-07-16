var http = require('http');
var querystring = require('querystring');

var CONST = require('../library/const');
var mysql = require('../library/mysql');
var tools = require('../library/tools');
var application = require('../library/application');
var moneyObject = require('../models/money');
var userObject = require('../models/user');

var responseData = {};

var connection = "";

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e6) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = querystring.parse(queryData);
            callback();
        });
    }
}

function saveError(error, msg){
    responseData.error = {
        error_code: error,
        error_msg: msg,
        critical: true
    }
}

function getResult(post, callback){

    var money = new moneyObject(mysql, connection);

    switch (post.notification_type) {
        case 'get_item':
        case 'get_item_test':
            money.getMoneyPacks(function(moneyData){
                var item = post.item; // item name
                var not_found = true;
                var item_db = '';

                for (i = 0; i < moneyData.length; i++){
                    item_db = 'item_' + moneyData[i].id;
                    if (item == moneyData[i].id){
                        not_found = false;

                        var test_mode = "";
                        if (post.notification_type == 'get_item_test'){
                            test_mode += " (test mode)";
                        }

                        responseData.response = {
                            item_id: moneyData[i].id,
                            title: moneyData[i].amount + " MOHET" + test_mode,
                            photo_url: 'https://mables.timcatstudio.com/assets/sprites/IconCoins.jpg?1',
                            //		price: moneyData[i].amount + moneyData[i].bonus
                            price: moneyData[i].price
                        }
                    }
                }

                if (not_found){
                    saveError(20, 'Item is not exist');
                }
                callback();
            });

            break;

        case 'order_status_change':
        case 'order_status_change_test':
            if (post.status == 'chargeable'){

                var order_id = post.order_id; /// intval
                var app_order_id = 0;
                var error = 0;
                var object_id = post.item_id;
                var obj = {};

                var item_array = post.item.split('_');

                money.getPack(object_id, function(pack){
                    if (pack.length > 0){
                        obj = pack[0];
                    } else {
                        if (item_array[0] == 'offer'){
                            //integration will have conversion 0

                            var conv = 3; // + Math.floor(post.item_price / 10);
                            obj = {
                                amount: conv * post.item_price,
                                price: post.item_price,
                                id: item_array[1]
                            }
                        } else {
                            saveError(20, 'Item is not exist');
                            callback();
                        }
                    }

                    if (obj.price == post.item_price){
                        user = new userObject(mysql, connection, CONST);
                        user.getUserLevel(post.user_id, function(user_data) {
                            if (user_data.length > 0){
                                user.checkOrder(user_data[0].user_id, order_id, function(res){
                                    if (res){
                                        user.addResource(user_data[0].user_id, obj.amount, function(res){
                                            user.addPurchase(user_data[0], obj, order_id, function(order){
                                                responseData.response = {
                                                    order_id: order_id,
                                                    app_order_id: order
                                                }
                                                callback();
                                            })
                                        });
                                    } else {
                                        saveError(1, 'Duplicated order');
                                        callback();
                                    }
                                })

                            } else {
                                saveError(501, 'Wrong user');
                                callback();
                            }
                        })
                    } else {
                        saveError(500, 'Wrong price');
                        callback();
                    }
                })
            } else {
                saveError(11, 'Wrong status');
                callback();
            }
            break;
        default:
            saveError(11, 'Wrong type of notification');
            callback();
            break;
    }
}

function buildResult(response){
    var resultData = JSON.stringify(responseData);
    response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': resultData.length
    });
    response.write(resultData);
    response.end();
}

function onRequest(request, response) {
    responseData = {};

    if(request.method == 'POST') {
        processPost(request, response, function() {
            var app = new application(request.headers);

            if (app.get()){
                var snconf = app.getSNconf();
                var sig = request.post.sig;
                delete request.post.sig;

                tools.checkSignature(request.post, snconf.secret_key, sig, true, function(result){
                    if (result){
                        var dbconf = app.getDbconf();
                        mysql.connectDB(dbconf, function(connectDB) {
                            connection = connectDB;
                            getResult(request.post, function (result) {
                                buildResult(response);
                            });
                        });

                    } else {
                        saveError(10, 'Wrong signature');
                        buildResult(response);
                    }
                })
            } else {
                saveError(2, 'Wrong configuration');
                buildResult(response);
            }

        });
    } else {
        saveError(502, 'Post is empty');
        buildResult(response);
    }
}

http.createServer(onRequest).listen(4788);
//var serverConnect = http.createServer(onRequest).listen(2035, '127.0.0.1');
