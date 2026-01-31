import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ModalComponent } from './components/modal/modal.component';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    LoadingSpinnerComponent,
    ModalComponent,
    DateFormatPipe,
    TruncatePipe
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    // Re-export commonly used Angular modules
    CommonModule,
    RouterModule,
    // Export shared components
    ButtonComponent,
    CardComponent,
    LoadingSpinnerComponent,
    ModalComponent,
    // Export pipes
    DateFormatPipe,
    TruncatePipe
  ]
})
export class SharedModule { }
