/**
 * Scoring Service
 * SLC Criteria - Software, Licensing, and Compliance
 * Sovereignty Characteristics (SC) - Strategic Framework
 */

// Sovereignty Characteristics (SC)
const sovereigntyCharacteristics = {
  sc1: {
    code: 'SC1',
    name: 'Autonomy',
    description: 'Military AI systems ought to have a degree of autonomous decision-making while still being subject to human supervision.'
  },
  sc2: {
    code: 'SC2',
    name: 'Technological Independence',
    description: 'Self-sufficiency in developing and maintaining military AI to avoid dependency on external entities.'
  },
  sc3: {
    code: 'SC3',
    name: 'Security and Digital Integrity',
    description: 'Protect AI systems and digital infrastructure against cyber threats.'
  },
  sc4: {
    code: 'SC4',
    name: 'Legal and Ethical Frameworks',
    description: 'Compliance with European, National, and/or International laws, including ethical norms and human rights.'
  },
  sc5: {
    code: 'SC5',
    name: 'International Compliance and Dependencies Awareness',
    description: 'Minimize external dependencies and maintain control over necessary ones.'
  },
  sc6: {
    code: 'SC6',
    name: 'Control over Import and Export',
    description: 'Regulate the trade of military AI technologies to prevent undesirable proliferation.'
  },
  sc7: {
    code: 'SC7',
    name: 'Resilience',
    description: 'Systems should be robust and recover swiftly from disruptions.'
  },
  sc8: {
    code: 'SC8',
    name: 'Indispensability and Dispensability',
    description: 'Promote indispensable capabilities to allies while maintaining dispensability in sourcing.'
  },
  sc9: {
    code: 'SC9',
    name: 'Protection',
    description: 'AI behavior should never negatively impact critical infrastructure, democratic principles, and cultural identity.'
  },
  sc10: {
    code: 'SC10',
    name: 'Openness and Interoperability',
    description: 'Compatibility with various systems enabling a dynamic defense ecosystem.'
  },
  sc11: {
    code: 'SC11',
    name: 'Infrastructure Sovereignty',
    description: 'Control over essential AI development and deployment infrastructure and data.'
  },
  sc12: {
    code: 'SC12',
    name: 'Economic and Workforce Considerations',
    description: 'Economically viable development with investment in education and training.'
  },
  sc13: {
    code: 'SC13',
    name: 'Accountability',
    description: 'Clear accountability mechanisms for AI actions with transparency.'
  }
};

