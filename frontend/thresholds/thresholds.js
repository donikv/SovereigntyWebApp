const { createApp } = Vue;

createApp({
  data() {
    return {
      thresholds: {},
      expandedSCs: {},
      showSuccess: false,
      isLoading: true,
      serverAddress: window.location.origin,
      
      // Sovereignty Characteristics data
      sovereigntyCharacteristics: {
        sc1: { code: 'SC1', name: 'Autonomy', description: 'Military AI systems ought to have a degree of autonomous decision-making while still being subject to human supervision.' },
        sc2: { code: 'SC2', name: 'Technological Independence', description: 'Self-sufficiency in developing and maintaining military AI to avoid dependency on external entities.' },
        sc3: { code: 'SC3', name: 'Security and Digital Integrity', description: 'Protect AI systems and digital infrastructure against cyber threats.' },
        sc4: { code: 'SC4', name: 'Legal and Ethical Frameworks', description: 'Compliance with European, National, and/or International laws, including ethical norms and human rights.' },
        sc5: { code: 'SC5', name: 'International Compliance', description: 'Minimize external dependencies and maintain control over necessary ones.' },
        sc6: { code: 'SC6', name: 'Import/Export Control', description: 'Regulate the trade of military AI technologies to prevent undesirable proliferation.' },
        sc7: { code: 'SC7', name: 'Resilience', description: 'Systems should be robust and recover swiftly from disruptions.' },
        sc8: { code: 'SC8', name: 'Indispensability', description: 'Promote indispensable capabilities to allies while maintaining dispensability in sourcing.' },
        sc9: { code: 'SC9', name: 'Protection', description: 'AI behavior should never negatively impact critical infrastructure, democratic principles, and cultural identity.' },
        sc10: { code: 'SC10', name: 'Openness and Interoperability', description: 'Compatibility with various systems enabling a dynamic defense ecosystem.' },
        sc11: { code: 'SC11', name: 'Infrastructure Sovereignty', description: 'Control over essential AI development and deployment infrastructure and data.' },
        sc12: { code: 'SC12', name: 'Economic Considerations', description: 'Economically viable development with investment in education and training.' },
        sc13: { code: 'SC13', name: 'Accountability', description: 'Clear accountability mechanisms for AI actions with transparency.' }
      },
      
      // SLC to SC mapping
      slcToScMapping: {
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
      },
      
      // SLC Criteria definitions
      slcCriteria: {
        slc1: {
          name: 'SLC1: Software Ownership',
          options: {
            'ngo': { label: 'Non-Governmental Organization (NGO)', score: 3 },
            'go': { label: 'Governmental Organization (GO)', score: 2 },
            'po': { label: 'Private Organization (PO)', score: 1 }
          }
        },
        slc2: {
          name: 'SLC2: Software Country of Origin',
          options: {
            'whitelist': { label: 'White-list Country', score: 10 },
            'greylist': { label: 'Grey-list Country', score: 5 },
            'blacklist': { label: 'Black-list Country', score: 1 }
          }
        },
        slc3: {
          name: 'SLC3: Software License',
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
          options: {
            'whitelist': { label: 'White-list Country', score: 10 },
            'greylist': { label: 'Grey-list Country', score: 5 },
            'blacklist': { label: 'Black-list Country', score: 1 }
          }
        },
        slc34: {
          name: 'SLC34: Data License',
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
          options: {
            'huge': { label: '>100k contributors (Widespread use)', score: 4 },
            'large': { label: '>10k contributors (Industry-supported)', score: 3 },
            'medium': { label: '>1k contributors (Research/University)', score: 2 },
            'small': { label: '<1k contributors (Private project)', score: 1 }
          }
        },
        slc12: {
          name: 'SLC12: Regulatory and Legal Compliance',
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
          options: {
            'no_funding': { label: 'No funding needed', score: 4 },
            'unaligned': { label: 'Has unaligned funding', score: 3 },
            'aligned': { label: 'Has company-aligned funding', score: 2 },
            'none': { label: 'No funding (needed)', score: 1 }
          }
        },
        slc16: {
          name: 'SLC16: Interoperability',
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
          options: {
            'all_known': { label: 'All processes known', score: 4 },
            'most_known': { label: 'Most processes known', score: 3 },
            'most_unknown': { label: 'Most processes unknown', score: 2 },
            'all_unknown': { label: 'All processes unknown', score: 1 }
          }
        },
        slc23: {
          name: 'SLC23: AI Model Retraining',
          options: {
            'internal': { label: 'Completely internally trained', score: 3 },
            'retrained': { label: 'Retrained pre-trained model', score: 2 },
            'external': { label: 'Externally trained model', score: 1 }
          }
        },
        slc24: {
          name: 'SLC24: External APIs and Services',
          options: {
            'one': { label: '1 dependency', score: 4 },
            'few': { label: '2-4 dependencies', score: 3 },
            'some': { label: '5-9 dependencies', score: 2 },
            'many': { label: '≥10 dependencies', score: 1 }
          }
        },
        slc25: {
          name: 'SLC25: Explainability',
          options: {
            'whitebox': { label: 'White/Grey-box (explainable)', score: 3 },
            'blackbox_external': { label: 'Black-box (externally explainable)', score: 2 },
            'blackbox_consistent': { label: 'Black-box (consistent output)', score: 1 },
            'blackbox_opaque': { label: 'Black-box (not explainable)', score: 0 }
          }
        }
      }
    };
  },
  
  async mounted() {
    this.initializeThresholds();
    await this.loadCurrentThresholds();
    this.isLoading = false;
  },
  
  methods: {
    initializeThresholds() {
      // Initialize thresholds structure based on slcToScMapping
      const newThresholds = {};
      const newExpandedSCs = {};
      
      Object.keys(this.sovereigntyCharacteristics).forEach(scKey => {
        newThresholds[scKey] = {};
        newExpandedSCs[scKey] = false;
        
        // Add all SLCs that map to this SC
        Object.keys(this.slcToScMapping).forEach(slcKey => {
          if (this.slcToScMapping[slcKey].includes(scKey)) {
            newThresholds[scKey][slcKey] = '';
          }
        });
      });
      
      this.thresholds = newThresholds;
      this.expandedSCs = newExpandedSCs;
    },
    
    async loadCurrentThresholds() {
      try {
        const response = await fetch(`${this.serverAddress}/api/config`);
        const config = await response.json();
        
        if (config.thresholds) {
          // Merge with current server thresholds
          Object.keys(config.thresholds).forEach(scKey => {
            if (this.thresholds[scKey]) {
              Object.keys(config.thresholds[scKey]).forEach(slcKey => {
                if (this.thresholds[scKey][slcKey] !== undefined) {
                  this.thresholds[scKey][slcKey] = config.thresholds[scKey][slcKey];
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('Error loading current thresholds:', error);
        // Continue with empty thresholds if server is not available
      }
    },
    
    getSlcsForSc(scKey) {
      // Return SLCs in the order they appear in the thresholds object for this SC
      if (this.thresholds[scKey]) {
        return Object.keys(this.thresholds[scKey]);
      }
      return [];
    },
    
    getSlcDescription(slcKey) {
      const descriptions = {
        slc1: 'Type of organization owning the software',
        slc2: 'Country where software was developed',
        slc3: 'Type of software license',
        slc5: 'How often software is updated',
        slc33: 'Country where data is stored/processed',
        slc34: 'Type of data license',
        slc11: 'Size and activity of developer community',
        slc12: 'Level of compliance analysis',
        slc13: 'Project funding status',
        slc16: 'Level of system interoperability',
        slc17: 'Transparency of development processes',
        slc23: 'Level of control over AI model training',
        slc24: 'Number of external dependencies',
        slc25: 'Level of AI model explainability'
      };
      return descriptions[slcKey] || '';
    },
    
    toggleSC(scKey) {
      this.expandedSCs[scKey] = !this.expandedSCs[scKey];
    },
    
    expandAll() {
      Object.keys(this.expandedSCs).forEach(key => {
        this.expandedSCs[key] = true;
      });
    },
    
    collapseAll() {
      Object.keys(this.expandedSCs).forEach(key => {
        this.expandedSCs[key] = false;
      });
    },
    
    generateConfig() {
      // Create the JSON configuration
      const config = JSON.stringify(this.thresholds, null, 4);
      
      // Create a blob and download
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'thresholds.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    },
    
    goBack() {
      window.location.href = '../index.html';
    }
  }
}).mount('#app');
