import { peFundsDatabase } from '../data/peFunds';

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

export const matchPEFunds = (companyProfile) => {
  const scoredFunds = peFundsDatabase.map(fund => {
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

  const sortedFunds = scoredFunds
    .sort((a, b) => b.matchScore - a.matchScore)
    .filter(fund => fund.matchScore >= 30)
    .slice(0, 6);

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