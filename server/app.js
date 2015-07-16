var http = require('http');
var url = require('url');
var request = require('request');
var querystring = require('querystring');
//var Memcached = require('memcached');

var tools = require('./library/tools');
var CONST = require('./library/const');
var mysql = require('./library/mysql');
var application = require('./library/application');
var userObject = require('./models/user');
var levelObject = require('./models/level');
var gameObjects = require('./models/objects');
var moneyObject = require('./models/money');
var giftObject = require('./models/gifts');
var sessionObject = require('./models/session');
var friendObject = require('./models/friends');
var index = require('./routes/index.js');
var fs = require('fs');

//var banObject = require('./models/ban');

var user = {};

var responseData = {error: 0};
//124

var connection = "";
var queriesCount = 0;
var snconf = null;

var user_id = 0;
var session_key = "";

/**
 *  client data
 */

//var social_id = 100;
//var user_sex = 1;
//var user_bdate = '20.01.1965';

/**
 * end client data
 */

// work
function getDataStart(social_id, user_sex, user_bdate, callback){
    user = new userObject(mysql, connection, CONST);
    user.getUser(social_id, user_sex, user_bdate, function(result){onGetUserSuccessResult(result, callback);});
}

//work
function getMapLevels(callback){
    queriesCount++;
    var level = new levelObject(mysql, connection, CONST);
    level.getMapLevelArr(function(result){onGetUsualSuccessResult(result, callback);});
}

//work
function getGameObjects(callback){
    queriesCount++;
    var level = new levelObject(mysql, connection, CONST);
    level.getGameObjects(function(result){onGetUsualSuccessResult(result, callback);});
}

//work
function getLevelByID(social_id, level_id, callback){
    queriesCount++;
    var level = new levelObject(mysql, connection, CONST);
    level.getLevelByID(social_id, level_id, function(result){onGetLevelSuccessResult(result, callback);});
}

//work
function getUserLevels(social_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserLevels(social_id, function(result){onGetUsualSuccessResult(result, callback)});
}

//work
function getDataFriends(friends, callback){
    queriesCount++;
    var friend = new friendObject(mysql, connection);
    friend.getFirendLevels(friends, function(result){onGetUsualSuccessResult(result, callback)});
}

//work
function getFriendScore(level_id, friends, callback){
    queriesCount++;
    var friend = new friendObject(mysql, connection);
    friend.getFriendScore(level_id, friends, function(result){onGetUsualSuccessResult(result, callback)});
}

//work
function getDataLevel(social_id, level_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    console.log(social_id);
    user.getUserResources(social_id, function(data){
        if (typeof(data) != 'number'){
            user_id = data.user_id;
            console.log('lives: ' + data.lives);
            if (data.lives <= 0) {
                queriesCount = 0;
                responseData.error = 104;
                callback();
            } else {
                var level = new levelObject(mysql, connection);
                level.getUserCurrentLevel(user_id, function(result){
                    if (level_id <= result+1) {
                        level.getLevelByID(user_id, level_id, function(result){onGetLevelSuccessResult(result, callback);});
                    } else {
                        queriesCount = 0;
                        responseData.error = 266;
                        callback();
                    }
                });
            }
        } else {
            queriesCount = 0;
            responseData.error = data;
            callback();
        }
    });
}

//work
function getAllLevels(social_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data){
        if (typeof(data) != 'number'){
            user_id = data.user_id;
            var level = new levelObject(mysql, connection);
            level.getAllLevels(user_id, function(result){onGetAllLevelSuccessResult(result, callback);});
        } else {
            queriesCount = 0;
            responseData.error = data;
            callback();
        }
    });
}

function openViralXP(social_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data){
        if (typeof(data) != 'number'){
            user_id = data.user_id;
            var level = new levelObject(mysql, connection);
            level.setViralXP(user_id, function(result){onGetUsualSuccessResult(result, callback);});
        } else {
            queriesCount = 0;
            responseData.error = data;
            callback();
        }
    });
}

function openViralCoins(social_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data){
        if (typeof(data) != 'number'){
            user_id = data.user_id;
            var level = new levelObject(mysql, connection);
            level.setViralCoins(user_id, function(result){onGetUsualSuccessResult(result, callback);});
        } else {
            queriesCount = 0;
            responseData.error = data;
            callback();
        }
    });
}

