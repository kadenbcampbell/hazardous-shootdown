export default class Entity {
  constructor(p5, gameRef, entityIndex, position, velocity, acceleration, radius, health, color, teamIdentifier, speed) {
    Object.assign(this, { position, acceleration, velocity, speed, gameRef, entityIndex, radius, health, color, teamIdentifier });
    this.maxRadius = radius;
    this.maxHealth = health;
    this.maxSpeed = speed;
    this.healthDisplay = health;
    this.opacity = {
      master: 0,
      healthBar: 0,
      damageIndicator: 0,
    };
    this.rotation = 0;
    this.scale = 0;
    this.isActive = true;
    this.p5 = p5;
    this.healthTimer = 0;
    this.healthSnap = health;
    this.healthSnapDisplay = health;
  }
  checkForCollision() {
    for (const index in this.gameRef.entities) {
      const entityRef = this.gameRef.entities[index];
      const minDistance = this.radius + entityRef.radius + 10;
      const distance = Math.sqrt(Math.pow(this.position.x - entityRef.position.x, 2) + Math.pow(this.position.y - entityRef.position.y, 2));
      if (entityRef.entityIndex !== this.entityIndex && distance <= minDistance && entityRef.isActive) {
        this.handleCollision(entityRef, minDistance - distance);
        entityRef.handleCollision(this, minDistance - distance);
      }
    }
  }
  handleCollision(entityRef, overlap) {
    const { teamIdentifier, velocity, position, radius } = this;
    // TODO: prevent entities from entering each other
    if (teamIdentifier !== entityRef.teamIdentifier) {
      // decrement health
      this.health -= Math.min(1, this.health);

      // reset health snapshot timer
      this.healthTimer = Math.min(1, this.health) ? 30 : this.healthTimer;

      // show damage indicator
      this.opacity.damageIndicator = 1;
    }

    const slopeFromEntity = Math.atan2(position.y - entityRef.position.y, position.x - entityRef.position.x);

    const totalVelocity = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)) + Math.sqrt(Math.pow(entityRef.velocity.x, 2) + Math.pow(entityRef.velocity.y, 2));

    const massRatio = Math.pow(entityRef.radius, 2) / (Math.pow(radius, 2) + Math.pow(entityRef.radius, 2));

    // redirect after collision
    this.velocity.x = Math.cos(slopeFromEntity) * totalVelocity * massRatio;
    this.velocity.y = Math.sin(slopeFromEntity) * totalVelocity * massRatio;

    // const ma = Math.pow(radius, 3);
    // const mb = Math.pow(entityRef.radius, 3);

    // const totalMass = ma + mb;
    // const massDelta = ma - mb;

    // this.velocity.x = this.velocity.x * massDelta / totalMass + 2 * mb / totalMass * entityRef.velocity.x;
    // this.velocity.y = this.velocity.y * massDelta / totalMass + 2 * mb / totalMass * entityRef.velocity.y;

    // this.acceleration.x = 0;
    // this.acceleration.y = 0;

    this.position.x += Math.cos(slopeFromEntity) * overlap * massRatio;
    this.position.y += Math.sin(slopeFromEntity) * overlap * massRatio;

  }
  updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  updateVelocity() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.velocity.x *= this.gameRef.friction;
    this.velocity.y *= this.gameRef.friction;
  }
  updateAcceleration() {

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
    if (this.health < this.maxHealth) this.opacity.healthBar += Math.min(0.1, 1 - this.opacity.healthBar);
    else if (this.healthSnap >= this.maxHealth) this.opacity.healthBar -= Math.min(0.1, this.opacity.healthBar);

    this.healthDisplay += (this.health - this.healthDisplay) / 2;
    this.healthSnapDisplay += (this.healthSnap - this.healthSnapDisplay) / 8;
    if (this.healthTimer <= 0) {
      this.healthSnap = this.health;
    }
    this.healthTimer -= Math.min(1, this.healthTimer);
  }
  animateDamageIndicator() {
    this.opacity.damageIndicator -= Math.min(0.1, this.opacity.damageIndicator);
  }
  deleteSelf() {
    this.gameRef.deleteEntity(this.entityIndex);
  }
  animate() {
    this.animateDamageIndicator();

    this.rotation += Math.sqrt(Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)) * Math.PI / 90;

    if (this.health <= 0) {
      this.isActive = false;
    }

    if (this.isActive) {
      this.updateAcceleration();

      this.checkForCollision();

      this.updateVelocity();

      this.updatePosition();

      this.animateSpawn();

      if (this.p5.frameCount % 300 === 0) {
        this.healthTimer = Math.min(1, this.maxHealth - this.health) ? 30 : this.healthTimer;
        this.health += Math.min(1, this.maxHealth - this.health);
      }

    } else {
      this.animateDeath();

      if (this.opacity.master <= 0) this.deleteSelf();
    }

    this.animateHealthBar();
  }
  drawHealthBar(p5) {

    const { colors } = this.gameRef;

    const { position, radius, healthDisplay, healthSnapDisplay, maxHealth } = this;
    const { x, y } = position;
    const { healthBar, master } = this.opacity;

    const width = radius * 2 + 5, height = 15;

    const graphic = p5.createGraphics(width, height);

    const opacity = (healthBar * master).toFixed(1);

    graphic.noStroke();
    graphic.fill(colors.black);
    graphic.rect(0, 0, width, height);
    graphic.fill(healthSnapDisplay >= healthDisplay ? this.p5.frameCount % 15 < 5 ? colors.white : colors.red : colors.white);
    graphic.rect(5, 5, Math.max(healthDisplay, healthSnapDisplay) / maxHealth * (width - 10), height - 10);
    graphic.fill(colors.green);
    graphic.rect(5, 5, Math.min(healthDisplay, healthSnapDisplay) / maxHealth * (width - 10), height - 10);

    if (opacity > 0) {
      if (opacity < 1) p5.tint(`hsba(0, 0%, 100%, ${opacity})`);
      p5.image(graphic, x - width / 2, y + radius + 10);
      p5.noTint();
    }
  }
};