// <reference path="p5.d.ts" />
/// <reference path="node_modules/@types/p5/lib/addons/p5.sound.d.ts" />
/// <reference path="node_modules/@types/p5/global.d.ts" />

//@ts-check

// Game world and character position variables.
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

// Game control variables.
var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isWithinCanyon;
var isOnPlatform;

// Scenery variables.
var trees_x;
var clouds;
var mountains;

// Interactive objects.
var canyons;
var collectables;
var platforms;
var enemies;

// Game mechanics variables.
var game_score;
var flagpole;
var lives;

var jumpSound;
var collectSound;
var plummetSound;
var backgroundSound;
var startGameSound;
var gameOverSound;
var lifeLostSound;
var levelUpSound;

var gameOverSoundPlayed;
var levelUpSoundPlayed;

function preload() {
	soundFormats("mp3");

	backgroundSound = loadSound("assets/background-loop.mp3");
	backgroundSound.setVolume(0.05);

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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function setup() {
	createCanvas(1024, 576);
	floorPos_y = height * 3 / 4;
	lives = 3;
	// Initialize the state of the game world.
	startGame();
}

function draw() {
	var canyonCenter;
	// Blue sky as a background.
	background("LightSkyBlue");

	// if (backgroundSound.isLoaded()) {
	// 	if (!backgroundSound.isPlaying()) {
	// 		backgroundSound.isLooping(true);
	// 		backgroundSound.play();
	// 	}
	// }

	// Green ground.
	noStroke();
	fill(0, 155, 0);
	rect(0, floorPos_y, width, height / 4);

	// implement cloud parallax
	push();
	translate(scrollPos / 2, 0);
	// Draw clouds.
	drawClouds();
	pop();

	push();
	translate(scrollPos / 1.5, 0);
	// Draw mountains.
	drawMountains();
	pop();


	// Scenery is rendered with horizontal scrolling.
	push();

	// Scroll the origin.
	translate(scrollPos, 0);

	// Draw the scenery.
	//drawClouds();
	//drawMountains();
	drawTrees();

	// Draw platforms.
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].render();
	}

	// Draw canyons. 
	// TODO: Introduce function drawCanyons().
	isWithinCanyon = false;
	for (var i = 0; i < canyons.length; i++) {
		checkCanyon(canyons[i]);
		drawCanyon(canyons[i]);
		isWithinCanyon = isWithinCanyon || canyons[i].inCanyon;
		if (canyons[i].inCanyon) {
			canyonCenter = scrollPos + canyons[i].x_pos;
			strokeWeight(2);
			stroke(0);
			//line(canyonCenter, 0, canyonCenter, height);
		}
	}
	// Detect when character plummets in the canyon.
	isPlummeting = isWithinCanyon && gameChar_y >= floorPos_y;




	// Check if any collectables are picked. 
	// TODO: Introduce function drawCollectables().
	for (var i = 0; i < collectables.length; i++) {
		if (!collectables[i].isCollected) {
			checkCollectable(collectables[i]);
			drawCollectable(collectables[i]);
		}
	}




	// Check if the flagpole is reached.
	if (!flagpole.isReached) {
		checkFlagpole();
	}
	// Draw the flagpole
	renderFlagpole();

	for (var i = 0; i < enemies.length; i++) {
		enemies[i].render();
		var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
		if (isContact) {
			if (lives > 0) {
				lives--;
				if (!lifeLostSound.isPlaying()) {
					lifeLostSound.play();
				}
				startGame();
				break;
			}
		}
	}
	pop();

	// Draw current game score.
	drawGameScore();

	if (lives < 1) {
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
		return;
	}

	if (flagpole.isReached) {
		var message = "Level complete.\r\nPress space to continue.";
		push();
		textAlign(CENTER);
		textSize(40);
		text(message, width / 2, height / 3 + 30);
		pop();
		drawGameChar();
		return;
	}

	// Draw game character.
	drawGameChar();

	// Logic to make the game character move or the background scroll.
	// No movement when plummeting.
	if (!isPlummeting) {
		// If the left arrow key is pressed.
		if (isLeft) {
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
		if (isRight) {
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

// ---------------------
// Key control functions
// ---------------------

function keyPressed() {
	// If statements to control the animation of the character 
	// when keys are pressed.
	// @ts-ignore

	if (flagpole.isReached) {
		if (key == " ") {
			startGame();
			return;
		} else {
			return;
		}
	}

	if (lives < 1) {
		if (key == " ") {
			lives = 3;
			startGame();
			return;
		} else {
			return;
		}
	}

	if (keyCode == LEFT_ARROW) {
		isLeft = true;
		// @ts-ignore
	} else if (keyCode == RIGHT_ARROW) {
		isRight = true;
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
	// @ts-ignore
	if (keyCode == LEFT_ARROW) {
		isLeft = false;
		// @ts-ignore
	} else if (keyCode == RIGHT_ARROW) {
		isRight = false;
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
	} else if (isLeft && isFalling) {
		jumpingLeft();
	} else if (isRight && isFalling) {
		jumpingRight();
	} else if (isLeft) {
		walkingLeft();
	} else if (isRight) {
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


// ----------------------------
// Background render functions.
// ----------------------------

function drawClouds() {
	for (var i = 0; i < clouds.length; i++) {
		drawCloud(clouds[i]);
	}
}

function drawCloud(cloud) {
	var x = cloud.x_pos;
	var y = cloud.y_pos;
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
	var x = mountain.x_pos;
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
	for (var i = 0; i < trees_x.length; i++) {
		drawTree(trees_x[i]);
	}
}

function drawTree(treePos_x) {
	var x = treePos_x;
	var y = floorPos_y;

	push();
	// crown
	fill(0, 140, 20);
	ellipse(x - 7, y - 112, 60, 60);
	ellipse(x - 17, y - 92, 70, 70);
	ellipse(x + 23, y - 102, 40, 40);
	// trunk
	fill(88, 53, 23);
	triangle(x - 3, y, x + 9, y, x + 3, y - 92);
	triangle(x + 3, y - 32, x + 3, y - 40, x - 17, y - 72);
	pop();
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

function drawCanyon(t_canyon) {
	var width = t_canyon.width;
	var x = t_canyon.x_pos;
	var floor = floorPos_y;
	var depth = height - floor + 40;
	var half = width / 2;
	var soil = color(79, 63, 33);
	var darkSoil = lerpColor(soil, color(0), 0.6);

	push();
	//right cliff
	fill(soil);
	beginShape();
	vertex(x + half, floor);
	vertex(x + half, height);
	vertex(x + half + 20, height);
	endShape(CLOSE);
	//left cliff
	beginShape();
	vertex(x - half, floor);
	vertex(x - half, height);
	vertex(x - half - 20, height);
	endShape(CLOSE);
	// bottom
	fill(soil);
	rect(x - half, floor + depth - 10, width, height - depth);
	// void
	fill(darkSoil);
	rect(x - half, floor, width, depth, 0, 0, 10, 10);
	pop();
}

function checkCanyon(t_canyon) {
	var leftWall = t_canyon.x_pos - t_canyon.width / 2;
	var rightWall = t_canyon.x_pos + t_canyon.width / 2;

	// Detect if character is within the canyon walls.
	t_canyon.inCanyon =
		(gameChar_world_x - 10 > leftWall) &&
		(gameChar_world_x + 10 < rightWall);
}

// ---------------------------------------------
// Collectable items render and check functions.
// ---------------------------------------------

function drawCollectable(t_collectable) {
	var x = t_collectable.x_pos;
	var y = t_collectable.y_pos;
	var size = t_collectable.size;

	push();
	textAlign(CENTER);
	textSize(size * 1.3);
	var emoji = "\uD83C\uDF96"; // medal
	text(emoji, x, y - 15);
	pop();
}

function checkCollectable(t_collectable) {
	// Game characted collects the item if close enough.
	const distance =
		dist(
			gameChar_world_x, gameChar_y - 30,
			t_collectable.x_pos, t_collectable.y_pos - 15);
	if (distance < 30) {
		t_collectable.isCollected = true;
		game_score++;
		collectSound.play();
	}
}

// Function that checks if value is within interval bounds.
function between(testValue, low, high, inclusive = true) {
	return inclusive ?
		testValue >= low && testValue <= high :
		testValue > low && testValue < high;
}

function drawGameScore() {
	fill(255);
	textSize(30);
	text(`Score: ${game_score}`, 20, 40);
	// Draw remaining lives as guardsman icons.
	var offset = width * 2 - 170;
	for (var i = 0; i < lives; i++) {
		renderGuardsmanIcon(offset + (i) * 55, 120);
	}
}

function renderGuardsmanIcon(x, y) {
	push();
	// Scale it to 50% of game character size.
	scale(0.5);
	// head
	fill(200, 150, 150);
	stroke(0);
	strokeWeight(2);
	ellipse(x, y - 30, 29);
	//eyes
	fill(0);
	noStroke();
	ellipse(x - 7, y - 30, 5);
	ellipse(x + 7, y - 30, 5);
	//lips
	stroke(0);
	strokeWeight(2);
	line(x - 5, y - 22, x + 5, y - 22);
	// hat
	fill(0);
	noStroke();
	strokeWeight(1);
	beginShape();
	curveVertex(x - 15, y - 30);
	curveVertex(x - 20, y - 30);
	curveVertex(x - 20, y - 70);
	curveVertex(x + 20, y - 70);
	curveVertex(x + 20, y - 30);
	curveVertex(x + 15, y - 30);
	endShape();
	pop();
}

function renderFlagpole() {
	push();
	// flagpole
	strokeWeight(5);
	stroke(88, 53, 23);
	strokeCap(SQUARE);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 150);
	// flag
	textSize(50);
	var emoji = "\u{1F1EC}\u{1F1E7}"; // UK flag
	if (flagpole.isReached) {
		if (!levelUpSound.isPlaying() && !levelUpSoundPlayed) {
			levelUpSound.play();
			levelUpSoundPlayed = true;
		}
		text(emoji, flagpole.x_pos, floorPos_y - 110);
	} else {
		text(emoji, flagpole.x_pos, floorPos_y);
	}
	pop();
}

function checkFlagpole() {
	var distance = abs(gameChar_world_x - flagpole.x_pos);
	flagpole.isReached = distance < 15;
}

function checkPlayerDie() {
	if (gameChar_y > height) {
		lives--;
		if (lives > 0) {
			startGame();
		}
	}
}

// Function that resets the state of the gamwe world.
function startGame() {
	// Initial position of game character.
	gameChar_x = width / 2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	var isOnPlatform = false;

	gameOverSoundPlayed = false;
	levelUpSoundPlayed = false;

	// Initialise arrays of scenery objects.
	trees_x = [-150, -320, -400, -800, 100, 200, 500, 1000, 1100, 1300, 1500];

	clouds = [{
			x_pos: -100,
			y_pos: 100,
			width: 80
		},
		{
			x_pos: -600,
			y_pos: 120,
			width: 120
		},
		{
			x_pos: -800,
			y_pos: 150,
			width: 150
		},
		{
			x_pos: 100,
			y_pos: 100,
			width: 80
		},
		{
			x_pos: 600,
			y_pos: 120,
			width: 120
		},
		{
			x_pos: 800,
			y_pos: 150,
			width: 150
		},
		{
			x_pos: 1100,
			y_pos: 100,
			width: 80
		},
		{
			x_pos: 1600,
			y_pos: 120,
			width: 120
		},
		{
			x_pos: 1800,
			y_pos: 150,
			width: 150
		}
	];

	mountains = [{
			x_pos: -20,
			height: 180,
			width: 360
		},
		{
			x_pos: -300,
			height: 50,
			width: 180
		},
		{
			x_pos: -500,
			height: 120,
			width: 360
		},
		{
			x_pos: -800,
			height: 280,
			width: 400
		},
		{
			x_pos: 20,
			height: 180,
			width: 360
		},
		{
			x_pos: 300,
			height: 50,
			width: 180
		},
		{
			x_pos: 500,
			height: 120,
			width: 360
		},
		{
			x_pos: 800,
			height: 280,
			width: 400
		},
		{
			x_pos: 1020,
			height: 180,
			width: 360
		},
		{
			x_pos: 1300,
			height: 50,
			width: 180
		},
		{
			x_pos: 1500,
			height: 120,
			width: 360
		},
		{
			x_pos: 1800,
			height: 280,
			width: 400
		}
	];

	canyons = [{
			x_pos: -230,
			width: 120,
			inCanyon: false
		},
		{
			x_pos: -600,
			width: 100,
			inCanyon: false
		},
		{
			x_pos: 300,
			width: 120,
			inCanyon: false
		},
		{
			x_pos: 700,
			width: 100,
			inCanyon: false
		},
		{
			x_pos: 1200,
			width: 120,
			inCanyon: false
		},
		{
			x_pos: 1700,
			width: 100,
			inCanyon: false
		}
	];

	collectables = [{
			x_pos: -500,
			y_pos: 400,
			size: 30,
			isCollected: false
		},
		{
			x_pos: -100,
			y_pos: 350,
			size: 30,
			isCollected: false
		},
		{
			x_pos: 200,
			y_pos: 400,
			size: 30,
			isCollected: false
		},
		{
			x_pos: 800,
			y_pos: 370,
			size: 30,
			isCollected: false
		},
		{
			x_pos: 1200,
			y_pos: 400,
			size: 30,
			isCollected: false
		},
		{
			x_pos: 1500,
			y_pos: 370,
			size: 30,
			isCollected: false
		}
	];

	platforms = [];
	platforms.push(createPlatforms(width / 2, 100, 1));
	platforms.push(createPlatforms(width / 2 - 200, 200, 2));
	platforms.push(createPlatforms(width / 2 + 100, 300, 3));

	enemies = [];
	this.enemies.push(new Enemy(width / 2 - 400, floorPos_y - 10, 100));

	game_score = 0;

	flagpole = {
		x_pos: 1900,
		isReached: false
	}

	if (!plummetSound.isPlaying() && !lifeLostSound.isPlaying()) {
		startGameSound.play();
	}
}


function Enemy(x, y, range) {
	this.x = x;
	this.y = y;
	this.range = range;
	this.currentX = x;
	this.inc = 1;

	this.update = function () {
		this.currentX += this.inc;
		if (this.currentX >= this.x + this.range) {
			this.inc = -1;
		} else if (this.currentX < this.x) {
			this.inc = 1;
		}
	}
	this.render = function () {
		this.update();
		push();
		textAlign(CENTER);
		textSize(50);
		var emoji = "👻"; // ghost
		text(emoji, this.currentX, this.y - 5);
		stroke(0);
		// line(this.currentX, 0, this.currentX, floorPos_y);
		// line(gameChar_world_x, 0, gameChar_world_x, floorPos_y);
		// line(this.currentX - 25, this.y, this.currentX + 25, this.y);
		// line(gameChar_world_x, 0, gameChar_world_x, floorPos_y);
		// line(gameChar_world_x - 25, gameChar_y, gameChar_world_x + 25, gameChar_y);
		pop();
	}
	this.checkContact = function (gc_x, gc_y) {
		var d = dist(gc_x, gc_y - 30, this.currentX, this.y - 30);
		if (d < 48) {
			return true;
		}
		return false;
	}
}

function createPlatforms(x, length, level = 1) {
	var p = {
		x: x,
		y: floorPos_y - level * 85,
		length: length,
		level: level,
		render: function () {
			push();
			strokeWeight(0.5);
			stroke(0, 140, 250);
			fill(0, 36, 125);
			rectMode(CENTER);
			rect(this.x, this.y, this.length, 20, 1);

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
		},
		checkContact: function (gc_x, gc_y) {
			if (gc_x + 15 > this.x - this.length / 2 && gc_x < this.x + this.length / 2) {
				var d = this.y - 10 - gc_y;
				if (d >= 0 && d < 5) {
					return true;
				}
			}
			return false;
		}
	};
	return p;
}