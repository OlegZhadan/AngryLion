var game = new Phaser.Game(860, 640, Phaser.CANVAS, "gameDiv");
game.stage = new Phaser.Stage(game, game.width, game.height);
game.stage.disableVisibilityChange = true;
game.global = {
    /*social data*/
    social_id: null,
    first_name: null,
    last_name: null,
    sex: null,
    bdate: null,
    photo: null,

    /*user data*/
    mapLevelArr: [],
    level_goal: [],
    viral_blocks: [],
    playSounds: false,
    playMusic: false,
    gold: null,
    lives: null,
    livesText: null,
    max_lives: null,
    time_to_refill: 0,
    restore_time: null,
    refill: null,
    level_current: [],
    session_key: null,
    friendsApp: [],
    friendsAppList: [],
    friendsInfo: [],
    gifts: [],
    gift_asks: [],

    /*game data*/
    shop_items: [],
    objects: [],
    tileSize: 60,
    tileOffsetY: 10,
    characterSize: 80,
    tileTypes: 6,
    fieldSize: 9,
    mables_count: 6,
    fieldSizeWidth: 7,
    fieldSizeHeight: 9,
    offsetX: 220,
    offsetY: 50,
    tolerance: 1000,
    gameTime: 600,
    tweenSpeed: 100,
    delayToFall: 300,
    pointsArray:[10,50,100],

    friendBeatenArr: {
        score: 0,
        level_id: 0,
        me_num: 0,
        beaten_num: 0,
        beaten: null,
        count: 0
    },

    sessionTime: 0
};

game.windows = {
    purchase: null,
    special_offer: null,
    lives: null,
    lives_send: null,
    lives_ask: null,
    key_ask: null,
    level_start: null,
    friend_beaten: null,
    message: null
};

game.mapLoadMust = 0;

game.musicMenu = null;
game.musicGameplay = null;

game.fade = null;
game.coinsCount = null;
game.scrollGroup = null;
game.scrollButton = null;
game.checkAllButton = null;

game.currentLevel = null;
game.levelComplete = null;
game.levelCompleteScore = 0;
game.levelStart = null;

game.comicsCheck = false;
game.tutorialCheck = false;
game.tutorialMapLevel = null;

game.specialOfferSuccess = false;
game.specialOffer01 = null;

game.GET = function (variable) {
    var query = document.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++)
    {
        var pair = vars[i].split("=");
        if (pair[0] == variable)
        {
            return decodeURIComponent(pair[1]);
        }
    }
    return 'unknown';
};

game.objectFindByKey = function(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

game.dynamicSort = function(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

game.declOfNum = function(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
};

game.socialInit = function (social_id, callback) {
    VK.api('users.get', { uids: social_id, fields: 'first_name, last_name, photo_50, sex, bdate' }, function(data) {
        var userData = data.response[0];
        game.global.first_name = userData.first_name;
        game.global.last_name = userData.last_name;
        game.global.photo = userData.photo_50;
        game.global.sex = userData.sex;
        game.global.bdate = (userData.bdate) ? userData.bdate : null;
        VK.api('friends.getAppUsers', function(data) {
            game.global.friendsAppList = data.response;
            VK.api('users.get', { uids: game.global.friendsAppList + ',' + game.global.social_id, fields: 'first_name, last_name, photo_50' }, function(data) {
                game.global.friendsApp = data.response;
                callback('ok');
            });
        });
    });
};

game.wallPost = function (type, param){

    switch(type){
        case 'friend_beaten':
            if (game.global.sex == 1) {
                vkParam = { owner_id: param.friend_id, message: 'Я набрала ' + param.score + ' очков и побила твой рекорд на уровне ' + param.level_id + '. http://vk.com/app4841574#wall_p', attachments:'photo-91204872_366744047,http://vk.com/app4841574#wall_p' };
            } else {
                vkParam = { owner_id: param.friend_id, message: 'Я набрал ' + param.score + ' очков и побил твой рекорд на уровне ' + param.level_id + '. http://vk.com/app4841574#wall_p', attachments:'photo-91204872_366744047,http://vk.com/app4841574#wall_p' };
            }

            game.global.friendBeatenArr.level_id = 0;
            game.global.friendBeatenArr.beaten = null;
            game.global.friendBeatenArr.count = 0;
            game.global.friendBeatenArr.me_num = 0;
            game.global.friendBeatenArr.beaten_num = 0;
            game.global.friendBeatenArr.score = 0;

            break;
        case 'level_complete':
            if (game.global.sex == 1) {
                vkParam = { message: 'Я прошла уровень ' + param.level_id + ' и набрала ' + param.score + ' очков. http://vk.com/app4841574#wall_p', attachments:'photo-91204872_366634200,http://vk.com/app4841574#wall_p' };
            } else {
                vkParam = { message: 'Я прошел уровень ' + param.level_id + ' и набрал ' + param.score + ' очков. http://vk.com/app4841574#wall_p', attachments:'photo-91204872_366634200,http://vk.com/app4841574#wall_p' };
            }
            break;
    }

    VK.api('wall.post', vkParam, function(data) {});
};

game.showOrderBox = function (type, item_id){
    var params = {
        type: type,
        item: item_id
    };
    VK.callMethod("showOrderBox", params);
};

game.addToMenu = function (){
    VK.callMethod("showSettingsBox", 256);
};

game.showInviteBox = function (){
    VK.callMethod('showInviteBox');
};

game.isShare = function (){
    var share = 0;
    if (vk_s === true){
        share = 1;
    }
    game.getServer({social_id: game.global.social_id, share:share, method: 'saveSpecialOffer'}, function (data) {
        if (data.result == 1) {
            vk_s = true;
        }
    });
};

game.getServer = function(getData, successHandler, async) {
    if (async !== true) {
        async = false;
    }
    var url = "https://vk.angrylionstudio.com";
//    var url = "https://dev.timcatstudio.com";

    var sig = game.genSig(getData, game.global.session_key);
    getData.session_key = game.global.session_key;
    getData.hash = sig;
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(getData),
        success: function(data){
            successHandler(data);
        },
        async: async
    });
};

