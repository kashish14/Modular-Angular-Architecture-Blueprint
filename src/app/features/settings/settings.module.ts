import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsPageComponent } from './components/settings-page/settings-page.component';
import { SettingsService } from './services/settings.service';

@NgModule({
  declarations: [
    SettingsPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SettingsRoutingModule
  ],
  providers: [
    SettingsService
  ]
})
export class SettingsModule { }
