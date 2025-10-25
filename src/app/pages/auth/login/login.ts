import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/client/user-service';
import { UserLoginDTO } from '../../../models/user/userLogin/user-login-dto';
import { CommonModule } from '@angular/common';
import { FormError } from '../../../components/shared/form-error/form-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FormError],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  errorCheck: string | null = null;

  customErrors: { [controlName: string]: { [key: string]: string } } = {
    username: {
      required: 'El nombre de usuario es obligatorio'
    },
    password: {
      required: 'La contraseña es obligatoria'
    }
  }

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginPayload: UserLoginDTO = this.loginForm.value;
      this.userService.login(loginPayload).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          localStorage.setItem('jwt_token', response.token); // Store the token
          this.router.navigate(['/']); // Navigate to home page
        },
        error: (err) => {
          this.errorMessage = err.error || 'Login failed.';
          this.errorCheck = 'Please check your credentials';
          console.error('Login error', err);
        }
      });
    } else {
      this.errorMessage = 'Please enter both username and password.';
    }
  }
}
