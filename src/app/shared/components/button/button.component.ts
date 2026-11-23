import { Component, Input, Output, EventEmitter } from '@angular/core';

export type ButtonType = 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    standalone: false
})
export class ButtonComponent {
  @Input() type: ButtonType = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  /** Native button type. Defaults to 'button' so buttons inside forms never submit by accident. */
  @Input() buttonType: 'button' | 'submit' = 'button';
  @Input() ariaLabel?: string;
  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }

  get classes(): string {
    return `btn btn-${this.type} btn-${this.size} ${this.fullWidth ? 'btn-full-width' : ''}`;
  }
}
