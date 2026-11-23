import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StateService } from '@core/services/state.service';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user.model';

type UserStatus = User['status'];

interface UserForm {
  name: string;
  email: string;
  role: string;
  status: UserStatus;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  standalone: false
})
export class UsersListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  users: User[] = [];
  loading = true;
  saving = false;
  searchTerm = '';
  selectedUser: User | null = null;

  /** Add and edit share one form; `editingId` is null when adding. */
  showFormModal = false;
  editingId: string | null = null;
  form: UserForm = this.emptyForm();

  userToDelete: User | null = null;

  roles = ['Admin', 'Manager', 'User', 'Viewer'];
  statuses: UserStatus[] = ['active', 'inactive', 'pending'];

  constructor(private usersService: UsersService, private state: StateService) {}

  ngOnInit(): void {
    this.usersService
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(users => {
        this.users = users;
        this.loading = false;
        // Restore the selection kept in shared state when returning to this page.
        const selectedId = this.selectedUser?.id ?? this.state.getSelectedUser()?.id;
        this.selectedUser = users.find(u => u.id === selectedId) ?? null;
      });
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.users;
    }
    return this.users.filter(
      u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.role.toLowerCase().includes(term)
    );
  }

  get activeCount(): number {
    return this.users.filter(u => u.status === 'active').length;
  }

  get formValid(): boolean {
    return !!this.form.name.trim() && EMAIL_PATTERN.test(this.form.email.trim());
  }

  get emailInvalid(): boolean {
    return !!this.form.email && !EMAIL_PATTERN.test(this.form.email.trim());
  }

  onUserClick(user: User): void {
    this.selectedUser = user;
    this.usersService.selectUser(user);
  }

  onAddUser(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showFormModal = true;
  }

  onEditUser(user: User, event: Event): void {
    event.stopPropagation();
    this.editingId = user.id;
    this.form = { name: user.name, email: user.email, role: user.role, status: user.status };
    this.showFormModal = true;
  }

  onCloseFormModal(): void {
    this.showFormModal = false;
  }

  onSubmitForm(): void {
    if (!this.formValid || this.saving) {
      return;
    }
    const data = { ...this.form, name: this.form.name.trim(), email: this.form.email.trim() };
    const request$ = this.editingId ? this.usersService.updateUser(this.editingId, data) : this.usersService.addUser(data);
    this.saving = true;
    request$.subscribe(() => {
      this.saving = false;
      this.showFormModal = false;
    });
  }

  onDeleteUser(user: User, event: Event): void {
    event.stopPropagation();
    this.userToDelete = user;
  }

  onConfirmDelete(): void {
    const user = this.userToDelete;
    if (!user || this.saving) {
      return;
    }
    this.saving = true;
    this.usersService.deleteUser(user.id).subscribe(() => {
      this.saving = false;
      this.userToDelete = null;
    });
  }

  onCancelDelete(): void {
    this.userToDelete = null;
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  avatarHue(user: User): number {
    let hash = 0;
    for (const ch of user.name) {
      hash = (hash * 31 + ch.charCodeAt(0)) % 360;
    }
    return hash;
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  private emptyForm(): UserForm {
    return { name: '', email: '', role: 'User', status: 'active' };
  }
}
