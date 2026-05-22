import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
  SimpleChanges,
  OnChanges,
} from '@angular/core';

@Component({
  selector: 'app-image-lightbox',
  standalone: false,
  template: `
    <div class="img-lightbox" *ngIf="src" (click)="close.emit()">
      <img [src]="src" alt=""
           [style.transform]="'rotate(' + rotation() + 'deg)'"
           (click)="$event.stopPropagation()" />

      <div class="img-lightbox__controls" (click)="$event.stopPropagation()">
        <button type="button" class="img-lightbox__btn"
                (click)="rotateLeft()" title="تدوير لليسار">
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
        <button type="button" class="img-lightbox__btn"
                (click)="rotateRight()" title="تدوير لليمين">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
        <button *ngIf="rotation() !== 0" type="button" class="img-lightbox__btn img-lightbox__btn--reset"
                (click)="resetRotation()" title="استعادة الوضع الأصلى">
          <i class="bi bi-arrow-counterclockwise"></i> 0°
        </button>
      </div>

      <button type="button" class="img-lightbox__close" (click)="close.emit()" aria-label="إغلاق">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
  `,
  styleUrls: ['./image-lightbox.css'],
})
export class ImageLightbox implements OnChanges {
  @Input() src: string | null = null;
  @Output() close = new EventEmitter<void>();

  rotation = signal<number>(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) this.rotation.set(0);
  }

  rotateRight(): void { this.rotation.update(r => (r + 90) % 360); }
  rotateLeft(): void { this.rotation.update(r => (r - 90 + 360) % 360); }
  resetRotation(): void { this.rotation.set(0); }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (!this.src) return;
    if (event.key === 'Escape') this.close.emit();
    else if (event.key === 'r' || event.key === 'R') this.rotateRight();
    else if (event.key === 'l' || event.key === 'L') this.rotateLeft();
  }
}
