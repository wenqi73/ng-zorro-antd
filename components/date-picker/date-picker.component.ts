/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { CdkOverlayOrigin, ConnectedOverlayPositionChange } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { NzDatePickerBase } from './date-picker-base';
import { NzDatePickerContentComponent } from './date-picker-content.component';
import { NzDateMode } from './standard-types';

/**
 * The base picker for all common APIs
 */
@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nz-date-picker,nz-week-picker,nz-month-picker,nz-year-picker',
  exportAs: 'nzDatePicker',
  template: `
    <ng-container *ngIf="!nzInline">
      <!-- Content of single picker -->
      <div class="ant-picker-input">
        <input
          #pickerInput
          [attr.id]="nzId"
          [class.ant-input-disabled]="nzDisabled"
          [disabled]="nzDisabled"
          [readOnly]="nzInputReadOnly"
          [(ngModel)]="inputValue"
          [placeholder]="nzPlaceHolder"
          [size]="inputSize"
          (focus)="onFocus($event)"
          (focusout)="onFocusout($event)"
          (ngModelChange)="onInputChange($event)"
          (keyup.enter)="onKeyupEnter($event)"
        />
        <ng-container *ngTemplateOutlet="tplRightRest"></ng-container>
      </div>
    </ng-container>
    <ng-template #tplRightRest>
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
      useExisting: forwardRef(() => NzDatePickerComponent)
    }
  ]
})
export class NzDatePickerComponent extends NzDatePickerBase<Date | null, NzDateMode> {
  inputSize: number = 12;
  inputValue: string | null = '';
  value: Date | null = null;
  arrowLeft = 0;
  activeBarStyle: object = {};
  origin!: CdkOverlayOrigin;
  contentComponent = NzDatePickerContentComponent;
  panelMode = this.nzMode;

  @Input() nzDefaultPickerValue: Date | null = null;
  @Output() readonly nzOnOk = new EventEmitter<Date>();

  @ViewChild('separatorElement', { static: false }) separatorElement?: ElementRef;
  @ViewChild('pickerInput', { static: false }) pickerInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('rangePickerInput') rangePickerInputs?: QueryList<ElementRef<HTMLInputElement>>;

  ngAfterViewInit(): void {
    if (this.nzAutoFocus) {
      this.focus();
    }
  }

  focus(): void {
    const activeInputElement = this.pickerInput.nativeElement;
    if (this.document.activeElement !== activeInputElement) {
      activeInputElement?.focus();
    }
  }

  onFocus(event: FocusEvent): void {
    event.preventDefault();
    this.renderClass(true);
  }

  // blur event has not the relatedTarget in IE11, use focusout instead.
  onFocusout(event: FocusEvent): void {
    event.preventDefault();
    if (!this.elementRef.nativeElement.contains(event.relatedTarget)) {
      this.checkAndClose();
    }
    this.renderClass(false);
  }

  onClickClear(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.value = this.initialValue = null;
    this.setInput();
    this.onValueEmit();
  }

  protected setDefaultPlaceHolder(): void {
    if (!this.isCustomPlaceHolder && this.nzLocale) {
      const defaultPlaceholder: { [key in NzDateMode]?: string } = {
        year: this.getPropertyOfLocale('yearPlaceholder'),
        month: this.getPropertyOfLocale('monthPlaceholder'),
        week: this.getPropertyOfLocale('weekPlaceholder'),
        date: this.getPropertyOfLocale('placeholder')
      };

      this.nzPlaceHolder = defaultPlaceholder[this.nzMode as NzDateMode]!;
    }
  }

  showClear(): boolean {
    return !this.nzDisabled && !!this.value && this.nzAllowClear;
  }

  getInput(): HTMLInputElement | undefined {
    if (this.nzInline) {
      return undefined;
    }

    return this.pickerInput.nativeElement;
  }

  onClickInputBox(event: MouseEvent): void {
    event.stopPropagation();
    this.focus();
    if (!this.isOpenHandledByUser()) {
      this.open();
    }
  }

  // NOTE: A issue here, the first time position change, the animation will not be triggered.
  // Because the overlay's "positionChange" event is emitted after the content's full shown up.
  // All other components like "nz-dropdown" which depends on overlay also has the same issue.
  // See: https://github.com/NG-ZORRO/ng-zorro-antd/issues/1429
  onPositionChange(position: ConnectedOverlayPositionChange): void {
    this.currentPositionX = position.connectionPair.originX;
    this.currentPositionY = position.connectionPair.originY;
    this.cdr.detectChanges(); // Take side-effects to position styles
  }

  setInput(): void {
    this.inputValue = this.formatValue(this.value);
    this.inputSize = Math.max(10, this.nzFormat.length) + 2;
    this.cdr.markForCheck();
  }

  protected setPanel(): void {
    this.panelMode = this.nzMode;
  }

  protected formatValue(value: Date | null | undefined): string | null {
    return this.dateHelper.format(value, this.nzFormat);
  }

  // Whether open state is permanently controlled by user himself
  isOpenHandledByUser(): boolean {
    return this.nzOpen !== undefined;
  }

  // ------------------------------------------------------------------------
  // Input API End
  // ------------------------------------------------------------------------

  onValueChange(value: Date): void {
    this.value = value;
    this.setInput();
  }

  onValueEmit(): void {
    this.initialValue = this.value;
    this.onChangeFn(this.value);
    this.onTouchedFn();
    this.close();
  }

  onResultOk(): void {
    this.nzOnOk.emit(this.value!);
  }
}
