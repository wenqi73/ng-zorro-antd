import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

export const DRAW_ANIMATE_DURATION = 200;

type AnimationState = 'enter' | 'leave' | null;
@Component({
  selector: 'nz-drawer',
  templateUrl: './nz-drawer.component.html'
})

export class NzDrawerComponent implements OnInit, OnChanges, AfterViewInit {
  transform = {};
  levelDom = [];
  _width;
  _visible = false;
  private container: HTMLElement | OverlayRef;
  private parentContainer: HTMLElement = document.body;
  visibleChange$: Subject<boolean> = new Subject<boolean>();
  @Input() nzLevel: string = 'all';
  @Input()
  set nzVisible(value: boolean) {
    this._visible = value;
    this.visibleChange$.next(this.nzVisible);
  }

  get nzVisible(): boolean {
    return this._visible;
  }

  @Input() nzMask = false;
  @Input() nzPlacement = 'left';
  @Input() nzGetContainer: HTMLElement | OverlayRef | (() => HTMLElement | OverlayRef) = () => this.overlay.create();

  @ViewChild('drawer') nzDrawer: ElementRef;

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  toggle(): void {
    this.nzVisible = !this.nzVisible;
  }

  // 获取滑动的leveldom
  getParentAndLevelDom(): void {
    this.levelDom = [];
    if (this.nzLevel === 'all') {
      const children = Array.prototype.slice.call(this.parentContainer.children);
      children.forEach(child => {
        if (child.nodeName !== 'SCRIPT' && child.nodeName !== 'STYLE' && child !== this.container) {
          this.levelDom.push(child);
        }
      });
    }
  }

  private changeAnimationState(dom: HTMLElement, state: AnimationState): void {
    // this.animationState = state;
    // if (state) {
    //   this.maskAnimationClassMap = {
    //     [ `fade-${state}` ]       : true,
    //     [ `fade-${state}-active` ]: true
    //   };
    // } else {
    //   this.maskAnimationClassMap = this.modalAnimationClassMap = null;
    // }
  }

  private animateTo(isVisible: boolean): Promise<void> {
    if (isVisible) { // Figure out the lastest click position when shows up
      // window.setTimeout(() => this.updateTransformOrigin()); // [NOTE] Using timeout due to the document.click event is fired later than visible change, so if not postponed to next event-loop, we can't get the lastest click position
    }

    // this.changeAnimationState(isVisible ? 'enter' : 'leave');
    return new Promise((resolve) => window.setTimeout(() => { // Return when animation is over
      // this.changeAnimationState(null);
      resolve();
    }, DRAW_ANIMATE_DURATION));
  }

  // 设置transform
  setLevelDomTransform(visible: boolean): void {
    this.levelDom.forEach((dom: HTMLElement) => {
        /* eslint no-param-reassign: "error" */
        dom.style.transition = `transform .3s cubic-bezier(0.78, 0.14, 0.15, 0.86)`;
        // addEventListener(dom, transitionEnd, this.trnasitionEnd);
        const levelValue = visible ? this._width : 0;
        // if (levelMove) {
        //   const $levelMove = transformArguments(levelMove, { target: dom, open });
        // const levelValue = open ? $levelMove[0] : $levelMove[1] || 0;
        // }
        const coord = this.nzPlacement === 'left' || this.nzPlacement === 'right' ? 'X' : 'Y';
        const placementName = `translate${coord}`;

        const placementPos = (this.nzPlacement === 'left' || this.nzPlacement === 'top') ? levelValue : -levelValue;

        dom.style.transform = placementPos ? `${placementName}(${placementPos}px)` : '';
    });
  }

  renderContent(): void {
    console.log(this.nzDrawer);
    const value = this.nzDrawer.nativeElement.getBoundingClientRect()[
      this.nzPlacement === 'left' || this.nzPlacement === 'right' ? 'width' : 'height'
    ];
    this._width = value;

    const placementName = `translate${this.nzPlacement === 'left' || this.nzPlacement === 'right' ? 'X' : 'Y'}`;

    // 百分比与像素动画不同步，第一次打用后全用像素动画。
    const defaultValue = !this.nzDrawer ? '100%' : `${value}px`;

    const placementPos =
      this.nzPlacement === 'left' || this.nzPlacement === 'top' ? `-${defaultValue}` : defaultValue;

    this.transform = !this.nzVisible ? '' : `${placementName}(${placementPos})`;

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nzVisible) {
    }
  }

  ngOnInit(): void {
    this.container = typeof this.nzGetContainer === 'function' ? this.nzGetContainer() : this.nzGetContainer;
    if (this.container instanceof HTMLElement) {
      this.container.appendChild(this.elementRef.nativeElement);
    } else if (this.container instanceof OverlayRef) { // NOTE: only attach the dom to overlay, the view container is not changed actually
      this.container.overlayElement.appendChild(this.elementRef.nativeElement);
    }
  }

  ngAfterViewInit(): void {
    this.renderContent();
    this.visibleChange$.subscribe(v => {
      this.getParentAndLevelDom();
      this.setLevelDomTransform(v);
    });
  }
}
