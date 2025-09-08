import { peFundsDatabase } from '../data/peFunds';
import { discoverDynamicFunds, isDynamicDiscoveryAvailable } from './dynamicFundDiscovery';

const calculateMatchScore = (companyProfile, fund) => {
  let score = 0;
  let maxScore = 0;

  const industry = companyProfile.industry?.toLowerCase() || '';
  const size = companyProfile.companySize?.toLowerCase() || '';
  const stage = companyProfile.growthStage?.toLowerCase() || '';

  maxScore += 40;
  if (fund.focusIndustries.some(fundIndustry => 
    industry.includes(fundIndustry.toLowerCase()) || 
    fundIndustry.toLowerCase().includes(industry)
  )) {
    score += 40;
  }

  maxScore += 25;
  if (fund.preferredSize.includes(size)) {
    score += 25;
  }

  maxScore += 20;
  if (fund.stage.includes(stage)) {
    score += 20;
  }

  maxScore += 15;
  if (companyProfile.products && companyProfile.products.length > 0) {
    const hasRelevantProducts = companyProfile.products.some(product => 
      fund.focusIndustries.some(industry => 
        product.toLowerCase().includes(industry.toLowerCase()) ||
        industry.toLowerCase().includes(product.toLowerCase())
      )
    );
    if (hasRelevantProducts) {
      score += 15;
    }
  }

  return Math.round((score / maxScore) * 100);
};

const getLocationScore = (companyProfile, fund) => {
  const companyLocation = companyProfile.location?.toLowerCase() || '';
  
  if (fund.location.includes('Global')) return 10;
  
  if (companyLocation.includes('us') || companyLocation.includes('united states') || 
      companyLocation.includes('usa') || companyLocation.includes('america')) {
    return fund.location.includes('North America') ? 10 : 0;
  }
  
  if (companyLocation.includes('canada')) {
    return fund.location.includes('North America') ? 10 : 0;
  }
  
  if (companyLocation.includes('europe') || companyLocation.includes('uk') || 
      companyLocation.includes('germany') || companyLocation.includes('france')) {
    return fund.location.includes('Europe') ? 10 : 0;
  }
  
  return 5;
};

const addBusinessModelBonus = (companyProfile, fund, baseScore) => {
  const businessModel = companyProfile.businessModel?.toLowerCase() || '';
  
  if (businessModel.includes('saas') || businessModel.includes('software')) {
    if (fund.focusIndustries.includes('software') || fund.focusIndustries.includes('SaaS')) {
      return Math.min(baseScore + 15, 100);
    }
  }
  
  if (businessModel.includes('b2b')) {
    if (fund.focusIndustries.includes('business services') || 
        fund.focusIndustries.includes('technology')) {
      return Math.min(baseScore + 10, 100);
    }
  }
  
  return baseScore;
};

/**
 * Score and process a list of funds
 */
const scoreFunds = (funds, companyProfile) => {
  return funds.map(fund => {
    let matchScore = calculateMatchScore(companyProfile, fund);
    
    const locationScore = getLocationScore(companyProfile, fund);
    matchScore += locationScore;
    
    matchScore = addBusinessModelBonus(companyProfile, fund, matchScore);
    
    matchScore = Math.min(matchScore, 100);
    
    return {
      ...fund,
      matchScore,
      reasons: generateMatchReasons(companyProfile, fund, matchScore)
    };
  });
};

/**
 * Hybrid matching function that combines static and dynamic funds
 */
