import { Component, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaPlayerService } from '../../../services/media-player/media-player.service';

@Component({
  selector: 'app-floating-media-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-media-player.html',
  styleUrl: './floating-media-player.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FloatingMediaPlayerComponent {
  playerState;
  hasEpisode;
  cachedEmbedUrl: SafeResourceUrl | null = null;
  cachedEpisodeId: number | null = null;

  constructor(
    private mediaPlayerService: MediaPlayerService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.playerState = this.mediaPlayerService.playerState;
    this.hasEpisode = computed(() => this.playerState().episode !== null);
  }

  closePlayer() {
    this.mediaPlayerService.closePlayer();
    this.cachedEmbedUrl = null;
    this.cachedEpisodeId = null;
  }

  toggleMinimize() {
    this.mediaPlayerService.toggleMinimize();
  }

  goToEpisode() {
    const episode = this.playerState().episode;
    if (episode) {
      this.router.navigate(['/episode', episode.id]);
    }
  }

  isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  isCloudinaryVideo(url: string): boolean {
    return url.includes('cloudinary.com') && (url.includes('/video/') || url.includes('.mp4') || url.includes('.webm'));
  }

  isCloudinaryAudio(url: string): boolean {
    return url.includes('cloudinary.com') && (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a'));
  }

  getYouTubeEmbedUrl(url: string): SafeResourceUrl {
    const episode = this.playerState().episode;
    const state = this.playerState();
    
    if (episode && this.cachedEpisodeId === episode.id && this.cachedEmbedUrl) {
      return this.cachedEmbedUrl;
    }

    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    // Agregar startTime y autoplay
    const startParam = state.startTime > 0 ? `&start=${Math.floor(state.startTime)}` : '';
    const autoplayParam = state.autoplay ? '&autoplay=1' : '';
    
    this.cachedEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${videoId}?enablejsapi=1${startParam}${autoplayParam}`
    );
    this.cachedEpisodeId = episode?.id || null;
    return this.cachedEmbedUrl;
  }
}
