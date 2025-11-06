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
  podcasts: PodcastSearchDTO[] = [];
  filteredPodcasts: PodcastSearchDTO[] = [];
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
        const q = this.term.toLowerCase();

        if (!q) {
          this.filteredUsers = [];
          this.filteredPodcasts = [];
          this.isLoading = false;
          this.error = null;
          return;
        }

        this.isLoading = true;
        this.error = null;

        // Buscar usuarios
        this.userService.getUsersDTO().subscribe({
          next: (allUsers) => {
            this.users = allUsers;
            this.filteredUsers = allUsers.filter(u => (u.nickname ?? '').toLowerCase().includes(q));
            this.checkLoadingComplete();
          },
          error: (err) => {
            this.error = err?.message || 'Error al cargar usuarios';
            this.filteredUsers = [];
            this.checkLoadingComplete();
          }
        });

        // Buscar podcasts
        this.podcastService.getAll().subscribe({
          next: (allPodcasts) => {
            this.podcasts = allPodcasts;
            // Filtrar por título y ordenar por averageViews (mayor a menor)
            this.filteredPodcasts = allPodcasts
              .filter(p => (p.title ?? '').toLowerCase().includes(q))
              .sort((a, b) => b.averageViews - a.averageViews);
            this.checkLoadingComplete();
          },
          error: (err) => {
            this.error = err?.message || 'Error al cargar podcasts';
            this.filteredPodcasts = [];
            this.checkLoadingComplete();
          }
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private checkLoadingComplete(): void {
    // Se considera que la carga completa cuando ambas peticiones han terminado
    // (exitosa o con error)
    this.isLoading = false;
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
}
