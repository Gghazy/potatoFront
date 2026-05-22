import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'egp', standalone: false })
export class CurrencyEgpPipe implements PipeTransform {
  transform(value: number | string | null | undefined, fractionDigits = 0): string {
    if (value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return '-';
    return `${n.toLocaleString('ar-EG', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })} ج.م`;
  }
}
