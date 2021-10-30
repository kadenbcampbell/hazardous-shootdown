import Entity from './entity.js';
export default class Hazard extends Entity {
  constructor(p5, gameRef, entityIndex, position, velocity, acceleration, radius, health, speed, color, abilities, slope, timeToLive) {
    super(p5, gameRef, entityIndex, position, velocity, acceleration, radius, health, color, 1, speed);
    Object.assign(this, { slope, timeToLive });
    abilities.forEach(ability => this[ability] = true);
    this.hasSplit = false;
    this.hazardSpawnTimer = 0;
    this.targettedEntityRef = null;
    this.rotation = 0;
    this.scale = 0;
  }
  evadeProjectiles() {

  }
  spawnHazards() {

  }
  splitOnDeath() {

  }
  attackTurrets() {
    let targettedEntityRef = null;
    let minDistance = 1000;
    for (const index in this.gameRef.entities) {
      const entityRef = this.gameRef.entities[index];
      if (entityRef.constructor.name !== 'Turret') continue;
      const distance = Math.sqrt(Math.pow(entityRef.position.x - this.position.x, 2) + Math.pow(entityRef.position.y - this.position.y, 2));
      if (distance <= minDistance) {
        minDistance = distance;
        targettedEntityRef = entityRef;
      }
    }
    if (targettedEntityRef !== null) {
      this.slope = Math.atan2(targettedEntityRef.position.y - this.position.y, targettedEntityRef.position.x - this.position.x);
    }
    else this.slope = null;
  }
  updateAcceleration() {
    super.updateAcceleration();
    this.acceleration.x = 0;
    this.acceleration.y = 0;
    if (this.slope !== null) {
      this.acceleration.x = Math.cos(this.slope) * this.maxSpeed * (1 - this.gameRef.friction) / this.gameRef.friction;
      this.acceleration.y = Math.sin(this.slope) * this.maxSpeed * (1 - this.gameRef.friction) / this.gameRef.friction;
    }
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
  draw(p5) {
    const { colors } = this.gameRef;
    const { x, y } = this.position;
    const { rotation, slope, scale, radius, color } = this;
    const { master, damageIndicator } = this.opacity;
    const size = (radius + 10) * 2 * scale;
    const graphic = p5.createGraphics(size, size);
    const opacity = master.toFixed(1);

    graphic.translate(size / 2, size / 2);
    graphic.scale(scale);
    graphic.rotate(rotation);
    graphic.strokeWeight(5);
    graphic.stroke(p5.lerpColor(p5.color(colors.black), p5.color(colors.red), damageIndicator));
    graphic.fill(p5.lerpColor(p5.color(color), p5.color(colors.red), damageIndicator));
    graphic.beginShape();
    for (let i = 0; i <= 20; i++) {
      graphic.vertex(Math.sin(i * Math.PI / 8) * radius * (1 - (i % 2) / 3), Math.cos(i * Math.PI / 8) * radius * (1 - (i % 2) / 3));
    }
    graphic.endShape();

    if (opacity > 0) {
      if (opacity < 1) p5.tint(`hsba(0, 0%, 100%, ${opacity})`);
      p5.image(graphic, x - size / 2, y - size / 2);
    }

    p5.noTint();
    graphic.remove();
  }
}