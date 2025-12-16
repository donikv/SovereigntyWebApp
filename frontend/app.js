const { createApp } = Vue;

createApp({
  data() {
    return {
      formData: {
        technologyName: '',
        description: '',
        criteria: {
          // SLC Criteria
          slc1: '',
          slc2: '',
          slc3: '',
          slc5: '',
          slc33: '',
          slc34: '',
          slc11: '',
          slc12: '',
          slc13: '',
          slc16: '',
          slc17: '',
          slc23: '',
          slc24: '',
          slc25: ''
        },
        selectedSC: {
          // Sovereignty Characteristics (empty = not selected, 'shall' or 'should')
        }
      },
      sovereigntyCharacteristics: {
        sc1: { code: 'SC1', name: 'Autonomy', description: 'Autonomous decision-making with human supervision' },
        sc2: { code: 'SC2', name: 'Technological Independence', description: 'Self-sufficiency in AI development' },
        sc3: { code: 'SC3', name: 'Security and Digital Integrity', description: 'Protection against cyber threats' },
        sc4: { code: 'SC4', name: 'Legal and Ethical Frameworks', description: 'Compliance with laws and ethical norms' },
        sc5: { code: 'SC5', name: 'International Compliance', description: 'Minimize external dependencies' },
        sc6: { code: 'SC6', name: 'Import/Export Control', description: 'Regulate AI technology trade' },
        sc7: { code: 'SC7', name: 'Resilience', description: 'Robust and swift recovery from disruptions' },
        sc8: { code: 'SC8', name: 'Indispensability', description: 'Promote indispensable capabilities' },
        sc9: { code: 'SC9', name: 'Protection', description: 'No negative impact on critical infrastructure' },
        sc10: { code: 'SC10', name: 'Openness and Interoperability', description: 'System compatibility' },
        sc11: { code: 'SC11', name: 'Infrastructure Sovereignty', description: 'Control over AI infrastructure' },
        sc12: { code: 'SC12', name: 'Economic Considerations', description: 'Economically viable development' },
        sc13: { code: 'SC13', name: 'Accountability', description: 'Clear accountability mechanisms' }
      },
      results: null,
      loading: false,
      error: null,
      showSCSelector: false
    };
  },
  methods: {
    async calculateScore() {
      this.loading = true;
      this.error = null;
      this.results = null;

      try {
        const response = await fetch('http://localhost:3000/api/calculate-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.formData)
        });

        if (!response.ok) {
          throw new Error('Failed to calculate score');
        }

        this.results = await response.json();
        
        // Scroll to results
        setTimeout(() => {
          document.querySelector('.results-section')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      } catch (err) {
        this.error = 'Error calculating score: ' + err.message;
        console.error('Error:', err);
      } finally {
        this.loading = false;
      }
    },
    
    resetForm() {
      this.formData = {
        technologyName: '',
        description: '',
        criteria: {
          slc1: '',
          slc2: '',
          slc3: '',
          slc5: '',
          slc33: '',
          slc34: '',
          slc11: '',
          slc12: '',
          slc13: '',
          slc16: '',
          slc17: '',
          slc23: '',
          slc24: '',
          slc25: ''
        },
        selectedSC: {}
      };
      this.results = null;
      this.error = null;
    },
    
    toggleSC(scKey, type) {
      if (this.formData.selectedSC[scKey] === type) {
        // Deselect if clicking the same type
        delete this.formData.selectedSC[scKey];
      } else {
        // Select the type
        this.formData.selectedSC[scKey] = type;
      }
    },
    
    isSCSelected(scKey, type) {
      return this.formData.selectedSC[scKey] === type;
    },
    
    getSelectedSCCount() {
      return Object.keys(this.formData.selectedSC).length;
    },
    
    getRatingClass(percentage) {
      if (percentage >= 90) return 'rating-excellent';
      if (percentage >= 75) return 'rating-high';
      if (percentage >= 60) return 'rating-moderate';
      if (percentage >= 40) return 'rating-low';
      return 'rating-very-low';
    }
  },
  computed: {
    Math() {
      return Math;
    }
  }
}).mount('#app');
