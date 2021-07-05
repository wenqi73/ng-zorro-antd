/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { DisabledDateFn, DisabledTimeConfig, DisabledTimeFn } from './standard-types';

export const PREFIX_CLASS = 'ant-picker';

const defaultDisabledTime: DisabledTimeConfig = {
  nzDisabledHours(): number[] {
    return [];
  },
  nzDisabledMinutes(): number[] {
    return [];
  },
  nzDisabledSeconds(): number[] {
    return [];
  }
};

export function getTimeConfig(value: Date | null, disabledTime?: DisabledTimeFn): DisabledTimeConfig {
  let disabledTimeConfig = disabledTime?.(value) ?? ({} as DisabledTimeConfig);
  disabledTimeConfig = {
    ...defaultDisabledTime,
    ...disabledTimeConfig
  };
  return disabledTimeConfig;
}

export function isTimeValidByConfig(value: Date, disabledTimeConfig: DisabledTimeConfig): boolean {
  let invalidTime = false;
  if (value) {
    const hour = value.getHours();
    const minutes = value.getMinutes();
    const seconds = value.getSeconds();
    const disabledHours = disabledTimeConfig.nzDisabledHours();
    if (disabledHours.indexOf(hour) === -1) {
      const disabledMinutes = disabledTimeConfig.nzDisabledMinutes(hour);
      if (disabledMinutes.indexOf(minutes) === -1) {
        const disabledSeconds = disabledTimeConfig.nzDisabledSeconds(hour, minutes);
        invalidTime = disabledSeconds.indexOf(seconds) !== -1;
      } else {
        invalidTime = true;
      }
    } else {
      invalidTime = true;
    }
  }
  return !invalidTime;
}

export function isTimeValid(value: Date, disabledTime: DisabledTimeFn): boolean {
  const disabledTimeConfig = getTimeConfig(value, disabledTime);
  return isTimeValidByConfig(value, disabledTimeConfig);
}

export function isAllowedDate(
  value: Date | null,
  disabledDateArray: Array<DisabledDateFn | undefined> = [],
  disabledTime?: DisabledTimeFn
): boolean {
  if (!value) {
    return false;
  }

  if (disabledDateArray?.length > 0) {
    for (const disabledDate of disabledDateArray) {
      if (disabledDate && disabledDate(value)) {
        return false;
      }
    }
  }
  if (disabledTime) {
    if (!isTimeValid(value, disabledTime)) {
      return false;
    }
  }
  return true;
}

export function isSameRange(previous: Array<Date | null>, current: Array<Date | null>): boolean {
  return current.every((value, index) => {
    const previousDate = previous[index];
    return previousDate?.getTime() === value?.getTime();
  });
}

export function isSameDate(previous: Date | null, current: Date | null): boolean {
  return previous?.getTime() === current?.getTime();
}

export function overrideHms(newValue: Date, oldValue: Date | null): Date {
  oldValue = oldValue || new Date();
  const result = oldValue.setHours(newValue.getHours(), newValue.getMinutes(), newValue.getSeconds());
  return new Date(result);
}

export function cloneDate<T>(value: T): T;
export function cloneDate<T>(value: T[]): T[];
export function cloneDate<T>(value: T[] | T): T[] | T {
  return Array.isArray(value) ? [...value] : value;
}
