/* 
The Lake
by Tyson Moll, for Experiment 3 of Creation & Computation, D.F. Masters project

Requires a 'paddle controller'.

Credit: Bryan Ma's p5.js demo for raycasting, https://gist.github.com/whoisbma/8fd99f3679d8246e74a22b20bfa606ee#file-raycast-demo-js
Kate Hartman and Nick Puckett's serial code for arduino to p5 via JSON.
Audio by Feyla, used with permission. https://soundcloud.com/feyla
 */
 
// Control signals
var orientX = 0;      
var orientY = 0;
var orientZ = 0;
// Neutral Positions
var neutX = 80;
var neutY = 0;
var neutZ = 0;
var lastOrientX = neutX; // Last recorded OX, for delta check 
var lastOrientY = neutY; 
var lastOrientZ = neutZ; 

var shifterDist = 0;	// Shaft spacing, 's4', in cm (at the moment)
var shifterMax = 20; // STUB: replace with correct value (deep right)
var shifterMin = 4; // Deep Left Paddle


// Serial Communication
var serialPortName = "COM8"; // Controller #1
// STUB: Auto-detection for controllers


var worldMap = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,2,2,2,0,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,6,6,6,6,6,1],
	[1,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,4,6,6,1],
	[1,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,6,6,1],
	[1,2,0,0,0,0,0,5,0,0,0,5,0,0,5,0,0,0,5,0,0,6,0,0,0,6,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,1],
	[1,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,2,0,0,0,0,0,5,0,0,0,5,0,0,5,0,0,0,5,0,0,6,0,0,0,6,1],
	[1,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,6,6,1],
	[1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,6,6,1],
	[1,2,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,0,6,0,0,0,6,1],
	[1,0,0,0,0,0,2,0,0,2,0,0,0,7,7,7,0,7,0,7,0,0,0,0,0,0,1],
	[1,0,0,0,0,2,3,0,0,3,2,0,0,7,4,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,3,3,3,3,3,3,0,0,3,2,0,0,7,4,0,0,0,0,0,0,0,0,0,0,6,1],
	[1,3,0,0,0,0,3,0,0,3,2,0,0,7,7,7,0,7,0,7,0,6,0,0,0,6,1],
	[1,3,0,0,0,0,3,0,0,3,2,2,0,0,0,7,0,7,0,7,0,6,0,0,6,6,1],
	[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,7,0,7,0,6,0,0,6,6,1],
	[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,7,0,6,0,0,0,6,1],
	[1,3,0,0,0,3,3,0,0,3,2,2,0,0,0,7,0,7,7,7,0,0,0,2,2,2,1],
	[1,3,0,0,0,4,3,0,0,3,2,0,0,0,0,7,7,7,0,0,0,0,0,0,0,2,1],
	[1,3,3,3,4,4,3,3,3,3,2,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Player property vectors
var pos; 
var dir;
var planePlayer;

// Movement speed vars
var walkSpeed;
var rotSpeed;
var lastTime; // Tracks frame dropping

var serial;

// Constants
var Y_AXIS = 1;
var X_AXIS = 2;

function preload() {
	img_water = loadImage('assets/water.png'); // Protects video loop from seaming
	mus_flickering = loadSound('assets/flickering.mp3'); // BGM by Feyla
	
}



function setup() {
	var canv = createCanvas(windowWidth, windowHeight);
	canv.position(0,0);
  	fr = 30; // Frames per second 
	frameRate(fr); 
	pos = createVector(10, 10);
	dir = createVector(0, 1);
	planePlayer = createVector(1, 0);
	walkSpeed = 0.005; // Speed of movement (keys)
	rotSpeed = 0.002; // Speed of rotation (keys)
	fadeLayer = windowHeight/5;
	vid = createVideo('assets/water.mp4'); // Water effect
	vid.hide(); 

	c1 = color(255); // Gradient colours
	c2 = color(255, 255, 255,0);
	
	curSpeed = 0;
	calibFlag = 0; // Used for displaying debug info and calibration tracking
	linRampCol = 0; // Some visual tools (colour ramp, mirroring variables)
	linRampMir = 1;
	fadeMirror = 2;
	
	curRotation = 0; // Angle
	targetRotation = 0; // Target values for current properties to approach 
	targetSpeed = 0;
	lastOrientX = orientX; // Last recorded position 
	lastOrientY = orientY;
	lastOrientZ = orientZ;
	maxSpeed = 0.003; // Limits on speed and rotation 
	maxRot = 0.03;
	
	serialInit();
}

function draw() {
  background(200);
  linRampCol += linRampMir; // Used when drawing walls for special properties 
  if ((linRampCol >= 255) || (linRampCol <= 0)) {linRampMir *= -1}
  var dt = millis() - lastTime; // difference in time 
  updatePlayer(dt); // Update's player attributes (keyboard method) 
  paddle(dt); // Trigger paddle controls 
  
  image(img_water,0,windowHeight/2,windowWidth,windowHeight/2); // Protects looping video from flicker
  image(vid,0,windowHeight/2,windowWidth,windowHeight/2); // Video to loop
  raycast(); // Raycasting method
  lastTime = millis();
  
  noStroke(); // Fog
  if ((fadeLayer >= windowHeight/4) || (fadeLayer <= windowHeight/6)) {
	  fadeMirror *= -1;
  } else {
	  fadeLayer += fadeMirror;
  }
  setGradient(0, fadeLayer, windowWidth, windowHeight - fadeLayer, c1, c2, Y_AXIS);
  fill(255);
  rect(0,0,windowWidth,fadeLayer);
  //drawMap(); // Draws 2d rep of map
  
  if (calibFlag == 0) {
	debugText(); // Show numbers
  }
}

function debugText() { // Displays serial input from controller 
	textSize(10);
	var textSpace = 10
	fill(0, 102, 153);
	text('X Rotation: ' + nf(orientX), 10, textSpace);
	text('Y Rotation: ' + nf(orientY), 10, textSpace * 2);
	text('Z Rotation: ' + nf(orientZ), 10, textSpace * 3);
	text('Shaft (cm): ' + nf(shifterDist), 10, textSpace * 4);
	text('Origin X: ' + nf(neutX), 10, textSpace * 5);
	text('Origin Y: ' + nf(neutY), 10, textSpace * 6);
	text('Origin Z: ' + nf(neutZ), 10, textSpace * 7);
	text('Cur. Speed: ' + nf(curSpeed) + '/' + nf(targetSpeed), 10, textSpace * 8);
	text('Cur. Rot: ' + nf(curRotation) + '/' + nf(targetRotation), 10, textSpace * 9);
}

function serialInit() {
	
	//Setting up the serial port
	serial = new p5.SerialPort();     //create the serial port object
	serial.open(serialPortName); //open the serialport. determined 
	serial.on('open',ardCon);         //open the socket connection and execute the ardCon callback
	serial.on('data',dataReceived);   //when data is received execute the dataReceived function

}


function paddle(dt) { // Paddle operation 
	
	var paddleDipThr = 15; // half dip range: Must dip this deep to count as a paddle
	var paddleSwingBack = 50; // range of backswing
	var paddleSwingForw = 30; // range of forward swing
	var paddleSwingSens = 1; // Min angle change

	var easingSpeed = 0.05;
	var frictSpeed = 0.00001;
	
	var rotInc = 0.03;
	var speedInc = 0.0002;

	var easingRotation = 0.05;
	var flagBrake = 1;
	
	var shiftNotchB = 21; // Threshold for right paddle 
	var shiftNotchA = 29; // Threshold for left paddle 
	var shiftMax = 50; // Prevents weird values (actually 45)
	var shiftMin = 2; // Minimum sensitive distance is 3, 2 is a safety
	
    var dx = abs(lastOrientX - orientX);
	var goodDip = (shifterDist < shiftMax) && (shifterDist > shiftMin)
	var sigMove = (dx > paddleSwingSens) 
	
	calibFlag = (keyIsDown(UP_ARROW));
	
	if (goodDip) { // Check if the paddle is submerged in water 
		// If left or right paddle detected and valid shaft length...
		if ((orientY >= neutY + paddleDipThr) && (shifterDist > shiftNotchA)) { // Right
			
			if (sigMove) { // Check if movement is significant
				if (lastOrientX > orientX) { // Forward
					// Increase Speed 
					speedAdj(-1 *speedInc/2);
					// Rotate CCW
					rotAdj(-1 * rotInc/2);
				} else if (lastOrientX < orientX) { // Backward
					// Decrease Speed
					speedAdj(speedInc);		
					// Rotate CW 
					rotAdj(rotInc);
				}
			} else { // Water Brake
				// Rotate CW 
				rotAdj(rotInc);
				flagBrake = 2;
			} 
			
		} else if ((orientY <= neutY - paddleDipThr) && (shifterDist < shiftNotchB)) { // Left
			
			if (sigMove) { // Check if movement is significant
				if (lastOrientX < orientX) { // Forward
					// Increase Speed 
					speedAdj(-1 * speedInc/2);
					// Rotate CW
					rotAdj(rotInc/2);
				} else if (lastOrientX > orientX) { // Backward
					// Decrease Speed 
					speedAdj(speedInc);
					// Rotate CCW 
					rotAdj(-1 * rotInc);
				}
			} else { // Water Brake
				// Rotate CW 
				rotAdj(-1 * rotInc);
				flagBrake = 2;
			}
			
		} else { // Neutral 
			// Stub: Relax and enjoy the finer things in life. 
		}
	}
	
	targetSpeed = round(1000000 * targetSpeed)/1000000 // Rounding to keep values clean 
	targetRotation = round(1000000 * targetRotation)/1000000
	
	// Ease towards targets
	curSpeed = lerp(targetSpeed,curSpeed,0.4);
	curRotation = lerp(targetRotation,curRotation,0.2);
	
	curSpeed = round(1000000 * targetSpeed)/1000000
	curRotation = round(1000000 * targetRotation)/1000000
	
	// Friction
	if (curSpeed > 0) {
		targetSpeed -= frictSpeed * flagBrake;
		if (targetSpeed < 0) {targetSpeed  = 0;}
	}

	if (curSpeed < 0) {
		targetSpeed += frictSpeed * flagBrake;
		if (targetSpeed > 0) {targetSpeed  = 0;}
	}
	
	dir.x = cos(curRotation);  // Determine vector properties 
	 dir.y = -sin(curRotation);
	 planePlayer.x = sin(curRotation);
	  planePlayer.y = cos(curRotation);

	if (isNaN(dt)) {
		// Stub: protection against invalid values 
	} else {
		// Check if empty before moving...
		if (worldMap[floor(pos.x + dir.x * curSpeed * dt)][floor(pos.y)] === 0) {
		  pos.x += dir.x * curSpeed * dt;
		}
		if (worldMap[floor(pos.x)][floor(pos.y + dir.y * curSpeed * dt)] === 0) {
		  pos.y += dir.y * curSpeed * dt;
		}
	}
	
	lastOrientX = orientX;
	lastOrientY = orientY;
	lastOrientZ = orientZ;
}

function speedAdj(speed) {
	targetSpeed += speed;
	if (targetSpeed > maxSpeed) {targetSpeed = maxSpeed}
	if (targetSpeed < -1*maxSpeed) {targetSpeed = -1*maxSpeed}
}

function rotAdj(rotat) {
	targetRotation += rotat;
}

function mousePressed() { // Calibration and security fix 

		vid.loop(); // set the video to loop and start playing
	if (!mus_flickering.isPlaying()) {
		mus_flickering.loop();
	}
	
	// Set Neutral paddle position on first click
	neutX = orientX;
	neutY = orientY;
	neutZ = orientZ;
	
	calibFlag = 1; // Calibration completed
}

function drawMap() { // Draws a visual representation of the world map 
  background(255);
  
  for (var i = 0; i < worldMap.length; i++) {
    for (var j = 0; j < worldMap[0].length; j++) {
      if (worldMap[i][j] !== 0) {
        fill(0);
        // strokeWeight(3);
        // stroke(0);
        rect(i * 20, j * 20, 20, 20);
      } else {
        fill(255);
        // stroke(0);
        rect(i * 20, j * 20, 20, 20);
      }
    }
  }

  fill(255, 100, 255);
  ellipse(pos.x * 20, pos.y * 20, 20, 20);
  line(pos.x * 20, pos.y * 20, (pos.x + dir.x) * 20, (pos.y + dir.y) * 20);
}

function updatePlayer(dt) { // Keyboard method, attr: Bryan Ma 
  dir.x = cos(curRotation);
  dir.y = -sin(curRotation);
  planePlayer.x = sin(curRotation);
  planePlayer.y = cos(curRotation);
  
  // Check keys for movement
  rotateLeft = keyIsDown(LEFT_ARROW);
  rotateRight = keyIsDown(RIGHT_ARROW);
  moveForward = keyIsDown(UP_ARROW);
  moveBackward = keyIsDown(DOWN_ARROW);

  if (rotateLeft) {
    curRotation += rotSpeed * dt;
  }
  if (rotateRight) {
    curRotation -= rotSpeed * dt;
  }
  if (moveForward) {
	// Check if empty before moving...
    if (worldMap[floor(pos.x + dir.x * walkSpeed * dt)][floor(pos.y)] === 0) {
      pos.x += dir.x * walkSpeed * dt;
    }
    if (worldMap[floor(pos.x)][floor(pos.y + dir.y * walkSpeed * dt)] === 0) {
      pos.y += dir.y * walkSpeed * dt;
    }
  }
  if (moveBackward) {
    if (worldMap[floor(pos.x - dir.x * walkSpeed * dt)][floor(pos.y)] === 0) {
      pos.x -= dir.x * walkSpeed * dt;
    }
    if (worldMap[floor(pos.x)][floor(pos.y - dir.y * walkSpeed * dt)] === 0) {
      pos.y -= dir.y * walkSpeed * dt;
    }
  }
}

function raycast() { // Raycasting method (attr: Bryan Ma)
  var rayPos = createVector(0,0);
  var rayDir = createVector(0,0);
  
  //cast rays
  for (var x = 0; x < width; x++) {
    var cameraX = (2 * x / width) - 1;
    rayPos.set(pos.x, pos.y);
    rayDir.set(dir.x + planePlayer.x * cameraX, dir.y + planePlayer.y * cameraX);
    
    var mapX = floor(rayPos.x);
    var mapY = floor(rayPos.y);
    
    var sideDistX;
    var sideDistY;
    
    var scaleX = 1/rayDir.x;
    var scaleY = 1/rayDir.y;
    var deltaDistX = (createVector(1, rayDir.y * scaleX)).mag();
    var deltaDistY = (createVector(1, rayDir.x * scaleY)).mag();
    
    var wallDist;
    
    var stepX;
    var stepY;
    
    var hit = 0;
    var side = 0;
    
    if (rayDir.x < 0) {
      stepX = -1;
      sideDistX = (rayPos.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - rayPos.x) * deltaDistX;
    }
    
    if (rayDir.y < 0) {
      stepY = -1;
      sideDistY = (rayPos.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - rayPos.y) * deltaDistY;
    }
    
    //DDA
    while (hit === 0) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }
      if (worldMap[mapX][mapY] > 0) {
        hit = 1;
      }
    }
    
    //calculate the distance to the wall
    if (side === 0) {
      wallDist = abs((mapX - rayPos.x + (1 - stepX) / 2) / rayDir.x);
    } else {
      wallDist = abs((mapY - rayPos.y + (1 - stepY) / 2) / rayDir.y);
    }
    
    var lineHeight = abs(height/wallDist);
    lineHeight = min(lineHeight, height);
    
    if (mapX >= 0 && mapY >= 0) { // Stroke colours for walls 
      switch (worldMap[mapX][mapY]) {
		case 0:
		break;
		case 1:
			stroke(200,200,200,floor(linRampCol/2 + 122));
        break;
		case 2:
			stroke(152, 90, 100);
        break;
		case 3:
			stroke(66,152,150);
        break;
	    case 4:
			stroke(random(linRampCol),random(linRampCol),random(linRampCol));
        break;
	    case 5:
			stroke(156,132,68,floor(linRampCol/2 +30));
        break;
		case 6:
			stroke(152,88,138);
        break;
		case 7:
			stroke(50 + random(20),200 + random(40),70 + random(20));
        break;
      }
    }

    if (side == 1) { // Alternate colours for different side of wall (cheap shading technique)
      switch (worldMap[mapX][mapY]) {
		case 0:
		break;
		case 1:
			stroke(200,200,200,floor(linRampCol/2 + 122));
        break;
		case 2:
			stroke(152/2, 90/2, 100/2);
        break;
		case 3:
			stroke(66/2,152/2,150/2);
        break;
	    case 4:
			stroke(random(linRampCol),random(linRampCol),random(linRampCol));
        break;
	    case 5:
			stroke(156,132,68,255 - floor(linRampCol/3 +30));
        break;
		case 6:
			stroke(152/2,88/2,138/2);
        break;
		case 7:
			stroke(50 + random(20),200 + random(40),70 + random(20));
        break;
      }
    }
    
    var startY = height/2 - lineHeight/2;
    line(x, startY, x, startY + lineHeight);
  }
}



