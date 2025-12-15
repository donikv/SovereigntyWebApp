/**
 * Scoring Service
 * Based on Tables 1 and 2 from the sovereignty evaluation criteria
 * Extended with SLC criteria
 */

// Table 1: Technology Criteria (Critères technologiques)
const technicalCriteria = {
  dataStorage: {
    name: 'Data Storage Location',
    weight: 1,
    options: {
      'local': { label: 'Local/On-premise', score: 3 },
      'eu': { label: 'European Union', score: 2 },
      'foreign': { label: 'Foreign (non-EU)', score: 1 }
    }
  },
  dataProcessing: {
    name: 'Data Processing Location',
    weight: 1,
    options: {
      'local': { label: 'Local/On-premise', score: 3 },
      'eu': { label: 'European Union', score: 2 },
      'foreign': { label: 'Foreign (non-EU)', score: 1 }
    }
  },
  openSource: {
    name: 'Open Source',
    weight: 1,
    options: {
      'full': { label: 'Fully Open Source', score: 3 },
      'partial': { label: 'Partially Open Source', score: 2 },
      'closed': { label: 'Closed Source', score: 1 }
    }
  },
  interoperability: {
    name: 'Interoperability',
    weight: 1,
    options: {
      'high': { label: 'High (Open Standards)', score: 3 },
      'medium': { label: 'Medium', score: 2 },
      'low': { label: 'Low (Proprietary)', score: 1 }
    }
  },
  encryption: {
    name: 'Encryption',
    weight: 1,
    options: {
      'e2e': { label: 'End-to-End', score: 3 },
      'transit': { label: 'In Transit Only', score: 2 },
      'none': { label: 'None/Weak', score: 1 }
    }
  }
};

// Table 2: Legal/Organizational Criteria (Critères juridiques et organisationnels)
const legalCriteria = {
  providerLocation: {
    name: 'Provider Location',
    weight: 1,
    options: {
      'national': { label: 'National', score: 3 },
      'eu': { label: 'European Union', score: 2 },
      'foreign': { label: 'Foreign (non-EU)', score: 1 }
    }
  },
  dataGovernance: {
    name: 'Data Governance',
    weight: 1,
    options: {
      'gdpr_full': { label: 'GDPR Compliant (Full)', score: 3 },
      'gdpr_partial': { label: 'GDPR Compliant (Partial)', score: 2 },
      'non_compliant': { label: 'Non-Compliant', score: 1 }
    }
  },
  contractualControl: {
    name: 'Contractual Control',
    weight: 1,
    options: {
      'full': { label: 'Full Control', score: 3 },
      'shared': { label: 'Shared Control', score: 2 },
      'limited': { label: 'Limited Control', score: 1 }
    }
  },
  auditability: {
    name: 'Auditability',
    weight: 1,
    options: {
      'full': { label: 'Full Transparency', score: 3 },
      'partial': { label: 'Partial Transparency', score: 2 },
      'opaque': { label: 'Opaque', score: 1 }
    }
  },
  certifications: {
    name: 'Security Certifications',
    weight: 1,
    options: {
      'multiple': { label: 'Multiple EU Certifications', score: 3 },
      'some': { label: 'Some Certifications', score: 2 },
      'none': { label: 'No Certifications', score: 1 }
    }
  }
};

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
  let technicalScore = 0;
  let technicalMaxScore = 0;
  let legalScore = 0;
  let legalMaxScore = 0;
  let slcScore = 0;
  let slcMaxScore = 0;
  
  const technicalDetails = {};
  const legalDetails = {};
  const slcDetails = {};

  // Calculate technical criteria score
  for (const [key, criterion] of Object.entries(technicalCriteria)) {
    const userSelection = criteria[key];
    if (userSelection && criterion.options[userSelection]) {
      const score = criterion.options[userSelection].score * criterion.weight;
      technicalScore += score;
      technicalDetails[key] = {
        name: criterion.name,
        selection: criterion.options[userSelection].label,
        score: score
      };
    }
    technicalMaxScore += 3 * criterion.weight; // Max score is 3 per criterion
  }

  // Calculate legal/organizational criteria score
  for (const [key, criterion] of Object.entries(legalCriteria)) {
    const userSelection = criteria[key];
    if (userSelection && criterion.options[userSelection]) {
      const score = criterion.options[userSelection].score * criterion.weight;
      legalScore += score;
      legalDetails[key] = {
        name: criterion.name,
        selection: criterion.options[userSelection].label,
        score: score
      };
    }
    legalMaxScore += 3 * criterion.weight;
  }

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

  const totalScore = technicalScore + legalScore + slcScore;
  const maxScore = technicalMaxScore + legalMaxScore + slcMaxScore;
  const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    totalScore,
    maxScore,
    percentageScore: Math.round(percentageScore * 10) / 10,
    technical: {
      score: technicalScore,
      maxScore: technicalMaxScore,
      percentage: technicalMaxScore > 0 ? Math.round((technicalScore / technicalMaxScore) * 1000) / 10 : 0,
      details: technicalDetails
    },
    legal: {
      score: legalScore,
      maxScore: legalMaxScore,
      percentage: legalMaxScore > 0 ? Math.round((legalScore / legalMaxScore) * 1000) / 10 : 0,
      details: legalDetails
    },
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
    technical: technicalCriteria,
    legal: legalCriteria,
    slc: slcCriteria
  };
}

module.exports = {
  calculateScore,
  getCriteriaDefinitions,
  technicalCriteria,
  legalCriteria,
  slcCriteria
};
