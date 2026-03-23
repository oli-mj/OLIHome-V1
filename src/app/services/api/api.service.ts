import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private async getHeaders(): Promise<HttpHeaders> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const { value: token } = await Preferences.get({ key: 'authToken' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  async get<T>(endpoint: string, params?: HttpParams): Promise<Observable<T>> {
    const headers = await this.getHeaders();
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  async post<T>(endpoint: string, data: any): Promise<Observable<T>> {
    const headers = await this.getHeaders();
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  async put<T>(endpoint: string, data: any): Promise<Observable<T>> {
    const headers = await this.getHeaders();
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  async delete<T>(endpoint: string): Promise<Observable<T>> {
    const headers = await this.getHeaders();
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    // You can customize error handling/messaging here
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}
