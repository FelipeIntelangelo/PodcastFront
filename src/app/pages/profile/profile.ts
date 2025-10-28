import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/client/user-service';
import { User } from '../../models/user/user';
import { UserSearchDTO } from '../../models/user/userSearchDTO';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  user: User | UserSearchDTO | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  isAdmin: boolean = false;
  private sub = new Subscription();

  constructor(
    private userService: UserService, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAdminRole();
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        this.isLoading = true;
        this.error = null;
        const idParam = params.get('id');
        const id = idParam ? Number(idParam) : null;

        if (id !== null && !isNaN(id)) { // Check if id is a valid number
          this.userService.getUserById(id).subscribe({
            next: (data) => this.handleLoadSuccess(data, true),
            error: (err) => this.handleLoadError('Failed to load user by id.', err)
          });
        } else {
          this.userService.getCurrentUserProfile().subscribe({
            next: (data) => this.handleLoadSuccess(data, false),
            error: (err) => this.handleLoadError('Failed to load user profile.', err)
          });
        }
      })
    );
  }

  checkAdminRole(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (user) => {
        if (this.isFullUser(user) && user.credential.roles.includes('ADMIN')) {
          this.isAdmin = true;
        }
      },
      error: () => {
        this.isAdmin = false;
      }
    });
  }

  deleteAccount(event: Event): void {
    event.preventDefault(); // Prevent default link behavior
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.userService.deleteCurrentUser().subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/']); // Redirect to home page
        },
        error: (err) => {
          this.error = 'Failed to delete account.';
          console.error(err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  isFullUser(value: User | UserSearchDTO | null): value is User {
    return !!value && 'credential' in value;
  }

  private handleLoadSuccess(data: User | UserSearchDTO, shouldScroll: boolean): void {
    this.user = data;
    this.isLoading = false;
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private handleLoadError(message: string, err: unknown): void {
    this.error = message;
    this.isLoading = false;
    console.error(err);
  }
}