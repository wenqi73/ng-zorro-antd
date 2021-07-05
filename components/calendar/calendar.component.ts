/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { Direction, Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { setMonth, setYear } from 'date-fns';

import { BooleanInput } from 'ng-zorro-antd/core/types';
import { InputBoolean } from 'ng-zorro-antd/core/util';

import {
  NzDateCellDirective as DateCell,
  NzDateFullCellDirective as DateFullCell,
  NzMonthCellDirective as MonthCell,
  NzMonthFullCellDirective as MonthFullCell
} from './calendar-cells';

export type NzCalendarMode = 'month' | 'year';
type NzCalendarDateTemplate = TemplateRef<{ $implicit: Date }>;

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nz-calendar',
  exportAs: 'nzCalendar',
  template: `
    <nz-calendar-header
      [fullscreen]="nzFullscreen"
      [activeDate]="activeDate"
      [(mode)]="nzMode"
      (modeChange)="onModeChange($event)"
      (yearChange)="onYearSelect($event)"
      (monthChange)="onMonthSelect($event)"
    ></nz-calendar-header>

    <div class="ant-picker-panel">
      <div class="ant-picker-{{ nzMode === 'month' ? 'date' : 'month' }}-panel">
        <div class="ant-picker-body">
          <ng-container *ngIf="nzMode === 'month'; then monthModeTable; else yearModeTable"></ng-container>
        </div>
      </div>
    </div>
    <ng-template #monthModeTable>
      <!--  TODO(@wenqi73) [cellRender] [fullCellRender] -->
      <date-table
        [prefixCls]="prefixCls"
        [value]="activeDate"
        [activeDate]="activeDate"
        [cellRender]="$any(dateCell)"
        [fullCellRender]="$any(dateFullCell)"
        [disabledDate]="nzDisabledDate"
        (valueChange)="onDateSelect($event)"
      ></date-table>
    </ng-template>

    <!--  TODO(@wenqi73) [cellRender] [fullCellRender] -->
    <ng-template #yearModeTable>
      <month-table
        [prefixCls]="prefixCls"
        [value]="activeDate"
        [activeDate]="activeDate"
        [cellRender]="$any(monthCell)"
        [fullCellRender]="$any(monthFullCell)"
        (valueChange)="onDateSelect($event)"
      ></month-table>
    </ng-template>
  `,
  host: {
    '[class.ant-picker-calendar-full]': 'nzFullscreen',
    '[class.ant-picker-calendar-mini]': '!nzFullscreen',
    '[class.ant-picker-calendar-rtl]': `dir === 'rtl'`
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NzCalendarComponent), multi: true }]
})
export class NzCalendarComponent implements ControlValueAccessor, OnChanges, OnInit, OnDestroy {
  static ngAcceptInputType_nzFullscreen: BooleanInput;

  activeDate: Date = new Date();
  prefixCls: string = 'ant-picker-calendar';
  private destroy$ = new Subject<void>();
  dir: Direction = 'ltr';

  private onChangeFn: (date: Date) => void = () => {};
  private onTouchFn: () => void = () => {};

  @Input() nzMode: NzCalendarMode = 'month';
  @Input() nzValue!: Date;
  @Input() nzDisabledDate?: (date: Date) => boolean;

  @Output() readonly nzModeChange: EventEmitter<NzCalendarMode> = new EventEmitter();
  @Output() readonly nzPanelChange: EventEmitter<{ date: Date; mode: NzCalendarMode }> = new EventEmitter();
  @Output() readonly nzSelectChange: EventEmitter<Date> = new EventEmitter();
  @Output() readonly nzValueChange: EventEmitter<Date> = new EventEmitter();

  /**
   * Cannot use @Input and @ContentChild on one variable
   * because { static: false } will make @Input property get delayed
   **/
  @Input() nzDateCell?: NzCalendarDateTemplate;
  @ContentChild(DateCell, { static: false, read: TemplateRef }) nzDateCellChild?: NzCalendarDateTemplate;
  get dateCell(): NzCalendarDateTemplate {
    return (this.nzDateCell || this.nzDateCellChild)!;
  }

  @Input() nzDateFullCell?: NzCalendarDateTemplate;
  @ContentChild(DateFullCell, { static: false, read: TemplateRef }) nzDateFullCellChild?: NzCalendarDateTemplate;
  get dateFullCell(): NzCalendarDateTemplate {
    return (this.nzDateFullCell || this.nzDateFullCellChild)!;
  }

  @Input() nzMonthCell?: NzCalendarDateTemplate;
  @ContentChild(MonthCell, { static: false, read: TemplateRef }) nzMonthCellChild?: NzCalendarDateTemplate;
  get monthCell(): NzCalendarDateTemplate {
    return (this.nzMonthCell || this.nzMonthCellChild)!;
  }

  @Input() nzMonthFullCell?: NzCalendarDateTemplate;
  @ContentChild(MonthFullCell, { static: false, read: TemplateRef }) nzMonthFullCellChild?: NzCalendarDateTemplate;
  get monthFullCell(): NzCalendarDateTemplate {
    return (this.nzMonthFullCell || this.nzMonthFullCellChild)!;
  }

  @Input() @InputBoolean() nzFullscreen: boolean = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    @Optional() private directionality: Directionality
  ) {
    // TODO: move to host after View Engine deprecation
    this.elementRef.nativeElement.classList.add('ant-picker-calendar');
  }

  ngOnInit(): void {
    this.dir = this.directionality.value;
    this.directionality.change?.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dir = this.directionality.value;
    });
  }

  onModeChange(mode: NzCalendarMode): void {
    this.nzModeChange.emit(mode);
    this.nzPanelChange.emit({ date: this.activeDate, mode });
  }

  onYearSelect(year: number): void {
    const date = setYear(this.activeDate, year);
    this.updateDate(date);
  }

  onMonthSelect(month: number): void {
    const date = setMonth(this.activeDate, month);
    this.updateDate(date);
  }

  onDateSelect(date: Date): void {
    this.updateDate(date);
  }

  writeValue(value: Date | null): void {
    this.updateDate(new Date(value as Date), false);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (date: Date) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchFn = fn;
  }

  private updateDate(date: Date, touched: boolean = true): void {
    this.activeDate = date;

    if (touched) {
      this.onChangeFn(date);
      this.onTouchFn();
      this.nzSelectChange.emit(date);
      this.nzValueChange.emit(date);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.nzValue) {
      this.updateDate(new Date(this.nzValue!), false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