export const matchPEFunds = async (companyProfile, options = {}) => {
  const {
    enableDynamicDiscovery = true,
    maxStaticResults = 8,
    maxDynamicResults = 10,
    maxTotalResults = 12,
    minMatchScore = 30
  } = options;
  
  const allFunds = [];
  const discoveryErrors = [];
  
  // 1. Score static funds from our curated database
  const staticFunds = scoreFunds(peFundsDatabase, companyProfile);
  const topStaticFunds = staticFunds
    .filter(fund => fund.matchScore >= minMatchScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxStaticResults);
    
  allFunds.push(...topStaticFunds);
  
  // 2. Discover dynamic funds if enabled and available
  if (enableDynamicDiscovery && isDynamicDiscoveryAvailable().hasAnySource) {
    try {
      const dynamicResult = await discoverDynamicFunds(companyProfile, {
        maxResults: maxDynamicResults
      });
      
      if (dynamicResult.funds.length > 0) {
        const scoredDynamicFunds = scoreFunds(dynamicResult.funds, companyProfile);
        const topDynamicFunds = scoredDynamicFunds
          .filter(fund => fund.matchScore >= minMatchScore)
          .sort((a, b) => b.matchScore - a.matchScore);
          
        allFunds.push(...topDynamicFunds);
      }
      
      if (dynamicResult.errors.length > 0) {
        discoveryErrors.push(...dynamicResult.errors);
      }
      
    } catch (error) {
      discoveryErrors.push({
        source: 'Dynamic Discovery',
        error: error.message,
        type: 'discovery-failure'
      });
    }
  }
  
  // 3. Combine and deduplicate results
  const uniqueFunds = [];
  const seenNames = new Set();
  
  // Sort all funds by match score first
  allFunds.sort((a, b) => b.matchScore - a.matchScore);
  
  for (const fund of allFunds) {
    const normalizedName = fund.name.toLowerCase().trim();
    if (!seenNames.has(normalizedName)) {
      seenNames.add(normalizedName);
      uniqueFunds.push(fund);
      
      if (uniqueFunds.length >= maxTotalResults) break;
    }
  }
  
  // 4. Return results with metadata
  return {
    funds: uniqueFunds,
    metadata: {
      staticCount: topStaticFunds.length,
      dynamicCount: allFunds.length - topStaticFunds.length,
      totalDiscovered: allFunds.length,
      errors: discoveryErrors,
      discoveryEnabled: enableDynamicDiscovery && isDynamicDiscoveryAvailable().hasAnySource,
      sources: {
        static: uniqueFunds.filter(f => f.source === 'static').length,
        aiGenerated: uniqueFunds.filter(f => f.source === 'ai-generated').length,
        external: uniqueFunds.filter(f => f.source && f.source !== 'static' && f.source !== 'ai-generated').length
      }
    }
  };
};

/**
 * Legacy function for backward compatibility (synchronous static-only matching)
 */
export const matchPEFundsSync = (companyProfile) => {
  const scoredFunds = scoreFunds(peFundsDatabase, companyProfile);
  
  const sortedFunds = scoredFunds
    .sort((a, b) => b.matchScore - a.matchScore)
    .filter(fund => fund.matchScore >= 30)
    .slice(0, 8);

  return sortedFunds;
};

const generateMatchReasons = (companyProfile, fund, score) => {
  const reasons = [];
  
  const industry = companyProfile.industry?.toLowerCase() || '';
  if (fund.focusIndustries.some(fundIndustry => 
    industry.includes(fundIndustry.toLowerCase()) || 
    fundIndustry.toLowerCase().includes(industry)
  )) {
    reasons.push(`Strong industry alignment (${companyProfile.industry})`);
  }
  
  const size = companyProfile.companySize?.toLowerCase() || '';
  if (fund.preferredSize.includes(size)) {
    reasons.push(`Matches preferred company size (${companyProfile.companySize})`);
  }
  
  const stage = companyProfile.growthStage?.toLowerCase() || '';
  if (fund.stage.includes(stage)) {
    reasons.push(`Appropriate growth stage (${companyProfile.growthStage})`);
  }
  
  if (score >= 70) {
    reasons.push('Excellent strategic fit');
  } else if (score >= 50) {
    reasons.push('Good strategic alignment');
  } else if (score >= 30) {
    reasons.push('Potential fit worth exploring');
  }
  
  return reasons;
};