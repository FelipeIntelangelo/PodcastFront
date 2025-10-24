import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { UserService } from '../../services/client/user-service';
import { UserSearchDTO } from '../../models/user/userSearchDTO';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit{
  searchQuery: string = '';
  showDropdown: boolean = false;
  searchResults: UserSearchDTO[] = []; // Resultados filtrados a mostrar
  error: string | null = null;

  constructor(private userService:UserService){}

  ngOnInit(): void {
    
  }

  onSearchFocus() {
    this.showDropdown = true;
  }

  onSearchInput(event: Event) {
    const dinamicValue = event.target as HTMLInputElement;
    this.searchQuery = dinamicValue.value;
    
    if (this.searchQuery.length > 0) {
      this.showDropdown = true;

      // Trae los usuarios y filtra en el cliente por nickname
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
    // un pequeño timeout para que sea CLICKEABLE
    setTimeout(() => {
      this.showDropdown = false;
    }, 300);
  }

  selectResult(result: any) {
    // Aca tengo que mandarlo a la pagina con un getUserByID,
    // Pasandole el ID por rutas parametricas
    console.log('Selected:', result);
    this.showDropdown = false;
  }
}
