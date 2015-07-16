var config = require('./config');
var pathConnect = 'local';
var conf = 'error';


function Application(headers){
    if (isset(headers, 'x-forwarded-host')){
        pathConnect = headers['x-forwarded-host'];
    }
    conf = config.getConf(pathConnect);
}

Application.prototype.get = function(){
    conf = config.getConf(pathConnect);
    if (conf == 'error'){
        return false;
    } else {
        return true;
    }
}

Application.prototype.getDbconf = function(){
    return conf.DB;
}

Application.prototype.getSNconf = function(){
    return conf.SN;
}

Application.prototype.getMCconf = function(){
    return conf.memcached;
}


function isset(obj, param){
    if (obj.hasOwnProperty(param)) return true;
    else return false;
}

module.exports = Application;