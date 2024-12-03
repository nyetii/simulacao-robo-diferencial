const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const vlSlider = document.getElementById("vlSlider");
const vlValue = document.getElementById("vlValue");
const vrSlider = document.getElementById("vrSlider");
const vrValue = document.getElementById("vrValue");

class Environment {
  constructor(width, height, imageSrc) {
    this.width = width;
    this.height = height;
    this.trail = [];
    this.maxTrailLength = 3000;
    this.obstacles = [
      { x: 182, y: 165, width: 33, height: 12 },
      { x: 172, y: 432, width: 10, height: 33 },
      { x: 448, y: 438, width: 41, height: 12 },
      { x: 544, y: 43, width: 6, height: 105 },
      { x: 550, y: 43, width: 337, height: 6 },
      { x: 881, y: 49, width: 6, height: 292 },
      { x: 544, y: 335, width: 337, height: 6 },
      { x: 544, y: 218, width: 6, height: 117 }
    ];
    this.image = new Image();
    this.image.src = imageSrc;
  }

  drawBackground()
  {
    ctx.drawImage(this.image, 0, 0, this.width, this.height);
  }

  drawTrail() {
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    for (let i = 0; i < this.trail.length - 1; i++) {
      ctx.moveTo(this.trail[i].x, this.trail[i].y);
      ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
    }
    ctx.stroke();
  }

  updateTrail(pos) {
    this.trail.push(pos);
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }

  writeInfo(vl, vr, theta) {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Esquerda: ${vl}`, 50, this.height - 150);
    ctx.fillText(`Direita: ${vr}`, 50, this.height - 100);
    ctx.fillText(`θ: ${Math.round(theta)}°`, 50, this.height - 50);
  }

  drawObstacles() {
  }
}

class Robot {
  constructor(x, y, width, imageSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.theta = 0;
    this.vl = 0;
    this.vr = 0;
    this.maxSpeed = 0.02 * 3779.52;
    this.minSpeed = -this.maxSpeed;

    this.image = new Image();
    this.image.src = imageSrc;
  }

  move(dt, obstacles) {
    if (this.detectCollision(obstacles) && this.vl !== 0 && this.vr !== 0) {
      this.vl = 0;
      this.vr = 0;
      return;
    }

    this.x += ((this.vl + this.vr) / 2) * Math.cos(this.theta) * dt;
    this.y -= ((this.vl + this.vr) / 2) * Math.sin(this.theta) * dt;
    this.theta += ((this.vr - this.vl) / this.width) * dt;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;

    vlSlider.value = this.vl;
    vlValue.textContent = Math.trunc(this.vl*100)/100;
    vrSlider.value = this.vr;
    vrValue.textContent = Math.trunc(this.vr*100)/100;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.theta);
    ctx.drawImage(this.image, -25, -25, 50, 50);
    ctx.restore();
  }

  drawVelocity() {
    const velocity = (this.vl + this.vr) / 2;
    const vx = velocity * Math.cos(this.theta);
    const vy = -velocity * Math.sin(this.theta);

    // Vetor de velocidade
    ctx.strokeStyle = "aqua";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    this.canvas_arrow(ctx, this.x, this.y, this.x + vx * 0.3, this.y + vy * 0.3);
    ctx.stroke();
    ctx.closePath();
  }
  
  canvas_arrow(context, fromx, fromy, tox, toy) {
    var headlen = 15;
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.moveTo(tox, toy)
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  }

  handleKeyInput(event) {
    if (event.type === "keydown") {
      if (event.key === "q") this.vl += 0.001 * 3779.52;
      if (event.key === "a") this.vl -= 0.001 * 3779.52;
      if (event.key === "e") this.vr += 0.001 * 3779.52;
      if (event.key === "d") this.vr -= 0.001 * 3779.52;
    }
  }

  detectCollision(obstacles) {
    const robotBox = {
      x: this.x - this.width / 2,
      y: this.y - this.width / 2,
      width: this.width,
      height: this.width,
    };

    return obstacles.some((obstacle) => {
      return (
        robotBox.x < obstacle.x + obstacle.width &&
        robotBox.x + robotBox.width > obstacle.x &&
        robotBox.y < obstacle.y + obstacle.height &&
        robotBox.y + robotBox.height > obstacle.y
      );
    });
  }
}

const env = new Environment(1200, 800, "background.png");
const robot = new Robot(200, 200, 0.01 * 3779.52, "robot.png");

let lastTime = performance.now();

function animate(time) {
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  env.drawBackground();

  robot.move(dt, env.obstacles);
  env.updateTrail({ x: robot.x, y: robot.y });

  env.drawTrail();
  robot.draw();
  robot.drawVelocity();
  env.writeInfo(robot.vl.toFixed(2), robot.vr.toFixed(2), (robot.theta * 180 / Math.PI).toFixed(2));

  requestAnimationFrame(animate);
}

vlSlider.addEventListener("input", () => {
  robot.vl = parseFloat(vlSlider.value);
  vlValue.textContent = vlSlider.value;
});

vrSlider.addEventListener("input", () => {
  robot.vr = parseFloat(vrSlider.value);
  vrValue.textContent = vrSlider.value;
});

window.addEventListener("keydown", (event) => robot.handleKeyInput(event));
requestAnimationFrame(animate);
