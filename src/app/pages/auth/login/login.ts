import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/client/user-service';
import { UserLoginDTO } from '../../../models/user/userLogin/user-login-dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;

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
          this.errorMessage = err.error || 'Login failed. Please check your credentials.';
          console.error('Login error', err);
        }
      });

    } else {
      this.errorMessage = 'Please enter both username and password.';
    }
  }
}