function setGradient(x, y, w, h, c1, c2, axis) { // Quick gradient function from the p5.js documentation example

  noFill();

  if (axis == Y_AXIS) {  // Top to bottom gradient
    for (var i = y; i <= y+h; i++) {
      var inter = map(i, y, y+h, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x+w, i);
    }
  }  
  else if (axis == X_AXIS) {  // Left to right gradient
    for (var i = x; i <= x+w; i++) {
      var inter = map(i, x, x+w, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y+h);
    }
  }
}

function dataReceived() {  //this function is called every time data is received
  
	var rawData = serial.readStringUntil('\r\n'); //read the incoming string until it sees a newline
    console.log(rawData);    	//uncomment this line to see the incoming string in the console     
    
	if(rawData.length>1)                      //check that there is something in the string
    {                   
		// Read information 
		shifterDist = JSON.parse(rawData).s1;       //the parameter value .s1 must match the parameter name created within the arduino file
		orientX = JSON.parse(rawData).s2; 
		orientY = JSON.parse(rawData).s3; 
		orientZ = JSON.parse(rawData).s4;
		
		// STUB: Array support for JSON properties?
	}
}

function ardCon() {
	
	// STUB: Connected message
	console.log("connected!");
}

function windowResized() { // Triggered when window is resized
	resizeCanvas(windowWidth,windowHeight);
}

