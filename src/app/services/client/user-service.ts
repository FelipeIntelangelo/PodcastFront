import { Injectable } from '@angular/core';
import { UserRegisterDTO } from '../../models/user/userRegister/user-register-dto';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { User } from '../../models/user/user';
import { UserLoginDTO } from '../../models/user/userLogin/user-login-dto';
import { UserSearchDTO } from '../../models/user/userSearchDTO';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = "/api/users";
  private readonly AUTH_API_URL = "/api/auth";

  constructor(private http: HttpClient) {}

  /* -------------------- Login, Register & Profile LOGIC -------------------- */
  getUsersDTO(){
    return this.http.get<UserSearchDTO[]>(this.API_URL).pipe(
      catchError(this.handleError))
  }

  getUserById(id: number): Observable<User | UserSearchDTO> {
    return this.http.get<User | UserSearchDTO>(`${this.API_URL}/${id}`).pipe(
    catchError(this.handleError)
  );
}
  
  login(credentials: UserLoginDTO): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.AUTH_API_URL}/login`, credentials).pipe(
      catchError(this.handleError)
    );
  }
  
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/myProfile`).pipe(
      catchError(this.handleError)
    );
  }

  updateCurrentUserProfile(user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/myProfile`, user).pipe(
      catchError(this.handleError)
    );
  }

  deleteCurrentUser(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/myProfile`, { responseType: 'text' as 'json' }).pipe(
      catchError(this.handleError)
    );
  }

  // If your backend returns plain text (e.g. "Usuario registrado correctamente")
  // use responseType: 'text' so HttpClient doesn't try to parse JSON.
  // Preferably the backend should return JSON with Content-Type: application/json.
  registerUser(user: UserRegisterDTO): Observable<string> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${this.API_URL}/register`, user, { headers, responseType: 'text' })
      .pipe(
        catchError((error) => {
          // Log detallado del error
          console.error('Error detallado:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            url: error.url
          });
          return this.handleError(error);
        })
      );
  }
  /* -------------------- END OF LOGIN AND REGISTER LOGIC -------------------- */
  // Gpt hizo este handle error para todos los errores que ocurran en los metodos http del service de user, quizas podramos implementar un handler singleton o generico como hicimos en la api
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    console.log('Handling error:', error);
    console.log('Error status:', error.status);
    console.log('Error error:', error.error);

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Check if it's a successful response with an empty body (common for DELETE)
      if (error.status === 200 && (error.error === null || (typeof error.error === 'string' && error.error.length === 0))) {
        console.log('Successful response with empty body, not treating as error.');
        return new Observable<never>(); // Return an empty observable to complete the stream
      }
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.error?.message || error.error || 'Error del servidor'}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
