/**
 * Scoring Service
 * SLC Criteria - Software, Licensing, and Compliance
 */

// SLC Criteria - Software, Licensing, and Compliance
const slcCriteria = {
  slc1: {
    name: 'SLC1: Software Ownership',
    weight: 1,
    options: {
      'ngo': { label: 'Non-Governmental Organization (NGO)', score: 3 },
      'go': { label: 'Governmental Organization (GO)', score: 2 },
      'po': { label: 'Private Organization (PO)', score: 1 }
    }
  },
  slc2: {
    name: 'SLC2: Software Country of Origin',
    weight: 1,
    options: {
      'whitelist': { label: 'White-list Country', score: 10 },
      'greylist': { label: 'Grey-list Country', score: 5 },
      'blacklist': { label: 'Black-list Country', score: 1 }
    }
  },
  slc3: {
    name: 'SLC3: Software License',
    weight: 1,
    options: {
      'public_domain': { label: 'Public Domain', score: 5 },
      'permissive': { label: 'Permissive (MIT, Apache, BSD)', score: 4 },
      'lgpl': { label: 'LGPL/Intermediate', score: 3 },
      'copyleft': { label: 'Copyleft (GPL)', score: 2 },
      'proprietary': { label: 'Commercial/Proprietary', score: 1 }
    }
  },
  slc5: {
    name: 'SLC5: Update Frequency (months)',
    weight: 1,
    type: 'number',
    min: 0,
    max: 12,
    description: 'Average months between updates (0-12, rounded)'
  },
  slc33: {
    name: 'SLC33: Data Country of Origin',
    weight: 1,
    options: {
      'whitelist': { label: 'White-list Country', score: 10 },
      'greylist': { label: 'Grey-list Country', score: 5 },
      'blacklist': { label: 'Black-list Country', score: 1 }
    }
  },
  slc34: {
    name: 'SLC34: Data License',
    weight: 1,
    options: {
      'public_domain': { label: 'Public Domain', score: 5 },
      'permissive': { label: 'Permissive', score: 4 },
      'lgpl': { label: 'LGPL/Intermediate', score: 3 },
      'copyleft': { label: 'Copyleft', score: 2 },
      'proprietary': { label: 'Commercial/Proprietary', score: 1 }
    }
  },
  slc11: {
    name: 'SLC11: Community and Ecosystem',
    weight: 1,
    options: {
      'huge': { label: '>100k contributors (Widespread use)', score: 4 },
      'large': { label: '>10k contributors (Industry-supported)', score: 3 },
      'medium': { label: '>1k contributors (Research/University)', score: 2 },
      'small': { label: '<1k contributors (Private project)', score: 1 }
    }
  },
  slc12: {
    name: 'SLC12: Regulatory and Legal Compliance',
    weight: 1,
    options: {
      'comprehensive_maintained': { label: 'Comprehensive analysis (maintained)', score: 5 },
      'comprehensive': { label: 'Comprehensive analysis (not maintained)', score: 4 },
      'partial_maintained': { label: 'Partial analysis (maintained)', score: 3 },
      'partial': { label: 'Partial analysis (not maintained)', score: 2 },
      'none': { label: 'No compliance analysis', score: 1 }
    }
  },
  slc13: {
    name: 'SLC13: Funding and Sustainability',
    weight: 1,
    options: {
      'no_funding': { label: 'No funding needed', score: 4 },
      'unaligned': { label: 'Has unaligned funding', score: 3 },
      'aligned': { label: 'Has company-aligned funding', score: 2 },
      'none': { label: 'No funding (needed)', score: 1 }
    }
  },
  slc16: {
    name: 'SLC16: Interoperability',
    weight: 1,
    options: {
      'enterprise': { label: 'Enterprise/Universal', score: 5 },
      'domain': { label: 'Domain/Integrated', score: 4 },
      'functional': { label: 'Functional/Distributed', score: 3 },
      'connected': { label: 'Connected/Peer-to-Peer', score: 2 },
      'isolated': { label: 'Isolated/Manual', score: 1 }
    }
  },
  slc17: {
    name: 'SLC17: Development Processes',
    weight: 1,
    options: {
      'all_known': { label: 'All processes known', score: 4 },
      'most_known': { label: 'Most processes known', score: 3 },
      'most_unknown': { label: 'Most processes unknown', score: 2 },
      'all_unknown': { label: 'All processes unknown', score: 1 }
    }
  },
  slc23: {
    name: 'SLC23: AI Model Retraining',
    weight: 1,
    options: {
      'internal': { label: 'Completely internally trained', score: 3 },
      'retrained': { label: 'Retrained pre-trained model', score: 2 },
      'external': { label: 'Externally trained model', score: 1 }
    }
  },
  slc24: {
    name: 'SLC24: External APIs and Services',
    weight: 1,
    options: {
      'one': { label: '1 dependency', score: 4 },
      'few': { label: '2-4 dependencies', score: 3 },
      'some': { label: '5-9 dependencies', score: 2 },
      'many': { label: '≥10 dependencies', score: 1 }
    }
  },
  slc25: {
    name: 'SLC25: Explainability',
    weight: 1,
    options: {
      'whitebox': { label: 'White/Grey-box (explainable)', score: 3 },
      'blackbox_external': { label: 'Black-box (externally explainable)', score: 2 },
      'blackbox_consistent': { label: 'Black-box (consistent output)', score: 1 },
      'blackbox_opaque': { label: 'Black-box (not explainable)', score: 0 }
    }
  }
};

