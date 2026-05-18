import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { ApiErrorResponse } from '../../models/api-response.model';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private toastService = inject(ToastService);
  private router = inject(Router);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError: ApiErrorResponse = {
      statusCode: error.status,
      message: error.statusText || 'An error occurred',
      timestamp: new Date().toISOString()
    };

    // Extract message from error response if available
    if (error.error && typeof error.error === 'object') {
      if ('message' in error.error) {
        apiError.message = error.error.message;
      }
      if ('errors' in error.error) {
        apiError.errors = error.error.errors;
      }
    }

    // Handle specific status codes
    switch (error.status) {
      case 0:
        // Network error or CORS issue
        this.toastService.error('Network error. Please check your connection.');
        break;
      case 400:
        // Bad request
        this.toastService.error(apiError.message || 'Invalid request. Please check your input.');
        break;
      case 401:
        // Unauthorized - redirect to login
        this.toastService.error('Session expired. Please login again.');
        this.router.navigate(['/login']);
        break;
      case 403:
        // Forbidden
        this.toastService.error('You do not have permission to access this resource.');
        break;
      case 404:
        // Not found
        this.toastService.error('The requested resource was not found.');
        break;
      case 409:
        // Conflict
        this.toastService.error(apiError.message || 'A conflict occurred. Please try again.');
        break;
      case 422:
        // Unprocessable entity (validation errors)
        if (apiError.errors) {
          const errorMessages = Object.values(apiError.errors)
            .flat()
            .join(', ');
          this.toastService.error(errorMessages || 'Validation failed. Please check your input.');
        } else {
          this.toastService.error(apiError.message || 'Validation failed.');
        }
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        this.toastService.error('Server error. Please try again later.');
        break;
      default:
        // Generic error
        this.toastService.error(apiError.message || 'An unexpected error occurred.');
    }

    console.error('HTTP Error:', apiError);
    return throwError(() => new Error(apiError.message));
  }
}
