import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  selectedUser: User | null = null;
  showAddModal = false;
  showEditModal = false;
  
  // Form data
  newUser = {
    name: '',
    email: '',
    role: 'User',
    status: 'active' as 'active' | 'inactive' | 'pending'
  };

  editingUser: User | null = null;

  roles = ['Admin', 'Manager', 'User', 'Viewer'];
  statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];

  constructor(
    private usersService: UsersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe(users => {
      this.users = users;
      this.loading = false;
    });
  }

  onUserClick(user: User): void {
    this.selectedUser = user;
    this.usersService.selectUser(user);
  }

  onAddUser(): void {
    this.showAddModal = true;
    this.resetForm();
  }

  onCloseAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  onSubmitNewUser(): void {
    if (this.newUser.name && this.newUser.email) {
      this.usersService.addUser(this.newUser).subscribe(() => {
        this.loadUsers();
        this.onCloseAddModal();
      });
    }
  }

  onEditUser(user: User, event: Event): void {
    event.stopPropagation();
    this.editingUser = { ...user };
    this.showEditModal = true;
  }

  onCloseEditModal(): void {
    this.showEditModal = false;
    this.editingUser = null;
  }

  onSubmitEditUser(): void {
    if (this.editingUser) {
      this.usersService.updateUser(this.editingUser.id, this.editingUser).subscribe(() => {
        this.loadUsers();
        this.onCloseEditModal();
      });
    }
  }

  onDeleteUser(user: User, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.usersService.deleteUser(user.id).subscribe(() => {
        if (this.selectedUser?.id === user.id) {
          this.selectedUser = null;
        }
        this.loadUsers();
      });
    }
  }

  resetForm(): void {
    this.newUser = {
      name: '',
      email: '',
      role: 'User',
      status: 'active'
    };
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'inactive':
        return '#6B7280';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
