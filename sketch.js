/* 
Credits:
A collaboration between Joyce and Spade.
Flow field reference from https://editor.p5js.org/arthurrc/sketches/Bya9WiAnm (flow field reference.
p5.js documentation from https://p5js.org/reference/.
*/

let inc = 0.1;
let scl = 15;
let cols, rows;
let zoff = 0;
let particles = [];
let flowField = [];
let field = [];
let jellyfish; // Position of the jellyfish
let jellyIndex = 0; //which jellyfish image
let rotation;
let jellyMove = []
let size = 50;
let speed = 3;

var soundFile;

function preload() {
  jellyMove[0] = loadImage('Idle.png');
  jellyMove[1] = loadImage('Move1.png');
  jellyMove[2] = loadImage('Move2.png');
  jellyMove[3] = loadImage('Move3.png');
  jellyMove[4] = loadImage('Move4.png');
  jellyMove[5] = loadImage('Move5.png');
  soundFile = loadSound("sound.mp3");
}

function setup() {
  createCanvas(600, 600);
  imageMode(CENTER);
  angleMode(DEGREES);
  soundFile.play();
  
  
  cols = floor(width / scl);
  rows = floor(height / scl);

  for (let i = 0; i < 4000; i++) { // Reduced number of particles for                                       performance
    particles[i] = new Particle();
  }

  jellyfish = createVector(width / 2, height / 2); // Initialize the                                                       jellyfish position
  background(255);
}

function draw() {
  background(155,197,233, 30);
  generateFlowField();
  updateParticles();
  
  // Draw the jellyfish as a half-circle
  drawJelly(jellyfish.x, jellyfish.y, rotation, jellyIndex);
 
  // Update jellyfish position based on key presses
  if (keyIsDown(UP_ARROW) && jellyfish.y >= 0) {
    jellyfish.y -= speed;
    rotation = 0;
    iterate();
  }
  if (keyIsDown(DOWN_ARROW) && jellyfish.y + size <= height){
    jellyfish.y += speed;
    rotation = 180
    iterate();
  } 
  if (keyIsDown(LEFT_ARROW) && jellyfish.x >=0) {
    jellyfish.x -= speed;
    rotation = 270;
    iterate()
  }
  if (keyIsDown(RIGHT_ARROW) && jellyfish.x + size <= width){
    jellyfish.x += speed;
    rotation = 90;
    iterate();
  } 
}

function drawJelly(x, y, rotation, index){
  push();
  translate(x, y);
  rotate(rotation);
  img = jellyMove[index];
  image(img, 0, 0, size * 2, size * 2);
  pop();
}

//did this since it wasn't iterating properly when it was a key other than the right key
function iterate(){
  if (jellyIndex == 5){
    jellyIndex = 1;
  }
  else {
    jellyIndex +=1;
  }
}

function generateFlowField() {
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(0.5);
      field[index] = v;
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.0005;
  }
  return field; // Return the generated flow field
}


let flowFields = []; // Array to store multiple different flow fields
let numberOfFields = 60; // Number of different, random flow fields we want
// Generate multiple flow fields
for (let n = 0; n < numberOfFields; n++) {
    flowFields[n] = generateFlowField(); // Store each flow field in the array
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(random(flowFields));
    particles[i].update();
    particles[i].edges();
    particles[i].checkJellyfishCollision(jellyfish); 
    particles[i].show();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = speed;
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  follow(vectors) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  // Display particle trail //
  show() {
    stroke(random(25), random(205), random(255)); 
    strokeWeight(3);
    point(this.pos.x, this.pos.y);
  }
  
  /*
   * Handle flow redirection when particles approach borders
   */
  edges() {
    /* Left & right borders */
    if (this.pos.x > width - 5) {
      this.pos.x = width - 5; // Reset particle position if approaching RIGHT border
      this.vel.x *= -1; // Reverse the horizontal velocity
    } else if (this.pos.x < 5) {
      this.pos.x = 10; // Reset particle position if approaching LEFT border
      this.vel.x *= -1; // Reverse the horizontal velocity
    }
    
    /* Top & bottom borders */
    if (this.pos.y > height - 5) {
      this.pos.y = height - 5; 
      this.vel.y *= -1; 
    } else if (this.pos.y < 5) {
      this.pos.y = 5; 
      this.vel.y *= -1; 
    }
  }

  /* Redirect particles from colliding with Jellyfish player */
  checkJellyfishCollision(jellyfish) {
    let distance = dist(this.pos.x, this.pos.y, jellyfish.x, jellyfish.y);
    if (distance <= 100) { 
      // We want to create a direction vector from jellyfish to particles
      let steerDirection = p5.Vector.sub(this.pos, jellyfish);
      steerDirection.setMag(this.maxSpeed); // Magnitude = particle max speed to create the illusion of a swift 'steer away'
      this.vel = steerDirection; // Redirect to different direction
    }
  }

}


