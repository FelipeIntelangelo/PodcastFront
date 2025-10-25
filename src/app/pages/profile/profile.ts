import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/client/user-service';
import { User } from '../../models/user/user';
import { UserSearchDTO } from '../../models/user/userSearchDTO';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  user: User | UserSearchDTO | null = null;
  isLoading: boolean = true;
  error: string | null = null;
  private sub = new Subscription();

  constructor(private userService: UserService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Suscripción única con responsabilidades separadas dentro del mismo callback
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        // 1) Estado inicial de carga y errores
        this.isLoading = true;
        this.error = null;

        // 2) Lectura/parseo de parámetros
        const idParam = params.get('id');
        const id = idParam ? Number(idParam) : null;

        // 4) Decisión de fuente de datos y ejecución
        if (id !== null) {
          this.userService.getUserById(id).subscribe({
            next: (data) => this.handleLoadSuccess(data, true),
            error: (err) => this.handleLoadError('Failed to load user by id.', err)
          });
          return;
        }

        this.userService.getCurrentUserProfile().subscribe({
          next: (data) => this.handleLoadSuccess(data, false),
          error: (err) => this.handleLoadError('Failed to load user profile.', err)
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // Esto es para saber si el usuario es de tipo DTO o es el usuario completo
  isFullUser(value: User | UserSearchDTO | null): value is User {
    return !!value && 'credential' in value;
  }

  // Handlers separados para éxito y error
  private handleLoadSuccess(data: User | UserSearchDTO, shouldScroll: boolean): void {
    this.user = data;
    this.isLoading = false;
    if (shouldScroll) {
      // desplaza hacia arriba al cambiar de perfil
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private handleLoadError(message: string, err: unknown): void {
    this.error = message;
    this.isLoading = false;
    console.error(err);
  }
}