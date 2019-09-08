// <reference path="p5.d.ts" />
/// <reference path="node_modules/@types/p5/lib/addons/p5.sound.d.ts" />
/// <reference path="node_modules/@types/p5/global.d.ts" />

//@ts-check


// Peload assets before the game starts
function preload() {
	soundFormats("mp3");
	backgroundMusic = loadSound("assets/background-loop.mp3");
	lifeLostSound = loadSound("assets/life-lost.mp3");
	startGameSound = loadSound("assets/start-game.mp3");
	levelUpSound = loadSound("assets/level-up-long.mp3");
	gameOverSound = loadSound("assets/game-over.mp3");
	jumpSound = loadSound("assets/jump.mp3");
	collectSound = loadSound("assets/collect-long.mp3");
	plummetSound = loadSound("assets/plummet.mp3");
}

function setup() {
	createCanvas(1920 / 2, 1080 / 2);

	// Set volume of sound effects and background music
	backgroundMusic.setVolume(0.05);
	lifeLostSound.setVolume(0.05);
	startGameSound.setVolume(0.1);
	levelUpSound.setVolume(0.1);
	gameOverSound.setVolume(0.1);
	jumpSound.setVolume(0.1);
	collectSound.setVolume(0.1);
	plummetSound.setVolume(0.1);

	// Initialize the state of the game world
	game = new Game();
	game.startGame();
}

// Main rendering loop
function draw() {

	// Draw blue sky as a background
	background("LightSkyBlue");

	// Play background music loop
	playBackgroundMusic();

	// Draw ground
	drawGround();

	// Draw cloud in the background with parallax
	push();
	translate(game.scrollPos / 2, 0);
	drawClouds();
	pop();

	// Draw mountains with parallax
	push();
	translate(game.scrollPos / 1.5, 0);
	drawMountains();
	pop();

	// Draw mountains with parallax
	push();
	translate(game.scrollPos / 1.2, 0);
	drawTrees();
	pop();

	// Draw interactive objects 
	push();
	translate(game.scrollPos, 0);
	game.drawInteractiveObjects();
	pop();

	// Draw game UI such as scores and messages
	game.drawUI();

	// Draw game character
	character.draw();
}


/**************************************
 Constructor functions for game objects
 **************************************/

