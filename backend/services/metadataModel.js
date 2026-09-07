/**
 * Sovereignty Metadata Model
 *
 * Three-layer descriptive model of a technology. It is a *view* over data the
 * app already collects — it does not participate in scoring.
 *
 * Field descriptions and examples follow the metadata model tables
 * (Table 1: Layer 1, Table 2: Layer 2, Table 3: Layer 3).
 *
 * Every field declares where its value comes from:
 *   source: 'form'     -> formData[formField]
 *   source: 'slc'      -> formData.criteria[slc], labelled via the SLC option map
 *   source: 'metadata' -> formData.metadata[key], entered by the assessor
 *
 * Assessor fields with `allowOther: true` store EITHER a preset option value or
 * an arbitrary string. Anything that does not match a preset is treated as free
 * text and rendered verbatim, which is also how Software Heritage values that
 * have no matching preset (a maintainer name, an SPDX id) are carried through.
 *
 * Fields with `autofill: true` can be populated by the Software Heritage lookup
 * (see mapToSuggestions in swhService.js) but stay editable.
 */

const metadataModel = {
  layer1: {
    code: 'Layer 1',
    name: 'Governance Layer',
    fields: {
      softwareMaintainer: {
        label: 'Software maintainer',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        autofill: true,
        options: [
          { value: 'foundation', label: 'Foundation / non-profit' },
          { value: 'company', label: 'Company / commercial vendor' },
          { value: 'academic', label: 'Academic / research institution' },
          { value: 'government', label: 'Government / public body' },
          { value: 'community', label: 'Community / individual contributors' },
          { value: 'unmaintained', label: 'Unmaintained — no active maintainer' }
        ],
        placeholder: 'e.g. PyTorch Foundation',
        help: 'Distinguishes the entity responsible for the support and the maintenance of a software library.'
      },
      licensingStatus: {
        label: 'Licensing status',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        autofill: true,
        options: [
          { value: 'public_domain', label: 'Public domain / CC0' },
          { value: 'permissive', label: 'Permissive (MIT, BSD, Apache)' },
          { value: 'lgpl', label: 'Weak copyleft (LGPL, MPL)' },
          { value: 'copyleft', label: 'Strong copyleft (GPL, AGPL)' },
          { value: 'proprietary', label: 'Proprietary / commercial' },
          { value: 'dual', label: 'Dual / multi-licensed' },
          { value: 'undeclared', label: 'No licence declared' }
        ],
        placeholder: 'e.g. BSD License',
        help: 'Describes the legal conditions governing the use, modification, redistribution, and/or commercialization of software and its source code.'
      },
      compromisingAccessibility: {
        label: 'Compromising accessibility',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        options: [
          { value: 'open', label: 'Fully open — publicly obtainable by anyone' },
          { value: 'registration', label: 'Registration or request required' },
          { value: 'restricted', label: 'Restricted — licensed parties or NDA only' },
          { value: 'closed', label: 'Closed — source not obtainable' },
          { value: 'unknown', label: 'Unknown' }
        ],
        placeholder: 'Describe, or paste a link as evidence',
        help: "Indicates the extent to which the software's source code is available and obtainable by users, developers, or auditors."
      },
      traceability: {
        label: 'Traceability',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        autofill: true,
        options: [
          { value: 'full', label: 'Full — complete history publicly traceable' },
          { value: 'partial', label: 'Partial — releases traceable, history incomplete' },
          { value: 'minimal', label: 'Minimal — only the current version identifiable' },
          { value: 'none', label: 'None — no traceable history' },
          { value: 'unknown', label: 'Unknown' }
        ],
        placeholder: 'Describe, or paste a link as evidence',
        help: 'Represents the ability to identify and follow the origin, history, versions, modifications, and relationships of a software artifact over time.'
      },
      auditability: {
        label: 'Auditability of source code',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        autofill: true,
        options: [
          { value: 'full', label: 'Fully auditable — complete source inspectable' },
          { value: 'third_party_audited', label: 'Independently audited by a third party' },
          { value: 'partial', label: 'Partially auditable — parts of the source available' },
          { value: 'none', label: 'Not auditable — source not inspectable' },
          { value: 'unknown', label: 'Unknown' }
        ],
        placeholder: 'Describe, or paste a link as evidence',
        help: 'Describes the extent to which source code can be independently inspected, examined, and verified to assess its functionality, integrity, security, compliance, or other relevant properties.'
      },
      longTermAvailability: {
        label: 'Long-term availability',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        autofill: true,
        options: [
          { value: 'archived', label: 'Archived in a public archive (e.g. Software Heritage)' },
          { value: 'community', label: 'Community-driven collaboration' },
          { value: 'institutional', label: 'Institutional or foundation backing' },
          { value: 'single_vendor', label: 'Single-vendor hosted — depends on one provider' },
          { value: 'none', label: 'No guarantee' },
          { value: 'unknown', label: 'Unknown' }
        ],
        placeholder: 'e.g. Community-driven collaboration',
        help: 'Represents the ability to ensure that the software and/or its source code remains accessible, identifiable, and retrievable over time, including after the original repository, organization, or hosting service changes or disappears.'
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
        // A release identifier has no meaningful preset list — free text only
        label: 'Version',
        source: 'metadata',
        input: 'text',
        autofill: true,
        placeholder: 'e.g. 2.21.0',
        help: 'Identification of the release or state of the software.'
      },
      programmingLanguage: {
        label: 'Programming Language',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        autofill: true,
        options: [
          { value: 'python', label: 'Python' },
          { value: 'javascript', label: 'JavaScript / TypeScript' },
          { value: 'java', label: 'Java' },
          { value: 'c', label: 'C' },
          { value: 'cpp', label: 'C++' },
          { value: 'csharp', label: 'C#' },
          { value: 'go', label: 'Go' },
          { value: 'rust', label: 'Rust' }
        ],
        placeholder: 'e.g. C++, Python and others',
        help: 'Define the name of the programming language or languages in which the software is implemented, such as Python, Java, C++, or JavaScript.'
      },
      operatingSystem: {
        label: 'Operating System',
        source: 'metadata',
        input: 'select',
        allowOther: true,
        autofill: true,
        options: [
          { value: 'cross_platform', label: 'Cross-platform (Linux, macOS, Windows)' },
          { value: 'linux', label: 'Linux' },
          { value: 'windows', label: 'Windows' },
          { value: 'macos', label: 'macOS' },
          { value: 'unix', label: 'Unix-like (BSD, Solaris)' },
          { value: 'android', label: 'Android' },
          { value: 'ios', label: 'iOS' },
          { value: 'platform_independent', label: 'Browser / platform-independent' }
        ],
        placeholder: 'e.g. Linux, macOS, Windows/WSL2',
        help: 'Identify the operating system or environment on which the software is designed and can run, such as Linux, Windows, or macOS.'
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
        allowOther: true,
        options: [
          { value: 'in_house', label: 'In-house / own organization' },
          { value: 'commercial', label: 'Commercial provider' },
          { value: 'public_open', label: 'Public / open dataset' },
          { value: 'government', label: 'Government / public body' },
          { value: 'academic', label: 'Academic / research institution' },
          { value: 'mixed', label: 'Mixed / multiple owners' },
          { value: 'not_applicable', label: 'Not applicable — no data used' },
          { value: 'unknown', label: 'Unknown' }
        ],
        placeholder: 'e.g. Google Research',
        help: 'Identify the owner of the data that the software is used with. More specifically for machine learning technology.'
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
        allowOther: true,
        options: [
          { value: 'none', label: 'None — full control, fully replaceable' },
          { value: 'low', label: 'Low — largely under own control' },
          { value: 'moderate', label: 'Moderate — significant effort to replace' },
          { value: 'high', label: 'High — little control, practically irreplaceable' },
          { value: 'unknown', label: 'Unknown' }
        ],
        placeholder: 'e.g. Low',
        help: 'Define the level of control over the technology and the infrastructure.'
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
