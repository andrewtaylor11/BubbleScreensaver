const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Bubble {
  constructor(x, y, radius, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.borderColor = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0"); // Generate random border color once
    this.velocity = velocity;
    this.overlapping = false; // Flag to track overlapping
    this.passThrough = false; // Flag to allow passing through other bubbles
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0)'; // Transparent fill color
    ctx.strokeStyle = this.borderColor; // Use the pre-generated random color for the border
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // Add a small white ellipse in the upper-left quadrant with rotation
    const smallEllipseRadiusX = this.radius / 8; // Adjust the horizontal size as needed
    const smallEllipseRadiusY = this.radius / 4; // Adjust the vertical size as needed
    const angle = Math.PI / 4; // Adjust the angle in radians

    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x - this.radius / 2, this.y - this.radius / 2);
    ctx.rotate(angle);
    ctx.ellipse(0, 0, smallEllipseRadiusX, smallEllipseRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    // Update the bubble position
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // Define the invisible boundary
    const boundaryOffset = 200;

    // Check if the bubble is outside the canvas, considering the invisible boundary
    if (this.x - this.radius < -boundaryOffset || this.x + this.radius > canvas.width + boundaryOffset) {
      this.velocity.x = -this.velocity.x; // Reverse the horizontal velocity
    }

    if (this.y - this.radius < -boundaryOffset || this.y + this.radius > canvas.height + boundaryOffset) {
      this.velocity.y = -this.velocity.y; // Reverse the vertical velocity
    }
  }

  checkCollision(otherBubble) {
    const dx = this.x - otherBubble.x;
    const dy = this.y - otherBubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + otherBubble.radius) {
      // Bubbles are colliding
      if (!this.passThrough && !otherBubble.passThrough) {
        this.resolveCollision(otherBubble);
        this.passThrough = true; // Set the passThrough flag
        otherBubble.passThrough = true; // Set the passThrough flag for the other bubble
      }
    } else {
      this.passThrough = false; // Reset the passThrough flag
      otherBubble.passThrough = false; // Reset the passThrough flag for the other bubble
    }
  }// 

  resolveCollision(otherBubble) {
    const dx = this.x - otherBubble.x;
    const dy = this.y - otherBubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate unit vectors
    const nx = dx / distance;
    const ny = dy / distance;

    // Calculate relative velocity
    const relativeVelocityX = this.velocity.x - otherBubble.velocity.x;
    const relativeVelocityY = this.velocity.y - otherBubble.velocity.y;

    // Calculate relative velocity in the normal direction
    const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

    // Apply the collision response with coefficient of restitution
    const coefficientOfRestitution = 0.8; // Adjust as needed

    // Calculate impulse based on coefficient of restitution
    const impulse = (2 * dotProduct) / (1 / this.radius + 1 / otherBubble.radius) * coefficientOfRestitution;

    this.velocity.x -= impulse * nx / this.radius;
    this.velocity.y -= impulse * ny / this.radius;
    otherBubble.velocity.x += impulse * nx / otherBubble.radius;
    otherBubble.velocity.y += impulse * ny / otherBubble.radius;

    // Separate the bubbles to avoid sticking together
    const overlap = (this.radius + otherBubble.radius) - distance;
    const separationX = (overlap / 2) * nx;
    const separationY = (overlap / 2) * ny;

    this.x += separationX;
    this.y += separationY;
    otherBubble.x -= separationX;
    otherBubble.y -= separationY;
  }

  resetBubble() {
    // Reset the bubble properties when it goes offscreen
    const spawnSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (spawnSide) {
      case 0: // top
        x = Math.random() * canvas.width;
        y = -this.radius;
        break;
      case 1: // right
        x = canvas.width + this.radius;
        y = Math.random() * canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * canvas.width;
        y = canvas.height + this.radius;
        break;
      case 3: // left
        x = -this.radius;
        y = Math.random() * canvas.height;
        break;
      default:
        break;
    }

    this.x = x;
    this.y = y;
    this.borderColor = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
    this.velocity = {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1
    };
    this.overlapping = false;
    this.passThrough = false; // Reset the passThrough flag
  }
}

const bubbles = [];

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function createBubble() {
  const radius = randomRange(100, 100);
  const spawnSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  let x, y;

  switch (spawnSide) {
    case 0: // top
      x = Math.random() * canvas.width;
      y = -radius;
      break;
    case 1: // right
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
      break;
    case 2: // bottom
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
      break;
    case 3: // left
      x = -radius;
      y = Math.random() * canvas.height;
      break;
    default:
      break;
  }
  const velocity = {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1
  };

  bubbles.push(new Bubble(x, y, radius, velocity));
}

function spawnNewBubbles() {
  const numBubblesToSpawn = 3; // Adjust the number as needed

  for (let i = 0; i < numBubblesToSpawn; i++) {
    createBubble();
  }

  // Set a timer to spawn more bubbles again
  const spawnTime = randomRange(5000, 10000); // Adjust the range as needed (milliseconds)
  setTimeout(spawnNewBubbles, spawnTime);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw all bubbles
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      bubbles[i].checkCollision(bubbles[j]);
    }

    bubbles[i].update();
    bubbles[i].draw();
  }

  requestAnimationFrame(animate);
}

// Start with the first bubbles
// createBubble();
// createBubble();
// createBubble();

// Initiate the timer to spawn more bubbles
spawnNewBubbles();

// Initiate the animation
animate();