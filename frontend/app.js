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
        mitigations: {
          // Mitigation flags for each SLC
          slc1: false,
          slc2: false,
          slc3: false,
          slc5: false,
          slc33: false,
          slc34: false,
          slc11: false,
          slc12: false,
          slc13: false,
          slc16: false,
          slc17: false,
          slc23: false,
          slc24: false,
          slc25: false
        },
        mitigationDescriptions: {
          // Mitigation descriptions for each SLC
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
      // Mapping of SLC criteria to Sovereignty Characteristics
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
      // SLC option labels for display
      slcOptions: {
        slc1: {
          'ngo': 'Non-Governmental Organization (NGO)',
          'go': 'Governmental Organization (GO)',
          'po': 'Private Organization (PO)'
        },
        slc2: {
          'whitelist': 'White-list Country',
          'greylist': 'Grey-list Country',
          'blacklist': 'Black-list Country'
        },
        slc3: {
          'public_domain': 'Public Domain',
          'permissive': 'Permissive (MIT, Apache, BSD)',
          'lgpl': 'LGPL/Intermediate',
          'copyleft': 'Copyleft (GPL)',
          'proprietary': 'Commercial/Proprietary'
        },
        slc5: {
          '12+': '12 months or more',
          '11': '11 months',
          '10': '10 months',
          '9': '9 months',
          '8': '8 months',
          '7': '7 months',
          '6': '6 months',
          '5': '5 months',
          '4': '4 months',
          '3': '3 months',
          '2': '2 months',
          '1': '1 month or less'
        },
        slc33: {
          'whitelist': 'White-list Country',
          'greylist': 'Grey-list Country',
          'blacklist': 'Black-list Country'
        },
        slc34: {
          'public_domain': 'Public Domain',
          'permissive': 'Permissive',
          'lgpl': 'LGPL/Intermediate',
          'copyleft': 'Copyleft',
          'proprietary': 'Commercial/Proprietary'
        },
        slc11: {
          'huge': '>100k contributors (Widespread use)',
          'large': '>10k contributors (Industry-supported)',
          'medium': '>1k contributors (Research/University)',
          'small': '<1k contributors (Private project)'
        },
        slc12: {
          'comprehensive_maintained': 'Comprehensive analysis (maintained)',
          'comprehensive': 'Comprehensive analysis (not maintained)',
          'partial_maintained': 'Partial analysis (maintained)',
          'partial': 'Partial analysis (not maintained)',
          'none': 'No compliance analysis'
        },
        slc13: {
          'no_funding': 'No funding needed',
          'unaligned': 'Has unaligned funding',
          'aligned': 'Has company-aligned funding',
          'none': 'No funding (needed)'
        },
        slc16: {
          'enterprise': 'Enterprise/Universal',
          'domain': 'Domain/Integrated',
          'functional': 'Functional/Distributed',
          'connected': 'Connected/Peer-to-Peer',
          'isolated': 'Isolated/Manual'
        },
        slc17: {
          'all_known': 'All processes known',
          'most_known': 'Most processes known',
          'most_unknown': 'Most processes unknown',
          'all_unknown': 'All processes unknown'
        },
        slc23: {
          'internal': 'Completely internally trained',
          'retrained': 'Retrained pre-trained model',
          'external': 'Externally trained model'
        },
        slc24: {
          'one': '1 dependency',
          'few': '2-4 dependencies',
          'some': '5-9 dependencies',
          'many': '≥10 dependencies'
        },
        slc25: {
          'whitebox': 'White/Grey-box (explainable)',
          'blackbox_external': 'Black-box (externally explainable)',
          'blackbox_consistent': 'Black-box (consistent output)',
          'blackbox_opaque': 'Black-box (not explainable)'
        }
      },
      // SLC configurations for component rendering
      slcConfigs: [
        {
          key: 'slc1',
          label: 'SLC1: Software Ownership',
          options: [
            { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
            { value: 'go', label: 'Governmental Organization (GO)' },
            { value: 'po', label: 'Private Organization (PO)' }
          ]
        },
        {
          key: 'slc2',
          label: 'SLC2: Software Country of Origin',
          options: [
            { value: 'whitelist', label: 'White-list Country' },
            { value: 'greylist', label: 'Grey-list Country' },
            { value: 'blacklist', label: 'Black-list Country' }
          ]
        },
        {
          key: 'slc3',
          label: 'SLC3: Software License',
          options: [
            { value: 'public_domain', label: 'Public Domain' },
            { value: 'permissive', label: 'Permissive (MIT, Apache, BSD)' },
            { value: 'lgpl', label: 'LGPL/Intermediate' },
            { value: 'copyleft', label: 'Copyleft (GPL)' },
            { value: 'proprietary', label: 'Commercial/Proprietary' }
          ]
        },
        {
          key: 'slc5',
          label: 'SLC5: Update Frequency',
          options: [
            { value: '1', label: '1 month or less' },
            { value: '2', label: '2 months' },
            { value: '3', label: '3 months' },
            { value: '4', label: '4 months' },
            { value: '5', label: '5 months' },
            { value: '6', label: '6 months' },
            { value: '7', label: '7 months' },
            { value: '8', label: '8 months' },
            { value: '9', label: '9 months' },
            { value: '10', label: '10 months' },
            { value: '11', label: '11 months' },
            { value: '12+', label: '12 months or more' }
          ]
        },
        {
          key: 'slc33',
          label: 'SLC33: Data Country of Origin',
          options: [
            { value: 'whitelist', label: 'White-list Country' },
            { value: 'greylist', label: 'Grey-list Country' },
            { value: 'blacklist', label: 'Black-list Country' }
          ]
        },
        {
          key: 'slc34',
          label: 'SLC34: Data License',
          options: [
            { value: 'public_domain', label: 'Public Domain' },
            { value: 'permissive', label: 'Permissive' },
            { value: 'lgpl', label: 'LGPL/Intermediate' },
            { value: 'copyleft', label: 'Copyleft' },
            { value: 'proprietary', label: 'Commercial/Proprietary' }
          ]
        },
        {
          key: 'slc11',
          label: 'SLC11: Community and Ecosystem',
          options: [
            { value: 'huge', label: '>100k contributors (Widespread)' },
            { value: 'large', label: '>10k contributors (Industry-supported)' },
            { value: 'medium', label: '>1k contributors (Research/University)' },
            { value: 'small', label: '<1k contributors (Private project)' }
          ]
        },
        {
          key: 'slc12',
          label: 'SLC12: Regulatory and Legal Compliance',
          options: [
            { value: 'comprehensive_maintained', label: 'Comprehensive analysis (maintained)' },
            { value: 'comprehensive', label: 'Comprehensive analysis (not maintained)' },
            { value: 'partial_maintained', label: 'Partial analysis (maintained)' },
            { value: 'partial', label: 'Partial analysis (not maintained)' },
            { value: 'none', label: 'No compliance analysis' }
          ]
        },
        {
          key: 'slc13',
          label: 'SLC13: Funding and Sustainability',
          options: [
            { value: 'no_funding', label: 'No funding needed' },
            { value: 'unaligned', label: 'Has unaligned funding' },
            { value: 'aligned', label: 'Has company-aligned funding' },
            { value: 'none', label: 'No funding (but needed)' }
          ]
        },
        {
          key: 'slc16',
          label: 'SLC16: Interoperability',
          options: [
            { value: 'enterprise', label: 'Enterprise/Universal' },
            { value: 'domain', label: 'Domain/Integrated' },
            { value: 'functional', label: 'Functional/Distributed' },
            { value: 'connected', label: 'Connected/Peer-to-Peer' },
            { value: 'isolated', label: 'Isolated/Manual' }
          ]
        },
        {
          key: 'slc17',
          label: 'SLC17: Development Processes',
          options: [
            { value: 'all_known', label: 'All processes known' },
            { value: 'most_known', label: 'Most processes known' },
            { value: 'most_unknown', label: 'Most processes unknown' },
            { value: 'all_unknown', label: 'All processes unknown' }
          ]
        },
        {
          key: 'slc23',
          label: 'SLC23: AI Model Retraining',
          options: [
            { value: 'internal', label: 'Completely internally trained' },
            { value: 'retrained', label: 'Retrained pre-trained model' },
            { value: 'external', label: 'Externally trained model' }
          ]
        },
        {
          key: 'slc24',
          label: 'SLC24: External APIs and Services',
          options: [
            { value: 'one', label: '1 dependency' },
            { value: 'few', label: '2-4 dependencies' },
            { value: 'some', label: '5-9 dependencies' },
            { value: 'many', label: '≥10 dependencies' }
          ]
        },
        {
          key: 'slc25',
          label: 'SLC25: Explainability',
          options: [
            { value: 'whitebox', label: 'White/Grey-box (explainable)' },
            { value: 'blackbox_external', label: 'Black-box (externally explainable)' },
            { value: 'blackbox_consistent', label: 'Black-box (consistent output)' },
            { value: 'blackbox_opaque', label: 'Black-box (not explainable)' }
          ]
        }
      ]
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
          this.dbEnabled = config.database?.enabled || false;
          this.dbConnected = config.database?.connected || false;
        } else {
          // Fallback to relative URLs if config fails
          this.serverAddress = '';
          this.thresholds = {};
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
        mitigations: {
          slc1: false,
          slc2: false,
          slc3: false,
          slc5: false,
          slc33: false,
          slc34: false,
          slc11: false,
          slc12: false,
          slc13: false,
          slc16: false,
          slc17: false,
          slc23: false,
          slc24: false,
          slc25: false
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
    },
    
    exportData() {
      const exportData = {
        technologyName: this.formData.technologyName,
        description: this.formData.description,
        criteria: this.formData.criteria,
        mitigations: this.formData.mitigations,
        mitigationDescriptions: this.formData.mitigationDescriptions,
        exportDate: new Date().toISOString(),
        version: '1.0'
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
  computed: {
    Math() {
      return Math;
    }
  },
  async mounted() {
    await this.fetchConfig();
  }
});

app.mount('#app');
