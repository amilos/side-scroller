// <reference path="p5.d.ts" />
/// <reference path="node_modules/@types/p5/lib/addons/p5.sound.d.ts" />
/// <reference path="node_modules/@types/p5/global.d.ts" />

//@ts-check

var gameState = {
	RUNNING: 0,
	LEVEL_FINISHED: 1,
	GAME_OVER: 2,
	GAME_FINISHED: 3
}

var characterState = {
	IDLE: 0,
	DEAD: 1,
	WINNING: 2
}

const DEVELOPER_MODE = false;

// Game world and character position variables.
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

// Game control variables.
var isMovingLeft;
var isMovingRight;
var isFalling;
var isPlummeting;
var isOverCanyon;
var isInContactWithEnemy;
var isOnPlatform;

// Scenery variables.
var trees;
var clouds;
var mountains;

// Interactive objects.
var canyons;
var collectables;
var platforms;
var enemies;
var flagpole;
var character;

// Game mechanics variables.
var game;
var player;

var game_score;
var lives;

var jumpSound;
var collectSound;
var plummetSound;
var backgroundMusic;
var startGameSound;
var gameOverSound;
var lifeLostSound;
var levelUpSound;

var backgroundMusicOn = false;

var start, elapsed;


var gameOverSoundPlayed;
var levelUpSoundPlayed;

function preload() {
	soundFormats("mp3");

	backgroundMusic = loadSound("assets/background-loop.mp3");
	backgroundMusic.setVolume(0.05);

	lifeLostSound = loadSound("assets/life-lost.mp3");
	lifeLostSound.setVolume(0.05);

	startGameSound = loadSound("assets/start-game.mp3");
	startGameSound.setVolume(0.1);

	levelUpSound = loadSound("assets/level-up-long.mp3");
	levelUpSound.setVolume(0.1);

	gameOverSound = loadSound("assets/game-over.mp3");
	gameOverSound.setVolume(0.1);

	jumpSound = loadSound("assets/jump.mp3");
	jumpSound.setVolume(0.1);

	collectSound = loadSound("assets/collect-long.mp3");
	collectSound.setVolume(0.1);

	plummetSound = loadSound("assets/plummet.mp3");
	plummetSound.setVolume(0.1);

}

function setup() {
	createCanvas(1920 / 2, 1080 / 2);
	floorPos_y = height * 3 / 4;
	lives = 3;
	game_score = 0;
	game = new Game();

	// Initialize the state of the game world.
	startGame();
}

// Function that resets the state of the gamwe world.
function startGame() {
	// Initial position of game character.
	gameChar_x = 200;
	gameChar_y = floorPos_y;
	// Variable to control the background scrolling.
	scrollPos = 0;

	if (game.lives == 3) {
		start = new Date().getTime();
		game_score = 0;
	}

	character = new Character(200, game.floor);



	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isMovingLeft = false;
	isMovingRight = false;
	isFalling = false;
	isPlummeting = false;
	isOnPlatform = false;

	gameOverSoundPlayed = false;
	levelUpSoundPlayed = false;

	// Initialise arrays of scenery objects.

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

	// {
	// 	x: -350,
	// 	width: 300,
	// 	inCanyon: false
	// },
	// {
	// 	x: 350,
	// 	width: 120,
	// 	inCanyon: false
	// },
	// {
	// 	x: 750,
	// 	width: 200,
	// 	inCanyon: false
	// },
	// {
	// 	x: 1550,
	// 	width: 100,
	// 	inCanyon: false
	// },
	// {
	// 	x: 1800,
	// 	width: 100,
	// 	inCanyon: false
	// }
	canyons = [];
	canyons.push(new Canyon(-350, 300));
	canyons.push(new Canyon(350, 120));
	canyons.push(new Canyon(750, 200));
	canyons.push(new Canyon(1550, 100));
	canyons.push(new Canyon(1800, 100));


	collectables = [];
	collectables.push(new Collectable(-100, 350));
	collectables.push(new Collectable(600, 350));
	collectables.push(new Collectable(600, 150));
	collectables.push(new Collectable(820, 370));
	collectables.push(new Collectable(1200, 400));
	collectables.push(new Collectable(1200, 150));
	collectables.push(new Collectable(1500, 370));
	collectables.push(new Collectable(1650, 370));

	platforms = [];
	platforms.push(new Platform(450, 150, 1, 150 / 2));
	platforms.push(new Platform(600, 200, 2, 200 / 2, -1));
	platforms.push(new Platform(750, 100, 1));
	platforms.push(new Platform(1050, 200, 1));
	//platforms.push(new Platform(1100, 200, 1));
	platforms.push(new Platform(1200, 100, 2));
	platforms.push(new Platform(1350, 200, 1));

	enemies = [];
	this.enemies.push(new Enemy(450, floorPos_y - 5, 200));
	this.enemies.push(new Enemy(500, floorPos_y - 180, 200));
	this.enemies.push(new Enemy(950, floorPos_y - 5, 250));
	this.enemies.push(new Enemy(1200, floorPos_y - 5, 250, -1));
	this.enemies.push(new Enemy(1600, floorPos_y - 5, 150));

	flagpole = new Flagpole(1920);

	if (!plummetSound.isPlaying() && !lifeLostSound.isPlaying()) {
		// startGameSound.play();
	}
}


function drawGround() {
	noStroke();
	fill(0, 155, 0);
	rect(0, floorPos_y, width, height / 4);
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
	// If statements to control the animation of the character 
	// when keys are pressed.
	game.onKeyPressed();
	if (flagpole.isReached) {
		if (key == " ") {
			startGame();
			return;
		} else {
			return;
		}
	}

	if (game.lives < 1) {
		if (key == " ") {
			game.lives = 3;
			startGame();
			return;
		} else {
			return;
		}
	}

	if (keyCode == LEFT_ARROW) {
		isMovingLeft = true;
		// @ts-ignore
	} else if (keyCode == RIGHT_ARROW) {
		isMovingRight = true;
	} else if (key == " ") {
		if (floorPos_y == gameChar_y || isOnPlatform) {
			jumpSound.play();
			gameChar_y -= 120;
		}
	}
}

