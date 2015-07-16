boot = {
     init: function() {
         text = game.add.text(-50, -50, "");
         text.anchor.setTo(0.5);

         text.font = 'MainFont';
         text.fontSize = 10;

         game.stage.disableVisibilityChange = true;
         game.global.social_id = parseInt(game.GET('viewer_id'));
         game.log();
     },

	preload: function() {
        game.add.text(game.width /2, game.height - 50, 'Загрузка...', { 'font': '14pt MainFont', fill: '#fefefe'}).anchor.setTo(0.5);
        game.load.image("logo", "assets/sprites/loader/Logo.png");
        game.load.image("loader", "assets/sprites/loader/1.jpg");
        game.load.image("loading", "assets/sprites/loader/Line.png");
        game.load.image("loadingPlace", "assets/sprites/loader/LoaderLine.png");
        game.load.image("blackfade","assets/sprites/blackfade.png");
     },

     create: function() {

//      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
//		game.scale.setScreenSize(true);

		game.physics.startSystem(Phaser.Physics.ARCADE);

         game.socialInit(game.global.social_id, function() {
             game.getServer({social_id: game.global.social_id, method: 'getDataStart', user_sex:game.global.sex, user_bdate: game.global.bdate}, function(data){
                 game.global.playSounds = data.user.sound;
                 game.global.playMusic = data.user.music;
                 game.global.gold = parseInt(data.user.gold);
                 game.global.lives = parseInt(data.user.lives);
                 game.global.max_lives = data.user.max_lives;
                 game.global.time_to_refill = data.user.time_to_refill;
                 game.global.restore_time = data.user.restore_time;
                 game.global.level_current = data.level_current + 1;
                 game.global.objects = data.objects;
                 game.global.shop_items = data.shop_items;
                 game.global.session_key = data.session_key;
                 game.global.gifts = data.gifts.concat(data.gift_asks.concat(data.keyz.concat(data.key_asks)));
                 game.global.gifts.sort(game.dynamicSort("date"));
                 game.global.mapLevelArr = data.levels;
                 game.global.level_goal = data.level_goal;
                 game.global.viral_blocks = data.viral_blocks;
                 game.specialOfferSuccess = data.special_offer;

                 game.state.start("Loading");
             });
         });
     }
};