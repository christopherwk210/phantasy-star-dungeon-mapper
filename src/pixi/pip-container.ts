import * as PIXI from 'pixi.js';
import { clamp, smoothApproach } from './utils';

let id = 0;
const globalPipContainerState = {
  lastHoverID: -1
};

export class PIPContainer extends PIXI.Container {
  public targetScale = 1;
  public targetX = 0;
  public targetY = 0;
  public zoomFactor = 0.2;
  public zoomSpeed = 0.2;

  public minZoom = 0.75;
  public maxZoom = 3;
  public pipZoom = 1;

  public onpipmodechange = (mode: 'pip' | 'full') => {};

  private _pipMode: 'pip' | 'full' = 'full';
  public padding = 20;

  private isDragging = false;
  private lastX = 0;
  private lastY = 0;

  private id = ++id;

  constructor(private app: PIXI.Application) {
    super();

    this.eventMode = 'static';

    window.addEventListener('pointerdown', e => {
      if (this.pipMode === 'full') this.handlePointerDown(e);
    });

    window.addEventListener('pointerup', e => {
      if (this.pipMode === 'full') this.handlePointerUp(e);
    });

    window.addEventListener('pointermove', e => {
      if (this.pipMode === 'full') this.handlePointerMove(e);
    });

    window.addEventListener('wheel', e => {
      let element = e.target as HTMLElement;
      if (element.tagName === 'OPTION') element = element.parentElement!;
      if (element.scrollHeight !== element.clientHeight) return;

      if (this.pipMode === 'full' && this.canZoom) this.handleWheel(e);
    });

    this.addListener('wheel', e => {
      if (this.pipMode === 'pip') {
        this.handleWheel(e);
      }
    });

    this.addListener('pointerenter', e => {
      globalPipContainerState.lastHoverID = this.id;
    });

    this.addListener('pointerleave', e => {
      globalPipContainerState.lastHoverID = -1;
    });

    this.addListener('pointerdown', e => {
      if (this.pipMode === 'pip') this.handlePointerDown(e);
    });

    this.addListener('pointerup', e => {
      if (this.pipMode === 'pip') this.handlePointerUp(e);
    });

    this.addListener('pointermove', e => {
      if (this.pipMode === 'pip') this.handlePointerMove(e);
    });
  }

  private handlePointerDown(e: PointerEvent) {
    if (e.button === 1) {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  }

  private handlePointerUp(e: PointerEvent) {
    if (e.button === 1) {
      this.isDragging = false;
    }
  }

  private handlePointerMove(e: PointerEvent) {
    if (this.isDragging) {
      const deltaX = e.clientX - this.lastX;
      const deltaY = e.clientY - this.lastY;
      this.targetX += deltaX;
      this.targetY += deltaY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  }

  private handleWheel(e: WheelEvent) {
    const direction = Math.sign(e.deltaY);
    if (direction === -1) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  private placePip() {
    this.x = this.app.screen.width - (this.width / 2) - this.padding;
    this.y = this.app.screen.height - (this.height / 2) - this.padding;
  }

  private get canZoom() {
    return globalPipContainerState.lastHoverID === this.id || globalPipContainerState.lastHoverID === -1;
  }

  public zoomIn() {
    this.targetScale += this.zoomFactor;
    this.targetScale = clamp(this.targetScale, this.minZoom, this.maxZoom);
  }

  public zoomOut() {
    this.targetScale -= this.zoomFactor;
    this.targetScale = clamp(this.targetScale, this.minZoom, this.maxZoom);
  }

  public update() {
    const trueTargetScale = this.pipMode === 'pip' ? this.targetScale - 0.3 : this.targetScale;

    this.scale.x = smoothApproach(this.scale.x, trueTargetScale, this.zoomSpeed);
    this.scale.y = smoothApproach(this.scale.y, trueTargetScale, this.zoomSpeed);

    this.x = smoothApproach(this.x, this.targetX, this.zoomSpeed);
    this.y = smoothApproach(this.y, this.targetY, this.zoomSpeed);

    if (this.pipMode === 'pip') this.placePip();
  }

  public get pipMode() {
    return this._pipMode;
  }

  public set pipMode(mode: 'pip' | 'full') {
    this._pipMode = mode;
    if (mode === 'pip') {
      const parent = this.parent;
      this.targetScale = this.pipZoom;
      parent.removeChild(this);
      parent.addChild(this);
    }
    this.onpipmodechange(mode);
  }
}