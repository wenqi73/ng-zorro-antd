/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Direction, Directionality } from '@angular/cdk/bidi';
import { ESCAPE } from '@angular/cdk/keycodes';
import {
  ConnectionPositionPair,
  HorizontalConnectionPos,
  Overlay,
  OverlayConfig,
  OverlayRef,
  VerticalConnectionPos
} from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { NzResizeObserver } from 'ng-zorro-antd/cdk/resize-observer';
import { NzConfigKey, NzConfigService, WithConfig } from 'ng-zorro-antd/core/config';
import { NzNoAnimationDirective } from 'ng-zorro-antd/core/no-animation';
import { BooleanInput, FunctionProp, NzSafeAny, OnChangeType, OnTouchedType } from 'ng-zorro-antd/core/types';
import { InputBoolean, toBoolean, valueFunctionProp } from 'ng-zorro-antd/core/util';
import {
  DisabledTimeFn,
  NzDateMode,
  PresetRanges,
  RangePart,
  SupportTimeOptions
} from 'ng-zorro-antd/date-picker/standard-types';
import {
  DateHelperService,
  NzDatePickerI18nInterface,
  NzDatePickerLangI18nInterface,
  NzI18nService
} from 'ng-zorro-antd/i18n';

import { NzDatePickerContentBase } from './date-picker-content-base';
import { NzDatePickerPanelBase } from './date-picker-panel-base';
import { cloneDate } from './util';

const POPUP_STYLE_PATCH = { position: 'relative' }; // Aim to override antd's style to support overlay's position strategy (position:absolute will cause it not working because the overlay can't get the height/width of it's content)
const NZ_CONFIG_MODULE_NAME: NzConfigKey = 'datePicker';

export type NzDatePickerSizeType = 'large' | 'default' | 'small';

