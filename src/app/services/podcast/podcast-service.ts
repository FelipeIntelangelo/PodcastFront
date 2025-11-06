import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { ErrorHandlerService } from '../error/error-handler.service';
import { PodcastSearchDTO } from '../../models/podcast/podcast-search-dto';

@Injectable({
  providedIn: 'root'
})
export class PodcastService {
  private readonly API_URL = "/api/podcasts";
  private readonly AUTH_API_URL = "/api/auth";

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getAll(): Observable<PodcastSearchDTO[]> {
    return this.http.get<PodcastSearchDTO[]>(this.API_URL).pipe(
      catchError(this.errorHandler.handleError.bind(this.errorHandler))
    );
  }
}
