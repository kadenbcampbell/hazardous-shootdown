/**
 * MIT License
 * 
 * Copyright (c) 2021 Kaden Campbell
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * HAZARDOUS SHOOTDOWN
 * created on 8/30/2021
 * last updated on 9/8/2021
 * 
 * HOW TO PLAY
 * use the mouse cursor to aim
 * press left mouse button to shoot
 * press left shift to show debug info
 * shoot hazards to destroy them before they destroy you
 * 
 * LEADERBOARD
 * 1.   Kaden Campbell   4173
 */

/// <reference path="./p5.global-mode.d.ts"/>

/**
 * DIFFICULTY
 * increases by 0.01 per second
 * 
 * AS DIFFICULTY INCREASES:
 * increased probability to spawn higher difficulty hazards
 * decreased delay between hazard spawns
 * 
 * press left shift to show current difficulty, spawn timer, and hazard spawn probabilities
 */
let difficulty = 1.00;

/**
 * SCORE
 * destroying hazards increases score
 * different hazard types reward different point values
 */
let score = 0;

// settings
let colors, turret, hazard, projectile;

// crosshair object
let crosshair = { x: 0, y: 0, rad: 45 };

// game item arrays
let hazards = [];
let turrets = [];
let projectiles = [];

function setup() {
  colorMode(RGB, 100, 100, 100, 1);

  colors = {
    blue: color(0, 70, 90),
    black: color(30, 30, 30),
    red: color(90, 30, 30),
    green: color(0, 90, 40),
    purple: color(80, 50, 100),
    yellow: color(100, 90, 30),
    orange: color(90, 50, 30),
    gray: color(60, 60, 60),
    indigo: color(50, 60, 100),
  };

  turret = {
    rotSpeed: 4,   // rotation speed    (degrees per frame)
    spread: 8,     // angle of spread   (degrees)
    fireRate: 4,   // fire rate         (shots per second)
    hp: 32,        // health points     (damage required to destroy it)
  };

  projectile = {
    rad: 12,    // radius           (pixels)
    speed: 6,   // movement speed   (pixels per frame)
    hp: 2,      // health points    (damage required to destroy it)
  };

  hazard = [
    {
      color: colors.red,   // color
      rad: 16,             // radius           (pixels)
      speed: 2,            // movement speed   (pixels per frame)
      hp: 4,               // health points    (damage required to destroy it)
      abilities: [],       // abilities        (options: "evadeProjectiles", "splitOnDeath", or "spawnHazards")
      /**
       * SPAWNING PROBABILITY
       * 
       * WEIGHT
       * probability of spawning the current hazard type is calculated by dividing the current weight by the total weight (of all hazard types)
       * (probability = weight / totalWeight)
       * 
       * MODIFIER
       * as the difficulty increases, the weight changes based on the modifier
       * modified weight is calculated by multiplying the base weight by the current difficulty raised to the power of the modifier
       * (modifiedWeight = weight * pow(difficulty, modifier))
       * 
       * EXAMPLES (AT 2.00 DIFFICULTY)
       * WEIGHT   MODIFIER   DIFFICULTY   =   MODIFIED WEIGHT
       * 100      +1.0       2.00         =    200.000
       * 100      -1.0       2.00         =     50.000
       * 100      +5.0       2.00         =   3200.000
       * 100      -5.0       2.00         =      3.125
       * 100      +0.1       2.00         =    107.177
       * 100      -0.1       2.00         =     93.303
      */
      spawnProbability: { weight: 400, modifier: -1, },
    },
    {
      color: colors.yellow,
      rad: 12,
      speed: 6,
      hp: 2,
      abilities: ["evadeProjectiles"],
      spawnProbability: { weight: 160, modifier: -0.6 },
    },
    {
      color: colors.green,
      rad: 20,
      speed: 2,
      hp: 6,
      abilities: ["splitOnDeath"],
      spawnProbability: { weight: 80, modifier: -0.2 },
    },
    {
      color: colors.orange,
      rad: 24,
      speed: 4,
      hp: 12,
      abilities: [],
      spawnProbability: { weight: 40, modifier: 0.2 },
    },
    {
      color: colors.purple,
      rad: 32,
      speed: 0.6,
      hp: 32,
      abilities: ["spawnHazards"],
      spawnProbability: { weight: 5, modifier: 0.6 },
    },
    {
      color: colors.indigo,
      rad: 48,
      speed: 0.2,
      hp: 48,
      abilities: ["spawnHazards"],
      spawnProbability: { weight: 1, modifier: 1.0 },
    },
  ];

  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  frameRate(60);
  strokeWeight(5);
  textAlign(CENTER, CENTER);
  textFont(loadFont("assets/Roboto-Black.ttf"));

  // create player turret
  turrets.push(new Turret({ x: windowWidth / 2, y: windowHeight / 2 }, ...Object.values(turret)));
}

