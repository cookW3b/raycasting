export default class Matrix<T> extends Array<T> {
  #width: number = 0;
  #height: number = 0;

  constructor(width: number, height: number) {
    super(width * height);
    this.#width = width;
    this.#height = height;
  }

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  get(x: number, y: number) {
    return this[y * this.#width + x];
  }

  set(v: T, x: number, y: number) {
    this[y * this.#width + x] = v;
  }
}