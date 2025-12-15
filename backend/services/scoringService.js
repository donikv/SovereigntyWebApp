/**
 * Scoring Service
 * Based on Tables 1 and 2 from the sovereignty evaluation criteria
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
  
  const technicalDetails = {};
  const legalDetails = {};

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

  const totalScore = technicalScore + legalScore;
  const maxScore = technicalMaxScore + legalMaxScore;
  const percentageScore = (totalScore / maxScore) * 100;

  return {
    totalScore,
    maxScore,
    percentageScore: Math.round(percentageScore * 10) / 10,
    technical: {
      score: technicalScore,
      maxScore: technicalMaxScore,
      percentage: Math.round((technicalScore / technicalMaxScore) * 1000) / 10,
      details: technicalDetails
    },
    legal: {
      score: legalScore,
      maxScore: legalMaxScore,
      percentage: Math.round((legalScore / legalMaxScore) * 1000) / 10,
      details: legalDetails
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
    legal: legalCriteria
  };
}

module.exports = {
  calculateScore,
  getCriteriaDefinitions,
  technicalCriteria,
  legalCriteria
};
