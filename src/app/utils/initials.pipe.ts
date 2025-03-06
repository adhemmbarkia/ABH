import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials'
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .split(' ') // Split words by space
      .map(word => word.charAt(0).toUpperCase()) // Take first letter and uppercase it
      .join(''); // Join without spaces
  }
}
