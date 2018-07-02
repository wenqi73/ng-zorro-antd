import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NzI18nModule } from '../i18n/nz-i18n.module';
import { NzDrawerComponent } from './nz-drawer.component';

@NgModule({
  imports: [CommonModule, OverlayModule, NzI18nModule],
  exports: [NzDrawerComponent],
  declarations: [NzDrawerComponent],
  providers: []
})
export class NzDrawerModule { }
