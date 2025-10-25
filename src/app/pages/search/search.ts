import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/client/user-service';
import { UserSearchDTO } from '../../models/user/userSearchDTO';

@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search implements OnInit, OnDestroy {
  term: string = '';
  isLoading = false;
  error: string | null = null;
  users: UserSearchDTO[] = [];
  filteredUsers: UserSearchDTO[] = [];
  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute, 
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(params => {
        this.term = (params.get('term') ?? '').trim();
        const q = this.term.toLowerCase();

        if (!q) {
          this.filteredUsers = [];
          this.isLoading = false;
          this.error = null;
          return;
        }

        this.isLoading = true;
        this.error = null;

        this.userService.getUsersDTO().subscribe({
          next: (allUsers) => {
            this.users = allUsers;
            this.filteredUsers = allUsers.filter(u => (u.nickname ?? '').toLowerCase().includes(q));
            this.isLoading = false;
          },
          error: (err) => {
            this.error = err?.message || 'Error al cargar usuarios';
            this.filteredUsers = [];
            this.isLoading = false;
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  navigateToProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
  }
}
