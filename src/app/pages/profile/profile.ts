import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/client/user-service';
import { User } from '../../models/user/user';
import { UserSearchDTO } from '../../models/user/userSearchDTO';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { AlertService } from '../../services/ui/alert.service';

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
    private router: Router,
    private alertService: AlertService
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

  async deleteAccount(event: Event): Promise<void> {
    event.preventDefault();
    
    const confirmed = await this.alertService.confirm(
      '¿Eliminar cuenta?',
      '¿Estás seguro de que querés eliminar tu cuenta? Esta acción no se puede deshacer.'
    );
    
    if (confirmed) {
      this.userService.deleteCurrentUser().subscribe({
        next: () => {
          this.alertService.success('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente.');
          this.authService.logout();
          this.router.navigate(['/']);
        },
        error: (err) => {
          // Extraer el mensaje de error de la API
          let errorMessage = 'No se pudo eliminar la cuenta. Intentá nuevamente.';
          
          if (err?.error?.error) {
            // Si el error viene en formato {"error": "mensaje"}
            errorMessage = err.error.error;
          } else if (typeof err?.error === 'string') {
            // Si el error es un string directo
            try {
              const parsed = JSON.parse(err.error);
              errorMessage = parsed.error || errorMessage;
            } catch {
              errorMessage = err.error;
            }
          } else if (err?.message) {
            errorMessage = err.message;
          }
          this.alertService.error('Error', errorMessage);
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