import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/client/user-service';
import { User } from '../../models/user/user';
import { UserSearchDTO } from '../../models/user/userSearchDTO';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: User | UserSearchDTO | null = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private userService: UserService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.userService.getUserById(id).subscribe({
        next: (data) => {
          this.user = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load user by id.';
          this.isLoading = false;
          console.error(err);
        }
      });
    } else {
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

  // Esto es para saber si el usuario es de tipo DTO o es el usuario completo
  isFullUser(value: User | UserSearchDTO | null): value is User {
    return !!value && 'credential' in value;
  }
}