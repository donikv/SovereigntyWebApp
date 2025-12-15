const { createApp } = Vue;

createApp({
  data() {
    return {
      formData: {
        technologyName: '',
        description: '',
        criteria: {
          // Technical Criteria
          dataStorage: '',
          dataProcessing: '',
          openSource: '',
          interoperability: '',
          encryption: '',
          // Legal/Organizational Criteria
          providerLocation: '',
          dataGovernance: '',
          contractualControl: '',
          auditability: '',
          certifications: '',
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
        }
      },
      results: null,
      loading: false,
      error: null
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
          dataStorage: '',
          dataProcessing: '',
          openSource: '',
          interoperability: '',
          encryption: '',
          providerLocation: '',
          dataGovernance: '',
          contractualControl: '',
          auditability: '',
          certifications: '',
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
        }
      };
      this.results = null;
      this.error = null;
    },
    
    getRatingClass(percentage) {
      if (percentage >= 90) return 'rating-excellent';
      if (percentage >= 75) return 'rating-high';
      if (percentage >= 60) return 'rating-moderate';
      if (percentage >= 40) return 'rating-low';
      return 'rating-very-low';
    }
  }
}).mount('#app');
