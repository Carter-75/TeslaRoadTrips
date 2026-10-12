/**
 * Bulk Import JSON Format Documentation:
 * 
 * To bulk-import verified or community spots into MongoDB, format your JSON file as an array of objects:
 * [
 *   {
 *     "name": "Cracker Barrel Old Country Store #482",
 *     "state": "UT",
 *     "city": "St. George",
 *     "lat": 37.0792,
 *     "lng": -113.5841,
 *     "notes": "Dedicated rear RV/van parking spaces. Quiet after 10 PM. 1.2 miles to St. George 250 kW Supercharger.",
 *     "verificationLevel": "verified",
 *     "source": "Tesla Road Trippers Community 2026"
 *   }
 * ]
 * 
 * You can load this via Node.js script:
 *   const Spot = require('./models/spot');
 *   await Spot.insertMany(JSON.parse(fs.readFileSync('verified_spots.json', 'utf8')));
 * or via MongoDB CLI:
 *   mongoimport --uri "<MONGODB_URI>" --collection spots --file verified_spots.json --jsonArray
 */

const Spot = require('../models/spot');

const initialSpots = [
  {
    name: 'Walmart Supercenter #1097',
    state: 'AZ',
    city: 'Flagstaff',
    lat: 35.1983,
    lng: -111.6513,
    notes: 'High altitude (7,000 ft) mountain stop near Grand Canyon. Perimeter parking alongside garden center. 24h store access for clean restrooms. 3 miles from Flagstaff Supercharger.',
    verificationLevel: 'unverified',
    source: 'Overnight Parking Directory'
  },
  {
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
    name: 'BLM Indian Cove Dispersed Area',
    state: 'CA',
    city: 'Twentynine Palms',
    lat: 34.0863,
    lng: -116.1662,
    notes: 'Public Bureau of Land Management dispersed camping north of Joshua Tree boundary. Unmatched stargazing through the glass roof. Arrive with 50%+ battery for overnight HVAC. 8 miles from Supercharger.',
    verificationLevel: 'unverified',
    source: 'BLM Public Lands Map'
  },
  {
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
    name: 'BLM Lone Rock Beach Dispersed Recreation',
    state: 'AZ',
    city: 'Page',
    lat: 37.0189,
    lng: -111.5369,
    notes: 'Spectacular lakefront dispersed camping on BLM/Glen Canyon land. Compacted sandy access (stick to packed paths). 9 miles to Page AZ V3 Supercharger.',
    verificationLevel: 'unverified',
    source: 'BLM Recreation Registry'
  },
  {
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
    name: 'Cracker Barrel Old Country Store #195',
    state: 'TN',
    city: 'Pigeon Forge',
    lat: 35.8087,
    lng: -83.5674,
    notes: 'Smoky Mountains national park gateway. Quiet parking on side lot. Community recreation center 3 miles away offers $5 hot showers. 5 miles to Sevierville Supercharger.',
    verificationLevel: 'unverified',
    source: 'Smoky Mtns EV Guild'
  },
  {
    name: 'BLM Buffalo Gap National Grassland (The Wall Rim)',
    state: 'SD',
    city: 'Wall',
    lat: 43.9856,
    lng: -102.2423,
    notes: 'Jaw-dropping rim view overlooking Badlands National Park. Free dispersed camping on federal grassland. Arrive before sunset. 5.5 miles from Wall SD Supercharger.',
    verificationLevel: 'unverified',
    source: 'USFS / BLM Public Land Database'
  }
];

async function seedSpotsIfEmpty() {
  try {
    const count = await Spot.countDocuments();
    if (count === 0) {
      console.log('INFO: Seeding initial 10 unverified Tesla camping spots...');
      await Spot.insertMany(initialSpots);
      console.log('OK: Successfully seeded initial spots.');
    } else {
      console.log(`INFO: Spots collection already contains ${count} spots. Skipping seed.`);
    }
  } catch (err) {
    console.error('ERROR: Failed to seed spots collection:', err.message);
  }
}

module.exports = {
  initialSpots,
  seedSpotsIfEmpty
};
