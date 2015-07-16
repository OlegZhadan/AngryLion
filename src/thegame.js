var levelID = 0;
var levelWidth = 0;
var levelHeight = 0;
var levelMaxColor = 6;
var levelBonusStep = 5;
var levelObjects = [];
var goals = [];
var levelScoreGoal = null;
var levelMovesSave = 0;
var levelMoves = 0;
var progressbarLine = null;
var progressbarLineMask = null;
var levelStar_1 = 0;
var levelStar_2 = 0;
var levelStar_3 = 0;
var levelBackID = 1;
var levelFill = 1;
var share = true;

var targetShow = true;

var tutorialOn = false;
var tutorialObjectType = null;
var tutorialObjectID = null;
var tutorialObjectArr = [];
var tutorialPickFirst = {};
var tutorialCheck = [];
var tutorialMable = null;
var tutorialHint = null;
var tutorialHintText = null;
var tutorialArrow = null;
var tutorialArrowShow = true;
var tutorialBonus = {};
var tutorialBonusExplode = false;

var progressbarStar1 = null;
var progressbarStar2 = null;
var progressbarStar3 = null;

var levelStarRender = {};
levelStarRender.star1 = false;
levelStarRender.star2 = false;
levelStarRender.star3 = false;

var levelOffsetX;
var levelOffsetY;

var levelMovesText = null;

var characterMap = [];
var sandMap = [];
var rubyCount = 0;
var rubyInMap = 0;
var rubyPosition = [];
var rowCount = 0;

var scoreIncrease = 0;
var scoreIncreaseCount = 30;
var visitedCount = 0;

var topPanelGroup = null;
var scorePanel = null;
var tileSandGroup = null;
var tileMapGroup = null;
var bonusMapGroup = null;
var arrowGroup = null;
var characterGroup = null;
var bonusGroup = null;
var characterBonusGroup = null;
var bonusCount = 0;
var bonusAdd = false;
var targetGroup = null;

var animFall = [];
var currentCounter = null;
var currentCounterBonus = [];
var bonusCounter = 0;
var ghostArr = [];
var ghostCount = 0;
var ghostProtect = true;

var characterArray = [];
var neighboursArr = [];
var tileSandArray = [];
var bonusArray = [];
var arrowArray = [];
var visitedTiles = [];
var bonusTiles = [];
var moveIndex = 0;
var moveBonusIndex = 0;
var operationsInQueue = 0;
var operationsCreate = 0;
var operationsBonus = 0;
var scoreText = null;
var score = null;
var emitter = null;
var pop = [];
var remove = [];

var goalTextArr = {};
goalTextArr.score = null;
goalTextArr.ruby = null;
goalTextArr.bubble = null;
goalTextArr.sand = null;
goalTextArr.counter = null;
goalTextArr.ghost = null;

var userMoves = [];
var userCollectObject = {};
userCollectObject.character = 0;
userCollectObject.ruby = 0;
userCollectObject.bubble = 0;
userCollectObject.sand = 0;
userCollectObject.counter = 0;
userCollectObject.ghost = 0;

var popup = {};
popup.levelComplete = false;
popup.levelIncomplete = false;
popup.level_incomplete = null;
popup.explodeTime = false;
popup.level_quit = null;

var fade = null;
var scorePanelPlaceTarget = null;

var musicButton = null;
var soundButton = null;

