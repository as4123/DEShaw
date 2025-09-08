import OpenAI from 'openai';
import { matchPEFunds } from './peFundMatcher';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const fetchWebsiteContent = async (url) => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('Could not fetch website content');
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    const title = doc.querySelector('title')?.textContent || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map(h => h.textContent).join(' ');
    const paragraphs = Array.from(doc.querySelectorAll('p')).slice(0, 10).map(p => p.textContent).join(' ');
    
    return {
      title,
      metaDescription,
      headings,
      content: paragraphs,
      url
    };
  } catch (error) {
    throw new Error(`Failed to fetch website content: ${error.message}`);
  }
};

const analyzeWithOpenAI = async (websiteData) => {
  const prompt = `
    Analyze this company website and extract key information. Provide the response in JSON format:

    Website: ${websiteData.url}
    Title: ${websiteData.title}
    Description: ${websiteData.metaDescription}
    Headings: ${websiteData.headings}
    Content: ${websiteData.content.substring(0, 2000)}

    Extract and return a JSON object with the following structure:
    {
      "companyName": "Company name",
      "industry": "Primary industry/sector",
      "location": "Geographic location (city, state/country)",
      "companySize": "estimated size (micro/small/medium based on content)",
      "products": ["list of main products/services"],
      "businessModel": "B2B/B2C/B2B2C/marketplace etc",
      "yearEstablished": "estimated founding year if available",
      "revenue": "estimated revenue range if inferrable",
      "keyStrengths": ["list of competitive advantages"],
      "targetMarket": "description of target customers",
      "growthStage": "startup/growth/mature",
      "digitalPresence": "assessment of online presence strength"
    }

    Be specific and factual. If information isn't available, use "Not available" or make reasonable inferences marked as "estimated".
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert business analyst specializing in company profiling for private equity evaluation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const analysis = response.choices[0].message.content;
    
    try {
      const jsonStart = analysis.indexOf('{');
      const jsonEnd = analysis.lastIndexOf('}') + 1;
      const jsonStr = analysis.substring(jsonStart, jsonEnd);
      return JSON.parse(jsonStr);
    } catch (parseError) {
      throw new Error('Failed to parse AI analysis response');
    }
  } catch (error) {
    throw new Error(`OpenAI analysis failed: ${error.message}`);
  }
};

export const analyzeWebsite = async (url) => {
  try {
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please add REACT_APP_OPENAI_API_KEY to your environment variables.');
    }

    const websiteContent = await fetchWebsiteContent(url);
    const companyProfile = await analyzeWithOpenAI(websiteContent);
    const matchingFunds = matchPEFunds(companyProfile);

    return {
      companyProfile,
      matchingFunds,
      analysisDate: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
};