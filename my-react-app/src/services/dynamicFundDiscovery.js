import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Configuration for API sources
export const API_SOURCES = {
  OPENAI_KNOWLEDGE: {
    enabled: true,
    name: 'OpenAI Knowledge Base',
    description: 'Uses AI to generate additional PE fund suggestions based on company profile'
  },
  // Future API integrations can be added here:
  // PITCHBOOK: { enabled: false, name: 'PitchBook API' },
  // CRUNCHBASE: { enabled: false, name: 'Crunchbase API' }
};

/**
 * Generate additional PE funds using OpenAI's knowledge base
 */
const generateAIFundSuggestions = async (companyProfile) => {
  const prompt = `
    Based on this company profile, suggest 10-15 additional private equity funds that would be good matches but are NOT already in this list: Vista Equity Partners, Blackstone, KKR, General Atlantic, Advent International, TPG, Insight Partners, Francisco Partners, Bain Capital, Carlyle Group.

    Company Profile:
    - Industry: ${companyProfile.industry}
    - Size: ${companyProfile.companySize} 
    - Stage: ${companyProfile.growthStage}
    - Location: ${companyProfile.location}
    - Business Model: ${companyProfile.businessModel}
    - Products: ${companyProfile.products?.join(', ')}

    Return ONLY a JSON array with this exact structure (no additional text):
    [
      {
        "name": "Fund Name",
        "focusIndustries": ["industry1", "industry2"],
        "preferredSize": ["small", "medium", or "large"],
        "location": ["North America", "Europe", "Asia", or "Global"],
        "investmentRange": "$XX - $XXX",
        "stage": ["startup", "growth", "mature"],
        "description": "Brief description of fund focus",
        "tier": "venture|middle-market|large-growth|sector-specialist",
        "source": "ai-generated"
      }
    ]

    Focus on real, well-known PE funds that specialize in the company's industry or have a track record in similar investments. Include a mix of fund sizes and specialties.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert in private equity and venture capital with comprehensive knowledge of investment firms worldwide. Return only valid JSON arrays with no additional formatting or text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content.trim();
    
    // Extract JSON from response
    let jsonStart = content.indexOf('[');
    let jsonEnd = content.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No valid JSON array found in response');
    }
    
    const jsonStr = content.substring(jsonStart, jsonEnd);
    const funds = JSON.parse(jsonStr);
    
    // Add unique IDs starting from a high number to avoid conflicts
    return funds.map((fund, index) => ({
      id: 1000 + index, // Start from high number to avoid conflicts with static funds
      ...fund,
      matchScore: 0
    }));
    
  } catch (error) {
    console.error('Error generating AI fund suggestions:', error);
    throw new Error(`AI fund generation failed: ${error.message}`);
  }
};

/**
 * Simulate fetching funds from external APIs (placeholder for future integrations)
 */
const fetchFromExternalAPIs = async (companyProfile) => {
  const externalFunds = [];
  
  // Placeholder for PitchBook API integration
  if (API_SOURCES.PITCHBOOK?.enabled) {
    try {
      // const pitchbookFunds = await fetchPitchbookFunds(companyProfile);
      // externalFunds.push(...pitchbookFunds);
      console.log('PitchBook API integration not yet implemented');
    } catch (error) {
      console.warn('PitchBook API failed:', error.message);
    }
  }
  
  // Placeholder for Crunchbase API integration  
  if (API_SOURCES.CRUNCHBASE?.enabled) {
    try {
      // const crunchbaseFunds = await fetchCrunchbaseFunds(companyProfile);
      // externalFunds.push(...crunchbaseFunds);
      console.log('Crunchbase API integration not yet implemented');
    } catch (error) {
      console.warn('Crunchbase API failed:', error.message);
    }
  }
  
  return externalFunds;
};

/**
 * Main function to discover additional PE funds dynamically
 */
export const discoverDynamicFunds = async (companyProfile, options = {}) => {
  const {
    enableAI = API_SOURCES.OPENAI_KNOWLEDGE.enabled,
    enableExternalAPIs = true,
    maxResults = 15
  } = options;
  
  const discoveredFunds = [];
  const errors = [];
  
  // Generate AI-based fund suggestions
  if (enableAI && process.env.REACT_APP_OPENAI_API_KEY) {
    try {
      const aiFunds = await generateAIFundSuggestions(companyProfile);
      discoveredFunds.push(...aiFunds.slice(0, maxResults));
    } catch (error) {
      errors.push({
        source: 'OpenAI Knowledge',
        error: error.message,
        type: 'ai-generation'
      });
    }
  }
  
  // Fetch from external APIs
  if (enableExternalAPIs) {
    try {
      const externalFunds = await fetchFromExternalAPIs(companyProfile);
      discoveredFunds.push(...externalFunds);
    } catch (error) {
      errors.push({
        source: 'External APIs',
        error: error.message, 
        type: 'external-api'
      });
    }
  }
  
  return {
    funds: discoveredFunds.slice(0, maxResults),
    errors,
    sources: {
      aiGenerated: discoveredFunds.filter(f => f.source === 'ai-generated').length,
      external: discoveredFunds.filter(f => f.source !== 'ai-generated').length
    }
  };
};

/**
 * Check if dynamic fund discovery is available
 */
export const isDynamicDiscoveryAvailable = () => {
  return {
    aiEnabled: API_SOURCES.OPENAI_KNOWLEDGE.enabled && !!process.env.REACT_APP_OPENAI_API_KEY,
    externalEnabled: Object.values(API_SOURCES).some(source => 
      source.enabled && source.name !== 'OpenAI Knowledge Base'
    ),
    hasAnySource: API_SOURCES.OPENAI_KNOWLEDGE.enabled && !!process.env.REACT_APP_OPENAI_API_KEY
  };
};