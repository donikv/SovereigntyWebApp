const { createApp } = Vue;

createApp({
  data() {
    return {
      thresholds: {},
      selectedThresholds: {},
      expandedSCs: {},
      showHistorySCs: {},
      showSuccess: false,
      isLoading: true,
      serverAddress: window.location.origin,
      
      // All data loaded from server
      sovereigntyCharacteristics: {},
      slcToScMapping: {},
      slcCriteria: {}
    };
  },
  
  async mounted() {
    await this.loadDataAndInitialize();
    this.isLoading = false;
  },
  
  methods: {
    async loadDataAndInitialize() {
      try {
        // First, load all configuration from server
        const response = await fetch(`${this.serverAddress}/api/config`);
        const config = await response.json();
        
        // Load all data structures from server
        if (config.slcToScMapping) {
          this.slcToScMapping = config.slcToScMapping;
        }
        if (config.slcCriteria) {
          this.slcCriteria = config.slcCriteria;
        }
        if (config.sovereigntyCharacteristics) {
          this.sovereigntyCharacteristics = config.sovereigntyCharacteristics;
        }
        
        // Now initialize the threshold structure based on loaded mappings
        this.initializeThresholds();
        
        // Finally, populate with loaded threshold values
        if (config.thresholds) {
          Object.keys(config.thresholds).forEach(scKey => {
            if (this.thresholds[scKey]) {
              Object.keys(config.thresholds[scKey]).forEach(slcKey => {
                if (this.thresholds[scKey][slcKey] !== undefined) {
                  const value = config.thresholds[scKey][slcKey];
                  // Ensure it's an array
                  this.thresholds[scKey][slcKey] = Array.isArray(value) ? value : (value ? [value] : []);
                  // Set selected to current (first in array)
                  this.selectedThresholds[scKey][slcKey] = this.getCurrentThreshold(scKey, slcKey);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        // Continue with empty configuration if server is not available
      }
    },
    initializeThresholds() {
      // Initialize thresholds structure based on slcToScMapping
      const newThresholds = {};
      const newSelectedThresholds = {};
      const newExpandedSCs = {};
      const newShowHistorySCs = {};
      
      Object.keys(this.sovereigntyCharacteristics).forEach(scKey => {
        newThresholds[scKey] = {};
        newSelectedThresholds[scKey] = {};
        newExpandedSCs[scKey] = false;
        newShowHistorySCs[scKey] = {};
        
        // Add all SLCs that map to this SC
        Object.keys(this.slcToScMapping).forEach(slcKey => {
          if (this.slcToScMapping[slcKey].includes(scKey)) {
            newThresholds[scKey][slcKey] = [];
            newSelectedThresholds[scKey][slcKey] = '';
            newShowHistorySCs[scKey][slcKey] = false;
          }
        });
      });
      
      this.thresholds = newThresholds;
      this.selectedThresholds = newSelectedThresholds;
      this.expandedSCs = newExpandedSCs;
      this.showHistorySCs = newShowHistorySCs;
    },
    
    getSlcsForSc(scKey) {
      // Return SLCs in the order they appear in the thresholds object for this SC
      if (this.thresholds[scKey]) {
        return Object.keys(this.thresholds[scKey]);
      }
      return [];
    },
    
    getSlcDescription(slcKey) {
      return this.slcCriteria[slcKey]?.description || '';
    },
    
    getCurrentThreshold(scKey, slcKey) {
      const history = this.thresholds[scKey][slcKey];
      return Array.isArray(history) && history.length > 0 ? history[0] : '';
    },
    
    getThresholdHistory(scKey, slcKey) {
      const history = this.thresholds[scKey][slcKey];
      return Array.isArray(history) ? history : [];
    },
    
    toggleHistory(scKey, slcKey) {
      this.showHistorySCs[scKey][slcKey] = !this.showHistorySCs[scKey][slcKey];
    },
    
    getOptionLabel(slcKey, optKey) {
      return this.slcCriteria[slcKey]?.options?.[optKey]?.label || optKey;
    },
    
    hasChanges(scKey, slcKey) {
      const current = this.getCurrentThreshold(scKey, slcKey);
      const selected = this.selectedThresholds[scKey][slcKey];
      return selected !== current && selected !== '';
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
      // Create new thresholds with updated values prepended to history
      const updatedThresholds = {};
      
      Object.keys(this.thresholds).forEach(scKey => {
        updatedThresholds[scKey] = {};
        
        Object.keys(this.thresholds[scKey]).forEach(slcKey => {
          const currentHistory = [...this.thresholds[scKey][slcKey]];
          const selectedValue = this.selectedThresholds[scKey][slcKey];
          const currentValue = currentHistory.length > 0 ? currentHistory[0] : '';
          
          // If a new value is selected and it's different from current, prepend it
          if (selectedValue && selectedValue !== currentValue) {
            updatedThresholds[scKey][slcKey] = [selectedValue, ...currentHistory];
          } else {
            // Keep the existing history
            updatedThresholds[scKey][slcKey] = currentHistory;
          }
        });
      });
      
      // Create the JSON configuration
      const config = JSON.stringify(updatedThresholds, null, 4);
      
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
