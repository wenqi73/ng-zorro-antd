/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import {
  addMonths,
  addYears,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  isSameDay,
  isSameHour,
  isSameMinute,
  isSameMonth,
  isSameSecond,
  isSameYear,
  setDay,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek
} from 'date-fns';

import { warn } from 'ng-zorro-antd/core/logger';
import { IndexableObject, NzSafeAny } from 'ng-zorro-antd/core/types';

export type CandyDateMode = 'decade' | 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
export type NormalizedMode = 'decade' | 'year' | 'month';
export type WeekDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type CandyDateType = CandyDate | Date | null;

export function normalizeRangeValue(
  value: Array<Date | null>,
  hasTimePicker: boolean,
  type: NormalizedMode = 'month',
  activePart = 0
): Date[] {
  const [start, end] = value;
  let newStart: CandyDate = new CandyDate(start);
  let newEnd: CandyDate = end ? new CandyDate(end) : hasTimePicker ? newStart : newStart.add(1, type);

  if (!start && end) {
    newStart = hasTimePicker ? newEnd : newEnd.add(-1, type);
  } else if (start && end && !hasTimePicker) {
    if (newStart.isSame(end, type) || activePart === 0) {
      newEnd = newStart.add(1, type);
    } else {
      newStart = newEnd.add(-1, type);
    }
  }
  return [newStart.nativeDate, newEnd.nativeDate];
}

/**
 * Wrapping kind APIs for date operating and unify
 * NOTE: every new API return new CandyDate object without side effects to the former Date object
 * NOTE: most APIs are based on local time other than customized locale id (this needs tobe support in future)
 * TODO: support format() against to angular's core API
 */
export class CandyDate implements IndexableObject {
  nativeDate: Date;
  // locale: string; // Custom specified locale ID

  constructor(date?: Date | string | number | null) {
    if (date) {
      if (date instanceof Date) {
        this.nativeDate = new Date(date);
      } else if (typeof date === 'string' || typeof date === 'number') {
        warn('The string type is not recommended for date-picker, use "Date" type');
        this.nativeDate = new Date(date);
      } else {
        throw new Error('The input date type is not supported ("Date" is now recommended)');
      }
    } else {
      this.nativeDate = new Date();
    }
  }

  calendarStart(options?: { weekStartsOn: WeekDayIndex | undefined }): CandyDate {
    return new CandyDate(startOfWeek(startOfMonth(this.nativeDate), options));
  }

  // ---------------------------------------------------------------------
  // | New implementing APIs
  // ---------------------------------------------------------------------

  setHms(hour: number, minute: number, second: number): CandyDate {
    const newDate = new Date(this.nativeDate.setHours(hour, minute, second));
    return new CandyDate(newDate);
  }

  setYear(year: number): CandyDate {
    return new CandyDate(setYear(this.nativeDate, year));
  }

  addYears(amount: number): CandyDate {
    return new CandyDate(addYears(this.nativeDate, amount));
  }

  // NOTE: month starts from 0
  // NOTE: Don't use the native API for month manipulation as it not restrict the date when it overflows, eg. (new Date('2018-7-31')).setMonth(1) will be date of 2018-3-03 instead of 2018-2-28
  setMonth(month: number): CandyDate {
    return new CandyDate(setMonth(this.nativeDate, month));
  }

  addMonths(amount: number): CandyDate {
    return new CandyDate(addMonths(this.nativeDate, amount));
  }

  setDay(day: number, options?: { weekStartsOn: WeekDayIndex }): CandyDate {
    return new CandyDate(setDay(this.nativeDate, day, options));
  }

  add(amount: number, mode: NormalizedMode): CandyDate {
    switch (mode) {
      case 'decade':
        return this.addYears(amount * 10);
      case 'year':
        return this.addYears(amount);
      case 'month':
        return this.addMonths(amount);
      default:
        return this.addMonths(amount);
    }
  }

  isSame(date: CandyDateType, grain: CandyDateMode = 'day'): boolean {
    let fn;
    switch (grain) {
      case 'decade':
        fn = (pre: Date, next: Date) => Math.abs(pre.getFullYear() - next.getFullYear()) < 11;
        break;
      case 'year':
        fn = isSameYear;
        break;
      case 'month':
        fn = isSameMonth;
        break;
      case 'day':
        fn = isSameDay;
        break;
      case 'hour':
        fn = isSameHour;
        break;
      case 'minute':
        fn = isSameMinute;
        break;
      case 'second':
        fn = isSameSecond;
        break;
      default:
        fn = isSameDay;
        break;
    }
    return fn(this.nativeDate, this.toNativeDate(date));
  }

  private toNativeDate(date: NzSafeAny): Date {
    return date instanceof CandyDate ? date.nativeDate : date;
  }
}

export function isBeforeYear(left: Date, right: Date): boolean {
  return differenceInCalendarYears(left, right) < 0;
}

export function isBeforeMonth(left: Date, right: Date): boolean {
  return differenceInCalendarMonths(left, right) < 0;
}

export function isBeforeDay(left: Date, right: Date): boolean {
  return differenceInCalendarDays(left, right) < 0;
}
