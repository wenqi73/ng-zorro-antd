/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, OnDestroy } from '@angular/core';

import { slideMotion } from 'ng-zorro-antd/core/animation';
import { NzRangePickerComponent } from 'ng-zorro-antd/date-picker/range-picker.component';
import { NzDateMode } from 'ng-zorro-antd/date-picker/standard-types';

import { NzDatePickerContentBase } from './date-picker-content-base';

@Component({
  selector: 'nz-range-picker-content',
  template: `
    <div class="ant-picker-range-wrapper ant-picker-date-range-wrapper">
      <div class="ant-picker-range-arrow" [style.left.px]="datePicker.arrowLeft"></div>
      <nz-range-picker-panel
        #panel
        [value]="datePicker.value"
        (valueChange)="datePicker.onValueChange($event!)"
        (valueEmit)="datePicker.onValueEmit()"
        [activePart]="datePicker.activePart"
        (activePartChange)="datePicker.onActivePartChange($event)"
        [defaultPickerValue]="datePicker.nzDefaultPickerValue"
        [showWeek]="datePicker.nzMode === 'week'"
        [panelMode]="datePicker.panelMode"
        (panelModeChange)="datePicker.onPanelModeChange($event)"
        [locale]="datePicker.nzLocale?.lang!"
        [showTime]="datePicker.nzShowTime"
        [dateRender]="datePicker.nzDateRender"
        [disabledDate]="datePicker.nzDisabledDate"
        [disabledTime]="datePicker.nzDisabledTime"
        [extraFooter]="datePicker.extraFooter"
        [ranges]="datePicker.nzRanges"
        [dir]="datePicker.dir"
        (calendarChange)="datePicker.onCalendarChange($event)"
        (resultOk)="datePicker.onResultOk()"
      ></nz-range-picker-panel>
    </div>
  `,
  host: {
    '[nzNoAnimation]': 'datePicker.noAnimation?.nzNoAnimation',
    '[@slideMotion]': 'animationState',
    '(@slideMotion.done)': 'animationDone.next()',
    '[class.ant-picker-dropdown]': 'true',
    '[class.ant-picker-dropdown-range]': 'true',
    '[class.class.ant-picker-dropdown-rtl]': 'datePicker.dir === "rtl"',
    '[class]': 'datePicker.nzDropdownClassName',
    '[ngStyle]': 'datePicker.nzPopupStyle',
    '[class.ant-picker-dropdown-placement-bottomLeft]':
      'datePicker.currentPositionY === "bottom" && datePicker.currentPositionX === "start"',
    '[class.ant-picker-dropdown-placement-topLeft]':
      'datePicker.currentPositionY === "top" && datePicker.currentPositionX === "start"',
    '[class.ant-picker-dropdown-placement-bottomRight]':
      'datePicker.currentPositionY === "bottom" && datePicker.currentPositionX === "end"',
    '[class.ant-picker-dropdown-placement-topRight]':
      'datePicker.currentPositionY === "top" && datePicker.currentPositionX === "end"'
  },
  animations: [slideMotion]
})
export class NzRangePickerContentComponent
  extends NzDatePickerContentBase<Array<Date | null>, NzDateMode[]>
  implements OnDestroy
{
  datePicker!: NzRangePickerComponent;
}
