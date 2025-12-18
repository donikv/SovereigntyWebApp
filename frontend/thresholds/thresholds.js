const { createApp } = Vue;

createApp({
  data() {
    return {
      thresholds: {
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
      showSuccess: false,
      serverAddress: window.location.origin
    };
  },
  
  async mounted() {
    await this.loadCurrentThresholds();
  },
  
  methods: {
    async loadCurrentThresholds() {
      try {
        const response = await fetch(`${this.serverAddress}/api/config`);
        const config = await response.json();
        
        if (config.thresholds) {
          // Populate with current server thresholds
          Object.keys(this.thresholds).forEach(key => {
            if (config.thresholds[key]) {
              this.thresholds[key] = config.thresholds[key];
            }
          });
        }
      } catch (error) {
        console.error('Error loading current thresholds:', error);
        // Continue with empty thresholds if server is not available
      }
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
