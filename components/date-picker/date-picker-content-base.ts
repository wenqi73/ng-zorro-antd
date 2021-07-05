/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { ChangeDetectorRef, Directive, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

import { NzDatePickerBase } from './date-picker-base';
import { NzDatePickerPanelBase } from './date-picker-panel-base';

@Directive()
export class NzDatePickerContentBase<D, M> {
  animationState = 'enter';
  animationDone = new Subject<void>();
  datePicker!: NzDatePickerBase<D, M>;

  @ViewChild('panel') panel!: NzDatePickerPanelBase<D, M>;

  constructor(private cdr: ChangeDetectorRef) {}

  startExitAnimation() {
    this.animationState = 'void';
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.animationDone.complete();
  }
}
