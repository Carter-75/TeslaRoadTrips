import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Trip } from '../../services/api.service';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <!-- Header -->
      <header class="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-[#101726]/90 shadow-xl flex items-center justify-between">
        <div>
          <h1 class="text-xl font-extrabold text-white flex items-center gap-2">
            <span>🎒</span>
            <span>My Saved Trips</span>
          </h1>
          <p class="text-xs text-slate-400 mt-1">Saved Tesla camping itineraries, routes, and overnight logs</p>
        </div>
        <button
          type="button"
          (click)="loadTrips()"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          title="Refresh Trips"
        >
          🔄 Refresh
        </button>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading()" class="glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-2">
        <div class="w-8 h-8 mx-auto border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <p class="text-xs text-slate-400">Loading saved journeys...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="glass-panel rounded-2xl p-4 border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs">
        {{ error() }}
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && trips().length === 0" class="glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-3">
        <span class="text-3xl">⛺</span>
        <h2 class="text-sm font-bold text-white">No Saved Trips Yet</h2>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          You have not planned any Tesla camping trips yet. Use the AI Planner to generate your first free overnight boondocking route.
        </p>
        <button
          type="button"
          (click)="navigateToPlan()"
          class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide shadow-md transition-all"
        >
          Plan a Trip Now
        </button>
      </div>

      <!-- Trips List -->
      <div *ngIf="!loading() && trips().length > 0" class="space-y-3">
        <div
          *ngFor="let trip of trips()"
          class="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800/90 cursor-pointer transition-all space-y-3 bg-[#0d1322]/70"
          (click)="openTripDetail(trip)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <h2 class="text-sm font-bold text-white line-clamp-1">{{ trip.prompt }}</h2>
              <p class="text-xs text-slate-400">
                Created: {{ formatDate(trip.createdAt) }}
              </p>
            </div>
            <button
              type="button"
              (click)="confirmDeleteTrip($event, trip)"
              class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Trip"
            >
              🗑️
            </button>
          </div>

          <!-- Trip summary snippet -->
          <p *ngIf="trip.itinerary && trip.itinerary.summary" class="text-xs text-slate-300 line-clamp-2">
            {{ trip.itinerary.summary }}
          </p>

          <!-- Badges -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="px-2.5 py-0.5 rounded-md bg-sky-500/15 text-sky-300 text-[11px] font-bold border border-sky-500/20">
              {{ trip.itinerary ? trip.itinerary.days.length : 0 }} Days
            </span>
            <span *ngIf="trip.itinerary && trip.itinerary.totalEstimatedCost" class="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/20">
              Est. Total: \${{ trip.itinerary.totalEstimatedCost }}
            </span>
            <span class="ml-auto text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              View Itinerary &rarr;
            </span>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <div
        *ngIf="selectedTrip()"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      >
        <div class="glass-panel bg-slate-900 border border-slate-700/80 w-full max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <!-- Modal Header -->
          <div class="p-4 border-b border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🗺️</span>
              <h3 class="text-sm font-bold text-white line-clamp-1">{{ selectedTrip()?.prompt }}</h3>
            </div>
            <button
              type="button"
              (click)="closeDetail()"
              class="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
            >
              ✕
            </button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-5 overflow-y-auto space-y-4 text-xs text-slate-200">
            <div *ngIf="selectedTrip()?.itinerary?.summary" class="bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed text-slate-300">
              {{ selectedTrip()?.itinerary?.summary }}
            </div>

            <div *ngIf="selectedTrip()?.itinerary?.climateTips" class="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-200">
              <strong class="font-bold">Overnight Battery Guidance:</strong>
              {{ selectedTrip()?.itinerary?.climateTips }}
            </div>

            <div class="space-y-3 pt-1">
              <h4 class="font-extrabold text-white text-xs uppercase tracking-wider">Day by Day Schedule</h4>
              <div
                *ngFor="let day of selectedTrip()?.itinerary?.days"
                class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2"
              >
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-bold">
                    Day {{ day.day }}
                  </span>
                  <span class="font-bold text-white">{{ day.title }}</span>
                  <span *ngIf="day.costs" class="text-emerald-400 font-semibold">\${{ day.costs }}</span>
                </div>

                <p *ngIf="day.routeSummary" class="text-slate-300">
                  <span class="text-slate-400">Route:</span> {{ day.routeSummary }}
                </p>

                <div class="grid grid-cols-1 gap-1.5 pt-1 text-[11px]">
                  <div class="bg-slate-900/60 p-2 rounded-lg">
                    <span class="font-bold text-slate-400">Overnight:</span> {{ day.overnightSpot }}
                  </div>
                  <div class="bg-slate-900/60 p-2 rounded-lg">
                    <span class="font-bold text-sky-400">Shower:</span> {{ day.shower }}
                  </div>
                  <div class="bg-slate-900/60 p-2 rounded-lg">
                    <span class="font-bold text-amber-400">Food:</span> {{ day.foodPlan }}
                  </div>
                  <div class="bg-slate-900/60 p-2 rounded-lg">
                    <span class="font-bold text-emerald-400">Charging:</span> {{ day.chargingPlan }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-3 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/40">
            <button
              type="button"
              (click)="closeDetail()"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyTripsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  public trips = signal<Trip[]>([]);
  public loading = signal<boolean>(true);
  public error = signal<string | null>(null);
  public selectedTrip = signal<Trip | null>(null);

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.getTrips().subscribe({
      next: (data) => {
        this.trips.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Could not load saved trips from the database.');
      }
    });
  }

  openTripDetail(trip: Trip): void {
    this.selectedTrip.set(trip);
  }

  closeDetail(): void {
    this.selectedTrip.set(null);
  }

  confirmDeleteTrip(event: Event, trip: Trip): void {
    event.stopPropagation();
    if (!trip._id) return;

    const confirmed = window.confirm(`Are you sure you want to delete this trip itinerary?`);
    if (!confirmed) return;

    this.api.deleteTrip(trip._id).subscribe({
      next: () => {
        this.trips.update(list => list.filter(t => t._id !== trip._id));
        if (this.selectedTrip()?._id === trip._id) {
          this.selectedTrip.set(null);
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete trip.');
      }
    });
  }

  navigateToPlan(): void {
    this.router.navigate(['/plan']);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  }
}
