import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Trip, TripItinerary } from '../../services/api.service';
import { OfflinePlannerService, OfflineFormData } from '../../services/offline-planner.service';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <!-- Header Banner -->
      <header class="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-[#0b101b]/80 to-[#151c2e]/90 shadow-xl relative overflow-hidden">
        <div class="absolute -right-8 -top-8 w-36 h-36 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold">
              ⚡
            </div>
            <h1 class="text-xl font-extrabold tracking-tight text-white">AI Trip Planner</h1>
          </div>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Tesla Expert Active
          </span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">
          Generates free overnight boondocking itineraries with Tesla Keep Climate On buffer guidance, daily showers, and Supercharger waypoints.
        </p>
      </header>

      <!-- AI Planner Box -->
      <section *ngIf="!showOfflinePlanner()" class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
        <div>
          <label for="promptInput" class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Trip Concept or Destination
          </label>
          <textarea
            id="promptInput"
            [(ngModel)]="prompt"
            rows="4"
            placeholder="Describe your Tesla camping trip (e.g., 5 days from Los Angeles to Zion and Bryce Canyon, free boondocking, daily Planet Fitness showers, keeping costs under $200)..."
            class="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
            [disabled]="loading()"
          ></textarea>
        </div>

        <!-- Prompt Chips -->
        <div>
          <span class="text-[11px] font-semibold text-slate-400 block mb-2">Popular starter concepts:</span>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let chip of exampleChips"
              type="button"
              (click)="applyChip(chip)"
              class="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left"
              [disabled]="loading()"
            >
              {{ chip }}
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            (click)="generateAiPlan()"
            [disabled]="loading() || !prompt.trim()"
            class="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span *ngIf="loading()" class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            <span>{{ loading() ? 'Building Tesla Itinerary...' : 'Generate Trip Plan' }}</span>
          </button>

          <button
            type="button"
            (click)="toggleOfflinePlanner(true)"
            class="px-4 py-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            [disabled]="loading()"
          >
            <span>Offline Planner</span>
          </button>
        </div>
      </section>

      <!-- Offline Fallback Banner & Form -->
      <section *ngIf="showOfflinePlanner()" class="space-y-4">
        <!-- Explanatory Notice -->
        <div class="glass-panel rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-3">
          <div class="text-base leading-none">ℹ️</div>
          <div class="flex-1 space-y-1">
            <p class="font-bold">Offline Starter Mode</p>
            <p class="text-amber-300/90 leading-relaxed">
              {{ offlineReason() || 'Generate starter road trips using local spot algorithms. To enable full AI planning, configure AI_API_KEY in your server environment or Render dashboard.' }}
            </p>
          </div>
          <button
            type="button"
            (click)="toggleOfflinePlanner(false)"
            class="px-2.5 py-1 text-[11px] rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold border border-amber-500/40 text-amber-100"
          >
            Back to AI
          </button>
        </div>

        <!-- Offline Form -->
        <form (ngSubmit)="generateOfflinePlan()" class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h2 class="text-sm font-bold uppercase tracking-wider text-slate-200">Offline Itinerary Configurator</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="tripDaysSelect" class="block text-xs text-slate-400 mb-1">Trip Duration</label>
              <select
                id="tripDaysSelect"
                [(ngModel)]="offlineForm.days"
                name="days"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              >
                <option [ngValue]="3">3 Days (Long Weekend)</option>
                <option [ngValue]="5">5 Days (Expedition)</option>
                <option [ngValue]="7">7 Days (Full Week)</option>
                <option [ngValue]="10">10 Days (Grand Tour)</option>
              </select>
            </div>

            <div>
              <label for="regionSelect" class="block text-xs text-slate-400 mb-1">Target Region</label>
              <select
                id="regionSelect"
                [(ngModel)]="offlineForm.region"
                name="region"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              >
                <option value="southwest">Southwest (AZ, UT, TX)</option>
                <option value="west_coast">West Coast (CA, Pacific)</option>
                <option value="rockies">Rockies & Badlands (MT, SD)</option>
                <option value="southeast">Southeast (TN, Smokies)</option>
              </select>
            </div>

            <div>
              <label for="budgetSelect" class="block text-xs text-slate-400 mb-1">Budget Tier</label>
              <select
                id="budgetSelect"
                [(ngModel)]="offlineForm.budgetTier"
                name="budgetTier"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              >
                <option value="ultra_budget">Ultra Budget (Under $25/day)</option>
                <option value="balanced">Balanced (Under $50/day)</option>
                <option value="comfortable">Comfortable ($75/day)</option>
              </select>
            </div>

            <div>
              <label for="interestsInput" class="block text-xs text-slate-400 mb-1">Main Focus</label>
              <input
                id="interestsInput"
                type="text"
                [(ngModel)]="offlineInterest"
                name="interest"
                placeholder="e.g. Stargazing, Hiking"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-xs tracking-wide transition-all shadow-md active:scale-[0.99]"
          >
            Assemble Starter Itinerary
          </button>
        </form>
      </section>

      <!-- Loading State Overlay / Progress -->
      <div *ngIf="loading()" class="glass-panel rounded-2xl p-8 border border-red-500/20 text-center space-y-4">
        <div class="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div class="absolute inset-0 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin"></div>
          <span class="text-2xl">🔋</span>
        </div>
        <div class="space-y-1">
          <p class="text-sm font-bold text-white">{{ currentLoadingTip }}</p>
          <p class="text-xs text-slate-400">Balancing charging stops, overnight battery drain, and shower stops...</p>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMessage()" class="glass-panel rounded-2xl p-4 border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs flex items-start gap-3">
        <span class="text-base leading-none">⚠️</span>
        <div class="flex-1">
          <p class="font-bold">Planning Notice</p>
          <p>{{ errorMessage() }}</p>
        </div>
      </div>

      <!-- Toast Feedback -->
      <div *ngIf="savedFeedback()" class="glass-panel rounded-2xl p-3 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs text-center font-bold animate-fade-in">
        {{ savedFeedback() }}
      </div>

      <!-- Rendered Itinerary Section -->
      <section *ngIf="currentItinerary()" class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-extrabold text-white flex items-center gap-2">
            <span>🗺️</span>
            <span>Generated Itinerary</span>
          </h2>
          <button
            type="button"
            (click)="saveCurrentTrip()"
            [disabled]="isSaved()"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border"
            [ngClass]="isSaved() ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-red-600 hover:bg-red-500 text-white border-red-500'"
          >
            {{ isSaved() ? 'Saved to My Trips' : 'Save to My Trips' }}
          </button>
        </div>

        <!-- Overview Card -->
        <div class="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2 bg-slate-900/40">
          <p *ngIf="currentItinerary()?.summary" class="text-xs text-slate-300 leading-relaxed">
            {{ currentItinerary()?.summary }}
          </p>
          <div class="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <span *ngIf="currentItinerary()?.totalEstimatedCost" class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
              Est. Total: \${{ currentItinerary()?.totalEstimatedCost }}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 font-bold border border-sky-500/20">
              {{ currentItinerary()?.days?.length || 0 }} Days
            </span>
          </div>
          <p *ngIf="currentItinerary()?.climateTips" class="text-[11px] text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 mt-2">
            <strong class="font-bold text-amber-200">Overnight Battery Guidance:</strong>
            {{ currentItinerary()?.climateTips }}
          </p>
        </div>

        <!-- Day by Day Cards -->
        <div class="space-y-4">
          <div
            *ngFor="let day of currentItinerary()?.days"
            class="glass-panel rounded-2xl p-4 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3 bg-[#0d1322]/60"
          >
            <!-- Day Headline -->
            <div class="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-extrabold">
                  Day {{ day.day }}
                </span>
                <h3 class="text-sm font-bold text-white">{{ day.title }}</h3>
              </div>
              <span *ngIf="day.costs" class="text-xs font-semibold text-emerald-400 whitespace-nowrap">
                \${{ day.costs }}
              </span>
            </div>

            <!-- Route Summary -->
            <p *ngIf="day.routeSummary" class="text-xs text-slate-300">
              <strong class="text-slate-400">Route:</strong> {{ day.routeSummary }}
            </p>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
              <!-- Overnight Spot -->
              <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Overnight Spot (Free)
                </span>
                <span class="text-slate-200">{{ day.overnightSpot }}</span>
              </div>

              <!-- Shower -->
              <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                  Shower Solution
                </span>
                <span class="text-slate-200">{{ day.shower }}</span>
              </div>

              <!-- Food Plan -->
              <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-0.5">
                  Food Plan
                </span>
                <span class="text-slate-200">{{ day.foodPlan }}</span>
              </div>

              <!-- Charging & Buffer Plan -->
              <div class="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                  Charging & Buffer
                </span>
                <span class="text-slate-200">{{ day.chargingPlan }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class PlanComponent implements OnInit {
  private api = inject(ApiService);
  private offlinePlanner = inject(OfflinePlannerService);

  public prompt: string = '';
  public loading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public showOfflinePlanner = signal<boolean>(false);
  public offlineReason = signal<string | null>(null);
  public currentItinerary = signal<TripItinerary | null>(null);
  public isSaved = signal<boolean>(false);
  public savedFeedback = signal<string | null>(null);
  public currentLoadingTip: string = 'Mapping Tesla Superchargers and free boondocking spots...';

  public exampleChips: string[] = [
    '7 days through Texas and New Mexico, stargazing, cheap',
    'Pacific Coast Highway 5 days free camping with Superchargers',
    'Smoky Mountains weekend getaway with Planet Fitness showers',
    '10-day Colorado & Utah national parks boondocking'
  ];

  public offlineForm: OfflineFormData = {
    days: 5,
    region: 'southwest',
    budgetTier: 'ultra_budget',
    interests: ['Stargazing', 'National Parks']
  };

  public offlineInterest: string = 'Stargazing, National Parks';

  private loadingTips: string[] = [
    'Locating free BLM dispersed and retailer overnight parking...',
    'Ensuring 45-55% campsite battery arrival buffer...',
    'Mapping daily Planet Fitness and travel center showers...',
    'Budgeting food and electric vehicle charging stops...'
  ];
  private tipInterval: any;

  ngOnInit(): void {
    // Check health on start to detect if AI key is missing early
    this.api.getHealth().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  applyChip(chipText: string): void {
    this.prompt = chipText;
  }

  toggleOfflinePlanner(show: boolean): void {
    this.showOfflinePlanner.set(show);
    this.errorMessage.set(null);
  }

  generateAiPlan(): void {
    if (!this.prompt.trim()) return;

    this.loading.set(true);
    this.errorMessage.set(null);
    this.isSaved.set(false);
    this.savedFeedback.set(null);

    let tipIndex = 0;
    this.currentLoadingTip = this.loadingTips[0];
    this.tipInterval = setInterval(() => {
      tipIndex = (tipIndex + 1) % this.loadingTips.length;
      this.currentLoadingTip = this.loadingTips[tipIndex];
    }, 2400);

    this.api.generatePlan(this.prompt).subscribe({
      next: (trip: Trip) => {
        clearInterval(this.tipInterval);
        this.loading.set(false);
        this.currentItinerary.set(trip.itinerary);
        this.isSaved.set(true); // Server automatically saved it
        this.savedFeedback.set('Trip planned and saved to My Trips!');
        setTimeout(() => this.savedFeedback.set(null), 4000);
      },
      error: (err) => {
        clearInterval(this.tipInterval);
        this.loading.set(false);

        if (err.status === 503 || err.error?.error === 'AI_NOT_CONFIGURED') {
          this.offlineReason.set('AI API key is not yet configured on the server. Switched to offline starter mode so you can generate itineraries immediately.');
          this.showOfflinePlanner.set(true);
        } else if (err.status === 429) {
          this.errorMessage.set(err.error?.message || 'Daily planning limit reached (20 plans per day per user). Please try again tomorrow.');
        } else {
          this.errorMessage.set(err.error?.message || 'Failed to connect to the planning service. You can use the offline planner below.');
        }
      }
    });
  }

  generateOfflinePlan(): void {
    const interests = this.offlineInterest.split(',').map(s => s.trim()).filter(Boolean);
    this.offlineForm.interests = interests;
    const plan = this.offlinePlanner.generateOfflineItinerary(this.offlineForm);
    this.currentItinerary.set(plan);
    this.isSaved.set(false);
    this.savedFeedback.set('Starter itinerary generated from local spots!');
    setTimeout(() => this.savedFeedback.set(null), 4000);
  }

  saveCurrentTrip(): void {
    const itin = this.currentItinerary();
    if (!itin) return;

    const tripPrompt = this.prompt.trim() || `Offline ${itin.days.length}-Day Plan`;
    this.api.saveTrip({ prompt: tripPrompt, itinerary: itin }).subscribe({
      next: () => {
        this.isSaved.set(true);
        this.savedFeedback.set('Saved to My Trips successfully!');
        setTimeout(() => this.savedFeedback.set(null), 4000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Could not save trip to database.');
      }
    });
  }
}
