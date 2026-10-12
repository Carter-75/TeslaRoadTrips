import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface DayItinerary {
  day: number;
  title: string;
  routeSummary: string;
  miles?: number | null;
  driveTime?: string;
  elevationProfile?: string;
  overnightSpot: string;
  overnightType?: string;
  shower: string;
  foodPlan: string;
  chargingPlan: string;
  costs: number | string;
  highlights?: string[];
}

export interface TripItinerary {
  title?: string;
  summary?: string;
  totalMiles?: number;
  totalEstimatedCost?: number | string;
  climateTips?: string;
  days: DayItinerary[];
}

export interface Trip {
  _id?: string;
  prompt: string;
  itinerary: TripItinerary;
  createdAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  type?: 'conversation' | 'itinerary';
  quickReplies?: string[];
  itinerary?: TripItinerary;
  timestamp?: string;
}

export interface ChatResponse {
  type: 'conversation' | 'itinerary';
  message: string;
  quickReplies?: string[];
  itinerary?: TripItinerary;
  savedTripId?: string;
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

  private get apiUrl(): string {
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

  // --- Conversational Tesla Camp Planner ---
  chatPlan(prompt: string, history: Array<{ role: string; content: string }>): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/plan`, { prompt, history });
  }

  generatePlan(prompt: string): Observable<Trip> {
    return this.http.post<Trip>(`${this.apiUrl}/plan`, { prompt });
  }

  getHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
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
