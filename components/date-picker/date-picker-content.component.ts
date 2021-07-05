/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Component, OnDestroy } from '@angular/core';

import { slideMotion } from 'ng-zorro-antd/core/animation';
import { NzDateMode } from 'ng-zorro-antd/date-picker/standard-types';

import { NzDatePickerContentBase } from './date-picker-content-base';
import { NzDatePickerComponent } from './date-picker.component';

@Component({
  selector: 'nz-date-picker-content',
  template: `
    <nz-date-picker-panel
      #panel
      [value]="datePicker.value"
      (valueChange)="datePicker.onValueChange($event!)"
      (valueEmit)="datePicker.onValueEmit()"
      [defaultPickerValue]="datePicker.nzDefaultPickerValue"
      [showWeek]="datePicker.nzMode === 'week'"
      [panelMode]="datePicker.panelMode"
      (panelModeChange)="datePicker.onPanelModeChange($event)"
      [locale]="datePicker.nzLocale?.lang!"
      [showToday]="datePicker.nzMode === 'date' && datePicker.nzShowToday && !datePicker.nzShowTime"
      [showNow]="datePicker.nzMode === 'date' && datePicker.nzShowNow && !!datePicker.nzShowTime"
      [showTime]="datePicker.nzShowTime"
      [dateRender]="datePicker.nzDateRender"
      [disabledDate]="datePicker.nzDisabledDate"
      [disabledTime]="datePicker.nzDisabledTime"
      [extraFooter]="datePicker.extraFooter"
      [dir]="datePicker.dir"
      (resultOk)="datePicker.onResultOk()"
    ></nz-date-picker-panel>
  `,
  animations: [slideMotion],
  host: {
    '[class.ant-picker-dropdown]': 'true',
    '[class.class.ant-picker-dropdown-rtl]': 'datePicker.dir === "rtl"',
    '[class]': 'datePicker.nzDropdownClassName',
    '[ngStyle]': 'datePicker.nzPopupStyle',
    '[nzNoAnimation]': 'datePicker.noAnimation?.nzNoAnimation',
    '[@slideMotion]': 'animationState',
    '(@slideMotion.done)': 'animationDone.next()'
  }
})
export class NzDatePickerContentComponent
  extends NzDatePickerContentBase<Date | null, NzDateMode>
  implements OnDestroy
{
  datePicker!: NzDatePickerComponent;
}