var bonusFromMoveArr = [];
theGame = {

	init: function() {
        if (typeof(game.global.gold) != 'number') {
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
                console.log('-4');
                console.log(game.global.social_id);
                console.log(game.global.gold);
            });
        }
        console.log('-5');
        console.log(game.global.social_id);
        console.log(game.global.gold);
        game.global.time_to_refill = 0;
        if (game.global.lives < game.global.max_lives) {
            game.timer = this.game.time.create(this.game);
            game.timer.loop(Phaser.Timer.SECOND, function () {
                game.global.sessionTime++;
                game.global.time_to_refill++;
            }, this);
            game.timer.start();
        }

        levelID = game.levelStart;
        game.getServer({'social_id': game.global.social_id, 'method': 'getDataLevel', 'level_id':levelID}, function(data){
            var levelInfo = data.result[0];
            levelWidth = levelInfo.x;
            levelHeight = levelInfo.y;
            levelMaxColor = levelInfo.max_color;
            levelBonusStep = levelInfo.bonus_step;
            levelMovesSave = levelInfo.moves;
            levelMoves = levelInfo.moves;
            levelObjects = levelInfo.objects;
            levelBackID = levelInfo.bg_id;
            levelFill = levelInfo.fill;
            goals = levelGoals;

            levelStar_1 = levelInfo.star_1;
            levelStar_2 = levelInfo.star_2;
            levelStar_3 = levelInfo.star_3;

            levelScoreGoal = levelStar_1;

            levelOffsetX = game.width / 2 - (game.global.tileSize * levelWidth) / 2 + 20;
            levelOffsetY = game.height / 2 - (game.global.tileSize * levelHeight) / 2;
        });

        rowCount = levelHeight;
        game.log();

        for (var i = 0; i < levelHeight; i++){
            characterMap[i] = [];
            sandMap[i] = [];
            for (var j = 0; j < levelWidth; j++){
                characterMap[i][j] = null;
                sandMap[i][j] = null;
            }
        }

        for(var key in levelObjects) {
            if (game.global.objects[levelObjects[key].object_id].object_type == 'sand') {
                sandMap[levelObjects[key].y-1][levelObjects[key].x-1] = {
                    'object_id': levelObjects[key].object_id,
                    'object_type': game.global.objects[levelObjects[key].object_id].object_type,
                    'live_count': game.global.objects[levelObjects[key].object_id].live_count,
                    'score': game.global.objects[levelObjects[key].object_id].score,
                    'count': levelObjects[key].count,
                    'options': levelObjects[key].options
                };
            } else if (game.global.objects[levelObjects[key].object_id].object_type == 'ruby') {
                rubyCount = levelObjects[key].count;
                rubyPosition = eval("("+levelObjects[key].options+")");
            } else {
                characterMap[levelObjects[key].y-1][levelObjects[key].x-1] = {
                    'object_id': levelObjects[key].object_id,
                    'object_type': game.global.objects[levelObjects[key].object_id].object_type,
                    'live_count': game.global.objects[levelObjects[key].object_id].live_count,
                    'score': game.global.objects[levelObjects[key].object_id].score,
                    'count': levelObjects[key].count,
                    'options': levelObjects[key].options
                };
            }
        }
    },

    preload: function() {
        game.load.image("levelback" + levelBackID, "assets/sprites/level_back/" + levelBackID + ".jpg");
    },

    create: function(){
        if (game.global.playMusic) {
            game.musicGameplay.play();
            game.musicMenu.stop();
        } else {
            game.musicMenu.stop();
            game.musicGameplay.stop();
        }

	  	game.add.image(0, 0, "levelback" + levelBackID);

        var RectBG = game.add.graphics(levelOffsetX -7, levelOffsetY -7 );
        RectBG.beginFill(0xffffec, 1);
        RectBG.drawRect(0, 0, game.global.tileSize * levelWidth +14, game.global.tileSize * levelHeight +14);
        RectBG.alpha = 1;

        scorePanel = game.add.image(15, game.height / 2, "scorePanel");
        scorePanel.anchor.setTo(0, 0.5);

        musicButton = game.add.button(40,172,"scorePanelSoundButton",this.toggleMusic,this);
        if(game.global.playMusic) {
            musicButton.frame = 0;
        } else {
            musicButton.frame = 3;
        }
        scorePanel.addChild(musicButton);

        soundButton = game.add.button(80,172,"scorePanelMusicButton",this.toggleSound,this);
        if(game.global.playSounds) {
            soundButton.frame = 0;
        } else {
            soundButton.frame = 3;
        }
        scorePanel.addChild(soundButton);

        var quitButton = game.add.button(120,172,"scorePanelQuitButton",this.quitLevel,this, 0,1,2);
        scorePanel.addChild(quitButton);

  		this.createLevel();

        pop[0] = game.add.audio("pop_1", 1);
        pop[1] = game.add.audio("pop_2", 1);
        pop[2] = game.add.audio("pop_3", 1);
        remove[0] = game.add.audio("remove_1", 1);
        remove[1] = game.add.audio("remove_2", 1);
        remove[2] = game.add.audio("remove_3", 1);

        levelIDText = game.add.text(95, -210, 'Уровень ' + levelID, { 'font': 'bold 20px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness:5});
        levelIDText.align = 'center';
        levelIDText.anchor.setTo(0.5);
        scorePanel.addChild(levelIDText);

        scoreText = game.add.text(50, -110, '0000000', { 'font': 'bold 22px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:3});
        scoreText.scale.y = 0.9;
        scoreText.align = 'center';
        scorePanel.addChild(scoreText);

        progressbar =  game.add.image(38, -135, "scorePanelProgressPanel");
        progressbarLine =  game.add.image(3, 3, "scorePanelProgressBar");

        progressbarLineMask = game.add.graphics(-75, -135);
        progressbarLineMask.beginFill(0xffffff);
        progressbarLineMask.drawRect(0,0,118,30);
        scorePanel.addChild(progressbarLineMask);
        progressbarLine.mask = progressbarLineMask;
        scorePanel.addChild(progressbarLineMask);

        progressbar.addChild(progressbarLine);

        progressbarStar1 =  game.add.image(10, -24, "scorePanelProgressStar1");
        progressbar.addChild(progressbarStar1);

        progressbarStar2 =  game.add.image(45, -24, "scorePanelProgressStar2");
        progressbar.addChild(progressbarStar2);

        progressbarStar3 =  game.add.image(80, -24, "scorePanelProgressStar3");
        progressbar.addChild(progressbarStar3);

        scorePanel.addChild(progressbar);

        scorePanelPlaceTarget = game.add.image(40, -75, "scorePanelPlaceTarget", 0);
        goalOffsetX = 7;
        goalOffsetTargetX = 15;

        for (var i = 0; i <= goals.length; i++) {
            targetPlace = game.add.image(0, goalOffsetTargetX, "scorePanelPlaceTargetCenter");
            scorePanelPlaceTarget.addChild(targetPlace);
            goalOffsetTargetX += 40;
        }

        targetPlace = game.add.image(0, goalOffsetTargetX, "scorePanelPlaceTarget", 2);
        scorePanelPlaceTarget.addChild(targetPlace);

        goalSprite = game.add.sprite(8, 6 + goalOffsetX, 'IconsScorePanel',2);
        goalText = game.add.text(50, 15 + goalOffsetX, levelScoreGoal, { 'font': 'bold 14px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness: 3});
        goalText.align = 'left';
        goalTextArr.score = goalText;
        goalTextArr.scoreX = 60;
        goalTextArr.scoreY = 14 + goalOffsetX;
        goalOffsetX += 40;
        scorePanelPlaceTarget.addChild(goalSprite);
        scorePanelPlaceTarget.addChild(goalText);

        if (goals.length > 0) {
            for (var i = 0; i < goals.length; i++) {
                if (goals[i].type == 'object' && goals[i].object_type == 'ruby') {
                    goalSprite = game.add.sprite(8, 6 + goalOffsetX, 'IconsScorePanel',0);
                    goalText = game.add.text(50, 15 + goalOffsetX, '0 / ' + goals[i].count, { 'font': 'bold 14px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness: 3});
                    goalText.text = '0 / ' + goals[i].count;
                    goalText.align = 'left';
                    goalTextArr.ruby = goalText;
                    goalTextArr.rubyX = 60;
                    goalTextArr.rubyY = 14 + goalOffsetX;
                }

                if (goals[i].type == 'object' && goals[i].object_type == 'bubble') {
                    goalSprite = game.add.sprite(8, 6 + goalOffsetX, 'IconsScorePanel',4);
                    goalText = game.add.text(50, 15 + goalOffsetX, '0 / ' + goals[i].count, { 'font': 'bold 14px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness: 3});
                    goalText.text = '0 / ' + goals[i].count;
                    goalText.align = 'left';
                    goalTextArr.bubble = goalText;
                    goalTextArr.bubbleX = 60;
                    goalTextArr.bubbleY = 14 + goalOffsetX;
                }

                if (goals[i].type == 'object' && goals[i].object_type == 'counter') {
                    goalSprite = game.add.sprite(8, 6 + goalOffsetX, 'IconsScorePanel',3);
                    goalText = game.add.text(50, 15 + goalOffsetX, '0 / ' + goals[i].count, { 'font': 'bold 14px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness: 3});
                    goalText.text = '0 / ' + goals[i].count;

                    goalText.align = 'left';
                    goalTextArr.counter = goalText;
                    goalTextArr.counterX = 60;
                    goalTextArr.counterY = 14 + goalOffsetX;
                }

                if (goals[i].type == 'object' && goals[i].object_type == 'sand') {
                    goalSprite = game.add.sprite(8, 6 + goalOffsetX, 'IconsScorePanel',5);
                    goalText = game.add.text(50, 15 + goalOffsetX, '0 / ' + goals[i].count, { 'font': 'bold 14px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness: 3});
                    goalText.text = '0 / ' + goals[i].count;
                    goalText.align = 'left';
                    goalTextArr.sand = goalText;
                    goalTextArr.sandX = 60;
                    goalTextArr.sandY = 14 + goalOffsetX;
                }

                if (goals[i].type == 'object' && goals[i].object_type == 'ghost') {
                    goalSprite = game.add.sprite(8, 6 + goalOffsetX, 'IconsScorePanel',1);
                    goalText = game.add.text(50, 15 + goalOffsetX, '-', { 'font': 'bold 14px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness: 3});

                    if (goals[i].count > 0) {
                        goalText.text = '0 / ' + goals[i].count;
                    } else {
                        goalText.text = '-'
                    }
                    goalText.align = 'left';
                    goalTextArr.ghost = goalText;
                    goalTextArr.ghostX = 60;
                    goalTextArr.ghostY = 14 + goalOffsetX;
                }
                goalOffsetX += 40;
                scorePanelPlaceTarget.addChild(goalSprite);
                scorePanelPlaceTarget.addChild(goalText);
            }
        }

        scorePanel.addChild(scorePanelPlaceTarget);
        levelMovesPlace =  game.add.image(40, -55 + goalOffsetTargetX, "scorePanelPlaceMoves");

        levelMovesText = game.add.text(30, 0, '00', { 'font': 'bold 45px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:5});
        levelMovesText.scale.y = 0.9;
        levelMovesText.text = ("00" + levelMoves).slice(-2);
        levelMovesText.align = 'center';
        levelMovesPlace.addChild(levelMovesText);

        movesText = game.add.text(22, 40, 'ходов', { 'font': 'bold 24px MainFont', fill: '#7129a7', stroke: '#fff', strokeThickness:3});
        movesText.align = 'center';
        levelMovesPlace.addChild(movesText);

        scorePanel.addChild(levelMovesPlace);

		game.input.onDown.add(this.pickTile, this);

        var blackFade = game.add.image(0 ,0, "blackfade");

        var fadeTween = game.add.tween(blackFade);

        fadeTween.to({
            alpha: 0
        }, 1000, Phaser.Easing.Linear.Out, true);
  	},

	createLevel: function(){
        score = 0;

        tileMapGroup = game.add.group();
        bonusMapGroup = game.add.group();
        tileSandGroup = game.add.group();
        arrowGroup = game.add.group();
        characterGroup = game.add.group();
        bonusGroup = game.add.group();
        characterBonusGroup = game.add.group();
/*** S T A R T    T U T O R I A L***/

        if (levelID == 1) {
            tutorialOn = true;
            tutorialObjectID = 0;
            tutorialObjectType = 'character';
            tutorialPickFirst = {x:1, y:2};
            tutorialObjectArr = [
                {x:1, y:2},
                {x:2, y:2},
                {x:3, y:2}
            ];

            tutorialMable = game.add.image(230, -150, "tutorialMable");

            var tutorialMableTween = this.add.tween(tutorialMable)
                .to({y: 80 }, 500, Phaser.Easing.Back.Out, true, 1000);

            tutorialMableTween.onComplete.add(function () {
                tutorialHint = game.add.image(350, 80, "tutorialHint");
                tutorialHint.alpha = 0;
                tmpText = 'Привет. Я покажу вам как играть. Соедините эти маблы.';
                tutorialHintText = game.add.text(35, 10, tmpText, { 'font': 'bold 12pt MainFont', fill: '#3e6fbd', 'width': 100, wordWrap: true, wordWrapWidth: 280 });
                tutorialHint.addChild(tutorialHintText);
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                tutorialArrow = game.add.image(0, 0, "tutorialArrow");
                tutorialArrow.alpha = 0;
                this.tutorialArrow(0);
            }, this);
        }

        if (levelID == 2) {
            tutorialOn = true;
            tutorialObjectID = 1;
            tutorialObjectType = 'character';
            tutorialPickFirst = {x:1, y:3};
            tutorialBonus = {x:3, y:2};
            tutorialObjectArr = [
                {x:1, y:3},
                {x:2, y:2},
                {x:3, y:2},
                {x:4, y:3},
                {x:5, y:3},
                {x:6, y:4},
                {x:6, y:5}
            ];

            tutorialMable = game.add.image(230, -150, "tutorialMable");

            var tutorialMableTween = this.add.tween(tutorialMable)
                .to({y: 80 }, 500, Phaser.Easing.Back.Out, true, 1000);

            tutorialMableTween.onComplete.add(function () {
                tutorialHint = game.add.image(350, 80, "tutorialHint");
                tutorialHint.alpha = 0;
                tmpText = 'Соедините длинную линию и посмотрите что произойдет.';
                tutorialHintText = game.add.text(35, 10, tmpText, { 'font': 'bold 12pt MainFont', fill: '#3e6fbd', 'width': 100, wordWrap: true, wordWrapWidth: 280 });
                tutorialHint.addChild(tutorialHintText);
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                tutorialArrow = game.add.image(0, 0, "tutorialArrow");
                tutorialArrow.alpha = 0;
                this.tutorialArrow(0);
            }, this);
        }


        if (levelID == 3) {
            tutorialOn = true;
            tutorialObjectID = 0;
            tutorialObjectType = 'character';
            tutorialPickFirst = {};
            tutorialBonus = {};
            tutorialObjectArr = [];

            tutorialMable = game.add.image(230, -150, "tutorialMable");

            var tutorialMableTween = this.add.tween(tutorialMable)
                .to({y: 5 }, 500, Phaser.Easing.Back.Out, true, 1000);

            tutorialMableTween.onComplete.add(function () {
                tutorialHint = game.add.image(350, 5, "tutorialHint");
                tutorialHint.alpha = 0;
                tmpText = 'Количество ходов на каждом уровне ограничено. На этом уровне дается ' + levelMoves + ' ходов!';
                tutorialHintText = game.add.text(35, 10, tmpText, { 'font': 'bold 12pt MainFont', fill: '#3e6fbd', 'width': 100, wordWrap: true, wordWrapWidth: 270 });
                tutorialHint.addChild(tutorialHintText);
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
            }, this);
        }

        if (levelID == 4) {
            tutorialOn = true;
            tutorialObjectID = 2;
            tutorialObjectType = 'character';
            tutorialPickFirst = {x:1, y:2};
            tutorialBonus = {x:3, y:2};
            tutorialObjectArr = [
                {x:1, y:2},
                {x:2, y:3},
                {x:3, y:2}
            ];

            tutorialMable = game.add.image(230, -150, "tutorialMable");

            var tutorialMableTween = this.add.tween(tutorialMable)
                .to({y: 80 }, 500, Phaser.Easing.Back.Out, true, 1000);

            tutorialMableTween.onComplete.add(function () {
                tutorialHint = game.add.image(350, 80, "tutorialHint");
                tutorialHint.alpha = 0;
                tmpText = 'Соедините эти маблы, чтобы удалить воду под ними';
                tutorialHintText = game.add.text(35, 10, tmpText, { 'font': 'bold 12pt MainFont', fill: '#3e6fbd', 'width': 100, wordWrap: true, wordWrapWidth: 280 });
                tutorialHint.addChild(tutorialHintText);
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                tutorialArrow = game.add.image(0, 0, "tutorialArrow");
                tutorialArrow.alpha = 0;
                this.tutorialArrow(0);
            }, this);
        }

        if (levelID == 6) {
            tutorialOn = true;
            tutorialObjectID = 3;
            tutorialObjectType = 'character';
            tutorialPickFirst = {x:2, y:5};
            tutorialObjectArr = [
                {x:2, y:5},
                {x:3, y:5},
                {x:4, y:5}
            ];

            tutorialMable = game.add.image(230, -150, "tutorialMable");

            var tutorialMableTween = this.add.tween(tutorialMable)
                .to({y: 80 }, 500, Phaser.Easing.Back.Out, true, 1000);

            tutorialMableTween.onComplete.add(function () {
                tutorialHint = game.add.image(350, 80, "tutorialHint");
                tutorialHint.alpha = 0;
                tmpText = 'Чтобы удалить шар, виберите маблы возле него: снизу, вверху или по бокам.';
                tutorialHintText = game.add.text(35, 10, tmpText, { 'font': 'bold 12pt MainFont', fill: '#3e6fbd', 'width': 100, wordWrap: true, wordWrapWidth: 280 });
                tutorialHint.addChild(tutorialHintText);
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                tutorialArrow = game.add.image(0, 0, "tutorialArrow");
                tutorialArrow.alpha = 0;
                this.tutorialArrow(0);
            }, this);
        }

        if (levelID == 9) {
            tutorialOn = true;
            tutorialObjectID = 0;
            tutorialObjectType = 'character';
            tutorialPickFirst = {x:0, y:5};
            tutorialObjectArr = [
                {x:0, y:5},
                {x:1, y:5},
                {x:2, y:4},
                {x:3, y:4},
                {x:4, y:4},
                {x:5, y:4},
                {x:6, y:5}
            ];

            tutorialMable = game.add.image(230, -150, "tutorialMable");

            var tutorialMableTween = this.add.tween(tutorialMable)
                .to({y: 80 }, 500, Phaser.Easing.Back.Out, true, 1000);

            tutorialMableTween.onComplete.add(function () {
                tutorialHint = game.add.image(350, 80, "tutorialHint");
                tutorialHint.alpha = 0;
                tmpText = 'Чтобы убрать МаблНум, нужно провести через него именно 35 маблов того же цвета.';
                tutorialHintText = game.add.text(35, 10, tmpText, { 'font': 'bold 11pt MainFont', fill: '#3e6fbd', 'width': 100, wordWrap: true, wordWrapWidth: 275 });
                tutorialHintText.lineSpacing = -6;
                tutorialHint.addChild(tutorialHintText);

                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                tutorialArrow = game.add.image(0, 0, "tutorialArrow");
                tutorialArrow.alpha = 0;
                this.tutorialArrow(0);
            }, this);
        }
/*** E N D    T U T O R I A L***/

        if (tutorialOn === true) {
            targetShow = false;
        }
  		for(var i = 0; i < levelHeight; i ++){
			characterArray[i] = [];
            tileSandArray[i] = [];
            bonusArray[i] = [];
			for(var j = 0;j < levelWidth; j ++){
                this.addSpecialTile(i, j);
            }
		}

        this.tilesFallDownNew();
//        testChr = game.add.sprite(200, 200, "test");
//        testChr.animations.add('test', [0,1,2,3,4,5,6], 12, true, true);
//        testChr.animations.play('test');
//        console.log(testChr);
    },

    addSpecialTile: function(row, col){
        var tileXPos = levelOffsetX + col * game.global.tileSize + game.global.tileSize / 2;
        var tileYPos = levelOffsetY + row * game.global.tileSize + game.global.tileSize / 2;

        tileMap = game.add.image(tileXPos, tileYPos, "tile_map");
        tileMap.anchor.setTo(0.5);
        tileMap.frame = (row+col) % 2;
        tileMapGroup.add(tileMap);

        if (tutorialOn == true && characterMap[row][col] == null) {
            for (key in tutorialObjectArr) {
                if (tutorialObjectArr[key].x == col && tutorialObjectArr[key].y == row) {
                    tutorialTileXPos = levelOffsetX + col * game.global.tileSize + game.global.tileSize / 2;
                    tutorialTileYPos = levelOffsetY + row * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY;
                    theTile = game.add.sprite(tutorialTileXPos, tutorialTileYPos, "mables");
                    theTile.special = false;
                    theTile.fall = false;
                    theTile.live_count = 1;
                    theTile.score = 100;
                    theTile.count = 0;
                    theTile.options = false;
                    theTile.drawBonus = false;
                    theTile.getBonus = false;
                    theTile.getBonusAnim = null;
                    theTile.bonus = 0;
                    theTile.bonusAnim = null;
                    theTile.explode_vector = 0;
                    theTile.frame = tutorialObjectID;
                    theTile.visited = false;
                    theTile.object_id = tutorialObjectID;
                    theTile.object_type = 'character';
                    theTile.anchor.setTo(0.5, 1);
                    characterArray[row][col] = theTile;
                    characterGroup.add(theTile);
                }
            }
        }

        if (sandMap[row][col] !== null)
        {
            var object_id = sandMap[row][col].object_id;
            var object_type = sandMap[row][col].object_type;
            var live_count = sandMap[row][col].live_count;
            var count = sandMap[row][col].count;
            var options = sandMap[row][col].options;

            var theTile = game.add.sprite(tileXPos, tileYPos, "spec_object");
            theTile.special = true;
            theTile.object_id = object_id;
            theTile.object_type = object_type;
            theTile.live_count = live_count;
            theTile.score = 0;
            theTile.frame = object_id-1;
            theTile.getBonusAnim = null;
            theTile.bonus = 0;
            theTile.bonusAnim = null;
            theTile.count = count;
            theTile.options = options;
            theTile.drawBonus = false;
            theTile.getBonus = false;
            theTile.explode_vector = 0;

            theTile.anchor.setTo(0.5);
            tileSandArray[row][col] = theTile;
            tileSandGroup.add(theTile);
        }
        else
        {
            tileSandArray[row][col] = null;
        }

        if (characterArray[row][col] == null && characterMap[row][col] !== null)
        {
            var object_id = characterMap[row][col].object_id;
            var object_type = characterMap[row][col].object_type;
            var live_count = characterMap[row][col].live_count;
            var score = characterMap[row][col].score;
            var count = characterMap[row][col].count;
            var options = characterMap[row][col].options;

            if (object_type == 'counter') {
                var theTile = game.add.sprite(tileXPos, tileYPos, "mables");
                theTile.special = true;
                theTile.object_id = object_id;
                theTile.object_type = object_type;
                theTile.live_count = live_count;
                theTile.score = score;
                theTile.frame = options - 1 + game.global.mables_count;
                theTile.bonus = 0;
                theTile.bonusAnim = null;
                theTile.count = count;
                theTile.options = options;
                theTile.drawBonus = false;
                theTile.getBonus = false;
                theTile.getBonusAnim = null;
                theTile.explode_vector = 0;

                var theTileCounter = game.add.sprite(-30, -30, "spec_object");
                theTileCounter.frame = object_id-1;
                theTile.addChild(theTileCounter);

                var countText = game.add.text(10, 0, count, { 'font': 'bold 16px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4});
                countText.anchor.setTo(0,1);
                theTile.countText = countText;
                theTile.addChild(countText);
            } else {
                var theTile = game.add.sprite(tileXPos, tileYPos, "spec_object");
                theTile.special = true;
                theTile.object_id = object_id;
                theTile.object_type = object_type;
                theTile.live_count = live_count;
                theTile.score = score;
                theTile.frame = object_id-1;
                theTile.getBonus = false;
                theTile.getBonusAnim = null;
                theTile.bonus = 0;
                theTile.bonusAnim = null;
                theTile.count = count;
                theTile.options = options;
                theTile.drawBonus = false;
                theTile.explode_vector = 0;
            }

            theTile.anchor.setTo(0.5);
            characterArray[row][col] = theTile;
            characterGroup.add(theTile);
        }
        else if (characterArray[row][col] == null)
        {
            if (levelFill == 1) {
                var tileXPos = levelOffsetX + col * game.global.tileSize + game.global.tileSize / 2;
                var tileYPos = levelOffsetY + row * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY;

                obj = game.objectFindByKey(rubyPosition, 'x', col + 1);

                if (obj !== null && parseInt(obj.y) == row + 1) {
                    rubyCount--;
                    rubyInMap++;

                    var object_id = 5;
                    var object_type = 'ruby';
                    var live_count = 0;
                    var score = 5000;
                    var count = 0;
                    var options = null;

                    theTile = game.add.sprite(tileXPos, tileYPos, "spec_object");
                    theTile.special = false;
                    theTile.fall = false;
                    theTile.object_id = object_id;
                    theTile.object_type = object_type;
                    theTile.live_count = live_count;
                    theTile.score = score;
                    theTile.frame = object_id - 1;
                    theTile.getBonus = false;
                    theTile.getBonusAnim = null;
                    theTile.bonus = 0;
                    theTile.bonusAnim = null;
                    theTile.count = count;
                    theTile.options = options;
                    theTile.visited = false;
                    theTile.drawBonus = false;
                    theTile.explode_vector = 0;
                    theTile.anchor.setTo(0.5, 1.2);
                    characterArray[row][col] = theTile;
                    console.log(theTile);
                    bonusGroup.add(theTile);
                } else {
                    var randomCharacter = game.rnd.between(0, levelMaxColor - 1);
                    if (tutorialObjectID !== null) {
                        if (randomCharacter == tutorialObjectID) {
                            this.addSpecialTile(row, col);
                            return false;
                        }
                    }
                    theTile = game.add.sprite(tileXPos, tileYPos, "mables");
                    theTile.special = false;
                    theTile.fall = false;
                    theTile.live_count = 1;
                    theTile.score = 100;
                    theTile.count = 0;
                    theTile.options = false;
                    theTile.drawBonus = false;
                    theTile.getBonus = false;
                    theTile.getBonusAnim = null;
                    theTile.bonus = 0;
                    theTile.bonusAnim = null;
                    theTile.explode_vector = 0;
                    theTile.frame = randomCharacter;
                    theTile.visited = false;
                    theTile.object_id = randomCharacter;
                    theTile.object_type = 'character';
                    theTile.anchor.setTo(0.5, 1);
                    characterArray[row][col] = theTile;
                    characterGroup.add(theTile);
                }
            } else {
                characterArray[row][col] = null;
            }
        }

        bonusArray[row][col] = null;
    },

    tutorialArrow: function(key){
        if (tutorialArrowShow == false) {
            tutorialArrow.alpha = 0;
            return false;
        }

        if (key == 0) {
            tutorialTileXPos = levelOffsetX + tutorialObjectArr[key].x * game.global.tileSize + game.global.tileSize / 2;
            tutorialTileYPos = levelOffsetY + tutorialObjectArr[key].y * game.global.tileSize + game.global.tileSize / 2;
            tutorialArrow.x = tutorialTileXPos;
            tutorialArrow.y = tutorialTileYPos;
            var tutorialArrowTween = this.add.tween(tutorialArrow)
                .to({alpha: 1}, 100, Phaser.Easing.Linear.None, true, 1000);
            tutorialArrowTween.onComplete.add(function(){
                round = game.add.image(tutorialTileXPos, tutorialTileYPos, "tutorialRound");
                round.anchor.setTo(0.5,0.5);
                round.alpha = 0;
                round.scale.setTo(0.2);
                var tutorialRoundTween = this.add.tween(round)
                    .to({alpha: 1}, 300, Phaser.Easing.Linear.None, true)
                    .onComplete.add(function(current){
                        var tutorialRoundTween = this.add.tween(current)
                            .to({alpha: 0}, 300, Phaser.Easing.Linear.None, true);
                    },this);

                var tutorialRoundTween = this.add.tween(round.scale)
                    .to({x:0.6, y:0.6}, 600, Phaser.Easing.Linear.None, true);
                if (tutorialArrowShow == true) {
                    this.tutorialArrow(key + 1);
                }
            }, this);
        } else if (tutorialObjectArr[key] == undefined) {
            round = game.add.image(tutorialTileXPos, tutorialTileYPos, "tutorialRound");
            round.anchor.setTo(0.5,0.5);
            round.alpha = 0;
            round.scale.setTo(0.2);
            var tutorialRoundTween = this.add.tween(round)
                .to({alpha: 1}, 300, Phaser.Easing.Linear.None, true)
                .onComplete.add(function(current){
                    var tutorialRoundTween = this.add.tween(current)
                        .to({alpha: 0}, 300, Phaser.Easing.Linear.None, true)
                        .onComplete.add(function(current){
                            current.destroy();
                            current = null;
                        },this);
                },this);

            var tutorialRoundTween = this.add.tween(round.scale)
                .to({x:0.6, y:0.6}, 600, Phaser.Easing.Linear.None, true);

            var tutorialArrowTween = this.add.tween(tutorialArrow)
                .to({alpha:0}, 500, Phaser.Easing.Linear.None, true);
            tutorialArrowTween.onComplete.add(function(current){
                if (tutorialArrowShow == true) {
                    this.tutorialArrow(0);
                }
            }, this);
        } else {
            tutorialTileXPos = levelOffsetX + tutorialObjectArr[key].x * game.global.tileSize + game.global.tileSize / 2;
            tutorialTileYPos = levelOffsetY + tutorialObjectArr[key].y * game.global.tileSize + game.global.tileSize / 2;
            var tutorialArrowTween = this.add.tween(tutorialArrow)
                .to({x: tutorialTileXPos, y:tutorialTileYPos}, 500, Phaser.Easing.Linear.None, true);
            tutorialArrowTween.onComplete.add(function(current){
                if (tutorialArrowShow == true) {
                    this.tutorialArrow(key + 1);
                }
            }, this);
        }
    },

	pickTile: function() {
        arrowArray = [];
        visitedTiles = [];
        bonusTiles = [];

        startX = game.input.worldX - levelOffsetX;
        startY = game.input.worldY - levelOffsetY;

        var pickedRow = Math.floor(startY / game.global.tileSize);
        var pickedCol = Math.floor(startX / game.global.tileSize);

		if(characterArray[pickedRow] && characterArray[pickedRow][pickedCol] !== null && pickedRow >= 0 && pickedCol >= 0 && pickedRow <levelHeight && pickedCol < levelWidth && characterArray[pickedRow][pickedCol].special === false){

            if (tutorialOn === true && (pickedRow !== tutorialPickFirst.y || pickedCol !== tutorialPickFirst.x)) {
                return false;
            }

            if (characterArray[pickedRow][pickedCol].object_type == 'ruby') {
                return false;
            }

			if(game.global.playSounds){
          		var randomPop = game.rnd.between(0, pop.length - 1);
          		pop[randomPop].play("", 0, 1, false);
            }

			startObjectID = characterArray[pickedRow][pickedCol].object_id;

            characterArray[pickedRow][pickedCol].frame = characterArray[pickedRow][pickedCol].object_id + game.global.mables_count;

            characterArray[pickedRow][pickedCol].visited = true;

            if (characterArray[pickedRow][pickedCol].bonus !== 0) {
                moveBonusIndex += characterArray[pickedRow][pickedCol].bonus;
            }
            bonusCounter = 0;

            if (moveBonusIndex !== 0) {
                if (moveBonusIndex == 2) {
                    this.drawBonusHorizontal(pickedRow, pickedCol);
                    this.bonusHorizontal(pickedRow, pickedCol);
                } else if (moveBonusIndex == 3) {
                    this.drawBonusVertical(pickedRow, pickedCol);
                    this.bonusVertical(pickedRow, pickedCol);
                }
            }


            var tweenScale = this.add.tween(characterArray[pickedRow][pickedCol].scale).to({x: 0.95, y: 1.1}, 100, Phaser.Easing.Back.Out, true, 0);
            tweenScale.onComplete.add(function(currentTile){
                game.add.tween(currentTile).to({x: 1, y: 1}, 100, Phaser.Easing.Back.Out, true, 0);
            });

            for(var i = 0; i < characterArray.length; i ++){
                for(var j = 0;j < characterArray[i].length; j ++){
                    if (characterArray[i][j] !== null && characterArray[i][j].object_type == 'character' && characterArray[i][j].object_id != startObjectID){
                        this.add.tween(characterArray[i][j]).to({alpha: 0.4}, 300, Phaser.Easing.Back.Out, true, 0);
                    }
                }
            }

			visitedTiles.push({
				row: pickedRow,
				col: pickedCol
			});

			game.input.onDown.remove(this.pickTile, this);
			game.input.onUp.add(this.releaseTile, this);
			moveIndex = game.input.addMoveCallback(this.moveTile, this)
		}
	},

	moveTile: function(){

		var currentX = game.input.worldX - levelOffsetX;
		var currentY = game.input.worldY - levelOffsetY;
		var currentRow = Math.floor(currentY/game.global.tileSize);
		var currentCol = Math.floor(currentX/game.global.tileSize);

		if(currentRow >= 0 && currentCol >= 0 && currentRow <levelHeight && currentCol < levelWidth){

			var centerX = currentCol * game.global.tileSize + game.global.tileSize / 2;
			var centerY = currentRow * game.global.tileSize + game.global.tileSize / 2;

			var distX = currentX - centerX;
			var distY = currentY - centerY;

			if(distX * distX + distY * distY < game.global.tolerance){

				if(currentRow != visitedTiles[visitedTiles.length - 1].row || currentCol != visitedTiles[visitedTiles.length - 1].col){

					if(!this.isTilePicked({row: currentRow, col: currentCol})){

						if(Math.abs(currentRow - visitedTiles[visitedTiles.length - 1].row) <= 1 && Math.abs(currentCol - visitedTiles[visitedTiles.length - 1].col) <= 1){

                            if (characterArray[currentRow][currentCol] === null)
                            {
                                return false;
                            }

							var currentColor = characterArray[currentRow][currentCol].object_id;

							if(startObjectID == currentColor && characterArray[currentRow][currentCol].special === false){

                                if(game.global.playSounds){
                                var randomPop = game.rnd.between(0, pop.length - 1);
                                pop[randomPop].play("", 0, 1, false);
                                }

                                characterArray[currentRow][currentCol].frame = characterArray[currentRow][currentCol].object_id + game.global.mables_count;
                                characterArray[currentRow][currentCol].visited = true;


                                var tweenScale = this.add.tween(characterArray[currentRow][currentCol].scale).to({x: 0.95, y: 1.1}, 100, Phaser.Easing.Back.Out, true, 0);
                                tweenScale.onComplete.add(function(currentTile){
                                    game.add.tween(currentTile).to({x: 1, y: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                                });

                                if (characterArray[currentRow][currentCol].bonus !== 0) {
                                    moveBonusIndex += characterArray[currentRow][currentCol].bonus;
                                }

                                for(var i = 0; i < bonusTiles.length; i ++){
                                    characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonus = false;
                                    characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonusTwo = false;
                                }

                                for(var i = 0; i < visitedTiles.length; i ++){
                                    characterArray[visitedTiles[i].row][visitedTiles[i].col].drawBonus = true;
                                    characterArray[visitedTiles[i].row][visitedTiles[i].col].drawBonusTwo = false;
                                }

                                characterArray[currentRow][currentCol].visited = true;

                                bonusMapGroup.removeAll();
                                for (var c = 0; c < currentCounterBonus.length; c++) {
                                    counter = currentCounterBonus[c].countText;
                                    counter.text = currentCounterBonus[c].count;
                                    currentCounterBonus.splice(c,1);
                                }
                                bonusCounter = 0;

                                if (moveBonusIndex !== 0) {
                                    if (moveBonusIndex == 2) {
                                        this.drawBonusHorizontal(currentRow, currentCol);
                                        this.bonusHorizontal(currentRow, currentCol);
                                    } else if (moveBonusIndex == 3) {
                                        this.drawBonusVertical(currentRow, currentCol);
                                        this.bonusVertical(currentRow, currentCol);
                                    } else {
                                        characterArray[currentRow][currentCol].drawBonusTwo = true;
                                        this.drawBonusHorizontal(currentRow, currentCol);
                                        this.drawBonusVertical(currentRow, currentCol);
                                        this.bonusHorizontal(currentRow, currentCol);
                                        this.bonusVertical(currentRow, currentCol);
                                    }
                                }

                                /*

                                we will add arrows to show the path made by the
                                player.

                                placeArrow function will handle this, with current row
                                and column as arguments

                                */

								this.placeArrow(currentRow, currentCol);
	                                   if(arrowArray.length > 1){
									arrowArray[arrowArray.length - 2].frame -= 2;
								}

								/*

								pushing the coordinate object into visitedTiles
								array just like before

								*/

	                                   visitedTiles.push({
									row:currentRow,
									col:currentCol
								});

                                if (currentCounter!== null) {
                                    currentCounter.countGoal = visitedTiles.length + bonusCounter;
                                    counter = currentCounter.countText;
                                    counter.text = (currentCounter.count - currentCounter.countGoal < 0) ? 0 : currentCounter.count - currentCounter.countGoal ;
                                }

                                if (visitedTiles.length > 0) {
                                    if ((visitedTiles.length) % levelBonusStep === 0) {
//                                        characterArray[currentRow][currentCol].bonus.add('getBonus', [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], 15, true, true);
//                                        characterArray[currentRow][currentCol].animations.play('getBonus');

                                        if (characterArray[currentRow][currentCol].getBonusAnim === null) {
                                            bonusFX = game.add.sprite(characterArray[currentRow][currentCol].x, characterArray[currentRow][currentCol].y - game.global.tileSize / 2 - game.global.tileOffsetY, "effects");
                                            bonusFX.anchor.setTo(0.5);
                                            bonusFX.animations.add('bonus', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 15, true, true);
                                            bonusGroup.add(bonusFX);
                                            characterArray[currentRow][currentCol].getBonusAnim = bonusFX;
                                        }
                                        characterArray[currentRow][currentCol].getBonusAnim.alpha = 1;
                                        characterArray[currentRow][currentCol].getBonusAnim.animations.play('bonus');
                                        characterArray[currentRow][currentCol].getBonus = true;
                                        characterArray[currentRow][currentCol].frame = characterArray[currentRow][currentCol].object_id + game.global.mables_count;
                                        characterBonusGroup.add(characterArray[currentRow][currentCol]);
                                    }
                                }
							} else if (characterArray[currentRow][currentCol].object_type == 'counter' && (characterArray[currentRow][currentCol].options -1) == startObjectID && characterArray[currentRow][currentCol].special === true) {
                                /********/
                                if(game.global.playSounds){
                                    var randomPop = game.rnd.between(0, pop.length - 1);
                                    pop[randomPop].play("", 0, 1, false);
                                }

                                characterArray[currentRow][currentCol].visited = true;

                                for(var i = 0; i < bonusTiles.length; i ++){
                                    characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonus = false;
                                    characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonusTwo = false;
                                }

                                for(var i = 0; i < visitedTiles.length; i ++){
                                    characterArray[visitedTiles[i].row][visitedTiles[i].col].drawBonus = true;
                                    characterArray[visitedTiles[i].row][visitedTiles[i].col].drawBonusTwo = false;
                                }

                                bonusMapGroup.removeAll();


                                for (var c = 0; c < currentCounterBonus.length; c++) {
                                    counter = currentCounterBonus[c].countText;
                                    counter.text = currentCounterBonus[c].count;
                                    currentCounterBonus.splice(c,1);
                                }
                                bonusCount = 0;
                                if (moveBonusIndex !== 0) {
                                    if (moveBonusIndex == 2) {
                                        this.drawBonusHorizontal(currentRow, currentCol);
                                    } else if (moveBonusIndex == 3) {
                                        this.drawBonusVertical(currentRow, currentCol);
                                    } else {
                                        characterArray[currentRow][currentCol].drawBonusTwo = true;
                                        this.drawBonusHorizontal(currentRow, currentCol);
                                        this.drawBonusVertical(currentRow, currentCol);
                                    }
                                }

                                this.placeArrow(currentRow, currentCol);
                                if(arrowArray.length > 1){
                                    arrowArray[arrowArray.length - 2].frame -= 2;
                                }

                                visitedTiles.push({
                                    row:currentRow,
                                    col:currentCol
                                });

                                currentCounter = characterArray[currentRow][currentCol];
                                currentCounter.countGoal = visitedTiles.length + bonusCounter;
                                counter = currentCounter.countText;
                                counter.text = (currentCounter.count - currentCounter.countGoal < 0) ? 0 : currentCounter.count - currentCounter.countGoal ;

                                if (visitedTiles.length > 0){
                                    if ((visitedTiles.length) % levelBonusStep === 0) {
//                                        characterArray[currentRow][currentCol].animations.add('getBonus', [2], 15, true, true);
//                                        characterArray[currentRow][currentCol].animations.play('getBonus');
                                        characterArray[currentRow][currentCol].getBonus = true;
                                    }
                                }
                                /********/
                            }
						}
					} else {

						if(currentRow == visitedTiles[visitedTiles.length - 2].row && currentCol == visitedTiles[visitedTiles.length - 2].col){

//							tileArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].frame = startObjectID;

                            var tweenScale = this.add.tween(characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].scale).to({x: 0.95, y: 1.1}, 100, Phaser.Easing.Back.Out, true, 0);
                            tweenScale.onComplete.add(function(currentTile){
                                game.add.tween(currentTile).to({x: 1, y: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                            });

                            if (currentCounter!== null) {
                                currentCounter.countGoal -= 1;
                                counter = currentCounter.countText;
                                counter.text = (currentCounter.count - currentCounter.countGoal < 0) ? 0 : currentCounter.count - currentCounter.countGoal ;
                            }

                            if (characterArray[visitedTiles[visitedTiles.length -1].row][visitedTiles[visitedTiles.length -1].col] == currentCounter) {
                                counter = currentCounter.countText;
                                counter.text = currentCounter.count;
                                currentCounter = null;
                            }

                            /*

                            then we call removeLastArrow function which will remove
                            the last arrow

                            */
                            if (characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].getBonus === true) {
                                if (characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].getBonusAnim !== null) {
                                    characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].getBonusAnim.animations.stop(null, true);
                                    characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].getBonusAnim.alpha = 0;
                                }
                                characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].getBonus = false;
                            }

                            if (characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].special === false) {
                                if (characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].bonus === 0) {
                                    characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].frame = startObjectID;
                                    characterGroup.add(characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col]);
                                }
//                                else if (characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].bonus == 2) {
//                                    characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].animations.play('bonusH');
//                                }
//                                else if (characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].bonus == 3) {
//                                    characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].animations.play('bonusV');
//                                }
                            }

                            if (characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].bonus !== 0) {
                                moveBonusIndex -= characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].bonus;
                            }

                            for(var i = 0; i < bonusTiles.length; i ++){
                                characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonus = false;
                                characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonusTwo = false;
                            }

                            for(var i = 0; i < visitedTiles.length-2; i ++){
                                characterArray[visitedTiles[i].row][visitedTiles[i].col].drawBonus = true;
                            }

                            characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].drawBonus = false;
                            characterArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].visited = false;

                            bonusMapGroup.removeAll();
                            for (var c = currentCounterBonus.length -1; c >= 0; c--) {
                                counter = currentCounterBonus[c].countText;
                                counter.text = currentCounterBonus[c].count;
                                currentCounterBonus.splice(c,1);
                            }
                            bonusCounter = 0;
                            if (moveBonusIndex !== 0) {
                                if (moveBonusIndex == 2) {
                                    this.drawBonusHorizontal(currentRow, currentCol);
                                    this.bonusHorizontal(currentRow, currentCol);
                                } else if (moveBonusIndex == 3) {
                                    this.drawBonusVertical(currentRow, currentCol);
                                    this.bonusVertical(currentRow, currentCol);
                                } else {
                                    characterArray[currentRow][currentCol].drawBonusTwo = true;
                                    this.drawBonusHorizontal(currentRow, currentCol);
                                    this.drawBonusVertical(currentRow, currentCol);
                                    this.bonusHorizontal(currentRow, currentCol);
                                    this.bonusVertical(currentRow, currentCol);
                                }
                            }

                            this.removeLastArrow();

							/*

							playing a random pop sound just like before

							*/

                                   if(game.global.playSounds){
                                   	var randomPop = game.rnd.between(0, pop.length - 1);
                                   	pop[randomPop].play("", 0, 1, false);
                             		}

                             		/*

                             		finally, we remove the latest item from visitedTiles array.

                             		Backtrack completed!!

                             		*/

                             		visitedTiles.pop();
						}
					}
				}
			}
		}
	},

    releaseTile:function(){

		game.input.onUp.remove(this.releaseTile, this);
		game.input.deleteMoveCallback(moveIndex);

		for(var i = 0; i < arrowArray.length; i ++){
           arrowArray[i].destroy();
           arrowArray[i]  = null;
        }

        for (i = 0; i < visitedTiles.length; i++) {
            characterArray[visitedTiles[i].row][visitedTiles[i].col].drawBonus = false;
            characterArray[visitedTiles[i].row][visitedTiles[i].col].visited = false;
            if (characterArray[visitedTiles[i].row][visitedTiles[i].col].special === false) {
                if (characterArray[visitedTiles[i].row][visitedTiles[i].col].bonus === 0) {
                    characterArray[visitedTiles[i].row][visitedTiles[i].col].frame = startObjectID;
                }
//                else if (characterArray[visitedTiles[i].row][visitedTiles[i].col].bonus == 2) {
//                    characterArray[visitedTiles[i].row][visitedTiles[i].col].animations.play('bonusH');
//                }
//                else if (characterArray[visitedTiles[i].row][visitedTiles[i].col].bonus == 3) {
//                    characterArray[visitedTiles[i].row][visitedTiles[i].col].animations.play('bonusV');
//                }
            }

              var tweenScale = this.add.tween(characterArray[visitedTiles[i].row][visitedTiles[i].col].scale).to({x: 0.95, y: 1.1}, 100, Phaser.Easing.Back.Out, true, 0);
              tweenScale.onComplete.add(function(currentTile){
                  var tweenScale = game.add.tween(currentTile).to({x: 1, y: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                  tweenScale.onComplete.add(function(currentTile){
                      var tweenScale = game.add.tween(currentTile).to({x: 0.98, y: 1.05}, 100, Phaser.Easing.Back.Out, true, 0);
                      tweenScale.onComplete.add(function(currentTile){
                          var tweenScale = game.add.tween(currentTile).to({x: 1, y: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                      });
                  });
              });

              var CurrentPosY = characterArray[visitedTiles[i].row][visitedTiles[i].col].y;
              var tweenScale = this.add.tween(characterArray[visitedTiles[i].row][visitedTiles[i].col]).to({y: CurrentPosY - 1},100, Phaser.Easing.Back.Out, true, 100);
              tweenScale.onComplete.add(function(currentTile, CurrentPosY){
                  var tweenScale = game.add.tween(currentTile).to({y: currentTile.y + 1}, 100, Phaser.Easing.Back.Out, true, 0);
              });
         }

        if (tutorialOn == false) {
            for (i = 0; i < characterArray.length; i++) {
                for (var j = 0; j < characterArray[i].length; j++) {
                    this.add.tween(characterArray[i][j]).to({alpha: 1}, 200, Phaser.Easing.Back.Out, true, 200);
                }
            }
        }
        if(game.global.playSounds){
            var randomRemove = game.rnd.between(0, remove.length - 1);
            remove[randomRemove].play("", 0, 1, false);
        }

          /*

          now it's time to destroy some globes, but only if we still have time
          to play and at least three globes have been selected

          */

		if(levelMoves > 0 && visitedTiles.length > 2 && (tutorialOn == false || (visitedTiles.length == tutorialObjectArr.length))){
            this.decreaseMove();
            ghostProtect = true;
            visitedCount = 0;
            scoreIncrease = 0;
            userMoves.push([]);
            this.removeVisitedTiles();
		} else {

            if (currentCounter!== null) {
                currentCounter.countGoal = 0;
                counter = currentCounter.countText;
                counter.text = currentCounter.count;
                currentCounter = null;
            }

            moveBonusIndex = 0;
            for(var i = 0; i < bonusTiles.length; i ++){
                characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonus = false;
                characterArray[bonusTiles[i].row][bonusTiles[i].col].drawBonusTwo = false;
            }
            bonusMapGroup.removeAll();
            for (var c = currentCounterBonus.length -1; c >= 0; c--) {
                counter = currentCounterBonus[c].countText;
                counter.text = currentCounterBonus[c].count;
                currentCounterBonus.splice(c,1);
            }
            this.input.onDown.add(this.pickTile, this);
        }

        if (tutorialOn == true && tutorialArrowShow == false) {
            tutorialArrowShow = true;
            this.tutorialArrow(0);
        }
	},

    removeVisitedTiles:function() {
        if (visitedTiles.length) {
            i = 0;

            if (characterArray[visitedTiles[i].row][visitedTiles[i].col] === null) {
                visitedTiles.shift();
                this.tilesFallDownNew();
                return false;
            }

            if (tutorialOn == true) {
                tutorialCheck.push({x:visitedTiles[i].col, y:visitedTiles[i].row});
            }

            if(game.global.playSounds){
                var randomRemove = game.rnd.between(0, remove.length - 1);
                remove[randomRemove].play("", 0, 1, false);
            }

            var tileScore = characterArray[visitedTiles[i].row][visitedTiles[i].col].score;
            var tilePosX = characterArray[visitedTiles[i].row][visitedTiles[i].col].x;
            var tilePosY = characterArray[visitedTiles[i].row][visitedTiles[i].col].y;

            if (visitedCount!= 0 && visitedCount % 3 == 0) {
                scoreIncrease++;
            }

            visitedCount++;

            if (characterArray[visitedTiles[i].row][visitedTiles[i].col].special === false) {
                tileScore += scoreIncrease * scoreIncreaseCount;
            } else if (characterArray[visitedTiles[i].row][visitedTiles[i].col] === currentCounter && characterArray[visitedTiles[i].row][visitedTiles[i].col].countGoal >= characterArray[visitedTiles[i].row][visitedTiles[i].col].count) {
                tileScore += scoreIncrease * scoreIncreaseCount;
            } else if (characterArray[visitedTiles[i].row][visitedTiles[i].col] === currentCounter && characterArray[visitedTiles[i].row][visitedTiles[i].col].countGoal < characterArray[visitedTiles[i].row][visitedTiles[i].col].count) {
                tileScore = 100 + scoreIncrease * scoreIncreaseCount;
            }

            if (visitedTiles.length  == 1) {
                if (moveBonusIndex != 0) {
                    tileScore += 400;
                }
            }
            this.increaseScore(tileScore);

            if (characterArray[visitedTiles[i].row][visitedTiles[i].col] !== null && characterArray[visitedTiles[i].row][visitedTiles[i].col].neighbours['special'].length) {
                for (var r = 0; r < characterArray[visitedTiles[i].row][visitedTiles[i].col].neighbours['special'].length; r++) {
                    var posX = characterArray[visitedTiles[i].row][visitedTiles[i].col].neighbours['special'][r].x;
                    var posY = characterArray[visitedTiles[i].row][visitedTiles[i].col].neighbours['special'][r].y;
                    if (neighboursArr.indexOf(posX + '_' + posY) < 0) {
                        neighboursArr.push(posX + '_' + posY);
                        if (characterArray[posY][posX] !== null && characterArray[posY][posX].live_count > 0) {
                            if (--characterArray[posY][posX].live_count == 0) {
                                if (characterArray[posY][posX].object_type == 'ghost') {
                                    ghostProtect = false;
                                    userCollectObject.ghost++;
                                    userMoves[userMoves.length - 1].push(8);
                                    this.increaseScore(50);
                                }
                                if (characterArray[posY][posX].object_type == 'bubble') {
                                    userCollectObject.bubble++;
                                    userMoves[userMoves.length - 1].push(3);
                                    this.increaseScore(50);
                                }
                                characterArray[posY][posX].destroy();
                                characterArray[posY][posX] = null;
                            } else {
                                if (characterArray[posY][posX].object_type == 'bubble') {
                                    characterArray[posY][posX].frame -= 5;
                                    userMoves[userMoves.length - 1].push(14);
                                    this.increaseScore(50);
                                }
                            }
                        }
                    }
                }
            }

            if (tileSandArray[visitedTiles[i].row][visitedTiles[i].col] !== null && tileSandArray[visitedTiles[i].row][visitedTiles[i].col].special === true) {
                tileSandArray[visitedTiles[i].row][visitedTiles[i].col].alpha = 0;
                tileSandArray[visitedTiles[i].row][visitedTiles[i].col].destroy();
                tileSandArray[visitedTiles[i].row][visitedTiles[i].col] = null;
                userMoves[userMoves.length-1].push(7);
                userCollectObject.sand++;
            }

            if (characterArray[visitedTiles[i].row][visitedTiles[i].col].getBonus === true) {
                var bonus = game.add.sprite(
                    characterArray[visitedTiles[i].row][visitedTiles[i].col].x,
                        characterArray[visitedTiles[i].row][visitedTiles[i].col].y-30,
                    'bonus'
                );

                bonusGroup.add(bonus);
                bonus.anchor.setTo(0.5);

                bonus.animations.add('bonus', [0,1,2,3,4,5,6,7,8], 15, true, true);
                bonus.animations.play('bonus');

                this.add.tween(bonus).to({y:'-50'}, 1000, Phaser.Easing.Linear.None, true);
                this.add.tween(bonus.scale).to({x:1, y:1}, 1000, Phaser.Easing.Linear.None, true);

                bonusArray[visitedTiles[i].row][visitedTiles[i].col] = bonus;
            }

            if (characterArray[visitedTiles[i].row][visitedTiles[i].col].special === false) {
                if (characterArray[visitedTiles[i].row][visitedTiles[i].col].bonus != 0) {
                    userMoves[userMoves.length-1].push(1);
                } else {
                    userMoves[userMoves.length-1].push(0);
                }
                if (characterArray[visitedTiles[i].row][visitedTiles[i].col].getBonusAnim !== null) {
                    characterArray[visitedTiles[i].row][visitedTiles[i].col].getBonusAnim.destroy();
                    characterArray[visitedTiles[i].row][visitedTiles[i].col].getBonusAnim = null;
                }
                if (characterArray[visitedTiles[i].row][visitedTiles[i].col].bonusAnim !== null) {
                    characterArray[visitedTiles[i].row][visitedTiles[i].col].bonusAnim.destroy();
                    characterArray[visitedTiles[i].row][visitedTiles[i].col].bonusAnim = null;
                }
                characterArray[visitedTiles[i].row][visitedTiles[i].col].destroy();
                characterArray[visitedTiles[i].row][visitedTiles[i].col] = null;
                userCollectObject.character++;
            } else if (characterArray[visitedTiles[i].row][visitedTiles[i].col].special === true && characterArray[visitedTiles[i].row][visitedTiles[i].col].object_type == 'counter' && characterArray[visitedTiles[i].row][visitedTiles[i].col].count > characterArray[visitedTiles[i].row][visitedTiles[i].col].countGoal) {
                characterArray[visitedTiles[i].row][visitedTiles[i].col].count = characterArray[visitedTiles[i].row][visitedTiles[i].col].count - characterArray[visitedTiles[i].row][visitedTiles[i].col].countGoal;
                for (var c = currentCounterBonus.length -1; c >= 0; c--) {
                    if (currentCounter == currentCounterBonus[c]) {
                        currentCounterBonus.splice(c,1);
                    }
                }
                currentCounter = null;
                userMoves[userMoves.length-1].push(5);
            } else if (characterArray[visitedTiles[i].row][visitedTiles[i].col].special === true && characterArray[visitedTiles[i].row][visitedTiles[i].col].object_type == 'counter' && characterArray[visitedTiles[i].row][visitedTiles[i].col].count <= characterArray[visitedTiles[i].row][visitedTiles[i].col].countGoal) {
                characterArray[visitedTiles[i].row][visitedTiles[i].col].destroy();
                characterArray[visitedTiles[i].row][visitedTiles[i].col] = null;
                for (var c = currentCounterBonus.length -1; c >= 0; c--) {
                    if (currentCounter == currentCounterBonus[c]) {
                        currentCounterBonus.splice(c,1);
                    }
                }
                currentCounter = null;
                userMoves[userMoves.length-1].push(4);
                userCollectObject.counter++;
            }
            font = { 'font': '12px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
            if (visitedTiles.length  == 1) {
                if (moveBonusIndex != 0) {
                    if (levelID == 2 && tutorialBonusExplode === false) {
                        var tutorialHintTween = this.add.tween(tutorialHint)
                            .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 100);

                        var tutorialMableTween = this.add.tween(tutorialMable)
                            .to({y: 10 }, 500, Phaser.Easing.Back.Out, true, 100);

                        tutorialMableTween.onComplete.add(function () {
                            tutorialHint.y = 10;
                            tutorialHintText.text = 'Создавайте еще СуперМаблы, чтобы набрать ' + levelStar_1 + ' очков.';
                            tutorialHint.addChild(tutorialHintText);
                            var tutorialHintTween = this.add.tween(tutorialHint)
                                .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                        }, this);
                        tutorialBonusExplode = true;
                    }
                    var currentRow = visitedTiles[i].row;
                    var currentCol = visitedTiles[i].col;
                    if (moveBonusIndex == 2) {
                        this.explodeBonusHorizontal(currentRow, currentCol);
                    } else if (moveBonusIndex == 3) {
                        this.explodeBonusVertical(currentRow, currentCol);
                    } else {
                        this.explodeBonusHorizontal(currentRow, currentCol);
                        this.explodeBonusVertical(currentRow, currentCol);
                    }

                    moveBonusIndex = 0;
                    bonusMapGroup.removeAll();
                    font = { 'font': '16px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                }

                if (levelID <= 10) {
                    game.getServer({social_id: game.global.social_id, method: 'saveUserScore', score: score, level_id: levelID}, function(){}, true);
                }
            }

            var explode = game.add.sprite(
                    visitedTiles[i].col * game.global.tileSize + game.global.tileSize / 2 + levelOffsetX,
                    visitedTiles[i].row * game.global.tileSize + game.global.tileSize / 2 + levelOffsetY,
                'explode'
            );

            visitedTiles.shift();
            explode.anchor.setTo(0.5);

            var animExplosion = explode.animations.add('explode',[1,2,3,8,9,10,11],15,false,true);
            explode.animations.play('explode');
            animExplosion.killOnComplete = true;

            var scoreTile = game.add.text(tilePosX, tilePosY, tileScore, font);
            scoreTile.anchor.setTo(0.6, 1.5);
            var scoreTileTween = this.add.tween(scoreTile)
                .to({alpha: 0, y:tilePosY-20 }, 2000, Phaser.Easing.Back.In, true, 0);
            scoreTileTween.onComplete.add(function(){
                scoreTile.destroy();
                scoreTile = null;
            } ,this);

            game.timer = this.game.time.create(this.game);
            game.timer.add(40, function(){this.removeVisitedTiles();}, this);
            game.timer.start();
        } else {
            neighboursArr = [];
            this.tilesFallDownNew();
        }
    },

    decreaseMove:function(){
        levelMoves--;
        levelMovesText.text = ("00" + levelMoves).slice(-2);
        if(levelMoves <= 0) {
            this.checkGoal();
        }
    },

    decreaseMoveBonus:function(){
        levelMoves--;
        levelMovesText.text = ("00" + levelMoves).slice(-2);
    },

    drawBonusHorizontal:function(row,col){
        if (characterArray[row][col].drawBonus === false || characterArray[row][col].drawBonusTwo === true) {
            var bonusRectGor = game.add.graphics(levelOffsetX, levelOffsetY + (row * game.global.tileSize));
            bonusRectGor.beginFill(0xB8B8B8, 1);
            bonusRectGor.drawRect(0, 0, levelWidth * game.global.tileSize, game.global.tileSize);
            bonusRectGor.alpha = 0;
            bonusMapGroup.add(bonusRectGor);
            this.add.tween(bonusRectGor).to({alpha: 1}, 200, Phaser.Easing.Back.None, true, 0);

            bonusTiles.push({
                row: row,
                col: col
            });

            characterArray[row][col].drawBonus = true;
            characterArray[row][col].explode_vector = 2;

            for (var b = 0; b < levelWidth; b++) {
                if (col != b && characterArray[row][b] !== null && characterArray[row][b].bonus !== 0 && characterArray[row][b].drawBonus === false ) {
                    this.drawBonusVertical(row, b);
                }
                if (characterArray[row][b] !== null && characterArray[row][b].special === true && characterArray[row][b].object_type == 'counter') {
                    characterArray[row][b].countGoal = 5;
                    counter = characterArray[row][b].countText;
                    counter.text = (characterArray[row][b].count - characterArray[row][b].countGoal < 0) ? 0 : characterArray[row][b].count - characterArray[row][b].countGoal ;
                    currentCounterBonus.push(characterArray[row][b]);
                }
            }
        }
    },

    drawBonusVertical:function(row,col){
        if (characterArray[row][col].drawBonus === false || characterArray[row][col].drawBonusTwo === true) {
            var bonusRectVert = game.add.graphics(levelOffsetX + (col * game.global.tileSize), levelOffsetY);
            bonusRectVert.beginFill(0xB8B8B8, 1);
            bonusRectVert.drawRect(0, 0, game.global.tileSize, levelHeight * game.global.tileSize);
            bonusRectVert.alpha = 0;
            bonusMapGroup.add(bonusRectVert);
            this.add.tween(bonusRectVert).to({alpha: 1}, 200, Phaser.Easing.Back.None, true, 0);

            bonusTiles.push({
                row: row,
                col: col
            });

            characterArray[row][col].drawBonus = true;
            characterArray[row][col].explode_vector = 3;

            for (var b = 0; b < levelHeight; b++) {
                if (characterArray[b][col] !== null && row != b && characterArray[b][col].bonus !== 0 && characterArray[b][col].drawBonus === false ) {
                    this.drawBonusHorizontal(b, col);
                }
                if (characterArray[b][col] !== null && characterArray[b][col].special === true && characterArray[b][col].object_type == 'counter') {
                    characterArray[b][col].countGoal = 5;
                    counter = characterArray[b][col].countText;
                    counter.text = (characterArray[b][col].count - characterArray[b][col].countGoal < 0) ? 0 : characterArray[b][col].count - characterArray[b][col].countGoal ;
                    currentCounterBonus.push(characterArray[b][col]);
                }
            }
        }
    },

    increaseScore:function(increaseScore){
        score += increaseScore;
        scoreText.text = ("0000000" + score).slice(-7);

        a = 15;
        b = 38;
        c = 37;
        d = 17;
        //-75 -60 -20 +15 +32

        if (score <= levelStar_1) {
            step = a / levelStar_1;
            progressbarLineMask.x += increaseScore * step;
        } else if (score <= levelStar_2) {
            step = b / (levelStar_2 - levelStar_1);
            progressbarLineMask.x += increaseScore * step;
        } else if (score <= levelStar_3) {
            step = c / (levelStar_3 - levelStar_2);
            progressbarLineMask.x += increaseScore * step;
        } else {
            step = d / levelStar_3;
            progressbarLineMask.x += increaseScore * step;
        }

        if (score >= levelStar_1 && levelStarRender.star1 == false) {
            progressbarStar1.frame = 1;
            levelStarRender.star1 = true;
        }
        if (score >= levelStar_2 && levelStarRender.star2 == false) {
            progressbarStar2.frame = 1;
            levelStarRender.star2 = true;
        }
        if (score >= levelStar_3 && levelStarRender.star3 == false) {
            progressbarStar3.frame = 1;
            levelStarRender.star3 = true;
        }
    },

    explodeBonusHorizontal:function(row,col){
        for(var b = 0; b < levelWidth; b++) {
            if (characterArray[row][b] !== null && col != b && ((characterArray[row][b].special === false && characterArray[row][b].object_type != 'ruby') || (characterArray[row][b].special === true && characterArray[row][b].object_type == 'bubble' || characterArray[row][b].object_type == 'ghost'))) {

                var isBonus = characterArray[row][b].bonus;
                var explode_vector = characterArray[row][b].explode_vector;

                if (characterArray[row][b].object_type == 'character' && tileSandArray[row][b] !== null && tileSandArray[row][b].special === true) {
                    tileSandArray[row][b].destroy();
                    tileSandArray[row][b] = null;
                    userMoves[userMoves.length-1].push(7);
                    userCollectObject.sand++;
                }
                scoreBonus = 50;
                font = { 'font': '12px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                if (characterArray[row][b].object_type == 'ghost') {
                    characterArray[row][b].live_count--;
                    ghostProtect = false;
                    userMoves[userMoves.length-1].push(8);
                    userCollectObject.ghost++;
                    scoreBonus = 50;
                    this.increaseScore(scoreBonus);
                } else if (characterArray[row][b].object_type == 'bubble') {
                    if (neighboursArr.indexOf(b + '_' + row) < 0) {
                        neighboursArr.push(b + '_' + row);
                        characterArray[row][b].live_count--;
                        if (characterArray[row][b].live_count == 0) {
                            userMoves[userMoves.length - 1].push(3);
                            userCollectObject.bubble++;
                            scoreBonus = 50;
                            this.increaseScore(scoreBonus);
                        } else {
                            characterArray[row][b].frame -= 5;
                            userMoves[userMoves.length - 1].push(14);
                            scoreBonus = 50;
                            this.increaseScore(scoreBonus);
                        }
                    }
                } else {
                    userCollectObject.character++;
                    if (isBonus !== 0) {
                        if (bonusAdd === true) {
                            scoreBonus = characterArray[row][b].score;
                            this.increaseScore(scoreBonus);
                            if (scoreBonus == 1500) {
                                userMoves[userMoves.length-1].push(9);
                            } else {
                                userMoves[userMoves.length-1].push(10);
                            }
                        } else {
                            scoreBonus = 500;
                            this.increaseScore(500);
                            userMoves[userMoves.length-1].push(11);
                        }
                        font = { 'font': '16px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                    } else {
                        scoreBonus = 50;
                        this.increaseScore(scoreBonus);
                        userMoves[userMoves.length-1].push(2);
                    }
                }

                var scoreTile = game.add.text(characterArray[row][b].x, characterArray[row][b].y, scoreBonus, font);
                scoreTile.anchor.setTo(0.6, 1.5);
                var scoreTileTween = this.add.tween(scoreTile)
                    .to({alpha: 0, y:characterArray[row][b].y-20 }, 2000, Phaser.Easing.Back.In, true, 0);
                scoreTileTween.onComplete.add(function(current){
                    current.destroy();
                    current = null;
                } ,this);

                if (characterArray[row][b].object_type == 'character' || characterArray[row][b].live_count == 0) {
                    if (characterArray[row][b].getBonusAnim !== null) {
                        characterArray[row][b].getBonusAnim.destroy();
                        characterArray[row][b].getBonusAnim = null;
                    }
                    if (characterArray[row][b].bonusAnim !== null) {
                        characterArray[row][b].bonusAnim.destroy();
                        characterArray[row][b].bonusAnim = null;
                    }
                    characterArray[row][b].destroy();
                    characterArray[row][b] = null;
                }

                if (isBonus !== 0) {
                    if (explode_vector == 2) {
                        this.explodeBonusHorizontal(row,b);
                    } else if (explode_vector == 3) {
                        this.explodeBonusVertical(row,b);
                    }
                }

                var explode_boom = game.add.sprite(
                        b * game.global.tileSize + game.global.tileSize / 2 + levelOffsetX,
                        row * game.global.tileSize + game.global.tileSize / 2 + levelOffsetY,
                    'explode'
                );

                explode_boom.anchor.setTo(0.5);

                var animExplosion = explode_boom.animations.add('explode',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],15,false,true);
                explode_boom.animations.play('explode');
                animExplosion.killOnComplete = true;

            } else if (characterArray[row][b] !== null && currentCounterBonus.indexOf(characterArray[row][b]) >= 0  && characterArray[row][b].special === true && characterArray[row][b].object_type == 'counter') {
                characterArray[row][b].count = characterArray[row][b].count - characterArray[row][b].countGoal;
                c = currentCounterBonus.indexOf(characterArray[row][b]);
                currentCounterBonus.splice(c,1);

                if (characterArray[row][b].count <= 0) {

                    scoreBonus = 5000;
                    font = { 'font': '12px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                    userMoves[userMoves.length-1].push(12);
                    userCollectObject.counter++;
                    this.increaseScore(scoreBonus);

                    var scoreTile = game.add.text(characterArray[row][b].x, characterArray[row][b].y, scoreBonus, font);
                    scoreTile.anchor.setTo(0.6, 1.5);
                    var scoreTileTween = this.add.tween(scoreTile)
                        .to({alpha: 0, y:characterArray[row][b].y-20 }, 2000, Phaser.Easing.Back.In, true, 0);
                    scoreTileTween.onComplete.add(function(current){
                        current.destroy();
                        current = null;
                    } ,this);

                    characterArray[row][b].destroy();
                    characterArray[row][b] = null;

                    var explode_boom = game.add.sprite(
                            b * game.global.tileSize + game.global.tileSize / 2 + levelOffsetX,
                            row * game.global.tileSize + game.global.tileSize / 2 + levelOffsetY,
                        'explode'
                    );

                    explode_boom.anchor.setTo(0.5);

                    var animExplosion = explode_boom.animations.add('explode',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],15,false,true);
                    explode_boom.animations.play('explode');
                    animExplosion.killOnComplete = true;
                }
            }
        }
    },

    explodeBonusVertical:function(row,col){
        for(var b = 0; b < levelHeight; b++) {
            if (characterArray[b][col] !== null && row != b && ( (characterArray[b][col].special === false && characterArray[b][col].object_type != 'ruby') || (characterArray[b][col].special === true && characterArray[b][col].object_type == 'bubble' || characterArray[b][col].object_type == 'ghost'))) {

                var isBonus = characterArray[b][col].bonus;
                var explode_vector = characterArray[b][col].explode_vector;

                if (characterArray[b][col].object_type == 'character' && tileSandArray[b][col] !== null && tileSandArray[b][col].special === true) {
                    tileSandArray[b][col].destroy();
                    tileSandArray[b][col] = null;
                    userMoves[userMoves.length-1].push(7);
                    userCollectObject.sand++;
                }
                scoreBonus = 50;
                font = { 'font': '12px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                if (characterArray[b][col].object_type == 'ghost') {
                    characterArray[b][col].live_count--;
                    ghostProtect = false;
                    userMoves[userMoves.length-1].push(8);
                    userCollectObject.ghost++;
                    scoreBonus = 50;
                    this.increaseScore(scoreBonus);
                } else if (characterArray[b][col].object_type == 'bubble') {
                    if (neighboursArr.indexOf(col + '_' + b) < 0) {
                        neighboursArr.push(col + '_' + b);
                        characterArray[b][col].live_count--;
                        if (characterArray[b][col].live_count == 0) {
                            userMoves[userMoves.length - 1].push(3);
                            userCollectObject.bubble++;
                            scoreBonus = 50;
                            this.increaseScore(scoreBonus);
                        } else {
                            characterArray[b][col].frame -= 5;
                            userMoves[userMoves.length - 1].push(14);
                            scoreBonus = 50;
                            this.increaseScore(scoreBonus);
                        }
                    }
                } else {
                    userCollectObject.character++;
                    if (isBonus !== 0) {
                        if (bonusAdd === true) {
                            scoreBonus = characterArray[b][col].score;
                            this.increaseScore(scoreBonus);
                            if (scoreBonus == 1500) {
                                userMoves[userMoves.length-1].push(9);
                            } else {
                                userMoves[userMoves.length-1].push(10);
                            }
                        } else {
                            scoreBonus = 500;
                            this.increaseScore(500);
                            userMoves[userMoves.length-1].push(11);
                        }
                        font = { 'font': '16px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                    } else {
                        scoreBonus = 50;
                        this.increaseScore(scoreBonus);
                        userMoves[userMoves.length-1].push(2);
                    }
                }

                var scoreTile = game.add.text(characterArray[b][col].x, characterArray[b][col].y, scoreBonus, font);
                scoreTile.anchor.setTo(0.6, 1.5);
                var scoreTileTween = this.add.tween(scoreTile)
                    .to({alpha: 0, y:characterArray[b][col].y-20 }, 2000, Phaser.Easing.Back.In, true, 0);
                scoreTileTween.onComplete.add(function(current){
                    current.destroy();
                    current = null;
                } ,this);

                if (characterArray[b][col].object_type == 'character' || characterArray[b][col].live_count == 0) {
                    if (characterArray[b][col].getBonusAnim !== null) {
                        characterArray[b][col].getBonusAnim.destroy();
                        characterArray[b][col].getBonusAnim = null;
                    }
                    if (characterArray[b][col].bonusAnim !== null) {
                        characterArray[b][col].bonusAnim.destroy();
                        characterArray[b][col].bonusAnim = null;
                    }
                    characterArray[b][col].destroy();
                    characterArray[b][col] = null;
                }

                if (isBonus !== 0) {
                    if (explode_vector == 2) {
                        this.explodeBonusHorizontal(b,col);
                    } else if (explode_vector == 3) {
                        this.explodeBonusVertical(b,col);
                    }
                }

                var explode_boom = game.add.sprite(
                        col * game.global.tileSize + game.global.tileSize / 2 + levelOffsetX,
                        b * game.global.tileSize + game.global.tileSize / 2 + levelOffsetY,
                    'explode'
                );

                explode_boom.anchor.setTo(0.5);

                var animExplosion = explode_boom.animations.add('explode',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],15,false,true);
                explode_boom.animations.play('explode');
                animExplosion.killOnComplete = true;

            } else if (characterArray[b][col] !== null && currentCounterBonus.indexOf(characterArray[b][col]) >= 0 && characterArray[b][col].special === true && characterArray[b][col].object_type == 'counter') {
                characterArray[b][col].count = characterArray[b][col].count - characterArray[b][col].countGoal;
                c = currentCounterBonus.indexOf(characterArray[b][col]);
                currentCounterBonus.splice(c,1);
                if (characterArray[b][col].count <= 0) {

                    scoreBonus = 5000;
                    font = { 'font': '12px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                    userMoves[userMoves.length-1].push(12);
                    userCollectObject.counter++;
                    this.increaseScore(scoreBonus);

                    var scoreTile = game.add.text(characterArray[b][col].x, characterArray[b][col].y, scoreBonus, font);
                    scoreTile.anchor.setTo(0.6, 1.5);
                    var scoreTileTween = this.add.tween(scoreTile)
                        .to({alpha: 0, y:characterArray[b][col].y-20 }, 2000, Phaser.Easing.Back.In, true, 0);
                    scoreTileTween.onComplete.add(function(current){
                        current.destroy();
                        current = null;
                    } ,this);

                    characterArray[b][col].destroy();
                    characterArray[b][col] = null;

                    var explode_boom = game.add.sprite(
                            col * game.global.tileSize + game.global.tileSize / 2 + levelOffsetX,
                            b * game.global.tileSize + game.global.tileSize / 2 + levelOffsetY,
                        'explode'
                    );

                    explode_boom.anchor.setTo(0.5);

                    var animExplosion = explode_boom.animations.add('explode',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],15,false,true);
                    explode_boom.animations.play('explode');
                    animExplosion.killOnComplete = true;
                }
            }
        }
    },

    bonusHorizontal:function(row,col){
        for(var b = 0; b < levelWidth; b++) {
            if (characterArray[row][b] !== null && characterArray[row][b].visited === false && col != b && (characterArray[row][b].special === false || (characterArray[row][b].special === true && (characterArray[row][b].object_type == 'bubble' || characterArray[row][b].object_type == 'counter' || characterArray[row][b].object_type == 'ghost')))) {

                var isBonus = characterArray[row][b].bonus;
                var explode_vector = characterArray[row][b].explode_vector;
                bonusCounter++;

                if (isBonus !== 0) {
                    if (explode_vector == 2) {
                        this.bonusHorizontal(row,b);
                    } else if (explode_vector == 3) {
                        this.bonusVertical(row,b);
                    }
                }
            }
        }
    },

    bonusVertical:function(row,col){
        for(var b = 0; b < levelHeight; b++) {
            if (characterArray[b][col] !== null && characterArray[b][col].visited === false && row != b && ( characterArray[b][col].special === false || (characterArray[b][col].special === true && (characterArray[b][col].object_type == 'bubble' || characterArray[b][col].object_type == 'counter' || characterArray[b][col].object_type == 'ghost')))) {

                var isBonus = characterArray[b][col].bonus;
                var explode_vector = characterArray[b][col].explode_vector;
                bonusCounter++;

                if (isBonus !== 0) {
                    if (explode_vector == 2) {
                        this.bonusHorizontal(b,col);
                    } else if (explode_vector == 3) {
                        this.bonusVertical(b,col);
                    }
                }
            }
        }
    },

    tilesFallDownNew:function(){
        game.timer = this.game.time.create(this.game);
        game.timer.add(game.global.delayToFall, function(){
            this.createNewTilesNew();
        }, this);
        game.timer.start();
    },

    createNewTilesNew:function() {
        game.input.onDown.remove(this.pickTile, this);
        rowCount--;
        toFall = true;
        for (var j = 0; j < levelWidth; j++) {
            for(var i = 0; i < levelHeight; i++) {
                if (characterArray[i][j] !== null && characterArray[i][j].special === false) {
                    for(var z = i+1; z < levelHeight; z++) {
                        if (characterArray[z][j] === null) {
                            characterArray[z][j] = 'empty';
                        } else {
                            break;
                        }
                    }
                }
            }
        }

//        for(var i = 0; i < levelHeight; i++){
        for(var i = levelHeight -1; i >= 0; i --){
            var leftOrRight = game.rnd.between(0,1);
            for(var j = 0; j < levelWidth ; j++){
                var posX = j;
                if (leftOrRight)
                {
                    posX = levelWidth - 1 - j;
                }

                if (characterArray[i][posX] !== null && characterArray[i][posX].special === false)
                {
                    if ( characterArray[i+1] ) {
                        if (characterArray[i + 1][posX] === null || characterArray[i + 1][posX] == 'empty' ) {
                            if (characterArray[i][posX].fall === false) {
                                operationsInQueue++;
                            }
                            characterArray[i][posX].fall = true;

                            if (characterArray[i][posX].bonusAnim !== null) {
                                var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                bonusAnimTween.to({
                                    y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2
                                }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                            }

                            var tileTween = game.add.tween(characterArray[i][posX]);
                            tileTween.to({
                                y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY
                            }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);

                            tileTween.onComplete.add(function(){
                                this.createComplete();
                            },this);
                            characterArray[i + 1][posX] = characterArray[i][posX];
                            characterArray[i][posX] = null;
                            operationsCreate++;
                        } else if (characterArray[i + 1][posX] !== null) {
                            if (characterArray[i + 1][posX - 1] === null && characterArray[i + 1][posX + 1] === null && ( characterArray[i][posX].object_type == 'ruby' || (characterArray[i][posX - 1] === null && characterArray[i][posX + 1] === null))) {
                                var randFall = game.rnd.between(0, 1);
                                if (randFall) {
                                    if (characterArray[i][posX].fall === false) {
                                        operationsInQueue++;
                                    }
                                    characterArray[i][posX].fall = true;

                                    if (characterArray[i][posX].bonusAnim !== null) {
                                        var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                        bonusAnimTween.to({
                                            y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                            x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                        }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                    }

                                    var tileTween = game.add.tween(characterArray[i][posX]);
                                    tileTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                        x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                    tileTween.onComplete.add(function(){
                                        this.createComplete();
                                    },this);

                                    characterArray[i + 1][posX + 1] = characterArray[i][posX];
                                    characterArray[i][posX] = null;
                                    operationsCreate++;
                                } else {
                                    if (characterArray[i][posX].fall === false) {
                                        operationsInQueue++;
                                    }
                                    characterArray[i][posX].fall = true;

                                    if (characterArray[i][posX].bonusAnim !== null) {
                                        var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                        bonusAnimTween.to({
                                            y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                            x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                        }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                    }

                                    var tileTween = game.add.tween(characterArray[i][posX]);
                                    tileTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                        x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                    tileTween.onComplete.add(function(){
                                        this.createComplete();
                                    },this);

                                    characterArray[i + 1][posX - 1] = characterArray[i][posX];
                                    characterArray[i][posX] = null;
                                    operationsCreate++;
                                }
                            } else if (characterArray[i + 1][posX - 1] !== null && characterArray[i + 1][posX + 1] === null && ((characterArray[i][posX + 1] !== null && characterArray[i][posX + 1].special === true) || characterArray[i][posX + 1] === null || characterArray[i][posX].object_type == 'ruby')) {
                                if (characterArray[i][posX].fall === false) {
                                    operationsInQueue++;
                                }
                                characterArray[i][posX].fall = true;

                                if (characterArray[i][posX].bonusAnim !== null) {
                                    var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                    bonusAnimTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                        x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                }

                                var tileTween = game.add.tween(characterArray[i][posX]);
                                tileTween.to({
                                    y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                    x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                tileTween.onComplete.add(function(){
                                    this.createComplete();
                                },this);

                                characterArray[i + 1][posX + 1] = characterArray[i][posX];
                                characterArray[i][posX] = null;
                                operationsCreate++;
                            } else if (characterArray[i + 1][posX - 1] === null && characterArray[i + 1][posX + 1] !== null && ((characterArray[i][posX - 1] !== null && characterArray[i][posX - 1].special === true) || characterArray[i][posX - 1] === null || characterArray[i][posX].object_type == 'ruby')) {
                                if (characterArray[i][posX].fall === false) {
                                    operationsInQueue++;
                                }
                                characterArray[i][posX].fall = true;

                                if (characterArray[i][posX].bonusAnim !== null) {
                                    var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                    bonusAnimTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                        x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                }

                                var tileTween = game.add.tween(characterArray[i][posX]);
                                tileTween.to({
                                    y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                    x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                tileTween.onComplete.add(function(){
                                    this.createComplete();
                                },this);

                                characterArray[i + 1][posX - 1] = characterArray[i][posX];
                                characterArray[i][posX] = null;
                                operationsCreate++;
                            } else if (characterArray[i][posX - 1] !== undefined && characterArray[i][posX - 1] !== null && characterArray[i][posX + 1] !== undefined && characterArray[i][posX + 1] !== null && characterArray[i][posX - 1].special === true && characterArray[i][posX + 1].special === true && characterArray[i+1][posX - 1] === null && characterArray[i+1][posX + 1] === null) {
                                if (randFall) {
                                    if (characterArray[i][posX].fall === false) {
                                        operationsInQueue++;
                                    }
                                    characterArray[i][posX].fall = true;

                                    if (characterArray[i][posX].bonusAnim !== null) {
                                        var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                        bonusAnimTween.to({
                                            y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                            x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                        }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                    }

                                    var tileTween = game.add.tween(characterArray[i][posX]);
                                    tileTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                        x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                    tileTween.onComplete.add(function(){
                                        this.createComplete();
                                    },this);

                                    characterArray[i + 1][posX + 1] = characterArray[i][posX];
                                    characterArray[i][posX] = null;
                                    operationsCreate++;
                                } else {
                                    if (characterArray[i][posX].fall === false) {
                                        operationsInQueue++;
                                    }
                                    characterArray[i][posX].fall = true;

                                    if (characterArray[i][posX].bonusAnim !== null) {
                                        var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                        bonusAnimTween.to({
                                            y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                            x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                        }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                    }

                                    var tileTween = game.add.tween(characterArray[i][posX]);
                                    tileTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                        x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                    tileTween.onComplete.add(function(){
                                        this.createComplete();
                                    },this);

                                    characterArray[i + 1][posX - 1] = characterArray[i][posX];
                                    characterArray[i][posX] = null;
                                    operationsCreate++;
                                }
                            } else if (characterArray[i][posX - 1] !== undefined && characterArray[i][posX - 1] !== null && characterArray[i][posX + 1] !== undefined && characterArray[i][posX + 1] !== null && characterArray[i][posX - 1].special === false && characterArray[i][posX + 1].special === true && characterArray[i+1][posX + 1] === null) {
                                if (characterArray[i][posX].fall === false) {
                                    operationsInQueue++;
                                }
                                characterArray[i][posX].fall = true;

                                if (characterArray[i][posX].bonusAnim !== null) {
                                    var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                    bonusAnimTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                        x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                }

                                var tileTween = game.add.tween(characterArray[i][posX]);
                                tileTween.to({
                                    y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                    x: levelOffsetX + (posX+1) * game.global.tileSize + game.global.tileSize / 2
                                }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                tileTween.onComplete.add(function(){
                                    this.createComplete();
                                },this);

                                characterArray[i + 1][posX + 1] = characterArray[i][posX];
                                characterArray[i][posX] = null;
                                operationsCreate++;
                            } else if (characterArray[i][posX - 1] !== undefined && characterArray[i][posX - 1] !== null && characterArray[i][posX + 1] !== undefined && characterArray[i][posX + 1] !== null && characterArray[i][posX - 1].special === true && characterArray[i+1][posX - 1] === null && characterArray[i][posX + 1].special === false) {
                                if (characterArray[i][posX].fall === false) {
                                    operationsInQueue++;
                                }
                                characterArray[i][posX].fall = true;

                                if (characterArray[i][posX].bonusAnim !== null) {
                                    var bonusAnimTween = game.add.tween(characterArray[i][posX].bonusAnim);
                                    bonusAnimTween.to({
                                        y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize / 2,
                                        x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                    }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                                }

                                var tileTween = game.add.tween(characterArray[i][posX]);
                                tileTween.to({
                                    y: levelOffsetY + (i+1) * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY,
                                    x: levelOffsetX + (posX-1) * game.global.tileSize + game.global.tileSize / 2
                                }, game.global.tweenSpeed,Phaser.Easing.Quintic.InOut, true);

                                tileTween.onComplete.add(function(){
                                    this.createComplete();
                                },this);

                                characterArray[i + 1][posX - 1] = characterArray[i][posX];
                                characterArray[i][posX] = null;
                                operationsCreate++;
                            }
                            else
                            {
                                if (characterArray[i][posX].fall == true) {
                                    this.fallDownComplete();
                                    toFall = false;
                                    if(game.global.playSounds){
                                        var randomPop = game.rnd.between(0, pop.length - 1);
                                        pop[randomPop].play("", 0, 0.2, false);
                                    }

                                    if (characterArray[i][posX].object_type == 'character') {
                                        var tweenScale = game.add.tween(characterArray[i][posX].scale).to({y: 0.9, x: 1.1}, 100, Phaser.Easing.Back.Out, true, 0);
                                        tweenScale.onComplete.add(function (currentTile) {
                                            var tweenScale = game.add.tween(currentTile).to({y: 1.05, x: 0.95}, 100, Phaser.Easing.Back.Out, true, 0);
                                            tweenScale.onComplete.add(function (currentTile) {
                                                var tweenScale = game.add.tween(currentTile).to({y: 0.95, x: 1.02}, 100, Phaser.Easing.Back.Out, true, 0);
                                                tweenScale.onComplete.add(function (currentTile) {
                                                    var tweenScale = game.add.tween(currentTile).to({y: 1, x: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                                                    tweenScale.onComplete.add(function (currentTile) {
                                                        var tweenScale = game.add.tween(currentTile).to({y: 0.98, x: 1.01}, 100, Phaser.Easing.Back.Out, true, 0);
                                                        tweenScale.onComplete.add(function (currentTile) {
                                                            game.add.tween(currentTile).to({y: 1, x: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    }
                                }
                                characterArray[i][posX].fall = false;
                            }
                        }
                    } else if (characterArray[i + 1] === undefined) {
                        if (characterArray[i][posX].fall == true) {
                            this.fallDownComplete();
                            toFall = false;
                            if(game.global.playSounds){
                                var randomPop = game.rnd.between(0, pop.length - 1);
                                pop[randomPop].play("", 0, 0.2, false);
                            }
                            if (characterArray[i][posX].object_type == 'character') {
                                var tweenScale = game.add.tween(characterArray[i][posX].scale).to({y: 0.9, x: 1.1}, 100, Phaser.Easing.Back.Out, true, 0);
                                tweenScale.onComplete.add(function (currentTile) {
                                    var tweenScale = game.add.tween(currentTile).to({y: 1.05, x: 0.95}, 100, Phaser.Easing.Back.Out, true, 0);
                                    tweenScale.onComplete.add(function (currentTile) {
                                        var tweenScale = game.add.tween(currentTile).to({y: 0.95, x: 1.02}, 100, Phaser.Easing.Back.Out, true, 0);
                                        tweenScale.onComplete.add(function (currentTile) {
                                            var tweenScale = game.add.tween(currentTile).to({y: 1, x: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                                            tweenScale.onComplete.add(function (currentTile) {
                                                var tweenScale = game.add.tween(currentTile).to({y: 0.98, x: 1.01}, 100, Phaser.Easing.Back.Out, true, 0);
                                                tweenScale.onComplete.add(function (currentTile) {
                                                    game.add.tween(currentTile).to({y: 1, x: 1}, 100, Phaser.Easing.Back.Out, true, 0);
                                                });
                                            });
                                        });
                                    });
                                });
                            }
                        }
                        characterArray[i][posX].fall = false;
                    }
                }

                if (i == 0 && (characterArray[i][posX] === null || characterArray[i][posX] == 'empty'))
                {
                    obj = game.objectFindByKey(rubyPosition, 'x', posX+1);

                    var rubyRND = game.rnd.between(0, levelWidth - 1);

                    if ( (rowCount > 0 && obj !== null && parseInt(obj.y) == parseInt(rowCount+1)) || (rowCount < 0 && rubyCount > 0 && rubyInMap < 2 && posX == rubyRND)) {
                        rubyCount--;
                        rubyInMap++;

                        var tileXPos = levelOffsetX + posX * game.global.tileSize + game.global.tileSize / 2;
                        var tileYPos = levelOffsetY + i * game.global.tileSize - game.global.tileSize + game.global.tileOffsetY;
                        var object_id = 5;
                        var object_type = 'ruby';
                        var live_count = 0;
                        var score = 5000;
                        var count = 0;
                        var options = null;

                        theTile = game.add.sprite(tileXPos, tileYPos, "spec_object");
                        theTile.special = false;
                        theTile.fall = true;
                        theTile.object_id = object_id;
                        theTile.object_type = object_type;
                        theTile.live_count = live_count;
                        theTile.score = score;
                        theTile.frame = object_id - 1;
                        theTile.getBonus = false;
                        theTile.getBonusAnim = null;
                        theTile.bonus = 0;
                        theTile.bonusAnim = null;
                        theTile.count = count;
                        theTile.options = options;
                        theTile.visited = false;
                        theTile.drawBonus = false;
                        theTile.explode_vector = 0;
                        theTile.anchor.setTo(0.5, 1.2);
                        bonusGroup.add(theTile);
                    } else {
                        var tileXPos = levelOffsetX + posX * game.global.tileSize + game.global.tileSize / 2;
                        var tileYPos = levelOffsetY + i * game.global.tileSize - game.global.tileSize + game.global.tileOffsetY;
                        var randomCharacter = game.rnd.between(0, levelMaxColor - 1);
                        theTile = game.add.sprite(tileXPos, tileYPos, "mables");
                        theTile.special = false;
                        theTile.fall = true;
                        theTile.live_count = 0;
                        theTile.score = 100;
                        theTile.count = 0;
                        theTile.options = false;
                        theTile.drawBonus = false;
                        theTile.getBonus = false;
                        theTile.getBonusAnim = null;
                        theTile.bonus = 0;
                        theTile.bonusAnim = null;
                        theTile.explode_vector = 0;
                        theTile.frame = randomCharacter;
                        theTile.visited = false;
                        theTile.object_id = randomCharacter;
                        theTile.object_type = 'character';
                        theTile.anchor.setTo(0.5, 1);
                        theTile.animations.add('bonusH', [17,18,19,20,21,22,23,24,25,26,27,28,29,30], 15, true, true);
                        theTile.animations.add('bonusV', [31,32,33,34,35,36,37,38,39,40,41,42,43,44], 15, true, true);
                        characterGroup.add(theTile);
                    }

                    characterArray[i][posX] = theTile;
                    operationsCreate++;
                    operationsInQueue++;
                    animFall.push(game.add.tween(characterArray[i][posX].scale));
                    var tileTween = game.add.tween(characterArray[i][posX]);
                    tileTween.to({
                        y: levelOffsetY + i * game.global.tileSize + game.global.tileSize + game.global.tileOffsetY
                    }, game.global.tweenSpeed,Phaser.Easing.Linear.None, true);
                    tileTween.onComplete.add(function(){
                        this.createComplete();
                    },this);
                }
            }
        }

        if (toFall && (levelMoves >= 0 || bonusCount > 0)) {
            operationsInQueue++;
            this.fallDownComplete();
        }
    },

    createComplete:function(){
        operationsCreate --;
        if(operationsCreate == 0){
            this.createNewTilesNew();
        }
    },

    fallDownComplete:function(){
        operationsInQueue --;
        if(operationsInQueue == 0){

            var rubyDown = false;
            for (var j = 0; j < levelWidth; j++) {
                if (characterArray[levelHeight-1][j] !== null && characterArray[levelHeight-1][j].object_type == 'ruby') {
                    if(game.global.playSounds){
                        var randomRemove = game.rnd.between(0, remove.length - 1);
                        remove[randomRemove].play("", 0, 1, false);
                    }

                    var tileScore = characterArray[levelHeight-1][j].score;
                    var tilePosX = characterArray[levelHeight-1][j].x;
                    var tilePosY = characterArray[levelHeight-1][j].y;

                    this.increaseScore(tileScore);

                    game.timer = this.game.time.create(this.game);
                    game.timer.add(500, function(){

                        if (goalTextArr.rubyX !== null) {
                            x = 100;
                            y = game.height/2;
                        } else {
                            x = game.width/2;
                            y = game.height/2;
                        }

                        font = { 'font': '16px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4};
                        var scoreTile = game.add.text(tilePosX, tilePosY, tileScore, font);
                        scoreTile.anchor.setTo(0.6, 1.5);
                        var scoreTileTween = game.add.tween(scoreTile)
                            .to({alpha: 0, y:tilePosY-20 }, 1000, Phaser.Easing.Back.In, true, 0);
                        scoreTileTween.onComplete.add(function(){
                            scoreTile.destroy();
                            scoreTile = null;
                        } ,this);

                        game.add.tween(this).to({alpha:0, x: x, y: y}, 1000, Phaser.Easing.Cubic.Out, true, 0);
                        tween = game.add.tween(this.scale).to({x:0.5, y:0.5}, 1000, Phaser.Easing.Cubic.Out, true, 0);
                        tween.onComplete.add(function(){
                            this.destroy();
                        } , this);
                    }, characterArray[levelHeight-1][j]);
                    game.timer.start();

                    characterArray[levelHeight-1][j] = null;

                    userMoves[userMoves.length-1].push(6);
                    userCollectObject.ruby++;
                    rubyDown = true;
                    rubyInMap--;
                }
            }

            if (rubyDown) {
                game.timer = this.game.time.create(this.game);
                game.timer.add(1100, function(){
                    this.createNewTilesNew();
                }, this);
                game.timer.start();
            } else {
                if (bonusCount >=0) {
                    this.setRandBonus();
                }
            }
        }
    },

    setRandBonus:function(){
        for(var i = levelHeight -1; i >= 0; i --) {
            for (var j = 0; j < levelWidth; j++) {
                if (bonusArray[i][j] !== null) {
                    var posY = game.rnd.between(0,levelHeight -1);
                    var posX = game.rnd.between(0,levelWidth -1);
                    if (characterArray[posY][posX] !== null && characterArray[posY][posX].special === false && characterArray[posY][posX].object_type == 'character' && characterArray[posY][posX].bonus == 0) {

                        var randBonus = game.rnd.between(2,3);

                        if (levelID == 2 && tutorialBonus!= null) {
                            posY = tutorialBonus.y;
                            posX = tutorialBonus.x;
                            tutorialBonus = null;
                            randBonus = 2;
                        }
                        game.add.tween(bonusArray[i][j].scale)
                            .to({
                            y: 0.5,
                            x: 0.5
                        }, 200 ,Phaser.Easing.Linear.InOut, true, 500);

                        var bonusTween = game.add.tween(bonusArray[i][j]);
                        bonusTween.to({
                            y: characterArray[posY][posX].y - game.global.tileSize / 2,
                            x: characterArray[posY][posX].x
                        }, 200 ,Phaser.Easing.Linear.InOut, true, 500);

                        characterArray[posY][posX].bonus = randBonus;
                        if (randBonus == 2) {
                            bonusFX = game.add.sprite(characterArray[posY][posX].x, characterArray[posY][posX].y - game.global.tileSize / 2 - game.global.tileOffsetY, "effects");
                            bonusFX.anchor.setTo(0.5);
                            bonusFX.animations.add('bonusH', [15,16,17,18,19,20,21,22,23,24,25,26,27,28], 15, true, true);
                            bonusFX.animations.play('bonusH');
                            bonusGroup.add(bonusFX);

                        } else {
                            bonusFX = game.add.sprite(characterArray[posY][posX].x, characterArray[posY][posX].y - game.global.tileSize / 2 - game.global.tileOffsetY, "effects");
                            bonusFX.anchor.setTo(0.5);
                            bonusFX.animations.add('bonusV', [29,30,31,32,33,34,35,36,37,38,39,40,41,42], 15, true, true);
                            bonusFX.animations.play('bonusV');
                            bonusGroup.add(bonusFX);
                        }

                        bonusTween.onComplete.add(function(current){
                            current.destroy();
                        },this);

                        bonusArray[i][j] = null;
                        characterArray[posY][posX].bonusAnim = bonusFX;
                        characterArray[posY][posX].frame = characterArray[posY][posX].object_id + game.global.mables_count;
                        characterBonusGroup.add(characterArray[posY][posX]);
                    } else {
                        this.setRandBonus();
                    }
                }
            }
        }

        game.timer = this.game.time.create(this.game);
        game.timer.add(200, function(){
            this.setTileInfo();
        }, this);
        game.timer.start();

    },

    checkGoal:function() {
        goalSuccess = true;
        if (levelScoreGoal !== null && score < levelScoreGoal) {
            goalSuccess = false;
        }

        for (var i = 0; i < goals.length; i++) {
            if (goals[i].type == 'object') {
                if (goals[i].object_type == 'ruby') {
                    if ( goalTextArr.ruby !== null ) {
                        if (userCollectObject.ruby >= goals[i].count) {
                            ok = game.add.sprite(goalTextArr.rubyX, goalTextArr.rubyY -5, 'goalOk');
                            scorePanelPlaceTarget.addChild(ok);
                            goalTextArr.ruby.destroy();
                            goalTextArr.ruby = null;
                        } else {
                            goalTextArr.ruby.text = userCollectObject.ruby + ' / ' + goals[i].count;
                        }
                    }

                    if ((goals[i].count - userCollectObject.ruby) > 0 ) {
                        goalSuccess = false;
                    }
                }

                if (goals[i].object_type == 'bubble') {
                    if (goalTextArr.bubble !== null) {
                        if (userCollectObject.bubble >= goals[i].count) {
                            ok = game.add.sprite(goalTextArr.bubbleX, goalTextArr.bubbleY -5, 'goalOk');
                            scorePanelPlaceTarget.addChild(ok);
                            goalTextArr.bubble.destroy();
                            goalTextArr.bubble = null;
                        } else {
                            goalTextArr.bubble.text = userCollectObject.bubble + ' / ' + goals[i].count;
                        }
                    }

                    if ((goals[i].count - userCollectObject.bubble) > 0 ) {
                        goalSuccess = false;
                    }
                }

                if (goals[i].object_type == 'counter') {
                    if (goalTextArr.counter !== null) {
                        if (userCollectObject.counter >= goals[i].count) {
                            ok = game.add.sprite(goalTextArr.counterX, goalTextArr.counterY -5, 'goalOk');
                            scorePanelPlaceTarget.addChild(ok);
                            goalTextArr.counter.destroy();
                            goalTextArr.counter = null;
                        } else {
                            goalTextArr.counter.text = userCollectObject.counter + ' / ' + goals[i].count;
                        }
                    }

                    if ((goals[i].count - userCollectObject.counter) > 0 ) {
                        goalSuccess = false;
                    }
                }

                if (goals[i].object_type == 'sand') {
                    if (goalTextArr.sand !== null) {
                        if (userCollectObject.sand >= goals[i].count) {
                            ok = game.add.sprite(goalTextArr.sandX, goalTextArr.sandY -5, 'goalOk');
                            scorePanelPlaceTarget.addChild(ok);
                            goalTextArr.sand.destroy();
                            goalTextArr.sand = null;
                        } else {
                            goalTextArr.sand.text = userCollectObject.sand + ' / ' + goals[i].count;
                        }
                    }

                    if ((goals[i].count - userCollectObject.sand) > 0 ) {
                        goalSuccess = false;
                    }
                }

                if (goals[i].object_type == 'ghost') {
                    if (goalTextArr.ghost !== null) {
                        if (goals[i].count > 0) {
                            if (userCollectObject.ghost >= goals[i].count) {
                                ok = game.add.sprite(goalTextArr.ghostX, goalTextArr.ghostY -5, 'goalOk');
                                scorePanelPlaceTarget.addChild(ok);
                                goalTextArr.ghost = null;
                            } else {
                                goalTextArr.ghost.text = userCollectObject.ghost + ' / ' + goals[i].count;
                            }
                        } else {
                            if (ghostCount == 0) {
                                ok = game.add.sprite(goalTextArr.ghostX, goalTextArr.ghostY -5, 'goalOk');
                                scorePanelPlaceTarget.addChild(ok);
                                goalTextArr.ghost = null;
                            } else {
                                goalTextArr.ghost.text = ghostCount;
                            }
                        }
                    }

                    if (goals[i].count == 0 && ghostArr.length > 0 ) {
                        goalSuccess = false;
                    } else if (goals[i].count > 0 && (goals[i].count - userCollectObject.ghost) > 0 ) {
                        goalSuccess = false;
                    }
                }
            }
        }

        if (goalSuccess === true) {
            if (popup.levelComplete === false) {
                game.timer = this.game.time.create(this.game);
                game.timer.add(500, function () {

                    if (tutorialMable !== null) {
                        var tutorialMableTween = this.add.tween(tutorialMable)
                            .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true);
                    }

                    if (tutorialHint !== null) {
                        var tutorialHintTween = this.add.tween(tutorialHint)
                            .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true);
                    }

                    var RectBG = game.add.graphics(0, 200);
                    RectBG.beginFill(0x7129a7, 0.3);
                    RectBG.drawRect(0, 0, game.width, 200);
                    RectBG.alpha = 0;

                    var levelCompleteGlow = game.add.image(435, 280, 'completePanelGlow');
                    levelCompleteGlow.anchor.setTo(0.5, 0.5);
                    levelCompleteGlow.alpha = 0;
                    levelCompleteGlow.scale.setTo(0.6);

                    var levelCompleteGlowTween = this.add.tween(levelCompleteGlow.scale)
                        .to({x:1, y:1 }, 500, Phaser.Easing.Linear.In, true, 1000);

                    levelCompleteGlowTween = this.add.tween(levelCompleteGlow)
                        .to({alpha: 1 }, 500, Phaser.Easing.Linear.In, true, 1000);
                    levelCompleteGlowTween.onComplete.add(function (current) {
                        var levelCompleteGlowTween = this.add.tween(current)
                            .to({alpha:0 }, 500, Phaser.Easing.Linear.In, true, 1500);
                        levelCompleteGlowTween.onComplete.add(function (current) {
                            current.destroy();
                            current = null;
                        }, this);
                    }, this);

                    var levelCompleteText = game.add.text(435, 280, 'Уровень пройден!', { 'font': 'bold 36pt MainFont', fill: '#7129a7', stroke: '#fff', strokeThickness: 8});
                    levelCompleteText.anchor.setTo(0.5, 0.5);
                    levelCompleteText.alpha = 0;
                    levelCompleteText.scale.setTo(0.3);

                    var levelCompleteTextTween = this.add.tween(levelCompleteText.scale)
                        .to({x:1, y:1 }, 500, Phaser.Easing.Back.In, true, 1000);

                    levelCompleteTextTween = this.add.tween(levelCompleteText)
                        .to({alpha: 1, y:350 }, 500, Phaser.Easing.Linear.In, true, 1000);
                    levelCompleteTextTween.onComplete.add(function (current) {
                        var levelCompleteTextTween = this.add.tween(current)
                            .to({alpha:0 }, 500, Phaser.Easing.Linear.In, true, 1500);
                        levelCompleteTextTween.onComplete.add(function (current) {
                            current.destroy();
                            current = null;
                        }, this);
                    }, this);

                    var levelCompleteMable1 = game.add.image(380, -125, 'completePanelMable1');
                    levelCompleteMable1.anchor.setTo(0.5, 0.5);

                    var levelCompleteMable1Tween = this.add.tween(levelCompleteMable1)
                        .to({y: 290 }, 500, Phaser.Easing.Back.Out, true, 200);
                    levelCompleteMable1Tween.onComplete.add(function (current) {
                        var levelCompleteMable1Tween = this.add.tween(current)
                            .to({y: game.height + 125 }, 500, Phaser.Easing.Back.In, true, 1700);
                        levelCompleteMable1Tween.onComplete.add(function (current) {
                            current.destroy();
                            current = null;
                        }, this);
                    }, this);


                    var levelCompleteMable3 = game.add.image(520, -125, 'completePanelMable3');
                    levelCompleteMable3.anchor.setTo(0.5, 0.5);

                    var levelCompleteMable3Tween = this.add.tween(levelCompleteMable3)
                        .to({y: 290 }, 500, Phaser.Easing.Back.Out, true, 400);
                    levelCompleteMable3Tween.onComplete.add(function (current) {
                        var levelCompleteMable3Tween = this.add.tween(current)
                            .to({y: game.height + 125 }, 500, Phaser.Easing.Back.In, true, 1700);
                        levelCompleteMable3Tween.onComplete.add(function (current) {
                            current.destroy();
                            current = null;
                        }, this);
                    }, this);


                    var levelCompleteMable2 = game.add.image(450, -125, 'completePanelMable2');
                    levelCompleteMable2.anchor.setTo(0.5, 0.5);

                    var levelCompleteMable2Tween = this.add.tween(levelCompleteMable2)
                        .to({y: 280 }, 500, Phaser.Easing.Back.Out, true, 300);
                    levelCompleteMable2Tween.onComplete.add(function (current) {
                        var levelCompleteMable2Tween = this.add.tween(current)
                            .to({y: game.height + 125 }, 500, Phaser.Easing.Back.In, true, 1700);
                        levelCompleteMable2Tween.onComplete.add(function (current) {
                            current.destroy();
                            current = null;
                        }, this);
                    }, this);

                    var levelCompleteRectTween = this.add.tween(RectBG)
                        .to({alpha: 1 }, 700, Phaser.Easing.Back.Out, true, 0);
                    levelCompleteRectTween.onComplete.add(function (current) {
                        var levelCompleteRectTween = this.add.tween(current)
                            .to({alpha:0 }, 700, Phaser.Easing.Back.In, true, 2000);
                        levelCompleteRectTween.onComplete.add(function (current) {
                            current.destroy();
                            current = null;
                            this.goalSuccess();
                            popup.levelComplete = true;
                        }, this);
                    }, this);

                }, this);
                game.timer.start();
            } else if (popup.explodeTime === false) {

                var levelCompleteSuper = game.add.image(450, -250, 'completeSuper');
                levelCompleteSuper.anchor.setTo(0.5, 0.5);

                var levelCompleteMables = game.add.image(450, -350, 'completeMables');
                levelCompleteMables.anchor.setTo(0.5, 0.5);

                var levelCompleteSupetTween = this.add.tween(levelCompleteSuper)
                    .to({y: 250  }, 700, Phaser.Easing.Back.Out, true, 0);
                levelCompleteSupetTween.onComplete.add(function (current) {
                    var levelCompleteTextTween = this.add.tween(current)
                        .to({y: game.height + 140 }, 500, Phaser.Easing.Back.In, true, 1100);
                    levelCompleteTextTween.onComplete.add(function (current) {
                        current.destroy();
                        current = null;
                    }, this);
                }, this);

                var levelCompleteMablesTween = this.add.tween(levelCompleteMables)
                    .to({y: 350  }, 500, Phaser.Easing.Back.Out, true, 0);
                levelCompleteMablesTween.onComplete.add(function (current) {
                    var levelCompleteTextTween = this.add.tween(current)
                        .to({y: game.height + 140 }, 700, Phaser.Easing.Back.In, true, 1100);
                    levelCompleteTextTween.onComplete.add(function (current) {
                        current.destroy();
                        current = null;
                        this.goalSuccess();
                        popup.explodeTime = true;
                    }, this);
                }, this);
            } else {
                this.goalSuccess();
            }
        } else if (levelMoves > 0 && popup.level_quit === null) {
            this.tutorialTint();
            if (targetShow === true) {
                targetGroup = game.add.group();
                var RectBG = game.add.graphics(0, 200);
                RectBG.beginFill(0x7129a7, 0.3);
                RectBG.drawRect(0, 0, game.width, 200);
                RectBG.alpha = 0;

                targetMable = game.add.image(255, -150, "targetMable");
                var targetMableTween = this.add.tween(targetMable)
                    .to({y: 240 }, 500, Phaser.Easing.Back.Out, true, 500);

                targetMableTween.onComplete.add(function (current) {
                    targetHint = game.add.image(400, 225, "targetHint");
                    targetHint.alpha = 0;
                    tmpText = 'Задание:';
                    targetHintText = game.add.text(80, -5, tmpText, { 'font': 'bold 14pt MainFont', fill: '#7129a7', stroke: '#fff', strokeThickness: 4});
                    targetHint.addChild(targetHintText);

                    goalOffsetY = 0;
                    goalOffsetX = 0;
                    goalOffsetTextX = 40;

                    goalSprite = game.add.sprite(goalOffsetX, goalOffsetY, 'goalScore');
                    goalText = game.add.text(goalOffsetTextX, 6 + goalOffsetY, levelScoreGoal, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                    goalOffsetY += 37;
                    targetGroup.add(goalSprite);
                    targetGroup.add(goalText);

                    if (goals.length > 0) {
                        for (var i = 0; i < goals.length; i++) {
                            if (goals[i].type == 'object' && goals[i].object_type == 'ruby') {
                                goalSprite = game.add.sprite(goalOffsetX, goalOffsetY, 'goalRuby');
                                goalText = game.add.text(goalOffsetTextX, 6 + goalOffsetY, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                                goalText.text = goals[i].count;
                            }

                            if (goals[i].type == 'object' && goals[i].object_type == 'bubble') {
                                goalSprite = game.add.sprite(goalOffsetX, goalOffsetY, 'goalBubble');
                                goalText = game.add.text(goalOffsetTextX, 6 + goalOffsetY, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                                goalText.text = goals[i].count;
                            }

                            if (goals[i].type == 'object' && goals[i].object_type == 'counter') {
                                goalSprite = game.add.sprite(goalOffsetX, goalOffsetY -2, 'goalCounter');
                                goalText = game.add.text(goalOffsetTextX, 6 + goalOffsetY, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                                goalText.text = goals[i].count;
                            }

                            if (goals[i].type == 'object' && goals[i].object_type == 'sand') {
                                goalSprite = game.add.sprite(goalOffsetX +1, goalOffsetY +2, 'goalWater');
                                goalText = game.add.text(goalOffsetTextX, 6 + goalOffsetY, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                                goalText.text = goals[i].count;
                            }

                            if (goals[i].type == 'object' && goals[i].object_type == 'ghost') {
                                goalSprite = game.add.sprite(goalOffsetX, goalOffsetY, 'goalZombie');
                                goalText = game.add.text(goalOffsetTextX, 6 + goalOffsetY, '-', { 'font': 'bold 14px MainFont', fill: '#7129a7'});

                                if (goals[i].count > 0) {
                                    goalText.text = goals[i].count;
                                } else {
                                    goalText.text = 'Все'
                                }
                            }
                            goalOffsetY += 37;
                            targetGroup.add(goalSprite);
                            targetGroup.add(goalText);
                        }
                    }

                    targetGroup.x += targetHint.width / 2;
                    targetGroup.x -= targetGroup.width / 2;

                    targetGroup.y += targetHint.height / 2;
                    targetGroup.y -= targetGroup.height / 2;

                    targetHint.addChild(targetGroup);

                    var targetHintTween = this.add.tween(targetHint)
                        .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                    targetHintTween.onComplete.add(function (current) {
                        var targetHintTween = this.add.tween(current)
                            .to({alpha:0 }, 300, Phaser.Easing.Linear.In, true, 2000);
                        targetHintTween.onComplete.add(function (current) {
                            current.destroy();
                            current = null;
                        }, this);
                    }, this);

                    var targetMableTween = this.add.tween(current)
                        .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 2400);
                    targetMableTween.onComplete.add(function (current) {
                        current.destroy();
                        current = null;
                    }, this);

                }, this);

                var RectTween = this.add.tween(RectBG)
                    .to({alpha: 1 }, 1000, Phaser.Easing.Back.Out, true, 0);
                RectTween.onComplete.add(function (current) {
                    var RectTween = this.add.tween(current)
                        .to({alpha:0 }, 300, Phaser.Easing.Back.In, true, 2400);
                    RectTween.onComplete.add(function (current) {
                        current.destroy();
                        current = null;
                        targetShow = false;
                        game.input.onDown.add(this.pickTile, this);
                    }, this);
                }, this);

            } else {
                game.input.onDown.add(this.pickTile, this);
            }
        } else if (levelMoves == 0) {
            levelMoves--;
        } else if (levelMoves == -1) {
            game.timer = this.game.time.create(this.game);
            game.timer.add(500, this.incompleteLevel, this);
            game.timer.start();
        }
    },

    tutorialTint:function(){

        if (tutorialOn === true && JSON.stringify(tutorialCheck) === JSON.stringify(tutorialObjectArr)) {
            tutorialOn = false;
            for (i = 0; i < characterArray.length; i++) {
                for (var j = 0; j < characterArray[i].length; j++) {
                    this.add.tween(characterArray[i][j]).to({alpha: 1}, 200, Phaser.Easing.Back.Out, true, 200);
                }
            }
            tutorialArrowShow = false;
            if (tutorialArrow !== null) {
                tutorialArrow.destroy();
                tutorialArrow = null;
            }

            if (levelID == 1) {
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 100);

                var tutorialMableTween = this.add.tween(tutorialMable)
                    .to({y: 10 }, 500, Phaser.Easing.Back.Out, true, 100);

                tutorialMableTween.onComplete.add(function () {
                    tutorialHint.y = 10;
                    tutorialHintText.text = 'Чем длиннее линия, тем больше очков. Продолжайте и наберите ' + levelStar_1 + ' очков.';
                    tutorialHint.addChild(tutorialHintText);
                    var tutorialHintTween = this.add.tween(tutorialHint)
                        .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                }, this);
            }

            if (levelID == 2) {
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 100);

                var tutorialMableTween = this.add.tween(tutorialMable)
                    .to({y: 10 }, 500, Phaser.Easing.Back.Out, true, 100);

                tutorialMableTween.onComplete.add(function () {
                    tutorialHint.y = 5;
                    tutorialHintText.text = 'СуперМабл очистит последний ряд, которого вы коснетесь';
                    tutorialHint.addChild(tutorialHintText);
                    var tutorialHintTween = this.add.tween(tutorialHint)
                        .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                }, this);
            }

            if (levelID == 4) {
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 100);

                var tutorialMableTween = this.add.tween(tutorialMable)
                    .to({y: 10 }, 500, Phaser.Easing.Back.Out, true, 100);

                tutorialMableTween.onComplete.add(function () {
                    tutorialHint.y = 10;
                    tutorialHintText.text = 'Продолжай очищать воду под маблами. Осталось совсем немного.';
                    tutorialHint.addChild(tutorialHintText);
                    var tutorialHintTween = this.add.tween(tutorialHint)
                        .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);
                }, this);
            }

            if (levelID == 6 || levelID == 9) {
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 100);

                var tutorialMableTween = this.add.tween(tutorialMable)
                    .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 100);
            }
        }

        if (tutorialOn === true) {
            for (var i = 0; i < characterArray.length; i++) {
                for (var j = 0; j < characterArray[i].length; j++) {
                    if (characterArray[i][j] !== null && characterArray[i][j].object_type == tutorialObjectType && characterArray[i][j].object_id != tutorialObjectID) {
                        this.add.tween(characterArray[i][j]).to({alpha: 0.4}, 300, Phaser.Easing.Back.Out, true, 0);
                    }
                }
            }
        }

        if (levelID == 3 && levelMoves == levelMovesSave-1) {
            var tutorialHintTween = this.add.tween(tutorialHint)
                .to({alpha: 0 }, 300, Phaser.Easing.Linear.None, true, 100);

            var tutorialMableTween = this.add.tween(tutorialMable)
                .to({y: 8 }, 500, Phaser.Easing.Back.Out, true, 100);

            tutorialMableTween.onComplete.add(function () {
                tutorialHint.y = 5;
                tutorialHintText.text = 'Чтобы пройти уровень, нужно выполнить задание. На этом уровне нужно набрать ' + levelStar_1 + ' очков';
                tutorialHint.addChild(tutorialHintText);
                var tutorialHintTween = this.add.tween(tutorialHint)
                    .to({alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 100);

                this.add.tween(scorePanelPlaceTarget)
                    .to({alpha: 0.2 }, 400, Phaser.Easing.Linear.None, true, null, 9, true);
            }, this);
        }
    },

    goalSuccess:function() {
        bonusIsset = false;
        for(var i = 0; i < levelHeight; i++) {
            for (var j = 0; j < levelWidth; j++) {
                if (characterArray[i][j] !== null && characterArray[i][j].special === false && characterArray[i][j].bonus != 0) {
                    var X = characterArray[i][j].x;
                    var Y = characterArray[i][j].y;
                    var scoreThis = characterArray[i][j].score;
                    userMoves.push([]);
                    if (bonusAdd == false) {
                        scoreBonus = 500;
                        userMoves[userMoves.length-1].push(1);
                    }
                    else if (scoreThis && bonusAdd == true) {
                        scoreBonus = scoreThis;
                        if (scoreBonus == 1500){
                            userMoves[userMoves.length - 1].push(9);
                        } else {
                            userMoves[userMoves.length - 1].push(10);
                        }
                    }

                    var scoreTile = game.add.text(X, Y, scoreBonus, { 'font': '16px MainFont', fill: '#fff', stroke: '#7129a7', strokeThickness:4});
                    scoreTile.anchor.setTo(0.6, 1.5);
                    var scoreTileTween = this.add.tween(scoreTile)
                        .to({alpha: 0, y:Y-20 }, 2000, Phaser.Easing.Back.In, true, 0);
                    scoreTileTween.onComplete.add(function(current){
                        current.destroy();
                        current = null;
                    } ,this);

                    if (characterArray[i][j].getBonusAnim !== null) {
                        characterArray[i][j].getBonusAnim.destroy();
                        characterArray[i][j].getBonusAnim = null;
                    }
                    if (characterArray[i][j].bonusAnim !== null) {
                        characterArray[i][j].bonusAnim.destroy();
                        characterArray[i][j].bonusAnim = null;
                    }
                    characterArray[i][j].destroy();
                    characterArray[i][j] = null;
                    userCollectObject.character++;

                    bonusCount = 0;

                    this.increaseScore(scoreBonus);

                    var explode_boom = game.add.sprite(
                            j * game.global.tileSize + game.global.tileSize / 2 + levelOffsetX,
                            i * game.global.tileSize + game.global.tileSize / 2 + levelOffsetY,
                        'explode'
                    );

                    explode_boom.anchor.setTo(0.5);

                    var animExplosion = explode_boom.animations.add('explode',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],15,false,true);
                    explode_boom.animations.play('explode');
                    animExplosion.killOnComplete = true;

                    this.explodeBonusHorizontal(i, j);
                    this.explodeBonusVertical(i, j);
                    bonusIsset = true;
                    bonusFromMoveArr = [];
                }
            }
        }

        if (levelMoves == -1) {
            game.timer = this.game.time.create(this.game);
            game.timer.add(700, function () {
                this.completeLevel();
            }, this);
            game.timer.start();
        } else if (popup.explodeTime == true && bonusIsset === false) {
            if (levelMoves > 0) {
                if (levelMoves > 3) {
                    this.bonusFromMove(3);
                } else {
                    this.bonusFromMove(levelMoves);
                }
            } else {
                var gameplayMusicTween = this.add.tween(game.musicGameplay)
                    .to({volume: 0 }, 1000, Phaser.Easing.Linear.None, true, 0);
                gameplayMusicTween.onComplete.add(function(current){
                    game.musicGameplay.stop();
                    game.musicGameplay.volume = 1;
                    this.completeLevel();
                } ,this);
            }
        } else {
            game.timer = this.game.time.create(this.game);
            game.timer.add(300, this.createNewTilesNew, this);
            game.timer.start();
        }
    },

    bonusFromMove:function(bonusToMoves){
        if (bonusToMoves > 0) {
            var posY = game.rnd.between(0,levelHeight -1);
            var posX = game.rnd.between(0,levelWidth -1);
            if (game.objectFindByKey(bonusFromMoveArr, 'y',posY)) {
                this.bonusFromMove(bonusToMoves);
            } else  if (game.objectFindByKey(bonusFromMoveArr, 'x',posX)) {
                this.bonusFromMove(bonusToMoves);
            } else if (characterArray[posY][posX] !== null && characterArray[posY][posX].special === false && characterArray[posY][posX].object_type == 'character' && characterArray[posY][posX].bonus == 0) {
                bonusFromMoveArr.push({x:posX, y:posY});
                bonusCount++;
                this.decreaseMoveBonus();
                var X = characterArray[posY][posX].x;
                var Y = characterArray[posY][posX].y;
                characterArray[posY][posX].bonus = 2;
/***/
                var bonus = game.add.sprite(120,380,'bonus');

                bonusGroup.add(bonus);
                bonus.anchor.setTo(0.5);

                bonus.animations.add('bonus', [0,1,2,3,4,5,6,7,8], 15, true, true);
                bonus.animations.play('bonus');

                tweenBonus = this.add.tween(bonus.scale).to({x:1, y:1}, 200, Phaser.Easing.Linear.None, true);

                var bonusTween = game.add.tween(bonus);
                bonusTween.to({
                    y: Y - game.global.tileSize / 2,
                    x: X
                }, 250 ,Phaser.Easing.Linear.InOut, true);

                bonusTween.onComplete.add(function(current){
                    current.destroy();
                    current = null;
                    if (characterArray[posY][posX] !== null) {

                        bonusFX = game.add.sprite(X, Y - game.global.tileSize / 2 - game.global.tileOffsetY, "effects");
                    bonusFX.anchor.setTo(0.5);
                    bonusFX.animations.add('bonusH', [15,16,17,18,19,20,21,22,23,24,25,26,27,28], 15, true, true);
                    bonusFX.animations.play('bonusH');
                    bonusGroup.add(bonusFX);

                        characterArray[posY][posX].bonusAnim = bonusFX;
                        characterArray[posY][posX].frame = characterArray[posY][posX].object_id + game.global.mables_count;
                        characterBonusGroup.add(characterArray[posY][posX]);

                        if (bonusCount < 3) {
                            characterArray[posY][posX].score = 1500;
                        } else {
                            characterArray[posY][posX].score = 5000;
                        }
                    }
                    bonusAdd = true;
                    this.bonusFromMove(bonusToMoves-1);
                },this);
/***/
            } else {
                this.bonusFromMove(bonusToMoves);
            }
        } else {
            game.timer = this.game.time.create(this.game);
            game.timer.add(200, this.createNewTilesNew, this);
            game.timer.start();
        }
    },

    ghostClone:function(){
        if (ghostArr.length > 0 && userMoves.length > 0) {
            if (ghostProtect === true) {
                var ghostID = game.rnd.between(0, ghostArr.length - 1);
                if (ghostArr[ghostID] !== undefined && ghostArr[ghostID].neighbours['chr'].length > 0) {
                    var chrID = game.rnd.between(0, ghostArr[ghostID].neighbours['chr'].length - 1);
                    var posX = ghostArr[ghostID].neighbours['chr'][chrID].x;
                    var posY = ghostArr[ghostID].neighbours['chr'][chrID].y;

                    var tileXPos = levelOffsetX + posX * game.global.tileSize + game.global.tileSize / 2;
                    var tileYPos = levelOffsetY + posY * game.global.tileSize + game.global.tileSize / 2;

                    theTile = game.add.sprite(tileXPos, tileYPos, "spec_object");
                    theTile.special = ghostArr[ghostID].special;
                    theTile.object_id = ghostArr[ghostID].object_id;
                    theTile.object_type = ghostArr[ghostID].object_type;
                    theTile.live_count = ghostArr[ghostID].live_count;
                    theTile.score = ghostArr[ghostID].score;
                    theTile.frame = ghostArr[ghostID].frame;
                    theTile.bonus = ghostArr[ghostID].bonus;
                    theTile.getBonusAnim = null;
                    theTile.bonusAnim = null;
                    theTile.count = ghostArr[ghostID].count;
                    theTile.character = ghostArr[ghostID].character;
                    theTile.drawBonus = ghostArr[ghostID].drawBonus;
                    theTile.getBonus = ghostArr[ghostID].getBonus;
                    theTile.explode_vector = ghostArr[ghostID].explode_vector;
                    theTile.anchor.setTo(0.5);
                    theTile.scale.x = 0;
                    theTile.scale.y = 0;

                    this.add.tween(theTile.scale).to({x:1, y:1 }, 300, Phaser.Easing.Back.Out, true, 0);
                    if (characterArray[posY][posX] !== null && characterArray[posY][posX] != 'empty') {
                        if (characterArray[posY][posX].getBonusAnim !== null) {
                            characterArray[posY][posX].getBonusAnim.destroy();
                            characterArray[posY][posX].getBonusAnim = null;
                        }
                        if (characterArray[posY][posX].bonusAnim !== null) {
                            characterArray[posY][posX].bonusAnim.destroy();
                            characterArray[posY][posX].bonusAnim = null;
                        }
                        characterArray[posY][posX].destroy();
                    }

                    characterArray[posY][posX] = theTile;
                    characterGroup.add(theTile);
                    ghostProtect = false;
                    this.setTileInfo();
                } else {
                    ghostArr.splice(ghostID,1);
                    this.ghostClone();
                }
            }
        } else {
            ghostProtect = false;
        }
    },

    setTileInfo:function(){
        ghostCount = 0;
        ghostArr = [];
        for(var i = levelHeight -1; i >= 0; i --) {
            for (var j = 0; j < levelWidth; j++) {
                if (characterArray[i][j] !== null) {
                    var neighbours = [];
                    neighbours['special'] = [];
                    neighbours['chr'] = [];
                    neighbours['chrMove'] = [];
                    if (characterArray[i - 1] && characterArray[i - 1][j - 1] !== null && characterArray[i - 1][j - 1] !== undefined) {
                        if (characterArray[i - 1][j - 1].object_type == 'character') {
                            neighbours['chrMove'].push({'x': j - 1, 'y': i - 1});
                        }
                    }
                    if (characterArray[i - 1] && characterArray[i - 1][j] !== null && characterArray[i - 1][j] !== undefined) {
                        if (characterArray[i - 1][j].special === true) {
                            neighbours['special'].push({'x': j, 'y': i - 1});
                        } else if (characterArray[i - 1][j].object_type == 'character') {
                            neighbours['chr'].push({'x': j, 'y': i - 1});
                            neighbours['chrMove'].push({'x': j, 'y': i - 1});
                        }
                    }
                    if (characterArray[i - 1] && characterArray[i - 1][j + 1] !== null && characterArray[i - 1][j + 1] !== undefined) {
                        if (characterArray[i - 1][j + 1].object_type == 'character') {
                            neighbours['chrMove'].push({'x': j + 1, 'y': i - 1});
                        }
                    }
                    if (characterArray[i] && characterArray[i][j - 1] !== null && characterArray[i][j - 1] !== undefined) {
                        if (characterArray[i][j - 1].special === true) {
                            neighbours['special'].push({'x': j - 1, 'y': i});
                        } else if (characterArray[i][j - 1].object_type == 'character') {
                            neighbours['chr'].push({'x': j - 1, 'y': i});
                            neighbours['chrMove'].push({'x': j - 1, 'y': i});
                        }
                    }
                    if (characterArray[i][j + 1] !== null && characterArray[i][j + 1] !== undefined) {
                        if (characterArray[i][j + 1].special === true) {
                            neighbours['special'].push({'x': j + 1, 'y': i});
                        } else if (characterArray[i][j + 1].object_type == 'character')  {
                            neighbours['chr'].push({'x': j + 1, 'y': i});
                            neighbours['chrMove'].push({'x': j + 1, 'y': i});
                        }
                    }
                    if (characterArray[i + 1] && characterArray[i + 1][j - 1] !== null && characterArray[i + 1][j - 1] !== undefined) {
                        if (characterArray[i + 1][j - 1].object_type == 'character') {
                            neighbours['chrMove'].push({'x': j - 1, 'y': i + 1});
                        }
                    }
                    if (characterArray[i + 1] && characterArray[i + 1][j] !== null && characterArray[i + 1][j] !== undefined) {
                        if (characterArray[i + 1][j].special === true) {
                            neighbours['special'].push({'x': j, 'y': i + 1});
                        } else if (characterArray[i + 1][j].object_type == 'character') {
                            neighbours['chr'].push({'x': j, 'y': i + 1});
                            neighbours['chrMove'].push({'x': j, 'y': i + 1});
                        }
                    }
                    if (characterArray[i + 1] && characterArray[i + 1][j + 1] !== null && characterArray[i + 1][j + 1] !== undefined) {
                        if (characterArray[i + 1][j + 1].object_type == 'character') {
                            neighbours['chrMove'].push({'x': j + 1, 'y': i + 1});
                        }
                    }
                    characterArray[i][j].neighbours = neighbours;

                    if (characterArray[i][j].special === true && characterArray[i][j].object_type == 'ghost') {
                        ghostCount++;
                        ghostArr.push(characterArray[i][j]);
                    }
                }
            }
        }
        if (ghostArr.length > 0 && ghostProtect === true) {
            this.ghostClone();
        }

        if (ghostArr.length == 0 || ghostProtect === false){
            move = this.checkMove();
            this.checkGoal();
        }
    },

    checkMove:function(){
        var move = [];
        for(var i = 0; i < levelHeight; i++) {
            for (var j = 0; j < levelWidth; j++) {
                move = [];
                if (characterArray[i][j] !== null && characterArray[i][j].special === false && characterArray[i][j].neighbours['chrMove'].length > 0) {
                    move.push(characterArray[i][j]);
                    for (var r1 = 0; r1 < characterArray[i][j].neighbours['chrMove'].length; r1++) {
                        var posX = characterArray[i][j].neighbours['chrMove'][r1].x;
                        var posY = characterArray[i][j].neighbours['chrMove'][r1].y;
                        if (characterArray[posY][posX] !== null && characterArray[posY][posX].neighbours['chrMove'].length > 0 && characterArray[posY][posX].object_id == characterArray[i][j].object_id) {
                            move.push(characterArray[posY][posX]);
                            for (var r2 = 0; r2 < characterArray[posY][posX].neighbours['chrMove'].length; r2++) {
                                var posX2 = characterArray[posY][posX].neighbours['chrMove'][r2].x;
                                var posY2 = characterArray[posY][posX].neighbours['chrMove'][r2].y;
                                if (characterArray[posY2][posX2] !== null && characterArray[posY2][posX2] !== characterArray[posY][posX] && characterArray[posY2][posX2] !== characterArray[i][j] && characterArray[posY2][posX2].neighbours['chrMove'].length > 0 && characterArray[posY2][posX2].object_id == characterArray[i][j].object_id) {
                                    move.push(characterArray[posY2][posX2]);
                                    return move;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (this.setMoveTwo()) {
            this.setTileInfo();
        } else {
            this.setMoveOne();
        }
    },

    setMoveTwo:function() {
        for(var posY = 0; posY < levelHeight; posY++) {
            for (var posX = 0; posX < levelWidth; posX++) {
                if (characterArray[posY][posX] !== null && characterArray[posY][posX] !== undefined && characterArray[posY][posX].special === false && characterArray[posY][posX].neighbours['chrMove'].length > 0) {
                    for (var r1 = 0; r1 < characterArray[posY][posX].neighbours['chrMove'].length; r1++) {
                        var posX2 = characterArray[posY][posX].neighbours['chrMove'][r1].x;
                        var posY2 = characterArray[posY][posX].neighbours['chrMove'][r1].y;
                        if (characterArray[posY2][posX2] !== null && characterArray[posY2][posX2].neighbours['chrMove'].length > 0 && characterArray[posY2][posX2].object_id == characterArray[posY][posX].object_id) {
                            rnd = game.rnd.between(0, characterArray[posY2][posX2].neighbours['chrMove'].length - 1);
                            var posX3 = characterArray[posY2][posX2].neighbours['chrMove'][rnd].x;
                            var posY3 = characterArray[posY2][posX2].neighbours['chrMove'][rnd].y;
                            theTile = game.add.sprite(characterArray[posY3][posX3].x, characterArray[posY3][posX3].y, "mables");
                            theTile.special = false;
                            theTile.fall = false;
                            theTile.live_count = 0;
                            theTile.score = 100;
                            theTile.count = 0;
                            theTile.options = false;
                            theTile.drawBonus = false;
                            theTile.getBonus = false;
                            theTile.getBonusAnim = null;
                            theTile.bonus = 0;
                            theTile.bonusAnim = null;
                            theTile.explode_vector = 0;
                            theTile.frame = characterArray[posY2][posX2].object_id;
                            theTile.visited = false;
                            theTile.object_id = characterArray[posY][posX].object_id;
                            theTile.object_type = 'character';
                            theTile.anchor.setTo(0.5, 1);
                            theTile.alpha = 1;
                            if (characterArray[posY3][posX3].getBonusAnim !== null) {
                                characterArray[posY3][posX3].getBonusAnim.destroy();
                                characterArray[posY3][posX3].getBonusAnim = null;
                            }
                            if (characterArray[posY3][posX3].bonusAnim !== null) {
                                characterArray[posY3][posX3].bonusAnim.destroy();
                                characterArray[posY3][posX3].bonusAnim = null;
                            }
                            characterArray[posY3][posX3].destroy();
                            characterArray[posY3][posX3] = theTile;

                            characterGroup.add(theTile);


                            console.log(posY3);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },

    setMoveOne:function() {
        var posX = game.rnd.between(0, levelWidth - 1);
        var posY = game.rnd.between(0, levelHeight - 1);

        if (characterArray[posY][posX] !== null && characterArray[posY][posX] !== undefined && characterArray[posY][posX].special === false && characterArray[posY][posX].neighbours['chrMove'].length > 0) {
            for (var r1 = 0; r1 < characterArray[posY][posX].neighbours['chrMove'].length; r1++) {
                var posX2 = characterArray[posY][posX].neighbours['chrMove'][r1].x;
                var posY2 = characterArray[posY][posX].neighbours['chrMove'][r1].y;
                if (characterArray[posY2][posX2] !== null && characterArray[posY2][posX2].neighbours['chrMove'].length > 0 && characterArray[posY2][posX2].object_id != characterArray[posY][posX].object_id) {
                    theTile = game.add.sprite(characterArray[posY2][posX2].x, characterArray[posY2][posX2].y, "mables");
                    theTile.special = false;
                    theTile.fall = false;
                    theTile.live_count = 0;
                    theTile.score = 100;
                    theTile.count = 0;
                    theTile.options = false;
                    theTile.drawBonus = false;
                    theTile.getBonus = false;
                    theTile.getBonusAnim = null;
                    theTile.bonus = 0;
                    theTile.bonusAnim = null;
                    theTile.explode_vector = 0;
                    theTile.frame = characterArray[posY][posX].object_id;
                    theTile.visited = false;
                    theTile.object_id = characterArray[posY][posX].object_id;
                    theTile.object_type = 'character';
                    theTile.anchor.setTo(0.5, 1);
                    theTile.alpha = 1;
                    if (characterArray[posY2][posX2].getBonusAnim !== null) {
                        characterArray[posY2][posX2].getBonusAnim.destroy();
                        characterArray[posY2][posX2].getBonusAnim = null;
                    }
                    if (characterArray[posY2][posX2].bonusAnim !== null) {
                        characterArray[posY2][posX2].bonusAnim.destroy();
                        characterArray[posY2][posX2].bonusAnim = null;
                    }
                    characterArray[posY2][posX2].destroy();
                    characterArray[posY2][posX2] = theTile;

                    characterGroup.add(theTile);
                    console.log('yes');
                    console.log(posX2);
                    console.log(posY2);
                    this.setTileInfo();
                }
            }

        } else {
            this.setMoveOne();
        }
    },

	isTilePicked:function(tileObject){

	     /*

	     it's just a for loop scanning through all visitedTiles items looking
	     for an item with the same row and col attributes as the object passed as argument

	     */

		for(var i = 0; i < visitedTiles.length; i ++){
			if(tileObject.col == visitedTiles[i].col && tileObject.row == visitedTiles[i].row){

				/*

				found it! return true and exit the function

				*/

				return true;
			}
		}

		/*

		did not found

		*/

		return false;
	},

	placeArrow:function(row,col){

    var arrowX = levelOffsetX + visitedTiles[visitedTiles.length - 1].col * game.global.tileSize + game.global.tileSize / 2;
	var arrowY = levelOffsetY + visitedTiles[visitedTiles.length - 1].row * game.global.tileSize + game.global.tileSize / 2;

    var rowDiff = visitedTiles[visitedTiles.length - 1].row - row;
    var colDiff = visitedTiles[visitedTiles.length - 1].col - col;

        if (Math.abs(rowDiff) + Math.abs(colDiff) == 1) {
            theArrow = game.add.sprite(arrowX, arrowY, "lineHorizontal");
            theArrow.anchor.setTo(1, 0.5);
        } else {
            theArrow = game.add.sprite(arrowX, arrowY, "lineDiagonal");
            theArrow.anchor.setTo(1, 1);
        }
        theArrow.scale.setTo(0.5);

        switch (startObjectID) {
            case 0:
                theArrow.tint = 0x2ff8f6;
                break;
            case 1:
                theArrow.tint = 0x00ec52;
                break;
            case 2:
                theArrow.tint = 0x8260ed;
                break;
            case 3:
                theArrow.tint = 0xff8afe;
                break;
            case 4:
                theArrow.tint = 0xffb337;
                break;
            case 5:
                theArrow.tint = 0xffff85;
                break;
        }

        theArrow.animations.add('arrow', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, true, true);
        theArrow.animations.play('arrow');

      /*

      baseTenDiff  will be used to determine how to rotate the arrow according
      to row and column difference, following this table

      rowDiff | colDiff | baseTenDiff | rotation
      --------+---------+-------------+-----------
          0        1           1           0
          0       -1          -1           180
          1        0          10           90
          1        1          11           0
          1       -1           9           90
          -1       0         -10           270
          -1       1          -9           270
          -1      -1         -11           180

      */

        var baseTenDiff = rowDiff * 10 + colDiff;
        if (baseTenDiff == 10 || baseTenDiff == 9) {
            theArrow.angle = 90;
        }
        if (baseTenDiff == -10 || baseTenDiff == -9) {
            theArrow.angle = 270;
        }
        if (baseTenDiff == -1 || baseTenDiff == -11) {
            theArrow.angle = 180;
        }

        arrowGroup.add(theArrow);
        arrowArray.push(theArrow);
	},

	removeLastArrow: function(){

	     /*

	     destroying the image and freeing memory

	     */

          arrowArray[arrowArray.length - 1].destroy();
          arrowArray[arrowArray.length - 1] = null;

          /*

          removing latest element from arrowArray array

          */

          arrowArray.pop();

          /*

          changing the latest arrow - if any - to an actual arrow by changing its frame

          */

          if(arrowArray.length > 0){
			arrowArray[arrowArray.length - 1].frame += 2;
		}
	},

    quitLevel: function () {
        if (popup.level_quit == null && popup.levelComplete == false) {
            game.input.onDown.remove(this.pickTile, this);

            fade = game.add.graphics(0, 0);
            fade.beginFill(0x000000, 1);
            fade.drawRect(0, 0, game.width, game.height);
            fade.alpha = 0;
            this.add.tween(fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowQuit = game.add.image(game.width / 2, game.height / 2, "windowQuitLevel");
            windowQuit._this = this;
            windowQuit.alpha = 0.8;
            windowQuit.anchor.set(0.5);
            windowQuit.inputEnabled = true;
            windowQuit.scale.set(0.9);
            windowQuit.closed = true;
            windowQuit.windowType = 'level_quit';

            windowTween = game.add.tween(windowQuit).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowQuit.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);

            text = game.add.text(0, 0, 'Вы хотите выйти?', { 'font': '18px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 4});
            text.anchor.setTo(0.5);
            text.align = "center";
            windowQuit.addChild(text);

            closeButton = game.make.button(130, -110, 'buttonClose', null, windowQuit, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(this.closeWindow, windowQuit);
            windowQuit.addChild(closeButton);

            continueButton = game.make.button(-65, 70, 'windowQuitGreenButton', null, this, 0, 1, 2);
            continueButton.anchor.setTo(0.5, 1);
            continueButton.inputEnabled = true;
            continueButton.clicked = false;
            continueButton.level_id = levelID;
            continueButton.input.priorityID = 1;
            continueButton.input.useHandCursor = true;
            continueButton.events.onInputUp.add(this.closeWindow, windowQuit);

            continueButtonText = game.add.text(0, -20, 'Продолжить', { 'font': '14px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            continueButtonText.anchor.setTo(0.5);
            continueButtonText.align = "center";
            continueButton.addChild(continueButtonText);

            windowQuit.addChild(continueButton);

            quitButton = game.make.button(65, 70, 'windowQuitBlueButton', null, this, 0, 1, 2);
            quitButton.anchor.setTo(0.5, 1);
            quitButton.inputEnabled = true;
            quitButton.clicked = false;
            quitButton.level_id = levelID;
            quitButton.input.priorityID = 1;
            quitButton.input.useHandCursor = true;
            quitButton.events.onInputUp.add(function () {
                var blackFade = game.add.image(0, 0, "blackfade");
                blackFade.alpha = 0;
                var fadeTween = game.add.tween(blackFade);
                fadeTween.to({
                    alpha: 1
                }, 1000, Phaser.Easing.Cubic.Out, true);
                fadeTween.onComplete.add(function () {
                    this.game.state.clearCurrentState();
                    game.levelStart = null;
                    game.currentLevel = levelID;
                    this.game.state.start("LevelMap", false, false);
                }, this);
            }, this);

            quitButtonText = game.add.text(0, -20, 'Выйти', { 'font': '14px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 4});
            quitButtonText.anchor.setTo(0.5);
            quitButtonText.align = "center";
            quitButton.addChild(quitButtonText);

            windowQuit.addChild(quitButton);
            popup.level_quit = windowQuit;
        }
    },

    completeLevel: function () {
        if (game.scoreCalc(userMoves) == score) {
            game.getServer({social_id: game.global.social_id, method: 'saveLevelResult', level_id: levelID, score: score, userMoves:userMoves}, function(data){
                if (game.global.lives < game.global.max_lives) {
                    game.global.lives++;
                }
            });
            game.levelStart = parseInt(levelID + 1);
            game.currentLevel = parseInt(levelID + 1);
            game.levelComplete = levelID;
            game.levelCompleteScore = score;
            this.completeLevelWindow();
        } else {
          console.log('NO');
        }
    },

    incompleteLevel: function () {
        if (game.scoreCalc(userMoves) == score) {
            game.getServer({social_id: game.global.social_id, method: 'saveLevelResult', level_id: levelID, score: score, userMoves:userMoves}, function(data){
            });
            game.currentLevel = levelID;
            game.levelComplete = null;
            game.levelCompleteScore = 0;
            game.levelStart = null;
            this.incompleteLevelWindow();
        } else {
            console.log('NO');
        }
    },

    toggleSound: function(button){
          if (!game.global.playSounds) {
              soundButton.frame = 0;
          } else {
              soundButton.frame = 3;
          }
          game.global.playSounds = !game.global.playSounds;
     },

    toggleMusic: function(button){
          if (!game.global.playMusic) {
              musicButton.frame = 0;
              game.musicGameplay.play();
          } else {
              musicButton.frame = 3;
              game.musicGameplay.stop();
          }
          game.global.playMusic = !game.global.playMusic;
     },

    goToLevelMap: function(){
        var blackFade = game.add.image(0, 0, "blackfade");
        blackFade.alpha = 0;
        var fadeTween = game.add.tween(blackFade);
        fadeTween.to({
            alpha: 1
        }, 1000, Phaser.Easing.Cubic.Out, true);
        fadeTween.onComplete.add(function () {
            game.state.clearCurrentState();
            game.levelStart = null;
            game.currentLevel = levelID;
            game.state.start("LevelMap", false, false);
        }, this);
    },

    shutdown: function(){

        levelWidth = 0;
        levelHeight = 0;
        levelMaxColor = 6;
        levelBonusStep = 5;
        levelObjects = [];
        goals = [];
        levelScoreGoal = null;
        levelMoves = 0;
        progressbarLine = null;
        progressbarLineMask = null;
        levelStar_1 = 0;
        levelStar_2 = 0;
        levelBackID = 1;
        levelFill = 1;
        share = true;

        targetShow = true;

        tutorialOn = false;
        tutorialObjectType = null;
        tutorialObjectID = null;
        tutorialObjectArr = [];
        tutorialPickFirst = {};
        tutorialCheck = [];
        tutorialMable = null;
        tutorialHint = null;
        tutorialHintText = null;
        tutorialArrow = null;
        tutorialArrowShow = true;

        progressbarStar1 = null;
        progressbarStar2 = null;
        progressbarStar3 = null;

        levelStarRender.star1 = false;
        levelStarRender.star2 = false;
        levelStarRender.star3 = false;

        levelOffsetX;
        levelOffsetY;

        levelMovesText = null;

        characterMap = [];
        sandMap = [];
        rubyCount = 0;
        rubyInMap = 0;
        rubyPosition = [];
        rowCount = 0;

        scoreIncrease = 0;
        scoreIncreaseCount = 30;
        visitedCount = 0;

        topPanelGroup = null;
        scorePanel = null;
        tileSandGroup = null;
        tileMapGroup = null;
        bonusMapGroup = null;
        arrowGroup = null;
        characterGroup = null;
        bonusGroup = null;
        bonusCount = 0;
        bonusAdd = false;

        animFall = [];
        currentCounter = null;
        currentCounterBonus = [];
        bonusCounter = 0;
        ghostArr = [];
        ghostProtect = true;

        characterArray = [];
        tileSandArray = [];
        bonusArray = [];
        arrowArray = [];
        visitedTiles = [];
        bonusTiles = [];
        moveIndex = 0;
        moveBonusIndex = 0;
        operationsInQueue = 0;
        operationsCreate = 0;
        operationsBonus = 0;
        scoreText = null;
        score = null;
        emitter = null;
        pop = [];
        remove = [];

        goalTextArr.score = null;
        goalTextArr.ruby = null;
        goalTextArr.bubble = null;
        goalTextArr.sand = null;
        goalTextArr.counter = null;
        goalTextArr.ghost = null;

        userMoves = [];
        userCollectObject.character = 0;
        userCollectObject.ruby = 0;
        userCollectObject.bubble = 0;
        userCollectObject.sand = 0;
        userCollectObject.counter = 0;
        userCollectObject.ghost = 0;

        popup.levelComplete = false;
        popup.levelIncomplete = false;
        popup.level_incomplete = null;
        popup.explodeTime = false;
        popup.level_quit = null;

        fade = null;
    },

    completeLevelWindow: function () {

        game.getServer({social_id: game.global.social_id, level_id: levelID, friends: game.global.friendsAppList, method: 'getFriendScore'}, function (data) {
            friendsInLevel = data.result;
        });

        if(game.global.playSounds){
            var levelCompleteSound = game.add.audio("levelComplete", 1);
            levelCompleteSound.play("", 0, 1, false);
        }

        game.levelStart = parseInt(levelID + 1);
        game.currentLevel = parseInt(levelID + 1);
        game.levelComplete = levelID;
        game.levelCompleteScore = score;

        if (friendsInLevel instanceof Array) {
            me = game.objectFindByKey(friendsInLevel, 'social_id', parseInt(game.global.social_id));
            if (me !== null) {
                var meScoreOld = parseInt(me.score);
                if (me.score < score) {
                    me.score = score;
                }
            } else {
                var meScoreOld = parseInt(score);
                friendsInLevel.push({
                    social_id: parseInt(game.global.social_id),
                    score: score
                });
            }
        }

        fade = game.add.graphics(0, 0 );
        fade.beginFill(0x000000, 1);
        fade.drawRect(0, 0, game.width, game.height);
        fade.alpha = 0;
        this.add.tween(fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

        var windowLevelFinish = game.add.image(game.width / 2, game.height / 2, "windowLevelComplete");

        windowLevelFinish.alpha = 0.8;
        windowLevelFinish.anchor.set(0.5);
        windowLevelFinish.inputEnabled = true;
        windowLevelFinish.scale.set(0.9);
        windowLevelFinish.windowType = 'level_finish';

        windowTween = game.add.tween(windowLevelFinish).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
        game.add.tween(windowLevelFinish.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);

        closeButton = game.make.button(35, -215, 'buttonClose', null, windowLevelFinish, 0, 1, 2);
        closeButton.inputEnabled = true;
        closeButton.input.priorityID = 1;
        closeButton.input.useHandCursor = true;
        closeButton.events.onInputUp.add(function(){
            game.levelStart = null;
            this.game.state.clearCurrentState();
            this.game.state.start("LevelMap", false, false);
        }, this);
        windowLevelFinish.addChild(closeButton);

        glow = game.add.image(-95, -30, "levelCompleteGlow");
        glow.alpha = 1;
        glow.anchor.setTo(0.5);
        this.add.tween(glow).to({angle:'+360'}, 10000, Phaser.Easing.Linear.None, true, 0, 500);
        windowLevelFinish.addChild(glow);

        starsPlace = game.add.image(-96, 30, "levelCompleteStarsPlace");
        starsPlace.anchor.setTo(0.5, 1);
        windowLevelFinish.addChild(starsPlace);

        starTextCheck = false;
        if (levelStarRender.star3 == true) {
            star3 = game.add.image(-21, -20, "levelStartStar");
            star3.anchor.setTo(0.5);
            star3.scale.x = 0;
            star3.scale.y = 0;
            star3.angle = 15;
            windowLevelFinish.addChild(star3);
            this.add.tween(star3.scale).to({x:0.83, y:0.83}, 200, Phaser.Easing.Back.Out, true, 2000);

            if (starTextCheck === false) {
                starTextCheck = true;
            }
        }
        if (levelStarRender.star2 == true) {
            star2 = game.add.image(-95, -37, "levelStartStar");
            star2.anchor.setTo(0.5);
            star2.scale.x = 0;
            star2.scale.y = 0;

            windowLevelFinish.addChild(star2);
            this.add.tween(star2.scale).to({x:1, y:1}, 200, Phaser.Easing.Back.Out, true, 1500);

            if (starTextCheck === false){
                starText = game.add.text(-95, 45, ' Счет на 3 звезды: ' + levelStar_3 + ' ', { 'font': 'bold 14px MainFont', fill: '#7129a7', align: 'center'});
                starText.anchor.setTo(0.5, 1);
                windowLevelFinish.addChild(starText);
                starTextCheck = true;
            }
        }
        if (levelStarRender.star1 == true) {
            star1 = game.add.image(-170, -20, "levelStartStar");
            star1.anchor.setTo(0.5);
            star1.scale.x = 0;
            star1.scale.y = 0;
            star1.angle = -15;

            windowLevelFinish.addChild(star1);
            this.add.tween(star1.scale).to({x:0.83, y:0.83}, 200, Phaser.Easing.Back.Out, true, 1000);

            if (starTextCheck === false) {
                starText = game.add.text(-95, 45, ' Счет на 2 звезды: ' + levelStar_2 + ' ', { 'font': 'bold 14px MainFont', fill: '#7129a7', align: 'center'});
                starText.anchor.setTo(0.5, 1);
                windowLevelFinish.addChild(starText);
                starTextCheck = true;
            }
        }

        levelTitle = game.add.text(-95, -135, 'Уровень ' + levelID, { 'font': 'bold 45px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 5});
        levelTitle.anchor.setTo(0.5, 1);
        windowLevelFinish.addChild(levelTitle);

        levelCompleteText = game.add.text(-95, -90, 'Пройден!', { 'font': 'bold 25px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
        levelCompleteText.anchor.setTo(0.5, 1);
        windowLevelFinish.addChild(levelCompleteText);

        scorePlace = game.add.image(-95, 95, "levelCompleteScorePlace");
        scorePlace.anchor.setTo(0.5, 1);

        levelScore = game.add.text(0, -5, score, { 'font': 'bold 25px MainFont', fill: '#7129a7', align: 'center', stroke: '#fff', strokeThickness: 5});
        levelScore.anchor.setTo(0.5, 1);
        scorePlace.addChild(levelScore);

        windowLevelFinish.addChild(scorePlace);

        continueButton = game.make.button(-95, 190, 'levelContinueButton', null, this, 0, 1, 2);
        continueButton.anchor.setTo(0.5, 1);
        continueButton.inputEnabled = true;
        continueButton.clicked = false;
        continueButton.level_id = levelID;
        continueButton.input.priorityID = 1;
        continueButton.input.useHandCursor = true;
        continueButton.events.onInputUp.add(function(){

            if (share.checked == true) {
                param = {
                    level_id: levelID,
                    score: score
                };
                game.wallPost('level_complete', param);
            }
            var blackFade = game.add.image(0, 0, "blackfade");
            blackFade.alpha = 0;
            var fadeTween = game.add.tween(blackFade);
            fadeTween.to({
                alpha: 1
            }, 1000, Phaser.Easing.Cubic.Out, true);
            fadeTween.onComplete.add(function () {
                this.game.state.clearCurrentState();
                this.game.state.start("LevelMap", false, false);
            }, this);
        }, this);

        share = game.make.button(-150, 100, 'levelCompleteOk', null, this);
        share.inputEnabled = true;
        if (levelID > 3) {
            share.checked = true;
            share.frame = 1;
        } else {
            share.checked = false;
            share.frame = 0;
        }
        share.level_id = levelID;
        share.input.priorityID = 1;
        share.input.useHandCursor = true;
        share.events.onInputUp.add(function(current){
             if (current.frame === 0) {
                 current.frame = 1;
                 share.checked = true;
             } else {
                 current.frame = 0;
                 share.checked = false;
             }
        }, this);
        shareText = game.add.text(25, 3, 'Поделиться', { 'font': 'bold 12px MainFont', fill: '#7129a7'});
        share.addChild(shareText);
        windowLevelFinish.addChild(share);

        windowLevelFinish.addChild(continueButton);

        var friendScroll = game.add.group();
        friendScroll.draggable = true;
        friendScroll.x = 150;
        friendScroll.y = -60;

        titleHignScore = game.add.text(-15, -55, 'Рекорд', { 'font': 'bold 20px MainFont', fill: '#7129a7'});
        titleHignScore.anchor.setTo(0.5, 1);
        friendScroll.add(titleHignScore);
//
        var friendPositionY = 0;
        var OffsetPositionY = 50;

        if (friendsInLevel instanceof Array) {
            friendsInLevel.sort(game.dynamicSort("-score"));

            for (key in friendsInLevel) {
                number = parseInt(key) + 1;
                if (friendsInLevel[key].social_id == game.global.social_id) {
                    game.global.friendBeatenArr.me_num = number;
                    placeFriend = game.add.image(0, 0 + friendPositionY, "levelStartPlaceFriend");
                    placeFriend.anchor.setTo(0.5, 1);
                    friendScroll.add(placeFriend);
                } else if (meScoreOld < parseInt(friendsInLevel[key].score) && score > parseInt(friendsInLevel[key].score)) {
                    game.global.friendBeatenArr.score = score;
                    game.global.friendBeatenArr.level_id = levelID;
                    if (game.global.friendBeatenArr.beaten == null) {
                        game.global.friendBeatenArr.beaten_num = number;
                        game.global.friendBeatenArr.beaten = friendsInLevel[key].social_id;
                    } else {
                        game.global.friendBeatenArr.count++;
                    }
                }
//
                positionNumber = game.add.text(-65, -33 + friendPositionY, number, { 'font': 'bold 12px MainFont', fill: '#7129a7', align: 'left'});
                positionNumber.anchor.setTo(0, 0);
                friendScroll.add(positionNumber);

                iconFriend = game.add.image(-30, -4 + friendPositionY, "levelStartIconFriend");
                iconFriend.anchor.setTo(0.5, 1);

                usr = game.objectFindByKey(game.global.friendsApp, 'uid', friendsInLevel[key].social_id);

                loader = new Phaser.Loader(game);
                iconFriend.avatarImg = 'avatar_' + friendsInLevel[key].social_id;
                loader.image(iconFriend.avatarImg, usr.photo_50);
                loader.onLoadComplete.add(function () {
                    avatar = game.make.bitmapData(50, 50);
                    avatar.alphaMask(this.avatarImg, 'levelStartIconFriend');
                    set = game.add.image(-0.5, 0, avatar);
                    set.anchor.setTo(0.4, 0.9);
                    set.scale.set(0.87);

                    this.addChild(set);
                }, iconFriend);
                loader.start();

                friendScroll.add(iconFriend);

                friendNameScore = game.add.text(-5, -46 + friendPositionY, usr.first_name + '\n' + friendsInLevel[key].score, { 'font': 'bold 12px MainFont', fill: '#7129a7', align: 'left'});
                friendNameScore.anchor.setTo(0, 0);
                friendScroll.add(friendNameScore);

                friendPositionY += OffsetPositionY;
                if (key == 4) {
                    break;
                }
            }
        }
        windowLevelFinish.addChild(friendScroll);
    },

    incompleteLevelWindow: function () {
        if (popup.level_incomplete == null) {
            fade = game.add.graphics(0, 0);
            fade.beginFill(0x000000, 1);
            fade.drawRect(0, 0, game.width, game.height);
            fade.alpha = 0;
            this.add.tween(fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            popup.level_incomplete = game.add.image(game.width / 2, game.height / 2, "windowLevelComplete");

            popup.level_incomplete.alpha = 0.8;
            popup.level_incomplete.anchor.set(0.5);
            popup.level_incomplete.inputEnabled = true;
            popup.level_incomplete.scale.set(0.9);
            popup.level_incomplete.windowType = 'level_incomplete';
            popup.level_incomplete.closed = false;
            popup.level_incomplete._this = this;

            windowTween = game.add.tween(popup.level_incomplete).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(popup.level_incomplete.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);

            closeButton = game.make.button(35, -215, 'buttonClose', null, popup.level_incomplete, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(this.goToLevelMap, popup.level_incomplete);
            popup.level_incomplete.addChild(closeButton);

            art = game.add.image(-95, -30, "levelIncompleteArt");
            art.alpha = 1;
            art.anchor.setTo(0.5);
            popup.level_incomplete.addChild(art);

            levelTitle = game.add.text(-95, -140, 'Уровень ' + levelID, { 'font': 'bold 45px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 5});
            levelTitle.anchor.setTo(0.5, 1);
            popup.level_incomplete.addChild(levelTitle);

            retryButton = game.make.button(-95, 130, 'levelIncompleteRetryButton', null, this, 0, 1, 2);
            retryButton.anchor.setTo(0.5, 1);
            retryButton.inputEnabled = true;
            retryButton.clicked = false;
            retryButton.level_id = levelID;
            retryButton.input.priorityID = 1;
            retryButton.input.useHandCursor = true;
            retryButton.events.onInputUp.add(function () {
                var blackFade = game.add.image(0, 0, "blackfade");
                blackFade.alpha = 0;
                var fadeTween = game.add.tween(blackFade);
                fadeTween.to({
                    alpha: 1
                }, 1000, Phaser.Easing.Cubic.Out, true);
                fadeTween.onComplete.add(function () {
                    if (game.global.lives > 0) {
                        game.levelStart = levelID;
                        game.currentLevel = levelID;
                        game.global.lives--;
                        popup.level_incomplete = null;
                        this.game.state.clearCurrentState();
                        this.game.state.start("TheGame", true, false, levelGoals);
                    } else {
                        openWindow = 'lives';
                        this.goToLevelMap();
                    }
                }, this);
            }, this);

            retryText = game.add.text(0, -7, 'Переиграть', { 'font': 'bold 17px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            retryText.anchor.setTo(0.5, 1);
            retryButton.addChild(retryText);
            popup.level_incomplete.addChild(retryButton);

            moreMovesButton = game.make.button(-95, 185, 'levelIncompleteMoreMovesButton', null, this, 0, 1, 2);
            moreMovesButton.anchor.setTo(0.5, 1);
            moreMovesButton.inputEnabled = true;
            moreMovesButton.clicked = false;
            moreMovesButton.level_id = levelID;
            moreMovesButton.input.priorityID = 1;
            moreMovesButton.input.useHandCursor = true;
            moreMovesButton.events.onInputUp.add(this.increaseMove, this);

            moreMovesText = game.add.text(-5, -10, '+3 хода за 7', { 'font': 'bold 20px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 4});
            moreMovesText.anchor.setTo(0.5, 1);
            moreMovesButton.addChild(moreMovesText);

            popup.level_incomplete.addChild(moreMovesButton);

            var friendScroll = game.add.group();
            friendScroll.draggable = true;
            friendScroll.x = 150;
            friendScroll.y = -60;

            titleHignScore = game.add.text(-15, -55, 'Рекорд', { 'font': 'bold 20px MainFont', fill: '#7129a7'});
            titleHignScore.anchor.setTo(0.5, 1);
            friendScroll.add(titleHignScore);
//
            var friendPositionY = 0;
            var OffsetPositionY = 50;

            game.getServer({social_id: game.global.social_id, level_id: levelID, friends: game.global.friendsAppList, method: 'getFriendScore'}, function (data) {
                friendsInLevel = data.result;
            });

            if (friendsInLevel instanceof Array) {
                friendsInLevel.sort(game.dynamicSort("-score"));

                for (key in friendsInLevel) {

                    if (friendsInLevel[key].social_id == game.global.social_id) {
                        placeFriend = game.add.image(0, 0 + friendPositionY, "levelStartPlaceFriend");
                        placeFriend.anchor.setTo(0.5, 1);
                        friendScroll.add(placeFriend);
                    }
//
                    number = parseInt(key) + 1;
                    positionNumber = game.add.text(-65, -33 + friendPositionY, number, { 'font': 'bold 12px MainFont', fill: '#7129a7', align: 'left'});
                    positionNumber.anchor.setTo(0, 0);
                    friendScroll.add(positionNumber);

                    iconFriend = game.add.image(-30, -4 + friendPositionY, "levelStartIconFriend");
                    iconFriend.anchor.setTo(0.5, 1);

                    usr = game.objectFindByKey(game.global.friendsApp, 'uid', friendsInLevel[key].social_id);

                    loader = new Phaser.Loader(game);
                    iconFriend.avatarImg = 'avatar_' + friendsInLevel[key].social_id;
                    loader.image(iconFriend.avatarImg, usr.photo_50);
                    loader.onLoadComplete.add(function () {
                        avatar = game.make.bitmapData(50, 50);
                        avatar.alphaMask(this.avatarImg, 'levelStartIconFriend');
                        set = game.add.image(-0.5, 0, avatar);
                        set.anchor.setTo(0.4, 0.9);
                        set.scale.set(0.87);

                        this.addChild(set);
                    }, iconFriend);
                    loader.start();

                    friendScroll.add(iconFriend);

                    friendNameScore = game.add.text(-5, -42 + friendPositionY, usr.first_name + '\n' + friendsInLevel[key].score, { 'font': 'bold 12px MainFont', fill: '#7129a7', align: 'left'});
                    friendNameScore.anchor.setTo(0, 0);
                    friendScroll.add(friendNameScore);

                    friendPositionY += OffsetPositionY;
                    if (key == 4) {
                        break;
                    }
                }
            }

            var coinsPanel = game.add.button(-425, -315, "coinsPanel", this.openPurchase, this);
            coinsPanel.input.useHandCursor = true;
            var coins = game.add.image(7, 2, "coins");
            coinsPanel.addChild(coins);
            game.coinsCount = game.add.text(70, 32, ' ' + game.global.gold.toString() + ' ', { 'font': 'bold 16px MainFont', fill: '#7129a7', align: "right"});
            game.coinsCount.anchor.setTo(0.5, 1);
            coinsPanel.addChild(game.coinsCount);
            var coinsPlus = game.add.image(87, 3, "buttonPlus");
            coinsPanel.addChild(coinsPlus);

            popup.level_incomplete.addChild(coinsPanel);
            popup.level_incomplete.closed = true;

            popup.level_incomplete.addChild(friendScroll);
        }
    },

    increaseMove: function(){
        result = false;
        if (popup.level_incomplete.scale.x === 1 && popup.level_incomplete.closed == true) {
            if (game.global.gold >= 7) {
                game.getServer({social_id: game.global.social_id, method: 'inAppPurchase', type: 'move', coins: 7, level_id: levelID}, function (data) {
                    result = data.result;
                });
                if (result == 'ok') {
                    game.global.gold -= 7;
                    game.coinsCount.text = ' ' + game.global.gold + ' ';
                    levelMoves = 3;
                    levelMovesText.text = ("00" + levelMoves).slice(-2);

                    game.add.tween(fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
                    tween = game.add.tween(popup.level_incomplete).to({ alpha: 0 }, 200, Phaser.Easing.Cubic.In, true);
                    tween.onComplete.add(function (current) {
                        popup.level_incomplete.destroy();
                        popup.level_incomplete = null;
                        game.input.onDown.add(this.pickTile, this);
                    }, this);
                }
            } else {
                game.openPurchase();
            }
        }
    },

    closeWindow: function(){
        if (this.scale.x === 1 && this.closed == true ) {
            game.add.tween(fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
            tween = game.add.tween(this).to({ alpha:0 }, 100, Phaser.Easing.Cubic.In, true);
            game.add.tween(this.scale).to({ x: 0.8, y: 0.8 }, 100, Phaser.Easing.Cubic.In, true);
            switch (this.windowType) {
                case 'level_quit':
                    popup.level_quit = null;
                    game.input.onDown.add(this._this.pickTile, this._this);
                    break;
                case 'levelIncomplete':
                    popup.levelIncomplete = null;
                    game.input.onDown.add(this._this.pickTile, this._this);
                    break;
            }

            tween.onComplete.add(function(current){
                current.destroy();
            },this);
        }
    }
}