game.genSig = function(obj, param){
    var string = "";
    var sorted = {},
        key, a = [];

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            a.push(key);
        }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
        sorted[a[key]] = obj[a[key]];
    }

    var obj_keys = Object.keys(sorted);
    obj_keys.forEach(function(key) {
        string += key + "=" + sorted[key];
    });

    string += param;
   return  game.md5(string);
}

game.md5 = function(value) {
    return CryptoJS.MD5(value).toString();
}

game.isIE = function(){
    if (navigator.userAgent.indexOf(' MSIE ') > -1) {
        return true;
    }
    return false;
}

game.log = function(){
    console.log("%c  Running "+game.state.getCurrentState().state.current+" state  ","color:white;background:red");
}

game.countRefill = function(){
    if (game.global.lives < game.global.max_lives) {

        if (typeof(game.global.time_to_refill) != 'number') {
            game.global.time_to_refill = 0;
        }

        refill = game.global.restore_time - game.global.time_to_refill;
        if (refill <= 0) {
            game.global.lives++;
            game.global.time_to_refill = 0;
        }

        minutes = Math.floor(refill / 60) % 60;

        seconds = refill % 60;

        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        game.global.refill = minutes + ':' +seconds;
    }
}

game.scoreCalc = function(userMoves){
    var score = 0;

    for (var i = 0; i < userMoves.length; i++) {
        var increase = 0;
        var score_0 = 0;
        var score_1 = 0;
        var score_2 = 0;
        var score_3 = 0;
        var score_4 = 0;
        var score_5 = 0;
        var score_6 = 0;
        var score_7 = 0;
        var score_8 = 0;
        var score_9 = 0;
        var score_10 = 0;
        var score_11 = 0;
        var score_12 = 0;
        var score_13 = 0;
        var score_14 = 0;

        for (var j = 0; j < userMoves[i].length; j++) {
            switch(userMoves[i][j]) {
                case 0:
                    score_0++;
                    break;
                case 1:
                    score_1++;
                    break;
                case 2:
                    score_2++;
                    break;
                case 3:
                    score_3++;
                    break;
                case 4:
                    score_4++;
                    break;
                case 5:
                    score_5++;
                    break;
                case 6:
                    score_6++;
                    break;
                case 7:
                    score_7++;
                    break;
                case 8:
                    score_8++;
                    break;
                case 9:
                    score_9++;
                    break;
                case 10:
                    score_10++;
                    break;
                case 11:
                    score_11++;
                    break;
                case 12:
                    score_12++;
                    break;
                case 13:
                    score_13++;
                    break;
                case 14:
                    score_14++;
                    break;
            }
        }

        score += (score_0 + score_1) * 100;

        if (score_1 > 0) {
            score += 400;
        }

        for (var p = 0; p < (score_0 + score_1 + score_4 + score_5); p++) {
            if (p != 0 && p % 3 == 0) {
                increase++;
            }
            score += increase * 30;
        }

        score += score_2 * 50;
        score += score_3 * 50;
        score += score_4 * 5000;
        score += score_5 * 100;
        score += score_6 * 5000;
        score += score_8 * 50;
        score += score_9 * 1500;
        score += score_10 * 5000;
        score += score_11 * 500;
        score += score_12 * 5000;
        score += score_13 * 100;
        score += score_14 * 50;
    }
    return score;
}

