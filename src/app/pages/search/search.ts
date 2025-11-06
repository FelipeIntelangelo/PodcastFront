import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/client/user-service';
import { UserSearchDTO } from '../../models/user/userSearchDTO';
import { PodcastService } from '../../services/podcast/podcast-service';
import { PodcastSearchDTO } from '../../models/podcast/podcast-search-dto';

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
  filteredPodcasts: PodcastSearchDTO[] = [];
  isOrderedByViews: boolean = false; // Estado del ordenamiento
  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute, 
    private userService: UserService,
    private podcastService: PodcastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.route.paramMap.subscribe(params => {
        this.term = (params.get('term') ?? '').trim();
        const query = this.term.toLowerCase();

        if (!query) {
          this.filteredUsers = [];
          this.filteredPodcasts = [];
          this.isLoading = false;
          this.error = null;
          return;
        }

        this.isLoading = true;
        this.error = null;

        // Buscar usuarios y podcasts
        this.loadUsers();
        this.loadPodcasts();
      })
    );
  }

  private loadUsers(): void {
    this.userService.getUsersDTO().subscribe({
      next: (allUsers) => {
        this.users = allUsers;
        const q = this.term.toLowerCase();
        this.filteredUsers = allUsers.filter(u => (u.nickname ?? '').toLowerCase().includes(q));
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Error al cargar usuarios';
        this.filteredUsers = [];
        this.isLoading = false;
      }
    });
  }

  private loadPodcasts(): void {
    this.podcastService.getAllFiltered(this.term, undefined, undefined, this.isOrderedByViews).subscribe({
      next: (apiPodcasts) => {
        this.filteredPodcasts = apiPodcasts; // Ya vienen filtrados de la API
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Error al cargar podcasts';
        this.filteredPodcasts = [];
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  navigateToProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
  }

  navigateToPodcast(podcastId: number): void {
    this.router.navigate(['/podcast', podcastId]); 
  }

  get totalResults(): number {
    return this.filteredUsers.length + this.filteredPodcasts.length;
  }

  get hasResults(): boolean {
    return this.totalResults > 0;
  }

  formatViews(views: number): string {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }

  toggleSortByViews(): void {
    this.isOrderedByViews = !this.isOrderedByViews;
    if (this.term.trim()) {
      this.isLoading = true;
      this.loadPodcasts();
    }
  }
}
