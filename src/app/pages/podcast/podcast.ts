import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PodcastService } from '../../services/podcast/podcast-service';
import { Podcast as PodcastModel } from '../../models/podcast/podcast';

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

  constructor(
    private route: ActivatedRoute,
    private podcastService: PodcastService
  ){}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.podcastId = +params['id']; // El + convierte string a number
      if (this.podcastId) {
        this.loadPodcast(this.podcastId);
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
}
