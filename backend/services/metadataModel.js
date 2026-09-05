/**
 * Sovereignty Metadata Model
 *
 * Three-layer descriptive model of a technology. It is a *view* over data the
 * app already collects — it does not participate in scoring.
 *
 * Every field declares where its value comes from:
 *   source: 'form'     -> formData[formField]
 *   source: 'slc'      -> formData.criteria[slc], labelled via the SLC option map
 *   source: 'metadata' -> formData.metadata[key], entered by the assessor
 *
 * Fields with `autofill: true` can be populated by the Software Heritage lookup
 * (see mapToSuggestions in swhService.js) but stay editable.
 */

// Reused by both software and data ownership — same organisation scale as SLC1
const ownershipOptions = [
  { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
  { value: 'go', label: 'Governmental Organization (GO)' },
  { value: 'po', label: 'Private Organization (PO)' },
  { value: 'unknown', label: 'Unknown / Not applicable' }
];

const metadataModel = {
  layer1: {
    code: 'Layer 1',
    name: 'Governance Layer',
    fields: {
      softwareMaintainer: {
        label: 'Software maintainer',
        source: 'metadata',
        input: 'text',
        autofill: true,
        placeholder: 'e.g. numpy (Organization)',
        help: 'Organization or individual responsible for maintaining the software'
      },
      licensingStatus: {
        label: 'Licensing status',
        source: 'metadata',
        input: 'text',
        autofill: true,
        placeholder: 'e.g. BSD-3-Clause',
        help: 'Declared SPDX licence identifier, or the category detected from the licence text'
      },
      compromisingAccessibility: {
        label: 'Compromising accessibility',
        source: 'metadata',
        input: 'select',
        options: [
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
          { value: 'unknown', label: 'Unknown' }
        ],
        help: 'Assessor judgement on whether accessibility of the software is compromised'
      },
      traceability: {
        label: 'Traceability',
        source: 'metadata',
        input: 'boolean',
        autofill: true,
        help: 'Development history is archived and can be traced (from Software Heritage)'
      },
      auditability: {
        label: 'Auditability of source code',
        source: 'metadata',
        input: 'boolean',
        autofill: true,
        help: 'Source code is available for audit (from Software Heritage)'
      },
      longTermAvailability: {
        label: 'Long-term availability',
        source: 'metadata',
        input: 'boolean',
        autofill: true,
        help: 'Archived with a recent successful capture (from Software Heritage)'
      }
    }
  },

  layer2: {
    code: 'Layer 2',
    name: 'Software description Layer',
    fields: {
      name: {
        label: 'Name',
        source: 'form',
        formField: 'technologyName'
      },
      description: {
        label: 'Description',
        source: 'form',
        formField: 'description'
      },
      version: {
        label: 'Version',
        source: 'metadata',
        input: 'text',
        autofill: true,
        placeholder: 'e.g. v2.1.0',
        help: 'Version being evaluated'
      },
      programmingLanguage: {
        label: 'Programming Language',
        source: 'metadata',
        input: 'text',
        autofill: true,
        placeholder: 'e.g. Python, C'
      },
      operatingSystem: {
        label: 'Operating System',
        source: 'metadata',
        input: 'text',
        autofill: true,
        placeholder: 'e.g. Linux, Windows, Cross-platform'
      }
    }
  },

  layer3: {
    code: 'Layer 3',
    name: 'Sustainability and Trust Layer',
    fields: {
      softwareOwnership: { label: 'Software ownership', source: 'slc', slc: 'slc1' },
      softwareCountryOfOrigin: { label: 'Software country of origin', source: 'slc', slc: 'slc2' },
      softwareLicense: { label: 'Software license', source: 'slc', slc: 'slc3' },
      dataOwnership: {
        label: 'Data ownership',
        source: 'metadata',
        input: 'select',
        options: ownershipOptions,
        help: 'Type of organization owning the data (not scored)'
      },
      dataCountryOfOrigin: { label: 'Data country of origin', source: 'slc', slc: 'slc33' },
      dataLicense: { label: 'Data license', source: 'slc', slc: 'slc34' },
      communityAndEcosystem: { label: 'Community and ecosystem', source: 'slc', slc: 'slc11' },
      regulatoryAndLegalCompliance: { label: 'Regulatory and legal compliance', source: 'slc', slc: 'slc12' },
      fundingAndSustainability: { label: 'Funding and sustainability', source: 'slc', slc: 'slc13' },
      interoperability: { label: 'Interoperability', source: 'slc', slc: 'slc16' },
      developmentProcesses: { label: 'Development processes', source: 'slc', slc: 'slc17' },
      vendorLockIn: {
        label: 'Vendor lock-in',
        source: 'metadata',
        input: 'select',
        options: [
          { value: 'none', label: 'None — fully replaceable' },
          { value: 'low', label: 'Low — replaceable with minor effort' },
          { value: 'moderate', label: 'Moderate — replaceable with significant effort' },
          { value: 'high', label: 'High — practically irreplaceable' },
          { value: 'unknown', label: 'Unknown' }
        ],
        help: 'Degree of dependence on a single vendor (not scored)'
      }
    }
  }
};

/**
 * Keys of every field stored in formData.metadata, in model order.
 */
function getMetadataFieldKeys() {
  return Object.values(metadataModel).flatMap(layer =>
    Object.entries(layer.fields)
      .filter(([, field]) => field.source === 'metadata')
      .map(([key]) => key)
  );
}

module.exports = {
  metadataModel,
  getMetadataFieldKeys
};
