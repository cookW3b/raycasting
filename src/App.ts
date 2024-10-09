import Vec2 from "./Vec2";

export default class App {
  public size = new Vec2(0, 0);
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  public ctxScale = new Vec2(1, 1);

  private updateListeners: Function[] = []

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas by id: ${canvasId} is not defined`);
    }
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("2D context is not supported");
    }
    this.ctx = ctx;
    this.width = 800;
    this.height = 800;
    this.mainLoop();
  }

  on(event: keyof HTMLElementEventMap, callback: EventListener) {
    this.canvas.addEventListener(event, callback);
  }

  onUpdate(callback: Function) {
    this.updateListeners.push(callback);
  }

  set width(v: number) {
    this.size.x = v;
    this.canvas.width = v;
  }

  get width() {
    return this.size.x;
  }

  set height(v: number) {
    this.size.y = v;
    this.canvas.height = v;
  }

  get height() {
    return this.size.y;
  }

  drawLine(p1: Vec2, p2: Vec2, width = 0.01, color = "white") {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.moveTo(...p1.array);
    this.ctx.lineTo(...p2.array);
    this.ctx.stroke();
  }

  drawText(content: string, pos: Vec2, color = "#989898", size = 0.25) {
    this.ctx.beginPath();
    this.ctx.font = `${size}px Serif`;
    this.ctx.fillStyle = color
    this.ctx.fillText(content, ...pos.array);
  }

  drawCircle(center: Vec2, radius: number = 0.1, color = "white") {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.arc(...center.array, radius, 0, Math.PI*2);
    this.ctx.stroke();
    this.ctx.fill();
  }

  drawRect(pos: Vec2, color = "white") {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.rect(...pos.array, 1, 1);
    this.ctx.fill();
  }

  private mainLoop() {
    this.ctx.reset();
    this.ctx.scale(...this.ctxScale.array);
    for (const listener of this.updateListeners) {
      listener();
    }
    requestAnimationFrame(() => this.mainLoop());
  }
}