/**
 * Calculate the sovereignty score based on criteria selections
 * @param {Object} criteria - User selections for each criterion
 * @returns {Object} - Score breakdown and total
 */
function calculateScore(criteria) {
  let slcScore = 0;
  let slcMaxScore = 0;
  
  const slcDetails = {};

  // Calculate SLC criteria score
  for (const [key, criterion] of Object.entries(slcCriteria)) {
    const userSelection = criteria[key];
    
    // Handle numeric input for SLC5
    if (criterion.type === 'number' && userSelection !== undefined && userSelection !== '') {
      const numValue = Math.min(Math.max(parseFloat(userSelection), criterion.min), criterion.max);
      const score = numValue * criterion.weight;
      slcScore += score;
      slcDetails[key] = {
        name: criterion.name,
        selection: `${numValue} months`,
        score: score
      };
      slcMaxScore += criterion.max * criterion.weight;
    } else if (userSelection && criterion.options && criterion.options[userSelection]) {
      const score = criterion.options[userSelection].score * criterion.weight;
      slcScore += score;
      slcDetails[key] = {
        name: criterion.name,
        selection: criterion.options[userSelection].label,
        score: score
      };
      // Find max score for this criterion
      const maxOptionScore = Math.max(...Object.values(criterion.options).map(opt => opt.score));
      slcMaxScore += maxOptionScore * criterion.weight;
    } else if (criterion.options) {
      // Add to max score even if not selected
      const maxOptionScore = Math.max(...Object.values(criterion.options).map(opt => opt.score));
      slcMaxScore += maxOptionScore * criterion.weight;
    }
  }

  const totalScore = slcScore;
  const maxScore = slcMaxScore;
  const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    totalScore,
    maxScore,
    percentageScore: Math.round(percentageScore * 10) / 10,
    slc: {
      score: slcScore,
      maxScore: slcMaxScore,
      percentage: slcMaxScore > 0 ? Math.round((slcScore / slcMaxScore) * 1000) / 10 : 0,
      details: slcDetails
    },
    rating: getSovereigntyRating(percentageScore)
  };
}

/**
 * Get sovereignty rating based on percentage score
 */
function getSovereigntyRating(percentage) {
  if (percentage >= 90) return 'Excellent Sovereignty';
  if (percentage >= 75) return 'High Sovereignty';
  if (percentage >= 60) return 'Moderate Sovereignty';
  if (percentage >= 40) return 'Low Sovereignty';
  return 'Very Low Sovereignty';
}

/**
 * Get criteria definitions for frontend
 */
function getCriteriaDefinitions() {
  return {
    slc: slcCriteria
  };
}

module.exports = {
  calculateScore,
  getCriteriaDefinitions,
  slcCriteria
};
