export default class Vec2 {
  public x: number = 0;
  public y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  get array(): [number, number] {
    return [this.x, this.y];
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  unit(): Vec2 {
    return this.divide(this.length());
  }

  divide(scalar: number): Vec2 {
    return new Vec2(this.x / scalar, this.y / scalar);
  }

  sub(other: Vec2): Vec2 {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  scale(scalar: number) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  add(other: Vec2) {
    // console.log(other, this)
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  distance(other: Vec2): number {
    return this.sub(other).length();
  }
}