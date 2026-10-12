import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      <!-- Top App Bar -->
      <header class="sticky top-0 z-40 bg-[#080b11]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <!-- Tesla Emblem -->
          <div class="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-950/60">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.8 2 17.5 2.4 19.5 3.3C19.9 2.2 20.4 1.2 20.8 0.3C18.2 -0.2 14.8 -0.4 12 -0.4C9.2 -0.4 5.8 -0.2 3.2 0.3C3.6 1.2 4.1 2.2 4.5 3.3C6.5 2.4 10.2 2 12 2ZM12 4.8C10.7 4.8 8.6 5 6.9 5.6V8.2C8.3 7.8 10.3 7.5 11.4 7.5V19.4H12.6V7.5C13.7 7.5 15.7 7.8 17.1 8.2V5.6C15.4 5 13.3 4.8 12 4.8Z"/>
            </svg>
          </div>
          <div>
            <span class="text-sm font-extrabold tracking-tight text-white block leading-none">
              Tesla Camp Planner
            </span>
            <span class="text-[10px] text-slate-400 font-medium">Free Overnight EV Trips</span>
          </div>
        </div>

        <!-- Connection State & Mode Indicator -->
        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border"
            [ngClass]="isOnline() ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'"
          >
            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="isOnline() ? 'bg-emerald-400' : 'bg-amber-400'"></span>
            {{ isOnline() ? 'Online' : 'Offline Mode' }}
          </span>
        </div>
      </header>

      <!-- Main Content Outlet -->
      <main class="flex-1 w-full max-w-2xl mx-auto">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Tab Bar Navigation (Mobile-First, Installable App Style) -->
      <nav class="fixed bottom-0 left-0 right-0 z-50 glass-nav bg-[#080b11]/95 backdrop-blur-xl border-t border-slate-800/90 pb-[env(safe-area-inset-bottom,10px)]">
        <div class="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5">
          <!-- Tab 1: Plan -->
          <a
            routerLink="/plan"
            routerLinkActive="text-red-500 font-bold"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all group"
          >
            <span class="text-base group-hover:scale-110 transition-transform">⚡</span>
            <span class="text-[10px] mt-0.5 tracking-tight">Plan</span>
          </a>

          <!-- Tab 2: My Trips -->
          <a
            routerLink="/my-trips"
            routerLinkActive="text-red-500 font-bold"
            class="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all group"
          >
            <span class="text-base group-hover:scale-110 transition-transform">🎒</span>
            <span class="text-[10px] mt-0.5 tracking-tight">My Trips</span>
          </a>

          <!-- Tab 3: Spots -->
          <a
            routerLink="/spots"
            routerLinkActive="text-red-500 font-bold"
            class="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all group"
          >
            <span class="text-base group-hover:scale-110 transition-transform">📍</span>
            <span class="text-[10px] mt-0.5 tracking-tight">Spots</span>
          </a>

          <!-- Tab 4: Guides -->
          <a
            routerLink="/guides"
            routerLinkActive="text-red-500 font-bold"
            class="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all group"
          >
            <span class="text-base group-hover:scale-110 transition-transform">📖</span>
            <span class="text-[10px] mt-0.5 tracking-tight">Guides</span>
          </a>

          <!-- Tab 5: Budget -->
          <a
            routerLink="/budget"
            routerLinkActive="text-red-500 font-bold"
            class="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition-all group"
          >
            <span class="text-base group-hover:scale-110 transition-transform">💰</span>
            <span class="text-[10px] mt-0.5 tracking-tight">Budget</span>
          </a>
        </div>
      </nav>
    </div>
  `
})
export class App implements OnInit {
  public isOnline = signal<boolean>(true);

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.isOnline.set(navigator.onLine);
      window.addEventListener('online', () => this.isOnline.set(true));
      window.addEventListener('offline', () => this.isOnline.set(false));
    }
  }
}