class Turret {
  constructor(pos, rotSpeed, spread, fireRate, hp) {
    this.pos = { x: pos.x, y: pos.y };
    this.vel = { x: 0, y: 0 };
    this.rotSpeed = rotSpeed;
    this.spread = spread;
    this.fireRate = fireRate;
    this.hp = hp;
    this.maxHp = hp;
    this.hpDisplay = hp;
    this.recoil = 0;
    this.scale = 0;
    this.rot = 270;
    this.hazardTimer = 0;
    this.projectileTimer = 0;
    this.isActive = true;
    this.opacity = { master: 1, hpBar: 0, damageIndicator: 0 };
  }
  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(this.scale);
    rotate(this.rot);
    // translate(-10, 0);
    rotate(-this.rot);

    // health bar
    colors.black.setAlpha(this.opacity.master * this.opacity.hpBar);
    colors.green.setAlpha(this.opacity.master * this.opacity.hpBar);

    noStroke();
    fill(colors.black);
    rect(-27, 38, 54, 12);
    fill(colors.green);
    rect(-23, 42, this.hpDisplay / this.maxHp * 46, 4);

    // barrel
    colors.black.setAlpha(this.opacity.master);
    colors.gray.setAlpha(this.opacity.master);
    colors.red.setAlpha(this.opacity.master * this.opacity.damageIndicator);

    rotate(this.rot);
    translate(-this.recoil, 0);
    stroke(colors.black);
    noFill();
    rect(0, -10, 50, 20); // outline

    noStroke();
    fill(colors.gray);
    rect(2.5, -7.5, 46, 16);

    fill(colors.red);
    rect(-2.5, -12.5, 56, 26); // damage indicator

    // body
    colors.blue.setAlpha(this.opacity.master);

    rotate(-this.rot);
    noFill();
    stroke(colors.black);
    hexagon(0, 0, 30); // outline

    noStroke();
    fill(colors.blue);
    hexagon(0, 0, 30 - 2.6);

    fill(colors.red);
    hexagon(0, 0, 30 + 2.6); // damage indicator

    // score
    fill(colors.black);
    textSize(60 * pow(0.75, score.toString().length));
    text(score, 0, -5 + score.toString().length / 2);

