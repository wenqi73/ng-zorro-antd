import { Component } from '@angular/core';

@Component({
  selector: 'nz-demo-drawer-basic',
  template: `
    <nz-drawer [nzVisible]="visible">
      hahaha
    </nz-drawer>
    <button (click)="change()">change</button>
  `,
  styles  : [
      `p {
      margin: 0;
    }`
  ]
})
export class NzDemoDrawerBasicComponent {
  visible = false;

  change(): void {
    this.visible = !this.visible;
  }
}
