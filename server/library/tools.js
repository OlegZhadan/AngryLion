var md5 = require('MD5');

function sortObject(o) {
    var sorted = {},
        key, a = [];

    for (key in o) {
        if (o.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = o[a[key]];
    }
    return sorted;
}


exports.checkSignature = function(obj, param, sig, sort, callback){
    var sort_obj = obj;
    var string = "";

    if (sort){
        sort_obj = sortObject(obj);
    }

    var obj_keys = Object.keys(sort_obj);
    obj_keys.forEach(function(key) {
        string += key + "=" + sort_obj[key];
    });

    string += param;

    console.log('sig: ' + md5(string));
    if (sig == md5(string)){
        callback(true);
    } else {
        callback(false);
    }
}

