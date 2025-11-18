import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PodcastService } from '../../services/podcast/podcast-service';
import { UserService } from '../../services/client/user-service';
import { EpisodeService } from '../../services/episode/episode.service';
import { Podcast } from '../../models/podcast/podcast';
import { User } from '../../models/user/user';
import { EpisodeCreatePayload } from '../../models/episode/episode-create-dto';
import { CloudinaryUploadComponent } from '../../components/shared/cloudinary-upload/cloudinary-upload';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-episode',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CloudinaryUploadComponent],
  templateUrl: './add-episode.html',
  styleUrl: './add-episode.css'
})
export class AddEpisodePage implements OnInit {
  podcast: Podcast | null = null;
  currentUser: User | null = null;
  isAuthorized = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  form!: FormGroup;

  @ViewChild('mediaUp') mediaUp?: CloudinaryUploadComponent;
  @ViewChild('imageUp') imageUp?: CloudinaryUploadComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private podcastService: PodcastService,
    private userService: UserService,
    private episodeService: EpisodeService
  ) {}

  ngOnInit(): void {
    const podcastId = Number(this.route.snapshot.paramMap.get('id'));
    if (!podcastId) {
      this.router.navigate(['/']);
      return;
    }

    this.initForm(podcastId);

    this.podcastService.getPodcastById(podcastId).subscribe({
      next: (podcast) => {
        this.podcast = podcast;
        this.checkAuthorization();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el podcast.';
      }
    });

    this.userService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.currentUser = user as User;
        this.checkAuthorization();
      },
      error: () => {
        // Usuario no logueado o error
        this.currentUser = null;
        this.checkAuthorization();
      }
    });
  }

  private initForm(podcastId: number) {
    this.form = this.fb.group({
      podcastId: [podcastId, Validators.required],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      season: [1, [Validators.required, Validators.min(1)]],
      chapter: [1, [Validators.required, Validators.min(1)]],
      imageUrl: [''],
      audioPath: ['', Validators.required],
      durationHours: [0, [Validators.min(0)]],
      durationMinutes: [0, [Validators.min(0), Validators.max(59)]],
      durationSeconds: [0, [Validators.min(0), Validators.max(59)]]
    });
  }

  private checkAuthorization() {
    if (!this.podcast) return;

    const isOwner = !!this.currentUser && this.podcast.user?.id === this.currentUser.id;
    const isAdmin = !!this.currentUser?.credential?.roles?.includes('ADMIN');
    this.isAuthorized = isOwner || isAdmin;

    // Si está autorizado, limpiamos cualquier mensaje previo; si no, mostramos el error.
    if (this.isAuthorized) {
      this.errorMessage = null;
    } else {
      this.errorMessage = 'No tenés permisos para agregar episodios a este podcast.';
    }
  }

  onImageUploaded(url: string) {
    this.form.patchValue({ imageUrl: url });
  }

  onAudioUploaded(url: string) {
    this.form.patchValue({ audioPath: url });
  }

  onUploadError(message: string) {
    this.errorMessage = message;
  }

  isVideo(url?: string): boolean {
    if (!url) return false;
    const u = url.toLowerCase();
    if (u.includes('/video/upload')) return true;
    if (u.includes('/audio/upload')) return false;
    return /\.(mp4|webm|ogg|mov|mkv)$/.test(u);
  }

  getFileName(url?: string): string {
    if (!url) return '';
    try {
      const parsed = new URL(url);
      const last = parsed.pathname.split('/').pop() || '';
      return decodeURIComponent(last);
    } catch {
      const parts = url.split('/');
      return decodeURIComponent(parts[parts.length - 1] || '');
    }
  }

  clearAudio(): void {
    this.form.patchValue({ audioPath: '' });
  }

  async submit() {
    if (!this.isAuthorized) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    // Subir medios en modo diferido
    try {
      if (this.mediaUp && this.mediaUp.hasFileSelected()) {
        const mediaUrl = await this.mediaUp.performUpload();
        this.form.patchValue({ audioPath: mediaUrl });
      } else if (!this.form.value.audioPath) {
        this.isSubmitting = false;
        this.errorMessage = 'Debés seleccionar un archivo de audio/video.';
        return;
      }

      if (this.imageUp && this.imageUp.hasFileSelected()) {
        const imgUrl = await this.imageUp.performUpload();
        this.form.patchValue({ imageUrl: imgUrl });
      }
    } catch (e: any) {
      this.isSubmitting = false;
      this.errorMessage = e?.message || 'Error subiendo los archivos.';
      return;
    }

    const h = Number(this.form.value.durationHours || 0);
    const m = Number(this.form.value.durationMinutes || 0);
    const s = Number(this.form.value.durationSeconds || 0);
    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) {
      this.isSubmitting = false;
      this.errorMessage = 'La duración debe ser mayor a 0 segundos';
      return;
    }

    const durationIso = `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}${s ? s + 'S' : ''}`;
    const payload: EpisodeCreatePayload = {
      title: this.form.value.title,
      description: this.form.value.description,
      imageUrl: this.form.value.imageUrl || undefined,
      audioPath: this.form.value.audioPath,
      season: Number(this.form.value.season),
      chapter: Number(this.form.value.chapter),
      duration: durationIso,
      podcast: { id: Number(this.form.value.podcastId) }
    };

    this.episodeService.createEpisode(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/podcast', this.podcast!.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.message || 'No se pudo crear el episodio.';
      }
    });
  }
}