@Directive()
export abstract class NzDatePickerBase<D, M> implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  readonly _nzModuleName: NzConfigKey = NZ_CONFIG_MODULE_NAME;
  static ngAcceptInputType_nzAutoFocus: BooleanInput;
  static ngAcceptInputType_nzDisabled: BooleanInput;
  static ngAcceptInputType_nzBorderless: BooleanInput;
  static ngAcceptInputType_nzInputReadOnly: BooleanInput;
  static ngAcceptInputType_nzInline: BooleanInput;
  static ngAcceptInputType_nzOpen: BooleanInput;
  static ngAcceptInputType_nzShowToday: BooleanInput;
  static ngAcceptInputType_nzShowNow: BooleanInput;
  static ngAcceptInputType_nzMode: NzDateMode | NzDateMode[] | string | string[] | null | undefined;
  static ngAcceptInputType_nzShowTime: BooleanInput | SupportTimeOptions | null | undefined;

  extraFooter?: TemplateRef<NzSafeAny> | string;
  dir: Direction = 'ltr';
  value!: D;
  panelMode!: M;
  currentPositionY: VerticalConnectionPos = 'bottom';
  currentPositionX: HorizontalConnectionPos = 'start';

  protected abstract contentComponent: ComponentType<NzDatePickerContentBase<D, M>>;

  protected initialValue!: D;
  protected activeDate?: D;
  protected destroy$ = new Subject();
  protected isCustomPlaceHolder: boolean = false;
  protected isCustomFormat: boolean = false;
  protected overlayRef: OverlayRef | null = null;
  protected contentComponentRef: ComponentRef<NzDatePickerContentBase<D, M>> | null = null;
  private overlayPositions: ConnectionPositionPair[] = [
    {
      offsetY: 2,
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top'
    },
    {
      offsetY: -2,
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom'
    },
    {
      offsetY: 2,
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top'
    },
    {
      offsetY: -2,
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom'
    }
  ];
  private showTime: SupportTimeOptions | boolean = false;

  // --- Common API
  @Input() @InputBoolean() nzAllowClear: boolean = true;
  @Input() @InputBoolean() nzAutoFocus: boolean = false;
  @Input() @InputBoolean() nzDisabled: boolean = false;
  @Input() @InputBoolean() nzBorderless: boolean = false;
  @Input() @InputBoolean() nzInputReadOnly: boolean = false;
  @Input() @InputBoolean() nzInline: boolean = false;
  @Input() @InputBoolean() nzOpen?: boolean;
  @Input() @InputBoolean() nzShowNow: boolean = true;
  @Input() @InputBoolean() nzShowToday: boolean = true;
  @Input() nzDisabledDate?: (d: Date) => boolean;
  @Input() nzLocale!: NzDatePickerI18nInterface;
  @Input() nzPlaceHolder!: string | string[];
  @Input() nzPopupStyle: object = POPUP_STYLE_PATCH;
  @Input() nzDropdownClassName?: string;
  @Input() nzSize: NzDatePickerSizeType = 'default';
  @Input() nzFormat!: string;
  @Input() nzDateRender?: TemplateRef<NzSafeAny> | string | FunctionProp<TemplateRef<Date> | string>;
  @Input() nzDisabledTime?: DisabledTimeFn;
  @Input() nzRenderExtraFooter?: TemplateRef<NzSafeAny> | string | FunctionProp<TemplateRef<NzSafeAny> | string>;
  @Input() nzMode: NzDateMode = 'date';
  @Input() nzRanges?: PresetRanges;
  @Input() nzDefaultPickerValue?: D;
  @Input() nzId: string | null = null;
  @Input() @WithConfig() nzSeparator?: string;
  @Input() @WithConfig() nzSuffixIcon: string | TemplateRef<NzSafeAny> = 'calendar';
  @Input() @WithConfig() nzBackdrop = false;

  @Output() readonly nzOnPanelChange = new EventEmitter<M>();
  @Output() readonly nzOnOpenChange = new EventEmitter<boolean>();

  @Input() get nzShowTime(): SupportTimeOptions | boolean {
    return this.showTime;
  }

  set nzShowTime(value: SupportTimeOptions | boolean) {
    this.showTime = typeof value === 'object' ? value : toBoolean(value);
  }

  abstract onValueEmit(): void;

  abstract onResultOk(): void;

  onOpenChange(open: boolean): void {
    this.nzOnOpenChange.emit(open);
  }

  // Whether open state is permanently controlled by user himself
  isOpenHandledByUser(): boolean {
    return this.nzOpen !== undefined;
  }

  constructor(
    public nzConfigService: NzConfigService,
    protected i18n: NzI18nService,
    protected cdr: ChangeDetectorRef,
    protected elementRef: ElementRef,
    protected overlay: Overlay,
    protected renderer: Renderer2,
    protected platform: Platform,
    protected dateHelper: DateHelperService,
    protected nzResizeObserver: NzResizeObserver,
    @Inject(DOCUMENT) protected document: NzSafeAny,
    @Host() @Optional() public noAnimation: NzNoAnimationDirective,
    @Optional() private directionality: Directionality
  ) {}

  ngOnInit(): void {
    this.dir = this.directionality.value;
    this.setFormat();

    // Subscribe the every locale change if the nzLocale is not handled by user
    if (!this.nzLocale) {
      this.i18n.localeChange.pipe(takeUntil(this.destroy$)).subscribe(() => this.setLocale());
    }

    this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe((direction: Direction) => {
      this.dir = direction;
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nzPopupStyle) {
      // Always assign the popup style patch
      this.nzPopupStyle = this.nzPopupStyle ? { ...this.nzPopupStyle, ...POPUP_STYLE_PATCH } : POPUP_STYLE_PATCH;
    }

    // Mark as customized placeholder by user once nzPlaceHolder assigned at the first time
    if (changes.nzPlaceHolder?.currentValue) {
      this.isCustomPlaceHolder = true;
    }

    if (changes.nzFormat?.currentValue) {
      this.isCustomFormat = true;
    }

    if (changes.nzLocale) {
      // The nzLocale is currently handled by user
      this.setDefaultPlaceHolder();
    }

    if (changes.nzRenderExtraFooter) {
      this.extraFooter = valueFunctionProp(this.nzRenderExtraFooter!);
    }

    if (changes.nzMode) {
      this.setPanel();
      this.setDefaultPlaceHolder();
      this.setFormat();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ------------------------------------------------------------------------
  // | Control value accessor implements
  // ------------------------------------------------------------------------

  // NOTE: onChangeFn/onTouchedFn will not be assigned if user not use as ngModel
  onChangeFn: OnChangeType = () => void 0;
  onTouchedFn: OnTouchedType = () => void 0;

  writeValue(value: D): void {
    this.value = value;
    this.initialValue = value;
    this.setInput();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: OnChangeType): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: OnTouchedType): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.nzDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  // Show overlay content
  open(): void {
    if (this.nzInline) {
      return;
    }

    if (!this.overlayRef && !this.nzDisabled) {
      const portal = new ComponentPortal<NzDatePickerContentBase<D, M>>(this.contentComponent);
      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions(this.overlayPositions)
        .withTransformOriginOn('.ant-picker-dropdown');

      this.overlayRef = this.overlay.create(
        new OverlayConfig({
          positionStrategy: positionStrategy,
          hasBackdrop: this.nzBackdrop,
          direction: this.dir,
          scrollStrategy: this.overlay.scrollStrategies.reposition()
        })
      );

      this.overlayRef.keydownEvents().subscribe(event => {
        this.onOverlayKeydown(event);
      });

      this.overlayRef.detachments().subscribe(() => {
        this.close();
      });

      this.contentComponentRef = this.overlayRef.attach(portal);
      this.contentComponentRef.instance.datePicker = this;

      this.nzOnOpenChange.emit(true);
      this.cdr.markForCheck();
    }
  }

  close(): void {
    if (this.nzInline) {
      return;
    }
    if (this.contentComponentRef) {
      const instance = this.contentComponentRef.instance;
      instance.startExitAnimation();
      instance.animationDone.pipe(take(1)).subscribe(() => this.destroyOverlay());
    }
  }

  onClickInputBox(event: MouseEvent): void {
    event.stopPropagation();
    this.focus();
    if (!this.isOpenHandledByUser()) {
      this.open();
    }
  }

  focus(): void {
    const activeInputElement = this.getInput();
    if (this.document.activeElement !== activeInputElement) {
      activeInputElement?.focus();
    }
  }

  // blur event has not the relatedTarget in IE11, use focusout instead.
  onFocusout(event: FocusEvent): void {
    event.preventDefault();
    if (!this.elementRef.nativeElement.contains(event.relatedTarget)) {
      this.checkAndClose();
    }
    this.renderClass(false);
  }

  checkAndClose(): void {
    if (!this.overlayRef) {
      return;
    }

    if (this.panel.isAllowed(this.value)) {
      this.onValueEmit();
    } else {
      this.value = cloneDate(this.initialValue);
      this.close();
    }

    this.setInput();
  }

  onPanelModeChange(panelMode: M): void {
    this.nzOnPanelChange.emit(panelMode);
  }

  onInputChange(value: string, isEnter: boolean = false): void {
    /**
     * in IE11 focus/blur will trigger ngModelChange if placeholder changes,
     * so we forbidden IE11 to open panel through input change
     */
    if (!this.platform.TRIDENT && !this.overlayRef) {
      this.open();
      return;
    }

    const date = this.checkValidDate(value);
    // Can only change date when it's open
    if (date && this.overlayRef) {
      this.panel.selectDate(date, isEnter);
    }
  }

  onKeyupEnter(event: Event): void {
    this.onInputChange((event.target as HTMLInputElement).value, true);
  }

  destroyOverlay(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = this.contentComponentRef = null;
      this.nzOnOpenChange.emit(false);
    }
  }

  onOverlayKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ESCAPE) {
      this.value = this.initialValue;
      this.setInput();
      this.close();
    }
  }
  // ------------------------------------------------------------------------
  // | Internal methods
  // ------------------------------------------------------------------------

  protected abstract setDefaultPlaceHolder(): void;

  protected abstract setInput(): void;

  protected abstract setPanel(): void;

  protected abstract getInput(part?: RangePart): HTMLInputElement | undefined;

  protected setFormat(): void {
    // Default format when it's empty
    if (!this.isCustomFormat) {
      const inputFormats: { [key in NzDateMode]?: string } = {
        year: 'yyyy',
        month: 'yyyy-MM',
        week: this.i18n.getDateLocale() ? 'RRRR-II' : 'yyyy-ww', // Format for week
        date: this.nzShowTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd'
      };
      this.nzFormat = inputFormats[this.nzMode as NzDateMode]!;
    }
  }

  protected getPropertyOfLocale<T extends keyof NzDatePickerLangI18nInterface>(
    type: T
  ): NzDatePickerLangI18nInterface[T] {
    return this.nzLocale.lang[type] || this.i18n.getLocaleData(`DatePicker.lang.${type}`);
  }

  protected checkValidDate(value: string): Date | null {
    const date = this.dateHelper.parseDate(value, this.nzFormat);
    return value === this.dateHelper.format(date, this.nzFormat) ? date : null;
  }

  protected renderClass(value: boolean): void {
    // TODO: avoid autoFocus cause change after checked error
    if (value) {
      this.renderer.addClass(this.elementRef.nativeElement, 'ant-picker-focused');
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, 'ant-picker-focused');
    }
  }

  protected get panel(): NzDatePickerPanelBase<D, M> {
    return this.contentComponentRef!.instance.panel;
  }

  // Reload locale from i18n with side effects
  private setLocale(): void {
    this.nzLocale = this.i18n.getLocaleData('DatePicker', {});
    this.setDefaultPlaceHolder();
    this.cdr.markForCheck();
  }
}
