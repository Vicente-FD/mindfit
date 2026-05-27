import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (value.length < 8) errors['minLength'] = true;
    if (!/[A-Z]/.test(value)) errors['uppercase'] = true;
    if (!/\d/.test(value)) errors['number'] = true;

    return Object.keys(errors).length ? errors : null;
  };
}

export function passwordsMatchValidator(
  passwordKey: string,
  confirmKey: string,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    if (!password || !confirm) return null;
    return password === confirm ? null : { mismatch: true };
  };
}

export function hasMinLength(value: string): boolean {
  return value.length >= 8;
}

export function hasUppercase(value: string): boolean {
  return /[A-Z]/.test(value);
}

export function hasNumber(value: string): boolean {
  return /\d/.test(value);
}
