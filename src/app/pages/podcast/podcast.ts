import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PodcastService } from '../../services/podcast/podcast-service';
import { Podcast as PodcastModel } from '../../models/podcast/podcast';
import { UserService } from '../../services/client/user-service';
import { AlertService } from '../../services/ui/alert.service';
import { User } from '../../models/user/user';

@Component({
  selector: 'app-podcast',
  imports: [],
  templateUrl: './podcast.html',
  styleUrl: './podcast.css'
})
export class Podcast implements OnInit{
  podcast?: PodcastModel;
  isLoading = true;
  podcastId?: number;
  isFavorited = false; // estado local temporal hasta integrar backend
  currentUser?: User;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private podcastService: PodcastService,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.route.params.subscribe(params => {
      this.podcastId = +params['id']; // El + convierte string a number
      if (this.podcastId) {
        this.loadPodcast(this.podcastId);
      }
    });
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isAdmin = user.credential.roles.includes('ADMIN');
      },
      error: () => {
        this.currentUser = undefined;
        this.isAdmin = false;
      }
    });
  }

  loadPodcast(id: number): void {
    this.isLoading = true;
    this.podcastService.getPodcastById(id).subscribe({
      next: (podcast) => {
        this.podcast = podcast;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading podcast:', error);
        this.isLoading = false;
      }
    });
  }

  getTotalViews(): number {
    if (!this.podcast?.episodes) return 0;
    return this.podcast.episodes.reduce((total, episode) => total + (episode.views || 0), 0);
  }

  formatViews(value: number): string {
    try {
      // Compact notation like 1.2K, 3.4M
      return new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    } catch {
      // Fallback simple formatter
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1) + 'B';
      if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M';
      if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + 'K';
      return String(value);
    }
  }

  getUserInitial(): string {
    const name = this.podcast?.user?.nickname || this.podcast?.user?.name || '';
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  toggleFavorite(): void {
    this.isFavorited = !this.isFavorited;
    // TODO: integrar con servicio (POST /api/podcasts/{id}/favorite o similar)
  }

  canDeletePodcast(): boolean {
    if (!this.podcast || !this.currentUser) return false;
    return this.isAdmin || this.podcast.user.id === this.currentUser.id;
  }

  async deletePodcast(): Promise<void> {
    if (!this.podcastId) return;
    
    const confirmed = await this.alertService.confirmDeletePodcast();
    if (confirmed) {
      this.podcastService.deletePodcast(this.podcastId).subscribe({
        next: () => {
          this.alertService.deletePodcastSuccess();
          this.router.navigate(['/']);
        },
        error: () => {
          this.alertService.deletePodcastError();
        }
      });
    }
  }
}
