import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { ErrorHandlerService } from '../error/error-handler.service';
import { EpisodeDTO } from '../../models/episode/episode-dto';
import { Episode } from '../../models/episode/episode';

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {
  private readonly API_URL = "/api/episodes";

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getAll(title?: string, podcastId?: number): Observable<EpisodeDTO[]> {
    const params = new URLSearchParams();
    
    if (title) params.append('title', title);
    if (podcastId) params.append('podcastId', podcastId.toString());
    
    const queryString = params.toString();
    const url = queryString ? `${this.API_URL}?${queryString}` : this.API_URL;
    
    return this.http.get<EpisodeDTO[]>(url).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  getById(episodeId: number): Observable<Episode> {
    return this.http.get<Episode>(`${this.API_URL}/${episodeId}`).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }

  // Métodos se irán agregando según las necesidades de la API
}
