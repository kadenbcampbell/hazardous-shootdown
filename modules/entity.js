export default class Entity {
  constructor(position, velocity, radius, health, color, teamIdentifier) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.maxRadius = radius;
    this.health = health;
    this.maxHealth = health;
    this.healthDisplay = health;
    this.color = color;
    this.teamIdentifier = teamIdentifier;
    this.opacity = {
      master: 0,
      healthBar: 0,
      damageIndicator: 0,
    };
    this.rotation = 0;
    this.scale = 0;
    this.isActive = true;
  }
  checkForCollision() {
    for (const index in this.gameReference.entities) {
      const entityReference = this.gameReference.entities[index];
      const distance = Math.sqrt(Math.pow(this.position.x - entityReference.position.x, 2) + Math.pow(this.position.y - entityReference.position.y, 2));
      if (entityReference.entityIndex !== this.entityIndex && distance <= this.radius + entityReference.radius + 10)
        this.handleCollision(entityReference);
    }
  }
  handleCollision(entityReference) {
    // TODO: prevent entities from entering each other
    if (this.teamIdentifier !== entityReference.teamIdentifier) {
      this.health--;
      entityReference.health--;
      this.opacity.damageIndicator = 1;
      entityReference.opacity.damageIndicator = 1;
    }
  }
  updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  updateVelocity() {
    this.velocity.x *= 0.99;
    this.velocity.y *= 0.99;
  }
  animateSpawn() {
    this.scale += Math.min(0.1, 1 - this.scale);
    this.opacity.master += Math.min(0.1, 1 - this.opacity.master);
  }
  animateDeath() {
    this.scale += 0.05;
    this.opacity.master -= Math.min(0.1, this.opacity.master);
  }
  animateHealthBar() {
    if (this.health >= this.maxHealth)
      this.opacity.healthBar -= Math.min(0.1, this.opacity.healthBar);
    else
      this.opacity.healthBar += Math.min(0.1, 1 - this.opacity.healthBar);
  }
  animateDamageIndicator() {
    this.opacity.damageIndicator -= Math.min(0.05, this.opacity.damageIndicator);
  }
  deleteSelf() {
    this.gameReference.deleteEntity(this.entityIndex);
  }
  animate() {
    this.animateSpawn();
    this.animateHealthBar();
    this.animateDamageIndicator();
    this.updatePosition();
    this.updateVelocity();
    this.checkForCollision();

    if (!this.isActive) {
      this.animateDeath();

      if (this.opacity.master <= 0)
        this.deleteSelf();
    }
  }
};