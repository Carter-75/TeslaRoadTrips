import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 pb-24 max-w-2xl mx-auto px-4 pt-4">
      <!-- Header -->
      <header class="glass-panel rounded-2xl p-5 border border-slate-800 bg-gradient-to-br from-slate-900/90 to-[#101726]/90 shadow-xl">
        <h1 class="text-xl font-extrabold text-white flex items-center gap-2">
          <span>💰</span>
          <span>Trip Budget Calculator</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          Calculate your total Tesla road trip spend across Low, Mid, and Comfortable scenarios
        </p>
      </header>

      <!-- Calculator Inputs -->
      <section class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300">Trip Parameters</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <!-- Trip Days -->
          <div>
            <label for="tripDaysInput" class="block text-slate-300 font-semibold mb-1">
              Trip Duration (Days): <span class="text-red-400 font-bold">{{ days }}</span>
            </label>
            <input
              id="tripDaysInput"
              type="range"
              min="1"
              max="60"
              [(ngModel)]="days"
              class="w-full accent-red-600 bg-slate-950 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>1 Day</span>
              <span>14 Days</span>
              <span>30 Days</span>
              <span>60 Days</span>
            </div>
          </div>

          <!-- Food Per Day -->
          <div>
            <label for="foodCostInput" class="block text-slate-300 font-semibold mb-1">
              Food Budget Per Day: <span class="text-emerald-400 font-bold">\${{ foodPerDay }}</span>
            </label>
            <input
              id="foodCostInput"
              type="range"
              min="10"
              max="120"
              step="5"
              [(ngModel)]="foodPerDay"
              class="w-full accent-emerald-500 bg-slate-950 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>\$10 (Cooler)</span>
              <span>\$45 (Casual)</span>
              <span>\$120 (Dining)</span>
            </div>
          </div>

          <!-- Daily Charging Estimate -->
          <div>
            <label for="chargingCostInput" class="block text-slate-300 font-semibold mb-1">
              Charging Per Day: <span class="text-sky-400 font-bold">\${{ chargingPerDay }}</span>
            </label>
            <input
              id="chargingCostInput"
              type="range"
              min="5"
              max="60"
              step="5"
              [(ngModel)]="chargingPerDay"
              class="w-full accent-sky-500 bg-slate-950 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>\$5 (Slow / Free)</span>
              <span>\$25 (~200 mi)</span>
              <span>\$60 (~450 mi)</span>
            </div>
          </div>

          <!-- Daily Shower / Hygiene Cost -->
          <div>
            <label for="showerCostInput" class="block text-slate-300 font-semibold mb-1">
              Showers / Misc Per Day: <span class="text-amber-400 font-bold">\${{ showerPerDay }}</span>
            </label>
            <input
              id="showerCostInput"
              type="range"
              min="0"
              max="25"
              step="1"
              [(ngModel)]="showerPerDay"
              class="w-full accent-amber-500 bg-slate-950 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>\$0 (Gym Pass)</span>
              <span>\$12 (Truck Stop)</span>
              <span>\$25 (Day Pass)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Three Scenarios Comparison -->
      <section class="space-y-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300 px-1">
          Three Camping Scenarios
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Scenario 1: Low (Ultra Budget) -->
          <div class="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/20 space-y-3 flex flex-col justify-between">
            <div class="space-y-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                Low Tier
              </span>
              <h3 class="text-sm font-bold text-white">Barebones Camper</h3>
              <p class="text-[11px] text-slate-400 leading-snug">
                100% free overnight parking (BLM, Walmart), Planet Fitness Black Card showers, sub-trunk grocery cooking, off-peak Supercharging.
              </p>
            </div>
            <div class="border-t border-emerald-500/20 pt-2 space-y-1">
              <div class="text-lg font-black text-emerald-300">\${{ lowTotal }}</div>
              <div class="text-[10px] text-slate-400">\${{ lowDaily }}/day average</div>
            </div>
          </div>

          <!-- Scenario 2: Mid (Balanced) -->
          <div class="glass-panel rounded-2xl p-4 border border-sky-500/30 bg-sky-950/20 space-y-3 flex flex-col justify-between">
            <div class="space-y-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 uppercase">
                Mid Tier (Custom)
              </span>
              <h3 class="text-sm font-bold text-white">Balanced Explorer</h3>
              <p class="text-[11px] text-slate-400 leading-snug">
                Calculated directly from your sliders above: cooler meals plus local cafes, travel center showers, standard Supercharging rates.
              </p>
            </div>
            <div class="border-t border-sky-500/20 pt-2 space-y-1">
              <div class="text-lg font-black text-sky-300">\${{ midTotal }}</div>
              <div class="text-[10px] text-slate-400">\${{ midDaily }}/day average</div>
            </div>
          </div>

          <!-- Scenario 3: Comfortable (Luxury Camper) -->
          <div class="glass-panel rounded-2xl p-4 border border-purple-500/30 bg-purple-950/20 space-y-3 flex flex-col justify-between">
            <div class="space-y-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 uppercase">
                Comfortable Tier
              </span>
              <h3 class="text-sm font-bold text-white">Comfort Cruiser</h3>
              <p class="text-[11px] text-slate-400 leading-snug">
                RV hookup campsite every 3rd night (\$35/night), restaurant dinners, unrestricted Supercharging, full park entry passes.
              </p>
            </div>
            <div class="border-t border-purple-500/20 pt-2 space-y-1">
              <div class="text-lg font-black text-purple-300">\${{ comfortableTotal }}</div>
              <div class="text-[10px] text-slate-400">\${{ comfortableDaily }}/day average</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Itemized Breakdown (For Mid Scenario) -->
      <section class="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-300">
          Itemized Estimate for {{ days }} Days
        </h2>

        <div class="space-y-2 text-xs">
          <div class="flex justify-between py-1.5 border-b border-slate-800/80">
            <span class="text-slate-400">Overnight Lodging (Free Tesla Boondocking):</span>
            <span class="font-bold text-emerald-400">\$0 (100% Free)</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-800/80">
            <span class="text-slate-400">Food & Groceries ({{ days }} x \${{ foodPerDay }}):</span>
            <span class="font-bold text-slate-200">\${{ days * foodPerDay }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-800/80">
            <span class="text-slate-400">Supercharging & Overnight Climate ({{ days }} x \${{ chargingPerDay }}):</span>
            <span class="font-bold text-slate-200">\${{ days * chargingPerDay }}</span>
          </div>
          <div class="flex justify-between py-1.5 border-b border-slate-800/80">
            <span class="text-slate-400">Showers & Travel Center Amenities ({{ days }} x \${{ showerPerDay }}):</span>
            <span class="font-bold text-slate-200">\${{ days * showerPerDay }}</span>
          </div>
          <div class="flex justify-between py-2 text-sm font-extrabold text-white pt-2">
            <span>Estimated Grand Total:</span>
            <span class="text-emerald-400">\${{ midTotal }}</span>
          </div>
        </div>
      </section>

      <!-- Budget Pro Tips -->
      <section class="glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-900/40 space-y-2 text-xs text-slate-400">
        <h3 class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
          <span>💡</span>
          <span>Tesla Camping Cost Savers</span>
        </h3>
        <p class="leading-relaxed">
          - <strong>Overnight Climate:</strong> Keep Climate On consumes ~8-15 kWh overnight, costing only \$2.50 to \$4.50 depending on local electricity rates, versus \$120+ for roadside motels.
        </p>
        <p class="leading-relaxed">
          - <strong>Planet Fitness Black Card:</strong> For \$25/month, you unlock nationwide access to hot showers, clean locker rooms, and massage chairs in almost every mid-sized city.
        </p>
      </section>
    </div>
  `
})
export class BudgetComponent {
  public days: number = 7;
  public foodPerDay: number = 30;
  public chargingPerDay: number = 20;
  public showerPerDay: number = 5;

  get midDaily(): number {
    return Number(this.foodPerDay) + Number(this.chargingPerDay) + Number(this.showerPerDay);
  }

  get midTotal(): number {
    return this.days * this.midDaily;
  }

  get lowDaily(): number {
    // Ultra-budget: $15 food + $14 charging + $0 showers (PF pass)
    return 29;
  }

  get lowTotal(): number {
    return this.days * this.lowDaily;
  }

  get comfortableDaily(): number {
    // Luxury: $55 food + $28 charging + $12 RV campsite / state park allocation
    return 95;
  }

  get comfortableTotal(): number {
    return this.days * this.comfortableDaily;
  }
}
