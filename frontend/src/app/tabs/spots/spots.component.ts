import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Spot } from '../../services/api.service';
import { OfflinePlannerService } from '../../services/offline-planner.service';

@Component({
  selector: 'app-spots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <!-- Header -->
      <header class="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-[#101726]/90 shadow-xl flex items-center justify-between">
        <div>
          <h1 class="text-xl font-extrabold text-white flex items-center gap-2">
            <span>📍</span>
            <span>Tesla Spot Finder</span>
          </h1>
          <p class="text-xs text-slate-400 mt-1">Free overnight parking spots, BLM dispersed lands, and safe retail havens</p>
        </div>
        <button
          type="button"
          (click)="openSubmitModal()"
          class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center gap-1.5"
        >
          <span>+ Submit Spot</span>
        </button>
      </header>

      <!-- Search & Filter Controls -->
      <section class="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div class="flex flex-col sm:flex-row gap-2.5">
          <!-- Search Box -->
          <div class="relative flex-1">
            <span class="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onFilterChange()"
              placeholder="Search by spot name, city, or notes..."
              class="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <!-- State Dropdown -->
          <div class="sm:w-36">
            <select
              [(ngModel)]="selectedState"
              (change)="onFilterChange()"
              class="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
            >
              <option value="">All States</option>
              <option *ngFor="let st of usStates" [value]="st">{{ st }}</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Showing {{ spots().length }} spots</span>
          <span class="text-slate-500">Free overnight parking for EV Campers</span>
        </div>
      </section>

      <!-- Loading State -->
      <div *ngIf="loading()" class="glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-2">
        <div class="w-8 h-8 mx-auto border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <p class="text-xs text-slate-400">Loading verified & community spots...</p>
      </div>

      <!-- Feedback Toast -->
      <div *ngIf="toastMessage()" class="glass-panel rounded-2xl p-3 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs text-center font-bold animate-fade-in">
        {{ toastMessage() }}
      </div>

      <!-- Spots List -->
      <div *ngIf="!loading() && spots().length > 0" class="space-y-3">
        <div
          *ngFor="let spot of spots()"
          class="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800/90 transition-all space-y-2.5 bg-[#0d1322]/70"
        >
          <!-- Top Row: Name and Verification Badge -->
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-0.5">
              <h2 class="text-sm font-bold text-white">{{ spot.name }}</h2>
              <p class="text-xs text-slate-400 font-medium">
                {{ spot.city }}, {{ spot.state }}
              </p>
            </div>
            <!-- Verification Badge -->
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border whitespace-nowrap"
              [ngClass]="getVerificationBadgeClass(spot.verificationLevel)"
            >
              {{ getVerificationLabel(spot.verificationLevel) }}
            </span>
          </div>

          <!-- Notes -->
          <p *ngIf="spot.notes" class="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            {{ spot.notes }}
          </p>

          <!-- Source and Coordinates -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
            <span class="truncate max-w-[200px]">Source: {{ spot.source || 'Community' }}</span>
            <div class="flex items-center gap-3">
              <a
                [href]="getMapsUrl(spot)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                <span>Google Maps</span>
                <span class="text-[10px]">↗</span>
              </a>
              <button
                type="button"
                (click)="openReportModal(spot)"
                class="text-slate-400 hover:text-rose-400 font-medium transition-colors"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && spots().length === 0" class="glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-3">
        <span class="text-3xl">🔍</span>
        <h2 class="text-sm font-bold text-white">No Spots Found</h2>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          No parking spots matched your current search filters. Try picking another state or submit a new location.
        </p>
      </div>

      <!-- Submit Spot Modal -->
      <div
        *ngIf="showSubmitModal()"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      >
        <div class="glass-panel bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div class="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-sm font-bold text-white flex items-center gap-1.5">
              <span>📍</span>
              <span>Submit a Free Overnight Spot</span>
            </h3>
            <button (click)="closeSubmitModal()" class="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          <form (ngSubmit)="submitSpot()" class="p-5 space-y-3 text-xs overflow-y-auto max-h-[75vh]">
            <div>
              <label class="block text-slate-300 mb-1 font-semibold">Spot Name *</label>
              <input
                type="text"
                [(ngModel)]="newSpot.name"
                name="name"
                required
                placeholder="e.g. Walmart Supercenter #4210"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-red-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 mb-1 font-semibold">City *</label>
                <input
                  type="text"
                  [(ngModel)]="newSpot.city"
                  name="city"
                  required
                  placeholder="e.g. Flagstaff"
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-red-500"
                />
              </div>
              <div>
                <label class="block text-slate-300 mb-1 font-semibold">State (2 Letters) *</label>
                <input
                  type="text"
                  [(ngModel)]="newSpot.state"
                  name="state"
                  maxlength="2"
                  required
                  placeholder="e.g. AZ"
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white uppercase focus:border-red-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 mb-1 font-semibold">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  [(ngModel)]="newSpot.lat"
                  name="lat"
                  required
                  placeholder="e.g. 35.1983"
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-red-500"
                />
              </div>
              <div>
                <label class="block text-slate-300 mb-1 font-semibold">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  [(ngModel)]="newSpot.lng"
                  name="lng"
                  required
                  placeholder="e.g. -111.6513"
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-slate-300 mb-1 font-semibold">Notes & Tips</label>
              <textarea
                [(ngModel)]="newSpot.notes"
                name="notes"
                rows="3"
                placeholder="Overnight parking rules, proximity to Superchargers, restrooms, gate codes..."
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-red-500 resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-slate-300 mb-1 font-semibold">Source or Credit</label>
              <input
                type="text"
                [(ngModel)]="newSpot.source"
                name="source"
                placeholder="e.g. Personal stay March 2026"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-red-500"
              />
            </div>

            <p class="text-[11px] text-slate-400">
              New submissions are reviewed by community moderators and added with Pending status.
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="closeSubmitModal()"
                class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Submit Spot
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Report Modal -->
      <div
        *ngIf="reportingSpot()"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      >
        <div class="glass-panel bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-t-3xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div class="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-sm font-bold text-white">Feedback for {{ reportingSpot()?.name }}</h3>
            <button (click)="closeReportModal()" class="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          <form (ngSubmit)="sendReport()" class="p-5 space-y-3 text-xs">
            <div>
              <label class="block text-slate-300 mb-1 font-semibold">Feedback Type</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="reportType = 'problem'"
                  [class]="reportType === 'problem' ? 'bg-rose-500/20 text-rose-300 border-rose-500' : 'bg-slate-950 text-slate-400 border-slate-800'"
                  class="py-2 rounded-xl border text-center font-bold"
                >
                  ⚠️ Problem / No Parking
                </button>
                <button
                  type="button"
                  (click)="reportType = 'praise'"
                  [class]="reportType === 'praise' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-slate-950 text-slate-400 border-slate-800'"
                  class="py-2 rounded-xl border text-center font-bold"
                >
                  ⭐ Praise / Great Stay
                </button>
              </div>
            </div>

            <div>
              <label class="block text-slate-300 mb-1 font-semibold">Your Note *</label>
              <textarea
                [(ngModel)]="reportNote"
                name="note"
                rows="3"
                required
                placeholder="Describe your experience or changes in parking policy..."
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-red-500 resize-none"
              ></textarea>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="closeReportModal()"
                class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="!reportNote.trim()"
                class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold"
              >
                Send Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class SpotsComponent implements OnInit {
  private api = inject(ApiService);
  private offlinePlanner = inject(OfflinePlannerService);

  public spots = signal<Spot[]>([]);
  public loading = signal<boolean>(true);
  public searchQuery: string = '';
  public selectedState: string = '';
  public toastMessage = signal<string | null>(null);

  public showSubmitModal = signal<boolean>(false);
  public newSpot: Partial<Spot> = {
    name: '',
    state: '',
    city: '',
    lat: undefined,
    lng: undefined,
    notes: '',
    source: 'Community Submission'
  };

  public reportingSpot = signal<Spot | null>(null);
  public reportType: 'problem' | 'praise' = 'problem';
  public reportNote: string = '';

  public usStates: string[] = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  ngOnInit(): void {
    this.fetchSpots();
  }

  fetchSpots(): void {
    this.loading.set(true);
    this.api.getSpots(this.selectedState, this.searchQuery).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.spots.set(data);
        } else if (!this.selectedState && !this.searchQuery) {
          // If server returned empty or offline, use embedded spots
          this.spots.set(this.offlinePlanner.embeddedSpots);
        } else {
          this.spots.set([]);
        }
        this.loading.set(false);
      },
      error: () => {
        // Fallback to offline embedded spots
        let list = this.offlinePlanner.embeddedSpots;
        if (this.selectedState) {
          list = list.filter(s => s.state === this.selectedState);
        }
        if (this.searchQuery) {
          const q = this.searchQuery.toLowerCase();
          list = list.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.city.toLowerCase().includes(q) ||
            (s.notes && s.notes.toLowerCase().includes(q))
          );
        }
        this.spots.set(list);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.fetchSpots();
  }

  getVerificationBadgeClass(level: string): string {
    switch (level) {
      case 'verified':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
      case 'unverified':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  }

  getVerificationLabel(level: string): string {
    switch (level) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending';
      case 'unverified':
      default: return 'Unverified';
    }
  }

  getMapsUrl(spot: Spot): string {
    return `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;
  }

  openSubmitModal(): void {
    this.newSpot = {
      name: '',
      state: '',
      city: '',
      lat: undefined,
      lng: undefined,
      notes: '',
      source: 'Community Submission'
    };
    this.showSubmitModal.set(true);
  }

  closeSubmitModal(): void {
    this.showSubmitModal.set(false);
  }

  submitSpot(): void {
    if (!this.newSpot.name || !this.newSpot.state || !this.newSpot.city || this.newSpot.lat === undefined || this.newSpot.lng === undefined) {
      alert('Please fill out all required fields.');
      return;
    }

    this.api.submitSpot(this.newSpot).subscribe({
      next: (created) => {
        this.showSubmitModal.set(false);
        this.spots.update(list => [created, ...list]);
        this.toastMessage.set('Spot submitted successfully for review!');
        setTimeout(() => this.toastMessage.set(null), 4000);
      },
      error: (err) => {
        alert(err.error?.message || 'Could not submit spot.');
      }
    });
  }

  openReportModal(spot: Spot): void {
    this.reportingSpot.set(spot);
    this.reportType = 'problem';
    this.reportNote = '';
  }

  closeReportModal(): void {
    this.reportingSpot.set(null);
  }

  sendReport(): void {
    const spot = this.reportingSpot();
    if (!spot || !spot._id || !this.reportNote.trim()) return;

    this.api.reportSpot(spot._id, { type: this.reportType, note: this.reportNote.trim() }).subscribe({
      next: () => {
        this.closeReportModal();
        this.toastMessage.set('Feedback submitted. Thank you for helping keep spot data accurate!');
        setTimeout(() => this.toastMessage.set(null), 4000);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to submit report.');
      }
    });
  }
}
