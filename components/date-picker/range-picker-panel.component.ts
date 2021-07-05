/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

import { differenceInCalendarDays } from 'date-fns';

import { NormalizedMode, normalizeRangeValue } from 'ng-zorro-antd/core/time';

import { NzDatePickerPanelBase } from './date-picker-panel-base';
import {
  DisabledDateFn,
  DisabledTimeFn,
  DisabledTimePartial,
  NzDateMode,
  PresetRanges,
  RangePart,
  SupportTimeOptions
} from './standard-types';
import { cloneDate, getTimeConfig, isAllowedDate, overrideHms } from './util';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'nz-range-picker-panel',
  exportAs: 'nzRangePickerPanel',
  template: `
    <div class="ant-picker-panels">
      <ng-container *ngIf="showTime; else noTimePicker">
        <ng-container *ngTemplateOutlet="tplInnerPopup; context: { part: activePart }"></ng-container>
      </ng-container>
      <ng-template #noTimePicker>
        <ng-container *ngTemplateOutlet="tplInnerPopup; context: { part: 0 }"></ng-container>
        <ng-container *ngTemplateOutlet="tplInnerPopup; context: { part: 1 }"></ng-container>
      </ng-template>
    </div>
    <calendar-footer
      *ngIf="hasFooter"
      [locale]="locale"
      [showToday]="showToday"
      [showNow]="showNow"
      [hasTimePicker]="!!showTime"
      [okDisabled]="!isOneAllowed(value[activePart])"
      [extraFooter]="extraFooter"
      [rangeQuickSelector]="ranges ? tplRangeQuickSelector : null"
      (clickOk)="onClickOk()"
      (clickToday)="onClickToday($event)"
    ></calendar-footer>
    <ng-template #tplInnerPopup let-part="part">
      <div class="ant-picker-panel" [class.ant-picker-panel-rtl]="dir === 'rtl'">
        <!-- TODO(@wenqi73) [selectedValue] [hoverValue] types-->
        <inner-panel
          [showWeek]="showWeek"
          [partType]="part"
          [locale]="locale"
          [showTimePicker]="!!showTime"
          [timeOptions]="timeOptions[part]"
          [panelMode]="panelMode[part]"
          (panelModeChange)="onPanelModeChange($event, part)"
          [activeDate]="activeDate[part]"
          [value]="value[part]"
          [disabledDate]="disabledDate"
          [innerDisabledDate]="innerDisabledDateArr[activePart]"
          [dateRender]="dateRender"
          [selectedValue]="value"
          [hoverValue]="hoverValue"
          (cellHover)="onCellHover($event)"
          (selectDate)="selectDate($event, !showTime)"
          (selectTime)="selectTime($event, part)"
          (headerChange)="onActiveDateChange($event, part)"
        ></inner-panel>
      </div>
    </ng-template>

    <ng-template #tplRangeQuickSelector>
      <li
        *ngFor="let name of getObjectKeys(ranges)"
        class="ant-picker-preset"
        (click)="onClickPresetRange(ranges![name])"
        (mouseenter)="onHoverPresetRange(ranges![name])"
        (mouseleave)="clearHover()"
      >
        <span class="ant-tag ant-tag-blue">{{ name }}</span>
      </li>
    </ng-template>
  `,
  host: {
    class: 'ant-picker-panel-container',
    '[class.ant-picker-week-number]': 'showWeek',
    '[class.ant-picker-time]': 'showTime',
    '(mousedown)': 'onMousedown($event)'
  }
})
export class NzRangePickerPanelComponent
  extends NzDatePickerPanelBase<Array<Date | null>, NzDateMode[]>
  implements OnInit, OnChanges, OnDestroy
{
  activeDate!: Date[];
  hoverValue: Array<Date | null> = []; // Range ONLY
  innerDisabledDateArr: DisabledDateFn[] = []; // Range ONLY
  checkedPartArr: boolean[] = [false, false];
  firstActivePart!: RangePart;
  timeOptions: Array<SupportTimeOptions | null> = [null, null];

  @Input() activePart!: RangePart;
  @Input() ranges?: PresetRanges;

  @Output() readonly calendarChange = new EventEmitter<Array<Date | null>>();
  @Output() readonly activePartChange = new EventEmitter<RangePart>();

  get hasFooter(): boolean {
    return this.showToday || !!this.showTime || !!this.extraFooter || !!this.ranges;
  }

  constructor(public cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.firstActivePart = this.activePart;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Parse showTime options
    if (changes.showTime || changes.disabledTime) {
      if (this.showTime) {
        this.buildTimeOptions();
      }
    }

    if (changes.value || changes.defaultPickerValue) {
      this.changeActiveDate();
    }

    if (changes.activePart) {
      this.setInnerDisabledFn(this.activePart);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  disabledStartTime: DisabledTimeFn = (value: Date | null) => this.disabledTime?.(value, 'start');

  disabledEndTime: DisabledTimeFn = (value: Date | null) => this.disabledTime?.(value, 'end');

  // isAllowed(value: Date | null, part: RangePart = this.activePart): boolean {
  //   return isAllowedDate(value, [this.disabledDate, this.innerDisabledRangeDateArr[part]], this.disabledTime);
  // }

  isAllowed(selectedValue: Array<Date | null>): boolean {
    return (
      isAllowedDate(selectedValue[0]!, [this.disabledDate, this.innerDisabledDateArr[0]], this.disabledStartTime) &&
      isAllowedDate(selectedValue[1]!, [this.disabledDate, this.innerDisabledDateArr[1]], this.disabledEndTime)
    );
  }

  isOneAllowed(value: Date | null, part = this.activePart): boolean {
    return isAllowedDate(value, [this.disabledDate, this.innerDisabledDateArr[part]], this.disabledTime);
  }

  reset(): void {
    this.checkedPartArr = [false, false];
    this.innerDisabledDateArr = [];
  }

  /**
   * Prevent input losing focus when click panel
   *
   * @param event
   */
  onMousedown(event: MouseEvent): void {
    event.preventDefault();
  }

  onCellHover(value: Date): void {
    const otherInputIndex = this.theOtherPart(this.activePart);
    const base = this.value[otherInputIndex];
    if (base) {
      if (differenceInCalendarDays(base, value) < 0) {
        this.hoverValue = [base, value];
      } else {
        this.hoverValue = [value, base];
      }
    }
  }

  onClickOk(): void {
    this.selectDate(this.value[this.activePart]!);
    this.resultOk.emit();
  }

  onClickToday(value: Date): void {
    this.selectDate(value, !this.showTime);
  }

  onPanelModeChange(mode: NzDateMode, part: RangePart): void {
    const panelMode = [...this.panelMode];
    panelMode[part] = mode;
    this.panelModeChange.emit(panelMode);
  }

  setActiveDate(value: Array<Date | null>, hasTimePicker: boolean = false, mode: NzDateMode = 'month'): void {
    const parentPanels: { [key in NzDateMode]?: NormalizedMode } = {
      date: 'month',
      month: 'year',
      year: 'decade'
    };

    this.activeDate = normalizeRangeValue(cloneDate(value), hasTimePicker, parentPanels[mode], this.activePart);
  }

  changeActiveDate(): void {
    const activeDate = this.value[0] || this.value[1] ? this.value : this.defaultPickerValue;
    this.setActiveDate(activeDate, !!this.showTime, this.panelMode[this.activePart]);
  }

  onActiveDateChange(value: Date, part: RangePart = this.activePart): void {
    const activeDate: Array<Date | null> = [];
    activeDate[part] = value;
    this.setActiveDate(activeDate, !!this.showTime, this.panelMode[part]);
  }

  selectTime(value: Date, part: RangePart): void {
    this.value[part] = overrideHms(value, this.value[part]);
    this.onValueChange(this.value);
    this.buildTimeOptions();
  }

  selectDate(value: Date, emitValue: boolean = true): void {
    if (!this.isOneAllowed(value)) {
      return;
    }

    const checkedPart: RangePart = this.activePart;
    const nextPart = this.theOtherPart(checkedPart);
    this.value[checkedPart] = value;
    this.checkedPartArr[checkedPart] = true;
    this.hoverValue = this.value;

    if (emitValue) {
      // Should clear next part value when next part is right in inline
      // or the next part date is disabled
      const fn = this.createInnerDisabledFn(nextPart, value);
      if ((this.inline && nextPart === RangePart.Right) || (this.value[nextPart] && fn(this.value[nextPart]!))) {
        this.value[nextPart] = null;
        this.checkedPartArr[nextPart] = false;
      }
    }

    const newValue = [...this.value];
    this.onValueChange(newValue);
    this.setInnerDisabledFn(nextPart);
    /**
     * range date usually selected paired,
     * so we emit the date value only both date is allowed and both part are checked
     */
    if (this.isAllowed(newValue) && this.checkedPartArr.every(p => p)) {
      this.clearHover();
      if (emitValue) {
        this.calendarChange.emit(newValue);
        this.onValueEmit();
      }
    } else {
      if (emitValue) {
        this.calendarChange.emit([value]);
        this.activePartChange.emit(nextPart);
      }
    }
  }

  onClickPresetRange(val: PresetRanges[keyof PresetRanges]): void {
    const value = typeof val === 'function' ? val() : val;
    if (value) {
      this.onValueChange(value);
    }
  }

  onHoverPresetRange(val: PresetRanges[keyof PresetRanges]): void {
    if (typeof val !== 'function') {
      this.hoverValue = [val[0], val[1]];
    }
  }

  getObjectKeys(obj?: PresetRanges): string[] {
    return obj ? Object.keys(obj) : [];
  }

  clearHover(): void {
    this.hoverValue = [];
  }

  protected buildTimeOptions(): void {
    if (this.showTime) {
      const showTime = typeof this.showTime === 'object' ? this.showTime : {};
      this.timeOptions = [
        this.overrideTimeOptions(showTime, this.value[0], 'start'),
        this.overrideTimeOptions(showTime, this.value[1], 'end')
      ];
    } else {
      this.timeOptions = [null, null];
    }
  }

  private theOtherPart(part: RangePart): RangePart {
    return part === RangePart.Left ? RangePart.Right : RangePart.Left;
  }

  private overrideTimeOptions(
    origin: SupportTimeOptions,
    value: Date | null,
    partial?: DisabledTimePartial
  ): SupportTimeOptions {
    let disabledTimeFn;
    if (partial) {
      disabledTimeFn = partial === 'start' ? this.disabledStartTime : this.disabledEndTime;
    } else {
      disabledTimeFn = this.disabledTime;
    }
    return { ...origin, ...getTimeConfig(value, disabledTimeFn) };
  }

  private setInnerDisabledFn(part: RangePart): void {
    const firstActiveDate = this.value[this.firstActivePart];
    if (part !== this.firstActivePart && firstActiveDate) {
      // The first input date should be regarded as checked
      if (this.isOneAllowed(this.value[this.firstActivePart])) {
        this.checkedPartArr[this.firstActivePart] = true;
      }
      // #6321 If has selected a value, then the other should set innerDisabledDate
      this.innerDisabledDateArr[part] = this.createInnerDisabledFn(part, firstActiveDate);
    } else {
      this.innerDisabledDateArr[part] = () => false;
    }

    this.cdr.markForCheck();
  }

  private createInnerDisabledFn(part: RangePart, compareDate: Date): (date: Date) => boolean {
    return part === RangePart.Left
      ? (date: Date) => {
          return differenceInCalendarDays(date, compareDate) > 0;
        }
      : (date: Date) => {
          return differenceInCalendarDays(date, compareDate) < 0;
        };
  }
}
