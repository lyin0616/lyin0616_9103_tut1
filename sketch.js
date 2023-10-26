let song; // Declare the audio file variable
let button; // Declare the play and pause button variable
let particles = []; // Declare an array to store particle objects

function preload() {
  song = loadSound("audio/sample-visualisation.mp3"); // Preload the audio file
}

function setup() {
  createCanvas(600, 500);
  colorMode(HSB); // Set the color mode to HSB
  angleMode(DEGREES); // Set the angle mode to degrees
  button = createButton("Play"); // Create a play button
  button.mousePressed(toggleSong); // Add mouse press event to the button

  fft = new p5.FFT(0.8, 512); // Create a new FFT analysis object

  song.connect(fft); // Add the song into the FFT's input
}

function draw() {
  // Give the user a hint on how to interact with the sketch
  if (getAudioContext().state !== "running") {
    background(0);
    textSize(20);
    fill(200, 200, 200);
    text("click the button below to play sound!", 10, 30);
    // Early exit of the draw loop
    return;
  }

  //Initialize variables
  let centroidplot = 0.0;
  let spectralCentroid = 0;

  background(0);

  // Request fresh data from the FFT analysis
  let spectrum = fft.analyze();
  let waveform = fft.waveform();

  translate(300, 200);

  // Draw the spectrum to show energy
  for (let i = 0; i < spectrum.length; i++) {
    let angle = map(i, 0, spectrum.length, 0, 360);
    let index = int(map(i, 0, 2 * PI, 0, 1024));
    let r = map(spectrum[i], 0, 255, 0, 200);
    let c1 = color(r, 200, 200);
    let c2 = color(200, r, 100);
    let col = lerpColor(c1, c2, random(1));

    // Use line elements to represent the spectrum
    stroke(i, 255, 255);
    strokeWeight(1);
    let x = r * cos(5 * angle);
    let y = r * sin(5 * angle);
    line(0, 0, x, y);

    // Use rectangle elements to represent the spectrum
    rectMode(CENTER);
    fill(col);
    stroke(i, i, 255);
    rect(0, 0, x, y);

    // Random particles are generated based on the value of the audio waveform
    if (random(0.01, 1) < waveform[index]) {
      particles.push(new particle(x - 150, y - 50, col));
    }
  }

  // Update and show particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].move();
    particles[i].show();
  }

  // The highest frequency measured in the FFT
  let nyquist = 22050;

  // Get the spectral centroid
  spectralCentroid = fft.getCentroid();

  // The mean_freq_index calculation is for the display.
  let mean_freq_index = spectralCentroid / (nyquist / spectrum.length);

  // Map the mean_freq_index to the width range of the window
  centroidplot = map(mean_freq_index, 0, spectrum.length, 0, width);

  stroke(255); // The line showing where the centroid is will be white
  strokeWeight(3);

  // Calculate the coordinates of the centroid
  let centroidplotX = centroidplot * cos(0);
  let centroidplotY = centroidplot * sin(0);

  line(0, 0, centroidplotX, centroidplotY);
  noStroke();
  fill(255);
  text("centroid: ", -280, 0);
  text(round(spectralCentroid) + " Hz", -280, 20);
}

// A function to switch the playing state of the audio
function toggleSong() {
  if (song.isPlaying()) {
    song.pause(); // Pause the audio if it is playing
    button.html("Play"); // Update button text
  } else {
    song.play(); // Play the audio if it is not playing
    button.html("Pause"); // Update button text
  }
}

// Constructors of particles
function particle(x, y, color) {
  this.x = x; // The x coordinate of the particle
  this.y = y; // The y coordinate of the particle
  this.color = color; // The color of the particle
  this.speedX = random(-0.3, 0.3); // The speed of the particle in the x direction
  this.speedY = random(-0.3, 0.3); // The speed of the particle in the y direction

  // Update x and y coordinates of the particle
  this.move = function () {
    this.x += this.speedX;
    this.y += this.speedY;
  };

  // Use ellipse to draw the particle
  this.show = function () {
    push();
    stroke(color);
    ellipse(this.x, this.y, 1, 1);
    pop();
  };
}
