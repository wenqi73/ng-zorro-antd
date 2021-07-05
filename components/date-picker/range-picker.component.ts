/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { OverlayRef } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { cloneDate } from 'ng-zorro-antd/date-picker/util';

import { NzDatePickerBase } from './date-picker-base';
import { NzRangePickerContentComponent } from './range-picker-content.component';
import { NzDateMode, RangePart } from './standard-types';

/**
 * The base picker for all common APIs
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nz-range-picker',
  exportAs: 'nzRangePicker',
  template: `
    <ng-container *ngTemplateOutlet="tplRangeInput; context: { part: 0 }"></ng-container>
    <div #separatorElement class="ant-picker-range-separator">
      <span class="ant-picker-separator">
        <ng-container *ngIf="nzSeparator; else defaultSeparator">{{ nzSeparator }}</ng-container>
      </span>
      <ng-template #defaultSeparator>
        <i nz-icon nzType="swap-right" nzTheme="outline"></i>
      </ng-template>
    </div>
    <ng-container *ngTemplateOutlet="tplRangeInput; context: { part: 1 }"></ng-container>
    <ng-container *ngTemplateOutlet="tplRightRest"></ng-container>
    <!-- Input for Range ONLY -->
    <ng-template #tplRangeInput let-part="part">
      <div class="ant-picker-input">
        <input
          #rangePickerInput
          [disabled]="nzDisabled"
          [readOnly]="nzInputReadOnly"
          [attr.id]="nzId"
          [size]="inputSize"
          [(ngModel)]="inputValue[part]"
          (ngModelChange)="onInputChange($event)"
          [placeholder]="nzPlaceHolder[part]"
          (click)="onClickInputBox($event)"
          (focusout)="onFocusout($event)"
          (focus)="onFocus($event, part)"
          (keyup.enter)="onKeyupEnter($event)"
        />
      </div>
    </ng-template>
    <!-- Right operator icons -->
    <ng-template #tplRightRest>
      <div class="ant-picker-active-bar" [ngStyle]="activeBarStyle"></div>
      <span *ngIf="showClear()" class="ant-picker-clear" (click)="onClickClear($event)">
        <i nz-icon nzType="close-circle" nzTheme="fill"></i>
      </span>
      <span class="ant-picker-suffix">
        <ng-container *nzStringTemplateOutlet="nzSuffixIcon; let suffixIcon">
          <i nz-icon [nzType]="suffixIcon"></i>
        </ng-container>
      </span>
    </ng-template>
  `,
  host: {
    '[class.ant-picker]': `true`,
    '[class.ant-picker-range]': `true`,
    '[class.ant-picker-large]': `nzSize === 'large'`,
    '[class.ant-picker-small]': `nzSize === 'small'`,
    '[class.ant-picker-disabled]': `nzDisabled`,
    '[class.ant-picker-rtl]': `dir === 'rtl'`,
    '[class.ant-picker-borderless]': `nzBorderless`,
    '(click)': 'onClickInputBox($event)'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => NzRangePickerComponent)
    }
  ]
})
export class NzRangePickerComponent
  extends NzDatePickerBase<Array<Date | null>, NzDateMode[]>
  implements OnChanges, OnDestroy, AfterViewInit, ControlValueAccessor
{
  inputSize: number = 12;
  inputValue: Array<string | null> = ['', ''];
  value: Array<Date | null> = [null, null];
  activeBarStyle: object = {};
  arrowLeft = 0;
  contentComponent = NzRangePickerContentComponent;
  panelMode = [this.nzMode, this.nzMode];
  activePart: RangePart = RangePart.Left;

  protected overlayRef: OverlayRef | null = null;

  @Input() nzDefaultPickerValue: Array<Date | null> = [null, null];
  @Output() readonly nzOnCalendarChange = new EventEmitter<Array<Date | null>>();
  @Output() readonly nzOnOk = new EventEmitter<Date[]>();

  @ViewChild('separatorElement', { static: false }) separatorElement?: ElementRef;
  @ViewChildren('rangePickerInput') rangePickerInputs?: QueryList<ElementRef<HTMLInputElement>>;

  ngAfterViewInit(): void {
    if (this.nzAutoFocus) {
      this.focus();
    }

    if (this.platform.isBrowser) {
      this.nzResizeObserver
        .observe(this.elementRef)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.updateInputWidthAndArrowLeft();
        });
    }
  }

  updateInputWidthAndArrowLeft(): void {
    const inputWidth = this.rangePickerInputs?.first?.nativeElement.offsetWidth || 0;
    const baseStyle = { position: 'absolute', width: `${inputWidth}px` };
    this.arrowLeft =
      this.activePart === RangePart.Left ? 0 : inputWidth + this.separatorElement?.nativeElement.offsetWidth || 0;

    if (this.dir === 'rtl') {
      this.activeBarStyle = { ...baseStyle, right: `${this.arrowLeft}px` };
    } else {
      this.activeBarStyle = { ...baseStyle, left: `${this.arrowLeft}px` };
    }

    this.cdr.markForCheck();
  }

  getInput(partType?: RangePart): HTMLInputElement | undefined {
    if (this.nzInline) {
      return undefined;
    }

    return this.rangePickerInputs!.toArray()[partType!].nativeElement;
  }

  focus(part = this.activePart): void {
    const activeInputElement = this.getInput(part);
    if (this.document.activeElement !== activeInputElement) {
      activeInputElement?.focus();
    }
  }

  onFocus(event: FocusEvent, partType: RangePart): void {
    event.preventDefault();
    this.activePart = partType;
    this.renderClass(true);
    this.updateInputWidthAndArrowLeft();
  }

  showClear(): boolean {
    return this.nzAllowClear && !this.nzDisabled && Array.isArray(this.value) && this.value.every(v => v);
  }

  onClickClear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.value = [null, null];
    this.initialValue = [null, null];
    this.setInput();
    this.onValueEmit();
  }

  setInput(): void {
    this.inputSize = Math.max(10, this.nzFormat.length) + 2;
    this.inputValue = this.value ? this.formatValue(this.value) : ['', ''];
    this.cdr.markForCheck();
  }

  protected setPanel(): void {
    this.panelMode = [this.nzMode, this.nzMode];
  }

  protected formatValue(value: Array<Date | null>): Array<string | null> {
    return value.map(v => this.dateHelper.format(v, this.nzFormat));
  }

  onValueChange(value: Array<Date | null>): void {
    this.value = value;
    this.setInput();
  }

  onValueEmit(): void {
    this.initialValue = cloneDate(this.value);
    if (this.value?.length) {
      this.onChangeFn([this.value[0] || null, this.value[1] || null]);
    } else {
      this.onChangeFn([]);
    }
    this.onTouchedFn();
    // When value emitted, overlay will be closed
    this.close();
  }

  onActivePartChange(value: RangePart): void {
    this.activePart = value;
    this.focus(value);
    this.updateInputWidthAndArrowLeft();
  }

  setFormat(): void {
    super.setFormat();
    this.panelMode = [this.nzMode, this.nzMode];
    this.setInput();
  }

  writeValue(value: Array<Date | null> | null): void {
    this.value = value || [null, null];
    this.initialValue = cloneDate(this.value);
    this.setInput();
    this.cdr.markForCheck();
  }

  /**
   * Triggered when overlayOpen changes (different with realOpenState)
   *
   * @param open The overlayOpen in picker component
   */
  onOpenChange(open: boolean): void {
    this.nzOnOpenChange.emit(open);
  }

  // ------------------------------------------------------------------------
  // | Internal methods
  // ------------------------------------------------------------------------
  protected setDefaultPlaceHolder(): void {
    if (!this.isCustomPlaceHolder && this.nzLocale) {
      const defaultRangePlaceholder: { [key in NzDateMode]?: string[] } = {
        year: this.getPropertyOfLocale('rangeYearPlaceholder'),
        month: this.getPropertyOfLocale('rangeMonthPlaceholder'),
        week: this.getPropertyOfLocale('rangeWeekPlaceholder'),
        date: this.getPropertyOfLocale('rangePlaceholder')
      };

      this.nzPlaceHolder = defaultRangePlaceholder[this.nzMode as NzDateMode]!;
    }
  }

  // Emit nzOnCalendarChange when select date by nz-range-picker
  onCalendarChange(value: Array<Date | null>): void {
    this.nzOnCalendarChange.emit(value.filter(x => x));
  }

  onResultOk(): void {
    this.nzOnOk.emit(this.value as Date[]);
  }
}