function keyReleased() {
	// if statements to control the animation of the character 
	// when keys are released.
	game.onKeyReleased();

	if (keyCode == LEFT_ARROW) {
		isMovingLeft = false;
	} else if (keyCode == RIGHT_ARROW) {
		isMovingRight = false;
	}
}

// ------------------------------
// Game character render function
// ------------------------------

function drawGameChar() {
	// Render diffrerent game character sprites.
	if (isPlummeting) {
		plummetingUpsideDown();
		if (!plummetSound.isPlaying()) {
			plummetSound.play();
		}
	} else if (isMovingLeft && isFalling) {
		jumpingLeft();
	} else if (isMovingRight && isFalling) {
		jumpingRight();
	} else if (isMovingLeft) {
		walkingLeft();
	} else if (isMovingRight) {
		walkingRight();
	} else if (isFalling) {
		jumpingFacingForwards();
	} else {
		standingFacingForwards();
	}
	// textSize(10);
	// fill(255);
	// text(`${gameChar_y}`, gameChar_x - 9, gameChar_y - 48)

}

function standingFacingForwards() {
	// trunk
	fill(207, 20, 43);
	rect(gameChar_x - 10, gameChar_y - 35, 20, 30);
	// hands
	fill(0);
	rect(gameChar_x - 15, gameChar_y - 20, 5, 14, 2);
	rect(gameChar_x + 10, gameChar_y - 20, 5, 14, 2);
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(gameChar_x, gameChar_y - 30, 29);
	//eyes
	fill(0);
	noStroke();
	ellipse(gameChar_x - 7, gameChar_y - 30, 5);
	ellipse(gameChar_x + 7, gameChar_y - 30, 5);
	//lips
	stroke(0);
	strokeWeight(2);
	line(gameChar_x - 5, gameChar_y - 22, gameChar_x + 5, gameChar_y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(gameChar_x - 15, gameChar_y - 30);
	curveVertex(gameChar_x - 20, gameChar_y - 30);
	curveVertex(gameChar_x - 20, gameChar_y - 70);
	curveVertex(gameChar_x + 20, gameChar_y - 70);
	curveVertex(gameChar_x + 20, gameChar_y - 30);
	curveVertex(gameChar_x + 15, gameChar_y - 30);
	endShape();
	// boots
	fill(0);
	rect(gameChar_x - 10, gameChar_y - 5, 8, 8);
	rect(gameChar_x + 2, gameChar_y - 5, 8, 8);
}

function plummetingUpsideDown() {
	push();
	// Move origin to the center of the game character
	// and rotate by 180 degrees.
	translate(gameChar_x, gameChar_y);
	//var angle = keyCode == LEFT_ARROW ? -PI : PI;
	//rotate(angle);
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

function jumpingFacingForwards() {
	// trunk
	fill(255, 0, 0);
	rect(gameChar_x - 10, gameChar_y - 35, 20, 30);
	// hands
	fill(0);
	push();
	translate(gameChar_x - 15, gameChar_y - 20);
	translate(6, 2);
	rotate(PI / 2);
	rect(0, 0, 5, 14, 2);
	pop();
	push();
	translate(gameChar_x + 10, gameChar_y - 20);
	translate(-1, 7);
	rotate(-PI / 2);
	rect(0, 0, 5, 14, 2);
	pop();
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(gameChar_x, gameChar_y - 30, 29);
	//eyes
	fill(0);
	noStroke();
	ellipse(gameChar_x - 7, gameChar_y - 30, 5);
	ellipse(gameChar_x + 7, gameChar_y - 30, 5);
	//lips
	stroke(0);
	strokeWeight(2);
	line(gameChar_x - 5, gameChar_y - 22, gameChar_x + 5, gameChar_y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(gameChar_x - 15, gameChar_y - 30);
	curveVertex(gameChar_x - 20, gameChar_y - 30);
	curveVertex(gameChar_x - 20, gameChar_y - 65);
	curveVertex(gameChar_x + 20, gameChar_y - 65);
	curveVertex(gameChar_x + 20, gameChar_y - 30);
	curveVertex(gameChar_x + 15, gameChar_y - 30);
	endShape();
	// boots
	fill(0);
	rect(gameChar_x - 10, gameChar_y - 10, 8, 8);
	rect(gameChar_x + 2, gameChar_y - 8, 8, 8);
}

function walkingLeft() {
	fill(0);
	// forward hand
	push();
	translate(gameChar_x - 15, gameChar_y - 20);
	translate(9, 2);
	rotate(PI / 6);
	rect(0, 0, 5, 14, 2);
	pop();
	// trunk leaning forward
	push();
	translate(gameChar_x - 8, gameChar_y - 20);
	translate(1, 4);
	rotate(-PI / 8);
	fill(255, 0, 0);
	rect(0, 0, 15, 16);
	pop();
	// back hand
	push();
	translate(gameChar_x + 10, gameChar_y - 20);
	translate(-5, 6);
	rotate(-PI / 2);
	rect(0, 0, 5, 14, 2);
	pop();
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(gameChar_x, gameChar_y - 30, 29);
	// eyes
	fill(0);
	noStroke();
	ellipse(gameChar_x - 7, gameChar_y - 30, 5);
	// lips
	stroke(0);
	strokeWeight(2);
	line(gameChar_x - 10, gameChar_y - 22, gameChar_x - 3, gameChar_y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(gameChar_x - 15, gameChar_y - 31);
	curveVertex(gameChar_x - 20, gameChar_y - 31);
	curveVertex(gameChar_x - 12, gameChar_y - 70);
	curveVertex(gameChar_x + 23, gameChar_y - 65);
	curveVertex(gameChar_x + 20, gameChar_y - 26);
	curveVertex(gameChar_x + 15, gameChar_y - 26);
	endShape();
	// back leg
	push();
	translate(gameChar_x + 6, gameChar_y - 5);
	translate(1, 1);
	rotate(-PI / 3);
	rect(0, 0, 8, 8);
	pop();
	// forward leg
	push();
	translate(gameChar_x - 6, gameChar_y - 5);
	translate(4, 1);
	rect(0, 0, 8, 7);
	pop();
}

function walkingRight() {
	fill(0);
	// forward hand
	push();
	translate(gameChar_x + 10, gameChar_y - 20);
	translate(-6, 5);
	rotate(-PI / 6);
	rect(0, 0, 5, 14, 2);
	pop();
	// trunk leaning forward
	push();
	translate(gameChar_x - 8, gameChar_y - 20);
	translate(3, -2);
	rotate(PI / 8);
	fill(255, 0, 0);
	rect(0, 0, 15, 16);
	pop();
	// back hand
	push();
	translate(gameChar_x - 15, gameChar_y - 20);
	translate(10, 1);
	rotate(PI / 2);
	rect(0, 0, 5, 14, 2);
	pop();
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(gameChar_x, gameChar_y - 30, 29);
	// eyes
	fill(0);
	noStroke();
	ellipse(gameChar_x + 7, gameChar_y - 30, 5);
	// lips
	stroke(0);
	strokeWeight(2);
	line(gameChar_x + 3, gameChar_y - 22, gameChar_x + 10, gameChar_y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(gameChar_x - 15, gameChar_y - 26);
	curveVertex(gameChar_x - 20, gameChar_y - 26);
	curveVertex(gameChar_x - 21, gameChar_y - 65);
	curveVertex(gameChar_x + 14, gameChar_y - 70);
	curveVertex(gameChar_x + 20, gameChar_y - 31);
	curveVertex(gameChar_x + 15, gameChar_y - 31);
	endShape();
	// back leg
	push();
	translate(gameChar_x - 6, gameChar_y - 5);
	translate(-3, -6);
	rotate(PI / 3);
	rect(0, 0, 8, 8);
	pop();
	// forward leg
	push();
	translate(gameChar_x - 6, gameChar_y - 5);
	translate(2, 1);
	rect(0, 0, 8, 7);
	pop();
}

function jumpingRight() {
	fill(0);
	// forward hand
	push();
	translate(gameChar_x + 10, gameChar_y - 20);
	translate(-15, 0);
	rotate(PI / 3);
	rect(0, 0, 5, 14, 2);
	pop();
	// forward leg
	push();
	translate(gameChar_x + 6, gameChar_y - 5);
	translate(-8, 1);
	rotate(-PI / 8);
	rect(0, 0, 8, 6);
	pop();
	// trunk leaning forward
	push();
	translate(gameChar_x - 8, gameChar_y - 20);
	translate(3, -2);
	rotate(PI / 8);
	fill(255, 0, 0);
	rect(0, 0, 15, 16);
	pop();
	// back hand
	push();
	translate(gameChar_x - 15, gameChar_y - 20);
	translate(15, 5);
	rotate(-PI / 3);
	rect(0, 0, 5, 14, 2);
	pop();
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(gameChar_x, gameChar_y - 30, 29);
	// eyes
	fill(0);
	noStroke();
	ellipse(gameChar_x + 7, gameChar_y - 30, 5);
	// lips
	stroke(0);
	strokeWeight(2);
	line(gameChar_x + 3, gameChar_y - 22, gameChar_x + 10, gameChar_y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(gameChar_x - 15, gameChar_y - 26);
	curveVertex(gameChar_x - 20, gameChar_y - 26);
	curveVertex(gameChar_x - 21, gameChar_y - 60);
	curveVertex(gameChar_x + 14, gameChar_y - 67);
	curveVertex(gameChar_x + 20, gameChar_y - 31);
	curveVertex(gameChar_x + 15, gameChar_y - 31);
	endShape();
	// back leg
	push();
	translate(gameChar_x - 6, gameChar_y - 5);
	translate(-4, -2.5);
	rotate(0);
	fill(0);
	rect(0, 0, 8, 6);
	pop();
}

function jumpingLeft() {
	fill(0);
	// back hand
	push();
	translate(gameChar_x + 10, gameChar_y - 20);
	translate(-6, 5);
	rotate(-PI / 3);
	rect(0, 0, 5, 14, 2);
	pop();
	// forward leg
	push();
	translate(gameChar_x - 6, gameChar_y - 5);
	translate(3, -2.5);
	rotate(PI / 8);
	rect(0, 0, 8, 6);
	pop();
	// trunk leaning forward
	push();
	translate(gameChar_x - 8, gameChar_y - 20);
	translate(1, 4);
	rotate(-PI / 8);
	fill(255, 0, 0);
	rect(0, 0, 15, 16);
	pop();
	// forward hand
	push();
	translate(gameChar_x + 10, gameChar_y - 20);
	translate(-11, 2);
	rotate(PI / 3);
	rect(0, 0, 5, 14, 2);
	pop();
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(gameChar_x, gameChar_y - 30, 29);
	// eyes
	fill(0);
	noStroke();
	ellipse(gameChar_x - 7, gameChar_y - 30, 5);
	// lips
	stroke(0);
	strokeWeight(2);
	line(gameChar_x - 10, gameChar_y - 22, gameChar_x - 3, gameChar_y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(gameChar_x - 15, gameChar_y - 31);
	curveVertex(gameChar_x - 20, gameChar_y - 31);
	curveVertex(gameChar_x - 12, gameChar_y - 67);
	curveVertex(gameChar_x + 23, gameChar_y - 60);
	curveVertex(gameChar_x + 20, gameChar_y - 26);
	curveVertex(gameChar_x + 15, gameChar_y - 26);
	endShape();
	// back leg
	fill(0);
	push();
	translate(gameChar_x + 6, gameChar_y - 5);
	translate(-2, -2);
	rotate(0);
	rect(0, 0, 8, 6);
	pop();
}

function standingFacingForwards() {
	// trunk
	fill(255, 0, 0);
	rect(gameChar_x - 10, gameChar_y - 35, 20, 30);
	// hands
	fill(0);
	rect(gameChar_x - 15, gameChar_y - 20, 5, 14, 2);
	rect(gameChar_x + 10, gameChar_y - 20, 5, 14, 2);
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(gameChar_x, gameChar_y - 30, 29);
	// eyes
	fill(0);
	noStroke();
	ellipse(gameChar_x - 7, gameChar_y - 30, 5);
	ellipse(gameChar_x + 7, gameChar_y - 30, 5);
	// lips
	stroke(0);
	strokeWeight(2);
	line(gameChar_x - 5, gameChar_y - 22, gameChar_x + 5, gameChar_y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(gameChar_x - 15, gameChar_y - 30);
	curveVertex(gameChar_x - 20, gameChar_y - 30);
	curveVertex(gameChar_x - 20, gameChar_y - 70);
	curveVertex(gameChar_x + 20, gameChar_y - 70);
	curveVertex(gameChar_x + 20, gameChar_y - 30);
	curveVertex(gameChar_x + 15, gameChar_y - 30);
	endShape();

	// legs
	fill(0);
	rect(gameChar_x - 10, gameChar_y - 5, 8, 8);
	rect(gameChar_x + 2, gameChar_y - 5, 8, 8);
}


/*************************************
 Functions that render scenery objects
 *************************************/

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
	var floor = floorPos_y;
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
	// Draw trees.
	for (var i = 0; i < trees.length; i++) {
		drawTree(trees[i]);
	}
}

function drawTree(tree) {
	var x = tree.x;
	var y = floorPos_y;

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


/***************************************** 
 Functions that render interactive objects
 *****************************************/

function drawPlatforms() {
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].update();
		platforms[i].draw();
	}
}

function drawCanyons() {
	isOverCanyon = false;
	for (var i = 0; i < canyons.length; i++) {
		canyons[i].check();
		canyons[i].draw();
		isOverCanyon = isOverCanyon || canyons[i].inCanyon;
	}
}

function drawCollectables() {
	for (var i = 0; i < collectables.length; i++) {
		if (!collectables[i].isCollected) {
			collectables[i].update();
			collectables[i].checkContact();
			collectables[i].draw();
		}
	}
}

function drawEnemies() {
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].draw();
		enemies[i].checkContact(gameChar_world_x, gameChar_y);
		if (enemies[i].inContact) {
			if (game.lives > 0) {
				game.lives--;
				if (!lifeLostSound.isPlaying()) {
					lifeLostSound.play();
				}
				startGame();
				break;
			}
		}
	}
}

function drawFlagpole() {
	// Check if the flagpole is reached.
	if (!flagpole.isReached) {
		flagpole.check();
	}
	// Draw the flagpole
	flagpole.draw();
}


function checkPlayerDie() {
	if (gameChar_y > height) {
		game.lives--;
		if (game.lives > 0) {
			startGame();
		}
	}
}

function Flagpole(x) {
	this.x = x;
	this.isReached = false;

	this.check = function () {
		var d = abs(gameChar_world_x - this.x);
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
		var floor = floorPos_y;
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

		// Detect if character is within the canyon walls.
		this.inCanyon =
			(gameChar_world_x - 10 > leftWall) &&
			(gameChar_world_x + 10 < rightWall);
	}
}

function Collectable(x, y, startingDirection = 1) {
	this.x = x;
	this.y = y;
	this.size = 30;
	this.isCollected = false;
	this.range = 100;
	this.currentX = x;
	this.inc = startingDirection;

	if (startingDirection == -1) {
		this.currentX = x + this.range;
	}

	this.update = function () {
		if (this.range > 0) {
			this.currentX += this.inc;
			if (this.currentX >= this.x + this.range) {
				this.inc = -1;
			} else if (this.currentX < this.x) {
				this.inc = 1;
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
		// Game characted collects the item if close enough.
		const d =
			dist(
				gameChar_world_x, gameChar_y - 30,
				this.currentX, this.y - 15);
		if (d < 30) {
			this.isCollected = true;
			game_score++;
			collectSound.play();
		}
	}
}



function Game() {
	this.score = 0;
	this.world = createVector(0, 0);
	this.floor = height * 3 / 4;
	this.lives = 3;
	this.currentLevel = 0;
	this.levels = [];
	this.state = gameState.RUNNING;

	this.startNextLevel = function () {

	}

	this.restart = function () {
		console.log("game.restart called");
	}

	this.onKeyPressed = function () {
		console.log("game.onKeyPressed called");

		// If statements to control the animation of the character 
		// when keys are pressed.
		const SPACE = 32;

		switch (keyCode) {
			case SPACE:
				if (this.state == gameState.LEVEL_FINISHED) {
					this.startNextLevel();
					return;
				}
				if (this.state == gameState.GAME_OVER) {
					this.lives = 3;
					this.restart();
				}
				if (game.floor == character.pos.y || character.isOnPlatform) {
					jumpSound.play();
					character.jump();
				}
				break;
			case LEFT_ARROW:
				character.isMovingLeft = true;
				character.isMovingRight = false;
				break;
			case RIGHT_ARROW:
				character.isMovingRight = true;
				character.isMovingLeft = false;
				break;
		}
	}

	this.onKeyReleased = function () {
		console.log("game.onKeyReleased called");
		// if statements to control the animation of the character 
		// when keys are released.

		if (keyCode == LEFT_ARROW) {
			isMovingLeft = false;
		} else if (keyCode == RIGHT_ARROW) {
			isMovingRight = false;
		}
	}

	this.drawUI = function () {
		// Draw gridlines to help position the elements
		if (DEVELOPER_MODE) {
			drawGridlines();
		}

		// Draw current game score.
		drawGameScore();

		// Draw game over message if player run out of lives
		if (game.lives < 1) {
			drawGameOverMessage();
			return;
		}


		// Draw level complete message if flagpole is reached
		if (flagpole.isReached) {
			drawLevelCompleteMessage();
			return;
		}


		/************************
		 Functions that render UI
		 ************************/

		function drawGameScore() {
			fill(255);
			textSize(20);
			if (game.lives > 0 && !flagpole.isReached) {
				elapsed = floor((new Date().getTime() - start) / 1000);
			}
			text(`Score: ${game_score}`, 20, 40);
			text(`${elapsed}`, 20, 65);
			// Draw remaining lives as guardsman icons.
			var offset = width * 2 - 170;
			for (var i = 0; i < game.lives; i++) {
				drawCharacterIcon(offset + (i) * 55, 120);
			}

		}

		function drawCharacterIcon(x, y) {
			push();
			// Scale it to 50% of game character size.
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

		function drawGameOverMessage() {
			if (!gameOverSound.isPlaying() && !gameOverSoundPlayed) {
				gameOverSound.play();
				gameOverSoundPlayed = true;
			}

			var message = "Game over.\r\nPress space to continue.";
			push();
			textAlign(CENTER);
			textSize(40);
			text(message, width / 2, height / 3 + 60);
			pop();
		}

		function drawLevelCompleteMessage() {

			var message = "Level complete.\r\nPress space to continue.";
			push();
			textAlign(CENTER);
			textSize(40);
			text(message, width / 2, height / 3 + 30);
			pop();
			drawGameChar();

		}

		function drawGridlines() {
			push();
			translate(scrollPos, 0);
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
	}
}

function Level() {
	this.enemies = [];
	this.platforms = [];
	this.canvas = [];
	this.collectables = [];
}

function Platform(x, length, level = 1, range = 0, startingDirection = 1) {
	this.x = x;
	this.y = floorPos_y - level * 80 - 10;
	this.length = length;
	this.range = range;
	this.currentX = x;
	this.inc = startingDirection;

	if (startingDirection == -1) {
		this.currentX = x + range;
	}

	this.update = function () {
		if (this.range > 0) {
			this.currentX += this.inc;
			if (this.currentX >= this.x + this.range) {
				this.inc = -1;
			} else if (this.currentX < this.x) {
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



function playBackgroundMusic() {
	if (backgroundMusicOn && backgroundMusic.isLoaded()) {
		if (!backgroundMusic.isPlaying()) {
			backgroundMusic.isLooping(true);
			backgroundMusic.play();
		}
	}
}

function Character(x, y) {
	// Character screen x and y position as a vector
	this.pos = createVector(x, y);
	this.worldX = x - scrollPos;

	// Game control variables.
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

	this.update = function () {


		// Detect when character plummets into the canyon
		this.isPlummeting = this.isOverCanyon && this.pos.y >= game.floor;

		// Logic to make the game character move or the background scroll.
		// No movement when plummeting.
		if (!this.isPlummeting) {
			// If the left arrow key is pressed.
			if (this.isMovingLeft) {
				// Move the game character if we did not step into 
				// the first 20% of the canvas width.
				if (this.pos.x > width * 0.2) {
					this.pos.x -= 5;
				} else {
					// Scroll the background to the right when we reach 
					// the first 20% of canvas width.
					scrollPos += 5;
				}
			}
			// If the right arrow key is pressed.
			if (this.isMovingRight) {
				// Move the game character if we did not step into 
				// the first 20% of the canvas width.
				if (this.pos.x < width * 0.8) {
					this.pos.x += 5;
				} else {
					// Scroll the background to the left when we reach 
					// the first 20% of canvas width.
					scrollPos -= 5;
				}
			}
		}

		// Logic to make the game character rise and fall.

		this.isFalling = this.pos.y < game.floor;
		// Add gravity when character is above floor.
		if (this.isFalling) {
			//Check if the game character is on one of the platforms
			for (var i = 0; i < platforms.length; i++) {
				this.isOnPlatform = platforms[i].checkContact(this.worldX, this.pos.y);
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
		this.worldX = this.pos.x - scrollPos;

	}

	this.die = function () {
		game.lives--;
		if (game.lives > 0) {
			startGame();
		} else {
			//game over
		}
	}

	this.draw = function () {
		// Render diffrerent game character sprites.
		if (this.isPlummeting) {
			plummetingUpsideDown();
			if (!plummetSound.isPlaying()) {
				plummetSound.play();
			}
		} else if (this.isMovingLeft && this.isFalling) {
			jumpingLeft();
		} else if (this.isMovingRight && this.isFalling) {
			jumpingRight();
		} else if (this.isMovingLeft) {
			walkingLeft();
		} else if (this.isMovingRight) {
			walkingRight();
		} else if (this.isFalling) {
			jumpingFacingForwards();
		} else {
			standingFacingForwards();
		}


		function standingFacingForwards() {
			// trunk
			fill(207, 20, 43);
			rect(gameChar_x - 10, gameChar_y - 35, 20, 30);
			// hands
			fill(0);
			rect(gameChar_x - 15, gameChar_y - 20, 5, 14, 2);
			rect(gameChar_x + 10, gameChar_y - 20, 5, 14, 2);
			// head
			fill(200, 150, 150);
			stroke(0);
			strokeWeight(2);
			ellipse(gameChar_x, gameChar_y - 30, 29);
			//eyes
			fill(0);
			noStroke();
			ellipse(gameChar_x - 7, gameChar_y - 30, 5);
			ellipse(gameChar_x + 7, gameChar_y - 30, 5);
			//lips
			stroke(0);
			strokeWeight(2);
			line(gameChar_x - 5, gameChar_y - 22, gameChar_x + 5, gameChar_y - 22);
			// hat
			fill(0);
			noStroke();
			strokeWeight(1);
			beginShape();
			curveVertex(gameChar_x - 15, gameChar_y - 30);
			curveVertex(gameChar_x - 20, gameChar_y - 30);
			curveVertex(gameChar_x - 20, gameChar_y - 70);
			curveVertex(gameChar_x + 20, gameChar_y - 70);
			curveVertex(gameChar_x + 20, gameChar_y - 30);
			curveVertex(gameChar_x + 15, gameChar_y - 30);
			endShape();
			// boots
			fill(0);
			rect(gameChar_x - 10, gameChar_y - 5, 8, 8);
			rect(gameChar_x + 2, gameChar_y - 5, 8, 8);
		}

		function plummetingUpsideDown() {
			push();
			// Move origin to the center of the game character
			// and rotate by 180 degrees.
			translate(gameChar_x, gameChar_y);
			//var angle = keyCode == LEFT_ARROW ? -PI : PI;
			//rotate(angle);
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

		function jumpingFacingForwards() {
			// trunk
			fill(255, 0, 0);
			rect(gameChar_x - 10, gameChar_y - 35, 20, 30);
			// hands
			fill(0);
			push();
			translate(gameChar_x - 15, gameChar_y - 20);
			translate(6, 2);
			rotate(PI / 2);
			rect(0, 0, 5, 14, 2);
			pop();
			push();
			translate(gameChar_x + 10, gameChar_y - 20);
			translate(-1, 7);
			rotate(-PI / 2);
			rect(0, 0, 5, 14, 2);
			pop();
			// head
			fill(200, 150, 150);
			stroke(0);
			strokeWeight(2);
			ellipse(gameChar_x, gameChar_y - 30, 29);
			//eyes
			fill(0);
			noStroke();
			ellipse(gameChar_x - 7, gameChar_y - 30, 5);
			ellipse(gameChar_x + 7, gameChar_y - 30, 5);
			//lips
			stroke(0);
			strokeWeight(2);
			line(gameChar_x - 5, gameChar_y - 22, gameChar_x + 5, gameChar_y - 22);
			// hat
			fill(0);
			noStroke();
			strokeWeight(1);
			beginShape();
			curveVertex(gameChar_x - 15, gameChar_y - 30);
			curveVertex(gameChar_x - 20, gameChar_y - 30);
			curveVertex(gameChar_x - 20, gameChar_y - 65);
			curveVertex(gameChar_x + 20, gameChar_y - 65);
			curveVertex(gameChar_x + 20, gameChar_y - 30);
			curveVertex(gameChar_x + 15, gameChar_y - 30);
			endShape();
			// boots
			fill(0);
			rect(gameChar_x - 10, gameChar_y - 10, 8, 8);
			rect(gameChar_x + 2, gameChar_y - 8, 8, 8);
		}

		function walkingLeft() {
			fill(0);
			// forward hand
			push();
			translate(gameChar_x - 15, gameChar_y - 20);
			translate(9, 2);
			rotate(PI / 6);
			rect(0, 0, 5, 14, 2);
			pop();
			// trunk leaning forward
			push();
			translate(gameChar_x - 8, gameChar_y - 20);
			translate(1, 4);
			rotate(-PI / 8);
			fill(255, 0, 0);
			rect(0, 0, 15, 16);
			pop();
			// back hand
			push();
			translate(gameChar_x + 10, gameChar_y - 20);
			translate(-5, 6);
			rotate(-PI / 2);
			rect(0, 0, 5, 14, 2);
			pop();
			// head
			fill(200, 150, 150);
			stroke(0);
			strokeWeight(2);
			ellipse(gameChar_x, gameChar_y - 30, 29);
			// eyes
			fill(0);
			noStroke();
			ellipse(gameChar_x - 7, gameChar_y - 30, 5);
			// lips
			stroke(0);
			strokeWeight(2);
			line(gameChar_x - 10, gameChar_y - 22, gameChar_x - 3, gameChar_y - 22);
			// hat
			fill(0);
			noStroke();
			strokeWeight(1);
			beginShape();
			curveVertex(gameChar_x - 15, gameChar_y - 31);
			curveVertex(gameChar_x - 20, gameChar_y - 31);
			curveVertex(gameChar_x - 12, gameChar_y - 70);
			curveVertex(gameChar_x + 23, gameChar_y - 65);
			curveVertex(gameChar_x + 20, gameChar_y - 26);
			curveVertex(gameChar_x + 15, gameChar_y - 26);
			endShape();
			// back leg
			push();
			translate(gameChar_x + 6, gameChar_y - 5);
			translate(1, 1);
			rotate(-PI / 3);
			rect(0, 0, 8, 8);
			pop();
			// forward leg
			push();
			translate(gameChar_x - 6, gameChar_y - 5);
			translate(4, 1);
			rect(0, 0, 8, 7);
			pop();
		}

		function walkingRight() {
			fill(0);
			// forward hand
			push();
			translate(gameChar_x + 10, gameChar_y - 20);
			translate(-6, 5);
			rotate(-PI / 6);
			rect(0, 0, 5, 14, 2);
			pop();
			// trunk leaning forward
			push();
			translate(gameChar_x - 8, gameChar_y - 20);
			translate(3, -2);
			rotate(PI / 8);
			fill(255, 0, 0);
			rect(0, 0, 15, 16);
			pop();
			// back hand
			push();
			translate(gameChar_x - 15, gameChar_y - 20);
			translate(10, 1);
			rotate(PI / 2);
			rect(0, 0, 5, 14, 2);
			pop();
			// head
			fill(200, 150, 150);
			stroke(0);
			strokeWeight(2);
			ellipse(gameChar_x, gameChar_y - 30, 29);
			// eyes
			fill(0);
			noStroke();
			ellipse(gameChar_x + 7, gameChar_y - 30, 5);
			// lips
			stroke(0);
			strokeWeight(2);
			line(gameChar_x + 3, gameChar_y - 22, gameChar_x + 10, gameChar_y - 22);
			// hat
			fill(0);
			noStroke();
			strokeWeight(1);
			beginShape();
			curveVertex(gameChar_x - 15, gameChar_y - 26);
			curveVertex(gameChar_x - 20, gameChar_y - 26);
			curveVertex(gameChar_x - 21, gameChar_y - 65);
			curveVertex(gameChar_x + 14, gameChar_y - 70);
			curveVertex(gameChar_x + 20, gameChar_y - 31);
			curveVertex(gameChar_x + 15, gameChar_y - 31);
			endShape();
			// back leg
			push();
			translate(gameChar_x - 6, gameChar_y - 5);
			translate(-3, -6);
			rotate(PI / 3);
			rect(0, 0, 8, 8);
			pop();
			// forward leg
			push();
			translate(gameChar_x - 6, gameChar_y - 5);
			translate(2, 1);
			rect(0, 0, 8, 7);
			pop();
		}

		function jumpingRight() {
			fill(0);
			// forward hand
			push();
			translate(gameChar_x + 10, gameChar_y - 20);
			translate(-15, 0);
			rotate(PI / 3);
			rect(0, 0, 5, 14, 2);
			pop();
			// forward leg
			push();
			translate(gameChar_x + 6, gameChar_y - 5);
			translate(-8, 1);
			rotate(-PI / 8);
			rect(0, 0, 8, 6);
			pop();
			// trunk leaning forward
			push();
			translate(gameChar_x - 8, gameChar_y - 20);
			translate(3, -2);
			rotate(PI / 8);
			fill(255, 0, 0);
			rect(0, 0, 15, 16);
			pop();
			// back hand
			push();
			translate(gameChar_x - 15, gameChar_y - 20);
			translate(15, 5);
			rotate(-PI / 3);
			rect(0, 0, 5, 14, 2);
			pop();
			// head
			fill(200, 150, 150);
			stroke(0);
			strokeWeight(2);
			ellipse(gameChar_x, gameChar_y - 30, 29);
			// eyes
			fill(0);
			noStroke();
			ellipse(gameChar_x + 7, gameChar_y - 30, 5);
			// lips
			stroke(0);
			strokeWeight(2);
			line(gameChar_x + 3, gameChar_y - 22, gameChar_x + 10, gameChar_y - 22);
			// hat
			fill(0);
			noStroke();
			strokeWeight(1);
			beginShape();
			curveVertex(gameChar_x - 15, gameChar_y - 26);
			curveVertex(gameChar_x - 20, gameChar_y - 26);
			curveVertex(gameChar_x - 21, gameChar_y - 60);
			curveVertex(gameChar_x + 14, gameChar_y - 67);
			curveVertex(gameChar_x + 20, gameChar_y - 31);
			curveVertex(gameChar_x + 15, gameChar_y - 31);
			endShape();
			// back leg
			push();
			translate(gameChar_x - 6, gameChar_y - 5);
			translate(-4, -2.5);
			rotate(0);
			fill(0);
			rect(0, 0, 8, 6);
			pop();
		}

		function jumpingLeft() {
			fill(0);
			// back hand
			push();
			translate(gameChar_x + 10, gameChar_y - 20);
			translate(-6, 5);
			rotate(-PI / 3);
			rect(0, 0, 5, 14, 2);
			pop();
			// forward leg
			push();
			translate(gameChar_x - 6, gameChar_y - 5);
			translate(3, -2.5);
			rotate(PI / 8);
			rect(0, 0, 8, 6);
			pop();
			// trunk leaning forward
			push();
			translate(gameChar_x - 8, gameChar_y - 20);
			translate(1, 4);
			rotate(-PI / 8);
			fill(255, 0, 0);
			rect(0, 0, 15, 16);
			pop();
			// forward hand
			push();
			translate(gameChar_x + 10, gameChar_y - 20);
			translate(-11, 2);
			rotate(PI / 3);
			rect(0, 0, 5, 14, 2);
			pop();
			// head
			fill(200, 150, 150);
			stroke(0);
			strokeWeight(2);
			ellipse(gameChar_x, gameChar_y - 30, 29);
			// eyes
			fill(0);
			noStroke();
			ellipse(gameChar_x - 7, gameChar_y - 30, 5);
			// lips
			stroke(0);
			strokeWeight(2);
			line(gameChar_x - 10, gameChar_y - 22, gameChar_x - 3, gameChar_y - 22);
			// hat
			fill(0);
			noStroke();
			strokeWeight(1);
			beginShape();
			curveVertex(gameChar_x - 15, gameChar_y - 31);
			curveVertex(gameChar_x - 20, gameChar_y - 31);
			curveVertex(gameChar_x - 12, gameChar_y - 67);
			curveVertex(gameChar_x + 23, gameChar_y - 60);
			curveVertex(gameChar_x + 20, gameChar_y - 26);
			curveVertex(gameChar_x + 15, gameChar_y - 26);
			endShape();
			// back leg
			fill(0);
			push();
			translate(gameChar_x + 6, gameChar_y - 5);
			translate(-2, -2);
			rotate(0);
			rect(0, 0, 8, 6);
			pop();
		}

		function standingFacingForwards() {
			// trunk
			fill(255, 0, 0);
			rect(gameChar_x - 10, gameChar_y - 35, 20, 30);
			// hands
			fill(0);
			rect(gameChar_x - 15, gameChar_y - 20, 5, 14, 2);
			rect(gameChar_x + 10, gameChar_y - 20, 5, 14, 2);
			// head
			fill(200, 150, 150);
			stroke(0);
			strokeWeight(2);
			ellipse(gameChar_x, gameChar_y - 30, 29);
			// eyes
			fill(0);
			noStroke();
			ellipse(gameChar_x - 7, gameChar_y - 30, 5);
			ellipse(gameChar_x + 7, gameChar_y - 30, 5);
			// lips
			stroke(0);
			strokeWeight(2);
			line(gameChar_x - 5, gameChar_y - 22, gameChar_x + 5, gameChar_y - 22);
			// hat
			fill(0);
			noStroke();
			strokeWeight(1);
			beginShape();
			curveVertex(gameChar_x - 15, gameChar_y - 30);
			curveVertex(gameChar_x - 20, gameChar_y - 30);
			curveVertex(gameChar_x - 20, gameChar_y - 70);
			curveVertex(gameChar_x + 20, gameChar_y - 70);
			curveVertex(gameChar_x + 20, gameChar_y - 30);
			curveVertex(gameChar_x + 15, gameChar_y - 30);
			endShape();

			// legs
			fill(0);
			rect(gameChar_x - 10, gameChar_y - 5, 8, 8);
			rect(gameChar_x + 2, gameChar_y - 5, 8, 8);
		}

	}
}

function _draw() {

	// Draw blue sky as a background
	background("LightSkyBlue");

	// Play the background music loop
	playBackgroundMusic();

	// Draw ground
	drawGround();

	// Draw cloud in the background with parallax
	push();
	translate(scrollPos / 2, 0);
	drawClouds();
	pop();

	// Draw mountains with parallax
	push();
	translate(scrollPos / 1.5, 0);
	drawMountains();
	pop();

	// Draw the trees and interactive objects as scrolling
	push();
	translate(scrollPos, 0);

	drawTrees();

	// Draw platforms.
	drawPlatforms();

	// Draw canyons. 
	drawCanyons();

	// Detect when character plummets in the canyon.
	isPlummeting = isOverCanyon && gameChar_y >= floorPos_y;

	// Check if any collectables are picked. 
	drawCollectables();

	drawFlagpole();

	drawEnemies();

	pop();

	// Draw game UI such as scores and messages
	game.drawUI();

	// Draw game character.

	character.draw();
	character.update();


	// Update real position of gameChar for collision detection.
	gameChar_world_x = character.worldX;

}

function draw() {

	// Draw blue sky as a background
	background("LightSkyBlue");

	// Play the background music loop
	playBackgroundMusic();

	// Draw ground
	drawGround();

	// Draw cloud in the background with parallax
	push();
	translate(scrollPos / 2, 0);
	drawClouds();
	pop();

	// Draw mountains with parallax
	push();
	translate(scrollPos / 1.5, 0);
	drawMountains();
	pop();

	// Draw the trees and interactive objects as scrolling
	push();
	translate(scrollPos, 0);

	drawTrees();

	// Draw platforms.
	drawPlatforms();

	// Draw canyons. 
	drawCanyons();

	// Detect when character plummets in the canyon.
	isPlummeting = isOverCanyon && gameChar_y >= floorPos_y;

	// Check if any collectables are picked. 
	drawCollectables();

	drawFlagpole();

	drawEnemies();

	pop();

	// Draw game UI such as scores and messages
	game.drawUI();

	// Draw game character.
	drawGameChar();

	// Logic to make the game character move or the background scroll.
	// No movement when plummeting.
	if (!isPlummeting) {
		// If the left arrow key is pressed.
		if (isMovingLeft) {
			// Move the game character if we did not step into 
			// the first 20% of the canvas width.
			if (gameChar_x > width * 0.2) {
				gameChar_x -= 5;
			} else {
				// Scroll the background to the right when we reach 
				// the first 20% of canvas width.
				scrollPos += 5;
			}
		}
		// If the right arrow key is pressed.
		if (isMovingRight) {
			// Move the game character if we did not step into 
			// the first 20% of the canvas width.
			if (gameChar_x < width * 0.8) {
				gameChar_x += 5;
			} else {
				// Scroll the background to the left when we reach 
				// the first 20% of canvas width.
				scrollPos -= 5;
			}
		}
	}

	// Logic to make the game character rise and fall.

	isFalling = gameChar_y < floorPos_y;
	// Add gravity when character is above floor.
	if (isFalling) {
		//Check if the game character is on one of the platforms
		for (var i = 0; i < platforms.length; i++) {
			isOnPlatform = platforms[i].checkContact(gameChar_world_x, gameChar_y);
			if (isOnPlatform) {
				break;
			}
		}
		// Fall if not standing on platform
		if (isOnPlatform) {
			isFalling = false;
		} else {
			gameChar_y += 4;
		}
	}
	// Gravity is somewhat stronger in the canyon.
	if (isPlummeting) {
		gameChar_y += 6;
		//gameChar_x = canyonCenter;
		// if (gameChar_x < canyonCenter) {
		// 	gameChar_x += (canyonCenter - gameChar_x) / 2;
		// } else {
		// 	gameChar_x -= (gameChar_x - canyonCenter - 30) / 2;
		// }
	}

	// Check whether character fell of the screen and died.
	checkPlayerDie();

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;


}