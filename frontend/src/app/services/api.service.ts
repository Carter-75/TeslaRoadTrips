import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface DayItinerary {
  day: number;
  title: string;
  routeSummary: string;
  overnightSpot: string;
  shower: string;
  foodPlan: string;
  chargingPlan: string;
  costs: number | string;
}

export interface TripItinerary {
  summary?: string;
  climateTips?: string;
  totalEstimatedCost?: number | string;
  days: DayItinerary[];
}

export interface Trip {
  _id?: string;
  prompt: string;
  itinerary: TripItinerary;
  createdAt?: string;
}

export interface Spot {
  _id?: string;
  name: string;
  state: string;
  city: string;
  lat: number;
  lng: number;
  notes?: string;
  verificationLevel: 'verified' | 'unverified' | 'pending';
  source?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  public currentUser = signal<any>(null);

  // Dynamic API URL mapping
  private get apiUrl(): string {
    const isProd = ('false' as string) === 'true';
    if (isProd) {
      return '/api';
    }
    return '/api';
  }

  getData<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`);
  }

  postData<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  // --- Auth Compatibility Methods ---
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  checkStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/user`).pipe(
      tap({
        next: user => this.currentUser.set(user),
        error: () => this.currentUser.set(null)
      })
    );
  }

  logout(): Observable<any> {
    localStorage.removeItem('auth_token');
    this.currentUser.set(null);
    return this.http.get<any>(`${this.apiUrl}/auth/logout`);
  }

  // --- Tesla Camp Planner Endpoints ---
  getHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }

  generatePlan(prompt: string): Observable<Trip> {
    return this.http.post<Trip>(`${this.apiUrl}/plan`, { prompt });
  }

  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/trips`);
  }

  getTrip(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/trips/${id}`);
  }

  saveTrip(payload: { prompt: string; itinerary: TripItinerary }): Observable<Trip> {
    return this.http.post<Trip>(`${this.apiUrl}/trips`, payload);
  }

  deleteTrip(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/trips/${id}`);
  }

  getSpots(state?: string, q?: string): Observable<Spot[]> {
    let params = new HttpParams();
    if (state && state.trim()) {
      params = params.set('state', state.trim().toUpperCase());
    }
    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }
    return this.http.get<Spot[]>(`${this.apiUrl}/spots`, { params });
  }

  submitSpot(spot: Partial<Spot>): Observable<Spot> {
    return this.http.post<Spot>(`${this.apiUrl}/spots`, spot);
  }

  reportSpot(id: string, report: { type: 'problem' | 'praise'; note: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/spots/${id}/report`, report);
  }
}
