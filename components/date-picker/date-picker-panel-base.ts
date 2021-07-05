/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Direction } from '@angular/cdk/bidi';
import { Directive, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';

import { FunctionProp } from 'ng-zorro-antd/core/types';
import {
  DisabledDateFn,
  DisabledTimeFn,
  NzDateMode,
  RangePart,
  SupportTimeOptions
} from 'ng-zorro-antd/date-picker/standard-types';
import { NzCalendarI18nInterface } from 'ng-zorro-antd/i18n';

@Directive()
export abstract class NzDatePickerPanelBase<D, M> {
  destroy$ = new Subject();

  @Input() value!: D;
  @Input() defaultPickerValue!: D;
  @Input() panelMode!: M;
  @Input() showWeek: boolean = false;
  @Input() locale!: NzCalendarI18nInterface;
  @Input() disabledDate?: DisabledDateFn;
  @Input() disabledTime?: DisabledTimeFn; // This will lead to rebuild time options
  @Input() showToday: boolean = false;
  @Input() showNow: boolean = false;
  @Input() showTime: SupportTimeOptions | boolean = false;
  @Input() extraFooter?: TemplateRef<void> | string;
  @Input() dateRender?: string | TemplateRef<Date> | FunctionProp<TemplateRef<Date> | string>;
  @Input() dir: Direction = 'ltr';
  @Input() inline: boolean = false;

  @Output() readonly valueChange = new EventEmitter<D>();
  @Output() readonly valueEmit = new EventEmitter<void>();
  @Output() readonly panelModeChange = new EventEmitter<M>();
  @Output() readonly resultOk = new EventEmitter<void>(); // Emitted when done with date selecting

  onValueChange(value: D): void {
    this.value = value;
    this.valueChange.emit(value);
  }

  onValueEmit(): void {
    this.valueEmit.emit();
  }

  // Panel value only be controlled by nzPanel
  abstract onPanelModeChange(value: NzDateMode, part?: RangePart): void;

  abstract selectDate(value: Date, emitValue: boolean): void;

  abstract isAllowed(value: D): boolean;
}
