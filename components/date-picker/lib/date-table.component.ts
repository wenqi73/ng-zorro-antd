/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { addDays, isFirstDayOfMonth, isLastDayOfMonth, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { isBeforeDay } from 'ng-zorro-antd/core/time';
import { valueFunctionProp } from 'ng-zorro-antd/core/util';

import { DateHelperService, NzCalendarI18nInterface, NzI18nService } from 'ng-zorro-antd/i18n';
import { AbstractTable } from './abstract-table';
import { DateBodyRow, DateCell } from './interface';
import { transCompatFormat } from './util';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'date-table',
  exportAs: 'dateTable',
  templateUrl: './abstract-table.html'
})
export class DateTableComponent extends AbstractTable implements OnChanges, OnInit {
  @Input() locale!: NzCalendarI18nInterface;

  constructor(private i18n: NzI18nService, private dateHelper: DateHelperService) {
    super();
  }

  private changeValueFromInside(value: Date): void {
    // Only change date not change time
    this.activeDate = new Date(
      this.activeDate.setFullYear(
        value.getFullYear(),
        value.getMonth(),
        value.getDate())
    );

    this.valueChange.emit(this.activeDate);

    if (!isSameMonth(this.activeDate, this.value!)) {
      this.render();
    }
  }

  makeHeadRow(): DateCell[] {
    const weekDays: DateCell[] = [];
    const start = this.getFirstWeekDayOfMonth(this.activeDate);
    for (let colIndex = 0; colIndex < this.MAX_COL; colIndex++) {
      const day = addDays(start, colIndex);
      weekDays.push({
        trackByIndex: null,
        value: day,
        title: this.dateHelper.format(day, 'E'), // eg. Tue
        content: this.dateHelper.format(day, this.getVeryShortWeekFormat()), // eg. Tu,
        isSelected: false,
        isDisabled: false,
        onClick(): void {},
        onMouseEnter(): void {}
      });
    }
    return weekDays;
  }

  private getVeryShortWeekFormat(): string {
    return this.i18n.getLocaleId().toLowerCase().indexOf('zh') === 0 ? 'EEEEE' : 'EEEEEE'; // Use extreme short for chinese
  }

  private getFirstWeekDayOfMonth(date: Date): Date {
    return startOfWeek(startOfMonth(date), { weekStartsOn: this.dateHelper.getFirstDayOfWeek() })
  }

  makeBodyRows(): DateBodyRow[] {
    const weekRows: DateBodyRow[] = [];
    const firstDayOfMonth = this.getFirstWeekDayOfMonth(this.activeDate);

    for (let week = 0; week < this.MAX_ROW; week++) {
      const weekStart = addDays(firstDayOfMonth, week * 7);
      const row: DateBodyRow = {
        isActive: false,
        dateCells: [],
        trackByIndex: week
      };

      for (let day = 0; day < 7; day++) {
        const date = addDays(weekStart, day);
        const dateFormat = transCompatFormat(this.i18n.getLocaleData('DatePicker.lang.dateFormat', 'YYYY-MM-DD'));
        const title = this.dateHelper.format(date, dateFormat);
        const label = this.dateHelper.format(date, 'dd');
        const cell: DateCell = {
          trackByIndex: day,
          value: date,
          label,
          isSelected: false,
          isDisabled: false,
          isToday: false,
          title,
          cellRender: valueFunctionProp(this.cellRender!, date), // Customized content
          fullCellRender: valueFunctionProp(this.fullCellRender!, date),
          content: `${date.getDate()}`,
          onClick: () => this.changeValueFromInside(date),
          onMouseEnter: () => this.cellHover.emit(date)
        };

        this.addCellProperty(cell, date);

        if (this.showWeek && !row.weekNum) {
          row.weekNum = this.dateHelper.getISOWeek(date);
        }

        if (isSameDay(date, this.value!)) {
          row.isActive = isSameDay(date, this.value!);
        }

        row.dateCells.push(cell);
      }
      row.classMap = {
        [`ant-picker-week-panel-row`]: this.showWeek,
        [`ant-picker-week-panel-row-selected`]: this.showWeek && row.isActive
      };
      weekRows.push(row);
    }
    return weekRows;
  }

  addCellProperty(cell: DateCell, date: Date): void {
    if (this.hasRangeValue() && !this.showWeek) {
      const [startHover, endHover] = this.hoverValue;
      const [startSelected, endSelected] = this.selectedValue;
      // Selected
      if (isSameDay(startSelected!, date)) {
        cell.isSelectedStart = true;
        cell.isSelected = true;
      }

      if (isSameDay(endSelected!, date)) {
        cell.isSelectedEnd = true;
        cell.isSelected = true;
      }

      if (startHover && endHover) {
        cell.isHoverStart = isSameDay(startHover, date);
        cell.isHoverEnd = isSameDay(endHover, date);
        cell.isLastCellInPanel = isLastDayOfMonth(date);
        cell.isFirstCellInPanel = isFirstDayOfMonth(date);
        cell.isInHoverRange = isBeforeDay(startHover, date) && isBeforeDay(date, endHover);
      }
      cell.isStartSingle = !!startSelected && !endSelected;
      cell.isEndSingle = !startSelected && !!endSelected;
      cell.isInSelectedRange = isBeforeDay(startSelected!, date) && isBeforeDay(date, endSelected!);
      cell.isRangeStartNearHover = !!startSelected && cell.isInHoverRange;
      cell.isRangeEndNearHover = !!endSelected && cell.isInHoverRange;
    }

    cell.isToday = isToday(date);
    cell.isSelected = isSameDay(date, this.value!);
    cell.isDisabled = !!this.disabledDate?.(date) || !!this.innerDisabledDate?.(date);
    cell.classMap = this.getClassMap(cell);
  }

  getClassMap(cell: DateCell): { [key: string]: boolean } {
    const date = new Date(cell.value);
    return {
      ...super.getClassMap(cell),
      [`ant-picker-cell-today`]: !!cell.isToday,
      [`ant-picker-cell-in-view`]: isSameMonth(date, this.activeDate)
    };
  }
}
