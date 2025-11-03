import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PodcastService {
  private readonly API_URL = "/api/podcasts";
  private readonly AUTH_API_URL = "/api/auth";

  constructor(private http:HttpClient){}

  

}