    pop();
  }
  animate(i) {

    if (this.isActive) {
      // spawn animation
      if (this.scale < 1) this.scale += 0.1;
      if (this.opacity.master < 1) this.opacity.master += 0.1;

      // decrease damage indicator opacity (red flash when damaged)
      this.opacity.damageIndicator -= 0.05;

      // hide and show health bar
      if (this.hp === this.maxHp && this.opacity.hpBar > 0) this.opacity.hpBar -= 0.1;
      if (this.hp < this.maxHp && this.opacity.hpBar < 1) this.opacity.hpBar += 0.1;

      // mark turret inactive once health points have depleted
      if (this.hp <= 0) this.isActive = false;

      // regenerate health over time
      if (this.hp < this.maxHp && frameCount % 60 === 0) this.hp++;
    } else {
      // death animation
      this.scale += 0.05;
      if (this.opacity.master > 0) this.opacity.master -= 0.1;
      else turrets.splice(i, 1);
    }

    // animate health bar
    this.hpDisplay += (this.hp - this.hpDisplay) / 2;

    // rotate turret to mouse
    let a1 = atan2(crosshair.y - this.pos.y, crosshair.x - this.pos.x),
      a2 = atan2(sin(this.rot), cos(this.rot));
    if (abs(a2 - a1) <= this.rotSpeed) {
      this.rot = a1;
    } else {
      let a = (a1 - a2);
      a += a < 0 ? 360 : a >= 360 ? -360 : 0;
      this.rot += a < 180 ? this.rotSpeed : -this.rotSpeed;
      this.rot += this.rot < 0 ? 360 : this.rot >= 360 ? -360 : 0;
    }

    // animate recoil effect when shooting
    if (this.recoil > 0) this.recoil--;
  }
  collide() {
    hazards.forEach(h => {
      let distance = dist(h.pos.x, h.pos.y, this.pos.x, this.pos.y)
      if (distance < 30 + h.rad + 10 && this.isActive && h.isActive) {
        let overlap = h.rad + 30 + 10 - distance;
        let slope = atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x);
        let vel = sqrt(sq(h.vel.x) + sq(h.vel.y));

        // redirect after collision
        h.vel.x = cos(slope) * vel;
        h.vel.y = sin(slope) * vel;

        // prevent overlap
        h.pos.x += cos(slope) * overlap;
        h.pos.y += sin(slope) * overlap;

        // apply damage
        if (this.hp > 0) this.hp--;
        if (h.hp > 0) h.hp--;

        // animate damage indicator
        h.opacity.damageIndicator = 1;
        this.opacity.damageIndicator = 1;
      }
    });
    projectiles.forEach(p => {
      let distance = dist(p.pos.x, p.pos.y, this.pos.x, this.pos.y)
      if (distance <= 30 + p.rad + 10 && this.isActive && p.isActive) {
        let overlap = p.rad + 30 + 10 - distance;
        let slope = atan2(p.pos.y - this.pos.y, p.pos.x - this.pos.x);
        let vel = sqrt(sq(p.vel.x) + sq(p.vel.y));

        // redirect after collision
        p.vel.x = cos(slope) * vel;
        p.vel.y = sin(slope) * vel;

        // prevent overlap
        p.pos.x += cos(slope) * overlap;
        p.pos.y += sin(slope) * overlap;
      }
    });
  }
  shootProjectiles() {
    if (this.isActive) {
      if (mouseIsPressed) {
        // shoot projectile when timer depletes
        if (this.projectileTimer === 0) {
          // apply recoil to turret (knockback effect when shooting)
          this.recoil = 5;
          let pos = {
            x: this.pos.x + cos(this.rot) * (15 + projectile.rad / 2), // x position
            y: this.pos.y + sin(this.rot) * (15 + projectile.rad / 2), // y position
          },
            slope = this.rot + random(-this.spread / 2, this.spread / 2); // slope
          projectiles.push(new Projectile(pos, slope, projectile.rad, projectile.speed, projectile.hp));
          // reset projectile timer to fire rate
          this.projectileTimer = 60 / this.fireRate;
        }
      }
      // decrement projectile timer
      if (this.projectileTimer > 0) this.projectileTimer--;
    }
  }
  spawnHazards() {
    // spawn hazard when hazard timer depletes
    if (this.hazardTimer <= 0) {
      let angle = random(360);
      let pos = {
        x: windowWidth / 2 + cos(angle) * 500,
        y: windowHeight / 2 + sin(angle) * 500,
      };
      let slope = atan2(this.pos.y - pos.y, this.pos.x - pos.x);
      let vel = { x: 0, y: 0 };

      // determine total weight of all hazard types
      let modifiedWeight = [], total = 0;
      hazard.forEach((h, i) => {
        modifiedWeight[i] = h.spawnProbability.weight * pow(difficulty, h.spawnProbability.modifier);
        total += modifiedWeight[i];
      });

      // determine hazard type to spawn
      let roll = random(total), type;
      hazard.forEach((h, i) => {
        if (typeof type === "undefined" && roll < modifiedWeight[i]) type = i;
        else roll -= modifiedWeight[i];
      });

      hazards.push(new Hazard(pos, slope, vel, ...Object.values(hazard[type])));
      // reset hazard timer based on current difficulty
      this.hazardTimer = 240 / sqrt(difficulty);
    }
    // decrement hazard timer
    this.hazardTimer--;
  }
}

