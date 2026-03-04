// SLC Input Component
const SlcInput = {
  name: 'SlcInput',
  props: {
    slcKey: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    },
    mitigation: {
      type: Boolean,
      default: false
    },
    mitigationDescription: {
      type: String,
      default: ''
    },
    thresholds: {
      type: Array,
      default: () => []
    },
    hasThresholds: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'update:mitigation', 'update:mitigationDescription'],
  template: `
    <div class="form-group">
      <div class="slc-header">
        <label :for="slcKey">{{ label }} *</label>
        <label class="mitigation-label">
          <input 
            type="checkbox" 
            :checked="mitigation"
            @change="$emit('update:mitigation', $event.target.checked)"
          >
          <span>Mitigation</span>
        </label>
      </div>
      <select 
        :id="slcKey" 
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        required
      >
        <option value="">Select...</option>
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <div v-if="hasThresholds" class="threshold-info">
        <div class="threshold-info-title">Thresholds for SHALL SCs under evaluation:</div>
        <div 
          v-for="threshold in thresholds" 
          :key="threshold.scKey" 
          class="threshold-item"
        >
          <strong>{{ threshold.scCode }}: </strong> &nbsp; {{ threshold.thresholdLabel }}
        </div>
      </div>
      <div v-if="mitigation" class="mitigation-description">
        <label :for="slcKey + '-mitigation'">Mitigation Description:</label>
        <textarea 
          :id="slcKey + '-mitigation'" 
          :value="mitigationDescription"
          @input="$emit('update:mitigationDescription', $event.target.value)"
          rows="2"
          placeholder="Describe the mitigation measures..."
        ></textarea>
      </div>
    </div>
  `
};