function saveLevelResult(social_id, level_id, user_data, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data){
        user_id = data.user_id;
        console.log('start save data for user');
        user.finishLevel(user_id, level_id, user_data, session_key, function(result) {
            if (typeof(data) == 'number') {
                onGetUsualSuccessResult(result, callback);
            } else {
                if (result == 'new_level') {
                    setUserLevel(social_id, level_id);
                }
                result = 'ok';
                onGetUsualSuccessResult(result, callback);
            }
        })
    });
}

function sendNotificationGift(social_id, friend_id){
    getToken(function(result){
        msg = 'Я подарил тебе жизнь. Скорее запускай игру, чтобы получить её!';
        var url = "https://api.vk.com/method/secure.sendNotification?user_ids=" + friend_id + "&user_id=" + social_id + "&message=" + msg +
            "&client_secret=" + snconf.secret_key + "&access_token=" + result;
        console.log(url);
        request(url, function(error, response, body) {});
    })
}

function sendNotificationKeyAsk(social_id, friends){
    getToken(function(result){
        msg = 'Мне нужна твоя помощь, чтобы продолжить путешествие! Заходи в игру';
        var url = "https://api.vk.com/method/secure.sendNotification?user_ids=" + friends.join() + "&user_id=" + social_id + "&message=" + msg +
            "&client_secret=" + snconf.secret_key + "&access_token=" + result;
        console.log(url);
        request(url, function(error, response, body) {});
    })
}

function setUserLevel(social_id, level){
    getToken(function(result){
        var url = "https://api.vk.com/method/secure.setUserLevel?user_id=" + social_id + "&level=" + level +
            "&client_secret=" + snconf.secret_key + "&access_token=" + result;
        console.log(url);
        request(url, function(error, response, body) {});
    });
}

function getToken(callback){
    var url = "https://oauth.vk.com/access_token?client_id=" + snconf.api_id
        + "&client_secret=" + snconf.secret_key + "&v=5.30&grant_type=client_credentials";

    request(url, function(error, response, body) {
        var result = JSON.parse(body);
        if (result.hasOwnProperty('access_token')){
            callback(result.access_token);
        } else {
            callback();
        }
    });
}

function saveMusic(social_id, music, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.saveMusic(social_id, music, function(result) {
        onGetUsualSuccessResult(result, callback);
    });
}

function saveSound(social_id, sound, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.saveSound(social_id, sound, function(result) {
        onGetUsualSuccessResult(result, callback);
    });
}

function saveUserScore(social_id, score, level_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data) {
        user_id = data.user_id;
        user.saveUserScore(user_id, score, level_id, function (result) {
            onGetUsualSuccessResult(result, callback);
        });
    });
}

function saveSpecialOffer(social_id, share, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data) {
        user_id = data.user_id;
        user.saveSpecialOffer(user_id, share, function (result) {
            onGetSuccessResult(result, callback);
        });
    });
}

function completeSpecialOffer(social_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data) {
        user_id = data.user_id;
        user.completeSpecialOffer(user_id, function (result) {
            onGetSuccessResult(result, callback);
        });
    });
}

function inAppPurchase(social_id, type, coins, level_id, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data){
        user_id = data.user_id;
        if (type == 'heart') {
            user.maxLives(user_id, function(res){
                user.inAppPurchase(user_id, type, coins, level_id, function(result) {
                    onGetUsualSuccessResult(result, callback);
                })
            });
        } else if (type == 'move') {
            user.startLevelMoreMoves(user_id, level_id, session_key, function(){
                user.inAppPurchase(user_id, type, coins, level_id, function(result) {
                    onGetUsualSuccessResult(result, callback);
                })
            });
        } else {
            user.inAppPurchase(user_id, type, coins, level_id, function(result) {
                onGetUsualSuccessResult(result, callback);
            })
        }
    });
}