class Hazard {
  constructor(pos, slope, vel, color, rad, speed, hp, abilities) {
    this.pos = { x: pos.x, y: pos.y }; // position
    this.vel = vel;                    // velocity
    this.rad = rad;                    // radius (pixels)
    this.maxRad = rad;                 // max radius
    this.speed = speed;                // movement speed (pixels per frame)
    this.hp = hp;                      // health points
    this.maxHp = hp;                   // max health points
    this.color = color;                // color
    this.hpDisplay = hp;               // health point display
    this.rot = 0;                      // rotation (degrees)
    this.isActive = true;              // isActive?
    this.scale = 0;                    // scale
    this.timeToLive = rad * 144;       // time to live (frames)
    this.hazardTimer = 0;              // hazard spawn timer (for hazards with "mothership" ability)
    this.hasSplit = false;             // has split? 
    this.slope = slope;                // slope (direction of travel)
    this.opacity = {
      master: 1,                       // master opacity
      hpBar: 0,                        // health bar opacity
      damageIndicator: 0,              // damage indicator opacity (red flash when damaged)
    };
    this.abilities = abilities;        // abilities
    this.target = { found: false, index: null };
  }
  draw() {
    // set opacity
    colors.black.setAlpha(this.opacity.master);
    this.color.setAlpha(this.opacity.master);

    push();
    translate(this.pos.x, this.pos.y);
    scale(this.scale);
    push();
    rotate(this.rot + this.slope);

    // burst (spiky shape) outline
    noFill();
    stroke(colors.black);
    burst(0, 0, this.rad);

    // burst
    fill(this.color);
    noStroke();
    burst(0, 0, this.rad - 3.6);

    // set damage indicator opacity
    colors.red.setAlpha(this.opacity.master * this.opacity.damageIndicator);

    // damage indicator (red flash when damaged)
    fill(colors.red);
    burst(0, 0, this.rad + 3.6);
    pop();
    noStroke();

    // set health bar opacity
    colors.black.setAlpha(this.opacity.master * this.opacity.hpBar);
    colors.green.setAlpha(this.opacity.master * this.opacity.hpBar);

    // health bar
    fill(colors.black);
    rect(-this.rad - 2, this.rad * 1.2 + 8, this.rad * 2 + 4, 12);
    fill(colors.green);
    rect(-this.rad + 2, this.rad * 1.2 + 12, this.hpDisplay / this.maxHp * (this.rad * 2 - 4), 4);
    pop();
  }
  animate(i) {
    if (this.target.found) {
      // attack nearest turret within range
      this.slope = atan2(turrets[this.target.index].pos.y - this.pos.y, turrets[this.target.index].pos.x - this.pos.x);
      this.vel.x += (cos(this.slope) * this.speed - this.vel.x) / 25;
      this.vel.y += (sin(this.slope) * this.speed - this.vel.y) / 25;

      // decrement time to live
      this.timeToLive--;
    }
    else {
      // drift around idly
      this.vel.x += (cos(this.slope) * this.speed / 4 - this.vel.x) / 50;
      this.vel.y += (sin(this.slope) * this.speed / 4 - this.vel.y) / 50;

      // rapidly decrement time to live
      this.timeToLive -= 50;
    }

    if (this.isActive) {
      // spawn animation
      if (this.scale < 1) this.scale += 0.1;
      if (this.opacity.master < 1) this.opacity.master += 0.1;

      // hide and show health bar
      if (this.hp === this.maxHp && this.opacity.hpBar > 0) this.opacity.hpBar -= 0.1;
      if (this.hp < this.maxHp && this.opacity.hpBar < 1) this.opacity.hpBar += 0.1;

      // animate damage indicator (red flash when damaged)
      this.opacity.damageIndicator -= 0.05;
    } else {
      // death animation
      this.scale += 0.05;
      if (this.opacity.master > 0) this.opacity.master -= 0.1;
      else {
        // increase score
        score += floor(this.maxHp * difficulty);
        // delete hazard
        hazards.splice(i, 1);
      }
    }

    // "smoothly" update health point display to match health point value
    this.hpDisplay += (this.hp - this.hpDisplay) / 2;

    // mark hazard inactive once health points or time to live has depleted
    if (this.hp <= 0 || this.timeToLive <= 0) {
      this.isActive = false;
    }

    // update position based on velocity
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // rotate hazard based on net velocity ("spinning" effect)
    this.rot += (abs(this.vel.x) + abs(this.vel.y));

    // decrease radius as health points deplete ("shrinking" effect)
    this.rad = (this.hp / this.maxHp * 0.3 + 0.7) * this.maxRad;
  }
  collide(i) {
    hazards.forEach((h, j) => {
      let distance = dist(h.pos.x, h.pos.y, this.pos.x, this.pos.y);
      if (distance < h.rad + this.rad + 10 && this.isActive && h.isActive && i !== j) {
        let overlap = h.rad + this.rad + 10 - distance;
        let totalVel = sqrt(sq(this.vel.x) + sq(this.vel.y)) + sqrt(sq(h.vel.x) + sq(h.vel.y));

        // redirect after collision
        h.vel.x = cos(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * totalVel * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        h.vel.y = sin(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * totalVel * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        this.vel.x = cos(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * totalVel * sq(h.rad) / (sq(this.rad) + sq(h.rad));
        this.vel.y = sin(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * totalVel * sq(h.rad) / (sq(this.rad) + sq(h.rad));

        // prevent overlap
        h.pos.x += cos(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * overlap * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        h.pos.y += sin(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * overlap * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        this.pos.x += cos(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * overlap * sq(h.rad) / (sq(this.rad) + sq(h.rad));
        this.pos.y += sin(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * overlap * sq(h.rad) / (sq(this.rad) + sq(h.rad));
      }
    });
  }
  findTarget() {
    this.target.found = false;
    let minDistance = 1000;
    turrets.forEach((t, i) => {
      let distance = dist(t.pos.x, t.pos.y, this.pos.x, this.pos.y);
      if (distance <= minDistance) {
        minDistance = distance;
        this.target.index = i;
        this.target.found = true;
      }
    });
  }
  splitOnDeath() {
    if (!this.isActive && this.abilities.includes("splitOnDeath") && this.target.found && !this.hasSplit) {
      this.hasSplit = true;
      for (let i = 0; i < 3; i++) {
        let slope = random(360) + i * 120;
        let pos = {
          x: this.pos.x + cos(slope) * (this.rad + 12),
          y: this.pos.y + sin(slope) * (this.rad + 12),
        };
        let vel = {
          x: cos(slope) * this.speed * 4,
          y: sin(slope) * this.speed * 4,
        };
        let rad = this.maxRad * 0.7;
        let hp = this.maxHp / 2;
        let speed = this.speed * 2;
        hazards.push(new Hazard(pos, slope, vel, this.color, rad, speed, hp, []));
      }
    }
  }
  spawnHazards(i) {
    if (this.abilities.includes("spawnHazards") && this.target.found) {
      if (this.hazardTimer === 0) {
        let slope = atan2(turrets[this.target.index].pos.y - this.pos.y, turrets[this.target.index].pos.x - this.pos.x) - 90 + random(180);
        let pos = {
          x: this.pos.x + cos(slope) * (this.rad + 20),
          y: this.pos.y + sin(slope) * (this.rad + 20),
        };
        let rad = 12;
        let hp = 2;
        let vel = {
          x: cos(slope) * 8,
          y: sin(slope) * 8,
        };
        hazards.push(new Hazard(pos, slope, vel, this.color, rad, 6, hp, []));
        // reset hazard spawn timer
        this.hazardTimer = floor(1920 / this.maxRad);
      }
      else if (this.hazardTimer > 0) this.hazardTimer--; // decrement hazard spawn timer
    }
  }
  evadeProjectiles() {
    if (this.abilities.includes("evadeProjectiles")) {
      projectiles.forEach(p => {
        let distance = dist(p.pos.x, p.pos.y, this.pos.x, this.pos.y); // distance between projectile and hazard
        // check if projectile is near hazard
        if (distance <= (p.rad + this.rad + 10) * 2 && this.isActive && p.isActive) {
          // slope from projectile to hazard
          let slope = atan2(this.pos.y - p.pos.y, this.pos.x - p.pos.x);

          // move hazard away from projectile
          this.vel.x += cos(slope) * this.speed / 6;
          this.vel.y += sin(slope) * this.speed / 6;
        }
      });
    }
  }
}

class Projectile {
  constructor(pos, slope, rad, speed, hp) {
    this.pos = { x: pos.x, y: pos.y }; // position
    this.vel = {
      x: cos(slope) * speed,   // x velocity
      y: sin(slope) * speed,   // y velocity
    };
    this.maxRad = rad;        // maximum radius
    this.rad = rad;            // radius
    this.speed = speed;        // movement speed
    this.maxHp = hp;          // maximum health points
    this.hp = hp;              // health points
    this.slope = slope;        // direction of travel (degrees)
    this.rot = 0;              // rotation
    this.isActive = true;
    this.opacity = {
      master: 1,       // master opacity
      damageIndicator: 0, // damage indicator opacity
    };
    this.timeToLive = 300;   // time to live
    this.scale = 0;            // scale
  }
  draw() {
    // set opacity
    colors.black.setAlpha(this.opacity.master);
    colors.blue.setAlpha(this.opacity.master);
    colors.red.setAlpha(this.opacity.master * this.opacity.damageIndicator);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.slope + this.rot);
    scale(this.scale);

    // hexagon body outline
    noFill();
    stroke(colors.black);
    hexagon(0, 0, this.rad);

    // hexagonal body
    fill(colors.blue);
    noStroke();
    hexagon(0, 0, this.rad - 2.3);

    // damage indicator (red flash when damaged)
    fill(colors.red);
    hexagon(0, 0, this.rad + 2.3);
    pop();
  }
  animate(i) {
    if (this.isActive) {
      // spawn animation
      if (this.scale < 1) this.scale += 0.1;
      if (this.opacity.master < 1) this.opacity.master += 0.1;

      // animate damage indicator (red flash when damaged)
      this.opacity.damageIndicator -= 0.05;

      // decrement time to live 
      this.timeToLive--;

      // mark projectile as inactive once health or time to live has been depleted
      if (this.timeToLive <= 0 || this.hp <= 0) this.isActive = false;
    } else {
      // death animation
      this.scale += 0.05;
      if (this.opacity.master > 0) this.opacity.master -= 0.1;
      else projectiles.splice(i, 1); // delete projectile
    }

    // update position based on velocity
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // rotate projectile based on net velocity ("spinning" effect)
    this.rot += (abs(this.vel.x) + abs(this.vel.y));

    // decrase radius when damaged ("shrinking" effect)
    this.rad = (this.hp / this.maxHp * 0.3 + 0.7) * this.maxRad;
  }
  collide() {
    hazards.forEach(h => {
      let distance = dist(h.pos.x, h.pos.y, this.pos.x, this.pos.y);
      if (distance < h.rad + this.rad + 10 && this.isActive && h.isActive) {
        let overlap = h.rad + this.rad + 10 - distance;
        let totalVel = sqrt(sq(this.vel.x) + sq(this.vel.y)) + sqrt(sq(h.vel.x) + sq(h.vel.y));

        // redirect after collision
        h.vel.x = cos(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * totalVel * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        h.vel.y = sin(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * totalVel * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        this.vel.x = cos(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * totalVel * sq(h.rad) / (sq(this.rad) + sq(h.rad));
        this.vel.y = sin(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * totalVel * sq(h.rad) / (sq(this.rad) + sq(h.rad));

        // prevent overlap
        h.pos.x += cos(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * overlap * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        h.pos.y += sin(atan2(h.pos.y - this.pos.y, h.pos.x - this.pos.x)) * overlap * sq(this.rad) / (sq(this.rad) + sq(h.rad));
        this.pos.x += cos(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * overlap * sq(h.rad) / (sq(this.rad) + sq(h.rad));
        this.pos.y += sin(atan2(this.pos.y - h.pos.y, this.pos.x - h.pos.x)) * overlap * sq(h.rad) / (sq(this.rad) + sq(h.rad));

        // animate damage indicator
        h.opacity.damageIndicator = 1;
        this.opacity.damageIndicator = 1;

        // apply damage
        if (h.hp > 0) h.hp--;
        if (this.hp > 0) this.hp--;
      }
    });
  }
}

function draw() {
  background(100);

  projectiles.forEach((p, i) => {
    p.draw();
    p.collide();
  });

  hazards.forEach((h, i) => {
    h.draw();
    h.findTarget();
    h.collide(i);
    h.splitOnDeath();
    h.evadeProjectiles();
    h.spawnHazards(i);
  });

  turrets.forEach((t, i) => {
    t.draw();
    t.collide();
    t.spawnHazards();
    t.shootProjectiles();
  });

  // animate
  projectiles.forEach((p, i) => { p.animate(i) });
  hazards.forEach((h, i) => { h.animate(i) });
  turrets.forEach((t, i) => { t.animate(i) });

  // increase difficulty over time
  if (turrets.length) difficulty += 0.01 / 60;

  // show score
  if (!turrets.length) {
    push();
    colors.black.setAlpha(1);
    colors.red.setAlpha(1);
    strokeWeight(10);
    textSize(100);
    stroke(colors.black);
    fill(colors.red);
    text(score, windowWidth / 2, windowHeight / 2);
    pop();
  }

  // debug info (press left shift to show)
  if (keyIsDown(16)) {
    push();
    colors.black.setAlpha(1);
    colors.red.setAlpha(1);
    fill(colors.black);
    textAlign(LEFT, TOP);
    textSize(15);
    text(`difficulty: ${difficulty.toFixed(3)}×`, 10, 20);
    text(`spawn timer: ${(4 / sqrt(difficulty)).toFixed(2)} sec`, 10, 35);
    text(`hazard count: ${hazards.length}`, 10, 65);
    text(`projectile count: ${projectiles.length}`, 10, 80);
    text(`turret count: ${turrets.length}`, 10, 95);

    let modifiedWeight = [], totalWeight = 0;
    hazard.forEach((h, i) => {
      modifiedWeight[i] = h.spawnProbability.weight * pow(difficulty, h.spawnProbability.modifier);
      totalWeight += modifiedWeight[i];
    });

    let x = 0;
    hazard.forEach((h, i) => {
      h.color.setAlpha(1);
      noStroke();
      fill(h.color);
      rect(x, 0, modifiedWeight[i] / totalWeight * windowWidth, 10);
      x += modifiedWeight[i] / totalWeight * windowWidth;
    });
    pop();
  }

  // crosshair
  cursor(ARROW);
  if (focused) {
    cursor("NONE");
    push();
    translate(crosshair.x, crosshair.y);
    scale(crosshair.scale);
    strokeCap(PROJECT);
    colors.red.setAlpha(1);
    colors.black.setAlpha(1);
    for (let i = 0; i < 2; i++) {
      stroke(lerpColor(colors.black, colors.red, i));
      strokeWeight(9 - 6 * i);
      point(0, 0);
      noFill();
      for (let j = 0; j < 4; j++) {
        rotate(90);
        line(0, crosshair.rad * 0.3, 0, crosshair.rad * 0.7);
      }
      rect(-crosshair.rad / 2, -crosshair.rad / 2, crosshair.rad, crosshair.rad);
    }
    pop();
  }

  // move crosshair to cursor
  crosshair.x += (mouseX - crosshair.x) / 5;
  crosshair.y += (mouseY - crosshair.y) / 5;

  // "shrink" crosshair when mouse pressed
  crosshair.rad += ((mouseIsPressed ? 40 : 60) - crosshair.rad) / 5;
}

function windowResized() {
  // recenter turrets
  turrets.forEach(t => {
    t.pos.x = windowWidth / 2;
    t.pos.y = windowHeight / 2;
  });
  // resize canvas
  resizeCanvas(windowWidth, windowHeight);
}

function hexagon(x, y, rad) {
  beginShape();
  for (let i = 0; i <= 6; i++) {
    vertex(x + sin(i * 60) * rad, y + cos(i * 60) * rad);
  }
  endShape();
}

function burst(x, y, rad) {
  beginShape();
  for (let i = 0; i <= 10; i++) {
    vertex(x + sin(i * 45) * rad * 1.2, y + cos(i * 45) * rad * 1.2);
    vertex(x + sin(22.5 + i * 45) * rad * 0.8, y + cos(22.5 + i * 45) * rad * 0.8);
  }
  endShape();
}