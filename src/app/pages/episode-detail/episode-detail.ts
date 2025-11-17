import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EpisodeService } from '../../services/episode/episode.service';
import { Episode } from '../../models/episode/episode';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaPlayerService } from '../../services/media-player/media-player.service';
import { AuthService } from '../../services/auth/auth.service';

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
  showIframe = false;
  
  // Contador de tiempo manual
  playbackStartTime: number | null = null;
  timerInterval: any = null;
  estimatedPlaybackTime = 0;
  
  // Contador de views
  viewTimerInterval: any = null;
  viewCounted = false;
  isUserLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService,
    private sanitizer: DomSanitizer,
    private mediaPlayerService: MediaPlayerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getIsLoggedIn().subscribe(loggedIn => {
      this.isUserLoggedIn = loggedIn;
    });
    
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
    this.stopViewTimer();
    this.episodeService.getById(id).subscribe({
      next: (episode) => {
        this.episode = episode;
        this.isLoading = false;
        this.hideInlinePlayer = false;
        this.showIframe = false;
        // Limpiar cache cuando cambia de episodio
        this.cachedYouTubeUrl = null;
        this.cachedEpisodeId = null;
        this.estimatedPlaybackTime = 0;
        this.viewCounted = false;
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
    
    // Agregar autoplay=1 para que se reproduzca automáticamente
    this.cachedYouTubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
    this.cachedEpisodeId = this.episode?.id || null;
    return this.cachedYouTubeUrl;
  }

  startInlinePlayback(): void {
    this.showIframe = true;
    // Iniciar contador de views solo si el usuario está logeado
    if (this.isUserLoggedIn) {
      this.startViewTimer();
    }
  }

  onIframeLoad(): void {
    // Cuando el iframe carga (después de presionar play), iniciamos el contador de tiempo solo si está logeado
    if (this.isUserLoggedIn) {
      setTimeout(() => {
        this.startTimer();
      }, 2000);
    }
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

  startViewTimer(): void {
    if (this.viewCounted || this.viewTimerInterval) return;
    
    this.viewTimerInterval = setTimeout(() => {
      if (this.episode && !this.viewCounted) {
        this.episodeService.incrementView(this.episode.id).subscribe({
          next: () => {
            this.viewCounted = true;
            console.log('View contabilizada para episodio:', this.episode?.id);
          },
          error: (error) => console.error('Error al contabilizar view:', error)
        });
      }
    }, 30000); // 30 segundos
  }

  stopViewTimer(): void {
    if (this.viewTimerInterval) {
      clearTimeout(this.viewTimerInterval);
      this.viewTimerInterval = null;
    }
  }

  playInFloatingPlayer(): void {
    if (this.episode) {
      // Detener el timer de tiempo
      this.stopTimer();
      this.hideInlinePlayer = true;
      
      // Abrir el reproductor flotante
      // Pasar el estado de viewCounted para evitar contar dos veces
      this.mediaPlayerService.openPlayer(this.episode, this.estimatedPlaybackTime, true, this.viewCounted);
    }
  }

  showInlinePlayer(): void {
    this.hideInlinePlayer = false;
    this.mediaPlayerService.closePlayer();
    this.estimatedPlaybackTime = 0;
    this.stopTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopViewTimer();
  }
}
