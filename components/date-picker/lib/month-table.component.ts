/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ChangeDetectionStrategy, Component, OnChanges, OnInit, ViewEncapsulation } from '@angular/core';
import { addDays, isSameMonth, setDate, setMonth } from 'date-fns';
import { isBeforeMonth } from 'ng-zorro-antd/core/time';
import { valueFunctionProp } from 'ng-zorro-antd/core/util';
import { DateHelperService } from 'ng-zorro-antd/i18n';
import { AbstractTable } from './abstract-table';
import { DateBodyRow, DateCell } from './interface';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'month-table',
  exportAs: 'monthTable',
  templateUrl: 'abstract-table.html'
})
export class MonthTableComponent extends AbstractTable implements OnChanges, OnInit {
  MAX_ROW = 4;
  MAX_COL = 3;

  constructor(private dateHelper: DateHelperService) {
    super();
  }

  makeHeadRow(): DateCell[] {
    return [];
  }

  makeBodyRows(): DateBodyRow[] {
    const months: DateBodyRow[] = [];
    let monthValue = 0;

    for (let rowIndex = 0; rowIndex < this.MAX_ROW; rowIndex++) {
      const row: DateBodyRow = {
        dateCells: [],
        trackByIndex: rowIndex
      };

      for (let colIndex = 0; colIndex < this.MAX_COL; colIndex++) {
        const month = setMonth(this.activeDate, monthValue);
        const isDisabled = this.isDisabledMonth(month);
        const content = this.dateHelper.format(month, 'MMM');
        const cell: DateCell = {
          trackByIndex: colIndex,
          value: month,
          isDisabled,
          isSelected: isSameMonth(month, this.value!),
          content,
          title: content,
          classMap: {},
          cellRender: valueFunctionProp(this.cellRender!, month), // Customized content
          fullCellRender: valueFunctionProp(this.fullCellRender!, month),
          onClick: () => this.chooseMonth(cell.value.getMonth()), // don't use monthValue here,
          onMouseEnter: () => this.cellHover.emit(month)
        };

        this.addCellProperty(cell, month);
        row.dateCells.push(cell);
        monthValue++;
      }
      months.push(row);
    }
    return months;
  }

  private isDisabledMonth(month: Date): boolean {
    if (!this.disabledDate) {
      return false;
    }

    const firstOfMonth = setDate(month, 1);

    for (let date = firstOfMonth; date.getMonth() === month.getMonth(); date = addDays(date, 1)) {
      if (!this.disabledDate(date)) {
        return false;
      }
    }

    return true;
  }

  private addCellProperty(cell: DateCell, month: Date): void {
    if (this.hasRangeValue()) {
      const [startHover, endHover] = this.hoverValue;
      const [startSelected, endSelected] = this.selectedValue;
      // Selected
      if (isSameMonth(startSelected!, month)) {
        cell.isSelectedStart = true;
        cell.isSelected = true;
      }

      if (isSameMonth(endSelected!, month)) {
        cell.isSelectedEnd = true;
        cell.isSelected = true;
      }

      if (startHover && endHover) {
        cell.isHoverStart = isSameMonth(startHover, month);
        cell.isHoverEnd = isSameMonth(endHover, month);
        cell.isLastCellInPanel = month.getMonth() === 11;
        cell.isFirstCellInPanel = month.getMonth() === 0;
        cell.isInHoverRange = isBeforeMonth(startHover, month) && isBeforeMonth(month, endHover);
      }
      cell.isStartSingle = !!startSelected && !endSelected;
      cell.isEndSingle = !startSelected && !!endSelected;
      cell.isInSelectedRange = isBeforeMonth(startSelected!, month) && isBeforeMonth(month, endSelected!);
      cell.isRangeStartNearHover = !!startSelected && cell.isInHoverRange;
      cell.isRangeEndNearHover = !!endSelected && cell.isInHoverRange;
    } else if (isSameMonth(month, this.value!)) {
      cell.isSelected = true;
    }
    cell.classMap = this.getClassMap(cell);
  }

  private chooseMonth(month: number): void {
    this.value = setMonth(this.activeDate, month);
    this.valueChange.emit(this.value);
  }
}
