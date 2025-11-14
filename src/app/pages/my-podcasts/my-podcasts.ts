import { Component, OnInit } from '@angular/core';
import { PodcastService } from '../../services/podcast/podcast-service';
import { PodcastTotalDTO } from '../../models/podcast/podcast-total-dto';
import { AlertService } from '../../services/ui/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-podcasts',
  imports: [],
  templateUrl: './my-podcasts.html',
  styleUrl: './my-podcasts.css'
})
export class MyPodcasts implements OnInit {
  myPodcasts: PodcastTotalDTO[] = [];
  isLoading = true;

  constructor(
    private podcastService: PodcastService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyPodcasts();
  }

  loadMyPodcasts(): void {
    this.isLoading = true;
    this.podcastService.getMyPodcasts().subscribe({
      next: (podcasts) => {
        this.myPodcasts = podcasts;
        this.isLoading = false;
        console.log(podcasts)
      },
      error: (error) => {
        console.error('Error loading my podcasts:', error);
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

  viewPodcast(id: number): void {
    this.router.navigate(['/podcast', id]);
  }

  editPodcast(id: number): void {
    // TODO: Navegar a página de edición o abrir modal
    console.log('Edit podcast:', id);
  }

  async deletePodcast(id: number): Promise<void> {
    const confirmed = await this.alertService.confirmDeletePodcast();
    if (confirmed) {
      this.podcastService.deletePodcast(id).subscribe({
        next: () => {
          this.alertService.deletePodcastSuccess();
          this.loadMyPodcasts();
        },
        error: () => {
          this.alertService.deletePodcastError();
        }
      });
    }
  }
}