function giftAction(social_id, object_id, action, callback){
    queriesCount++;
    user = new userObject(mysql, connection, CONST);
    user.getUserResources(social_id, function(data){
        user_id = data.user_id;
        var gift = new giftObject(mysql, connection, CONST);

        switch (action) {
            case 'sendGift':
                gift.sendGift(user_id, object_id, session_key, function(data){
                    sendNotificationGift(social_id, object_id);
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'sendGifts':
                gift.sendGifts(user_id, object_id, session_key, function(data){
                    sendNotificationGift(social_id, object_id);
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'askGift':
                gift.askGift(user_id, object_id, session_key, function(data){
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'askGifts':
                gift.askGifts(user_id, object_id, session_key, function(data){
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'askKeys':
                gift.askKeys(user_id, object_id, session_key, function(data){
                    if (data == 'send') {
                        sendNotificationKeyAsk(social_id, object_id);
                    }
                    data = 'ok';
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'acceptGift':
                gift.acceptGift(user_id, object_id, function(data){
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'acceptKey':
                gift.acceptKey(user_id, object_id, function(data){
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'acceptGiftAsk':
                gift.acceptGiftAsk(user_id, object_id, function(data){
                    sendNotificationGift(social_id, object_id);
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            case 'acceptKeyAsk':
                gift.acceptKeyAsk(user_id, social_id, object_id, function(data){
                    onGetUsualSuccessResult(data, callback);
                });
                break;
            default:
                queriesCount = 0;
                responseData.error = 120;
                callback();
                break;
        }
    })
}

function onGetUsualSuccessResult(data, callback){
    queriesCount--;
    if (typeof(data) == 'number'){
        queriesCount = 0;
        responseData.error = data;
        callback();
    } else {
        if (data.length > 0){
            responseData.result = data;
        } else {
            responseData.result = 'ok';
        }
        callback();
    }
}

function onGetSuccessResult(data, callback){
    queriesCount--;
    if (typeof(data) == 'number'){
        queriesCount = 0;
        responseData.error = data;
        callback();
    } else {
        if (data === true){
            responseData.result = 1;
        } else if (data === false){
            responseData.result = false;
        } else {
            responseData.result = 'ok';
        }
        callback();
    }
}

function onGetAllLevelSuccessResult(data, callback){
    if (typeof(data) == 'number'){
        queriesCount = 0;
        responseData.error = data;
        callback();
    } else {
        user = new userObject(mysql, connection, CONST);
        user.startLevel(user_id, data[0].level_id, session_key, function(){
            queriesCount--;
            if (data.length > 0){
                responseData.result = data;
            } else {
                responseData.result = 'ok';
            }
            callback();
        });
    }
}

function onGetLevelSuccessResult(data, callback){
    if (typeof(data) == 'number'){
        queriesCount = 0;
        responseData.error = data;
        callback();
    } else {
        user = new userObject(mysql, connection, CONST);
        user.startLevel(user_id, data[0].level_id, session_key, function(res){
            queriesCount--;
            if (data.length > 0){
                responseData.result = data;
            } else {
                responseData.result = 'ok';
            }
            callback();
        });
    }
}

function onGetUserSuccessResult(userData, callback){

    var level = new levelObject(mysql, connection);
    var objects = new gameObjects(mysql, connection);
    var money = new moneyObject(mysql, connection);
    var gift = new giftObject(mysql, connection, CONST);
    var user = new userObject(mysql, connection, CONST);

    user_id = userData.user_id;
    delete userData.user_id;

    userData.max_lives = CONST.MAX_LIVES;
    userData.restore_time = CONST.LIVE_REFILL;
    responseData.user = userData;
    queriesCount = 10;

    level.getAllLevels(user_id, function(result){
        queriesCount--;
        responseData.levels = result;
        callback();
    });

    user.getSpecialOffer(user_id, function(result){
        queriesCount--;
        responseData.special_offer = result;
        callback();
    });

    level.getUserCurrentLevel(user_id, function(result){
        queriesCount--;
        responseData.level_current = result;
        callback();
    });

    objects.getGameObjects(function(result){
        queriesCount--;
        responseData.objects = result;
        callback();
    });

    level.getViralBlocks(user_id, function(result){
        queriesCount--;
        responseData.viral_blocks = result;
        callback();
    });

    money.getMoneyPacks(function(result){
        queriesCount--;
        responseData.shop_items = result;
        callback();
    });

    gift.getGifts(user_id, function(result){
        queriesCount--;
        responseData.gifts = result;
        callback();
    });

    gift.getGiftAsks(user_id, function(result){
        queriesCount--;
        responseData.gift_asks = result;
        callback();
    });

    gift.getKeys(user_id, function(result){
        queriesCount--;
        responseData.keyz = result;
        callback();
    });

    gift.getKeyAsks(user_id, function(result){
        queriesCount--;
        responseData.key_asks = result;
        callback();
    });
}

function selectMethod(method, post, callback){
    switch (method) {

        case 'getLevelByID':{
            var social_id = post.social_id;
            var level_id = post.level_id;
            getLevelByID(social_id, level_id, callback);
            break;
        }

        case 'getUserLevels':{
            var social_id = post.social_id;
            getUserLevels(social_id, callback);
            break;
        }



        case 'getDataLevel':{
            var social_id = post.social_id;
            var level_id = post.level_id;
            getDataLevel(social_id, level_id, callback);
            break;
        }

        case 'getMapLevels':{
            getMapLevels(callback);
            break;
        }

        case 'getAllLevels':{
            var social_id = post.social_id;
            getAllLevels(social_id, callback);
            break;
        }

        case 'getGameObjects':{
            getGameObjects(callback);
            break;
        }

        case 'openViralXP':{
            var social_id = post.social_id;
            openViralXP(social_id, callback);
            break;
        }

        case 'openViralCoins':{
            var social_id = post.social_id;
            openViralCoins(social_id, callback);
            break;
        }

        case 'getDataFriends':{
            var friends = post.friends;
            getDataFriends(friends, callback)
            break;
        }

        case 'getFriendScore':{
            var level_id = post.level_id;
            var friends = post.friends;
            getFriendScore(level_id, friends, callback);
            break;
        }

        case 'saveLevelResult':{
            var social_id = post.social_id;
            var level_id = post.level_id;
            var user_data = {
                score: post.score,
                userMoves: post.userMoves
            };
            saveLevelResult(social_id, level_id, user_data, callback);
            break;
        }

        case 'saveMusic':{
            var social_id = post.social_id;
            var music = post.music;
            saveMusic(social_id, music, callback);
            break;
        }

        case 'saveSound':{
            var social_id = post.social_id;
            var sound = post.sound;
            saveSound(social_id, sound, callback);
            break;
        }

        case 'inAppPurchase':{
            var social_id = post.social_id;
            var type = post.type;
            var coins = post.coins;
            var level_id = post.level_id;
            inAppPurchase(social_id, type, coins, level_id, callback);
            break;
        }

        case 'saveUserScore':{
            var social_id = post.social_id;
            var score = post.score;
            var level_id = post.level_id;
            saveUserScore(social_id, score, level_id, callback);
            break;
        }

        case 'saveSpecialOffer':{
            var social_id = post.social_id;
            var share = post.share;
            saveSpecialOffer(social_id, share, callback);
            break;
        }

        case 'completeSpecialOffer':{
            var social_id = post.social_id;
            completeSpecialOffer(social_id, callback);
            break;
        }

        case 'sendGift':
        case 'sendGifts':
        case 'acceptGift':
        case 'acceptKey':
        case 'askGift':
        case 'askGifts':
        case 'askKeys':
        case 'acceptGiftAsk':
        case 'acceptKeyAsk':
        {
            var social_id = post.social_id;
            var param = post.friend_id;
            if (method == 'acceptGift'){
                param = post.gift_id;
            } else if (method == 'acceptKey'){
                param = {
                    friend_id: post.friend_id,
                    gift_id: post.gift_id
                };
            }
            giftAction(social_id, param, method, callback);
            break;
        }

        default:
            callback();
            break;
    }
}

function checkConf(result, callback){
    if (result){
        callback(true);
    } else {
        responseData.error = 100;
        callback(false);
    }
}

function buildResult(response){
    if(queriesCount > 0)
    {
        return;
    }
    var resultData = JSON.stringify(responseData);
    mysql.closeConnect(connection);

    console.log("Result Data: " + resultData);
    response.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Length': resultData.length,
        'Access-Control-Allow-Origin': '*'
    });
    response.write(resultData);
    response.end();
}

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
            request.post = JSON.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

function onRequest(request, response) {
    responseData = {error: 0};
    if(request.method == 'POST') {
        processPost(request, response, function() {

            var post = request.post;
            var social_id = post.social_id;
            var method = post.method;
            var app = new application(request.headers);
            console.log('METHOD: ' + method);
            if (checkConf(app.get(), function (result) {
                if (result) {
                    var dbconf = app.getDbconf();
                    snconf = app.getSNconf();
                    connection = mysql.connectDB(dbconf);

                    var session = new sessionObject(mysql, connection);

                    if (method == 'getDataStart') {
                        session.start(social_id, function (data) {
                            responseData.session_key = data;

                            var user_sex = post.user_sex;
                            var bdate = post.user_bdate;
                            getDataStart(social_id, user_sex, bdate, function () {
                                buildResult(response);
                            });


                        });
                    } else {
                        session_key = post.session_key;
                        session.validKey(social_id, session_key, function (result) {
                            if (result == true) {
                                var sig = post.hash;
                                delete post.session_key;
                                delete post.hash;

                                tools.checkSignature(post, session_key, sig, true, function (result) {
                                    if (result == true) {
                                        selectMethod(method, post, function () {
                                            buildResult(response);
                                        });
                                    } else {
                                        onGetUsualSuccessResult(1244, function () {
                                            queriesCount = 0;
                                            buildResult(response);
                                        });
                                    }
                                })
                            } else {
                                onGetUsualSuccessResult(result, function () {
                                    queriesCount = 0;
                                    buildResult(response);
                                });
                            }
                        })
                    }
                } else {
                    buildResult(response);
                }
            }));
        });
    }
}

var user_data = {
    score: 20,
    objects: '1_3,2_7,3_1',
    time: 50,
    distance: 5,
    sum: 'd09bf41544a3365a46c9077ebb5e35c3'
}

function echoResult(value){
    var res = JSON.stringify(value);
    console.log('echo: ' + res)
}
/*
 var app = new application("");

 if (checkConf(app.get(), function(result){
 if (result){
 var mcconf = app.getMCconf();
 var memcached = new Memcached(mcconf);

 memcached.set('hello', 'world', 300);
 memcached.get('hello', function( err, result ){
 if( err ) console.error( err );
 console.log( result );
 });


 var dbconf = app.getDbconf();
 connection = mysql.connectDB(dbconf);

 getDataStart(1000, "", function(){
 if(queriesCount > 0){return;}
 var res = JSON.stringify(responseData);
 console.log(res)
 });

 //	saveLevelResult(300, 1, user_data, function(){echoResult(responseData);});
 //	getDataLevel(300, 1, function(){echoResult(responseData);});

 }
 }));

 */

//getFriendScore(1, '1000,100,300,301,select,302', echoResult);
//getDataFriends('1000,100,300,301,select,302', echoResult)
//giftAction(1000, 100, '', 'accept_ask', echoResult);

//giftAction(300, 1000, 'a9b7ba70783b617e9998dc4dd82eb3c5', 'ask', echoResult);
//giftAction(100, 1005, '2387337ba1e0b0249ba90f55b2ba2521', 'send', echoResult);

//saveLevelResult(300, 1, user_data, echoResult);
//getDataLevel(300, 1, echoResult);

/*
 getDataStart(308, userInf, function(){
 if(queriesCount > 0)
 {
 return;
 }
 var res = JSON.stringify(responseData);
 console.log(res)
 });
 */
//var serverConnect = http.createServer(onRequest).listen(4786); // dev??

//onRequest.get('/', index.index);



fs.readFile('../index.html', function (err, html) {
    if (err) {
        throw err;
    }

    http.createServer(function(request, response) {
        response.writeHeader(200, {"Content-Type": "text/html"});
        response.write(html);
        response.end();
    }).listen(4787);
});

//var serverConnect = http.createServer(onRequest).listen(4787); // prod
//var serverConnect = http.createServer(onRequest).listen(4787, '127.0.0.1');
//console.log(serverConnect);