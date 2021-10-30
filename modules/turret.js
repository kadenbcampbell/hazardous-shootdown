import Entity from './entity.js';
export default class Turret extends Entity {
  constructor(p5, gameRef, entityIndex, position, velocity, acceleration) {
    super(p5, gameRef, entityIndex, position, velocity, acceleration, 32, 32, gameRef.colors.blue, 0, 4);
    this.rotSpeed = Math.PI / 45;
    this.spread = Math.PI / 90;
    this.fireRate = 4;
    this.recoil = 0;
    this.barrelSlope = 0;
  }
  draw(p5, font) {
    const { colors, score } = this.gameRef;
    const { x, y } = this.position;
    const { rotation, scale, radius, recoil, barrelSlope } = this;
    const { master, damageIndicator } = this.opacity; 
    const size = Math.sqrt(Math.pow(radius * 5 / 3 + 2.5, 2) + Math.pow(radius / 3 + 2.5, 2)) * 2 * scale;
    const graphic = p5.createGraphics(size, size);
    const opacity = master.toFixed(1);

    graphic.translate(size / 2, size / 2);
    graphic.scale(scale);
    graphic.rotate(barrelSlope);
    graphic.strokeWeight(5);
    graphic.stroke(p5.lerpColor(p5.color(colors.black), p5.color(colors.red), damageIndicator));
    graphic.fill(p5.lerpColor(p5.color(colors.gray), p5.color(colors.red), damageIndicator));
    graphic.rect(0, -radius / 3, radius * 5 / 3 - recoil * radius / 8, radius * 2 / 3);
    graphic.rotate(rotation - barrelSlope);
    graphic.fill(p5.lerpColor(p5.color(colors.blue), p5.color(colors.red), damageIndicator));
    graphic.beginShape();
    for (let i = 0.5; i <= 7.5; i++) {
      graphic.vertex(Math.sin(i * Math.PI / 3) * radius, Math.cos(i * Math.PI / 3) * radius);
    }
    graphic.endShape();
    graphic.rotate(-rotation);
    graphic.fill(p5.lerpColor(p5.color(colors.black), p5.color(colors.red), damageIndicator));
    graphic.noStroke();
    graphic.textAlign('center', 'center');
    graphic.textFont(font, radius * 5 / 3 * Math.pow(0.8, score.toString().length));
    graphic.text(score, 0, -radius * 5 / 30 * Math.pow(0.8, score.toString().length));

    if (opacity > 0) {
      if (opacity < 1) p5.tint(`hsba(0, 0%, 100%, ${opacity})`);
      p5.image(graphic, x - size / 2, y - size / 2);
    }

    p5.noTint();
    graphic.remove();

  }
  rotateToCursor(cursorPosition) {
    const slopeToCursor = Math.atan2(cursorPosition.y - this.position.y, cursorPosition.x - this.position.x);
    const normalizedRotation = Math.atan2(Math.sin(this.barrelSlope), Math.cos(this.barrelSlope));
    if (Math.abs(normalizedRotation - slopeToCursor) <= this.rotSpeed) {
      this.barrelSlope = slopeToCursor;
    } else {
      let delta = (slopeToCursor - normalizedRotation);
      delta += delta < 0 ? Math.PI * 2 : delta >= Math.PI * 2 ? Math.PI * -2 : 0;
      this.barrelSlope += delta < Math.PI ? this.rotSpeed : -this.rotSpeed;
      this.barrelSlope += this.barrelSlope < 0 ? Math.PI * 2 : this.barrelSlope >= Math.PI * 2 ? Math.PI * -2 : 0;
    }
  }
  updateAcceleration() {
    this.acceleration.x = 0;
    this.acceleration.y = 0;

    if (this.gameRef.keys[37] || this.gameRef.keys[65]) this.acceleration.x--;
    if (this.gameRef.keys[38] || this.gameRef.keys[87]) this.acceleration.y--;
    if (this.gameRef.keys[39] || this.gameRef.keys[68]) this.acceleration.x++;
    if (this.gameRef.keys[40] || this.gameRef.keys[83]) this.acceleration.y++;

    const magnitude = Math.sqrt(Math.pow(this.acceleration.x, 2) + Math.pow(this.acceleration.y, 2));

    if (magnitude) {
      this.acceleration.x /= magnitude;
      this.acceleration.y /= magnitude;
    }

    this.acceleration.x *= this.maxSpeed * (1 - this.gameRef.friction) / this.gameRef.friction;
    this.acceleration.y *= this.maxSpeed * (1 - this.gameRef.friction) / this.gameRef.friction;
  }
  animate(p5) {
    super.animate();
    this.rotateToCursor({ x: p5.mouseX, y: p5.mouseY });
  }
}