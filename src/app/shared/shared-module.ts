import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';

import { Topbar } from './components/topbar/topbar';
import { Footer } from './components/footer/footer';
import { ConfirmDeleteModal } from './components/confirm-delete-modal/confirm-delete-modal';
import { FormModal } from './components/form-modal/form-modal';
import { RowActionsMenu } from './components/row-actions-menu/row-actions-menu';
import { ImageLightbox } from './components/image-lightbox/image-lightbox';
import { CurrencyEgpPipe } from './pipes/currency-egp.pipe';

const COMPONENTS = [Topbar, Footer, ConfirmDeleteModal, FormModal, RowActionsMenu, ImageLightbox];
const PIPES = [CurrencyEgpPipe];
const MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  TranslateModule,
  NgxPaginationModule,
  NgSelectModule,
];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [...MODULES],
  exports: [...COMPONENTS, ...PIPES, ...MODULES],
})
export class SharedModule {}
