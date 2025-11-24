import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());

const BALL_DONT_LIE_API_KEY = '6fc7ab52-da6f-49de-a071-4cbf81ff0fe1';
const BASE_URL = 'https://api.balldontlie.io';

// Data stores
let allPlayers = [];
let searchCache = new Map();
let lastAPICallTime = 0;
const RATE_LIMIT_DELAY = 2000; // 2 seconds between API calls
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

console.log('🚀 NBA Dashboard Server Starting...');

// Load initial player data
async function initializePlayerData() {
  try {
    console.log('📥 Initializing player database...');
    
    // Use a longer delay for initial load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(
      `${BASE_URL}/nba/v1/players?per_page=500`,
      { 
        headers: { 
          'Authorization': BALL_DONT_LIE_API_KEY,
          'User-Agent': 'NBA-Dashboard/1.0'
        } 
      }
    );
    
    // Handle non-JSON responses
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.log('❌ API returned non-JSON response during initialization');
      if (responseText.includes('Too many')) {
        console.log('⚠️ Rate limited during initialization, starting with empty database');
        allPlayers = getFallbackPlayers(); // Load some fallback players
        return;
      }
      throw new Error(`API error: ${responseText}`);
    }
    
    if (data.data) {
      allPlayers = data.data;
      console.log(`✅ Loaded ${allPlayers.length} players into local database`);
    }
  } catch (error) {
    console.log('⚠️ Could not load initial player data:', error.message);
    // Load fallback players
    allPlayers = getFallbackPlayers();
  }
}

// Fallback players if API fails
function getFallbackPlayers() {
  return [
    {
      id: 237,
      first_name: "LeBron",
      last_name: "James",
      position: "F",
      height: "6-9",
      weight: "250",
      jersey_number: "23",
      team: {
        id: 14,
        full_name: "Los Angeles Lakers",
        abbreviation: "LAL",
        city: "Los Angeles",
        conference: "West",
        division: "Pacific"
      }
    },
    {
      id: 115,
      first_name: "Stephen",
      last_name: "Curry",
      position: "G",
      height: "6-2",
      weight: "185",
      jersey_number: "30",
      team: {
        id: 10,
        full_name: "Golden State Warriors",
        abbreviation: "GSW",
        city: "Golden State",
        conference: "West",
        division: "Pacific"
      }
    },
    {
      id: 246,
      first_name: "Klay",
      last_name: "Thompson",
      position: "G",
      height: "6-6",
      weight: "220",
      jersey_number: "11",
      team: {
        id: 10,
        full_name: "Golden State Warriors",
        abbreviation: "GSW",
        city: "Golden State",
        conference: "West",
        division: "Pacific"
      }
    }
  ];
}

// Rate-limited API call helper with better error handling
async function makeRateLimitedAPICall(url) {
  const now = Date.now();
  const timeSinceLastCall = now - lastAPICallTime;
  
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastCall));
  }
  
  lastAPICallTime = Date.now();
  const response = await fetch(url, {
    headers: { 
      'Authorization': BALL_DONT_LIE_API_KEY,
      'User-Agent': 'NBA-Dashboard/1.0'
    }
  });
  
  return response;
}

// Local search function
function searchLocalPlayers(searchTerm) {
  const term = searchTerm.toLowerCase().trim();
  
  return allPlayers.filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const reversedName = `${player.last_name} ${player.first_name}`.toLowerCase();
    
    return fullName.includes(term) ||
           reversedName.includes(term) ||
           player.first_name.toLowerCase().includes(term) ||
           player.last_name.toLowerCase().includes(term) ||
           fullName.includes(term.split(' ').reverse().join(' '));
  });
}

// API search function with better error handling
async function searchAPIPlayers(searchTerm) {
  const url = `${BASE_URL}/nba/v1/players?search=${encodeURIComponent(searchTerm)}&per_page=100`;
  
  try {
    const response = await makeRateLimitedAPICall(url);
    
    // Handle non-JSON responses properly
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      if (responseText.includes('Too many requests')) {
        throw new Error('RATE_LIMITED');
      }
      throw new Error(`API returned invalid JSON: ${responseText}`);
    }
    
    if (data.data && data.data.length > 0) {
      // Add new players to local database
      data.data.forEach(newPlayer => {
        if (!allPlayers.find(p => p.id === newPlayer.id)) {
          allPlayers.push(newPlayer);
        }
      });
      
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.log(`❌ API search failed for "${searchTerm}":`, error.message);
    throw error;
  }
}

// Main search endpoint - HYBRID APPROACH
app.get('/api/players/search', async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.json({ 
      error: "Please provide a player name",
      results: 0,
      response: []
    });
  }

  console.log(`🔍 Searching for: "${name}"`);

  try {
    // 1. Check cache first
    const cacheKey = name.toLowerCase().trim();
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for: "${name}"`);
      return res.json(cached);
    }

    // 2. Search local database first
    const localResults = searchLocalPlayers(name);
    if (localResults.length > 0) {
      console.log(`✅ Local search found ${localResults.length} players`);
      
      const result = {
        get: "players",
        parameters: { search: name },
        errors: [],
        results: localResults.length,
        response: localResults,
        source: "local_cache"
      };
      
      // Cache the result
      searchCache.set(cacheKey, result);
      setTimeout(() => searchCache.delete(cacheKey), CACHE_DURATION);
      
      return res.json(result);
    }

    // 3. Fallback to API search (with rate limit handling)
    console.log(`🌐 API search for: "${name}"`);
    const apiResults = await searchAPIPlayers(name);
    
    if (apiResults.length > 0) {
      console.log(`✅ API search found ${apiResults.length} players`);
      
      const result = {
        get: "players",
        parameters: { search: name },
        errors: [],
        results: apiResults.length,
        response: apiResults,
        source: "api_live"
      };
      
      // Cache API results too
      searchCache.set(cacheKey, result);
      setTimeout(() => searchCache.delete(cacheKey), CACHE_DURATION);
      
      return res.json(result);
    }

    // 4. No results found
    console.log(`❌ No players found for: "${name}"`);
    const notFoundResult = {
      get: "players",
      parameters: { search: name },
      errors: ["Player not found"],
      results: 0,
      response: [],
      source: "none"
    };
    
    res.json(notFoundResult);

  } catch (error) {
    console.log(`💥 Search error for "${name}":`, error.message);
    
    // Handle rate limits gracefully
    if (error.message === 'RATE_LIMITED') {
      res.json({
        get: "players",
        parameters: { search: name },
        errors: ["API rate limit exceeded. Please try again in a few seconds."],
        results: 0,
        response: [],
        source: "rate_limited"
      });
    } else {
      res.json({
        get: "players",
        parameters: { search: name },
        errors: ["Service temporarily unavailable. Please try again."],
        results: 0,
        response: [],
        source: "error"
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    playersInDatabase: allPlayers.length,
    cacheSize: searchCache.size,
    uptime: process.uptime()
  });
});

// Initialize and start server
initializePlayerData();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🎯 Server running on port ${PORT}`);
  console.log(`💾 Local database: ${allPlayers.length} players`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});