const { createApp } = Vue;

const app = createApp({
  components: {
    'slc-input': SlcInput
  },
  data() {
    return {
      formData: {
        technologyName: '',
        description: '',
        criteria: {
          // SLC Criteria - dynamically populated from server
        },
        mitigations: {
          // Mitigation flags for each SLC - dynamically populated from server
        },
        mitigationDescriptions: {
          // Mitigation descriptions for each SLC - dynamically populated from server
        },
        selectedSC: {
          // Sovereignty Characteristics (empty = not selected, 'shall' or 'should')
        },
        metadata: {
          // Metadata model fields not covered by criteria/form - populated from server model
        }
      },
      // Sovereignty Characteristics - loaded from server
      sovereigntyCharacteristics: {},
      // Sovereignty Metadata Model (3 layers) - loaded from server
      metadataModel: {},
      showMetadataSection: false,
      showMetadataModal: false,
      metadataPngGenerating: false,
      metadataCopied: false,
      results: null,
      loading: false,
      pdfGenerating: false,
      error: null,
      showSCSelector: false,
      serverAddress: '',
      thresholds: {},
      dbEnabled: false,
      dbConnected: false,
      savedEvaluations: [],
      showEvaluationsList: false,
      loadingEvaluations: false,
      statistics: null,
      saving: false,
      currentEvaluationId: null,
      // Mapping of SLC criteria to Sovereignty Characteristics (loaded from server)
      slcToScMapping: {},
      // SLC option labels for display (loaded from server)
      slcOptions: {},
      // SLC configurations for component rendering (loaded from server)
      slcConfigs: [],
      // SWH lookup state
      swhLoading: false,
      swhResult: null,
      swhError: null,
      swhCandidates: [],
      swhGithubUrl: ''
    };
  },
  methods: {
    async fetchConfig() {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          this.serverAddress = config.serverAddress;
          this.thresholds = config.thresholds || {};
          this.slcToScMapping = config.slcToScMapping || {};
          
          // Load sovereignty characteristics from server
          if (config.sovereigntyCharacteristics) {
            this.sovereigntyCharacteristics = config.sovereigntyCharacteristics;
          }

          // Load the metadata model and seed the assessor-entered fields
          if (config.metadataModel) {
            this.metadataModel = config.metadataModel;
            Object.values(config.metadataModel).forEach(layer => {
              Object.entries(layer.fields).forEach(([fieldKey, field]) => {
                if (field.source === 'metadata') {
                  this.formData.metadata[fieldKey] = field.input === 'boolean' ? null : '';
                }
              });
            });
          }

          // Transform slcCriteria into slcOptions, slcConfigs, and initialize form data
          if (config.slcCriteria) {
            this.slcOptions = {};
            this.slcConfigs = [];
            
            Object.keys(config.slcCriteria).forEach(slcKey => {
              const slc = config.slcCriteria[slcKey];
              
              // Initialize form data for this SLC
              this.formData.criteria[slcKey] = '';
              this.formData.mitigations[slcKey] = false;
              this.formData.mitigationDescriptions[slcKey] = '';
              
              // Build slcOptions (value -> label mapping)
              this.slcOptions[slcKey] = {};
              Object.keys(slc.options).forEach(optionKey => {
                this.slcOptions[slcKey][optionKey] = slc.options[optionKey].label;
              });
              
              // Build slcConfigs array
              this.slcConfigs.push({
                key: slcKey,
                label: slc.name,
                options: Object.keys(slc.options).map(optionKey => ({
                  value: optionKey,
                  label: slc.options[optionKey].label
                }))
              });
            });
          }
          
          this.dbEnabled = config.database?.enabled || false;
          this.dbConnected = config.database?.connected || false;
        } else {
          // Fallback to relative URLs if config fails
          this.serverAddress = '';
          this.thresholds = {};
          this.slcToScMapping = {};
          this.slcOptions = {};
          this.slcConfigs = [];
          this.metadataModel = {};
          this.dbEnabled = false;
          this.dbConnected = false;
        }
      } catch (err) {
        console.warn('Failed to fetch server config, using relative URLs:', err);
        this.serverAddress = '';
        this.thresholds = {};
        this.dbEnabled = false;
        this.dbConnected = false;
      }
    },

    async lookupSWH() {
      if (!this.formData.technologyName) return;
      this.swhLoading = true;
      this.swhResult = null;
      this.swhError = null;
      this.swhCandidates = [];
      try {
        let apiUrl;
        if (this.swhGithubUrl && this.swhGithubUrl.trim()) {
          const encoded = encodeURIComponent(this.swhGithubUrl.trim());
          apiUrl = this.serverAddress
            ? `${this.serverAddress}/api/swh-metadata?origin=${encoded}`
            : `/api/swh-metadata?origin=${encoded}`;
        } else {
          const name = encodeURIComponent(this.formData.technologyName.trim());
          apiUrl = this.serverAddress
            ? `${this.serverAddress}/api/swh-metadata?name=${name}`
            : `/api/swh-metadata?name=${name}`;
        }
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!response.ok) {
          this.swhError = data.error || 'Not found in Software Heritage';
        } else {
          this.swhResult = data;
          this.swhCandidates = data.candidates || [];
        }
      } catch (err) {
        this.swhError = 'Failed to reach Software Heritage: ' + err.message;
      } finally {
        this.swhLoading = false;
      }
    },

    async selectSWHCandidate(url) {
      this.swhLoading = true;
      this.swhResult = null;
      this.swhError = null;
      try {
        const encoded = encodeURIComponent(url);
        const apiUrl = this.serverAddress
          ? `${this.serverAddress}/api/swh-metadata?origin=${encoded}`
          : `/api/swh-metadata?origin=${encoded}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!response.ok) {
          this.swhError = data.error || 'Not found in Software Heritage';
        } else {
          this.swhResult = data;
        }
      } catch (err) {
        this.swhError = 'Failed to reach Software Heritage: ' + err.message;
      } finally {
        this.swhLoading = false;
      }
    },

    applySWHSuggestions() {
      if (!this.swhResult?.suggestions) return;
      const s = this.swhResult.suggestions;
      if (s.description && !this.formData.description) {
        this.formData.description = s.description;
      }
      if (s.slc3)  this.formData.criteria.slc3  = s.slc3;
      if (s.slc34) this.formData.criteria.slc34 = s.slc34;
      if (s.slc5)  this.formData.criteria.slc5  = s.slc5;
      if (s.slc11) this.formData.criteria.slc11 = s.slc11;
      if (s.slc17) this.formData.criteria.slc17 = s.slc17;
      if (s.slc24) this.formData.criteria.slc24 = s.slc24;
      // Metadata model fields - only fill blanks so assessor edits are never overwritten
      if (s.metadata) {
        Object.entries(s.metadata).forEach(([key, value]) => {
          const current = this.formData.metadata[key];
          if (value !== null && value !== undefined && (current === '' || current === null || current === undefined)) {
            this.formData.metadata[key] = value;
          }
        });
      }
      this.swhResult = null;
    },

    // Resolve every metadata model field to a display row, keeping track of
    // where the value came from so the exported table is self-explanatory
    resolveMetadataValue(field) {
      if (field.source === 'form') {
        return { value: this.formData[field.formField] || '', origin: 'Form' };
      }

      if (field.source === 'slc') {
        const selection = this.formData.criteria[field.slc];
        const label = selection ? (this.slcOptions[field.slc]?.[selection] || selection) : '';
        return { value: label, origin: field.slc.toUpperCase() };
      }

      const raw = this.formData.metadata[field.key];
      const origin = field.autofill ? 'SWH / Manual' : 'Manual';

      if (field.input === 'boolean') {
        if (raw === null || raw === undefined || raw === '') return { value: '', origin };
        return { value: raw ? 'Yes' : 'No', origin };
      }

      if (field.input === 'select' && raw) {
        const option = (field.options || []).find(o => o.value === raw);
        return { value: option ? option.label : raw, origin };
      }

      return { value: raw || '', origin };
    },

    openMetadataModal() {
      this.showMetadataModal = true;
    },

    closeMetadataModal() {
      this.showMetadataModal = false;
      this.metadataCopied = false;
    },

    async exportMetadataPNG() {
      try {
        this.metadataPngGenerating = true;
        this.error = null;

        const source = document.getElementById('metadata-table');
        if (!source) {
          throw new Error('Metadata table is not open');
        }

        // Render an offscreen clone so the modal scroll position and any
        // no-print controls do not end up in the image
        const clone = source.cloneNode(true);
        clone.querySelectorAll('.no-print').forEach(el => el.remove());

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '900px';
        tempContainer.style.padding = '24px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        document.body.removeChild(tempContainer);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(this.formData.technologyName || 'technology').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_metadata_${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        this.error = 'Error generating image: ' + err.message;
        console.error('Metadata PNG error:', err);
      } finally {
        this.metadataPngGenerating = false;
      }
    },

    async copyMetadataJSON() {
      const payload = {
        technologyName: this.formData.technologyName,
        exportDate: new Date().toISOString(),
        layers: this.metadataTable.map(layer => ({
          code: layer.code,
          name: layer.name,
          fields: layer.rows.map(row => ({ label: row.label, value: row.value, source: row.origin }))
        }))
      };

      try {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        this.metadataCopied = true;
        setTimeout(() => { this.metadataCopied = false; }, 2000);
      } catch (err) {
        this.error = 'Could not copy to clipboard: ' + err.message;
      }
    },

    async calculateScore() {
      this.loading = true;
      this.error = null;
      this.results = null;

      // Validate that at least one SC is selected
      if (Object.keys(this.formData.selectedSC).length === 0) {
        this.error = 'Please select at least one Sovereignty Characteristic (SHALL or SHOULD) to evaluate.';
        this.loading = false;
        return;
      }

      try {
        const apiUrl = this.serverAddress ? `${this.serverAddress}/api/calculate-score` : '/api/calculate-score';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...this.formData,
            saveToDb: false  // Don't save automatically
          })
        });

        if (!response.ok) {
          throw new Error('Failed to calculate score');
        }

        const data = await response.json();
        
        // Handle the response format - extract results
        this.results = {
          technologyName: data.technologyName,
          description: data.description,
          ...data.results
        };
        
        // Reset saved state when new calculation is done
        this.currentEvaluationId = null;
        
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
    
    async saveCurrentEvaluation() {
      if (!this.dbEnabled || !this.dbConnected) {
        this.error = 'Database is not available';
        return;
      }

      if (!this.results) {
        this.error = 'No evaluation results to save';
        return;
      }

      this.saving = true;
      this.error = null;

      try {
        const apiUrl = this.serverAddress ? `${this.serverAddress}/api/calculate-score` : '/api/calculate-score';
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...this.formData,
            saveToDb: true
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save evaluation');
        }

        const data = await response.json();
        if (data.saved && data.id) {
          this.currentEvaluationId = data.id;
          // Show success feedback (could add a success message)
          console.log('Evaluation saved with ID:', data.id);
        } else {
          throw new Error('Evaluation was not saved');
        }
      } catch (err) {
        this.error = 'Error saving evaluation: ' + err.message;
        console.error('Error:', err);
      } finally {
        this.saving = false;
      }
    },

    resetForm() {
      // Rebuild every keyed object from the server config so the shape always
      // matches what the template binds to. mitigationDescriptions must be
      // included: the SLC inputs bind into it and a missing object breaks render.
      const criteria = {};
      const mitigations = {};
      const mitigationDescriptions = {};
      this.slcConfigs.forEach(slc => {
        criteria[slc.key] = '';
        mitigations[slc.key] = false;
        mitigationDescriptions[slc.key] = '';
      });

      const metadata = {};
      Object.values(this.metadataModel).forEach(layer => {
        Object.entries(layer.fields).forEach(([fieldKey, field]) => {
          if (field.source === 'metadata') {
            metadata[fieldKey] = field.input === 'boolean' ? null : '';
          }
        });
      });

      this.formData = {
        technologyName: '',
        description: '',
        criteria,
        mitigations,
        mitigationDescriptions,
        metadata,
        selectedSC: {}
      };
      this.results = null;
      this.error = null;
      this.currentEvaluationId = null;
      this.swhResult = null;
      this.swhError = null;
      this.swhCandidates = [];
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

    selectAllSC(type) {
      const selected = {};
      Object.keys(this.sovereigntyCharacteristics).forEach((key) => {
        selected[key] = type;
      });
      this.formData.selectedSC = selected;
    },

    unselectAllSC() {
      this.formData.selectedSC = {};
    },
    
    getRatingClass(percentage) {
      if (percentage >= 90) return 'rating-excellent';
      if (percentage >= 75) return 'rating-high';
      if (percentage >= 60) return 'rating-moderate';
      if (percentage >= 40) return 'rating-low';
      return 'rating-very-low';
    },
    
    exportData() {
      const exportData = {
        technologyName: this.formData.technologyName,
        description: this.formData.description,
        criteria: this.formData.criteria,
        mitigations: this.formData.mitigations,
        mitigationDescriptions: this.formData.mitigationDescriptions,
        metadata: this.formData.metadata,
        exportDate: new Date().toISOString(),
        version: '1.1'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.formData.technologyName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'evaluation'}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    
    importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // Validate required fields
          if (!importedData.criteria) {
            throw new Error('Invalid file format: missing criteria');
          }
          
          // Import data
          this.formData.technologyName = importedData.technologyName || '';
          this.formData.description = importedData.description || '';
          this.formData.criteria = { ...this.formData.criteria, ...importedData.criteria };
          if (importedData.mitigations) {
            this.formData.mitigations = { ...this.formData.mitigations, ...importedData.mitigations };
          }
          if (importedData.mitigationDescriptions) {
            this.formData.mitigationDescriptions = { ...this.formData.mitigationDescriptions, ...importedData.mitigationDescriptions };
          }
          if (importedData.metadata) {
            this.formData.metadata = { ...this.formData.metadata, ...importedData.metadata };
          }

          // Reset file input
          event.target.value = '';
          
          // Show success message
          alert('Data imported successfully!');
        } catch (err) {
          this.error = 'Error importing file: ' + err.message;
          console.error('Import error:', err);
          event.target.value = '';
        }
      };
      reader.readAsText(file);
    },
    
    triggerImport() {
      this.$refs.fileInput.click();
    },

    openThresholdsConfig() {
      // Open the thresholds configuration page
      window.location.href = 'thresholds/thresholds.html';
    },

    async exportToPDF() {
      try {
        this.pdfGenerating = true;
        this.error = null;

        // Get the results section
        const resultsSection = document.getElementById('results-section');
        if (!resultsSection) {
          throw new Error('No results to export');
        }

        // Clone the section to manipulate it without affecting the UI
        const clone = resultsSection.cloneNode(true);
        
        // Remove no-print elements
        clone.querySelectorAll('.no-print').forEach(el => el.remove());

        // Create a temporary container for rendering
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '210mm'; // A4 width
        tempContainer.style.padding = '20px';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.appendChild(clone);
        document.body.appendChild(tempContainer);

        // Use html2canvas to convert HTML to canvas
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Remove temporary container
        document.body.removeChild(tempContainer);

        // Get canvas dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Add title page
        pdf.setFontSize(24);
        pdf.setTextColor(0, 51, 102);
        pdf.text('Digital Sovereignty Evaluation', 105, 30, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.setTextColor(102, 102, 102);
        pdf.text('Evaluation Report', 105, 45, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Technology: ${this.results.technologyName}`, 105, 60, { align: 'center' });
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 105, 70, { align: 'center' });

        // Add the canvas as image on a new page
        pdf.addPage();
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Add image to PDF, handling multiple pages if needed
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297; // A4 height in mm
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }

        // Save the PDF
        const filename = `${this.results.technologyName.replace(/[^a-z0-9]/gi, '_')}_evaluation_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);

      } catch (err) {
        this.error = 'Error generating PDF: ' + err.message;
        console.error('PDF generation error:', err);
      } finally {
        this.pdfGenerating = false;
      }
    },

    // Database-related methods
    async loadEvaluations() {
      if (!this.dbConnected) {
        this.error = 'Database is not connected';
        return;
      }

      this.loadingEvaluations = true;
      try {
        const apiUrl = this.serverAddress ? `${this.serverAddress}/api/evaluations` : '/api/evaluations';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to load evaluations');
        }

        const data = await response.json();
        this.savedEvaluations = data.evaluations;
        this.statistics = data.statistics;
        this.showEvaluationsList = true;
      } catch (err) {
        this.error = 'Error loading evaluations: ' + err.message;
        console.error('Load error:', err);
      } finally {
        this.loadingEvaluations = false;
      }
    },

    async loadEvaluation(evaluationId) {
      try {
        const apiUrl = this.serverAddress ? `${this.serverAddress}/api/evaluations/${evaluationId}` : `/api/evaluations/${evaluationId}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to load evaluation');
        }

        const evaluation = await response.json();
        
        // Load the evaluation data into the form
        this.formData.technologyName = evaluation.technologyName || '';
        this.formData.description = evaluation.description || '';
        this.formData.criteria = { ...this.formData.criteria, ...evaluation.criteria };
        this.formData.selectedSC = evaluation.selectedSC || {};
        this.formData.mitigations = { ...this.formData.mitigations, ...evaluation.mitigations };
        this.formData.mitigationDescriptions = { ...this.formData.mitigationDescriptions, ...evaluation.mitigationDescriptions };
        this.formData.metadata = { ...this.formData.metadata, ...(evaluation.metadata || {}) };

        // Set results with proper structure
        this.results = {
          technologyName: evaluation.technologyName,
          description: evaluation.description,
          ...evaluation.results
        };
        
        this.showEvaluationsList = false;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        this.error = 'Error loading evaluation: ' + err.message;
        console.error('Load error:', err);
      }
    },

    async deleteEvaluation(evaluationId) {
      if (!confirm('Are you sure you want to delete this evaluation?')) {
        return;
      }

      try {
        const apiUrl = this.serverAddress ? `${this.serverAddress}/api/evaluations/${evaluationId}` : `/api/evaluations/${evaluationId}`;
        const response = await fetch(apiUrl, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete evaluation');
        }

        // Reload the list
        await this.loadEvaluations();
      } catch (err) {
        this.error = 'Error deleting evaluation: ' + err.message;
        console.error('Delete error:', err);
      }
    },

    async exportAllEvaluationsJSON() {
      try {
        const apiUrl = this.serverAddress ? `${this.serverAddress}/api/export/json` : '/api/export/json';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to export evaluations');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `evaluations-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        this.error = 'Error exporting evaluations: ' + err.message;
        console.error('Export error:', err);
      }
    },

    async exportAllEvaluationsCSV() {
      try {
        const apiUrl = this.serverAddress ? `${this.serverAddress}/api/export/csv` : '/api/export/csv';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to export evaluations');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `evaluations-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        this.error = 'Error exporting evaluations: ' + err.message;
        console.error('Export error:', err);
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },

    closeEvaluationsList() {
      this.showEvaluationsList = false;
    },

    // Get thresholds for a specific SLC across all SHALL SCs
    getThresholdsForSlc(slcKey) {
      const thresholdInfo = [];
      
      // Get all SCs that this SLC maps to
      const mappedSCs = this.slcToScMapping[slcKey] || [];
      
      // For each mapped SC, check if it's marked as SHALL and has a threshold
      mappedSCs.forEach(scKey => {
        if (this.formData.selectedSC[scKey] === 'shall') {
          const thresholdArray = this.thresholds[scKey] && this.thresholds[scKey][slcKey];
          if (thresholdArray && Array.isArray(thresholdArray) && thresholdArray.length > 0) {
            const thresholdValue = thresholdArray[0]; // Get most recent (first in array)
            const thresholdLabel = this.slcOptions[slcKey]?.[thresholdValue] || thresholdValue;
            const scInfo = this.sovereigntyCharacteristics[scKey];
            thresholdInfo.push({
              scKey,
              scCode: scInfo.code,
              scName: scInfo.name,
              thresholdValue,
              thresholdLabel
            });
          }
        }
      });
      
      return thresholdInfo;
    },

    // Check if any SHALL SC has a threshold for this SLC
    hasThresholds(slcKey) {
      return this.getThresholdsForSlc(slcKey).length > 0;
    }
  },
  watch: {
    'formData.technologyName'(val) {
      const slug = (val || '').trim().toLowerCase().replace(/\s+/g, '-');
      this.swhGithubUrl = slug ? `https://github.com/${slug}/${slug}` : '';
    }
  },
  computed: {
    Math() {
      return Math;
    },

    // The 3-layer model resolved to display rows - drives the modal table
    metadataTable() {
      return Object.entries(this.metadataModel).map(([layerKey, layer]) => ({
        key: layerKey,
        code: layer.code,
        name: layer.name,
        rows: Object.entries(layer.fields)
          .filter(([, field]) => !field.hideInTable)
          .map(([fieldKey, field]) => {
            const resolved = this.resolveMetadataValue({ ...field, key: fieldKey });
            return {
              key: fieldKey,
              label: field.label,
              value: resolved.value,
              origin: resolved.origin,
              note: field.note ? this.formData.metadata[field.note] : ''
            };
          })
      }));
    },

    // Only the fields the assessor has to fill in, grouped by layer.
    // Layers whose fields all come from criteria/form are omitted.
    metadataInputLayers() {
      return Object.entries(this.metadataModel)
        .map(([layerKey, layer]) => ({
          key: layerKey,
          code: layer.code,
          name: layer.name,
          fields: Object.entries(layer.fields)
            .filter(([, field]) => field.source === 'metadata' && !field.isNote)
            .map(([fieldKey, field]) => ({
              ...field,
              key: fieldKey,
              noteField: field.note ? { ...layer.fields[field.note], key: field.note } : null
            }))
        }))
        .filter(layer => layer.fields.length > 0);
    },

    metadataFilledCount() {
      const values = Object.values(this.formData.metadata);
      return values.filter(v => v !== '' && v !== null && v !== undefined).length;
    },

    metadataTotalCount() {
      return Object.keys(this.formData.metadata).length;
    }
  },
  async mounted() {
    await this.fetchConfig();
  }
});

app.mount('#app');
