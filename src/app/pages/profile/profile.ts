import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/client/user-service';
import { User } from '../../models/user/user';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf

@Component({
  selector: 'app-profile',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: User | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user profile.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }
}