const OpenAI = require('openai');

function getAiClient() {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const baseURL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
  return new OpenAI({
    apiKey: apiKey.trim(),
    baseURL: baseURL.trim()
  });
}

const SYSTEM_PROMPT = `You are Tesla Camp Planner, the premier master expert on Tesla camping and road trips.
You specialize in free overnight parking itineraries (BLM dispersed public lands, national forests, select Walmarts, Cracker Barrels, Cabela's, and highway rest areas) combined with Tesla Camp Mode and Keep Climate On.

Tesla Camping Guidelines:
1. Sleeping Routine: Recommend Keep Climate On + Sentry Mode (or Camp Mode with manual lock check). Note that climate control typically consumes 8 to 18 kWh overnight depending on ambient weather.
2. Shower Option Every Day: Every single day must specify an accessible, realistic shower solution (e.g., Planet Fitness Black Card nationwide clubs, Pilot/Flying J/Love's private truck stop showers, state park facilities, or municipal rec centers).
3. Food Plan: Include a daily food strategy (cooler prep in the sub-trunk or frunk, 12V / portable inverter electric cooking, grocery restock, or affordable local food stops).
4. Charging & Buffer Guidance: Include exact charging stops with buffer guidance. Crucial rule: advise arriving at the overnight boondocking campsite with 45 to 55 percent state of charge (SoC) so the vehicle can easily power overnight climate (8-18 kWh) and still have 20 percent or more SoC upon waking to reach the next Supercharger.
5. Budget: Include a realistic estimated cost per day and total trip cost.
6. Strict Copy Rule: Never use em dashes anywhere in your text. Always use hyphens, colons, commas, or parentheses instead.

You MUST respond strictly with a valid JSON object (no markdown fence, or pure JSON inside \`\`\`json block) adhering to this schema:
{
  "summary": "Short 2 to 3 sentence trip overview",
  "totalEstimatedCost": 150,
  "climateTips": "Route-specific climate and battery buffer recommendation",
  "days": [
    {
      "day": 1,
      "title": "Descriptive day headline",
      "routeSummary": "Start to Destination (miles and highways)",
      "overnightSpot": "Name and location of free overnight parking spot",
      "shower": "Specific shower venue and expected cost or membership",
      "foodPlan": "Practical meals and grocery advice",
      "chargingPlan": "Supercharging stops and campsite arrival battery percentage target (45-55% SoC)",
      "costs": 25
    }
  ]
}`;

async function generateTeslaTripPlan(userPrompt) {
  const client = getAiClient();
  if (!client) {
    const error = new Error('AI_NOT_CONFIGURED');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }

  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  const response = await client.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Please plan this Tesla camping road trip: "${userPrompt}"` }
    ],
    temperature: 0.7,
    max_tokens: 3000
  });

  const rawContent = response.choices?.[0]?.message?.content?.trim() || '';

  // Extract JSON if wrapped in markdown code fences
  let cleanJson = rawContent;
  if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleanJson);
    
    // Ensure days array exists
    if (!parsed.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error('Invalid itinerary format: missing days array');
    }

    // Strip any unexpected em dashes just in case
    const sanitizeText = (text) => {
      if (typeof text !== 'string') return text;
      return text.replace(/[\u2014\u2013]/g, ' - ');
    };

    parsed.summary = sanitizeText(parsed.summary || '');
    parsed.climateTips = sanitizeText(parsed.climateTips || '');
    parsed.days = parsed.days.map((d, index) => ({
      day: d.day || index + 1,
      title: sanitizeText(d.title || `Day ${index + 1}`),
      routeSummary: sanitizeText(d.routeSummary || ''),
      overnightSpot: sanitizeText(d.overnightSpot || ''),
      shower: sanitizeText(d.shower || ''),
      foodPlan: sanitizeText(d.foodPlan || ''),
      chargingPlan: sanitizeText(d.chargingPlan || ''),
      costs: d.costs || 0
    }));

    return parsed;
  } catch (parseErr) {
    console.error('Failed to parse AI response as JSON:', rawContent);
    throw new Error('AI returned an unparseable response. Please try rephrasing your trip request.');
  }
}

module.exports = {
  generateTeslaTripPlan,
  getAiClient
};
