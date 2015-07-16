var indexes = ['local', 'vk.angrylionstudio.com', 'callback.angrylionstudio.com'];

var cfgs = [
    {
        DB:{
//            host     : 'localhost',
//            user     : 'root',
//            password : '',
//            database : 'cm',
//            port     : 3306
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'mables_vk',
            port     : 3306
        },
        memcached:{
            host	: 'localhost:11211'
        },
        SN: {
            api_id: 4975471,
            secret_key: '123456'
        }
    },
    {
        DB:{
//            host     : 'localhost',
//            user     : 'root',
//            password : '',
//            database : 'cm',
//            port     : 3306
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'mables_vk',
            port     : 3306
        },
        memcached:{
            host	: 'localhost:11211'
        },
        SN: {
            api_id: 4975471,
            secret_key: '123456'
        }
    },
    {
        DB:{
//            host     : 'localhost',
//            user     : 'root',
//            password : '',
//            database : 'cm',
//            port     : 3306
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'mables_vk',
            port     : 3306
        },
        memcached:{
            host	: 'localhost:11211'
        },
        SN: {
            api_id: 4975471,
            secret_key: '123456'
        }
    }
];

exports.getConf = function(SN){
    var i = indexes.indexOf(SN);
    if (i >= 0) {
        return cfgs[i];
    } else return 'error';
}

exports.memcachedConf = function(SN){
    var i = indexes.indexOf(SN);
    if (i >= 0) {
        return cfgs[i].memcached;
    } else return 'error';
}