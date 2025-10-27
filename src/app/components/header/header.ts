import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { UserService } from '../../services/client/user-service';
import { UserSearchDTO } from '../../models/user/userSearchDTO';
import { User } from '../../models/user/user';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit{
  searchQuery: string = '';
  showDropdown: boolean = false;
  searchResults: UserSearchDTO[] = []; // Resultados filtrados a mostrar
  error: string | null = null;
  isLoggedIn: boolean = false;
  user: User | null = null;
  showProfileMenu: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.authService.getIsLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.userService.getCurrentUserProfile().subscribe({
          next: (user) => {
            this.user = user;
          },
          error: (err) => {
            this.error = err.message;
            this.authService.logout(); // For security reasons, if the profile cannot be loaded, log out
          },
        });
      } else {
        this.user = null;
      }
    });
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showProfileMenu = false;
    }
  }

  logout(): void {
    this.showProfileMenu = false; // Close the menu on logout
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onSearchFocus() {
    this.showDropdown = true;
  }

  onSearchInput(event: Event) {
    const dinamicValue = event.target as HTMLInputElement;
    this.searchQuery = dinamicValue.value;
    
    if (this.searchQuery.length > 0) {
      this.showDropdown = true;

      // Trae los usuarios y filtra el cliente por nickname
      this.userService.getUsersDTO().subscribe({
        next: (users) => {
          const queryClean = this.searchQuery.trim().toLowerCase();
          this.searchResults = users.filter(u => 
        u.nickname.toLowerCase().includes(queryClean)
          );
        },
        error: (err) => {
          this.error = err?.message || 'Error al buscar usuarios';
          this.searchResults = [];
        }
      });

    } else {
      this.searchResults = [];
    }
  }

  onSearchBlur() {
    this.showDropdown = false;
  }

  selectResult(result: any) {
    // navegar al perfil publico(DTO) del usuario usando rutas paramétricas
    if (result && result.id) {
      this.router.navigate(['/profile', result.id]);
    }
    this.showDropdown = false;
  }

  onSearchButton(){
    const term = this.searchQuery.trim();
    if (term) {
      this.showDropdown = false;
      this.router.navigate(['/search', term]);
    }
  }
}

