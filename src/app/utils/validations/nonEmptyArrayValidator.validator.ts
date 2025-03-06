import { AbstractControl, ValidatorFn } from '@angular/forms';

export function nonEmptyArrayValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (value && Array.isArray(value) && value.length === 0) {
      return { required: true }; 
    }
    return null; 
  };
}