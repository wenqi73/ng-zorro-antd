/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { addDays, isSameYear, setDate, setMonth, setYear } from 'date-fns';
import { isBeforeYear } from 'ng-zorro-antd/core/time';
import { valueFunctionProp } from 'ng-zorro-antd/core/util';
import { DateHelperService } from 'ng-zorro-antd/i18n';
import { AbstractTable } from './abstract-table';
import { DateBodyRow, DateCell, YearCell } from './interface';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'year-table',
  exportAs: 'yearTable',
  templateUrl: 'abstract-table.html'
})
export class YearTableComponent extends AbstractTable {
  MAX_ROW = 4;
  MAX_COL = 3;

  constructor(private dateHelper: DateHelperService) {
    super();
  }

  makeHeadRow(): DateCell[] {
    return [];
  }

  makeBodyRows(): DateBodyRow[] {
    const currentYear = this.activeDate && this.activeDate.getFullYear();
    const startYear = parseInt(`${currentYear / 10}`, 10) * 10;
    const endYear = startYear + 9;
    const previousYear = startYear - 1;
    const years: DateBodyRow[] = [];
    let yearValue = 0;

    for (let rowIndex = 0; rowIndex < this.MAX_ROW; rowIndex++) {
      const row: DateBodyRow = {
        dateCells: [],
        trackByIndex: rowIndex
      };
      for (let colIndex = 0; colIndex < this.MAX_COL; colIndex++) {
        const yearNum = previousYear + yearValue;
        const year = setYear(this.activeDate, yearNum);
        const content = this.dateHelper.format(year, 'yyyy');
        const isDisabled = this.isDisabledYear(year);
        const cell: YearCell = {
          trackByIndex: colIndex,
          value: year,
          isDisabled,
          isSameDecade: yearNum >= startYear && yearNum <= endYear,
          isSelected: yearNum === (this.value && this.value.getFullYear()),
          content,
          title: content,
          classMap: {},
          isLastCellInPanel: year.getFullYear() === endYear,
          isFirstCellInPanel: year.getFullYear() === startYear,
          cellRender: valueFunctionProp(this.cellRender!, year), // Customized content
          fullCellRender: valueFunctionProp(this.fullCellRender!, year),
          onClick: () => this.chooseYear(cell.value.getFullYear()), // don't use yearValue here,
          onMouseEnter: () => this.cellHover.emit(year)
        };

        this.addCellProperty(cell, year);
        row.dateCells.push(cell);
        yearValue++;
      }
      years.push(row);
    }
    return years;
  }

  getClassMap(cell: YearCell): { [key: string]: boolean } {
    return {
      ...super.getClassMap(cell),
      [`ant-picker-cell-in-view`]: !!cell.isSameDecade
    };
  }

  private isDisabledYear(year: Date): boolean {
    if (!this.disabledDate) {
      return false;
    }

    const firstOfMonth = setDate(setMonth(year, 0), 1);

    for (let date = firstOfMonth; date.getFullYear() === year.getFullYear(); date = addDays(date, 1)) {
      if (!this.disabledDate(date)) {
        return false;
      }
    }

    return true;
  }

  private addCellProperty(cell: DateCell, year: Date): void {
    if (this.hasRangeValue()) {
      const [startHover, endHover] = this.hoverValue;
      const [startSelected, endSelected] = this.selectedValue;

      // TODO: date-fns can accept null as parameter, but types lose it
      if (isSameYear(startSelected!, year)) {
        cell.isSelectedStart = true;
        cell.isSelected = true;
      }

      if (isSameYear(endSelected!, year)) {
        cell.isSelectedEnd = true;
        cell.isSelected = true;
      }

      if (startHover && endHover) {
        cell.isHoverStart = isSameYear(startHover, year);
        cell.isHoverEnd = isSameYear(endHover, year);
        cell.isInHoverRange = isBeforeYear(startHover, year) && isBeforeYear(year, endHover);
      }

      cell.isStartSingle = !!startSelected && !endSelected;
      cell.isEndSingle = !startSelected && !!endSelected;
      cell.isInSelectedRange = isBeforeYear(startSelected!, year) && isBeforeYear(year, endSelected!);
      cell.isRangeStartNearHover = !!startSelected && cell.isInHoverRange;
      cell.isRangeEndNearHover = !!endSelected && cell.isInHoverRange;
    } else if (isSameYear(year, this.value!)) {
      cell.isSelected = true;
    }
    cell.classMap = this.getClassMap(cell);
  }

  private chooseYear(year: number): void {
    this.value = setYear(this.activeDate, year);
    this.valueChange.emit(this.value);
    this.render();
  }
}
