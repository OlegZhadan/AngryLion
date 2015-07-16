var request = require("request");
var conf = {};


function VK(snConf){
    conf = snConf;

}
//client_secret

function getToken(callback){

    var url = "https://oauth.vk.com/access_token?client_id=" + conf.api_id
        + "&client_secret=" + conf.secret_key + "&v=5.30&grant_type=client_credentials";

    request(url, function(error, response, body) {
        var result = JSON.parse(body);
        if (result.hasOwnProperty('access_token')){
            callback(result.access_token);
        } else {
            callback();
        }
    });
}

VK.prototype.sendNotification = function(user_ids, msg, callback){
    getToken(function(result){
        var url = "https://api.vk.com/method/secure.sendNotification?user_ids=" + user_ids + "&message=" + msg +
            "&client_secret=" + conf.secret_key + "&access_token=" + result;
        request(url, callback);
    })
}

VK.prototype.setUserLevel = function(social_id, level){
    getToken(function(result){
        var url = "https://api.vk.com/method/secure.setUserLevel?user_id=" + social_id + "&level=" + level +
            "&client_secret=" + conf.secret_key + "&access_token=" + result;
        console.log(url);
        request(url, function(error, response, body) {});
    });
}


module.exports = VK;