//windows
game.openPurchase = function () {
    game.closeOtherWindow('purchase');
    if (game.windows.purchase === null) {

        game.fade = game.add.graphics(0, 0);
        game.fade.beginFill(0x000000, 1);
        game.fade.drawRect(0, 0, game.width, game.height);
        game.fade.alpha = 0;
        this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

        var windowPurchase = game.add.image(game.width / 2, game.height / 2, "windowPurchase");

        title = game.add.text(0, -170, 'Монеты', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
        title.anchor.setTo(0.5, 1);
        windowPurchase.addChild(title);

        var closeW = (windowPurchase.width / 2) - 65;
        var closeH = (windowPurchase.height / 2) - 12;

        //  And click the close button to close it down again
        var closeButton = game.make.button(closeW, -closeH, 'buttonClose', null, windowPurchase, 0, 1, 2);
        closeButton.inputEnabled = true;
        closeButton.input.priorityID = 1;
        closeButton.input.useHandCursor = true;
        closeButton.events.onInputUp.add(game.closeWindow, windowPurchase);
        windowPurchase.addChild(closeButton);

        var shopItemGroup = game.add.group();

        var itemW = (windowPurchase.width / 2) - 75;
        var itemH = (windowPurchase.height / 2) - 145;

        for (key in game.global.shop_items) {

            place = game.add.image(0, -itemH, 'windowPurchasePlace');
            place.anchor.setTo(0.5, 0.8);
            shopItemGroup.add(place);

            shopItemText = game.add.text(-itemW, -itemH, game.global.shop_items[key].amount, { 'font': '20px MainFont', fill: '#4b7b1d', 'width': 100 });
            shopItemText.anchor.setTo(0.5, 1);
            shopItemGroup.add(shopItemText);

            purchaseImg = 'purchasePack' + game.global.shop_items[key].id;
            shopItemImg = game.add.image(-itemW + 140, -itemH, purchaseImg);
            shopItemImg.anchor.setTo(0.5, 0.6);
            shopItemGroup.add(shopItemImg);

            shopItemButton = game.make.button(-itemW + 250, -itemH, "greenButtonMessage", null, windowPurchase, 0, 1, 2);
            shopItemButton.anchor.setTo(0.5, 0.95);
            shopItemButton.input.priorityID = 2;
            shopItemButton.shopItem = game.global.shop_items[key].id;
            shopItemButton.shopItemAmount = game.global.shop_items[key].amount;
            shopItemButton.input.useHandCursor = true;
            shopItemButton.events.onInputUp.add(game.showOrder, windowPurchase);
            shopItemGroup.add(shopItemButton);

            shopItemPrice = game.add.text(-itemW + 250, -itemH, game.global.shop_items[key].price + ' ' + game.declOfNum(game.global.shop_items[key].price, ['голос', 'голоса', 'голосов']), { 'font': '14px MainFont', fill: '#4b7b1d', 'width': 100 });
            shopItemPrice.anchor.setTo(0.5, 1.2);
            shopItemGroup.add(shopItemPrice);

            itemH -= 67;
        }

        windowPurchase.addChild(shopItemGroup);

        windowPurchase.alpha = 0.8;
        windowPurchase.anchor.set(0.5);
        windowPurchase.inputEnabled = true;
        windowPurchase.scale.set(0.9);
        windowPurchase.windowType = 'purchase';

        game.add.tween(windowPurchase).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
        game.add.tween(windowPurchase.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
        game.windows.purchase = windowPurchase;
    }
}

game.showOrder = function (current) {
    if (current.shopItem) {
        game.showOrderBox('item', current.shopItem);
        VK.addCallback('onOrderSuccess', function (order_id) {
            tween = game.add.tween(game.windows.purchase).to({ alpha: 0 }, 100, Phaser.Easing.Cubic.In, true);
            game.add.tween(game.windows.purchase.scale).to({ x: 0.1, y: 0.1 }, 100, Phaser.Easing.Cubic.In, true);
            tween.onComplete.add(function (w) {
                game.add.tween(game.fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
                w.destroy();
                game.windows.purchase = null;
            }, this);
            game.global.gold += current.shopItemAmount;
            game.coinsCount.text = game.global.gold;
        });
    }
}


game.specialOfferButton = function (windowSpecialOffer, specialOffer){
    var succesOffer = true;
    for (key in specialOffer) {
        if (specialOffer[key].success == false) {
            succesOffer = false;
        };
    }

    if (succesOffer === true) {
        button = game.add.button(50, 205, "greenButtonMessageGig", null, this, 0, 1, 2);
        button.anchor.setTo(0.5, 0.95);
        button.inputEnabled = true;
        button.input.priorityID = 3;
        button.input.useHandCursor = true;
        button.events.onInputUp.add(function () {
            game.getServer({social_id: game.global.social_id, method: 'completeSpecialOffer'}, function (data) {
                if (data.result == 1) {
                    game.global.gold += 20;
                    game.coinsCount.text = game.global.gold;
                    game.specialOfferSuccess = true;
                    game.specialOffer01.destroy();
                    game.specialOffer01 = null;
                    game.closeOtherWindow();
                }
            });
        }, this);

        buttonBigText = game.add.text(0, -20, 'Забрать', { 'font': '16px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
        buttonBigText.anchor.setTo(0.5);
        buttonBigText.align = "center";
        button.addChild(buttonBigText);
        windowSpecialOffer.addChild(button);
    }
},

game.closeWindow = function () {
    if (this.scale.x === 1) {
        game.add.tween(game.fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
        tween = game.add.tween(this).to({ alpha: 0 }, 100, Phaser.Easing.Cubic.In, true);
        game.add.tween(this.scale).to({ x: 0.8, y: 0.8 }, 100, Phaser.Easing.Cubic.In, true);
        switch (this.windowType) {
            case 'level_start':
                game.windows.level_start = null;
                if (game.tutorialMapLevel !== null) {
                    game.tutorialMapLevel.alpha = 1;
                }
                break;
            case 'purchase':
                game.windows.purchase = null;
                break;
            case 'special_offer':
                game.windows.special_offer = null;
                break;
            case 'friend_beaten':
                game.windows.friend_beaten = null;
                game.global.friendBeatenArr.level_id = 0;
                game.global.friendBeatenArr.beaten = null;
                game.global.friendBeatenArr.count = 0;
                game.global.friendBeatenArr.me_num = 0;
                game.global.friendBeatenArr.beaten_num = 0;
                game.global.friendBeatenArr.score = 0;
                if (levelStart !== null && levelStart !== undefined) {
                    game.timer = game.time.create(this.game);
                    game.timer.add(500, function () {
                        level = game.objectFindByKey(game.global.mapLevelArr, 'level_id', levelStart);
                        viralLevel = game.objectFindByKey(game.global.viral_blocks, 'before_level_id', levelStart);
                        if (viralLevel == null || viralLevel.status != 0) {
                            this.levelStart({
                                level_id: level.level_id,
                                star_1: level.star_1,
                                star_2: level.star_2,
                                star_3: level.star_3,
                                score: level.score,
                                goals: level.goals,
                                bg_id: level.bg_id
                            });
                        }
                    }, this._this);
                    game.timer.start();
                }
                break;
            case 'lives':
                game.windows.lives = null;
                break;
            case 'lives_send':
                game.windows.lives_send = null;
                game.scrollGroup = null;
                game.scrollButton = null;
                game.checkAllButton = null;
                break;
            case 'lives_ask':
                game.windows.lives_ask = null;
                game.scrollGroup = null;
                game.scrollButton = null;
                game.checkAllButton = null;
                break;
            case 'key_ask':
                game.windows.key_ask = null;
                game.scrollGroup = null;
                game.scrollButton = null;
                game.checkAllButton = null;
                break;
            case 'message':
                game.windows.message = null;
                game.scrollGroup = null;
                game.scrollButton = null;
                game.global.gifts = [];
                break;
        }

        tween.onComplete.add(function (current) {
            current.destroy();
        }, this);
    }
}

game.closeOtherWindow = function (current) {
    for (key in game.windows) {
        if (game.windows[key] !== null && key != current) {
            game.add.tween(game.fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
            game.windows[key].destroy();
            game.windows[key] = null;
        }
    }
}

game.state.add("Boot", boot);
game.state.start("Boot");
game.state.add("Loading", loading);
game.state.add("LevelMap", levelMap);
game.state.add("TheGame", theGame);