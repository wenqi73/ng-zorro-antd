/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

import { NzDatePickerPanelBase } from './date-picker-panel-base';
import { NzDateMode, PresetRanges, SupportTimeOptions } from './standard-types';
import { getTimeConfig, isAllowedDate, overrideHms } from './util';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'nz-date-picker-panel',
  exportAs: 'datePickerPanel',
  template: `
    <div class="ant-picker-panel-container">
      <div class="ant-picker-panel" [class.ant-picker-panel-rtl]="dir === 'rtl'" tabindex="-1">
        <inner-panel
          [showWeek]="showWeek"
          [locale]="locale"
          [showTimePicker]="!!showTime"
          [timeOptions]="timeOptions"
          [panelMode]="panelMode"
          (panelModeChange)="onPanelModeChange($event)"
          [activeDate]="activeDate"
          [value]="value"
          [disabledDate]="disabledDate"
          [dateRender]="dateRender"
          (selectDate)="selectDate($event, !showTime)"
          (selectTime)="selectTime($event)"
          (headerChange)="onActiveDateChange($event)"
        ></inner-panel>
        <calendar-footer
          *ngIf="hasFooter"
          [locale]="locale"
          [showToday]="showToday"
          [showNow]="showNow"
          [hasTimePicker]="!!showTime"
          [okDisabled]="!isAllowed(value)"
          [extraFooter]="extraFooter"
          (clickOk)="onClickOk()"
          (clickToday)="onClickToday($event)"
        ></calendar-footer>
      </div>
    </div>
  `,
  host: {
    '(mousedown)': 'onMousedown($event)'
  }
})
export class NzDatePickerPanelComponent
  extends NzDatePickerPanelBase<Date | null, NzDateMode>
  implements OnChanges, OnDestroy
{
  timeOptions: SupportTimeOptions | null = null;
  activeDate!: Date;

  get hasFooter(): boolean {
    return this.showToday || !!this.showTime || !!this.extraFooter;
  }

  constructor(public cdr: ChangeDetectorRef) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Parse showTime options
    if (changes.showTime || changes.disabledTime) {
      if (this.showTime) {
        this.buildTimeOptions();
      }
    }

    if (changes.value || changes.defaultPickerValue) {
      this.onActiveDateChange(this.value || this.defaultPickerValue);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAllowed(value: Date | null): boolean {
    return isAllowedDate(value, [this.disabledDate], this.disabledTime);
  }

  /**
   * Prevent input losing focus when click panel
   *
   * @param event
   */
  onMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  onClickOk(): void {
    // const value = this.isRange ? this.getCurrentPartValue() : this.value;
    this.selectDate(this.value!);
    this.resultOk.emit();
  }

  onClickToday(value: Date): void {
    this.selectDate(value, !this.showTime);
  }

  onPanelModeChange(mode: NzDateMode): void {
    this.panelModeChange.emit(mode);
  }

  setActiveDate(value: Date | null | undefined): void {
    this.activeDate = value || new Date();
  }

  onActiveDateChange(value: Date | null | undefined): void {
    this.setActiveDate(value);
  }

  selectTime(value: Date): void {
    const newValue = overrideHms(value, this.value);
    this.onValueChange(newValue);
    this.buildTimeOptions();
  }

  selectDate(value: Date, emitValue: boolean = true): void {
    if (this.isAllowed(value)) {
      this.onValueChange(value);
      if (emitValue) {
        this.onValueEmit();
      }
    }
    this.cdr.markForCheck();
  }

  getObjectKeys(obj?: PresetRanges): string[] {
    return obj ? Object.keys(obj) : [];
  }

  protected buildTimeOptions(): void {
    if (this.showTime) {
      const showTime = typeof this.showTime === 'object' ? this.showTime : {};
      this.timeOptions = this.overrideTimeOptions(showTime, this.value);
    } else {
      this.timeOptions = null;
    }
  }

  private overrideTimeOptions(origin: SupportTimeOptions, value: Date | null): SupportTimeOptions {
    return { ...origin, ...getTimeConfig(value, this.disabledTime) };
  }
}
