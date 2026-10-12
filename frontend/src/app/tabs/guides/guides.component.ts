import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  checked: boolean;
}

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <!-- Header -->
      <header class="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-[#101726]/90 shadow-xl">
        <h1 class="text-xl font-extrabold text-white flex items-center gap-2">
          <span>📖</span>
          <span>Tesla Camping Handbook</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">Master overnight routines, packing essentials, and legendary road trip blueprints</p>

        <!-- Sub-navigation Pills -->
        <div class="flex items-center gap-2 pt-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            (click)="activeSection = 'routine'"
            [class]="activeSection === 'routine' ? 'bg-red-600 text-white font-bold' : 'bg-slate-800/80 text-slate-300 hover:text-white'"
            class="px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap"
          >
            🌙 Overnight Routine
          </button>
          <button
            type="button"
            (click)="activeSection = 'checklist'"
            [class]="activeSection === 'checklist' ? 'bg-red-600 text-white font-bold' : 'bg-slate-800/80 text-slate-300 hover:text-white'"
            class="px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap flex items-center gap-1"
          >
            <span>🎒 Packing Checklist</span>
            <span class="text-[10px] px-1.5 py-0.2 bg-black/40 rounded-full font-bold">
              {{ packedCount() }}/{{ checklist().length }}
            </span>
          </button>
          <button
            type="button"
            (click)="activeSection = 'flagship'"
            [class]="activeSection === 'flagship' ? 'bg-red-600 text-white font-bold' : 'bg-slate-800/80 text-slate-300 hover:text-white'"
            class="px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap"
          >
            🗺️ Flagship Itineraries
          </button>
        </div>
      </header>

      <!-- SECTION 1: OVERNIGHT ROUTINE -->
      <section *ngIf="activeSection === 'routine'" class="space-y-4 animate-fade-in">
        <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 class="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span>🔋</span>
              <span>Keep Climate On & Sentry Mode Setup</span>
            </h2>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
              Pro Protocol
            </span>
          </div>

          <div class="space-y-3.5 text-xs text-slate-300">
            <!-- Step 1 -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center gap-2 font-bold text-white text-xs">
                <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px]">1</span>
                <span>Arrive with 45% to 55% State of Charge (SoC)</span>
              </div>
              <p class="text-slate-400 pl-7 leading-relaxed">
                Never arrive at a boondocking spot below 30% battery. Running climate control overnight typically consumes 8 to 18 kWh (about 10% to 22% of battery depending on outdoor temperature). Arriving with 50% guarantees you wake up with at least 25% remaining to easily navigate to the nearest Supercharger.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center gap-2 font-bold text-white text-xs">
                <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px]">2</span>
                <span>Level the Vehicle & Park Responsibly</span>
              </div>
              <p class="text-slate-400 pl-7 leading-relaxed">
                If parking at Walmart, Cracker Barrel, or Cabela's, park in designated rear or perimeter bays away from customer storefronts. Check in with the evening manager. If equipped with air suspension, enable Jack Mode or allow auto-leveling before bed.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center gap-2 font-bold text-white text-xs">
                <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px]">3</span>
                <span>Install Custom Privacy Window Shades</span>
              </div>
              <p class="text-slate-400 pl-7 leading-relaxed">
                Fit blacked-out, reflective shades into all four door windows, small triangular quarter windows, rear hatch, and windshield. This traps heat in cold weather, reflects parking lot floodlights, and provides 100% privacy.
              </p>
            </div>

            <!-- Step 4 -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center gap-2 font-bold text-white text-xs">
                <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px]">4</span>
                <span>Fold Seats & Deploy Mattress</span>
              </div>
              <p class="text-slate-400 pl-7 leading-relaxed">
                Slide front seats forward. Push headrests forward and fold the second row flat. Lay out a tailored Tesla memory foam mattress or dual-chamber inflatable pad. Use headboard gap-fillers for full 6-foot-2 stretch capability.
              </p>
            </div>

            <!-- Step 5 -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center gap-2 font-bold text-white text-xs">
                <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px]">5</span>
                <span>Select Climate Mode (Camp Mode vs Keep Climate On)</span>
              </div>
              <p class="text-slate-400 pl-7 leading-relaxed">
                Tap Climate &gt; select Camp Mode (keeps USB power, 12V outlets, and cabin air flowing all night) OR select Keep Climate On. Set the temperature to 68-70°F and fan speed to 2 or 3 to maintain whisper-quiet fresh cabin airflow.
              </p>
            </div>

            <!-- Step 6 -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center gap-2 font-bold text-white text-xs">
                <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px]">6</span>
                <span>Crucial Step: Manual Door Lock Verification</span>
              </div>
              <p class="text-amber-300 pl-7 leading-relaxed font-medium">
                Camp Mode keeps the car unlocked by default so doors do not auto-lock while occupants enter and exit. Before falling asleep, tap the physical lock padlock icon on the central touchscreen or lock via the Tesla phone app to secure all doors.
              </p>
            </div>

            <!-- Step 7 -->
            <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <div class="flex items-center gap-2 font-bold text-white text-xs">
                <span class="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px]">7</span>
                <span>Sentry Mode & Alarm Awareness</span>
              </div>
              <p class="text-slate-400 pl-7 leading-relaxed">
                If Sentry Mode is active, interior movement will not trigger the alarm as long as Camp Mode is enabled. Sentry cameras will monitor exterior perimeter activity while you sleep soundly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2: PACKING CHECKLIST -->
      <section *ngIf="activeSection === 'checklist'" class="space-y-4 animate-fade-in">
        <div class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 class="text-sm font-bold uppercase tracking-wider text-white">Interactive Tesla Packing List</h2>
              <p class="text-[11px] text-slate-400">All checkboxes save automatically to your phone storage</p>
            </div>
            <button
              type="button"
              (click)="resetChecklist()"
              class="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Reset All
            </button>
          </div>

          <!-- Progress bar -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-semibold text-slate-300">
              <span>Packing Progress</span>
              <span class="text-emerald-400">{{ packedPercent() }}%</span>
            </div>
            <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                class="h-full bg-gradient-to-r from-red-600 to-emerald-500 transition-all duration-300"
                [style.width.%]="packedPercent()"
              ></div>
            </div>
          </div>

          <!-- Grouped checklist items -->
          <div *ngFor="let cat of categories" class="space-y-2 pt-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span>🔹</span>
              <span>{{ cat }}</span>
            </h3>

            <div class="space-y-1.5">
              <div
                *ngFor="let item of getItemsByCategory(cat)"
                (click)="toggleItem(item)"
                class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  [checked]="item.checked"
                  (click)="$event.stopPropagation(); toggleItem(item)"
                  class="w-4 h-4 rounded text-red-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
                <span
                  class="text-xs font-medium transition-all"
                  [class]="item.checked ? 'text-slate-500 line-through' : 'text-slate-200'"
                >
                  {{ item.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: FLAGSHIP ITINERARIES -->
      <section *ngIf="activeSection === 'flagship'" class="space-y-5 animate-fade-in">
        <!-- Itinerary 1: 46-Day Epic Loop -->
        <article class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 bg-gradient-to-br from-slate-900/90 to-[#0e1626]/90">
          <div class="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
            <div class="space-y-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600/20 text-red-400 border border-red-500/30 uppercase">
                Legendary Route 1
              </span>
              <h2 class="text-base font-extrabold text-white">The 46-Day Tesla Road Trip Loop</h2>
              <p class="text-xs text-slate-400">Around America via iconic natural wonders and quirky roadside monuments</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold whitespace-nowrap">
              ~11,200 Miles
            </span>
          </div>

          <div class="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <p>
              This legendary grand loop explores North America through free public lands and coastal highways, relying on the Tesla Supercharger backbone. Key waypoints include:
            </p>
            <ul class="space-y-1.5 list-disc list-inside text-slate-300 pl-1">
              <li><strong class="text-white">Wisconsin Heartland:</strong> Driftless scenic bluffs and farmstead EV charging.</li>
              <li><strong class="text-white">Ruby Falls, Tennessee:</strong> 145-foot underground waterfall inside Lookout Mountain.</li>
              <li><strong class="text-white">Devil's Den, Florida:</strong> Ancient prehistoric underground spring cavern.</li>
              <li><strong class="text-white">Texas 85 MPH Tollway (SH 130):</strong> The highest speed limit road in the United States.</li>
              <li><strong class="text-white">Las Vegas Omega Mart:</strong> Surreal immersive alternate-reality art installation by Meow Wolf.</li>
              <li><strong class="text-white">Black's Beach, California:</strong> Dramatic 300-foot sandstone cliffs above Pacific waves.</li>
              <li><strong class="text-white">Tesla Diner & Drive-In, Hollywood:</strong> 32 V4 Supercharger stalls, roller-skate carhops, and outdoor cinema.</li>
              <li><strong class="text-white">Death Valley Dark Skies:</strong> Unrivaled stargazing through the Model Y glass panoramic roof.</li>
              <li><strong class="text-white">Sequoia & Redwood National Parks:</strong> Roaming among giant ancient redwoods and granite domes.</li>
            </ul>
          </div>
        </article>

        <!-- Itinerary 2: 50-State Concept -->
        <article class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 bg-gradient-to-br from-slate-900/90 to-[#0e1626]/90">
          <div class="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
            <div class="space-y-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase">
                Legendary Route 2
              </span>
              <h2 class="text-base font-extrabold text-white">The 50-State Every State Trip Concept</h2>
              <p class="text-xs text-slate-400">High-efficiency contiguous route plus Alaska highway and Hawaii logistics</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 text-xs font-bold whitespace-nowrap">
              All 50 States
            </span>
          </div>

          <div class="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <p>
              The ultimate electric pilgrimage touching every single state with maximum routing efficiency and zero hotel expenditures:
            </p>
            <div class="grid grid-cols-1 gap-2 pt-1">
              <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-white text-xs block">Contiguous 48 States Backbone</span>
                <p class="text-slate-400 text-[11px]">
                  Optimized mathematically across interstate corridors: from Maine through New England, down the Atlantic Seaboard, across the Gulf States, looping through Texas and the Desert Southwest, up the Pacific Coast Highway, through the Pacific Northwest, across the Rocky Mountain passes, and through the Great Lakes.
                </p>
              </div>

              <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-white text-xs block">Overnight Boondocking Strategy</span>
                <p class="text-slate-400 text-[11px]">
                  Utilize Bureau of Land Management (BLM) and US Forest Service free dispersed recreation in the Western states. In the Midwest and East Coast, rotate through verified Walmart Supercenters, Cracker Barrels, Cabela's, and highway rest areas with courtesy check-in.
                </p>
              </div>

              <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
                <span class="font-bold text-white text-xs block">Alaska & Hawaii Logistics</span>
                <p class="text-slate-400 text-[11px]">
                  Alaska: Traverse the Alaska Highway (ALCAN) via British Columbia and Yukon using Level 2 RV campground pedestals (NEMA 14-50) and growing Northern Superchargers. Hawaii: Vehicle shipping via Matson from Long Beach or Oakland, or local Tesla rental to complete all 50 states.
                </p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  `
})
export class GuidesComponent implements OnInit {
  public activeSection: 'routine' | 'checklist' | 'flagship' = 'routine';

  public categories: string[] = [
    'Bedding & Privacy',
    'Charging & Adapters',
    'Hygiene & Showers',
    'Food Prep & Water',
    'Safety & Comfort'
  ];

  public checklist = signal<ChecklistItem[]>([
    { id: '1', category: 'Bedding & Privacy', name: 'Tesla memory foam or self-inflating twin/full mattress', checked: true },
    { id: '2', category: 'Bedding & Privacy', name: 'Custom blackout reflective window covers (all 6 windows + windshield)', checked: true },
    { id: '3', category: 'Bedding & Privacy', name: 'Glass roof mesh sunshade or blackout insert', checked: false },
    { id: '4', category: 'Bedding & Privacy', name: 'Down sleeping bag or duvet rated to 40°F', checked: false },
    { id: '5', category: 'Charging & Adapters', name: 'Tesla Mobile Connector with NEMA 5-15 (120V) plug', checked: true },
    { id: '6', category: 'Charging & Adapters', name: 'NEMA 14-50 RV park adapter (240V 32A)', checked: false },
    { id: '7', category: 'Charging & Adapters', name: 'J1772 public charging adapter', checked: true },
    { id: '8', category: 'Charging & Adapters', name: 'CCS / NACS DC Fast Charge adapter (if supported)', checked: false },
    { id: '9', category: 'Hygiene & Showers', name: 'Planet Fitness Black Card or active gym chain pass', checked: true },
    { id: '10', category: 'Hygiene & Showers', name: 'Quick-dry microfiber towels (2x)', checked: false },
    { id: '11', category: 'Hygiene & Showers', name: 'Shower flip-flops or water sandals', checked: false },
    { id: '12', category: 'Food Prep & Water', name: 'Sub-trunk cooler with dual ice packs or 12V portable fridge', checked: false },
    { id: '13', category: 'Food Prep & Water', name: 'Electric immersion kettle or low-wattage kettle for camp coffee', checked: false },
    { id: '14', category: 'Food Prep & Water', name: 'Refillable 3-gallon potable water jug with pour spout', checked: false },
    { id: '15', category: 'Safety & Comfort', name: '1000-lumen red LED flashlight (preserves night stargazing vision)', checked: false },
    { id: '16', category: 'Safety & Comfort', name: 'Compact 12V portable tire inflator and puncture repair kit', checked: false }
  ]);

  ngOnInit(): void {
    this.loadChecklistFromStorage();
  }

  loadChecklistFromStorage(): void {
    try {
      const saved = localStorage.getItem('tesla_camp_checklist');
      if (saved) {
        const parsed: ChecklistItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.checklist.set(parsed);
        }
      }
    } catch {}
  }

  saveChecklistToStorage(): void {
    try {
      localStorage.setItem('tesla_camp_checklist', JSON.stringify(this.checklist()));
    } catch {}
  }

  toggleItem(item: ChecklistItem): void {
    this.checklist.update(list =>
      list.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i)
    );
    this.saveChecklistToStorage();
  }

  resetChecklist(): void {
    this.checklist.update(list => list.map(i => ({ ...i, checked: false })));
    this.saveChecklistToStorage();
  }

  getItemsByCategory(category: string): ChecklistItem[] {
    return this.checklist().filter(i => i.category === category);
  }

  packedCount(): number {
    return this.checklist().filter(i => i.checked).length;
  }

  packedPercent(): number {
    const total = this.checklist().length;
    if (total === 0) return 0;
    return Math.round((this.packedCount() / total) * 100);
  }
}
