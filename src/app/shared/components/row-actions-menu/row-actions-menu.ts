import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-row-actions-menu',
  standalone: false,
  template: `
    <div class="row-actions" (click)="$event.stopPropagation()">
      <button type="button" class="btn btn-sm btn-info"
              [disabled]="isClosed"
              [title]="isClosed ? 'افتح أولاً' : editLabel"
              (click)="edit.emit()">
        <i class="bi bi-pencil"></i> {{ editLabel }}
      </button>

      <div class="row-actions__menu">
        <button type="button" class="btn btn-sm btn-light row-actions__toggle"
                [class.row-actions__toggle--open]="open()"
                (click)="toggle()"
                aria-label="المزيد">
          <i class="bi bi-three-dots-vertical"></i>
        </button>

        <div class="row-actions__dropdown" *ngIf="open()">
          <button *ngIf="!isClosed" type="button" class="row-actions__item row-actions__item--warning"
                  (click)="emitAndClose(close)">
            <i class="bi bi-lock"></i> {{ closeLabel }}
          </button>
          <button *ngIf="isClosed" type="button" class="row-actions__item row-actions__item--success"
                  (click)="emitAndClose(reopen)">
            <i class="bi bi-unlock"></i> {{ reopenLabel }}
          </button>
          <div class="row-actions__divider"></div>
          <button type="button" class="row-actions__item row-actions__item--danger"
                  [disabled]="isClosed"
                  [title]="isClosed ? 'افتح أولاً' : ''"
                  (click)="emitAndClose(delete)">
            <i class="bi bi-trash"></i> حذف
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./row-actions-menu.css'],
})
export class RowActionsMenu {
  @Input() isClosed = false;
  @Input() editLabel = 'تعديل';
  @Input() closeLabel = 'إغلاق';
  @Input() reopenLabel = 'فتح';

  @Output() edit = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() reopen = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  open = signal<boolean>(false);

  constructor(private host: ElementRef<HTMLElement>) {}

  toggle(): void {
    this.open.update(v => !v);
  }

  emitAndClose(emitter: EventEmitter<void>): void {
    this.open.set(false);
    emitter.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.open.set(false);
  }
}
