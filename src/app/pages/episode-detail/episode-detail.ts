import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EpisodeService } from '../../services/episode/episode.service';
import { Episode } from '../../models/episode/episode';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-episode-detail',
  imports: [DatePipe],
  templateUrl: './episode-detail.html',
  styleUrl: './episode-detail.css'
})
export class EpisodeDetail implements OnInit {
  episode?: Episode;
  isLoading = true;
  episodeId?: number;

  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.episodeId = +params['id'];
      if (this.episodeId) {
        this.loadEpisode(this.episodeId);
      }
    });
  }

  loadEpisode(id: number): void {
    this.isLoading = true;
    this.episodeService.getById(id).subscribe({
      next: (episode) => {
        this.episode = episode;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading episode:', error);
        this.isLoading = false;
      }
    });
  }

  formatViews(value: number): string {
    try {
      return new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    } catch {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1) + 'B';
      if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M';
      if (abs >= 1_000) return sign + (abs / 1_000).toFixed(1) + 'K';
      return String(value);
    }
  }
}
