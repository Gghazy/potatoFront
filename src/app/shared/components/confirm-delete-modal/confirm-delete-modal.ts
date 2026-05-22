import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: false,
  template: `
    <div class="modal fade show d-block" tabindex="-1" *ngIf="open" style="background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header no-border">
            <div class="d-flex align-items-center gap-3">
              <span class="confirm-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </span>
              <h5 class="modal-title mb-0">{{ title }}</h5>
            </div>
            <button type="button" class="btn-close" aria-label="إغلاق" (click)="cancel.emit()"></button>
          </div>
          <div class="modal-body pt-1 text-secondary">{{ message }}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancel.emit()">إلغاء</button>
            <button type="button" class="btn btn-danger" (click)="confirm.emit()">
              <i class="bi bi-trash"></i> حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--danger-soft);
      color: var(--danger);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
  `],
})
export class ConfirmDeleteModal {
  @Input() open = false;
  @Input() title = 'تأكيد الحذف';
  @Input() message = 'هل أنت متأكد من حذف هذا العنصر؟';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
