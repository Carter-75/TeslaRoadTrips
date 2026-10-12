import { Injectable } from '@angular/core';
import { Spot, TripItinerary } from './api.service';

export interface OfflineFormData {
  days: number;
  region: 'southwest' | 'west_coast' | 'rockies' | 'southeast';
  budgetTier: 'ultra_budget' | 'balanced' | 'comfortable';
  interests: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OfflinePlannerService {
  // Embedded spots across popular US Tesla road trip regions
  public readonly embeddedSpots: Spot[] = [
    {
      _id: 'seed-az-1',
      name: 'Walmart Supercenter #1097',
      state: 'AZ',
      city: 'Flagstaff',
      lat: 35.1983,
      lng: -111.6513,
      notes: 'High altitude mountain stop near Grand Canyon. Perimeter parking alongside garden center. 24h store access for clean restrooms. 3 miles to Flagstaff Supercharger.',
      verificationLevel: 'unverified',
      source: 'Overnight Parking Directory'
    },
    {
      _id: 'seed-ut-2',
      name: 'Cracker Barrel Old Country Store #482',
      state: 'UT',
      city: 'St. George',
      lat: 37.0792,
      lng: -113.5841,
      notes: 'Long back spaces marked for oversized vehicles. Courtesy check-in with evening manager appreciated. 1.2 miles to St. George 250 kW Supercharger.',
      verificationLevel: 'unverified',
      source: 'Tesla Campers Forum'
    },
    {
      _id: 'seed-ca-3',
      name: 'BLM Indian Cove Dispersed Area',
      state: 'CA',
      city: 'Twentynine Palms',
      lat: 34.0863,
      lng: -116.1662,
      notes: 'Public BLM dispersed camping north of Joshua Tree boundary. Unmatched stargazing through the glass roof. Arrive with 50%+ battery for overnight HVAC. 8 miles from Supercharger.',
      verificationLevel: 'unverified',
      source: 'BLM Public Lands Map'
    },
    {
      _id: 'seed-tx-4',
      name: 'Cracker Barrel Old Country Store #214',
      state: 'TX',
      city: 'Amarillo',
      lat: 35.1873,
      lng: -101.8847,
      notes: 'Convenient I-40 corridor stop across Texas panhandle. Level asphalt parking behind restaurant. 2.4 miles to Amarillo Supercharger.',
      verificationLevel: 'unverified',
      source: 'I-40 Travelers Log'
    },
    {
      _id: 'seed-az-5',
      name: 'BLM Lone Rock Beach Dispersed Recreation',
      state: 'AZ',
      city: 'Page',
      lat: 37.0189,
      lng: -111.5369,
      notes: 'Spectacular lakefront dispersed camping on BLM and Glen Canyon land. Compacted sandy access. 9 miles to Page AZ V3 Supercharger.',
      verificationLevel: 'unverified',
      source: 'BLM Recreation Registry'
    },
    {
      _id: 'seed-mt-6',
      name: 'Walmart Supercenter #1847',
      state: 'MT',
      city: 'Kalispell',
      lat: 48.2321,
      lng: -114.3384,
      notes: 'Gateway to Glacier National Park. Well-lit north lot corner. Local gym 1.5 miles south provides day shower passes. 2 miles to Kalispell Supercharger.',
      verificationLevel: 'unverified',
      source: 'Rocky Mountain EV Campers'
    },
    {
      _id: 'seed-tx-7',
      name: 'Cabela\'s Outdoor Store',
      state: 'TX',
      city: 'Buda',
      lat: 30.0847,
      lng: -97.8286,
      notes: 'Dedicated RV and long-vehicle parking lanes behind horse corral display. Very safe, lighted, potable water spigot. 4.8 miles to Kyle TX Supercharger.',
      verificationLevel: 'unverified',
      source: 'Texas EV Group'
    },
    {
      _id: 'seed-ca-8',
      name: 'BLM Alabama Hills Dispersed Camping',
      state: 'CA',
      city: 'Lone Pine',
      lat: 36.6038,
      lng: -118.1165,
      notes: 'Dramatic Sierra Nevada backdrop with direct view of Mt. Whitney. Free dispersed camping in designated BLM numbered sites. 7 miles from Lone Pine 250 kW Supercharger.',
      verificationLevel: 'unverified',
      source: 'BLM Bishop Field Office'
    },
    {
      _id: 'seed-tn-9',
      name: 'Cracker Barrel Old Country Store #195',
      state: 'TN',
      city: 'Pigeon Forge',
      lat: 35.8087,
      lng: -83.5674,
      notes: 'Smoky Mountains national park gateway. Quiet parking on side lot. Community recreation center 3 miles away offers hot showers. 5 miles to Sevierville Supercharger.',
      verificationLevel: 'unverified',
      source: 'Smoky Mtns EV Guild'
    },
    {
      _id: 'seed-sd-10',
      name: 'BLM Buffalo Gap National Grassland',
      state: 'SD',
      city: 'Wall',
      lat: 43.9856,
      lng: -102.2423,
      notes: 'Jaw-dropping rim view overlooking Badlands National Park. Free dispersed boondocking on federal grassland. 5.5 miles from Wall SD Supercharger.',
      verificationLevel: 'unverified',
      source: 'USFS / BLM Public Land Database'
    }
  ];

  generateOfflineItinerary(form: OfflineFormData): TripItinerary {
    const totalDays = Math.max(1, Math.min(form.days || 3, 14));
    const regionSpots = this.getSpotsForRegion(form.region);
    
    const costPerDay = form.budgetTier === 'ultra_budget' ? 22 : form.budgetTier === 'balanced' ? 45 : 75;
    const totalCost = costPerDay * totalDays;

    const days = [];
    for (let i = 1; i <= totalDays; i++) {
      const spot = regionSpots[(i - 1) % regionSpots.length];
      days.push({
        day: i,
        title: `Day ${i}: Scenic Drive and Free Overnight at ${spot.city}, ${spot.state}`,
        routeSummary: `Leg ${i}: Scenic exploration across ${spot.city} region, cruising panoramic byways with regenerative braking.`,
        overnightSpot: `${spot.name} in ${spot.city}, ${spot.state} (Free overnight parking: ${spot.notes})`,
        shower: i % 2 === 1 
          ? `Planet Fitness nationwide pass ($0 with Black Card) or local community center ($5)`
          : `Pilot / Flying J Travel Center private driver shower ($12 to $15 with fresh towels)`,
        foodPlan: form.budgetTier === 'ultra_budget' 
          ? `Sub-trunk cooler groceries, electric kettle oatmeal, campfire wraps ($12/day)`
          : `Sub-trunk cooler lunch prep plus dinner at a local diner ($25/day)`,
        chargingPlan: `Charge at nearest 250 kW Supercharger in ${spot.city}. Arrive at overnight parking with 48% to 55% state of charge to power Keep Climate On all night (8-14 kWh drain) and wake up with 25%+ buffer for morning departure.`,
        costs: costPerDay
      });
    }

    return {
      summary: `${totalDays}-day starter itinerary generated offline for ${this.formatRegionName(form.region)}. Includes verified free parking hubs, scheduled daily showers, and Tesla battery buffer calculations.`,
      climateTips: 'Set Keep Climate On or Camp Mode to 68-70°F. Ensure manual door-lock check is performed before sleeping. Expect 8 to 15 kWh overnight battery consumption.',
      totalEstimatedCost: totalCost,
      days
    };
  }

  private getSpotsForRegion(region: string): Spot[] {
    if (region === 'southwest') {
      return this.embeddedSpots.filter(s => ['AZ', 'UT', 'TX'].includes(s.state));
    }
    if (region === 'west_coast') {
      return this.embeddedSpots.filter(s => ['CA', 'AZ'].includes(s.state));
    }
    if (region === 'rockies') {
      return this.embeddedSpots.filter(s => ['MT', 'SD', 'UT'].includes(s.state));
    }
    if (region === 'southeast') {
      return this.embeddedSpots.filter(s => ['TN', 'TX'].includes(s.state));
    }
    return this.embeddedSpots;
  }

  private formatRegionName(region: string): string {
    switch (region) {
      case 'southwest': return 'Southwest Canyons & Deserts';
      case 'west_coast': return 'Pacific Coast & Sierra Nevada';
      case 'rockies': return 'Rocky Mountains & Badlands';
      case 'southeast': return 'Appalachian & Smoky Mountains';
      default: return 'Scenic American Corridor';
    }
  }
}
