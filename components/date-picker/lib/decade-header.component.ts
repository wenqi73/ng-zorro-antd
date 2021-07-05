/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { addYears } from 'date-fns';
import { AbstractPanelHeader } from './abstract-panel-header';
import { PanelSelector } from './interface';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'decade-header', // eslint-disable-line @angular-eslint/component-selector
  exportAs: 'decadeHeader',
  templateUrl: './abstract-panel-header.html'
})
export class DecadeHeaderComponent extends AbstractPanelHeader {
  previous(): void {}
  next(): void {}

  get startYear(): number {
    return parseInt(`${this.value.getFullYear() / 100}`, 10) * 100;
  }

  get endYear(): number {
    return this.startYear + 99;
  }

  superPrevious(): void {
    this.changeValue(addYears(this.value, -100));
  }

  superNext(): void {
    this.changeValue(addYears(this.value, 100));
  }

  getSelectors(): PanelSelector[] {
    return [
      {
        className: `${this.prefixCls}-decade-btn`,
        title: '',
        onClick: () => {
          // noop
        },
        label: `${this.startYear}-${this.endYear}`
      }
    ];
  }
}
