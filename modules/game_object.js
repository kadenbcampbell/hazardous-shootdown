export default class GameObject {
  constructor(position, velocity, radius, health, speed, color, teamIdentifier) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.maxRadius = radius;
    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.maxSpeed = speed;
    this.color = color;
    this.teamIdenfifier = teamIdentifier;
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
    for (const index in this.game.objects) {
      const object = this.game.objects[index];
      const distance = Math.sqrt(Math.pow(this.position.x - object.position.x, 2) + Math.pow(this.position.y - object.position.y, 2));
      if (object.index !== this.index && distance <= this.radius + object.radius + 10)
        this.handleCollision(object);
    }
  }
  handleCollision(object) {
    if (this.teamIdentifier !== object.teamIndentifier) {
      this.health--;
      object.health--;
      this.opacity.damageIndicator = 1;
      this.opacity.damageIndicator = 1;
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
    this.opacity.master += Math.min(0.1, 1 - this.scale);
  }
  animateDeath() {
    this.scale += 0.05;
    this.opacity.master -= Math.min(0.1, this.opacity.master);
  }
  animateHealthBar() {
    if (this.health >= this.maxHealth)
      this.opacity.healthBar -= Math.min(0.1, this.opacity.healthBar);
    if (this.health < this.maxHealth)
      this.opacity.healthBar += Math.min(0.1, 1 - this.opacity.healthBar);
  }
  animateDamageIndicator() {
    this.opacity.damageIndicator -= Math.min(0.05, this.opacity.damageIndicator);
  }
  deleteSelf() {
    this.game.deleteObject(this.index);
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