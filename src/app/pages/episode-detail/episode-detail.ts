import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EpisodeService } from '../../services/episode/episode.service';
import { Episode } from '../../models/episode/episode';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaPlayerService } from '../../services/media-player/media-player.service';

@Component({
  selector: 'app-episode-detail',
  imports: [DatePipe],
  templateUrl: './episode-detail.html',
  styleUrl: './episode-detail.css'
})
export class EpisodeDetail implements OnInit, OnDestroy {
  episode?: Episode;
  isLoading = true;
  episodeId?: number;
  cachedYouTubeUrl: SafeResourceUrl | null = null;
  cachedEpisodeId: number | null = null;
  hideInlinePlayer = false;
  
  // Contador de tiempo manual
  playbackStartTime: number | null = null;
  timerInterval: any = null;
  estimatedPlaybackTime = 0;

  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService,
    private sanitizer: DomSanitizer,
    private mediaPlayerService: MediaPlayerService
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
    // Limpiar timer anterior
    this.stopTimer();
    this.episodeService.getById(id).subscribe({
      next: (episode) => {
        this.episode = episode;
        this.isLoading = false;
        this.hideInlinePlayer = false;
        // Limpiar cache cuando cambia de episodio
        this.cachedYouTubeUrl = null;
        this.cachedEpisodeId = null;
        this.estimatedPlaybackTime = 0;
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

  isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    // Si ya tenemos el URL cacheado para este episodio, devolverlo
    if (this.episode && this.cachedEpisodeId === this.episode.id && this.cachedYouTubeUrl) {
      return this.cachedYouTubeUrl;
    }

    let videoId = '';
    
    // Formato: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    }
    // Formato: https://youtu.be/VIDEO_ID
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    this.cachedYouTubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    this.cachedEpisodeId = this.episode?.id || null;
    return this.cachedYouTubeUrl;
  }

  onIframeLoad(): void {
    // Cuando el iframe carga, asumimos que el usuario va a reproducir
    // Iniciamos el contador después de 2 segundos (tiempo estimado de autoplay)
    setTimeout(() => {
      this.startTimer();
    }, 2000);
  }

  startTimer(): void {
    if (this.timerInterval) return; // Ya está corriendo
    
    this.playbackStartTime = Date.now();
    this.timerInterval = setInterval(() => {
      if (this.playbackStartTime) {
        this.estimatedPlaybackTime = Math.floor((Date.now() - this.playbackStartTime) / 1000);
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  playInFloatingPlayer(): void {
    if (this.episode) {
      // Detener el timer y usar el tiempo acumulado
      this.stopTimer();
      this.hideInlinePlayer = true;
      // Pasar el tiempo estimado acumulado
      this.mediaPlayerService.openPlayer(this.episode, this.estimatedPlaybackTime, true);
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
