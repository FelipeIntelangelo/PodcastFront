import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EpisodeService } from '../../services/episode/episode.service';
import { CommentaryService } from '../../services/commentary/commentary.service';
import { Episode } from '../../models/episode/episode';
import { CommentaryDTO } from '../../models/commentary/commentary-dto';
import { CommentaryCreateDTO } from '../../models/commentary/commentary-create-dto';
import { EpisodeHistoryDTO } from '../../models/episode/episode-history-dto';
import { DatePipe, CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaPlayerService } from '../../services/media-player/media-player.service';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/client/user-service';
import { AlertService } from '../../services/ui/alert.service';
import { User } from '../../models/user/user';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-episode-detail',
  imports: [DatePipe, RouterLink, CommonModule, FormsModule],
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
  currentUser?: User;
  isAdmin = false;
  // Descripción expandida
  isDescriptionExpanded = false;
  // Comentarios
  commentaries: CommentaryDTO[] = [];
  isLoadingCommentaries = false;
  commentariesError: string | null = null;
  pageSize = 10;
  currentPage = 1;
  // Nuevo comentario
  newCommentContent = '';
  isSubmittingComment = false;
  // Historial del usuario
  isInHistory = false;
  isLoadingHistory = false;

  
  constructor(
    private route: ActivatedRoute,
    private episodeService: EpisodeService,
    private commentaryService: CommentaryService,
    private sanitizer: DomSanitizer,
    private mediaPlayerService: MediaPlayerService,
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.authService.getIsLoggedIn().subscribe(loggedIn => {
      this.isUserLoggedIn = loggedIn;
      if (loggedIn) {
        this.loadUserHistory();
      }
    });
    
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
    
    this.route.params.subscribe(params => {
      this.episodeId = +params['id'];
      if (this.episodeId) {
        this.loadEpisode(this.episodeId);
      }
    });
  }
  
  get totalPages(): number {
    return Math.ceil(this.commentaries.length / this.pageSize) || 1;
  }

  get paginatedCommentaries(): CommentaryDTO[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.commentaries.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
          this.loadCommentaries(episode.id);
        
        // Verificar si este episodio está reproduciéndose en el flotante
        const playerState = this.mediaPlayerService.playerState();
        if (playerState.isOpen && playerState.episode?.id === episode.id) {
          // El episodio está en el flotante, mostrar mensaje
          this.hideInlinePlayer = true;
          this.showIframe = false;
          this.viewCounted = playerState.viewCounted;
        } else {
          // Episodio no está en el flotante, resetear estado
          this.hideInlinePlayer = false;
          this.showIframe = false;
          this.viewCounted = false;
        }
        
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

  loadCommentaries(episodeId: number): void {
    this.isLoadingCommentaries = true;
    this.commentariesError = null;
    this.commentaryService.getByEpisode(episodeId).subscribe({
      next: (data) => {
        this.commentaries = data;
        this.isLoadingCommentaries = false;
        this.currentPage = 1;
      },
      error: (err) => {
        console.error('Error loading commentaries:', err);
        this.commentariesError = err.message || 'No se pudieron cargar los comentarios';
        this.isLoadingCommentaries = false;
      }
    });
  }

  loadUserHistory(): void {
    this.isLoadingHistory = true;
    this.userService.getMyHistory().subscribe({
      next: (history: EpisodeHistoryDTO[]) => {
        this.isLoadingHistory = false;
        // Verificar si el episodio actual está en el historial
        if (this.episodeId) {
          this.isInHistory = history.some(h => h.episode.id === this.episodeId);
        }
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.isLoadingHistory = false;
        this.isInHistory = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
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

  isCloudinaryVideo(url: string): boolean {
    return url.includes('cloudinary.com') && (url.includes('/video/') || url.includes('.mp4') || url.includes('.webm'));
  }

  isCloudinaryAudio(url: string): boolean {
    return url.includes('cloudinary.com') && (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a'));
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
            // Recargar el historial para actualizar isInHistory
            if (this.isUserLoggedIn) {
              this.loadUserHistory();
            }
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

  canDeleteEpisode(): boolean {
    if (!this.currentUser || !this.episode) return false;
    const isOwner = this.episode.podcast?.user?.id === this.currentUser.id;
    return isOwner || this.isAdmin;
  }

  deleteEpisode(): void {
    if (!this.episode || !this.canDeleteEpisode()) return;

    this.alertService.confirm(
      '¿Eliminar episodio?',
      `¿Estás seguro de eliminar "${this.episode.title}"? Esta acción no se puede deshacer.`
    ).then((confirmed) => {
      if (confirmed && this.episode) {
        const podcastId = this.episode.podcast.id;
        this.episodeService.deleteEpisode(this.episode.id).subscribe({
          next: () => {
            this.alertService.success('Episodio eliminado', 'El episodio fue eliminado correctamente.');
            this.router.navigate(['/podcast', podcastId]);
          },
          error: (err) => {
            this.alertService.error('Error', err.message || 'No se pudo eliminar el episodio.');
          }
        });
      }
    });
  }

  toggleDescription(): void {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  canComment(): boolean {
    return this.isUserLoggedIn && this.isInHistory;
  }

  submitComment(): void {
    if (!this.episode || !this.canComment() || !this.newCommentContent.trim()) {
      return;
    }

    if (this.newCommentContent.trim().length > 1000) {
      this.alertService.error('Comentario muy largo', 'El comentario no puede exceder los 1000 caracteres.');
      return;
    }

    this.isSubmittingComment = true;
    const commentDto: CommentaryCreateDTO = {
      commentary: this.newCommentContent.trim()
    };

    this.commentaryService.createCommentary(this.episode.id, commentDto).subscribe({
      next: () => {
        // Recargar los comentarios desde el servidor
        this.loadCommentaries(this.episode!.id);
        this.newCommentContent = '';
        this.isSubmittingComment = false;
        this.alertService.success('¡Comentario publicado!', 'Tu comentario se ha agregado correctamente.');
      },
      error: (err) => {
        this.isSubmittingComment = false;
        this.alertService.error('Error', err.message || 'No se pudo publicar el comentario.');
      }
    });
  }
}
