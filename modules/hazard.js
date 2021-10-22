import Entity from './entity.js';
export default class Hazard extends Entity {
  constructor(position, velocity, radius, health, speed, color, abilities, slope, timeToLive) {
    super(position, velocity, radius, health, color, 1);
    this.slope = slope;
    this.timeToLive = timeToLive;
    abilities.forEach(ability => this[ability] = true);
    this.hasSplit = false;
    this.hazardSpawnTimer = 0;
    this.targettedEntityReference = null;
    this.speed = speed;
    this.maxSpeed = speed;
    this.rotation = 0;
    this.scale = 1;
  }
  evadeProjectiles() {

  }
  spawnHazards() {

  }
  splitOnDeath() {

  }
  attackTurrets() {
    this.targettedEntityReference = null;
    let minDistance = 200;
    for (const index in this.gameReference.entities) {
      const entityReference = this.gameReference.entities[index];
      console.log(entityReference);
      const distance = Math.sqrt(Math.pow(entityReference.position.x - this.position.x, 2) + Math.pow(entityReference.position.y - this.position.y, 2));
      if (distance <= minDistance) {
        minDistance = distance;
        this.targettedEntityReference = entityReference;
      }
    }
    if (this.targettedEntityReference !== null) {
      this.slope = Math.atan2(this.targettedEntityReference.position.y - this.position.y, this.targettedEntityReference.position.x - this.position.x);
      this.speed = this.maxSpeed;
    } else this.speed = this.maxSpeed / 4;
  }
  animate() {
    super.animate();
    if (this.evadesProjectiles) {
      this.evadeProjectiles();
    }
    if (this.attacksTurrets) {
      this.attackTurrets();
    }
    if (this.splitsOnDeath) {
      this.splitOnDeath();
    }
    if (this.spawnsHazards) {
      this.spawnHazards();
    }
  }
  collide() {

  }
  draw(p5) {
    p5.strokeWeight(5);

    function burst(x, y, radius) {
      p5.beginShape();
      for (let i = 0; i <= 10; i++) {
        p5.vertex(x + Math.sin(i * Math.PI / 4) * radius * 1.2, y + Math.cos(i * Math.PI / 4) * radius * 1.2);
        p5.vertex(x + Math.sin(Math.PI * (0.125 + i * 0.25)) * radius * 0.8, y + Math.cos(Math.PI * (0.125 + i * 0.25)) * radius * 0.8);
      }
      p5.endShape();
    }

    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.scale(this.scale);
    p5.push();
    p5.rotate(this.rotation + this.slope);

    // burst (spiky shape) outline
    p5.noFill();
    p5.stroke(80, 80, 80, this.opacity.master);
    burst(0, 0, this.radius);

    // burst
    p5.fill(`rgba(${this.color.replace(/[^\d\s,]/g,'')}, ${this.opacity.master})`);

    p5.noStroke();
    burst(0, 0, this.radius - 3.6);

    // damage indicator (red flash when damaged)
    p5.fill(230, 80, 80, this.opacity.master * this.opacity.damageIndicator);
    burst(0, 0, this.radius + 3.6);
    p5.pop();
    p5.noStroke();

    // health bar
    p5.fill(80, this.opacity.master * this.opacity.healthBar);
    p5.rect(-this.radius - 2, this.radius * 1.2 + 8, this.radius * 2 + 4, 12);
    p5.fill(0, 150, 100, this.opacity.master * this.opacity.healthBar);
    p5.rect(-this.radius + 2, this.radius * 1.2 + 12, this.healthDisplay / this.maxHealth * (this.radius * 2 - 4), 4);
    p5.pop();
  }
}