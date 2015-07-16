/*

This is the state which will preload all graphic and sound assets

It has three functions:

* init: to be automatically executed once the state is called

* preload: to be automatically executed once the state is being preloaded

* create: to be automatically executed once the state is finally created

*/

loading = {

     init: function() {
          game.log();
     },

	preload: function(){
        var loader = game.add.sprite(0, 0, "loader");
        var logo = game.add.sprite(50, 50, "logo");

        loadingText = game.add.text(200, 150, 'Загрузка', { 'font': '9pt Tahoma', fill: '#47718e'});
        loadingText.anchor.setTo(0.5);
        this.load.onFileComplete.add(function( progress ) {
            loadingText.text = progress + '%';
        });


        var loadingPlace = game.add.sprite(80, 160, "loadingPlace");
        var loadingBar = game.add.sprite(80, 160, "loading");
        $('#gameDiv').animate({'opacity': 1}, 500);
        loadingBar.anchor.setTo(0);

        loader = game.load.setPreloadSprite(loadingBar);
        // top panel

        if (game.global.level_current > 0) {
            current = Math.ceil(game.global.level_current / 20);
            for (var i = 1; i <= current; i++) {
                game.load.image("map_" + i, "assets/sprites/map/" + i + ".jpg");
            }
        }




        game.load.spritesheet("test","assets/sprites/jelly/test.png", 110, 110);
        game.load.image("topLine","assets/sprites/top_panel/TopLine.png");
        game.load.image("heartPanel","assets/sprites/top_panel/HeartPanel.png");
        game.load.image("heart","assets/sprites/top_panel/Heart.png");
        game.load.image("coinsPanel","assets/sprites/top_panel/CoinsPanel.png");
        game.load.image("coins","assets/sprites/top_panel/Coin.png");
        game.load.image("buttonPlus","assets/sprites/top_panel/ButtonPlusNormal.png");
        game.load.spritesheet("buttonExpirience","assets/sprites/top_panel/ButtonExpirience.png", 37,38);
        game.load.image("hintExpirience","assets/sprites/top_panel/HintExpirience.png");
        game.load.image("soundsPanel","assets/sprites/top_panel/SoundsPanel.png");
        game.load.image("soundIcon","assets/sprites/top_panel/SoundIcon.png");
        game.load.image("musicIcon","assets/sprites/top_panel/MusicIcon.png");
        game.load.image("redline","assets/sprites/top_panel/RedLine.png");
        // score panel
        game.load.spritesheet("IconsScorePanel","assets/sprites/score_panel/goal/IconsScorePanel.png", 40, 40);
        game.load.image("goalBubble","assets/sprites/score_panel/goal/Bubble.png");
        game.load.image("goalCounter","assets/sprites/score_panel/goal/Counter.png");
        game.load.image("goalRuby","assets/sprites/score_panel/goal/Ruby.png");
        game.load.image("goalWater","assets/sprites/score_panel/goal/Water.png");
        game.load.image("goalZombie","assets/sprites/score_panel/goal/Zombie.png");
        game.load.image("goalScore","assets/sprites/score_panel/goal/Score.png");
        game.load.image("goalOk","assets/sprites/score_panel/goal/Ok.png");

         // level_loader
        game.load.image("levelLoaderBlue","assets/sprites/level_loader/Blue.png");
        game.load.image("levelLoaderGreen","assets/sprites/level_loader/Green.png");
        game.load.image("levelLoaderPink","assets/sprites/level_loader/Pink.png");

        game.load.image("buttonFriends","assets/sprites/top_panel/ButtonFriendsNormal.png");
        game.load.image("buttonHearts","assets/sprites/top_panel/ButtonHeartsNormal.png");
        game.load.image("buttonSettings","assets/sprites/top_panel/ButtonSettingsNormal.png");

        //*****WINDOWS*****//
        game.load.spritesheet("buttonClose","assets/sprites/w/ButtonClose.png",39,41);
        // purchase
        game.load.spritesheet("buttonGreen","assets/sprites/w/purchase/ButtonGreenMouse.png", 106, 37);
        game.load.image("windowPurchase","assets/sprites/w/purchase/Window.png");
        game.load.image("windowPurchasePlace","assets/sprites/w/purchase/Place.png");
        game.load.image("purchasePack1","assets/sprites/w/purchase/CoinsPack1.png");
        game.load.image("purchasePack2","assets/sprites/w/purchase/CoinsPack2.png");
        game.load.image("purchasePack3","assets/sprites/w/purchase/CoinsPack3.png");
        game.load.image("purchasePack4","assets/sprites/w/purchase/CoinsPack4.png");
        game.load.image("purchasePack5","assets/sprites/w/purchase/CoinsPack5.png");
        // lives
        game.load.image("windowLives","assets/sprites/w/lives/Window.png");
        game.load.image("nomore","assets/sprites/w/lives/NoMoreLives.png");
        game.load.image("getmore","assets/sprites/w/lives/GetMoreLives.png");
        game.load.image("place_text","assets/sprites/w/lives/PlaceText.png");
        game.load.spritesheet("greenButton","assets/sprites/w/lives/ButtonGreen.png",162,47);
        game.load.spritesheet("blueButton","assets/sprites/w/lives/BlueButtons.png",163,47);
        // livesSend
        game.load.image("friendPlace","assets/sprites/w/lives/FriendPlace.png");
        game.load.spritesheet("okGreen","assets/sprites/w/lives/OkGreen.png",37,36);
        game.load.spritesheet("okBlue","assets/sprites/w/lives/OkBlue.png",31,30);
        // level
        game.load.image("windowLevelStart","assets/sprites/w/level/Window.png");
        game.load.image("windowLevelComplete","assets/sprites/w/level/WindowComplete.png");
        game.load.spritesheet("levelContinueButton","assets/sprites/w/level/ButtonContinue.png",184,59);
        game.load.image("levelCompleteScorePlace","assets/sprites/w/level/ScorePlace.png");
        game.load.image("levelCompleteStarsPlace","assets/sprites/w/level/StarsPlace.png");
        game.load.image("levelCompleteGlow","assets/sprites/w/level/Glow.png");
        game.load.spritesheet("levelStartButton","assets/sprites/w/level/ButtonGreenBig.png",184,59);
        game.load.spritesheet("levelInviteButton","assets/sprites/w/level/BlueButton.png",116,40);
        game.load.image("levelStartGoalPlace","assets/sprites/w/level/GoalPlace.png");
        game.load.image("levelStartStar","assets/sprites/w/level/Star.png");
        game.load.image("levelStartStar1","assets/sprites/w/level/Star1.png");
        game.load.image("levelStartStar2","assets/sprites/w/level/Star2.png");
        game.load.image("levelStartStar3","assets/sprites/w/level/Star3.png");
        game.load.image("levelStartPlaceFriend","assets/sprites/w/level/PlaceFriend.png");
        game.load.image("levelStartIconFriend","assets/sprites/w/level/IconFriend.png");
        game.load.image("levelStartIconTopFriend","assets/sprites/w/level/IconTopFriend.png");
        game.load.image("levelStartScrollLine","assets/sprites/w/level/LineScroll.png");
        game.load.spritesheet("levelStartScrollButtonUp","assets/sprites/w/level/ButtonUp.png",15,14);
        game.load.spritesheet("levelStartScrollButtonDown","assets/sprites/w/level/ButtonDown.png",15,14);
        game.load.image("levelStartScrollButton","assets/sprites/w/level/ButtonScroll.png");
        game.load.image("levelIncompleteArt","assets/sprites/w/level/IncompleteArt.png",15,14);
        game.load.spritesheet("levelIncompleteMoreMovesButtonBlue","assets/sprites/w/level/ButtonBlue.png",184,54);
        game.load.spritesheet("levelIncompleteMoreMovesButton","assets/sprites/w/level/MoreMovesButton.png",184,54);
        game.load.spritesheet("levelIncompleteRetryButton","assets/sprites/w/level/RetryButton.png",162,47);
        game.load.spritesheet("levelCompleteOk","assets/sprites/w/level/Ok.png",25,24);
        // message
        game.load.image("windowMessage","assets/sprites/w/message/Window.png");
        game.load.image("placeMessage","assets/sprites/w/message/PlaceMessage.png");
        game.load.spritesheet("greenButtonMessage","assets/sprites/w/message/ButtonGreen.png",116,38);
        game.load.spritesheet("greenButtonMessageGig","assets/sprites/w/message/ButtonGreenBig.png",152,47);
        game.load.image("iconFriendMessage","assets/sprites/w/message/IconFriend.png");
        game.load.image("iconHeartMessage","assets/sprites/w/message/IconHeart.png");
        game.load.image("messageScrollLine","assets/sprites/w/message/LineScroll.png");
        // firned beaten
        game.load.spritesheet("friendBeatenButton","assets/sprites/w/friend_beaten/ButtonGreenBig.png",184,61);
        game.load.image("friendBeatenBack","assets/sprites/w/friend_beaten/Back.png");
        game.load.image("friendBeatenGlow","assets/sprites/w/friend_beaten/Glow.png");
        game.load.image("friendBeatenIconGreen","assets/sprites/w/friend_beaten/IconGreen.png");
        game.load.image("friendBeatenIconRed","assets/sprites/w/friend_beaten/IconRed.png");
        // viral
        game.load.image("viralWindow","assets/sprites/viral/Window.png");
        game.load.image("viralWindowStar","assets/sprites/viral/Star.png");
        game.load.image("viralWindowKey","assets/sprites/viral/WindowKey.png");
        game.load.image("viralKey","assets/sprites/viral/Key.png");
        game.load.image("viralWindowIconFriend","assets/sprites/viral/IconFriend.png");
        game.load.spritesheet("viralWindowButtonAskFriend","assets/sprites/viral/ButtonAskFriend.png", 47, 47);
        game.load.spritesheet("viralWindowBlueButton","assets/sprites/viral/BlueButton.png", 42, 22);
        game.load.image("viralWindowAvatar_1","assets/sprites/viral/avatar/Green.png");
        game.load.image("viralWindowAvatar_2","assets/sprites/viral/avatar/Orange.png");
        game.load.image("viralWindowAvatar_3","assets/sprites/viral/avatar/Pink.png");
        game.load.image("viralWindowAvatar_4","assets/sprites/viral/avatar/Violet.png");

        //*****MAP*****//
        // special offer
        game.load.image("specialOfferIcon01","assets/sprites/special_offer/Icon01.png");
        game.load.image("specialOfferArt01","assets/sprites/special_offer/Art01.png");
        game.load.image("specialOfferPlace","assets/sprites/special_offer/PlaceOffer.png");
        game.load.spritesheet("specialOfferButton","assets/sprites/special_offer/ButtonSpecialOffer.png",239,46);

        // button level
        game.load.image("buttonLevelStarDark","assets/sprites/button_level/StarDark.png");
        game.load.image("buttonLevelStar","assets/sprites/button_level/Star.png");
        game.load.spritesheet("buttonLevelActive","assets/sprites/button_level/Active.png",95,61);
        game.load.spritesheet("buttonLevel","assets/sprites/ButtonLevel.png",62,50);

        game.load.image("map_1","assets/sprites/map/1.jpg");
        game.load.image("clouds","assets/sprites/Clouds.png");

        // quit level
        game.load.image("windowQuitLevel", "assets/sprites/w/quit_level/Window.png");
        game.load.spritesheet("windowQuitGreenButton", "assets/sprites/w/quit_level/GreenButton.png", 115, 38);
        game.load.spritesheet("windowQuitBlueButton", "assets/sprites/w/quit_level/BlueButton.png", 116, 40);

        // complete panel
        game.load.image("completePanelGlow", "assets/sprites/complete_panel/Glow.png");
        game.load.image("completePanelMable1", "assets/sprites/complete_panel/Blue.png");
        game.load.image("completePanelMable2", "assets/sprites/complete_panel/Pink.png");
        game.load.image("completePanelMable3", "assets/sprites/complete_panel/Green.png");

        // score panel progressbar
        game.load.image("scorePanelProgressBar", "assets/sprites/score_panel/progressbar/ProgressBar.png");
        game.load.image("scorePanelProgressPanel", "assets/sprites/score_panel/progressbar/ProgressPanel.png");
        game.load.image("scorePanelProgressStar", "assets/sprites/score_panel/progressbar/Star.png");
        game.load.spritesheet("scorePanelProgressStar1", "assets/sprites/score_panel/progressbar/XP01.png", 17, 28);
        game.load.spritesheet("scorePanelProgressStar2", "assets/sprites/score_panel/progressbar/XP02.png", 23, 28);
        game.load.spritesheet("scorePanelProgressStar3", "assets/sprites/score_panel/progressbar/XP03.png", 29, 28);

        game.load.image("scorePanel", "assets/sprites/score_panel/Window.png");
        game.load.image("scorePanelPlaceMoves", "assets/sprites/score_panel/PlaceMoves.png");
        game.load.spritesheet("scorePanelPlaceTarget", "assets/sprites/score_panel/PlaceTarget.png", 113, 15);
        game.load.image("scorePanelPlaceTargetCenter", "assets/sprites/score_panel/PlaceTargetCenter.png");
        game.load.spritesheet("scorePanelMusicButton", "assets/sprites/score_panel/ButtonMusic.png", 37, 38);
        game.load.spritesheet("scorePanelSoundButton", "assets/sprites/score_panel/ButtonSound.png", 37, 38);
        game.load.spritesheet("scorePanelQuitButton", "assets/sprites/score_panel/ButtonQuit.png", 37, 38);

        game.load.spritesheet("tile_map", "assets/sprites/tile_map.jpg", 60, 60);

        game.load.spritesheet("mables", "assets/sprites/jelly/Mables.png", game.global.characterSize, game.global.characterSize);
        game.load.spritesheet("effects", "assets/sprites/jelly/Effects.png", 128, 128);
        game.load.spritesheet("explode", "assets/sprites/ExplodeNew.png", 130, 130);
        game.load.spritesheet("bonus", "assets/sprites/highlight.png", 98, 97);
        game.load.spritesheet("spec_object", "assets/sprites/spec_object.png", game.global.tileSize, game.global.tileSize);
        game.load.spritesheet("arrows", "assets/sprites/arrows.png", game.global.tileSize * 3, game.global.tileSize * 3);
        game.load.spritesheet("settings", "assets/sprites/settings.png", 24, 24);

        game.load.spritesheet("lineHorizontal", "assets/sprites/LineHorizontal.png", 90, 39);
        game.load.spritesheet("lineDiagonal", "assets/sprites/LineDiagonal.png", 98, 98);

        game.load.image("completeSuper", "assets/sprites/Super.png");
        game.load.image("completeMables", "assets/sprites/Mables.png");

        game.load.image("tutorialMable", "assets/sprites/tutorial/BlueMable.png");
        game.load.image("tutorialRound", "assets/sprites/tutorial/Round.png");
        game.load.image("tutorialArrow", "assets/sprites/tutorial/Arrow.png");
        game.load.image("tutorialHint", "assets/sprites/tutorial/Hint.png");

        // comics
        game.load.image("comicsColor", "assets/sprites/comics/Comics.jpg");
        game.load.image("comics1", "assets/sprites/comics/ComicsGrey01.png");
        game.load.image("comics2", "assets/sprites/comics/ComicsGrey02.png");
        game.load.image("comics3", "assets/sprites/comics/ComicsGrey03.png");
        game.load.image("comics4", "assets/sprites/comics/ComicsGrey04.png");

        // target
        game.load.image("targetMable", "assets/sprites/target/BlueMable.png");
        game.load.image("targetHint", "assets/sprites/target/Hint.png");

        // history
        game.load.image("historyHint", "assets/sprites/history/Hint.png");

        game.load.audio("pop_1", ["assets/sounds/pop_1.mp3", "assets/sounds/pop_1.ogg"]);
        game.load.audio("pop_2", ["assets/sounds/pop_2.mp3", "assets/sounds/pop_2.ogg"]);
        game.load.audio("pop_3", ["assets/sounds/pop_3.mp3", "assets/sounds/pop_3.ogg"]);
        game.load.audio("remove_1", ["assets/sounds/remove_1.mp3", "assets/sounds/remove_1.ogg"]);
        game.load.audio("remove_2", ["assets/sounds/remove_2.mp3", "assets/sounds/remove_2.ogg"]);
        game.load.audio("remove_3", ["assets/sounds/remove_3.mp3", "assets/sounds/remove_3.ogg"]);

        game.load.audio("musicMenu", ["assets/sounds/menu.mp3", "assets/sounds/menu.ogg"]);
        game.load.audio("musicGameplay", ["assets/sounds/gameplay.mp3", "assets/sounds/gameplay.ogg"]);

        game.load.audio("levelComplete", ["assets/sounds/level_complete.ogg"]);
    },
	
  	create: function(){

        if (typeof(game.global.gold) != 'number') {
            console.log('second init');
            game.timer = this.game.time.create(this.game);
            game.timer.add(3000, function () {
                if (typeof(game.global.gold) != 'number') {
                    console.log('init');
                    game.getServer({social_id: game.global.social_id, method: 'getDataStart', user_sex: game.global.sex, user_bdate: game.global.bdate}, function (data) {
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
                    });
                }
            }, this);
            game.timer.start();
        }

        var blackFade = game.add.image(0 ,0, "blackfade");
        blackFade.alpha = 0;
        var fadeTween = game.add.tween(blackFade);

        fadeTween.to({
            alpha: 1
        }, 250, Phaser.Easing.Linear.Out, true)
            .onComplete.add(function(){
                game.state.start("LevelMap");
            } ,this);
	}
}     