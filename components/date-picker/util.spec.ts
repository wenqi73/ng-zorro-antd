import { isAllowedDate } from './util';

describe('util.ts coverage supplements', () => {
  it('should cover untouched branches', () => {
    const disabledDate = () => true;
    expect(isAllowedDate(new Date(), [disabledDate])).toBeFalsy();

    const disabledTime = () => ({
      nzDisabledHours: () => [1],
      nzDisabledMinutes: () => [2],
      nzDisabledSeconds: () => [3]
    });
    expect(isAllowedDate(new Date('2000-11-11 01:11:11'), undefined, disabledTime)).toBeFalsy();
    expect(isAllowedDate(new Date('2000-11-11 02:02:11'), undefined, disabledTime)).toBeFalsy();
    expect(isAllowedDate(new Date('2000-11-11 02:03:03'), undefined, disabledTime)).toBeFalsy();
  });
});
