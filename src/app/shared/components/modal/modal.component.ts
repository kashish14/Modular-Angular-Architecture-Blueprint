import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  standalone: false
})
export class ModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;

  readonly titleId = `modal-title-${++nextId}`;
  private previousFocus: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen']) {
      return;
    }
    if (this.isOpen) {
      this.previousFocus = document.activeElement as HTMLElement | null;
      // Wait for the dialog to render, then move focus into it.
      setTimeout(() => {
        const el = this.dialog?.nativeElement;
        (el?.querySelector<HTMLElement>('input, select, textarea, button[type="submit"]') ?? el)?.focus();
      });
    } else {
      this.previousFocus?.focus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
