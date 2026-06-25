import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'clp', standalone: true })
export class ClpPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
    }).format(value);
  }
}
