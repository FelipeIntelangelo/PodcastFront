import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit{
  registerForm!: FormGroup;
  currentStep = 1;

  constructor(public router:Router){}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      nickname: new FormControl('', Validators.required),
    });
  }

  nextStep() {
    if (this.currentStep === 1 && this.registerForm.get('username')!.valid
        && this.registerForm.get('email')!.valid
        && this.registerForm.get('password')!.valid)
    {
      this.currentStep = 2;
    } else {
      this.registerForm.markAllAsTouched(); // con esto reutilizamos los validadores.
    }
  }

  prevStep() {
  this.currentStep = 1;
  }

  get username() { return this.registerForm.get('username'); }
  get password() { return this.registerForm.get('password'); }
  get email() { return this.registerForm.get('email'); }
  get name() { return this.registerForm.get('name'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get nickname() { return this.registerForm.get('nickname'); }

  onSubmit(){
    console.log(this.username?.value)
    alert('Registrado correctamente')
    this.router.navigate(['auth/login']);
  }
}
