import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/client/user-service';
import { User } from '../../models/user/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfileComponent implements OnInit {
  editProfileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.initForm();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user profile.';
        this.isLoading = false;
        console.error('Error loading user profile:', err);
      }
    });
  }

  initForm(): void {
    if (this.currentUser) {
      this.editProfileForm = this.fb.group({
        name: [this.currentUser.name, Validators.required],
        lastName: [this.currentUser.lastName, Validators.required],
        nickname: [this.currentUser.nickname, Validators.required],
        profilePicture: [this.currentUser.profilePicture],
        bio: [this.currentUser.bio],
        email: [this.currentUser.credential.email, [Validators.required, Validators.email]],
        username: [this.currentUser.credential.username, Validators.required]
      });
    }
  }

  onSave(): void {
    if (this.editProfileForm.valid && this.currentUser) {
      const updatedData: Partial<User> = {
        ...this.currentUser,
        ...this.editProfileForm.value,
        credential: {
          ...this.currentUser.credential,
          email: this.editProfileForm.value.email,
          username: this.editProfileForm.value.username
        }
      };

      this.userService.updateCurrentUserProfile(updatedData).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          this.error = 'Failed to update profile.';
          console.error(err);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }
}
