/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { BidiModule } from '@angular/cdk/bidi';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import { NzOutletModule } from 'ng-zorro-antd/core/outlet';
import { NzOverlayModule } from 'ng-zorro-antd/core/overlay';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

import { CalendarFooterComponent } from './calendar-footer.component';
import { NzDatePickerContentComponent } from './date-picker-content.component';
import { NzDatePickerPanelComponent } from './date-picker-panel.component';
import { NzDatePickerComponent } from './date-picker.component';
import { InnerPanelComponent } from './inner-panel.component';
import { LibPackerModule } from './lib/lib-packer.module';
import { NzMonthPickerComponent } from './month-picker.component';
import { NzRangePickerContentComponent } from './range-picker-content.component';
import { NzRangePickerPanelComponent } from './range-picker-panel.component';
import { NzRangePickerComponent } from './range-picker.component';
import { NzWeekPickerComponent } from './week-picker.component';
import { NzYearPickerComponent } from './year-picker.component';

@NgModule({
  imports: [
    BidiModule,
    CommonModule,
    FormsModule,
    OverlayModule,
    LibPackerModule,
    NzIconModule,
    NzOverlayModule,
    NzNoAnimationModule,
    NzOutletModule,
    NzTimePickerModule,
    NzButtonModule,
    LibPackerModule
  ],
  exports: [
    NzDatePickerComponent,
    NzRangePickerComponent,
    NzMonthPickerComponent,
    NzYearPickerComponent,
    NzWeekPickerComponent
  ],
  declarations: [
    NzDatePickerComponent,
    NzMonthPickerComponent,
    NzYearPickerComponent,
    NzWeekPickerComponent,
    NzRangePickerComponent,
    NzDatePickerContentComponent,
    NzDatePickerPanelComponent,
    NzRangePickerContentComponent,
    NzRangePickerPanelComponent,
    CalendarFooterComponent,
    InnerPanelComponent
  ]
})
export class NzDatePickerModule {}