// Game world object that controls the game state machine
function Game() {
	this.score = 0; // Count of collected medals
	this.floor = height * 3 / 4; // Position of the ground floor
	this.scrollPos = 0; // Position of the scrolling view
	this.lives = 3; // Player lives
	this.currentLevel; // Active level being played
	this.levels = []; // Array of game levels
	this.levelIndex = 0; // Index of active level array
	this.state = gameState.READY; // Game state


	// Method that initializes game world
	this.startGame = function () {
		// Variable to control the background scrolling
		this.scrollPos = 0;
		this.state = gameState.READY;
		this.score = 0;
		this.lives = 3;
		elapsed = 0;

		character = new Character(200, game.floor);

		// Boolean variables to control the movement of the game character

		gameOverSoundPlayed = false;
		levelUpSoundPlayed = false;

		// Initialize levels 

		this.levels.push(this.setupLevel1());
		this.levels.push(this.setupLevel2());
		this.levels.push(this.setupLevel3());
		this.levels.push(this.setupLevel4());
		this.levels.push(this.setupLevel5());

		this.currentLevel = this.levels[0];

		// Initialise arrays of scenery objects
		trees = [{
				x: -520,
				height: 120,
				facing: 'L'
			},
			{
				x: -150,
				height: 150,
				facing: 'L'
			},
			{
				x: 100,
				height: 150,
				facing: 'R'
			},
			{
				x: 200,
				height: 120,
				facing: 'R'
			},
			{
				x: 500,
				height: 150,
				facing: 'L'
			},
			{
				x: 1000,
				height: 150,
				facing: 'R'
			},
			{
				x: 1100,
				height: 150,
				facing: 'L'
			},
			{
				x: 1300,
				height: 150,
				facing: 'R'
			},
			{
				x: 1500,
				height: 150,
				facing: 'L'
			}
		];

		clouds = [{
				x: -100,
				y: 100,
				width: 80
			},
			{
				x: -600,
				y: 120,
				width: 120
			},
			{
				x: -800,
				y: 150,
				width: 150
			},
			{
				x: 100,
				y: 100,
				width: 80
			},
			{
				x: 600,
				y: 120,
				width: 120
			},
			{
				x: 800,
				y: 150,
				width: 150
			},
			{
				x: 1100,
				y: 100,
				width: 80
			},
			{
				x: 1600,
				y: 120,
				width: 120
			},
			{
				x: 1800,
				y: 150,
				width: 150
			}
		];

		mountains = [{
				x: -20,
				height: 180,
				width: 360
			},
			{
				x: -300,
				height: 50,
				width: 180
			},
			{
				x: -500,
				height: 120,
				width: 360
			},
			{
				x: -800,
				height: 280,
				width: 400
			},
			{
				x: 20,
				height: 180,
				width: 360
			},
			{
				x: 300,
				height: 50,
				width: 180
			},
			{
				x: 500,
				height: 120,
				width: 360
			},
			{
				x: 800,
				height: 280,
				width: 400
			},
			{
				x: 1020,
				height: 180,
				width: 360
			},
			{
				x: 1300,
				height: 50,
				width: 180
			},
			{
				x: 1500,
				height: 120,
				width: 360
			},
			{
				x: 1800,
				height: 280,
				width: 400
			}
		];

	}

	// Method that starts a level
	this.startLevel = function () {
		this.state = gameState.RUNNING;
		this.scrollPos = 0;
		this.currentLevel.flagpole.isReached = false;
		character.reset(200, game.floor);
		gameOverSoundPlayed = false;
		levelUpSoundPlayed = false;

		if (!plummetSound.isPlaying() && !lifeLostSound.isPlaying()) {
			startGameSound.play();
		}
	}

	// Method that advances to next level 
	this.advanceToNextLevel = function () {
		if (this.levelIndex + 1 < this.levels.length) {
			this.levelIndex++;
			this.currentLevel = this.levels[this.levelIndex];
			this.startLevel();
		} else {
			// If there are no more levels, finish the game
			this.state = gameState.GAME_FINISHED;
		}
	}

	this.gameOver = function () {
		this.state = gameState.GAME_OVER;
		if (!gameOverSound.isPlaying() && !gameOverSoundPlayed) {
			gameOverSound.play();
			gameOverSoundPlayed = true;
		}
	}

	this.onKeyPressed = function () {
		console.log("game.onKeyPressed called");

		// If statements to control the animation of the character 
		// when keys are pressed
		const SPACE = 32;

		switch (keyCode) {
			case SPACE:
				if (this.state == gameState.READY) {
					this.startLevel();
					return;
				}
				if (this.state == gameState.LEVEL_FINISHED) {
					this.advanceToNextLevel();
					return;
				}
				if (this.state == gameState.GAME_OVER ||
					this.state == gameState.GAME_FINISHED) {
					this.startGame();
					return;
				}
				if (game.floor == character.pos.y || character.isOnPlatform) {
					jumpSound.play();
					character.jump();
				}
				break;
			case LEFT_ARROW:
				character.isMovingLeft = true;
				break;
			case RIGHT_ARROW:
				character.isMovingRight = true;
				break;
		}
	}

	this.onKeyReleased = function () {
		console.log("game.onKeyReleased called");
		// if statements to control the animation of the character 
		// when keys are released

		if (keyCode == LEFT_ARROW) {
			character.isMovingLeft = false;
		} else if (keyCode == RIGHT_ARROW) {
			character.isMovingRight = false;
		}
	}

	this.drawInteractiveObjects = function () {
		this.currentLevel.drawPlatforms();
		this.currentLevel.drawCanyons();
		this.currentLevel.drawCollectables();
		this.currentLevel.drawFlagpole();
		this.currentLevel.drawEnemies();
	}

	this.drawUI = function () {
		// Draw gridlines to help position the elements
		if (DEVELOPER_MODE) {
			this.drawGridlines();
		}

		// Draw current game score
		this.drawGameScore();

		// Draw ready to start message
		if (this.state == gameState.READY) {
			this.drawMessage("Ready when you are.\r\nPress space to start.");
			return;
		}
		// Draw game over message if player run out of lives
		if (this.state == gameState.GAME_OVER) {
			this.drawMessage("Game over.\r\nPress space to continue.");
			return;
		}

		// Draw game finished  message
		if (this.state == gameState.GAME_FINISHED) {
			this.drawMessage(`Congratulations!\r\nYou collected ${this.score} medals in ${elapsed} seconds.`);
			return;
		}

		// Draw level complete message if flagpole is reached
		if (this.state == gameState.LEVEL_FINISHED) {
			this.drawMessage("Level complete.\r\nPress space to continue.");
			return;
		}


	}

	/************************
	 Functions that render UI
	 ************************/

	this.drawGameScore = function () {
		fill(255);
		textSize(20);
		if (this.state == gameState.RUNNING) {
			if (frameCount % 60 == 0) {
				elapsed++;
			}
		}
		text(`${this.currentLevel.title}, Score: ${this.score}`, 20, 40);
		text(`${elapsed}`, 20, 65);
		// Draw remaining lives as guardsman icons
		var offset = width * 2 - 170;
		for (var i = 0; i < game.lives; i++) {
			this.drawCharacterIcon(offset + (i) * 55, 120);
		}
	}

	this.drawCharacterIcon = function (x, y) {
		push();
		// Scale it to 50% of game character size
		scale(0.5);
		// Move origin
		translate(x, y);
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(0, -30, 29);
		//eyes
		fill(0);
		noStroke();
		ellipse(-7, -30, 5);
		ellipse(7, -30, 5);
		//lips
		stroke(0);
		strokeWeight(2);
		line(-5, -22, 5, -22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(-15, -30);
		curveVertex(-20, -30);
		curveVertex(-20, -70);
		curveVertex(20, -70);
		curveVertex(20, -30);
		curveVertex(15, -30);
		endShape();
		pop();
	}

	this.drawMessage = function (message) {
		push();
		textAlign(CENTER);
		textSize(40);
		text(message, width / 2, height / 3 + 30);
		pop();
		character.draw();
	}

	this.drawGridlines = function () {
		push();
		translate(this.scrollPos, 0);
		for (var i = -500; i < 2000; i += 50) {
			strokeWeight(0.5);
			stroke("LightGray");
			line(i, 0, i, height);
			noStroke();
			fill(255);
			textSize(10);
			text(i, i - 10, 10);
		}
		pop();
	}

	// Configuration of Level 1 - just canyons and collectables
	this.setupLevel1 = function () {
		var l = new Level("Level 1", 1920);

		l.canyons.push(new Canyon(-350, 300));
		l.canyons.push(new Canyon(350, 120));
		l.canyons.push(new Canyon(750, 150));
		l.canyons.push(new Canyon(1550, 100));
		l.canyons.push(new Canyon(1800, 100));

		l.collectables.push(new Collectable(-100, 350));
		l.collectables.push(new Collectable(600, 350));
		l.collectables.push(new Collectable(820, 370));
		l.collectables.push(new Collectable(1200, 400));
		l.collectables.push(new Collectable(1500, 370));
		l.collectables.push(new Collectable(1650, 370));

		return l;
	}

	// Configuration of Level 2 - adding enemies
	this.setupLevel2 = function () {
		var l = new Level("Level 2", 1920);

		this.flagpole = new Flagpole(1920);

		l.canyons.push(new Canyon(-350, 300));
		l.canyons.push(new Canyon(350, 120));
		l.canyons.push(new Canyon(750, 150));
		l.canyons.push(new Canyon(1550, 100));
		l.canyons.push(new Canyon(1800, 100));

		l.collectables.push(new Collectable(-100, 350));
		l.collectables.push(new Collectable(600, 350));
		l.collectables.push(new Collectable(820, 370));
		l.collectables.push(new Collectable(1200, 400));
		l.collectables.push(new Collectable(1500, 370));
		l.collectables.push(new Collectable(1650, 370));

		l.enemies.push(new Enemy(450, game.floor - 5, 200));
		l.enemies.push(new Enemy(950, game.floor - 5, 250));
		l.enemies.push(new Enemy(1200, game.floor - 5, 250, -1));
		l.enemies.push(new Enemy(1600, game.floor - 5, 150));

		return l;
	}

	// Configuration of Level 3 - adding platforms
	this.setupLevel3 = function () {
		var l = new Level("Level 3", 1920);

		this.flagpole = new Flagpole(1920);

		l.canyons.push(new Canyon(-350, 300));
		l.canyons.push(new Canyon(350, 120));
		l.canyons.push(new Canyon(750, 200));
		l.canyons.push(new Canyon(1550, 100));
		l.canyons.push(new Canyon(1800, 100));

		l.collectables.push(new Collectable(-100, 350));
		l.collectables.push(new Collectable(600, 350));
		l.collectables.push(new Collectable(600, 150));
		l.collectables.push(new Collectable(820, 370));
		l.collectables.push(new Collectable(1200, 400));
		l.collectables.push(new Collectable(1200, 150));
		l.collectables.push(new Collectable(1500, 370));
		l.collectables.push(new Collectable(1650, 370));

		l.platforms.push(new Platform(450, 150, 1));
		l.platforms.push(new Platform(600, 200, 2));
		l.platforms.push(new Platform(750, 100, 1));
		l.platforms.push(new Platform(1050, 200, 1));
		l.platforms.push(new Platform(1200, 100, 2));
		l.platforms.push(new Platform(1350, 200, 1));

		l.enemies.push(new Enemy(450, game.floor - 5, 200));
		l.enemies.push(new Enemy(500, game.floor - 180, 200));
		l.enemies.push(new Enemy(950, game.floor - 5, 250));
		l.enemies.push(new Enemy(1200, game.floor - 5, 250, -1));
		l.enemies.push(new Enemy(1600, game.floor - 5, 150));

		return l;
	}

	// Configuration of Level 4 - moving platforms
	this.setupLevel4 = function () {
		var l = new Level("Level 4", 1920);

		this.flagpole = new Flagpole(1920);

		l.canyons.push(new Canyon(-350, 300));
		l.canyons.push(new Canyon(350, 120));
		l.canyons.push(new Canyon(750, 200));
		l.canyons.push(new Canyon(1550, 100));
		l.canyons.push(new Canyon(1800, 100));

		l.collectables.push(new Collectable(-100, 350));
		l.collectables.push(new Collectable(600, 350));
		l.collectables.push(new Collectable(600, 150));
		l.collectables.push(new Collectable(820, 370));
		l.collectables.push(new Collectable(1200, 400));
		l.collectables.push(new Collectable(1200, 150));
		l.collectables.push(new Collectable(1500, 370));
		l.collectables.push(new Collectable(1650, 370));

		l.platforms.push(new Platform(450, 150, 1, 75));
		l.platforms.push(new Platform(600, 200, 2, 100));
		l.platforms.push(new Platform(750, 100, 1, 50));
		l.platforms.push(new Platform(1050, 200, 1, 100));
		l.platforms.push(new Platform(1200, 100, 2, 50));
		l.platforms.push(new Platform(1350, 200, 1, 100));

		l.enemies.push(new Enemy(450, game.floor - 5, 200));
		l.enemies.push(new Enemy(500, game.floor - 180, 200));
		l.enemies.push(new Enemy(950, game.floor - 5, 250));
		l.enemies.push(new Enemy(1200, game.floor - 5, 250, -1));
		l.enemies.push(new Enemy(1600, game.floor - 5, 150));

		return l;
	}

	// Configuration of Level 5 - moving medals
	this.setupLevel5 = function () {
		var l = new Level("Level 5", 1920);

		this.flagpole = new Flagpole(1920);

		l.canyons.push(new Canyon(-350, 300));
		l.canyons.push(new Canyon(350, 120));
		l.canyons.push(new Canyon(750, 200));
		l.canyons.push(new Canyon(1550, 100));
		l.canyons.push(new Canyon(1800, 100));

		l.collectables.push(new Collectable(-100, 350, round(random(90, 110))));
		l.collectables.push(new Collectable(600, 350, round(random(90, 110))));
		l.collectables.push(new Collectable(600, 150, round(random(90, 110))));
		l.collectables.push(new Collectable(820, 370, round(random(90, 110))));
		l.collectables.push(new Collectable(1200, 400, round(random(90, 110))));
		l.collectables.push(new Collectable(1200, 150, round(random(90, 110))));
		l.collectables.push(new Collectable(1500, 370, round(random(90, 110))));
		l.collectables.push(new Collectable(1650, 370, round(random(90, 110))));

		l.platforms.push(new Platform(450, 150, 1, round(random(65, 75))));
		l.platforms.push(new Platform(600, 200, 2, round(random(80, 90))));
		l.platforms.push(new Platform(750, 100, 1, 50));
		l.platforms.push(new Platform(1050, 200, 1, round(random(90, 100))));
		l.platforms.push(new Platform(1200, 100, 2, 45));
		l.platforms.push(new Platform(1350, 200, 1, round(random(90, 100))));

		l.enemies.push(new Enemy(450, 400, round(random(195, 205))));
		l.enemies.push(new Enemy(500, 225, round(random(195, 205))));
		l.enemies.push(new Enemy(950, 400, round(random(245, 255))));
		l.enemies.push(new Enemy(1200, 400, round(random(245, 255)), -1));
		l.enemies.push(new Enemy(1600, 400, round(random(145, 155))));

		return l;
	}
}


function Level(title, flagpolePosition) {
	this.flagpole = new Flagpole(flagpolePosition);
	this.enemies = [];
	this.platforms = [];
	this.canyons = [];
	this.collectables = [];
	this.title = title;


	/*************************************** 
	 Methods that render interactive objects
	 ***************************************/

	this.drawPlatforms = function () {
		for (var i = 0; i < this.platforms.length; i++) {
			this.platforms[i].update();
			this.platforms[i].draw();
		}
	}

	this.drawCanyons = function () {
		character.isOverCanyon = false;
		for (var i = 0; i < this.canyons.length; i++) {
			this.canyons[i].check();
			this.canyons[i].draw();
			character.isOverCanyon = character.isOverCanyon ||
				this.canyons[i].inCanyon;
		}
	}

	this.drawCollectables = function () {
		for (var i = 0; i < this.collectables.length; i++) {
			if (!this.collectables[i].isCollected) {
				this.collectables[i].update();
				this.collectables[i].checkContact();
				this.collectables[i].draw();
			}
		}
	}

	this.drawEnemies = function () {
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].draw();
			this.enemies[i].checkContact(character.worldX, character.pos.y);
			if (this.enemies[i].inContact) {
				character.die();
				break;
			}
		}
	}

	this.drawFlagpole = function () {
		// Check if the flagpole is reached
		if (!this.flagpole.isReached) {
			this.flagpole.check();
		}
		// Draw the flagpole
		this.flagpole.draw();

		if (game.state == gameState.RUNNING) {
			game.state = this.flagpole.isReached ? gameState.LEVEL_FINISHED : game.state;
		}

	}
}


