var mapLoadCount = 0;
var mapCount = 4;
var map;
var mapHeight = 730;
var clouds;
var startX;
var startY;
var moveIndexMap;
var moveIndexScroll;
var scrollStep = 200;
var mapSpeed = 1;
var mapGroup;
var levelGroup;
var topPanelGroup;
var candidateTown;
var levelActive;
var levelGoals;
var friendsLevel = [];
var friendsInLevel = [];
var iconMe = null;
var userXP = 0;
var dragMapCheck = false;

var soundPanel = null;
var redLineMusic = null;
var redLineSound = null;

var expCount;
var heartRefill;

var levelArr = [];
var currentLevelButton = null;
var currentLevelPosY = 0;
var openWindow;
var currentViral = {
    viral_id:0,
    friend_1:null,
    friend_2:null,
    friend_3:null,
    open_level:null,
    coins:null,
    xp:null,
    window: null,
    coinsPanel: null,
    key: null
};

levelMap = {
    init: function () {

        if (game.global.lives < game.global.max_lives) {
            game.timer = this.game.time.create(this.game);
            game.timer.loop(Phaser.Timer.SECOND, function () {
                game.global.sessionTime++;
                game.global.time_to_refill++;
            }, this);
            game.timer.start();
        }

        if (game.currentLevel != null && game.global.level_current < game.currentLevel) {
            game.global.level_current = parseInt(game.currentLevel);
        }

        if (game.global.friendBeatenArr.beaten !== null) {
            game.timer = this.game.time.create(this.game);
            game.timer.add(1500, function () {
                if (game.levelStart !== null && game.levelStart !== undefined) {
                    game.currentLevel = game.levelStart;
                }
                this.openFriendBeaten();
            }, this);
            game.timer.start();
        } else if (game.levelStart !== null && game.levelStart !== undefined) {
            game.currentLevel = game.levelStart;
            game.timer = this.game.time.create(this.game);
            game.timer.add(1500, function () {
                viralLevel = game.objectFindByKey(game.global.viral_blocks, 'before_level_id', game.global.level_current);
                if (viralLevel == null || viralLevel.status != 0) {
                    var level = game.objectFindByKey(game.global.mapLevelArr, 'level_id', game.levelStart);
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
            }, this);
            game.timer.start();
        }

        if (game.levelComplete !== null) {
            level = game.objectFindByKey(game.global.mapLevelArr, 'level_id', game.levelComplete);
            if (level.score < game.levelCompleteScore) {
                level.score = game.levelCompleteScore;
            }
            game.levelComplete = null;
            game.levelCompleteScore = 0;
        }

        if (openWindow == 'lives') {
            game.timer = this.game.time.create(this.game);
            game.timer.add(1500, function () {
                this.openGetLives();
                openWindow = null;
            }, this);
            game.timer.start();
        }

        for (key in game.global.mapLevelArr) {

            if (game.global.mapLevelArr[key].score >= game.global.mapLevelArr[key].star_1) {
                userXP++;
            }
            if (game.global.mapLevelArr[key].score >= game.global.mapLevelArr[key].star_2) {
                userXP++;
            }
            if (game.global.mapLevelArr[key].score >= game.global.mapLevelArr[key].star_3) {
                userXP++;
            }
        }
        game.log();
    },

    preload: function () {
        game.stage.disableVisibilityChange = true;
        game.getServer({social_id: game.global.social_id, friends: game.global.friendsAppList, method: 'getDataFriends'}, function (data) {
            friendsLevel = data.result;
        });

        if (game.musicMenu === null) {
            game.musicMenu = game.add.audio("musicMenu", 1);
            game.musicMenu.volume = 1;
            game.musicMenu.loop = true;
            game.musicMenu.play();
        }

        if (game.musicGameplay === null) {
            game.musicGameplay = game.add.audio("musicGameplay", 1);
            game.musicGameplay.volume = 1;
            game.musicGameplay.loop = true;
            game.musicGameplay.play();
        }
    },

    create: function () {
        if (game.comicsCheck == true || game.global.level_current !== 1) {
            if (game.global.playMusic) {
                game.musicGameplay.stop();
                game.musicMenu.play();
            } else {
                game.musicMenu.stop();
                game.musicGameplay.stop();
            }

            mapGroup = game.add.group();
            levelGroup = game.add.group();
            levelGroup.addChild(mapGroup);

            topPanelGroup = game.add.group();

            var topLine = game.add.image(0, 0, "topLine");
            var heartPanel = game.add.button(5, 5, "heartPanel", this.openGetLives, this);
            heartPanel.input.useHandCursor = true;
            var heart = game.add.image(12, 9, "heart");

            game.global.livesText = game.add.text(26, 33, game.global.lives, { font: 'bold 14px MainFont', fill: '#ffffff' });
            game.global.livesText.anchor.setTo(0.5, 1);
            heartRefill = game.add.text(57, 34, game.global.refill, { 'font': 'bold 14px MainFont', fill: '#7129a7', align: "right"});
            heartRefill.scale.x = 0.9;
            heartRefill.align = 'right';
            heartRefill.anchor.setTo(0.5, 1);
            if (game.global.lives < game.global.max_lives) {
                game.time.events.loop(Phaser.Timer.SECOND, function () {
                    game.countRefill();
                    if (game.global.lives >= game.global.max_lives) {
                        heartRefill.text = 'все';
                    } else {
                        heartRefill.text = game.global.refill;
                    }
                    game.global.livesText.text = game.global.lives;
                }, this);
            } else {
                heartRefill.text = 'все';
            }

            var heatPlus = game.add.image(75, 8, "buttonPlus");
            var coinsPanel = game.add.button(110, 5, "coinsPanel", game.openPurchase, this);
            coinsPanel.input.useHandCursor = true;
            var coins = game.add.image(117, 7, "coins");
            game.coinsCount = game.add.text(177, 35, ' ' + game.global.gold.toString() + ' ', { 'font': 'bold 16px MainFont', fill: '#7129a7', align: "right"});
            game.coinsCount.anchor.setTo(0.5, 1);
            var coinsPlus = game.add.image(197, 8, "buttonPlus");

            var expButton = game.add.button(game.width / 2, 2, "buttonExpirience", null, this, 0, 1, 2);
            expCount = game.add.text(40, 5, userXP, { 'font': 'bold 10pt MainFont', fill: '#7129a7', stroke: '#fff', strokeThickness: 3});
            expButton.addChild(expCount);
            expButton.hint = false;
            expButton.hintImg = null;
            expButton.inputEnabled = true;
            expButton.input.priorityID = 1;
            expButton.input.useHandCursor = true;

            expButton.events.onInputOver.add(function (current) {
                if (current.hintImg === null) {
                    hint = game.add.image(game.width / 2 - 80, 40, "hintExpirience");
                    hintText = game.add.text(9, 45, 'Проходите уровни повторно. Зарабатывайте опыт', { 'font': 'bold 10px MainFont', fill: '#7129a7', align: 'center', wordWrap: true, wordWrapWidth: 110 });
                    hintText.lineSpacing = -10.2;
                    hint.addChild(hintText);
                    current.hintImg = hint;
                } else {
                    current.hintImg.alpha = 1;
                }
                current.hint = true;
            }, this);
            expButton.events.onInputOut.add(function (current) {
                current.hintImg.alpha = 0;
                current.hint = false;
            }, this);


            var friendsButton = game.add.button(730, 2, "buttonFriends", game.showInviteBox, this);
            friendsButton.input.useHandCursor = true;
            var heartButton = game.add.button(774, 2, "buttonHearts", this.openLivesSend, this);
            heartButton.input.useHandCursor = true;


            var settingsButton = game.add.button(818, 2, "buttonSettings", function () {
                if (!game.global.playMusic) {
                    redLineMusic.alpha = 1;
                }
                if (!game.global.playSounds) {
                    redLineSound.alpha = 1;
                }
                if (!soundPanel.alpha) {
                    soundPanel.y = 2;
                    soundPanel.alpha = 1;
                } else {
                    soundPanel.y = -300;
                    soundPanel.alpha = 0;
                }
            }, this);
            settingsButton.input.useHandCursor = true;

            soundPanel = game.add.image(821, -300, "soundsPanel");
            soundPanel.alpha = 0;

            soundPanelMusicButton = game.add.button(7, 75, "musicIcon", this.toggleMusic, this);
            soundPanelMusicButton.input.useHandCursor = true;
            redLineMusic = game.add.image(-2, -2, "redline");
            redLineMusic.alpha = 0;
            soundPanelMusicButton.addChild(redLineMusic);
            soundPanel.addChild(soundPanelMusicButton);

            soundPanelSoundButton = game.add.button(7, 45, "soundIcon", this.toggleSound, this);
            soundPanelSoundButton.input.useHandCursor = true;
            redLineSound = game.add.image(-2, -2, "redline");
            redLineSound.alpha = 0;
            soundPanelSoundButton.addChild(redLineSound);
            soundPanel.addChild(soundPanelSoundButton);

            topPanelGroup.add(topLine);
            topPanelGroup.add(heartPanel);
            topPanelGroup.add(heart);
            topPanelGroup.add(game.global.livesText);
            topPanelGroup.add(heatPlus);
            topPanelGroup.add(coinsPanel);
            topPanelGroup.add(coins);
            topPanelGroup.add(coinsPlus);
            topPanelGroup.add(friendsButton);
            topPanelGroup.add(heartButton);
            topPanelGroup.add(soundPanel);
            topPanelGroup.add(settingsButton);

            levelArr.push([]);
            for (var key in game.global.mapLevelArr) {
                var levelData = game.global.mapLevelArr[key];

                if (levelData.level_id == game.global.level_current) {
                    viralLevel = game.objectFindByKey(game.global.viral_blocks, 'before_level_id', game.global.level_current);
                    if (viralLevel == null || viralLevel.status > 0) {
                        levelActive = game.add.sprite(levelData.pos_x - 2, -levelData.pos_y + 7, "buttonLevelActive");
                        levelActive.anchor.setTo(0.5);
                        var level = game.add.button(levelData.pos_x, -levelData.pos_y, "buttonLevel");
                        level.alpha = 0;
                        level.frame = 1;
                        level.anchor.setTo(0.5);
                        level.star_1 = levelData.star_1;
                        level.star_2 = levelData.star_2;
                        level.star_3 = levelData.star_3;
                        level.score = levelData.score;
                        level.bg_id = levelData.bg_id;
                        level.goals = levelData.goals;
                        level.level_id = levelData.level_id;
                        level.input.useHandCursor = true;
                        level.events.onInputUp.add(this.levelStart, this);
                        if (game.currentLevel == null || game.currentLevel == game.global.level_current) {
                            currentLevelPosY = levelData.pos_y;
                        }

                        iconMe = game.add.image(levelData.pos_x - 3, -levelData.pos_y - 28, "levelStartIconFriend");
                        iconMe.anchor.setTo(0.5, 1);

                        loader = new Phaser.Loader(game);
                        iconMe.avatarImg = 'avatar_' + game.global.social_id;
                        loader.image(iconMe.avatarImg, game.global.photo);
                        loader.onLoadComplete.add(function () {
                            avatar = game.make.bitmapData(50, 50);
                            avatar.alphaMask(this.avatarImg, 'levelStartIconFriend');
                            set = game.add.image(-0.5, 0, avatar);
                            set.anchor.setTo(0.4, 0.9);
                            set.scale.set(0.87);
                            this.addChild(set);
                        }, iconMe);
                        loader.start();
                        levelGroup.add(iconMe);

                        levelActive.animations.add('wave', [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 8, 7, 6, 5, 4, 3, 2, 1], 10, true, true);
                        levelActive.animations.play('wave');
                        levelGroup.add(levelActive);
                        currentLevelButton = level;
                        if (levelData.level_id <= 3) {
                            game.tutorialMapLevel = game.add.sprite(levelData.pos_x - 30, -levelData.pos_y + 30, "tutorialArrow");
                            game.tutorialMapLevel.scale.setTo(-0.7, 0.7);
                            game.add.tween(game.tutorialMapLevel).to({x: levelData.pos_x - 20, y: -levelData.pos_y + 20}, 300, Phaser.Easing.Quadratic.InOut, true, 0, null, true);
                            levelGroup.add(game.tutorialMapLevel);
                        }
                    } else {
                        var level = game.add.button(levelData.pos_x, -levelData.pos_y, "buttonLevel", null, this);
                        level.anchor.setTo(0.5);
                        level.star_1 = levelData.star_1;
                        level.star_2 = levelData.star_2;
                        level.star_3 = levelData.star_3;
                        level.score = levelData.score;
                        level.bg_id = levelData.bg_id;
                        level.goals = levelData.goals;
                        level.level_id = levelData.level_id;
                        level.frame = 0;
                        currentLevelPosY = viralLevel.pos_y;
                        currentLevelButton = level;
                    }
                } else if (levelData.level_id > game.global.level_current) {
                    var level = game.add.button(levelData.pos_x, -levelData.pos_y, "buttonLevel", null, this);
                    level.anchor.setTo(0.5);
                    level.star_1 = levelData.star_1;
                    level.star_2 = levelData.star_2;
                    level.star_3 = levelData.star_3;
                    level.score = levelData.score;
                    level.bg_id = levelData.bg_id;
                    level.goals = levelData.goals;
                    level.level_id = levelData.level_id;

                    level.frame = 0;
                } else if (levelData.level_id < game.global.level_current) {
                    var level = game.add.button(levelData.pos_x, -levelData.pos_y, "buttonLevel", null, this);
                    level.anchor.setTo(0.5);
                    level.star_1 = levelData.star_1;
                    level.star_2 = levelData.star_2;
                    level.star_3 = levelData.star_3;
                    level.score = levelData.score;
                    level.bg_id = levelData.bg_id;
                    level.goals = levelData.goals;
                    level.level_id = levelData.level_id;
                    level.frame = 1;
                    level.input.useHandCursor = true;
                    level.events.onInputUp.add(this.levelStart, this);

                    if (game.currentLevel !== null && game.currentLevel == levelData.level_id) {
                        currentLevelPosY = levelData.pos_y;
                    }
                    if (levelData.star_1 <= levelData.score) {
                        buttonLevelStar1 = game.add.image(-25, -35, "buttonLevelStar");
                        buttonLevelStar1.anchor.setTo(0.5, 0.5);
                    } else {
                        buttonLevelStar1 = game.add.image(-25, -35, "buttonLevelStarDark");
                        buttonLevelStar1.anchor.setTo(0.5, 0.5);
                    }

                    if (levelData.star_2 <= levelData.score) {
                        buttonLevelStar2 = game.add.image(-2, -42, "buttonLevelStar");
                        buttonLevelStar2.anchor.setTo(0.5, 0.5);
                    } else {
                        buttonLevelStar2 = game.add.image(-2, -42, "buttonLevelStarDark");
                        buttonLevelStar2.anchor.setTo(0.5, 0.5);
                    }

                    if (levelData.star_3 <= levelData.score) {
                        buttonLevelStar3 = game.add.image(21, -35, "buttonLevelStar");
                        buttonLevelStar3.anchor.setTo(0.5, 0.5);
                    } else {
                        buttonLevelStar3 = game.add.image(21, -35, "buttonLevelStarDark");
                        buttonLevelStar3.anchor.setTo(0.5, 0.5);
                    }
                    level.addChild(buttonLevelStar1);
                    level.addChild(buttonLevelStar2);
                    level.addChild(buttonLevelStar3);
                }

                var levelText = game.add.text(levelData.pos_x - 3, -levelData.pos_y - 3, levelData.map_level_id, { 'font': '18px Arial', fill: '#fff', 'width': 100 });
                levelText.anchor.setTo(0.5, 0.4);

                level.clicked = false;
                levelArr.push(level);
                levelGroup.add(level);
                levelGroup.add(levelText);
            }

            for (key in game.global.viral_blocks) {

                if (game.global.viral_blocks[key].before_level_id == game.global.level_current && game.global.viral_blocks[key].status == 0) {
                    viralWindowKey = game.add.image(game.global.viral_blocks[key].pos_x + 105, -(game.global.viral_blocks[key].pos_y + 55), "viralWindowKey");
                    viralWindowKey.anchor.setTo(0.5, 1);

                    viralCoinsButton = game.make.button(0, -7, "viralWindowBlueButton", 0, 1, 2, null, this);
                    viralCoinsButton.anchor.setTo(0.5, 1);
                    viralCoinsButton.inputEnabled = true;
                    viralCoinsButton.input.priorityID = 1;
                    viralCoinsButton.input.useHandCursor = true;
                    viralCoinsButton.events.onInputUp.add(function () {
                        this.openViral('coins');
                    }, this);

                    viralCoinsButtonText = game.add.text(-6, 2, game.global.viral_blocks[key].coins, { 'font': '11px MainFont', fill: '#fff', align: 'center', stroke: '#7129a7', strokeThickness: 2});
                    viralCoinsButtonText.anchor.setTo(0.5, 1);
                    viralCoinsButton.addChild(viralCoinsButtonText);
                    viralWindowKey.addChild(viralCoinsButton);
                    currentViral.coinsPanel = viralWindowKey;
                    levelGroup.add(viralWindowKey);

                    viralKey = game.add.image(game.global.viral_blocks[key].pos_x + 106.5, -(game.global.viral_blocks[key].pos_y + 88), "viralKey");
                    viralKey.anchor.setTo(0.5, 1);
                    currentViral.key = viralKey;
                    levelGroup.add(viralKey);
                }
                if (game.global.viral_blocks[key].status == 0) {
                    currentViral.viral_id = game.global.viral_blocks[key].viral_id;
                    currentViral.open_level = game.global.viral_blocks[key].before_level_id;
                    currentViral.coins = game.global.viral_blocks[key].coins;
                    currentViral.xp = game.global.viral_blocks[key].xp;
                    expCount.text = userXP + '/' + game.global.viral_blocks[key].xp;
                }
                viralWindow = game.add.image(game.global.viral_blocks[key].pos_x, -game.global.viral_blocks[key].pos_y, "viralWindow");
                viralWindow.anchor.setTo(0.5, 1);

                if (game.global.viral_blocks[key].before_level_id <= game.global.level_current) {
                    if (game.global.viral_blocks[key].friend_1 == null && game.global.viral_blocks[key].status != 0) {
                        friend_1 = game.add.image(-84, -135, "viralWindowIconFriend");
                        set = game.add.image(3, 3, 'viralWindowAvatar_1');
                        set.scale.set(0.82);
                        friend_1.addChild(set);
                        viralWindow.addChild(friend_1);
                        currentViral.friend_1 = parseInt(0);
                    } else if (game.global.viral_blocks[key].friend_1 == null && game.global.viral_blocks[key].status == 0) {
                        friend_1 = game.make.button(-84, -135, "viralWindowButtonAskFriend", 0, 1, 2, null, this);
                        friend_1.avatarImg = null;
                        friend_1.inputEnabled = true;
                        friend_1.input.priorityID = 1;
                        friend_1.input.useHandCursor = true;
                        friend_1.events.onInputUp.add(this.openKeyAsk, this);
                        viralWindow.addChild(friend_1);
                        currentViral.friend_1 = friend_1;
                    } else if (game.global.viral_blocks[key].friend_1 != null) {
                        friend_1 = game.add.image(-84, -135, "viralWindowIconFriend");

                        usr = game.objectFindByKey(game.global.friendsApp, 'uid', game.global.viral_blocks[key].friend_1);

                        if (usr !== null) {
                            loader = new Phaser.Loader(game);
                            friend_1.avatarImg = 'avatar_' + game.global.viral_blocks[key].friend_1;
                            loader.image(friend_1.avatarImg, usr.photo_50);
                            loader.onLoadComplete.add(function () {
                                avatar = game.make.bitmapData(50, 50);
                                avatar.alphaMask(this.avatarImg, 'viralWindowIconFriend');
                                set = game.add.image(3, 3, avatar);
                                set.anchor.setTo(0, 0);
                                set.scale.set(0.89);
                                this.addChild(set);
                            }, friend_1);
                            loader.start();
                        }
                        viralWindow.addChild(friend_1);
                        currentViral.friend_1 = parseInt(game.global.viral_blocks[key].friend_1);
                    }

                    if (game.global.viral_blocks[key].friend_2 == null && game.global.viral_blocks[key].status != 0) {
                        friend_2 = game.add.image(-34, -135, "viralWindowIconFriend");
                        set = game.add.image(3, 3, 'viralWindowAvatar_2');
                        set.scale.set(0.82);
                        friend_2.addChild(set);
                        viralWindow.addChild(friend_2);
                        currentViral.friend_2 = parseInt(0);
                    } else if (game.global.viral_blocks[key].friend_2 == null && game.global.viral_blocks[key].status == 0) {
                        friend_2 = game.make.button(-34, -135, "viralWindowButtonAskFriend", 0, 1, 2, null, this);
                        friend_2.avatarImg = null;
                        friend_2.inputEnabled = true;
                        friend_2.input.priorityID = 1;
                        friend_2.input.useHandCursor = true;
                        friend_2.events.onInputUp.add(this.openKeyAsk, this);
                        viralWindow.addChild(friend_2);
                        currentViral.friend_2 = friend_2;
                    } else if (game.global.viral_blocks[key].friend_2 != null) {
                        friend_2 = game.add.image(-34, -135, "viralWindowIconFriend");

                        usr = game.objectFindByKey(game.global.friendsApp, 'uid', game.global.viral_blocks[key].friend_2);

                        if (usr !== null) {
                            loader = new Phaser.Loader(game);
                            friend_2.avatarImg = 'avatar_' + game.global.viral_blocks[key].friend_2;
                            loader.image(friend_2.avatarImg, usr.photo_50);
                            loader.onLoadComplete.add(function () {
                                avatar = game.make.bitmapData(50, 50);
                                avatar.alphaMask(this.avatarImg, 'viralWindowIconFriend');
                                set = game.add.image(3, 3, avatar);
                                set.anchor.setTo(0, 0);
                                set.scale.set(0.89);

                                this.addChild(set);
                            }, friend_2);
                            loader.start();
                        }

                        viralWindow.addChild(friend_2);
                        currentViral.friend_2 = parseInt(game.global.viral_blocks[key].friend_2);
                    }

                    if (game.global.viral_blocks[key].friend_3 == null && game.global.viral_blocks[key].status != 0) {
                        friend_3 = game.add.image(16, -135, "viralWindowIconFriend");
                        set = game.add.image(3, 3, 'viralWindowAvatar_3');
                        set.scale.set(0.82);
                        friend_3.addChild(set);

                        viralWindow.addChild(friend_3);
                        currentViral.friend_3 = parseInt(0);
                    } else if (game.global.viral_blocks[key].friend_3 == null && game.global.viral_blocks[key].status == 0) {
                        friend_3 = game.make.button(16, -135, "viralWindowButtonAskFriend", 0, 1, 2, null, this);
                        friend_3.avatarImg = null;
                        friend_3.inputEnabled = true;
                        friend_3.input.priorityID = 1;
                        friend_3.input.useHandCursor = true;
                        friend_3.events.onInputUp.add(this.openKeyAsk, this);
                        viralWindow.addChild(friend_3);
                        currentViral.friend_3 = friend_3;
                    } else if (game.global.viral_blocks[key].friend_3 != null) {
                        friend_3 = game.add.image(16, -135, "viralWindowIconFriend");

                        usr = game.objectFindByKey(game.global.friendsApp, 'uid', game.global.viral_blocks[key].friend_3);

                        if (usr !== null) {
                            loader = new Phaser.Loader(game);
                            friend_3.avatarImg = 'avatar_' + game.global.viral_blocks[key].friend_3;
                            loader.image(friend_3.avatarImg, usr.photo_50);
                            loader.onLoadComplete.add(function () {
                                avatar = game.make.bitmapData(50, 50);
                                avatar.alphaMask(this.avatarImg, 'viralWindowIconFriend');
                                set = game.add.image(3, 3, avatar);
                                set.anchor.setTo(0, 0);
                                set.scale.set(0.89);

                                this.addChild(set);
                            }, friend_3);
                            loader.start();
                        }
                        viralWindow.addChild(friend_3);
                        currentViral.friend_3 = parseInt(game.global.viral_blocks[key].friend_3);
                    }
                }

                if (game.global.viral_blocks[key].before_level_id == game.global.level_current && game.global.viral_blocks[key].status == 0) {
                    viralTitle = game.add.text(-12, -135, 'Попроси у друзей помощь', { 'font': 'bold 11px MainFont', fill: '#3e6fbd', align: 'center', stroke: '#fff', strokeThickness: 2});
                    viralTitle.anchor.setTo(0.5, 1);
                    viralWindow.addChild(viralTitle);

                    viralStarText = game.add.text(-12, -50, 'или ' + game.global.viral_blocks[key].xp, { 'font': 'bold 12pt MainFont', fill: '#3e6fbd', align: 'center', stroke: '#fff', strokeThickness: 2});
                    viralStarText.anchor.setTo(0.5, 1);
                    viralStar = game.add.image(35, -30, "viralWindowStar");
                    viralStarText.addChild(viralStar);

                    viralWindow.addChild(viralStarText);

                       currentViral.window = viralWindow;
                }
                levelGroup.add(viralWindow);
            }

            mapGroup.x = 0;
            levelGroup.x = 0;
            levelGroup.y = currentLevelPosY + (game.height / 2);

            if (levelGroup.y < game.height) {
                levelGroup.y = game.height;
            }

            if (game.mapLoadMust == 0) {
                game.mapLoadMust = Math.ceil((currentLevelPosY + game.height / 2) / mapHeight) + 1;
            }

            clouds = game.add.image(0, -game.mapLoadMust * mapHeight - 50, "clouds");
            clouds.alpha = 0.8;
            levelGroup.add(clouds);

//        game.input.mouse.mouseWheelCallback = mouseWheel;
//        function mouseWheel() {
//            var scrollTo = game.input.mouse.wheelDelta;
//            startY = game.input.worldY + (scrollStep * scrollTo);
//            mapGroup.saveY = mapGroup.y;
//            var currentY = game.input.worldY;
//            var deltaY = startY - currentY;
//            if(deltaY * deltaY > 25){
//                candidateTown = null;
//            }
//
//            var setY = mapGroup.saveY + deltaY;
//            if(setY < - map.height + game.height){
//                setY = - map.height + game.height;
//            }
//            if(setY > 0){
//                setY = 0;
//            }
//            var tween = game.add.tween(mapGroup).to({y: setY}, 500, Phaser.Easing.Quadratic.InOut, true);
//            tween.onComplete.add(setMap, this);
//            function setMap()
//            {
//                mapGroup.y = setY;
//            }
//        }

            if (mapLoadCount < game.mapLoadMust) {
                this.uploadMap();
            }

        }

        var blackFade = game.add.image(0, 0, "blackfade");

        if (game.comicsCheck == false && game.global.level_current == 1) {
            this.comicsPlay();
        } else if (game.tutorialCheck == false && game.global.level_current == 1) {
            this.firstPlay();
        } else {
            var fadeTween = game.add.tween(blackFade);
            fadeTween.to({
                alpha: 0
            }, 250, Phaser.Easing.Linear.Out, true)
                .onComplete.add(function () {
                    if (game.global.gifts.length > 0) {
                        this.openMessage();
                    }

                    viralLevel = game.objectFindByKey(game.global.viral_blocks, 'before_level_id', game.global.level_current);
                    if (viralLevel != null && viralLevel.xp <= userXP) {
                        this.openViral('xp');
                    }
                    this.showFriendinLevel();
                    if (game.specialOfferSuccess === false && game.global.level_current >= 5) {
                        this.specialOffer();
                    }
                }, this);
        }
    },

    specialOffer: function() {
        game.specialOffer01 = game.add.button(game.width + 80, game.height / 3, "specialOfferIcon01");
        game.specialOffer01.anchor.setTo(0.5,0.5);
        game.specialOffer01.inputEnabled = true;
        game.specialOffer01.input.priorityID = 1;
        game.specialOffer01.input.useHandCursor = true;
        game.specialOffer01.events.onInputUp.add(this.openSpecialOffer, this);

        var tween = game.add.tween(game.specialOffer01);
        tween.to({
            x:game.width - 40
        }, 500, Phaser.Easing.Back.InOut, true)
            .onComplete.add(function () {
            }, this);
    },

    openSpecialOffer: function () {
        game.closeOtherWindow('special_offer');
        if (game.windows.special_offer === null) {
            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowSpecialOffer = game.add.image(game.width / 2, game.height / 2, "windowMessage");

            specialOfferTitle = game.add.text(0, -184, 'Бонусные монеты', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
            specialOfferTitle.anchor.setTo(0.5, 1);
            windowSpecialOffer.addChild(specialOfferTitle);

            specialOfferTitle = game.add.text(0, -160, 'Выполни все условия и получи 20 монет', { 'font': 'bold 16px MainFont', fill: '#3e6fbd', stroke: '#fff', strokeThickness: 5});
            specialOfferTitle.anchor.setTo(0.5, 1);
            windowSpecialOffer.addChild(specialOfferTitle);

            specialOfferArt = game.add.image(-250, -160, "specialOfferArt01");
            windowSpecialOffer.addChild(specialOfferArt);

            var closeW = (windowSpecialOffer.width / 2) - 65;
            var closeH = (windowSpecialOffer.height / 2) - 12;

            var closeButton = game.make.button(closeW, -closeH, 'buttonClose', null, windowSpecialOffer, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(game.closeWindow, windowSpecialOffer);
            windowSpecialOffer.addChild(closeButton);

            var shopItemGroup = game.add.group();

            var itemH = (windowSpecialOffer.height / 2) - 200;

            var specialOffer = [
                {text: 'Вступи в группу', button: true, type:'group', checkbox: null, success:false},
                {text: 'Добавь в левое меню', button: true, type:'menu', checkbox: null, success:false},
                {text: 'Пригласи 5 друзей', button: true, type:'friend', checkbox: null, success:false},
                {text: 'Расскажи об игре', button: false, type:'share', checked: null, success:false},
            ];

            for (key in specialOffer) {
                if (specialOffer[key].button === true) {
                    buttonPlace = game.add.button(50, -itemH, 'specialOfferButton', null, this, 0, 1, 2);
                    buttonPlace.anchor.setTo(0.5, 0.8);
                    buttonPlace.thisType = specialOffer[key].type;
                    buttonPlace.inputEnabled = true;
                    buttonPlace.input.priorityID = 1;
                    buttonPlace.input.useHandCursor = true;
                    buttonPlace.events.onInputUp.add(function(current){
                        switch (current.thisType) {
                            case 'group':
                                window.open('http://vk.com/club91204872');
                                break;
                            case 'menu':
                                VK.callMethod('showSettingsBox', 256);
                                break;
                            case 'friend':
                                game.showInviteBox();
                                break;
                        }

                    }, this);
                    shopItemGroup.add(buttonPlace);
                } else {
                    place = game.add.image(50, -itemH, 'specialOfferPlace');
                    place.anchor.setTo(0.5, 0.8);
                    shopItemGroup.add(place);
                }

                shopItemText = game.add.text(-50, -itemH+5, specialOffer[key].text, { 'font': 'bold 18px MainFont', fill: '#3e6fbd', 'width': 100 });
                shopItemText.anchor.setTo(0, 1);
                shopItemGroup.add(shopItemText);

                specialOffer[key].checkbox = game.add.button(200, -itemH-17, "okGreen", null, this);
                specialOffer[key].checkbox.frame = 0;
                specialOffer[key].checkbox.anchor.setTo(0.5);
                shopItemGroup.add(specialOffer[key].checkbox);

                switch (specialOffer[key].type) {
                    case 'group':
                        VK.api('groups.isMember', { group_id: 91204872, user_id: game.global.social_id}, function(data) {
                            if (data.response === 1) {
                                specialOffer[0].checkbox.frame = 1;
                                specialOffer[0].success = true;
                                game.specialOfferButton(windowSpecialOffer, specialOffer);
                            }
                        });
                        break;
                    case 'menu':
                        VK.api('getUserSettings', function(data){
                            if (data.response){
                                if (data.response >= 8454) {
                                    specialOffer[1].checkbox.frame = 1;
                                    specialOffer[1].success = true;
                                    game.specialOfferButton(windowSpecialOffer, specialOffer);
                                }
                            }
                        });
                        break;
                    case 'friend':
                        if (game.global.friendsAppList.length >= 5) {
                            specialOffer[2].checkbox.frame = 1;
                            specialOffer[2].success = true;
                            game.specialOfferButton(windowSpecialOffer, specialOffer);
                        }
                        break;
                    case 'share':
                        game.isShare();
                        if (vk_s === true) {
                            specialOffer[3].checkbox.frame = 1;
                            specialOffer[3].success = true;
                            game.specialOfferButton(windowSpecialOffer, specialOffer);
                        }
                        break;
                }

                itemH -= 55;
            }

            windowSpecialOffer.addChild(shopItemGroup);

            windowSpecialOffer.alpha = 0.8;
            windowSpecialOffer.anchor.set(0.5);
            windowSpecialOffer.inputEnabled = true;
            windowSpecialOffer.scale.set(0.9);
            windowSpecialOffer.windowType = 'special_offer';

            game.add.tween(windowSpecialOffer).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowSpecialOffer.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.special_offer = windowSpecialOffer;

        }
    },

    comicsPlay: function(){
        game.musicMenu.stop();
        game.musicGameplay.stop();

        game.input.onUp.add(this.firstPlay, this);

        var RectBG = game.add.graphics(0, 0 );
        RectBG.beginFill(0xffffff, 1);
        RectBG.drawRect(0, 0, game.width, game.height);
        RectBG.alpha = 0;
        var tween = game.add.tween(RectBG);
        tween.to({
            alpha: 1
        }, 500, Phaser.Easing.Linear.Out, true)
            .onComplete.add(function () {
            }, this);

        game.comicsCheck = true;
        var comicsColor = game.add.image(0, 0, "comicsColor");
        comicsColor.alpha = 0;

        var comics1 = game.add.image(11, 11, "comics1");
        comics1.alpha = 0;
        var tween = game.add.tween(comics1);
        tween.to({
            alpha: 1
        }, 1000, Phaser.Easing.Linear.Out, true, 500)
            .onComplete.add(function (current) {
                var tween = game.add.tween(current)
                    .to({
                        alpha: 0
                    }, 200, Phaser.Easing.Linear.Out, true, 500);
            }, this);

        var comics2 = game.add.image(game.width-11, 11, "comics2");
        comics2.anchor.setTo(1,0);
        comics2.alpha = 0;
        var tween = game.add.tween(comics2);
        tween.to({
            alpha: 1
        }, 1000, Phaser.Easing.Linear.Out, true, 500)
            .onComplete.add(function (current) {
                var tween = game.add.tween(current)
                    .to({
                        alpha: 0
                    }, 200, Phaser.Easing.Linear.Out, true, 2000);
            }, this);

        var comics3 = game.add.image(11, game.height-11, "comics3");
        comics3.anchor.setTo(0,1);
        comics3.alpha = 0;
        var tween = game.add.tween(comics3);
        tween.to({
            alpha: 1
        }, 1000, Phaser.Easing.Linear.Out, true, 500)
            .onComplete.add(function (current) {
                comicsColor.alpha = 1;
                var tween = game.add.tween(current)
                    .to({
                        alpha: 0
                    }, 200, Phaser.Easing.Linear.Out, true, 3500);
            }, this);

        var comics4 = game.add.image(game.width-11, game.height-11, "comics4");
        comics4.anchor.setTo(1,1);
        comics4.alpha = 0;

        var continueButton = game.add.button(735, 615, 'levelIncompleteMoreMovesButtonBlue', null, this, 0, 1, 2);
        continueButton.anchor.setTo(0.5, 1);
        continueButton.inputEnabled = true;
        continueButton.input.priorityID = 1;
        continueButton.input.useHandCursor = true;
        continueButton.events.onInputUp.add(this.firstPlay, this);
        var continueButtonText = game.add.text(0, -26, 'Пропустить', { 'font': '18px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 4});
        continueButtonText.anchor.setTo(0.5);
        continueButtonText.align = "center";
        continueButton.addChild(continueButtonText);

        var tween = game.add.tween(comics4);
        tween.to({
            alpha: 1
        }, 1000, Phaser.Easing.Linear.Out, true, 500)
            .onComplete.add(function (current) {
                comicsColor.alpha = 1;
                var tween = game.add.tween(current)
                    .to({
                        alpha: 0
                    }, 200, Phaser.Easing.Linear.Out, true, 5000);
                tween.onComplete.add(function(){
//                    game.timer = this.game.time.create(this.game);
//                    game.timer.add(15000,this.firstPlay, this);
//                    game.timer.start();

                    game.timer = this.game.time.create(this.game);
                    game.timer.add(1000,function(){
                        game.musicMenu.play();
                        continueButtonText.text = 'Продолжить';
                    }, this);
                    game.timer.start();
                }, this);
            }, this);
    },

    firstPlay: function(){
        game.tutorialCheck = true;
        level = game.objectFindByKey(game.global.mapLevelArr, 'level_id', 1);
        this.levelPlay({
            clicked: false,
            level_id: level.level_id,
            goals: level.goals,
            bg_id: level.bg_id
        });
    },

    showFriendinLevel: function () {
        for (key in friendsLevel) {
            if (friendsLevel[key].social_id !== parseInt(game.global.social_id)) {
                levelTemp = game.objectFindByKey(game.global.mapLevelArr, 'level_id', friendsLevel[key].active_level_id);

                usr = game.objectFindByKey(game.global.friendsApp, 'uid', friendsLevel[key].social_id);

                if (usr !== null) {
                    iconFriend = game.add.image(levelTemp.pos_x - 3, -levelTemp.pos_y + 65, "levelStartIconFriend");
                    iconFriend.anchor.setTo(0.5, 1);
                    loader = new Phaser.Loader(game);
                    iconFriend.avatarImg = 'avatar_' + friendsLevel[key].social_id;
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

                    levelGroup.add(iconFriend);
                }
            }
        }
    },

    mapDrag: function () {
        game.input.onDown.add(this.fingerOnMap, this);
    },

    fingerOnMap: function () {
        dragMapCheck = false;
        if (game.windows.special_offer === null && game.windows.purchase === null && game.windows.lives === null && game.windows.lives_send === null && game.windows.lives_ask === null && game.windows.level_start === null && game.windows.key_ask === null && game.windows.friend_beaten === null && game.windows.message === null) {
            console.log('posX: ' + (game.input.worldX - levelGroup.x) + '\nposY: ' + (levelGroup.y - game.input.worldY)); // position on the Map
            startY = game.input.worldY;
            levelGroup.saveY = levelGroup.y;
            // updating listeners
            game.input.onDown.remove(this.fingerOnMap, this);
            game.input.onUp.add(this.stopMap, this);
            moveIndexMap = game.input.addMoveCallback(this.dragMap, this);
        }
    },

    dragMap: function () {
        var currentY = game.input.worldY;
        var deltaY = startY - currentY;
        if (deltaY * deltaY > 25) {
            candidateTown = null;
        }

        if (deltaY > 10 || deltaY < -10) {
            dragMapCheck = true;
        }
//        mapGroup.y = mapGroup.saveY - deltaY * mapSpeed;
        levelGroup.y = levelGroup.saveY - deltaY * mapSpeed;

        if (levelGroup.y < game.height) {
//            mapGroup.y = game.height;
            levelGroup.y = game.height;
        }
        if (levelGroup.y > mapHeight * mapLoadCount) {
//            mapGroup.y = mapHeight * mapLoadCount;
            levelGroup.y = mapHeight * mapLoadCount;
            this.uploadMap();
        }
    },

    stopMap: function () {
        game.input.onDown.add(this.fingerOnMap, this);
        game.input.onUp.remove(this.stopMap, this);
        game.input.deleteMoveCallback(moveIndexMap);
    },

    uploadMap: function () {

        if (mapLoadCount < mapCount) {
            game.input.onDown.remove(this.fingerOnMap, this);
            game.input.onUp.remove(this.stopMap, this);
            game.input.deleteMoveCallback(moveIndexMap);
            loader = new Phaser.Loader(game);
            loader.image("map_" + (mapLoadCount + 1), "assets/sprites/map/" + (mapLoadCount + 1) + ".jpg");
            loader.onFileComplete.add(function (progress) {
                if (progress >= 100) {
                    map = game.add.image(0, -(mapHeight * (mapLoadCount + 1)), "map_" + (mapLoadCount + 1));
                    mapGroup.add(map);
                    mapLoadCount++;

                    if (mapLoadCount < game.mapLoadMust) {
                        this.uploadMap();
                    } else if (mapLoadCount >= game.mapLoadMust) {
                        game.mapLoadMust = mapLoadCount;
                        tween = game.add.tween(clouds).to({
                            alpha: 0
                        }, 500, Phaser.Easing.Linear.Out, true);
                        tween.onComplete.add(function (current) {
                            current.alpha = 0.8;
                            current.y = -(mapHeight * mapLoadCount) - 50;

                            game.input.onDown.add(this.fingerOnMap, this);
                        }, this);
                    }
                }
            }, this);
            loader.start();
        } else {
            game.input.onDown.add(this.fingerOnMap, this);
        }
    },

    fingerOnScroll: function () {
        if (game.windows.message !== null || game.windows.lives_send !== null || game.windows.lives_ask !== null) {
            startY = game.input.worldY;
            game.scrollButton.saveY = game.scrollButton.y;
            game.scrollGroup.saveY = game.scrollGroup.y;
            game.input.onDown.remove(this.fingerOnScroll, this);
            game.input.onUp.add(this.stopScroll, this);
            moveIndexScroll = game.input.addMoveCallback(this.dragScroll, this);
        }
    },

    dragScroll: function () {
        var currentY = game.input.worldY;
        var deltaY = startY - currentY;
        if (deltaY * deltaY > 25) {
            candidateTown = null;
        }

        game.scrollButton.y = game.scrollButton.saveY - deltaY * mapSpeed;

        if (game.scrollButton.y < -100) {
            game.scrollButton.y = -100;
        }
        if (game.scrollButton.y > 130) {
            game.scrollButton.y = 130;
        }

        count = 230 / game.scrollGroup.children.length;

        fff = (game.scrollGroup.height - 290) / 230;

        game.scrollGroup.y = 0 - (game.scrollButton.y + 100) * fff;

        if (game.scrollGroup.y < -game.scrollGroup.height + 290) {
            game.scrollGroup.y = -game.scrollGroup.height + 290;
        }
        if (game.scrollGroup.y > 0) {
            game.scrollGroup.y = 0;
        }
    },

    stopScroll: function () {
        game.input.onUp.remove(this.stopScroll, this);
        game.input.deleteMoveCallback(moveIndexScroll);
    },

    openFriendBeaten: function () {
        game.closeOtherWindow('friend_beaten');
        if (game.windows.friend_beaten === null) {

            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowFriendBeaten = game.add.image(game.width / 2, game.height / 2, "windowPurchase");
            windowFriendBeaten._this = this;

            title = game.add.text(0, -170, 'Вы обошли друга!', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
            title.anchor.setTo(0.5, 1);
            windowFriendBeaten.addChild(title);

            var closeW = (windowFriendBeaten.width / 2) - 65;
            var closeH = (windowFriendBeaten.height / 2) - 12;

            var closeButton = game.make.button(closeW, -closeH, 'buttonClose', null, windowFriendBeaten, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(game.closeWindow, windowFriendBeaten);
            windowFriendBeaten.addChild(closeButton);

            friendBeatenBack = game.add.image(14, -35, "friendBeatenBack");
            friendBeatenBack.anchor.setTo(0.5);
            windowFriendBeaten.addChild(friendBeatenBack);

            friendBeatenGlow = game.add.image(-5, -70, "friendBeatenGlow");
            friendBeatenGlow.anchor.setTo(0.5);
            windowFriendBeaten.addChild(friendBeatenGlow);

            friendBeatenIconGreen = game.add.image(-5, -70, "friendBeatenIconGreen");
            friendBeatenIconGreen.anchor.setTo(0.5);

            usr = game.objectFindByKey(game.global.friendsApp, 'uid', parseInt(game.global.social_id));

            loader = new Phaser.Loader(game);
            friendBeatenIconGreen.avatarImg = 'avatar_' + game.global.social_id;
            loader.image(friendBeatenIconGreen.avatarImg, usr.photo_50);
            loader.onLoadComplete.add(function () {
                avatar = game.make.bitmapData(50, 50);
                avatar.alphaMask(this.avatarImg, 'friendBeatenIconGreen');
                set = game.add.image(1.5, 1.5, avatar);
                set.anchor.setTo(0.5, 0.5);
                set.scale.set(0.9);

                this.addChild(set);
            }, friendBeatenIconGreen);
            loader.start();

            nameText = game.add.text(2, 40, usr.first_name, { 'font': 'bold 18px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 170 });
            nameText.anchor.setTo(0.5);
            friendBeatenIconGreen.addChild(nameText);

            numberText = game.add.text(2, -35, game.global.friendBeatenArr.me_num, { 'font': 'bold 18px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 170 });
            numberText.anchor.setTo(0.5);
            friendBeatenIconGreen.addChild(numberText);

            windowFriendBeaten.addChild(friendBeatenIconGreen);

            friendBeatenIconRed = game.add.image(-82, -10, "friendBeatenIconRed");
            friendBeatenIconRed.anchor.setTo(0.5);
            windowFriendBeaten.addChild(friendBeatenIconRed);

            usr = game.objectFindByKey(game.global.friendsApp, 'uid', parseInt(game.global.friendBeatenArr.beaten));

            loader = new Phaser.Loader(game);
            friendBeatenIconRed.avatarImg = 'avatar_' + game.global.friendBeatenArr.beaten;
            loader.image(friendBeatenIconRed.avatarImg, usr.photo_50);
            loader.onLoadComplete.add(function () {
                avatar = game.make.bitmapData(50, 50);
                avatar.alphaMask(this.avatarImg, 'friendBeatenIconRed');
                set = game.add.image(1.5, 1.5, avatar);
                set.anchor.setTo(0.5, 0.5);
                set.scale.set(0.9);

                this.addChild(set);
            }, friendBeatenIconRed);
            loader.start();

            nameText = game.add.text(2, 40, usr.first_name, { 'font': 'bold 18px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 170 });
            nameText.anchor.setTo(0.5);
            friendBeatenIconRed.addChild(nameText);

            numberText = game.add.text(2, -35, game.global.friendBeatenArr.beaten_num, { 'font': 'bold 18px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 170 });
            numberText.anchor.setTo(0.5);
            friendBeatenIconRed.addChild(numberText);

            countText = '';
            if (game.global.friendBeatenArr.count > 0) {
                countText = ' и еще ' + game.global.friendBeatenArr.count + ' ' + game.declOfNum(game.global.friendBeatenArr.count, ['друга', 'друга', 'друзей']);
            }

            text = game.add.text(2, 100, 'Поздравляем! Вы обошли ' + usr.first_name + countText + ' на ' + game.global.friendBeatenArr.level_id + ' уровне', { 'font': 'bold 18px MainFont', fill: '#7129a7', align: 'center', 'width': 100, wordWrap: true, wordWrapWidth: 320 });
            text.anchor.setTo(0.5);

            windowFriendBeaten.addChild(text);

            button = game.make.button(0, 175, 'friendBeatenButton', null, this, 0, 1, 2);
            button.inputEnabled = true;
            button.input.priorityID = 1;
            button.input.useHandCursor = true;
            button.events.onInputDown.add(function(){
                param = {
                    level_id: game.global.friendBeatenArr.level_id,
                    friend_id: game.global.friendBeatenArr.beaten,
                    score: game.global.friendBeatenArr.score
                };

                game.wallPost('friend_beaten', param);
            }, this);
            button.events.onInputUp.add(game.closeWindow, windowFriendBeaten);
            button.anchor.setTo(0.5);

            buttonText = game.add.text(0, 0, 'Рассказать', { 'font': '14pt MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonText.anchor.setTo(0.5);
            buttonText.align = "center";
            button.addChild(buttonText);

            windowFriendBeaten.addChild(button);

            windowFriendBeaten.alpha = 0.8;
            windowFriendBeaten.anchor.set(0.5);
            windowFriendBeaten.inputEnabled = true;
            windowFriendBeaten.scale.set(0.9);
            windowFriendBeaten.windowType = 'friend_beaten';

            game.add.tween(windowFriendBeaten).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowFriendBeaten.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.friend_beaten = windowFriendBeaten;
        }
    },

    levelStart: function (level) {
        game.closeOtherWindow('level_start');
        if (dragMapCheck == false && game.windows.level_start === null) {

            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            meScore = level.score;
            bg_id = level.bg_id;

            goals = level.goals;
            levelStar_1 = level.star_1;
            levelStar_2 = level.star_2;
            levelStar_3 = level.star_3;

            var windowLevelStart = game.add.image(game.width / 2, game.height / 2, "windowLevelStart");

            windowLevelStart.alpha = 0.8;
            windowLevelStart.anchor.set(0.5);
            windowLevelStart.inputEnabled = true;
            windowLevelStart.scale.set(0.9);
            windowLevelStart.windowType = 'level_start';

            windowTween = game.add.tween(windowLevelStart).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowLevelStart.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.level_start = windowLevelStart;

            closeButton = game.make.button(35, -215, 'buttonClose', null, game.windows.level_start, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(game.closeWindow, game.windows.level_start);
            game.windows.level_start.addChild(closeButton);

            levelTitle = game.add.text(-90, -130, 'Уровень ' + level.level_id, { 'font': 'bold 45px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 5});
            levelTitle.anchor.setTo(0.5, 1);
            game.windows.level_start.addChild(levelTitle);

            startButton = game.make.button(-95, 185, 'levelStartButton', null, this, 0, 1, 2);
            startButton.anchor.setTo(0.5, 1);
            startButton.inputEnabled = true;
            startButton.clicked = false;
            startButton.level_id = level.level_id;
            startButton.bg_id = bg_id;
            startButton.goals = goals;
            startButton.input.priorityID = 1;
            startButton.input.useHandCursor = true;
            startButton.events.onInputUp.add(this.levelPlay, this);

            startButtonText = game.add.text(0, -7, 'Играть', { 'font': '20pt MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            startButtonText.anchor.setTo(0.5, 1);
            startButtonText.align = "center";

            startButton.addChild(startButtonText);

            if (level.level_id <= 3) {
                if (game.tutorialMapLevel !== null) {
                    game.tutorialMapLevel.alpha = 0;
                }
                arrow = game.add.sprite(-60, -20, "tutorialArrow");
                arrow.scale.setTo(-0.7, 0.7);
                game.add.tween(arrow).to({x: -50, y: -30}, 300, Phaser.Easing.Quadratic.InOut, true, 0, null, true);
                startButton.addChild(arrow);
            }

            game.windows.level_start.addChild(startButton);

            placeGoal = game.add.image(-95, 70, "levelStartGoalPlace");
            placeGoal.anchor.setTo(0.5, 0.5);

            var goalGroup = game.add.group();
            goalOffsetX = 0;
            goalSprite = game.add.sprite(0 + goalOffsetX, 20, 'goalScore');
            goalSprite.anchor.setTo(0.5);
            goalText = game.add.text(0 + goalOffsetX, 50, '', { 'font': 'bold 14px MainFont', fill: '#7129a7'});
            goalText.text = levelStar_1 + '';
            goalText.anchor.setTo(0.5);
            goalText.align = 'center';
            goalTextArr.score = goalText;
            goalOffsetX += 55;
            goalGroup.add(goalSprite);
            goalGroup.addChild(goalText);

            if (goals.length > 0) {
                for (var i = 0; i < goals.length; i++) {
                    if (goals[i].type == 'object' && goals[i].object_type == 'ruby') {
                        goalSprite = game.add.sprite(0 + goalOffsetX, 20, 'goalRuby');
                        goalSprite.anchor.setTo(0.5);
                        goalText = game.add.text(0 + goalOffsetX, 50, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                        goalText.anchor.setTo(0.5);
                        goalText.align = 'center';
                        goalTextArr.ruby = goalText;
                    }

                    if (goals[i].type == 'object' && goals[i].object_type == 'bubble') {
                        goalSprite = game.add.sprite(0 + goalOffsetX, 20, 'goalBubble');
                        goalSprite.anchor.setTo(0.5);
                        goalText = game.add.text(0 + goalOffsetX, 50, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                        goalText.anchor.setTo(0.5);
                        goalText.align = 'center';
                        goalTextArr.bubble = goalText;
                    }

                    if (goals[i].type == 'object' && goals[i].object_type == 'counter') {
                        goalSprite = game.add.sprite(0 + goalOffsetX, 20, 'goalCounter');
                        goalSprite.anchor.setTo(0.5);
                        goalText = game.add.text(0 + goalOffsetX, 50, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                        goalText.anchor.setTo(0.5);
                        goalText.align = 'center';
                        goalTextArr.counter = goalText;
                    }

                    if (goals[i].type == 'object' && goals[i].object_type == 'sand') {
                        goalSprite = game.add.sprite(0 + goalOffsetX, 20, 'goalWater');
                        goalSprite.anchor.setTo(0.5);
                        goalText = game.add.text(0 + goalOffsetX, 50, goals[i].count, { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                        goalText.anchor.setTo(0.5);
                        goalText.align = 'center';
                        goalTextArr.sand = goalText;
                    }

                    if (goals[i].type == 'object' && goals[i].object_type == 'ghost') {
                        goalSprite = game.add.sprite(0 + goalOffsetX, 20, 'goalZombie');
                        goalSprite.anchor.setTo(0.5);
                        goalText = game.add.text(0 + goalOffsetX, 50, '', { 'font': 'bold 14px MainFont', fill: '#7129a7'});
                        goalText.anchor.setTo(0.5);

                        if (goals[i].count > 0) {
                            goalText.text = goals[i].count;
                        } else {
                            goalText.text = 'все'
                        }
                        goalText.align = 'center';
                        goalTextArr.ghost = goalText;
                    }
                    goalOffsetX += 55;
                    goalGroup.add(goalSprite);
                    goalGroup.add(goalText);
                }
            }

            goalGroup.x -= goalGroup.width / 2 + 75;
            goalGroup.y = 40;

            game.windows.level_start.addChild(placeGoal);
            game.windows.level_start.addChild(goalGroup);

            var friendScroll = game.add.group();
            friendScroll.draggable = true;
            friendScroll.x = 150;
            friendScroll.y = -60;

//            lineScroll = game.add.image(235, 100, "levelStartScrollLine");
//            lineScroll.anchor.setTo(0.5, 1);
//            game.windows.level_start.addChild(lineScroll);
//
//            upScrollButton = game.make.button(235, -90, 'levelStartScrollButtonUp', null, game.windows.level_start, 0,1,2);
//            upScrollButton.anchor.setTo(0.5, 1);
//
//            game.windows.level_start.addChild(upScrollButton);
//
//            downScrollButton = game.make.button(235, 120, 'levelStartScrollButtonDown', null, game.windows.level_start, 0,1,2);
//            downScrollButton.anchor.setTo(0.5, 1);
//
//            game.windows.level_start.addChild(downScrollButton);

            titleHignScore = game.add.text(-15, -55, 'Рекорд', { 'font': 'bold 20px MainFont', fill: '#7129a7'});
            titleHignScore.anchor.setTo(0.5, 1);
            friendScroll.add(titleHignScore);
            friendScroll.alpha = 0;
            var friendPositionY = 0;
            var OffsetPositionY = 50;

            var fiendAndMe = game.global.friendsAppList;
            fiendAndMe.push(parseInt(game.global.social_id));
            game.getServer({social_id: game.global.social_id, level_id: level.level_id, friends: fiendAndMe, method: 'getFriendScore'}, function (data) {
                friendsInLevel = data.result;

                if (friendsInLevel instanceof Array) {
                    friendsInLevel.sort(game.dynamicSort("-score"));

                    for (key in friendsInLevel) {

                        if (friendsInLevel[key].social_id == game.global.social_id) {
                            placeFriend = game.add.image(0, 0 + friendPositionY, "levelStartPlaceFriend");
                            placeFriend.anchor.setTo(0.5, 1);
                            friendScroll.add(placeFriend);
                        }

                        number = parseInt(key) + 1;
                        positionNumber = game.add.text(-65, -34 + friendPositionY, number, { 'font': 'bold 12px MainFont', fill: '#7129a7', align: 'left'});
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

//                friendScore = game.add.text(-5, -5 + friendPositionY, friendsInLevel[key].score, { 'font': 'bold 12px Averia Sans Libre', fill: '#7129a7', align:'left'});
//                friendScore.anchor.setTo(0, 1);
//                friendScroll.add(friendScore);

                        friendPositionY += OffsetPositionY;
                        if (key == 4) {
                            break;
                        }
                    }
                }
                game.add.tween(friendScroll).to({
                    alpha: 1
                }, 1000, Phaser.Easing.Cubic.Out, true);

            }, true);

            starsPlace = game.add.image(-95, 0, "levelCompleteStarsPlace");
            starsPlace.anchor.setTo(0.5, 1);
            game.windows.level_start.addChild(starsPlace);

            starTextCheck = false;
            if (meScore !== null) {
                if (meScore >= levelStar_3) {
                    star3 = game.add.image(-20, -50, "levelStartStar");
                    star3.anchor.setTo(0.5);
                    star3.scale.setTo(0.83);
                    star3.angle = 15;
                    game.windows.level_start.addChild(star3);

                    if (starTextCheck === false) {
                        starText = game.add.text(-95, 25, ' Побейте свой рекорд: ' + meScore + ' ', { 'font': 'bold 14px MainFont', fill: '#7129a7', align: 'center'});
                        starText.anchor.setTo(0.5, 1);
                        game.windows.level_start.addChild(starText);
                        starTextCheck = true;
                    }
                }
                if (meScore >= levelStar_2) {
                    star2 = game.add.image(-94, -67, "levelStartStar");
                    star2.anchor.setTo(0.5);
                    game.windows.level_start.addChild(star2);

                    if (starTextCheck === false){
                        starText = game.add.text(-95, 25, ' Счет на 3 звезды: ' + levelStar_3 + ' ', { 'font': 'bold 14px MainFont', fill: '#7129a7', align: 'center'});
                        starText.anchor.setTo(0.5, 1);
                        game.windows.level_start.addChild(starText);
                        starTextCheck = true;
                    }
                }
                if (meScore >= levelStar_1) {
                    star1 = game.add.image(-169, -50, "levelStartStar");
                    star1.anchor.setTo(0.5);
                    star1.scale.setTo(0.83);
                    star1.angle = -15;
                    game.windows.level_start.addChild(star1);

                    if (starTextCheck === false) {
                        starText = game.add.text(-95, 25, ' Счет на 2 звезды: ' + levelStar_2 + ' ', { 'font': 'bold 14px MainFont', fill: '#7129a7', align: 'center'});
                        starText.anchor.setTo(0.5, 1);
                        game.windows.level_start.addChild(starText);
                        starTextCheck = true;
                    }
                }
            }

            game.windows.level_start.addChild(friendScroll);

        }
    },

    levelPlay: function (level) {
        if (game.global.lives <= 0) {
            game.closeWindow();
            this.openGetLives();
            return false;
        }
        if (!level.clicked) {
            game.closeOtherWindow(null);
            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0)
                .onComplete.add(function () {

                    var blue = game.add.image(game.width / 2 - 70, game.height / 2 - 50, "levelLoaderBlue");
                    blue.anchor.setTo(0.5);


                    var pink = game.add.image(game.width / 2, game.height / 2 - 50, "levelLoaderPink");
                    pink.anchor.setTo(0.5);


                    var green = game.add.image(game.width / 2 + 70, game.height / 2 - 50, "levelLoaderGreen");
                    green.anchor.setTo(0.5);


                    loadText = game.add.text(game.width / 2, game.height / 2, 'Загрузка...', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
                    loadText.anchor.setTo(0.4, 0.5);

                }, this);
            if (game.isIE() === false) {
                loader = new Phaser.Loader(game);
                loader.image("levelback" + level.bg_id, "assets/sprites/level_back/" + level.bg_id + ".jpg");

                loader.onFileComplete.add(function (progress) {
                    if (progress >= 100) {
                        level.clicked = true;
                        game.levelStart = level.level_id;
                        levelGoals = level.goals;
                        game.closeOtherWindow(null);
//                    this.add.tween(loadText).to({alpha: 0}, 1000, Phaser.Easing.Cubic.Out, true);
//                    this.add.tween(fade)
//                        .to({
//                        alpha: 1
//                    }, 1000, Phaser.Easing.Cubic.Out, true)
//                        .onComplete.add(function () {
                        game.global.lives--; //уменьшаем жизни
                        game.state.start("TheGame", true, false, levelGoals, openWindow);
//                    }, this);
                    }
                }, this);
                loader.start();
            }
        }
    },

    openMessage: function () {
        game.closeOtherWindow('message');
        if (game.windows.message === null) {
            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowMessage = game.add.image(game.width / 2, game.height / 2, "windowMessage");

            messageTitle = game.add.text(0, -180, 'Почтовый ящик', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
            messageTitle.anchor.setTo(0.5, 1);
            windowMessage.addChild(messageTitle);

            var closeW = (windowMessage.width / 2) - 65;
            var closeH = (windowMessage.height / 2) - 12;

            var closeButton = game.make.button(closeW, -closeH, 'buttonClose', null, windowMessage, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(game.closeWindow, windowMessage);
            windowMessage.addChild(closeButton);

            var messageItemGroup = game.add.group();

            var itemH = (windowMessage.height / 2) - 120;

            for (key in game.global.gifts) {
                messagePlace = game.add.image(0, -itemH, 'placeMessage');
                messagePlace._this = this;
                messagePlace.anchor.setTo(0.5, 0.0);

                iconHeart = game.add.image(-175, 26, "iconHeartMessage");
                iconHeart.anchor.setTo(0.5);
                messagePlace.addChild(iconHeart);

                usr = game.objectFindByKey(game.global.friendsApp, 'uid', game.global.gifts[key].social_id);

                if (usr != null) {
                    iconFriend = game.add.image(-125, 26, "iconFriendMessage");
                    iconFriend.anchor.setTo(0.5);
                    loader = new Phaser.Loader(game);
                    iconFriend.avatarImg = 'avatar_' + game.global.gifts[key].social_id;
                    loader.image(iconFriend.avatarImg, usr.photo_50);
                    loader.onLoadComplete.add(function () {
                        avatar = game.make.bitmapData(50, 50);
                        avatar.alphaMask(this.avatarImg, 'iconFriendMessage');
                        set = game.add.image(1, 1, avatar);
                        set.anchor.setTo(0.5);
                        set.scale.set(0.94);
                        this.addChild(set);
                    }, iconFriend);
                    loader.start();
                } else {
                    iconFriend = game.add.image(-125, 26, "levelStartIconFriend");
                    iconFriend.anchor.setTo(0.5);
                    usr = {
                        first_name: 'Мабл',
                        last_name: 'Ми'
                    };
                    set = game.add.image(1, 1, 'viralWindowAvatar_3');
                    set.anchor.setTo(0.5);
                    set.scale.set(0.94);
                    iconFriend.addChild(set);
                }

                messagePlace.addChild(iconFriend);

                giftID = 0;
                if (game.global.gifts[key].type !== undefined && game.global.gifts[key].type == 'gift') {
                    tmpText = usr.first_name + ' ' + usr.last_name + '  дарит вам жизнь!';
                    tmpTextButton = 'Принять';
                    giftID = game.global.gifts[key].gift_id;
                } else if (game.global.gifts[key].type !== undefined && game.global.gifts[key].type == 'askGift') {
                    tmpText = usr.first_name + ' ' + usr.last_name + '  просит жизнь!';
                    tmpTextButton = 'Отправить';
                    giftID = game.global.gifts[key].gift_id;
                } else if (game.global.gifts[key].type !== undefined && game.global.gifts[key].type == 'key') {
                    tmpText = usr.first_name + ' ' + usr.last_name + '  дарит вам ключ!';
                    tmpTextButton = 'Принять';
                    giftID = game.global.gifts[key].key_id;
                } else if (game.global.gifts[key].type !== undefined && game.global.gifts[key].type == 'askKey') {
                    tmpText = usr.first_name + ' ' + usr.last_name + '  просит ключ!';
                    tmpTextButton = 'Отправить';
                    giftID = game.global.gifts[key].key_id;
                }

                messageItemText = game.add.text(-95, 26, tmpText, { 'font': 'bold 11px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 170 });
                messageItemText.anchor.setTo(0, 0.5);
                messageItemText.align = "left";
                messagePlace.addChild(messageItemText);

                messageItemButton = game.add.button(140, 26, "greenButtonMessage", null, windowMessage, 0, 1, 2);
                messageItemButton.anchor.setTo(0.5);
                messageItemButton.inputEnabled = true;
                messageItemButton.type = game.global.gifts[key].type;
                messageItemButton.gift_id = giftID;
                messageItemButton.social_id = game.global.gifts[key].social_id;
                messageItemButton.input.priorityID = 1;
                messageItemButton.input.useHandCursor = true;

                messageItemButton.events.onInputUp.add(this.giftAction, messagePlace);

                messagebuttonText = game.add.text(0, 0, tmpTextButton, { 'font': '13px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
                messagebuttonText.anchor.setTo(0.5);
                messagebuttonText.align = "center";
                messageItemButton.addChild(messagebuttonText);

                messagePlace.addChild(messageItemButton);

                messageItemGroup.add(messagePlace);

                itemH -= 60;
            }

            if (game.global.gifts.length > 5) {

                lineScroll = game.add.image(225, 15, "messageScrollLine");
                lineScroll.anchor.setTo(0.5);
                windowMessage.addChild(lineScroll);

                upScrollButton = game.make.button(225, -120, 'levelStartScrollButtonUp', null, this, 0, 1, 2);
                upScrollButton.anchor.setTo(0.5);

                windowMessage.addChild(upScrollButton);

                downScrollButton = game.make.button(225, 150, 'levelStartScrollButtonDown', null, this, 0, 1, 2);
                downScrollButton.anchor.setTo(0.5);

                windowMessage.addChild(downScrollButton);

                count = game.global.gifts.length;

                a = 230 / count;

                buttonScroll = game.make.button(225, -100, "levelStartScrollButton");
                buttonScroll.anchor.setTo(0.5);
                buttonScroll.inputEnabled = true;
                buttonScroll.input.priorityID = 1;
                buttonScroll.input.useHandCursor = true;
                buttonScroll.events.onInputDown.add(this.fingerOnScroll, this);

                windowMessage.addChild(buttonScroll);
                game.scrollButton = buttonScroll;
            }
            game.scrollGroup = messageItemGroup;

            windowMessage.addChild(messageItemGroup);
            mask = game.add.graphics(game.width / 2 - 300, game.height / 2 - 135);
            mask.beginFill(0xffffff);
            mask.drawRect(0, 0, 600, 300);
            game.scrollGroup.mask = mask;

            //todo отправить всем
//            button = game.add.button(0, 215, "greenButtonMessageGig", null, windowMessage, 0,1,2);
//            button.anchor.setTo(0.5,0.95);
//            button.input.priorityID = 1;
//            button.input.useHandCursor = true;
//
//            messagebuttonBigText = game.add.text(0,-20, 'Принять все', { 'font': '16px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness:4});
//            messagebuttonBigText.anchor.setTo(0.5);
//            messagebuttonBigText.align = "center";
//            button.addChild(messagebuttonBigText);

//            windowMessage.addChild(button);

            windowMessage.alpha = 0.8;
            windowMessage.anchor.set(0.5);
            windowMessage.inputEnabled = true;
            windowMessage.scale.set(0.9);
            windowMessage.windowType = 'message';

            game.add.tween(windowMessage).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowMessage.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.message = windowMessage;

        }
    },

    giftAction: function (current) {
        social_id = current.social_id;
        gift_id = current.gift_id;
        type = current.type;
        var _this = this._this;
        this.destroy();

        var itemH = 0;
        sizeY = -131;
        for (key in game.scrollGroup.children) {
            game.scrollGroup.children[key].y = sizeY + itemH;
            itemH += 60;
        }

        if (type !== undefined && type == 'gift') {
            game.getServer({social_id: game.global.social_id, method: 'acceptGift', friend_id: social_id, gift_id: gift_id}, function (data) {


                if (game.global.lives < game.global.max_lives) {
                    game.global.lives++;
                    game.global.livesText.text = game.global.lives;
                }
            });
        } else if (type !== undefined && type == 'askGift') {
            game.getServer({social_id: game.global.social_id, method: 'acceptGiftAsk', friend_id: social_id, gift_id: gift_id}, function (data) {


            });
        } else if (type !== undefined && type == 'key') {
            game.getServer({social_id: game.global.social_id, method: 'acceptKey', friend_id: social_id, gift_id: gift_id}, function (data) {


                if (data.result == 'ok') {
                    if (typeof(currentViral.friend_1) != 'number') {
                        currentViral.friend_1.destroy();
                        currentViral.friend_1 = game.add.image(-84, -135, "viralWindowIconFriend");
//
                        usr = game.objectFindByKey(game.global.friendsApp, 'uid', social_id);
//
                        if (usr !== null) {
                            loader = new Phaser.Loader(game);
                            currentViral.friend_1.avatarImg = 'avatar_' + social_id;
                            loader.image(currentViral.friend_1.avatarImg, usr.photo_50);
                            loader.onLoadComplete.add(function () {
                                avatar = game.make.bitmapData(50, 50);
                                avatar.alphaMask(this.avatarImg, 'viralWindowIconFriend');
                                set = game.add.image(3, 3, avatar);
                                set.anchor.setTo(0, 0);
                                set.scale.set(0.89);

                                this.addChild(set);
                            }, currentViral.friend_1);
                            loader.start();
                        }
                        currentViral.window.addChild(currentViral.friend_1);
                        currentViral.friend_1 = social_id;
                    } else if (typeof(currentViral.friend_2) != 'number') {
                        if (currentViral.friend_1 == social_id) {
                            return false;
                        }
                        currentViral.friend_2.destroy();
                        currentViral.friend_2 = game.add.image(-34, -135, "viralWindowIconFriend");
//
                        usr = game.objectFindByKey(game.global.friendsApp, 'uid', social_id);
//
                        if (usr !== null) {
                            loader = new Phaser.Loader(game);
                            currentViral.friend_2.avatarImg = 'avatar_' + social_id;
                            loader.image(currentViral.friend_2.avatarImg, usr.photo_50);
                            loader.onLoadComplete.add(function () {
                                avatar = game.make.bitmapData(50, 50);
                                avatar.alphaMask(this.avatarImg, 'viralWindowIconFriend');
                                set = game.add.image(3, 3, avatar);
                                set.anchor.setTo(0, 0);
                                set.scale.set(0.89);

                                this.addChild(set);
                            }, currentViral.friend_2);
                            loader.start();
                        }
                        currentViral.window.addChild(currentViral.friend_2);
                        currentViral.friend_2 = social_id;
                    } else if (typeof(currentViral.friend_3) != 'number') {


                        if (currentViral.friend_1 == social_id || currentViral.friend_2 == social_id) {
                            return false;
                        }
                        currentViral.friend_3.destroy();
                        currentViral.friend_3 = game.add.image(16, -135, "viralWindowIconFriend");
//
                        usr = game.objectFindByKey(game.global.friendsApp, 'uid', social_id);
//
                        if (usr !== null) {
                            loader = new Phaser.Loader(game);
                            currentViral.friend_3.avatarImg = 'avatar_' + social_id;
                            loader.image(currentViral.friend_3.avatarImg, usr.photo_50);
                            loader.onLoadComplete.add(function () {
                                avatar = game.make.bitmapData(50, 50);
                                avatar.alphaMask(this.avatarImg, 'viralWindowIconFriend');
                                set = game.add.image(3, 3, avatar);
                                set.anchor.setTo(0, 0);
                                set.scale.set(0.89);

                                this.addChild(set);
                            }, currentViral.friend_3);
                            loader.start();
                        }
                        currentViral.window.addChild(currentViral.friend_3);
                        currentViral.friend_3 = social_id;

                        currentLevelButton.alpha = 0;
                        currentLevelButton.input.useHandCursor = true;
                        currentLevelButton.events.onInputUp.add(_this.levelStart, _this);
                        currentLevelPosY = currentLevelButton.y;
                        var levelActive = game.add.sprite(currentLevelButton.x, currentLevelButton.y + 7, "buttonLevelActive");
                        levelActive.anchor.setTo(0.5);
                        usr = game.objectFindByKey(game.global.friendsApp, 'uid', parseInt(game.global.social_id));

                        if (usr !== null) {
                            iconMe = game.add.image(currentLevelButton.x, currentLevelButton.y-28, "levelStartIconFriend");
                            iconMe.anchor.setTo(0.5, 1);

                            loader = new Phaser.Loader(game);
                            iconMe.avatarImg = 'avatar_' + game.global.social_id;
                            loader.image(iconMe.avatarImg, usr.photo_50);
                            loader.onLoadComplete.add(function () {
                                avatar = game.make.bitmapData(50, 50);
                                avatar.alphaMask(this.avatarImg, 'levelStartIconFriend');
                                set = game.add.image(-0.5, 0, avatar);
                                set.anchor.setTo(0.4, 0.9);
                                set.scale.set(0.87);

                                this.addChild(set);
                            }, iconMe);
                            loader.start();
                            levelGroup.add(iconMe);
                        }
                        levelActive.animations.add('wave', [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 8, 7, 6, 5, 4, 3, 2, 1], 10, true, true);
                        levelActive.animations.play('wave');
                        levelGroup.add(levelActive);

                        var levelText = game.add.text(currentLevelButton.x, currentLevelButton.y-3, currentLevelButton.level_id, { 'font': '18px Arial', fill: '#fff', 'width': 100 });
                        levelText.anchor.setTo(0.5, 0.4);
                        levelGroup.add(levelText);
                    }
                }
            });
        } else if (type !== undefined && type == 'askKey') {
            game.getServer({social_id: game.global.social_id, method: 'acceptKeyAsk', friend_id: social_id}, function (data) {
            });
        }
    },

    openViral: function(current){
        result = false;
        method = false;
        status = 0;
        if (current == 'xp' && userXP >= currentViral.xp) {
            method = 'openViralXP';
            status = 2;
        }

        if (current == 'coins')
        {
            if (game.global.gold >= currentViral.coins) {
                method = 'openViralCoins';
                status = 3;
            } else {
                game.openPurchase();
            }
        }

        if (method !== false) {
            game.getServer({social_id: game.global.social_id, method: method}, function (data) {
                result = data.result;
            });
        }
        if (result == 'ok') {
            if (method == 'openViralCoins'){
                game.global.gold -= currentViral.coins;
                game.coinsCount.text = ' ' + game.global.gold + ' ';
            }

            if (currentViral.coinsPanel !== null) {
                currentViral.coinsPanel.destroy();
                currentViral.coinsPanel = null;
            }

            if (currentViral.key !== null) {
                currentViral.key.destroy();
                currentViral.key = null;
            }

            if (typeof(currentViral.friend_1) != 'number') {
                currentViral.friend_1.destroy();

                currentViral.friend_1 = game.add.image(-84, -135, "viralWindowIconFriend");
                set = game.add.image(3, 3, 'viralWindowAvatar_1');
                set.scale.set(0.82);
                currentViral.friend_1.addChild(set);

                currentViral.window.addChild(currentViral.friend_1);
                currentViral.friend_1 = 0;
            }
            if (typeof(currentViral.friend_2) != 'number') {
                currentViral.friend_2.destroy();

                currentViral.friend_2 = game.add.image(-34, -135, "viralWindowIconFriend");
                set = game.add.image(3, 3, 'viralWindowAvatar_2');
                set.scale.set(0.82);
                currentViral.friend_2.addChild(set);

                currentViral.window.addChild(currentViral.friend_2);
                currentViral.friend_2 = 0;
            }
            if (typeof(currentViral.friend_3) != 'number') {
                currentViral.friend_3.destroy();

                currentViral.friend_3 = game.add.image(16, -135, "viralWindowIconFriend");
                set = game.add.image(3, 3, 'viralWindowAvatar_3');
                set.scale.set(0.82);
                currentViral.friend_3.addChild(set);

                currentViral.window.addChild(currentViral.friend_3);
                currentViral.friend_3 = 0;
            }
            currentLevelButton.alpha = 0;
            currentLevelButton.input.useHandCursor = true;
            currentLevelButton.events.onInputUp.add(this.levelStart, this);
            currentLevelPosY = currentLevelButton.y;
            var levelActive = game.add.sprite(currentLevelButton.x-2, currentLevelButton.y + 4, "buttonLevelActive");
            levelActive.anchor.setTo(0.5);
                usr = game.objectFindByKey(game.global.friendsApp, 'uid', parseInt(game.global.social_id));

                if (usr !== null) {
                    iconMe = game.add.image(currentLevelButton.x -4, currentLevelButton.y-32, "levelStartIconFriend");
                    iconMe.anchor.setTo(0.5, 1);

                    loader = new Phaser.Loader(game);
                    iconMe.avatarImg = 'avatar_' + game.global.social_id;
                    loader.image(iconMe.avatarImg, usr.photo_50);
                    loader.onLoadComplete.add(function () {
                        avatar = game.make.bitmapData(50, 50);
                        avatar.alphaMask(this.avatarImg, 'levelStartIconFriend');
                        set = game.add.image(-0.5, 0, avatar);
                        set.anchor.setTo(0.4, 0.9);
                        set.scale.set(0.87);

                        this.addChild(set);
                    }, iconMe);
                    loader.start();
                    levelGroup.add(iconMe);
                }
            levelActive.animations.add('wave', [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 8, 7, 6, 5, 4, 3, 2, 1], 10, true, true);
            levelActive.animations.play('wave');
            levelGroup.add(levelActive);

            var levelText = game.add.text(currentLevelButton.x, currentLevelButton.y-3, currentLevelButton.level_id, { 'font': '18px Arial', fill: '#fff', 'width': 100 });
            levelText.anchor.setTo(0.5, 0.4);
            levelGroup.add(levelText);

            viral = game.objectFindByKey(game.global.viral_blocks, 'viral_id', currentViral.viral_id);
            viral.status = status;

            viralNext = game.objectFindByKey(game.global.viral_blocks, 'viral_id', currentViral.viral_id+1);
            viralNext.status = 0;
            expCount.text = userXP + '/' + viralNext.xp;
        }
    },

    openGetLives: function () {
        game.closeOtherWindow('lives');
        if (game.windows.lives === null) {

            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowLives = game.add.image(game.width / 2, game.height / 2, "windowLives");

            windowLives.alpha = 0.8;
            windowLives.anchor.set(0.5);
            windowLives.inputEnabled = true;
            windowLives.scale.set(0.9);
            windowLives.windowType = 'lives';

            game.add.tween(windowLives).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowLives.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.lives = windowLives;

            this.windowGetLivesContent();
        }
    },

    windowGetLivesContent: function () {

        if (game.global.lives < game.global.max_lives) {
            game.timerChange = this.game.time.create(this.game);
            game.timerChange.add(Phaser.Timer.SECOND * (game.global.restore_time - game.global.time_to_refill), this.windowGetLivesContent, this);
            game.timerChange.start();
        }
        game.windows.lives.removeChildren();

        closeButton = game.make.button(140, -180, 'buttonClose', null, game.windows.lives, 0, 1, 2);
        closeButton.inputEnabled = true;
        closeButton.input.priorityID = 1;
        closeButton.input.useHandCursor = true;
        closeButton.events.onInputUp.add(game.closeWindow, game.windows.lives);
        game.windows.lives.addChild(closeButton);

        if (game.global.lives <= 0) {
            nomore = game.add.image(0, -140, "nomore");
            nomore.anchor.setTo(0.5, 1);
            game.windows.lives.addChild(nomore);

            levelTitle = game.add.text(0, -32, '0', { 'font': 'bold 48px MainFont', align: 'center', fill: '#ffffff'});
            levelTitle.anchor.setTo(0.6, 1);
            game.windows.lives.addChild(levelTitle);

            placeText = game.add.image(0, 20, "place_text");
            placeText.anchor.setTo(0.5, 1);
            text = game.add.text(-27, -7, 'Cледующая жизнь через:', { 'font': 'bold 16px MainFont', align: 'center', fill: '#7129a7'});
            text.anchor.setTo(0.5, 1);
            text.scale.x = 0.85;
            placeText.addChild(text);

            timer = game.add.text(90, -7, ' ' + game.global.refill + ' ', { 'font': 'bold 16px MainFont', align: 'center', fill: '#ff007e'});
            timer.anchor.setTo(0.5, 1);
            timer.scale.x = 0.85;

            game.time.events.loop(Phaser.Timer.SECOND * 0.1, function () {
                timer.text = ' ' + game.global.refill + ' ';
            }, this);

            placeText.addChild(timer);

            game.windows.lives.addChild(placeText);

            text = game.add.text(0, 70, 'Попроси у друзей жизнь или купи \n все жизни сейчас!', { 'font': 'bold 15px Tahoma', align: 'center', fill: '#7129a7'});
            text.anchor.setTo(0.5, 1);
            text.scale.y = 1;
            game.windows.lives.addChild(text);

            askButton = game.make.button(0, 120, 'greenButton', null, game.windows.lives, 0, 1, 2);
            askButton.anchor.setTo(0.5, 1);
            askButton.inputEnabled = true;
            askButton.input.priorityID = 1;
            askButton.input.useHandCursor = true;
            askButton.events.onInputUp.add(this.openLivesAsk, this);

            askButtonText = game.add.text(0, -5, 'Попросить', { 'font': 'bold 12pt MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            askButtonText.anchor.setTo(0.5, 1);
            askButton.addChild(askButtonText);

            game.windows.lives.addChild(askButton);

            buyButton = game.make.button(0, 170, 'blueButton', null, this, 0, 1, 2);
            buyButton.anchor.setTo(0.5, 1);
            buyButton.inputEnabled = true;
            buyButton.input.priorityID = 1;
            buyButton.input.useHandCursor = true;
            buyButton.events.onInputUp.add(this.increaseHeart, this);

            buyButtonText = game.add.text(-12, -8, 'Восстановить  15', { 'font': 'bold 10pt MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 4});
            buyButtonText.anchor.setTo(0.5, 1);
            buyButton.addChild(buyButtonText);

            game.windows.lives.addChild(buyButton);

        } else if (game.global.lives > 0 && game.global.lives < game.global.max_lives) {
            getmore = game.add.image(0, -140, "getmore");
            getmore.anchor.setTo(0.5, 1);
            game.windows.lives.addChild(getmore);

            levelTitle = game.add.text(0, -32, game.global.lives, { 'font': 'bold 48px MainFont', align: 'center', fill: '#ffffff'});
            levelTitle.anchor.setTo(0.6, 1);
            game.windows.lives.addChild(levelTitle);

            placeText = game.add.image(0, 20, "place_text");
            placeText.anchor.setTo(0.5, 1);
            text = game.add.text(-27, -7, 'Cледующая жизнь через:', { 'font': 'bold 16px MainFont', align: 'center', fill: '#7129a7'});
            text.anchor.setTo(0.5, 1);
            text.scale.x = 0.85;
            placeText.addChild(text);

            timer = game.add.text(90, -7,  ' ' + game.global.refill + ' ', { 'font': 'bold 16px MainFont', align: 'center', fill: '#ff007e'});
            timer.anchor.setTo(0.5, 1);
            timer.scale.x = 0.85;

            game.time.events.loop(Phaser.Timer.SECOND * 0.1, function () {
                timer.text = ' ' + game.global.refill + ' ';
            }, this);

            placeText.addChild(timer);

            game.windows.lives.addChild(placeText);

            text = game.add.text(0, 70, 'Попроси у друзей жизнь или купи \n все жизни сейчас!', { 'font': 'bold 15px Tahoma', align: 'center', fill: '#7129a7'});
            text.anchor.setTo(0.5, 1);
            text.scale.y = 1;
            game.windows.lives.addChild(text);

            askButton = game.make.button(0, 170, 'greenButton', null, game.windows.lives, 0, 1, 2);
            askButton.anchor.setTo(0.5, 1);
            askButton.inputEnabled = true;
            askButton.input.priorityID = 1;
            askButton.input.useHandCursor = true;
            askButton.events.onInputUp.add(this.openLivesAsk, this);
            askButtonText = game.add.text(0, -5, 'Попросить', { 'font': 'bold 12pt MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            askButtonText.anchor.setTo(0.5, 1);
            askButton.addChild(askButtonText);
            game.windows.lives.addChild(askButton);
        } else if (game.global.lives >= game.global.max_lives) {
            getmore = game.add.image(0, -140, "getmore");
            getmore.anchor.setTo(0.5, 1);
            game.windows.lives.addChild(getmore);

            levelTitle = game.add.text(0, -32, '5', { 'font': 'bold 48px MainFont', align: 'center', fill: '#ffffff'});
            levelTitle.anchor.setTo(0.6, 1);
            game.windows.lives.addChild(levelTitle);

            text = game.add.text(0, 70, 'Попроси у друзей больше жизней!', { 'font': 'bold 15px Tahoma', align: 'center', fill: '#7129a7'});
            text.anchor.setTo(0.5, 1);
            text.scale.y = 1;
            game.windows.lives.addChild(text);

            askButton = game.make.button(0, 170, 'greenButton', null, game.windows.lives, 0, 1, 2);
            askButton.anchor.setTo(0.5, 1);
            askButton.inputEnabled = true;
            askButton.input.priorityID = 1;
            askButton.input.useHandCursor = true;
            askButton.events.onInputUp.add(this.openLivesAsk, this);
            askButtonText = game.add.text(0, -5, 'Попросить', { 'font': 'bold 12pt MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            askButtonText.anchor.setTo(0.5, 1);
            askButton.addChild(askButtonText);
            game.windows.lives.addChild(askButton);
        }
    },

    increaseHeart: function() {
        if (game.global.gold >= 15) {
            result = false;
            game.getServer({social_id: game.global.social_id, method: 'inAppPurchase', type: 'heart', coins: 15, level_id: game.global.level_current-1}, function (data) {
                result = data.result;
            });
            if (result == 'ok') {
                game.global.lives = game.global.max_lives;
                game.global.gold -= 15;
                game.coinsCount.text = ' ' + game.global.gold + ' ';
                this.windowGetLivesContent();
            }
        } else {
            game.openPurchase();
        }
    },

    openLivesSend: function () {
        game.closeOtherWindow('lives_send');
        if (game.windows.lives_send === null) {
            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowSendLives = game.add.image(game.width / 2, game.height / 2, "windowMessage");

            sendLivesTitle = game.add.text(0, -180, 'Отправь жизнь', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
            sendLivesTitle.anchor.setTo(0.5, 1);
            windowSendLives.addChild(sendLivesTitle);

            var closeW = (windowSendLives.width / 2) - 65;
            var closeH = (windowSendLives.height / 2) - 12;

            var closeButton = game.make.button(closeW, -closeH, 'buttonClose', null, windowSendLives, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(game.closeWindow, windowSendLives);
            windowSendLives.addChild(closeButton);

            var sendLivesItemGroup = game.add.group();

            var itemH = (windowSendLives.height / 2) - 120;

            counter = 1;

            for (key in game.global.friendsApp) {
                if (game.global.friendsApp[key].uid !== parseInt(game.global.social_id)) {
                    if (counter % 2 == 0) {
                        itemW = 106;
                    } else {
                        itemW = -113;
                    }

                    sendLivesPlace = game.add.button(itemW, -itemH, 'friendPlace');
                    sendLivesPlace.anchor.setTo(0.5, 0.0);
                    sendLivesPlace.check = false;
                    sendLivesPlace.social_id = game.global.friendsApp[key].uid;
                    sendLivesPlace.inputEnabled = true;
                    sendLivesPlace.input.priorityID = 1;
                    sendLivesPlace.input.useHandCursor = true;
                    sendLivesPlace.events.onInputUp.add(this.checkedButton, this);

                    buttonOk = game.add.button(-80, 22, "okGreen", null, this);
                    buttonOk.frame = 0;
                    buttonOk.anchor.setTo(0.5);
                    sendLivesPlace.checkButton = buttonOk;
                    sendLivesPlace.addChild(buttonOk);

                    iconFriend = game.add.image(-30, 26, "iconFriendMessage");
                    iconFriend.anchor.setTo(0.5);

                    usr = game.global.friendsApp[key];

                    loader = new Phaser.Loader(game);
                    iconFriend.avatarImg = 'avatar_' + game.global.friendsApp.uid;
                    loader.image(iconFriend.avatarImg, usr.photo_50);
                    loader.onLoadComplete.add(function () {
                        avatar = game.make.bitmapData(50, 50);
                        avatar.alphaMask(this.avatarImg, 'iconFriendMessage');
                        set = game.add.image(1, 1, avatar);
                        set.anchor.setTo(0.5);
                        set.scale.set(0.94);
                        this.addChild(set);
                    }, iconFriend);
                    loader.start();

                    sendLivesPlace.addChild(iconFriend);

                    sendLiveText = game.add.text(0, 26, game.global.friendsApp[key].first_name + ' ' + game.global.friendsApp[key].last_name, { 'font': 'bold 14px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 106 });
                    sendLiveText.anchor.setTo(0, 0.5);
                    sendLiveText.align = "left";
                    sendLivesPlace.addChild(sendLiveText);

                    sendLivesItemGroup.add(sendLivesPlace);

                    if (counter % 2 == 0) {
                        itemH -= 60;
                    }
                    counter++;
                }
            }

            if (counter > 10) {
                lineScroll = game.add.image(225, 15, "messageScrollLine");
                lineScroll.anchor.setTo(0.5);
                windowSendLives.addChild(lineScroll);

                upScrollButton = game.make.button(225, -120, 'levelStartScrollButtonUp', null, this, 0, 1, 2);
                upScrollButton.anchor.setTo(0.5);

                windowSendLives.addChild(upScrollButton);

                downScrollButton = game.make.button(225, 150, 'levelStartScrollButtonDown', null, this, 0, 1, 2);
                downScrollButton.anchor.setTo(0.5);

                windowSendLives.addChild(downScrollButton);

                count = game.global.gifts.length;

                a = 230 / count;

                buttonScroll = game.make.button(225, -100, "levelStartScrollButton");
                buttonScroll.anchor.setTo(0.5);
                buttonScroll.inputEnabled = true;
                buttonScroll.input.priorityID = 1;
                buttonScroll.input.useHandCursor = true;
                buttonScroll.events.onInputDown.add(this.fingerOnScroll, this);

                windowSendLives.addChild(buttonScroll);
                game.scrollButton = buttonScroll;
            }
            game.scrollGroup = sendLivesItemGroup;

            windowSendLives.addChild(sendLivesItemGroup);
            mask = game.add.graphics(game.width / 2 - 300, game.height / 2 - 135);
            mask.beginFill(0xffffff);
            mask.drawRect(0, 0, 600, 300);
            game.scrollGroup.mask = mask;

            button = game.add.button(0, 215, "greenButtonMessageGig", null, sendLivesItemGroup, 0, 1, 2);
            button.anchor.setTo(0.5, 0.95);
            button.inputEnabled = true;
            button.input.priorityID = 3;
            button.input.useHandCursor = true;
            button.events.onInputUp.add(this.sendGift, this);

            buttonBigText = game.add.text(0, -20, 'Отправить', { 'font': '16px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonBigText.anchor.setTo(0.5);
            buttonBigText.align = "center";
            button.addChild(buttonBigText);

            heart = game.add.image(-77, -15, 'iconHeartMessage');
            heart.anchor.setTo(0.5);

            button.addChild(heart);

            windowSendLives.addChild(button);

            buttonAll = game.add.button(105, 202, "okBlue", null, sendLivesItemGroup);
            buttonAll.anchor.setTo(0.5, 0.95);
            buttonAll.frame = 0;
            buttonAll.inputEnabled = true;
            buttonAll.input.priorityID = 2;
            buttonAll.input.useHandCursor = true;
            buttonAll.events.onInputUp.add(this.checkedAllButton, sendLivesItemGroup);
            game.checkAllButton = buttonAll;

            buttonAllText1 = game.add.text(15, -30, 'Отправить', { 'font': '12px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonAllText1.align = "left";
            buttonAll.addChild(buttonAllText1);
            buttonAllText2 = game.add.text(15, -15, 'всем', { 'font': '12px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonAllText2.align = "left";

            buttonAll.addChild(buttonAllText2);
            windowSendLives.addChild(buttonAll);

            windowSendLives.alpha = 0.8;
            windowSendLives.anchor.set(0.5);
            windowSendLives.inputEnabled = true;
            windowSendLives.scale.set(0.9);
            windowSendLives.windowType = 'lives_send';

            game.add.tween(windowSendLives).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowSendLives.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.lives_send = windowSendLives;

        }
    },

    openLivesAsk: function () {
        game.closeOtherWindow('lives_ask');
        if (game.windows.lives_ask === null) {
            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowSendLives = game.add.image(game.width / 2, game.height / 2, "windowMessage");

            sendLivesTitle = game.add.text(0, -180, 'Попроси жизнь', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
            sendLivesTitle.anchor.setTo(0.5, 1);
            windowSendLives.addChild(sendLivesTitle);

            var closeW = (windowSendLives.width / 2) - 65;
            var closeH = (windowSendLives.height / 2) - 12;

            var closeButton = game.make.button(closeW, -closeH, 'buttonClose', null, windowSendLives, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(game.closeWindow, windowSendLives);
            windowSendLives.addChild(closeButton);

            var sendLivesItemGroup = game.add.group();

            var itemH = (windowSendLives.height / 2) - 120;

            counter = 1;

            for (key in game.global.friendsApp) {
                if (game.global.friendsApp[key].uid !== parseInt(game.global.social_id)) {
                    if (counter % 2 == 0) {
                        itemW = 106;
                    } else {
                        itemW = -113;
                    }

                    sendLivesPlace = game.add.button(itemW, -itemH, 'friendPlace');
                    sendLivesPlace.anchor.setTo(0.5, 0.0);
                    sendLivesPlace.check = false;
                    sendLivesPlace.social_id = game.global.friendsApp[key].uid;
                    sendLivesPlace.inputEnabled = true;
                    sendLivesPlace.input.priorityID = 1;
                    sendLivesPlace.input.useHandCursor = true;
                    sendLivesPlace.events.onInputUp.add(this.checkedButton, this);

                    buttonOk = game.add.button(-80, 22, "okGreen", null, this);
                    buttonOk.frame = 0;
                    buttonOk.anchor.setTo(0.5);
                    sendLivesPlace.checkButton = buttonOk;
                    sendLivesPlace.addChild(buttonOk);

                    iconFriend = game.add.image(-30, 26, "iconFriendMessage");
                    iconFriend.anchor.setTo(0.5);

                    usr = game.global.friendsApp[key];

                    loader = new Phaser.Loader(game);
                    iconFriend.avatarImg = 'avatar_' + game.global.friendsApp.uid;
                    loader.image(iconFriend.avatarImg, usr.photo_50);
                    loader.onLoadComplete.add(function () {
                        avatar = game.make.bitmapData(50, 50);
                        avatar.alphaMask(this.avatarImg, 'iconFriendMessage');
                        set = game.add.image(1, 1, avatar);
                        set.anchor.setTo(0.5);
                        set.scale.set(0.94);
                        this.addChild(set);
                    }, iconFriend);
                    loader.start();

                    sendLivesPlace.addChild(iconFriend);

                    sendLiveText = game.add.text(0, 26, game.global.friendsApp[key].first_name + ' ' + game.global.friendsApp[key].last_name, { 'font': 'bold 14px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 106 });
                    sendLiveText.anchor.setTo(0, 0.5);
                    sendLiveText.align = "left";
                    sendLivesPlace.addChild(sendLiveText);

                    sendLivesItemGroup.add(sendLivesPlace);

                    if (counter % 2 == 0) {
                        itemH -= 60;
                    }
                    counter++;
                }
            }

            if (counter > 10) {
                lineScroll = game.add.image(225, 15, "messageScrollLine");
                lineScroll.anchor.setTo(0.5);
                windowSendLives.addChild(lineScroll);

                upScrollButton = game.make.button(225, -120, 'levelStartScrollButtonUp', null, this, 0, 1, 2);
                upScrollButton.anchor.setTo(0.5);

                windowSendLives.addChild(upScrollButton);

                downScrollButton = game.make.button(225, 150, 'levelStartScrollButtonDown', null, this, 0, 1, 2);
                downScrollButton.anchor.setTo(0.5);

                windowSendLives.addChild(downScrollButton);

                count = game.global.gifts.length;

                a = 230 / count;

                buttonScroll = game.make.button(225, -100, "levelStartScrollButton");
                buttonScroll.anchor.setTo(0.5);
                buttonScroll.inputEnabled = true;
                buttonScroll.input.priorityID = 1;
                buttonScroll.input.useHandCursor = true;
                buttonScroll.events.onInputDown.add(this.fingerOnScroll, this);

                windowSendLives.addChild(buttonScroll);
                game.scrollButton = buttonScroll;
            }
            game.scrollGroup = sendLivesItemGroup;


            windowSendLives.addChild(sendLivesItemGroup);
            mask = game.add.graphics(game.width / 2 - 300, game.height / 2 - 135);
            mask.beginFill(0xffffff);
            mask.drawRect(0, 0, 600, 300);
            game.scrollGroup.mask = mask;

            button = game.add.button(0, 215, "greenButtonMessageGig", null, sendLivesItemGroup, 0, 1, 2);
            button.anchor.setTo(0.5, 0.95);
            button.inputEnabled = true;
            button.input.priorityID = 3;
            button.input.useHandCursor = true;
            button.events.onInputUp.add(this.askGift, this);

            buttonBigText = game.add.text(0, -20, 'Отправить', { 'font': '16px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonBigText.anchor.setTo(0.5);
            buttonBigText.align = "center";
            button.addChild(buttonBigText);

            heart = game.add.image(-77, -15, 'iconHeartMessage');
            heart.anchor.setTo(0.5);

            button.addChild(heart);

            windowSendLives.addChild(button);

            buttonAll = game.add.button(105, 202, "okBlue", null, sendLivesItemGroup);
            buttonAll.anchor.setTo(0.5, 0.95);
            buttonAll.frame = 0;
            buttonAll.inputEnabled = true;
            buttonAll.input.priorityID = 2;
            buttonAll.input.useHandCursor = true;
            buttonAll.events.onInputUp.add(this.checkedAllButton, sendLivesItemGroup);
            game.checkAllButton = buttonAll;

            buttonAllText1 = game.add.text(15, -30, 'Отправить', { 'font': '12px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonAllText1.align = "left";
            buttonAll.addChild(buttonAllText1);
            buttonAllText2 = game.add.text(15, -15, 'всем', { 'font': '12px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonAllText2.align = "left";

            buttonAll.addChild(buttonAllText2);
            windowSendLives.addChild(buttonAll);

            windowSendLives.alpha = 0.8;
            windowSendLives.anchor.set(0.5);
            windowSendLives.inputEnabled = true;
            windowSendLives.scale.set(0.9);
            windowSendLives.windowType = 'lives_ask';

            game.add.tween(windowSendLives).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowSendLives.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.lives_ask = windowSendLives;

        }
    },

    openKeyAsk: function () {
        game.closeOtherWindow('key_ask');
        if (game.windows.key_ask === null) {
            game.fade = game.add.graphics(0, 0);
            game.fade.beginFill(0x000000, 1);
            game.fade.drawRect(0, 0, game.width, game.height);
            game.fade.alpha = 0;
            this.add.tween(game.fade).to({alpha: 0.4}, 200, Phaser.Easing.Back.None, true, 0);

            var windowKeyAsk = game.add.image(game.width / 2, game.height / 2, "windowMessage");

            keyAskTitle = game.add.text(0, -180, 'Попроси ключ', { 'font': 'bold 28px MainFont', fill: '#fff', stroke: '#3e6fbd', strokeThickness: 8});
            keyAskTitle.anchor.setTo(0.5, 1);
            windowKeyAsk.addChild(keyAskTitle);

            var closeW = (windowKeyAsk.width / 2) - 65;
            var closeH = (windowKeyAsk.height / 2) - 12;

            var closeButton = game.make.button(closeW, -closeH, 'buttonClose', null, windowKeyAsk, 0, 1, 2);
            closeButton.inputEnabled = true;
            closeButton.input.priorityID = 1;
            closeButton.input.useHandCursor = true;
            closeButton.events.onInputUp.add(game.closeWindow, windowKeyAsk);
            windowKeyAsk.addChild(closeButton);

            var sendLivesItemGroup = game.add.group();

            var itemH = (windowKeyAsk.height / 2) - 120;

            counter = 1;

            for (key in game.global.friendsApp) {
                if (game.global.friendsApp[key].uid !== parseInt(game.global.social_id)) {
                    if (counter % 2 == 0) {
                        itemW = 106;
                    } else {
                        itemW = -113;
                    }

                    sendLivesPlace = game.add.button(itemW, -itemH, 'friendPlace');
                    sendLivesPlace.anchor.setTo(0.5, 0.0);
                    sendLivesPlace.check = false;
                    sendLivesPlace.social_id = game.global.friendsApp[key].uid;
                    sendLivesPlace.inputEnabled = true;
                    sendLivesPlace.input.priorityID = 1;
                    sendLivesPlace.input.useHandCursor = true;
                    sendLivesPlace.events.onInputUp.add(this.checkedButton, this);

                    buttonOk = game.add.button(-80, 22, "okGreen", null, this);
                    buttonOk.frame = 0;
                    buttonOk.anchor.setTo(0.5);
                    sendLivesPlace.checkButton = buttonOk;
                    sendLivesPlace.addChild(buttonOk);

                    iconFriend = game.add.image(-30, 26, "iconFriendMessage");
                    iconFriend.anchor.setTo(0.5);

                    usr = game.global.friendsApp[key];

                    loader = new Phaser.Loader(game);
                    iconFriend.avatarImg = 'avatar_' + game.global.friendsApp.uid;
                    loader.image(iconFriend.avatarImg, usr.photo_50);
                    loader.onLoadComplete.add(function () {
                        avatar = game.make.bitmapData(50, 50);
                        avatar.alphaMask(this.avatarImg, 'iconFriendMessage');
                        set = game.add.image(1, 1, avatar);
                        set.anchor.setTo(0.5);
                        set.scale.set(0.94);
                        this.addChild(set);
                    }, iconFriend);
                    loader.start();

                    sendLivesPlace.addChild(iconFriend);

                    sendLiveText = game.add.text(0, 26, game.global.friendsApp[key].first_name + ' ' + game.global.friendsApp[key].last_name, { 'font': 'bold 14px MainFont', fill: '#7129a7', 'width': 100, wordWrap: true, wordWrapWidth: 106 });
                    sendLiveText.anchor.setTo(0, 0.5);
                    sendLiveText.align = "left";
                    sendLivesPlace.addChild(sendLiveText);

                    sendLivesItemGroup.add(sendLivesPlace);

                    if (counter % 2 == 0) {
                        itemH -= 60;
                    }
                    counter++;
                }
            }

            if (counter > 10) {
                lineScroll = game.add.image(225, 15, "messageScrollLine");
                lineScroll.anchor.setTo(0.5);
                windowKeyAsk.addChild(lineScroll);

                upScrollButton = game.make.button(225, -120, 'levelStartScrollButtonUp', null, this, 0, 1, 2);
                upScrollButton.anchor.setTo(0.5);

                windowKeyAsk.addChild(upScrollButton);

                downScrollButton = game.make.button(225, 150, 'levelStartScrollButtonDown', null, this, 0, 1, 2);
                downScrollButton.anchor.setTo(0.5);

                windowKeyAsk.addChild(downScrollButton);

                count = game.global.gifts.length;

                a = 230 / count;

                buttonScroll = game.make.button(225, -100, "levelStartScrollButton");
                buttonScroll.anchor.setTo(0.5);
                buttonScroll.inputEnabled = true;
                buttonScroll.input.priorityID = 1;
                buttonScroll.input.useHandCursor = true;
                buttonScroll.events.onInputDown.add(this.fingerOnScroll, this);

                windowKeyAsk.addChild(buttonScroll);
                game.scrollButton = buttonScroll;
            }
            game.scrollGroup = sendLivesItemGroup;

            windowKeyAsk.addChild(sendLivesItemGroup);
            mask = game.add.graphics(game.width / 2 - 300, game.height / 2 - 135);
            mask.beginFill(0xffffff);
            mask.drawRect(0, 0, 600, 300);
            game.scrollGroup.mask = mask;

            button = game.add.button(0, 215, "greenButtonMessageGig", null, sendLivesItemGroup, 0, 1, 2);
            button.anchor.setTo(0.5, 0.95);
            button.inputEnabled = true;
            button.input.priorityID = 3;
            button.input.useHandCursor = true;
            button.events.onInputUp.add(this.askKey, this);

            buttonBigText = game.add.text(0, -20, 'Отправить', { 'font': '16px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonBigText.anchor.setTo(0.5);
            buttonBigText.align = "center";
            button.addChild(buttonBigText);

            windowKeyAsk.addChild(button);

            buttonAll = game.add.button(105, 202, "okBlue", null, sendLivesItemGroup);
            buttonAll.anchor.setTo(0.5, 0.95);
            buttonAll.frame = 0;
            buttonAll.inputEnabled = true;
            buttonAll.input.priorityID = 2;
            buttonAll.input.useHandCursor = true;
            buttonAll.events.onInputUp.add(this.checkedAllButton, sendLivesItemGroup);
            game.checkAllButton = buttonAll;

            buttonAllText1 = game.add.text(15, -30, 'Отправить', { 'font': '12px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonAllText1.align = "left";
            buttonAll.addChild(buttonAllText1);
            buttonAllText2 = game.add.text(15, -15, 'всем', { 'font': '12px MainFont', fill: '#fff', stroke: '#4b7b1d', strokeThickness: 4});
            buttonAllText2.align = "left";

            buttonAll.addChild(buttonAllText2);
            windowKeyAsk.addChild(buttonAll);

            windowKeyAsk.alpha = 0.8;
            windowKeyAsk.anchor.set(0.5);
            windowKeyAsk.inputEnabled = true;
            windowKeyAsk.scale.set(0.9);
            windowKeyAsk.windowType = 'key_ask';

            game.add.tween(windowKeyAsk).to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            game.add.tween(windowKeyAsk.scale).to({ x: 1, y: 1 }, 500, Phaser.Easing.Elastic.Out, true);
            game.windows.key_ask = windowKeyAsk;

        }
    },

    checkedButton: function (current) {
        current.check = !current.check;
        if (current.checkButton.frame == 0) {
            current.checkButton.frame = 1;
        } else {
            current.checkButton.frame = 0;
        }

        var frame = 1;
        for (key in game.scrollGroup.children) {
            if (game.scrollGroup.children[key].check == false) {
                frame = 0;
            }
        }
        game.checkAllButton.frame = frame;
    },

    checkedAllButton: function (current) {
        if (current.frame == 0) {
            current.frame = 1;
            for (key in this.children) {
                this.children[key].check = true;
                this.children[key].checkButton.frame = 1;
            }
        } else {
            current.frame = 0;
            for (key in this.children) {
                this.children[key].check = false;
                this.children[key].checkButton.frame = 0;
            }
        }
    },

    sendGift: function () {
        friends = [];
        for (key in game.scrollGroup.children) {
            if (game.scrollGroup.children[key].check == true) {
                friends.push(game.scrollGroup.children[key].social_id);
            }
        }
        if (friends.length > 0) {
            game.getServer({social_id: game.global.social_id, method: 'sendGifts', friend_id: friends}, function (data) {
                game.scrollGroup = null;
                game.scrollButton = null;
                game.checkAllButton = null;
                game.add.tween(game.fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
                tween = game.add.tween(game.windows.lives_send).to({ alpha: 0 }, 100, Phaser.Easing.Cubic.In, true);
                game.add.tween(game.windows.lives_send.scale).to({ x: 0.8, y: 0.8 }, 100, Phaser.Easing.Cubic.In, true);
                tween.onComplete.add(function (current) {
                    current.destroy();
                }, this);
            });
            game.windows.lives_send = null;
        } else {
            hint = game.add.text(game.width / 2, game.height / 2, 'Выберите друга', { 'font': 'bold 14px MainFont', fill: '#3e6fbd'});
            hint.alpha = 0;
            hint.anchor.setTo(0.5);

            tween = game.add.tween(hint).to({ alpha: 1 }, 300, Phaser.Easing.Linear.In, true);
            tween.onComplete.add(function (current) {
                tween = game.add.tween(current).to({ alpha: 0 }, 300, Phaser.Easing.Linear.In, true, 1000);
                tween.onComplete.add(function (current) {
                    current.destroy();
                }, this);
            }, this);
        }
    },

    askGift: function () {
        friends = [];
        for (key in game.scrollGroup.children) {
            if (game.scrollGroup.children[key].check == true) {
                friends.push(game.scrollGroup.children[key].social_id);
            }
        }
        if (friends.length > 0) {
            game.getServer({social_id: game.global.social_id, method: 'askGifts', friend_id: friends}, function (data) {
                game.scrollGroup = null;
                game.scrollButton = null;
                game.checkAllButton = null;
                game.add.tween(game.fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
                tween = game.add.tween(game.windows.lives_ask).to({ alpha: 0 }, 100, Phaser.Easing.Cubic.In, true);
                game.add.tween(game.windows.lives_ask.scale).to({ x: 0.8, y: 0.8 }, 100, Phaser.Easing.Cubic.In, true);
                tween.onComplete.add(function (current) {
                    current.destroy();
                }, this);
            });
            game.windows.lives_ask = null;
        } else {
            hint = game.add.text(game.width / 2, game.height / 2, 'Выберите друга', { 'font': 'bold 14px MainFont', fill: '#3e6fbd'});
            hint.alpha = 0;
            hint.anchor.setTo(0.5);

            tween = game.add.tween(hint).to({ alpha: 1 }, 300, Phaser.Easing.Linear.In, true);
            tween.onComplete.add(function (current) {
                tween = game.add.tween(current).to({ alpha: 0 }, 300, Phaser.Easing.Linear.In, true, 1000);
                tween.onComplete.add(function (current) {
                    current.destroy();
                }, this);
            }, this);
        }
    },

    askKey: function () {
        friends = [];
        for (key in game.scrollGroup.children) {
            if (game.scrollGroup.children[key].check == true) {
                friends.push(game.scrollGroup.children[key].social_id);
            }
        }
        if (friends.length > 0) {
            game.getServer({social_id: game.global.social_id, method: 'askKeys', friend_id: friends}, function (data) {
                game.scrollGroup = null;
                game.scrollButton = null;
                game.checkAllButton = null;
                game.add.tween(game.fade).to({alpha: 0}, 200, Phaser.Easing.Back.None, true, 0);
                tween = game.add.tween(game.windows.key_ask).to({ alpha: 0 }, 100, Phaser.Easing.Cubic.In, true);
                game.add.tween(game.windows.key_ask.scale).to({ x: 0.8, y: 0.8 }, 100, Phaser.Easing.Cubic.In, true);
                tween.onComplete.add(function (current) {
                    current.destroy();
                }, this);
            });
            game.windows.key_ask = null;
        } else {
            hint = game.add.text(game.width / 2, game.height / 2, 'Выберите друга', { 'font': 'bold 14px MainFont', fill: '#3e6fbd'});
            hint.alpha = 0;
            hint.anchor.setTo(0.5);

            tween = game.add.tween(hint).to({ alpha: 1 }, 300, Phaser.Easing.Linear.In, true);
            tween.onComplete.add(function (current) {
                tween = game.add.tween(current).to({ alpha: 0 }, 300, Phaser.Easing.Linear.In, true, 1000);
                tween.onComplete.add(function (current) {
                    current.destroy();
                }, this);
            }, this);
        }
    },

    increaseGold: function (increaseGold) {
        game.global.gold += increaseGold;
        game.coinsCount.text = ' ' + game.global.gold + ' ';
    },

    decreaseGold: function (decreaseGold) {
        game.global.gold += decreaseGold;
        game.coinsCount.text = ' ' + game.global.gold + ' ';
    },

    toggleSound: function(button){
        if (!game.global.playSounds) {
            redLineSound.alpha = 0;
            game.getServer({social_id: game.global.social_id, method: 'saveSound', sound: 1}, function (data) {});
        } else {
            redLineSound.alpha = 1;
            game.getServer({social_id: game.global.social_id, method: 'saveSound', sound: 0}, function (data) {});
        }
        game.global.playSounds = !game.global.playSounds;
    },

    toggleMusic: function(button){
        if (!game.global.playMusic) {
            game.musicMenu.play();
            redLineMusic.alpha = 0;
            game.getServer({social_id: game.global.social_id, method: 'saveMusic', music: 1}, function (data) {});
        } else {
            game.musicMenu.stop();
            redLineMusic.alpha = 1;
            game.getServer({social_id: game.global.social_id, method: 'saveMusic', music: 0}, function (data) {});
        }
        game.global.playMusic = !game.global.playMusic;
    },

    shutdown: function () {
        mapLoadCount = 0;
        levelArr = [];
        currentLevelButton = null;
        currentLevelPosY = null;

        game.windows.purchase = null;
        game.windows.lives = null;
        game.windows.lives_send = null;
        game.windows.lives_ask = null;
        game.windows.key_ask = null;
        game.windows.level_start = null;
        game.windows.friend_beaten = null;
        game.windows.message = null;

        currentViral.friend_1 = null;
        currentViral.friend_2 = null;
        currentViral.friend_3 = null;
        currentViral.open_level = null;
        currentViral.window = null;

        userXP = 0;
    }
}