var canvas;
var cone;

function preload() {
	cone = loadModel("images/iceCreamCone.obj");
	cream = loadModel("images/iceCream.obj");
	flavourA = loadImage("images/cream1.png"); // Vanilla
	flavourB = loadImage("images/cream2.png"); // Chocolate
	flavourC = loadImage("images/cream3.png"); // Strawberry
	noA = loadImage("images/num1.png");
	noB = loadImage("images/num2.png");
	noC = loadImage("images/num3.png");
	flavPalette = loadImage("images/flavours.png");
	coneTex = loadImage("images/cone.png");
	cam = createCapture(VIDEO);
	cam.hide();
}

function setup() {
	canvas = createCanvas(windowWidth,windowHeight,WEBGL);
	canvas.position(0,0);
	canvas.style('z-index','-1');
	angleMode(DEGREES);
	selFlavour = 2;
	selCone = 1;
	tipToggle = 0;
	orbitToggle = 0;
	tipVal = 0;
	noCursor();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function draw() {
	background('rgba(0,0,0,0)');
	if (orbitToggle) {orbitControl();}
	ambientLight(233);
	directionalLight(255,255,255,0,0,1);
	if (tipToggle != 0)	{tipVal = mouseX*0.3;}
	// Ice Cream Cone
	push();
		scale(3);
		rotateX(0);
		rotateY(frameCount * 0.2);
		rotateZ(180 - tipVal);
		if (selCone == 2) {normalMaterial();}
		else if (selCone == 1) {texture(coneTex);}
		model(cone);
		if (selFlavour == 2) {texture(flavourA);}
		else if (selFlavour == 1) {texture(flavourB);}
		else if (selFlavour == 3) {texture(flavourC);}
		model(cream);
	pop();
	// You
	push();
		translate(-5*mouseY+windowWidth,-300,-800 + mouseY);
		rotateY(180);
		scale(2);
		tex = texture(cam);
		tex.scale(-1,1);
		sphere(150);
	pop();
	
	// Palette
	var palWidth = flavPalette.width/2;
	var palHeight = flavPalette.height/2;
	var palPaddingX = windowWidth/24;
	var palPaddingY = windowHeight/24;
	var flavWidth = palWidth/4;
	var flavHeight = palHeight/3;
	push();
		texture(flavPalette);
		// div by 2: planes draw from centre outwards
		translate((windowWidth-palWidth -palPaddingX )/2,(windowHeight-palHeight -palPaddingY)/2,10);
		plane(palWidth, palHeight);
		translate(0,flavHeight/2 - 6,1); // Flavour 1
		texture(flavourA);
		plane(flavWidth, flavHeight);
		translate(0,0,1); // Num 2
		texture(noB);
		plane(noB.width/2,noB.height/2);
		translate(-1* palWidth/2 + flavWidth,0,-1); // Flavour 2
		texture(flavourB);
		plane(flavWidth, flavHeight);
		translate(0,0,1); // Num 1
		texture(noA);
		plane(noA.width/2,noA.height/2);
		translate(palWidth - flavWidth*2,0,-1); // Flavour 3
		texture(flavourC);
		plane(flavWidth, flavHeight);
		translate(0,0,1); // Num 3
		texture(noC);
		plane(noC.width/2,noC.height/2);
	pop();
}

function keyPressed() {
	// Flavour selection
	if (key == '1') {selFlavour = 1;} // Chocolate
	else if (key == '2') {selFlavour = 2;} // Vanilla
	else if (key == '3') {selFlavour = 3;} // Strawberry
	else if (key == '9') {selCone = 1;} // Normals Cone
	else if (key == '0') {selCone = 2;} // Authentic Cone
	else if (key == 'q') // Enable / Disable Cone Tipping Movement
		{
			if (tipToggle == 1) {tipToggle = 0;}
			else {tipToggle = 1;}
		}
	else if (key == 'w') // Enable / Disable Orbit Control
		{
			if (orbitToggle == 1) {orbitToggle = 0;}
			else {orbitToggle = 1;}
		}
}

function mousePressed() {
	// Select flavour via pixel colour
	// NOTE: doesn't load the gpu display properly in WEBGL mode...
	//		without some major digging, probably wont work
	loadPixels();
	var pixel = [0,0,0];
	pixel[0] = pixels[4*mouseX + 4*windowWidth*mouseY]
	pixel[1] = pixels[4*mouseX + 4*windowWidth*mouseY +1]
	pixel[2] = pixels[4*mouseX + 4*windowWidth*mouseY +2]
	
	if (mouseIsPressed) {
		if (pixel == [255,116,166]) {
			selFlavour = 3;
		} else if (pixel == [72,42,8]) {
			selFlavour = 2;
		} else if (pixel == [255,255,255]) {
			selFlavour = 1;
		}
		console.log(pixel[0]);
	}
	
}



