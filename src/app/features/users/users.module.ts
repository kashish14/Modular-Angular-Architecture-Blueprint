import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UsersService } from './services/users.service';

@NgModule({
  declarations: [
    UsersListComponent
  ],
  imports: [
    FormsModule,
    SharedModule,
    UsersRoutingModule
  ],
  providers: [
    UsersService
  ]
})
export class UsersModule { }
