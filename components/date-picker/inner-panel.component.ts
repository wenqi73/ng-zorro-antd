/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

import { FunctionProp } from 'ng-zorro-antd/core/types';
import { NzCalendarI18nInterface } from 'ng-zorro-antd/i18n';

import { DisabledDateFn, NzDateMode, RangePart, SupportTimeOptions } from './standard-types';
import { PREFIX_CLASS } from './util';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'inner-panel',
  exportAs: 'innerPanel',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="{{ prefixCls }}-{{ panelMode }}-panel">
      <ng-container [ngSwitch]="panelMode">
        <ng-container *ngSwitchCase="'decade'">
          <decade-header
            [(value)]="activeDate"
            [locale]="locale"
            [showSuperPreBtn]="enablePrevNext('prev', 'decade')"
            [showSuperNextBtn]="enablePrevNext('next', 'decade')"
            [showNextBtn]="false"
            [showPreBtn]="false"
            (panelModeChange)="panelModeChange.emit($event)"
            (valueChange)="headerChange.emit($event)"
          ></decade-header>
          <div class="{{ prefixCls }}-body">
            <decade-table
              [activeDate]="activeDate"
              [value]="value"
              [locale]="locale"
              (valueChange)="onChooseDecade($event)"
              [disabledDate]="disabledDate"
            ></decade-table>
          </div>
        </ng-container>
        <ng-container *ngSwitchCase="'year'">
          <year-header
            [(value)]="activeDate"
            [locale]="locale"
            [showSuperPreBtn]="enablePrevNext('prev', 'year')"
            [showSuperNextBtn]="enablePrevNext('next', 'year')"
            [showNextBtn]="false"
            [showPreBtn]="false"
            (panelModeChange)="panelModeChange.emit($event)"
            (valueChange)="headerChange.emit($event)"
          ></year-header>
          <div class="{{ prefixCls }}-body">
            <year-table
              [activeDate]="activeDate"
              [value]="value"
              [locale]="locale"
              [disabledDate]="disabledDate"
              [selectedValue]="selectedValue"
              [hoverValue]="hoverValue"
              (valueChange)="onChooseYear($event)"
              (cellHover)="cellHover.emit($event)"
            ></year-table>
          </div>
        </ng-container>
        <ng-container *ngSwitchCase="'month'">
          <month-header
            [(value)]="activeDate"
            [locale]="locale"
            [showSuperPreBtn]="enablePrevNext('prev', 'month')"
            [showSuperNextBtn]="enablePrevNext('next', 'month')"
            [showNextBtn]="false"
            [showPreBtn]="false"
            (panelModeChange)="panelModeChange.emit($event)"
            (valueChange)="headerChange.emit($event)"
          ></month-header>
          <div class="{{ prefixCls }}-body">
            <month-table
              [value]="value"
              [activeDate]="activeDate"
              [locale]="locale"
              [disabledDate]="disabledDate"
              [selectedValue]="selectedValue"
              [hoverValue]="hoverValue"
              (valueChange)="onChooseMonth($event)"
              (cellHover)="cellHover.emit($event)"
            ></month-table>
          </div>
        </ng-container>

        <ng-container *ngSwitchDefault>
          <date-header
            [(value)]="activeDate"
            [locale]="locale"
            [showSuperPreBtn]="showWeek ? enablePrevNext('prev', 'week') : enablePrevNext('prev', 'date')"
            [showSuperNextBtn]="showWeek ? enablePrevNext('next', 'week') : enablePrevNext('next', 'date')"
            [showPreBtn]="showWeek ? enablePrevNext('prev', 'week') : enablePrevNext('prev', 'date')"
            [showNextBtn]="showWeek ? enablePrevNext('next', 'week') : enablePrevNext('next', 'date')"
            (panelModeChange)="panelModeChange.emit($event)"
            (valueChange)="headerChange.emit($event)"
          ></date-header>
          <div class="{{ prefixCls }}-body">
            <date-table
              [locale]="locale"
              [showWeek]="showWeek"
              [value]="value"
              [activeDate]="activeDate"
              [disabledDate]="disabledDate"
              [innerDisabledDate]="innerDisabledDate"
              [cellRender]="dateRender"
              [selectedValue]="selectedValue"
              [hoverValue]="hoverValue"
              (valueChange)="onSelectDate($event)"
              (cellHover)="cellHover.emit($event)"
            ></date-table>
          </div>
        </ng-container>
      </ng-container>
    </div>
    <ng-container *ngIf="showTimePicker && timeOptions">
      <nz-time-picker-panel
        [nzInDatePicker]="true"
        [ngModel]="value"
        (ngModelChange)="onSelectTime($event)"
        [format]="$any(timeOptions.nzFormat)"
        [nzHourStep]="$any(timeOptions.nzHourStep)"
        [nzMinuteStep]="$any(timeOptions.nzMinuteStep)"
        [nzSecondStep]="$any(timeOptions.nzSecondStep)"
        [nzDisabledHours]="$any(timeOptions.nzDisabledHours)"
        [nzDisabledMinutes]="$any(timeOptions.nzDisabledMinutes)"
        [nzDisabledSeconds]="$any(timeOptions.nzDisabledSeconds)"
        [nzHideDisabledOptions]="!!timeOptions.nzHideDisabledOptions"
        [nzDefaultOpenValue]="$any(timeOptions.nzDefaultOpenValue)"
        [nzUse12Hours]="!!timeOptions.nzUse12Hours"
        [nzAddOn]="$any(timeOptions.nzAddOn)"
      ></nz-time-picker-panel>
      <!-- use [opened] to trigger time panel 'initPosition()' -->
    </ng-container>
  `,
  host: {
    '[class.ant-picker-datetime-panel]': 'showTimePicker'
  }
})
export class InnerPanelComponent implements OnChanges {
  @Input() activeDate!: Date;
  @Input() panelMode!: NzDateMode;
  @Input() showWeek!: boolean;
  @Input() locale!: NzCalendarI18nInterface;
  @Input() showTimePicker!: boolean;
  @Input() timeOptions!: SupportTimeOptions | null;
  @Input() disabledDate?: DisabledDateFn;
  @Input() innerDisabledDate?: DisabledDateFn; // Range ONLY
  @Input() dateRender?: string | TemplateRef<Date> | FunctionProp<TemplateRef<Date> | string>;
  @Input() selectedValue!: Array<Date | null>; // Range ONLY
  @Input() hoverValue!: Array<Date | null>; // Range ONLY
  @Input() value!: Date | null;
  @Input() partType!: RangePart;

  @Output() readonly panelModeChange = new EventEmitter<NzDateMode>();
  // TODO: name is not proper
  @Output() readonly headerChange = new EventEmitter<Date>(); // Emitted when user changed the header's value
  @Output() readonly selectDate = new EventEmitter<Date>(); // Emitted when the date is selected by click the date panel
  @Output() readonly selectTime = new EventEmitter<Date>();
  @Output() readonly cellHover = new EventEmitter<Date>(); // Emitted when hover on a day by mouse enter

  prefixCls: string = PREFIX_CLASS;

  /**
   * Hide "next" arrow in left panel,
   * hide "prev" arrow in right panel
   *
   * @param direction
   * @param panelMode
   */
  enablePrevNext(direction: 'prev' | 'next', panelMode: NzDateMode): boolean {
    return !(
      !this.showTimePicker &&
      panelMode === this.panelMode &&
      ((this.partType === RangePart.Left && direction === 'next') ||
        (this.partType === RangePart.Right && direction === 'prev'))
    );
  }

  onSelectTime(date: Date): void {
    this.selectTime.emit(date);
  }

  // The value real changed to outside
  onSelectDate(date: Date): void {
    const timeValue = this.timeOptions && this.timeOptions.nzDefaultOpenValue;

    // Display timeValue when value is null
    if (!this.value && timeValue) {
      date.setHours(timeValue.getHours(), timeValue.getMinutes(), timeValue.getSeconds());
    }

    this.selectDate.emit(date);
  }

  onChooseMonth(value: Date): void {
    this.activeDate = new Date(this.activeDate.setMonth(value.getMonth()));
    if (this.panelMode === 'month') {
      this.value = value;
      this.selectDate.emit(value);
    } else {
      this.headerChange.emit(value);
      this.panelModeChange.emit(this.panelMode);
    }
  }

  onChooseYear(value: Date): void {
    this.activeDate = new Date(this.activeDate.setFullYear(value.getFullYear()));
    if (this.panelMode === 'year') {
      this.value = value;
      this.selectDate.emit(value);
    } else {
      this.headerChange.emit(value);
      this.panelModeChange.emit(this.panelMode);
    }
  }

  onChooseDecade(value: Date): void {
    this.activeDate = new Date(this.activeDate.setFullYear(value.getFullYear()));
    if (this.panelMode === 'decade') {
      this.value = value;
      this.selectDate.emit(value);
    } else {
      this.headerChange.emit(value);
      this.panelModeChange.emit('year');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeDate && !changes.activeDate.currentValue) {
      this.activeDate = new Date();
    }
    // New Antd vesion has merged 'date' ant 'time' to one panel,
    // So there is not 'time' panel
    if (changes.panelMode && changes.panelMode.currentValue === 'time') {
      this.panelMode = 'date';
    }
  }
}
