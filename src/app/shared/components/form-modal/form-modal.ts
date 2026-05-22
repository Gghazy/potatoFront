import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-modal',
  standalone: false,
  template: `
    <div class="modal fade show d-block" tabindex="-1" *ngIf="open" style="background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px);">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
           [ngClass]="size === 'lg' ? 'modal-lg' : (size === 'xl' ? 'modal-xl' : '')">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" aria-label="إغلاق" (click)="cancel.emit()"></button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="cancel.emit()">{{ cancelLabel }}</button>
            <button type="button" class="btn btn-primary" [disabled]="saving" (click)="save.emit()">
              {{ saveLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FormModal {
  @Input() open = false;
  @Input() title = '';
  @Input() saveLabel = 'حفظ';
  @Input() cancelLabel = 'إلغاء';
  @Input() size: '' | 'lg' | 'xl' = 'lg';
  @Input() saving = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
