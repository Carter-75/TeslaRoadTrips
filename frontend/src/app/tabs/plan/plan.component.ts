import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, TripItinerary, ChatMessage, ChatResponse } from '../../services/api.service';
import { OfflinePlannerService, OfflineFormData } from '../../services/offline-planner.service';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 pb-28 max-w-2xl mx-auto px-4 pt-4">
      <!-- Top Title Header -->
      <header class="glass-panel rounded-2xl p-4 border border-slate-800 bg-gradient-to-br from-slate-900/90 via-[#0b101b]/80 to-[#151c2e]/90 shadow-xl flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold">
            ⚡
          </div>
          <div>
            <h1 class="text-base font-extrabold tracking-tight text-white leading-tight">Tesla Road Trip Assistant</h1>
            <p class="text-[11px] text-slate-400">Conversational AI Route & Boondocking Planner</p>
          </div>
        </div>
        <button
          *ngIf="chatMessages().length > 0"
          type="button"
          (click)="startNewChat()"
          class="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-all"
        >
          New Chat
        </button>
      </header>

      <!-- Offline Fallback Notice (if triggered) -->
      <div *ngIf="showOfflinePlanner()" class="space-y-4 animate-fade-in">
        <div class="glass-panel rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-start gap-3">
          <span class="text-base leading-none">ℹ️</span>
          <div class="flex-1 space-y-1">
            <p class="font-bold">Offline Starter Mode</p>
            <p class="text-amber-300/90 leading-relaxed">
              {{ offlineReason() || 'AI API key is not yet set on the server. You can configure AI_API_KEY in .env.local or your Render dashboard. In the meantime, assemble starter itineraries offline below!' }}
            </p>
          </div>
          <button
            type="button"
            (click)="toggleOfflinePlanner(false)"
            class="px-2.5 py-1 text-[11px] rounded-lg bg-amber-500/20 hover:bg-amber-500/30 font-semibold border border-amber-500/40 text-amber-100 whitespace-nowrap"
          >
            Try AI Chat
          </button>
        </div>

        <!-- Offline Generator Form -->
        <form (ngSubmit)="generateOfflinePlan()" class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-200">Offline Itinerary Configurator</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label for="offDays" class="block text-xs text-slate-400 mb-1">Trip Duration</label>
              <select
                id="offDays"
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
              <label for="offRegion" class="block text-xs text-slate-400 mb-1">Target Region</label>
              <select
                id="offRegion"
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
              <label for="offBudget" class="block text-xs text-slate-400 mb-1">Budget Tier</label>
              <select
                id="offBudget"
                [(ngModel)]="offlineForm.budgetTier"
                name="budgetTier"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              >
                <option value="ultra_budget">Ultra Budget (Under \$25/day)</option>
                <option value="balanced">Balanced (Under \$50/day)</option>
                <option value="comfortable">Comfortable (\$75/day)</option>
              </select>
            </div>

            <div>
              <label for="offInterest" class="block text-xs text-slate-400 mb-1">Main Focus</label>
              <input
                id="offInterest"
                type="text"
                [(ngModel)]="offlineInterest"
                name="interest"
                placeholder="e.g. Stargazing, Dark skies"
                class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-slate-100 hover:bg-white text-slate-900 font-bold text-xs tracking-wide transition-all shadow-md active:scale-[0.99]"
          >
            Assemble Starter Route
          </button>
        </form>
      </div>

      <!-- Conversational Chat Stream -->
      <div *ngIf="!showOfflinePlanner()" class="space-y-4">
        <!-- Initial Welcome if chat is empty -->
        <div *ngIf="chatMessages().length === 0" class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div class="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <p class="font-bold text-white text-sm">Where are you taking your Tesla?</p>
              <p>
                Describe your dream road trip in as much or as little detail as you like. If needed, I will ask you quick follow-up questions to dial in your range, charging buffers, free overnight boondocking spots, and daily showers.
              </p>
            </div>
          </div>

          <!-- Starter Chips -->
          <div>
            <span class="text-[11px] font-semibold text-slate-400 block mb-2">Try a starter concept:</span>
            <div class="flex flex-wrap gap-2">
              <button
                *ngFor="let chip of starterChips"
                type="button"
                (click)="sendQuickPrompt(chip)"
                class="text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left"
              >
                {{ chip }}
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Bubble History -->
        <div *ngFor="let msg of chatMessages()" class="space-y-3">
          <!-- User Bubble -->
          <div *ngIf="msg.role === 'user'" class="flex justify-end">
            <div class="max-w-[85%] bg-gradient-to-r from-red-600 to-red-700 text-white p-3.5 rounded-2xl rounded-tr-sm shadow-md text-xs leading-relaxed font-medium">
              {{ msg.content }}
            </div>
          </div>

          <!-- Assistant Bubble -->
          <div *ngIf="msg.role === 'assistant'" class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shrink-0 mt-0.5">
              ⚡
            </div>
            <div class="flex-1 space-y-3">
              <!-- Text Message -->
              <div class="glass-panel bg-slate-900/90 border border-slate-800 p-4 rounded-2xl rounded-tl-sm text-xs text-slate-200 leading-relaxed whitespace-pre-line shadow-lg">
                {{ msg.content }}
              </div>

              <!-- Quick Replies (if present) -->
              <div *ngIf="msg.quickReplies && msg.quickReplies.length > 0" class="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  *ngFor="let reply of msg.quickReplies"
                  type="button"
                  (click)="sendQuickPrompt(reply)"
                  [disabled]="loading()"
                  class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800/80 hover:bg-red-600/20 hover:text-red-300 border border-slate-700 hover:border-red-500/40 text-slate-300 transition-all"
                >
                  💬 {{ reply }}
                </button>
              </div>

              <!-- Rendered Itinerary Card (if generated) -->
              <div *ngIf="msg.itinerary" class="space-y-3 pt-2">
                <!-- Itinerary Header Summary -->
                <div class="glass-panel rounded-2xl p-4 border border-red-500/30 bg-gradient-to-br from-slate-900/90 to-[#131b2e]/90 space-y-2.5">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                        Generated Expedition
                      </span>
                      <h2 class="text-sm font-extrabold text-white mt-1">
                        {{ msg.itinerary.title || 'Custom Tesla Road Trip' }}
                      </h2>
                    </div>
                    <button
                      type="button"
                      (click)="saveItinerary(msg.itinerary)"
                      class="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs border border-red-500 transition-all shrink-0 shadow-md"
                    >
                      Save Trip
                    </button>
                    <button
                      type="button"
                      (click)="shareItinerary(msg.itinerary)"
                      class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs border border-sky-500 transition-all shrink-0 shadow-md"
                    >
                      Share
                    </button>
                  </div>

                  <p *ngIf="msg.itinerary.summary" class="text-xs text-slate-300 leading-relaxed">
                    {{ msg.itinerary.summary }}
                  </p>

                  <div class="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span *ngIf="msg.itinerary.totalMiles" class="px-2.5 py-0.5 rounded-lg bg-sky-500/15 text-sky-400 font-bold border border-sky-500/20">
                      {{ msg.itinerary.totalMiles }} Miles Total
                    </span>
                    <span *ngIf="msg.itinerary.totalEstimatedCost" class="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                      Est. Total: \${{ msg.itinerary.totalEstimatedCost }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 font-bold border border-purple-500/20">
                      {{ msg.itinerary.days.length }} Days
                    </span>
                  </div>

                  <div *ngIf="msg.itinerary.climateTips" class="text-[11px] text-amber-200 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 mt-1">
                    <strong class="font-bold">Overnight Climate & Battery Buffer:</strong>
                    {{ msg.itinerary.climateTips }}
                  </div>
                </div>

                <!-- Day Cards List -->
                <div class="space-y-3">
                  <div
                    *ngFor="let day of msg.itinerary.days"
                    class="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3 bg-[#0d1322]/70 hover:border-slate-700 transition-all"
                  >
                    <!-- Day Title Row -->
                    <div class="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-500/30 text-[11px] font-extrabold">
                          Day {{ day.day }}
                        </span>
                        <h3 class="text-xs font-bold text-white">{{ day.title }}</h3>
                      </div>
                      <span *ngIf="day.costs" class="text-xs font-semibold text-emerald-400 whitespace-nowrap">
                        \${{ day.costs }}
                      </span>
                    </div>

                    <!-- Route & Drive Info -->
                    <div class="space-y-1 text-xs">
                      <p class="text-slate-300">
                        <strong class="text-slate-400">Route:</strong> {{ day.routeSummary }}
                      </p>
                      <div *ngIf="day.miles || day.driveTime" class="flex gap-3 text-[11px] text-sky-400 font-medium">
                        <span *ngIf="day.miles">Distance: {{ day.miles }} miles</span>
                        <span *ngIf="day.driveTime">Drive Time: {{ day.driveTime }}</span>
                      </div>
                      <p *ngIf="day.elevationProfile" class="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                        ⛰️ {{ day.elevationProfile }}
                      </p>
                    </div>

                    <!-- Grid of Plans -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <!-- Overnight Spot -->
                      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                        <span class="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">
                          Free Overnight Spot
                        </span>
                        <span class="text-slate-200 font-medium">{{ day.overnightSpot }}</span>
                        <span *ngIf="day.overnightType" class="text-[10px] text-sky-400 block">
                          ({{ day.overnightType }})
                        </span>
                      </div>

                      <!-- Shower Plan -->
                      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                        <span class="font-bold uppercase tracking-wider text-sky-400 block text-[10px]">
                          Daily Shower Solution
                        </span>
                        <span class="text-slate-200">{{ day.shower }}</span>
                      </div>

                      <!-- Food Plan -->
                      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                        <span class="font-bold uppercase tracking-wider text-amber-400 block text-[10px]">
                          Food & Cooler Strategy
                        </span>
                        <span class="text-slate-200">{{ day.foodPlan }}</span>
                      </div>

                      <!-- Charging & Arrival Buffer -->
                      <div class="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                        <span class="font-bold uppercase tracking-wider text-emerald-400 block text-[10px]">
                          Supercharging & Arrival Buffer
                        </span>
                        <span class="text-slate-200">{{ day.chargingPlan }}</span>
                      </div>
                    </div>

                    <!-- Sights / Highlights -->
                    <div *ngIf="day.highlights && day.highlights.length > 0" class="flex flex-wrap gap-1.5 pt-1">
                      <span
                        *ngFor="let h of day.highlights"
                        class="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                      >
                        ⭐ {{ h }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Animated Loading State -->
        <div *ngIf="loading()" class="glass-panel rounded-2xl p-6 border border-red-500/20 text-center space-y-3 animate-fade-in">
          <div class="relative w-12 h-12 mx-auto flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin"></div>
            <span class="text-xl">🔋</span>
          </div>
          <p class="text-xs font-bold text-white">{{ currentLoadingTip }}</p>
        </div>

        <!-- Toast Feedback -->
        <div *ngIf="savedFeedback()" class="glass-panel rounded-2xl p-3 border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs text-center font-bold animate-fade-in">
          {{ savedFeedback() }}
        </div>

        <!-- Chat Input Bar -->
        <div class="sticky bottom-16 z-30 pt-2">
          <form (ngSubmit)="sendMessage()" class="glass-panel p-2 rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl flex items-center gap-2">
            <input
              type="text"
              [(ngModel)]="userInput"
              name="input"
              [disabled]="loading()"
              placeholder="Ask a question, adjust route, or describe your trip..."
              class="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              [disabled]="loading() || !userInput.trim()"
              class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs tracking-wide shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Send</span>
              <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PlanComponent implements OnInit {
  private api = inject(ApiService);
  private offlinePlanner = inject(OfflinePlannerService);

  public chatMessages = signal<ChatMessage[]>([]);
  public userInput: string = '';
  public loading = signal<boolean>(false);
  public showOfflinePlanner = signal<boolean>(false);
  public offlineReason = signal<string | null>(null);
  public savedFeedback = signal<string | null>(null);
  public currentLoadingTip: string = 'Mapping Tesla Superchargers and free boondocking spots...';

  public starterChips: string[] = [
    '7 days through Texas and New Mexico, stargazing, cheap',
    'Pacific Coast Highway 5 days free camping with Superchargers',
    'Smoky Mountains weekend getaway with Planet Fitness showers',
    '46-day grand American loop with Devil\'s Den & Omega Mart'
  ];

  public offlineForm: OfflineFormData = {
    days: 5,
    region: 'southwest',
    budgetTier: 'ultra_budget',
    interests: ['Stargazing', 'National Parks']
  };
  public offlineInterest: string = 'Stargazing, Dark skies';

  private loadingTips: string[] = [
    'Analyzing elevation and mountain pass battery consumption...',
    'Locating free BLM dispersed and retailer overnight parking...',
    'Ensuring 45-55% campsite battery arrival buffer...',
    'Mapping daily Planet Fitness and travel center showers...',
    'Calculating Supercharging rates and cooler meal budgets...'
  ];
  private tipInterval: any;

  ngOnInit(): void {
    // Check health on start
    this.api.getHealth().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  startNewChat(): void {
    this.chatMessages.set([]);
    this.userInput = '';
    this.showOfflinePlanner.set(false);
  }

  toggleOfflinePlanner(show: boolean): void {
    this.showOfflinePlanner.set(show);
  }

  sendQuickPrompt(text: string): void {
    this.userInput = text;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.loading()) return;

    // Append user message to chat stream
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    this.chatMessages.update(list => [...list, userMsg]);
    this.userInput = '';
    this.loading.set(true);

    let tipIndex = 0;
    this.currentLoadingTip = this.loadingTips[0];
    this.tipInterval = setInterval(() => {
      tipIndex = (tipIndex + 1) % this.loadingTips.length;
      this.currentLoadingTip = this.loadingTips[tipIndex];
    }, 2200);

    // Prepare history payload for API
    const historyPayload = this.chatMessages().map(m => ({
      role: m.role,
      content: m.content
    }));

    this.api.chatPlan(text, historyPayload).subscribe({
      next: (res: ChatResponse) => {
        clearInterval(this.tipInterval);
        this.loading.set(false);

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: res.message || 'Here is your trip update:',
          type: res.type,
          quickReplies: res.quickReplies || [],
          itinerary: res.itinerary,
          timestamp: new Date().toISOString()
        };

        this.chatMessages.update(list => [...list, assistantMsg]);
      },
      error: (err) => {
        clearInterval(this.tipInterval);
        this.loading.set(false);

        if (err.status === 503 || err.error?.error === 'AI_NOT_CONFIGURED') {
          this.offlineReason.set('AI API key is not yet configured on the server. You can configure AI_API_KEY in .env.local or Render dashboard. In the meantime, assemble starter routes offline below.');
          this.showOfflinePlanner.set(true);
        } else if (err.status === 429) {
          const errMsg: ChatMessage = {
            role: 'assistant',
            content: err.error?.message || 'Daily planning limit reached (20 plans per day per user). Please try again tomorrow or use offline mode.',
            timestamp: new Date().toISOString()
          };
          this.chatMessages.update(list => [...list, errMsg]);
        } else {
          const errMsg: ChatMessage = {
            role: 'assistant',
            content: err.error?.message || 'I encountered an issue connecting to the AI planning service. You can use the offline starter planner below.',
            timestamp: new Date().toISOString()
          };
          this.chatMessages.update(list => [...list, errMsg]);
        }
      }
    });
  }

  generateOfflinePlan(): void {
    const interests = this.offlineInterest.split(',').map(s => s.trim()).filter(Boolean);
    this.offlineForm.interests = interests;
    const plan = this.offlinePlanner.generateOfflineItinerary(this.offlineForm);

    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: 'Here is your starter itinerary assembled offline from our local database:',
      type: 'itinerary',
      itinerary: plan,
      quickReplies: ['Save this trip', 'Switch to AI mode'],
      timestamp: new Date().toISOString()
    };

    this.showOfflinePlanner.set(false);
    this.chatMessages.set([assistantMsg]);
    this.savedFeedback.set('Starter itinerary generated offline!');
    setTimeout(() => this.savedFeedback.set(null), 4000);
  }

  saveItinerary(itinerary: TripItinerary): void {
    const title = itinerary.title || 'Tesla Camping Trip';
    this.api.saveTrip({ prompt: title, itinerary: itinerary }).subscribe({
      next: () => {
        this.savedFeedback.set('Itinerary saved to My Trips!');
        setTimeout(() => this.savedFeedback.set(null), 4000);
      },
      error: (err) => {
        alert(err.error?.message || 'Could not save trip to database.');
      }
    });
  }

  shareItinerary(itinerary: TripItinerary): void {
    const title = itinerary.title || 'Tesla Camping Trip';
    const lines: string[] = [`Tesla Camp Planner trip: ${title}`, ''];
    (itinerary.days || []).forEach((d) => {
      lines.push(`Day ${d.day}: ${d.title}`);
      if (d.overnightSpot) lines.push(`  Sleep: ${d.overnightSpot}`);
      if (d.chargingPlan) lines.push(`  Charging: ${d.chargingPlan}`);
    });
    if (itinerary.totalMiles) lines.push(`Total: ${itinerary.totalMiles} miles`);
    if (itinerary.totalEstimatedCost) lines.push(`Est. cost: $${itinerary.totalEstimatedCost}`);
    lines.push('', 'Planned with Tesla Camp Planner');
    const text = lines.join('\n');
    const shareData = { title, text, url: window.location.origin };

    const done = (msg: string) => {
      this.savedFeedback.set(msg);
      setTimeout(() => this.savedFeedback.set(null), 4000);
    };

    // Native share sheet on phones: user can share straight to the Tesla app
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text}\n${window.location.origin}`)
        .then(() => done('Trip copied! Paste it anywhere, including your Tesla app.'))
        .catch(() => done('Could not copy trip.'));
    } else {
      done('Sharing is not supported on this device.');
    }
  }
}