// Mapping of SLC criteria to Sovereignty Characteristics
const slcToScMapping = {
  slc1: ['sc1', 'sc2', 'sc3', 'sc8', 'sc9', 'sc11', 'sc12'],
  slc2: ['sc1', 'sc2', 'sc3', 'sc8', 'sc9', 'sc11', 'sc12'],
  slc3: ['sc1', 'sc4', 'sc5'],
  slc5: ['sc1', 'sc3', 'sc12'],
  slc33: ['sc1', 'sc3', 'sc8', 'sc9', 'sc11'],
  slc34: ['sc1', 'sc8'],
  slc11: ['sc1', 'sc2', 'sc3', 'sc8'],
  slc12: ['sc1', 'sc4', 'sc5', 'sc13'],
  slc13: ['sc1', 'sc8', 'sc12'],
  slc16: ['sc1', 'sc8', 'sc10'],
  slc17: ['sc1', 'sc6', 'sc7', 'sc8', 'sc9'],
  slc23: ['sc1', 'sc7', 'sc8'],
  slc24: ['sc1', 'sc8', 'sc9', 'sc11', 'sc13'],
  slc25: ['sc1', 'sc9', 'sc13']
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
    name: 'SLC5: Update Frequency',
    weight: 1,
    options: {
      '12+': { label: '12 months or more', score: 12 },
      '11': { label: '11 months', score: 11 },
      '10': { label: '10 months', score: 10 },
      '9': { label: '9 months', score: 9 },
      '8': { label: '8 months', score: 8 },
      '7': { label: '7 months', score: 7 },
      '6': { label: '6 months', score: 6 },
      '5': { label: '5 months', score: 5 },
      '4': { label: '4 months', score: 4 },
      '3': { label: '3 months', score: 3 },
      '2': { label: '2 months', score: 2 },
      '1': { label: '1 month or less', score: 1 }
    }
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
 * @param {Object} selectedSC - Selected sovereignty characteristics with shall/should designation
 * @param {Object} mitigations - Mitigation flags for each SLC
 * @returns {Object} - Score breakdown and total
 */
function calculateScore(criteria, selectedSC = {}, mitigations = {}) {
  let slcScore = 0;
  let slcMaxScore = 0;
  
  const slcDetails = {};
  const scScores = {};

  // Initialize SC scores
  Object.keys(sovereigntyCharacteristics).forEach(scKey => {
    if (selectedSC[scKey]) {
      scScores[scKey] = {
        name: sovereigntyCharacteristics[scKey].name,
        code: sovereigntyCharacteristics[scKey].code,
        type: selectedSC[scKey], // 'shall' or 'should'
        contributingCriteria: [],
        shallScore: 1, // Product for SHALL without mitigations (starts at 1)
        shouldScore: 0, // Sum for SHOULD or mitigated SLCs (starts at 0)
        shouldCount: 0,
        shallCount: 0,
        mitigatedScore: 0, // Sum for mitigated SLCs in SHALL
        mitigatedCount: 0
      };
    }
  });

  // Calculate SLC criteria score
  for (const [key, criterion] of Object.entries(slcCriteria)) {
    const userSelection = criteria[key];
    let score = 0;
    let maxScore = 0;
    let minScore = 0;
    let normalizedScore = 0;
    
    if (userSelection && criterion.options && criterion.options[userSelection]) {
      score = criterion.options[userSelection].score * criterion.weight;
      
      // Find min and max scores for this criterion
      const optionScores = Object.values(criterion.options).map(opt => opt.score * criterion.weight);
      minScore = Math.min(...optionScores);
      maxScore = Math.max(...optionScores);
      
      // Normalize: (score - min) / (max - min)
      normalizedScore = maxScore > minScore ? (score - minScore) / (maxScore - minScore) : 0;
      
      slcDetails[key] = {
        name: criterion.name,
        selection: criterion.options[userSelection].label,
        score: score,
        normalizedScore: normalizedScore
      };
    } else if (criterion.options) {
      // Add to max score even if not selected
      const optionScores = Object.values(criterion.options).map(opt => opt.score * criterion.weight);
      minScore = Math.min(...optionScores);
      maxScore = Math.max(...optionScores);
    }

    slcScore += score;
    slcMaxScore += maxScore;

    // Map to sovereignty characteristics using normalized score
    if (slcToScMapping[key]) {
      const hasMitigation = mitigations[key] === true;
      
      slcToScMapping[key].forEach(scKey => {
        if (scScores[scKey]) {
          scScores[scKey].contributingCriteria.push({
            slc: key,
            name: criterion.name,
            score: score,
            maxScore: maxScore,
            normalizedScore: normalizedScore,
            hasMitigation: hasMitigation
          });
          
          if (scScores[scKey].type === 'shall') {
            if (hasMitigation) {
              // Mitigated SLCs in SHALL use sum (like SHOULD)
              scScores[scKey].mitigatedScore += normalizedScore;
              scScores[scKey].mitigatedCount++;
            } else {
              // Non-mitigated SLCs use product
              scScores[scKey].shallScore *= normalizedScore;
              scScores[scKey].shallCount++;
            }
          } else if (scScores[scKey].type === 'should') {
            scScores[scKey].shouldScore += normalizedScore;
            scScores[scKey].shouldCount++;
          }
        }
      });
    }
  }

  // Calculate final SC scores
  const scResults = {};
  const scProducts = []; // Store product of SHALL and SHOULD for each SC

  Object.entries(scScores).forEach(([scKey, scData]) => {
    let shallScore = 1;
    let shouldScore = 1;

    if (scData.type === 'shall') {
      // For SHALL: product of non-mitigated × average of mitigated
      let nonMitigatedProduct = scData.shallScore; // Already a product
      let mitigatedAverage = 1;
      
      if (scData.mitigatedCount > 0) {
        mitigatedAverage = Math.max(scData.mitigatedScore / scData.mitigatedCount, 0.05);
      }
      
      // Final SHALL score is product of both components
      shallScore = nonMitigatedProduct * mitigatedAverage;
      shouldScore = 1; // SHOULD component is 1 when SC is marked as SHALL
    } else if (scData.type === 'should') {
      shallScore = 1; // SHALL component is 1 when SC is marked as SHOULD
      shouldScore = Math.max(scData.shouldCount > 0 ? scData.shouldScore / scData.shouldCount: 0, 0.05);
    }

    // Product of SHALL and SHOULD for this SC
    const scProduct = shallScore * shouldScore;
    scProducts.push(scProduct);

    scResults[scKey] = {
      name: scData.name,
      code: scData.code,
      type: scData.type,
      shallScore: Math.round(shallScore * 1000) / 1000,
      shouldScore: Math.round(shouldScore * 1000) / 1000,
      score: Math.round(scProduct * 1000) / 1000,
      percentage: Math.round(scProduct * 100 * 10) / 10,
      contributingCriteria: scData.contributingCriteria,
      mitigatedCount: scData.mitigatedCount || 0,
      nonMitigatedCount: scData.shallCount || 0
    };
  });

  // Calculate overall sovereignty score as product of all SC products
  const overallSovScore = scProducts.length > 0
    ? scProducts.reduce((product, scProduct) => product * scProduct, 1)
    : 0;
  const overallPercentage = overallSovScore * 100;

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
    sovereignty: {
      overallScore: Math.round(overallSovScore * 1000) / 1000,
      overallPercentage: Math.round(overallPercentage * 10) / 10,
      characteristics: scResults,
      selectedCount: Object.keys(selectedSC || {}).length
    },
    rating: getSovereigntyRating(Object.keys(selectedSC).length > 0 ? overallPercentage : percentageScore)
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
    slc: slcCriteria,
    sc: sovereigntyCharacteristics,
    mapping: slcToScMapping
  };
}

module.exports = {
  calculateScore,
  getCriteriaDefinitions,
  slcCriteria,
  sovereigntyCharacteristics,
  slcToScMapping
};
