import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormError } from '../../../components/shared/form-error/form-error';
import { ClientService } from '../../../services/client/client-service';
import { UserRegisterDTO } from '../../../models/user/userRegister/user-register-dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FormError],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  currentStep = 1;
  isSubmitting = false;
  serverError: string | null = null;

  // custom error messages for form-error component
  customErrors: { [controlName: string]: { [key: string]: string } } = {
    username: {
      required: 'El nombre de usuario es obligatorio',
      minlength: 'El usuario debe tener al menos {requiredLength} caracteres',
      maxlength: 'El usuario no puede superar {requiredLength} caracteres',
      pattern: 'Solo letras, números y guiones bajos están permitidos'
    },
    password: {
      required: 'La contraseña es obligatoria',
      minlength: 'La contraseña debe tener al menos {requiredLength} caracteres',
      maxlength: 'La contraseña no puede superar {requiredLength} caracteres',
    },
    name: {
      required: 'El nombre es obligatorio',
      minlength: 'El nombre debe tener al menos {requiredLength} caracteres',
      maxlength: 'El nombre no puede superar {requiredLength} caracteres',
    },
    lastName: {
      required: 'El apellido es obligatorio',
      minlength: 'El apellido debe tener al menos {requiredLength} caracteres',
      maxlength: 'El apellido no puede superar {requiredLength} caracteres',
    },
    nickname: {
      required: 'El nickname es obligatorio',
      minlength: 'El nickname debe tener al menos {requiredLength} caracteres',
      maxlength: 'El nickname no puede superar {requiredLength} caracteres',
      pattern: 'El nickname solo puede contener letras, números y guion bajo',
    },
    email: {
      required: 'El email es obligatorio.',
      email: 'Debe ser un email valido.',
      maxlength: 'El email no debe superar los {requiredLength} caracteres.',
      pattern: 'El email contiene caracteres invalidos.',
    }
  };

  constructor(public router: Router, public clientService: ClientService) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(50),
        Validators.pattern('^(?![.])[a-zA-Z0-9._%+-]+(?<![.])@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$')
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(19)
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(19)
      ]),
      nickname: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9_]+$')
      ]),
    });
  }

  get username() { return this.registerForm.get('username'); }
  get password() { return this.registerForm.get('password'); }
  get email() { return this.registerForm.get('email'); }
  get name() { return this.registerForm.get('name'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get nickname() { return this.registerForm.get('nickname'); }

  nextStep() {
    if (this.currentStep === 1 && this.registerForm.get('username')!.valid
        && this.registerForm.get('email')!.valid
        && this.registerForm.get('password')!.valid) {
      this.currentStep = 2;
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  prevStep() {
    this.currentStep = 1;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload: UserRegisterDTO = {
      name: this.name?.value,
      lastName: this.lastName?.value,
      nickname: this.nickname?.value,
      credential: {
        email: this.email?.value,
        username: this.username?.value,
        password: this.password?.value
      }
    };

    // Ensure spinner visible at least 1 second
    const start = Date.now();
    this.isSubmitting = true;
    this.serverError = null;

    this.clientService.postUser(payload).subscribe({
      next: (response) => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(() => {
          this.isSubmitting = false;
          this.router.navigate(['/auth/login']);
        }, remaining);
      },
      error: (err) => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(() => {
          this.serverError = this.formatError(err);
          this.isSubmitting = false;
        }, remaining);
      }
    });
  }

  private formatError(err: any): string {
    if (!err) return 'Error al registrar el usuario.';
    if (typeof err === 'string') return err;
    // If backend returned an object in 'error' property (HttpErrorResponse), use that
    const payload = err.error ?? err;
    if (typeof payload === 'string') return payload;
    if (payload && typeof payload === 'object') {
      if (payload.message) return payload.message;
      // some APIs return { errors: [...] }
      if (payload.errors && Array.isArray(payload.errors) && payload.errors.length) return String(payload.errors[0]);
    }
    if (err.message) return err.message;
    return 'Error al registrar el usuario.';
  }

}