function Character(x, y) {
	// Character screen x and y position as a vector
	this.pos = createVector(x, y);
	this.worldX = x - game.scrollPos;

	// Game control variables
	this.isMovingLeft = false;
	this.isMovingRight = false;
	this.isFalling = false;
	this.isPlummeting = false;
	this.isOverCanyon = false;
	this.isInContactWithEnemy = false;
	this.isOnPlatform = false;

	this.jump = function () {
		this.pos.y -= 120;
	}

	this.reset = function (x, y) {
		this.pos.x = x;
		this.pos.y = y;
		this.worldX = x - game.scrollPos;
		this.isMovingLeft = false;
		this.isMovingRight = false;
		this.isFalling = false;
		this.isPlummeting = false;
		this.isOverCanyon = false;
		this.isInContactWithEnemy = false;
		this.isOnPlatform = false;
	}

	this.update = function () {

		if (game.state == gameState.GAME_OVER ||
			game.state == gameState.LEVEL_FINISHED) {
			this.isPlummeting == false;
			this.isMovingLeft == false;
			this.isMovingRight == false;
			return;
		}
		// Detect when character plummets into the canyon
		this.isPlummeting = this.isOverCanyon && this.pos.y >= game.floor;

		// Logic to make the game character move or the background scroll
		// No movement when plummeting
		if (!this.isPlummeting) {
			// If the left arrow key is pressed
			if (this.isMovingLeft) {
				// Move the game character if we did not step into 
				// the first 20% of the canvas width
				if (this.pos.x > width * 0.2) {
					this.pos.x -= 5;
				} else {
					// Scroll the background to the right when we reach 
					// the first 20% of canvas width
					game.scrollPos += 5;
				}
			}
			// If the right arrow key is pressed
			if (this.isMovingRight) {
				// Move the game character if we did not step into 
				// the first 20% of the canvas width
				if (this.pos.x < width * 0.8) {
					this.pos.x += 5;
				} else {
					// Scroll the background to the left when we reach 
					// the first 20% of canvas width
					game.scrollPos -= 5;
				}
			}
		}

		// Logic to make the game character rise and fall

		this.isFalling = this.pos.y < game.floor;
		// Add gravity when character is above floor
		if (this.isFalling) {
			//Check if the game character is on one of the platforms
			for (var i = 0; i < game.currentLevel.platforms.length; i++) {
				this.isOnPlatform = game.currentLevel.platforms[i].checkContact(this.worldX, this.pos.y);
				if (this.isOnPlatform) {
					break;
				}
			}
			// Fall if not standing on platform
			if (this.isOnPlatform) {
				this.isFalling = false;
			} else {
				this.pos.y += 4;
			}
		}

		// If character is plummeting it falls faster
		if (this.isPlummeting) {
			this.pos.y += 6;
		}

		// If the character falls off the screen it dies
		if (this.pos.y > height) {
			this.die();
		}

		// Update world position of character for collision detection
		this.worldX = this.pos.x - game.scrollPos;

	}

	this.die = function () {
		game.lives--;
		if (!lifeLostSound.isPlaying()) {
			lifeLostSound.play();
		}
		if (game.lives > 0) {
			game.startLevel();
		} else {
			game.gameOver();
		}
	}

	this.draw = function () {
		// Render diffrerent game character sprites
		if (this.isPlummeting) {
			this.plummetingUpsideDown();
			if (!plummetSound.isPlaying() && game.lives > 0) {
				plummetSound.play();
			}
		} else if (this.isMovingLeft && this.isFalling) {
			this.jumpingLeft();
		} else if (this.isMovingRight && this.isFalling) {
			this.jumpingRight();
		} else if (this.isMovingLeft) {
			this.walkingLeft();
		} else if (this.isMovingRight) {
			this.walkingRight();
		} else if (this.isFalling) {
			this.jumpingFacingForwards();
		} else {
			this.standingFacingForwards();
		}
		this.update();
	}

	this.standingFacingForwards = function () {
		// trunk
		fill(207, 20, 43);
		rect(this.pos.x - 10, this.pos.y - 35, 20, 30);
		// hands
		fill(0);
		rect(this.pos.x - 15, this.pos.y - 20, 5, 14, 2);
		rect(this.pos.x + 10, this.pos.y - 20, 5, 14, 2);
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(this.pos.x, this.pos.y - 30, 29);
		//eyes
		fill(0);
		noStroke();
		ellipse(this.pos.x - 7, this.pos.y - 30, 5);
		ellipse(this.pos.x + 7, this.pos.y - 30, 5);
		//lips
		stroke(0);
		strokeWeight(2);
		line(this.pos.x - 5, this.pos.y - 22, this.pos.x + 5, this.pos.y - 22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(this.pos.x - 15, this.pos.y - 30);
		curveVertex(this.pos.x - 20, this.pos.y - 30);
		curveVertex(this.pos.x - 20, this.pos.y - 70);
		curveVertex(this.pos.x + 20, this.pos.y - 70);
		curveVertex(this.pos.x + 20, this.pos.y - 30);
		curveVertex(this.pos.x + 15, this.pos.y - 30);
		endShape();
		// boots
		fill(0);
		rect(this.pos.x - 10, this.pos.y - 5, 8, 8);
		rect(this.pos.x + 2, this.pos.y - 5, 8, 8);
	}

	this.plummetingUpsideDown = function () {
		push();
		// Move origin to the center of the game character
		// and rotate by 180 degrees
		translate(this.pos.x, this.pos.y);

		// trunk
		fill(255, 0, 0);
		rect(-10, -35, 20, 30);
		// hands
		fill(0);
		push();
		translate(-15, -20);
		translate(6, 2);
		rotate(PI / 2);
		rect(0, 0, 5, 14, 2);
		pop();
		push();
		translate(10, -20);
		translate(-1, 7);
		rotate(-PI / 2);
		rect(0, 0, 5, 14, 2);
		pop();
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(0, -30, 29);
		//eyes
		fill(0);
		noStroke();
		ellipse(-7, -30, 5);
		ellipse(7, -30, 5);
		//lips
		stroke(0);
		strokeWeight(2);
		line(-5, -22, 5, -22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(15, -30);
		curveVertex(-20, -30);
		curveVertex(-20, -65);
		curveVertex(20, -65);
		curveVertex(20, -30);
		curveVertex(15, -30);
		endShape();
		// boots
		fill(0);
		rect(-10, -10, 8, 8);
		rect(2, -8, 8, 8);
		pop();
	}

	this.jumpingFacingForwards = function () {
		// trunk
		fill(255, 0, 0);
		rect(this.pos.x - 10, this.pos.y - 35, 20, 30);
		// hands
		fill(0);
		push();
		translate(this.pos.x - 15, this.pos.y - 20);
		translate(6, 2);
		rotate(PI / 2);
		rect(0, 0, 5, 14, 2);
		pop();
		push();
		translate(this.pos.x + 10, this.pos.y - 20);
		translate(-1, 7);
		rotate(-PI / 2);
		rect(0, 0, 5, 14, 2);
		pop();
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(this.pos.x, this.pos.y - 30, 29);
		//eyes
		fill(0);
		noStroke();
		ellipse(this.pos.x - 7, this.pos.y - 30, 5);
		ellipse(this.pos.x + 7, this.pos.y - 30, 5);
		//lips
		stroke(0);
		strokeWeight(2);
		line(this.pos.x - 5, this.pos.y - 22, this.pos.x + 5, this.pos.y - 22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(this.pos.x - 15, this.pos.y - 30);
		curveVertex(this.pos.x - 20, this.pos.y - 30);
		curveVertex(this.pos.x - 20, this.pos.y - 65);
		curveVertex(this.pos.x + 20, this.pos.y - 65);
		curveVertex(this.pos.x + 20, this.pos.y - 30);
		curveVertex(this.pos.x + 15, this.pos.y - 30);
		endShape();
		// boots
		fill(0);
		rect(this.pos.x - 10, this.pos.y - 10, 8, 8);
		rect(this.pos.x + 2, this.pos.y - 8, 8, 8);
	}

	this.walkingLeft = function () {
		fill(0);
		// forward hand
		push();
		translate(this.pos.x - 15, this.pos.y - 20);
		translate(9, 2);
		rotate(PI / 6);
		rect(0, 0, 5, 14, 2);
		pop();
		// trunk leaning forward
		push();
		translate(this.pos.x - 8, this.pos.y - 20);
		translate(1, 4);
		rotate(-PI / 8);
		fill(255, 0, 0);
		rect(0, 0, 15, 16);
		pop();
		// back hand
		push();
		translate(this.pos.x + 10, this.pos.y - 20);
		translate(-5, 6);
		rotate(-PI / 2);
		rect(0, 0, 5, 14, 2);
		pop();
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(this.pos.x, this.pos.y - 30, 29);
		// eyes
		fill(0);
		noStroke();
		ellipse(this.pos.x - 7, this.pos.y - 30, 5);
		// lips
		stroke(0);
		strokeWeight(2);
		line(this.pos.x - 10, this.pos.y - 22, this.pos.x - 3, this.pos.y - 22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(this.pos.x - 15, this.pos.y - 31);
		curveVertex(this.pos.x - 20, this.pos.y - 31);
		curveVertex(this.pos.x - 12, this.pos.y - 70);
		curveVertex(this.pos.x + 23, this.pos.y - 65);
		curveVertex(this.pos.x + 20, this.pos.y - 26);
		curveVertex(this.pos.x + 15, this.pos.y - 26);
		endShape();
		// back leg
		push();
		translate(this.pos.x + 6, this.pos.y - 5);
		translate(1, 1);
		rotate(-PI / 3);
		rect(0, 0, 8, 8);
		pop();
		// forward leg
		push();
		translate(this.pos.x - 6, this.pos.y - 5);
		translate(4, 1);
		rect(0, 0, 8, 7);
		pop();
	}

	this.walkingRight = function () {
		fill(0);
		// forward hand
		push();
		translate(this.pos.x + 10, this.pos.y - 20);
		translate(-6, 5);
		rotate(-PI / 6);
		rect(0, 0, 5, 14, 2);
		pop();
		// trunk leaning forward
		push();
		translate(this.pos.x - 8, this.pos.y - 20);
		translate(3, -2);
		rotate(PI / 8);
		fill(255, 0, 0);
		rect(0, 0, 15, 16);
		pop();
		// back hand
		push();
		translate(this.pos.x - 15, this.pos.y - 20);
		translate(10, 1);
		rotate(PI / 2);
		rect(0, 0, 5, 14, 2);
		pop();
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(this.pos.x, this.pos.y - 30, 29);
		// eyes
		fill(0);
		noStroke();
		ellipse(this.pos.x + 7, this.pos.y - 30, 5);
		// lips
		stroke(0);
		strokeWeight(2);
		line(this.pos.x + 3, this.pos.y - 22, this.pos.x + 10, this.pos.y - 22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(this.pos.x - 15, this.pos.y - 26);
		curveVertex(this.pos.x - 20, this.pos.y - 26);
		curveVertex(this.pos.x - 21, this.pos.y - 65);
		curveVertex(this.pos.x + 14, this.pos.y - 70);
		curveVertex(this.pos.x + 20, this.pos.y - 31);
		curveVertex(this.pos.x + 15, this.pos.y - 31);
		endShape();
		// back leg
		push();
		translate(this.pos.x - 6, this.pos.y - 5);
		translate(-3, -6);
		rotate(PI / 3);
		rect(0, 0, 8, 8);
		pop();
		// forward leg
		push();
		translate(this.pos.x - 6, this.pos.y - 5);
		translate(2, 1);
		rect(0, 0, 8, 7);
		pop();
	}

	this.jumpingRight = function () {
		fill(0);
		// forward hand
		push();
		translate(this.pos.x + 10, this.pos.y - 20);
		translate(-15, 0);
		rotate(PI / 3);
		rect(0, 0, 5, 14, 2);
		pop();
		// forward leg
		push();
		translate(this.pos.x + 6, this.pos.y - 5);
		translate(-8, 1);
		rotate(-PI / 8);
		rect(0, 0, 8, 6);
		pop();
		// trunk leaning forward
		push();
		translate(this.pos.x - 8, this.pos.y - 20);
		translate(3, -2);
		rotate(PI / 8);
		fill(255, 0, 0);
		rect(0, 0, 15, 16);
		pop();
		// back hand
		push();
		translate(this.pos.x - 15, this.pos.y - 20);
		translate(15, 5);
		rotate(-PI / 3);
		rect(0, 0, 5, 14, 2);
		pop();
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(this.pos.x, this.pos.y - 30, 29);
		// eyes
		fill(0);
		noStroke();
		ellipse(this.pos.x + 7, this.pos.y - 30, 5);
		// lips
		stroke(0);
		strokeWeight(2);
		line(this.pos.x + 3, this.pos.y - 22, this.pos.x + 10, this.pos.y - 22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(this.pos.x - 15, this.pos.y - 26);
		curveVertex(this.pos.x - 20, this.pos.y - 26);
		curveVertex(this.pos.x - 21, this.pos.y - 60);
		curveVertex(this.pos.x + 14, this.pos.y - 67);
		curveVertex(this.pos.x + 20, this.pos.y - 31);
		curveVertex(this.pos.x + 15, this.pos.y - 31);
		endShape();
		// back leg
		push();
		translate(this.pos.x - 6, this.pos.y - 5);
		translate(-4, -2.5);
		rotate(0);
		fill(0);
		rect(0, 0, 8, 6);
		pop();
	}

	this.jumpingLeft = function () {
		fill(0);
		// back hand
		push();
		translate(this.pos.x + 10, this.pos.y - 20);
		translate(-6, 5);
		rotate(-PI / 3);
		rect(0, 0, 5, 14, 2);
		pop();
		// forward leg
		push();
		translate(this.pos.x - 6, this.pos.y - 5);
		translate(3, -2.5);
		rotate(PI / 8);
		rect(0, 0, 8, 6);
		pop();
		// trunk leaning forward
		push();
		translate(this.pos.x - 8, this.pos.y - 20);
		translate(1, 4);
		rotate(-PI / 8);
		fill(255, 0, 0);
		rect(0, 0, 15, 16);
		pop();
		// forward hand
		push();
		translate(this.pos.x + 10, this.pos.y - 20);
		translate(-11, 2);
		rotate(PI / 3);
		rect(0, 0, 5, 14, 2);
		pop();
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(this.pos.x, this.pos.y - 30, 29);
		// eyes
		fill(0);
		noStroke();
		ellipse(this.pos.x - 7, this.pos.y - 30, 5);
		// lips
		stroke(0);
		strokeWeight(2);
		line(this.pos.x - 10, this.pos.y - 22, this.pos.x - 3, this.pos.y - 22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(this.pos.x - 15, this.pos.y - 31);
		curveVertex(this.pos.x - 20, this.pos.y - 31);
		curveVertex(this.pos.x - 12, this.pos.y - 67);
		curveVertex(this.pos.x + 23, this.pos.y - 60);
		curveVertex(this.pos.x + 20, this.pos.y - 26);
		curveVertex(this.pos.x + 15, this.pos.y - 26);
		endShape();
		// back leg
		fill(0);
		push();
		translate(this.pos.x + 6, this.pos.y - 5);
		translate(-2, -2);
		rotate(0);
		rect(0, 0, 8, 6);
		pop();
	}

	this.standingFacingForwards = function () {
		// trunk
		fill(255, 0, 0);
		rect(this.pos.x - 10, this.pos.y - 35, 20, 30);
		// hands
		fill(0);
		rect(this.pos.x - 15, this.pos.y - 20, 5, 14, 2);
		rect(this.pos.x + 10, this.pos.y - 20, 5, 14, 2);
		// head
		fill(200, 150, 150);
		stroke(0);
		strokeWeight(2);
		ellipse(this.pos.x, this.pos.y - 30, 29);
		// eyes
		fill(0);
		noStroke();
		ellipse(this.pos.x - 7, this.pos.y - 30, 5);
		ellipse(this.pos.x + 7, this.pos.y - 30, 5);
		// lips
		stroke(0);
		strokeWeight(2);
		line(this.pos.x - 5, this.pos.y - 22, this.pos.x + 5, this.pos.y - 22);
		// hat
		fill(0);
		noStroke();
		strokeWeight(1);
		beginShape();
		curveVertex(this.pos.x - 15, this.pos.y - 30);
		curveVertex(this.pos.x - 20, this.pos.y - 30);
		curveVertex(this.pos.x - 20, this.pos.y - 70);
		curveVertex(this.pos.x + 20, this.pos.y - 70);
		curveVertex(this.pos.x + 20, this.pos.y - 30);
		curveVertex(this.pos.x + 15, this.pos.y - 30);
		endShape();

		// legs
		fill(0);
		rect(this.pos.x - 10, this.pos.y - 5, 8, 8);
		rect(this.pos.x + 2, this.pos.y - 5, 8, 8);
	}

}

function Enemy(x, y, range, startingDirection = 1) {
	this.x = x;
	this.y = y;
	this.range = range;
	this.currentX = x;
	this.inc = startingDirection;
	this.inContact = false;

	if (startingDirection == -1) {
		this.currentX = x + range;
	}


	this.update = function () {
		this.currentX += this.inc;
		if (this.currentX >= this.x + this.range) {
			this.inc = -1;
		} else if (this.currentX < this.x) {
			this.inc = 1;
		}
	}

	this.draw = function () {
		this.update();
		push();
		textAlign(CENTER);
		textSize(50);
		var emoji = "👻"; // ghost
		text(emoji, this.currentX, this.y - 5);
		pop();
	}

	this.checkContact = function (gc_x, gc_y) {
		var d = dist(gc_x, gc_y - 30, this.currentX, this.y - 30);
		if (d < 48) {
			this.inContact = true;
			return true;
		}
		this.inContact = false;
		return false;
	}
}

function Canyon(x, width) {
	this.x = x;
	this.width = width;
	this.inCanyon = false;

	this.draw = function () {
		var floor = game.floor;
		var depth = height - floor + 40;
		var half = width / 2;
		var soil = color(79, 63, 33);
		var darkSoil = lerpColor(soil, color(0), 0.6);

		push();
		//right cliff
		fill(soil);
		beginShape();
		vertex(this.x + half, floor);
		vertex(this.x + half, height);
		vertex(this.x + half + 20, height);
		endShape(CLOSE);
		//left cliff
		beginShape();
		vertex(this.x - half, floor);
		vertex(this.x - half, height);
		vertex(this.x - half - 20, height);
		endShape(CLOSE);
		// bottom
		fill(soil);
		rect(x - half, floor + depth - 10, this.width, height - depth);
		// void
		fill(darkSoil);
		rect(x - half, floor, this.width, depth, 0, 0, 10, 10);
		pop();
	}

	this.check = function () {
		var leftWall = this.x - this.width / 2;
		var rightWall = this.x + this.width / 2;

		// Detect if character is within the canyon walls
		this.inCanyon =
			(character.worldX - 10 > leftWall) &&
			(character.worldX + 10 < rightWall);
	}
}

function Collectable(x, y, range = 0, startingDirection = 1) {
	this.x = x;
	this.y = y;
	this.size = 30;
	this.isCollected = false;
	this.range = range;
	this.currentX = x;
	this.inc = startingDirection;

	if (startingDirection == -1) {
		this.currentX = x + this.range;
	}

	this.update = function () {
		if (this.range > 0) {
			if (this.range > 0) {
				this.currentX += this.inc;
				if (this.currentX >= this.x + this.range) {
					this.inc = -1;
				} else if (this.currentX < this.x) {
					this.inc = 1;
				}
			}
		}
	}

	this.draw = function () {
		var x = this.currentX;
		var y = this.y;
		var size = this.size;

		push();
		textAlign(CENTER);
		textSize(size * 1.3);
		var emoji = "\uD83C\uDF96"; // medal
		text(emoji, x, y - 15);
		pop();
	}

	this.checkContact = function () {
		// Game characted collects the item if close enough
		const d =
			dist(
				character.worldX, character.pos.y - 30,
				this.currentX, this.y - 15);
		if (d < 30) {
			this.isCollected = true;
			game.score++;
			collectSound.play();
		}
	}
}

function Platform(x, length, level = 1, range = 0, startingDirection = 1) {
	this.x = x;
	this.y = game.floor - level * 80 - 10;
	this.length = length;
	this.range = range;
	this.currentX = x;
	this.inc = startingDirection;



	this.update = function () {
		if (this.range > 0) {
			this.currentX += this.inc;
			if (this.currentX >= this.x + this.range) {
				this.inc = -1;
			} else if (this.currentX < this.x - this.range) {
				this.inc = 1;
			}
		}
	}

	this.draw = function () {
		push();
		strokeWeight(0.5);
		stroke(0, 140, 250);
		fill(0, 36, 125);
		rectMode(CENTER);
		rect(this.currentX, this.y, this.length, 20, 1);

		switch (level) {
			case 1:
				noStroke();
				fill(207, 20, 43);
				rect(this.x, this.y, 8, 20);
				fill(220);
				rect(this.x - 8, this.y, 8, 20);
				fill(220);
				rect(this.x + 8, this.y, 8, 20);
				break;
			case 2:
				noStroke();
				fill(220);
				rect(this.x, this.y, 8, 20);
				rect(this.x - 16, this.y, 8, 20);
				rect(this.x + 16, this.y, 8, 20);
				fill(207, 20, 43);
				rect(this.x - 8, this.y, 8, 20);
				rect(this.x + 8, this.y, 8, 20);
				break;
			case 3:
				noStroke();
				fill(207, 20, 43);
				rect(this.x, this.y, 8, 20);
				rect(this.x - 16, this.y, 8, 20);
				rect(this.x + 16, this.y, 8, 20);
				fill(220);
				rect(this.x - 8, this.y, 8, 20);
				rect(this.x + 8, this.y, 8, 20);
				rect(this.x - 24, this.y, 8, 20);
				rect(this.x + 24, this.y, 8, 20);
				break;
			default:
		}
		pop();
	}
	this.checkContact = function (gc_x, gc_y) {
		if (gc_x + 15 > this.currentX - this.length / 2 && gc_x < this.currentX + this.length / 2) {
			var d = this.y - 10 - gc_y;
			if (d >= 0 && d < 5) {
				return true;
			}
		}
		return false;
	}
}

function Flagpole(x) {
	this.x = x;
	this.isReached = false;

	this.check = function () {
		var d = abs(character.worldX - this.x);
		this.isReached = d < 15;
	}

	this.draw = function () {
		push();
		// flagpole
		strokeWeight(5);
		stroke(88, 53, 23);
		strokeCap(SQUARE);
		line(this.x, game.floor, this.x, game.floor - 150);
		// flag
		textSize(50);
		var emoji = "\u{1F1EC}\u{1F1E7}"; // UK flag
		if (this.isReached) {
			if (!levelUpSound.isPlaying() && !levelUpSoundPlayed) {
				levelUpSound.play();
				levelUpSoundPlayed = true;
			}
			text(emoji, this.x, game.floor - 110);
		} else {
			text(emoji, this.x, game.floor);
		}
		pop();
	}
}

/*************************************
 Functions that render scenery objects
 *************************************/

function keyPressed() {
	game.onKeyPressed();
}

function keyReleased() {
	game.onKeyReleased();
}

/*****************************
 Functions that render scenery 
 *****************************/

function drawGround() {
	noStroke();
	fill(0, 155, 0);
	rect(0, game.floor, width, height / 4);
}

function drawClouds() {
	for (var i = 0; i < clouds.length; i++) {
		drawCloud(clouds[i]);
	}
}

function drawCloud(cloud) {
	var x = cloud.x;
	var y = cloud.y;
	var width = cloud.width;
	var half = width / 2;
	var third = width / 3;
	var quarter = width / 4;
	var fifth = width / 5;
	var sixth = width / 6;

	push();
	fill(255);
	// bottom side
	rectMode(CENTER);
	rect(x, y, width, quarter, fifth);
	// top side
	ellipse(x + sixth, y - sixth, third);
	ellipse(x - sixth, y - sixth, half);
	pop();
}

function drawMountains() {
	for (var i = 0; i < mountains.length; i++) {
		drawMountain(mountains[i]);
	}
}

function drawMountain(mountain) {
	var x = mountain.x;
	var floor = game.floor;
	var mountainColor = color(151, 168, 183);
	var darkSlopeColor = lerpColor(mountainColor, color(0), 0.1);
	var width = mountain.width;
	var height = mountain.height;
	var half = width / 2;
	var fifth = width / 5;

	push();
	//bright slope
	fill(mountainColor);
	triangle(x - half, floor, x + half, floor, x, floor - height);
	//dark slope
	fill(darkSlopeColor);
	triangle(x + fifth, floor, x + half, floor, x, floor - height);
	pop();
}

function drawTrees() {
	for (var i = 0; i < trees.length; i++) {
		drawTree(trees[i]);
	}
}

function drawTree(tree) {
	var x = tree.x;
	var y = game.floor;

	push();

	translate(x, y);
	if (tree.facing == 'R') {
		applyMatrix(-1, 0, 0, 1, 0, 0);
	}
	scale(tree.height / 142.0);
	// crown
	fill(0, 140, 20);
	ellipse(-7, -112, 60, 60);
	ellipse(-17, -92, 70, 70);
	ellipse(23, -102, 40, 40);
	// trunk
	fill(88, 53, 23);
	triangle(-3, 0, 9, 0, 3, -92);
	triangle(3, -32, 3, -40, -17, -72);
	pop();
}

// Plays the bacground music if sound file is loaded
function playBackgroundMusic() {
	if (backgroundMusicOn && backgroundMusic.isLoaded()) {
		if (!backgroundMusic.isPlaying()) {
			backgroundMusic.isLooping(true);
			backgroundMusic.play();
		}
	}
}
// Enumeration of game states
const gameState = {
	READY: 0,
	RUNNING: 1,
	LEVEL_FINISHED: 2,
	GAME_OVER: 3,
	GAME_FINISHED: 4
}

// Flag that turns on visual helpers for level design
const DEVELOPER_MODE = false;

// Scenery variables
var trees;
var clouds;
var mountains;

// The game character variable
var character;

// Game world variable
var game;

// Sound variables
var jumpSound;
var collectSound;
var plummetSound;
var backgroundMusic;
var startGameSound;
var gameOverSound;
var lifeLostSound;
var levelUpSound;
var gameOverSoundPlayed;
var levelUpSoundPlayed;
var backgroundMusicOn = false;

// Timing variables
var elapsed;