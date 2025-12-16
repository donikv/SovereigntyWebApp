# Digital Sovereignty Evaluation Web App

A web application for evaluating the sovereignty level of digital technologies for military AI systems based on Software, Licensing, and Compliance (SLC) criteria with optional strategic sovereignty characteristics assessment.

## Overview

This application calculates sovereignty scores for technologies based on:
- **SLC Criteria** (14 criteria): Software ownership, country of origin, licenses, update frequency, community, compliance, funding, interoperability, development processes, AI model retraining, dependencies, and explainability
- **Sovereignty Characteristics** (13 characteristics - optional): Strategic framework including autonomy, technological independence, security, legal frameworks, compliance, control, resilience, protection, interoperability, infrastructure, economic considerations, and accountability
- **Mitigation Support**: Each SLC criterion can be marked as mitigated, affecting how it contributes to SHALL requirements

### Key Features

- **Normalized Scoring**: All SLC criteria are normalized to 0-1 range for fair comparison
- **Flexible Assessment**: Optional sovereignty characteristics with SHALL/SHOULD designation
- **Mitigation Framework**: Support for risk mitigation strategies
- **Import/Export**: Save and load evaluations as JSON files

## Scoring Methodology

### SHALL vs SHOULD Requirements

When evaluating sovereignty characteristics, you can mark each as:
- **SHALL** (mandatory): Non-negotiable requirements
  - Non-mitigated SLCs: Calculated using **product** (multiply scores)
  - Mitigated SLCs: Calculated using **average** (sum/count)
  - Final SHALL score = (Product of non-mitigated) × (Average of mitigated)
- **SHOULD** (desirable): Recommended but flexible requirements
  - All SLCs: Calculated using **average** regardless of mitigation

### Mitigation Impact

Mitigations represent risk management strategies:
- Check "Mitigation" for any SLC where compensating controls exist
- For **SHALL** characteristics: Mitigated SLCs are treated more leniently (averaged instead of multiplied)
- For **SHOULD** characteristics: Mitigations don't change the calculation (always averaged)
- Overall SC score = SHALL score × SHOULD score
- Final sovereignty score = Product of all selected SC scores

## Tech Stack

- **Backend**: Node.js with Express.js (minimal dependencies)
- **Frontend**: Vue.js 3 (CDN version, no build step required)
- **Database**: Prepared for future integration (not currently implemented)

## Project Structure

```
SoveregnityWebApp/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/
│   │   └── scoring.js         # API routes
│   └── services/
│       └── scoringService.js  # Scoring calculation logic
├── frontend/
│   ├── index.html             # Main HTML page
│   ├── app.js                 # Vue.js application
│   └── styles.css             # Styling
├── package.json               # Dependencies
└── README.md                  # This file
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the Application

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

1. **Enter Technology Information**
   - Technology Name (required)
   - Description (optional)

2. **Import/Export Data** (optional)
   - 📥 **Export Data**: Save current evaluation as JSON file
   - 📤 **Import Data**: Load previously saved evaluation

3. **Select Sovereignty Characteristics** (optional)
   - Click "Show" to display all 13 sovereignty characteristics
   - For each characteristic you want to evaluate:
     - Click **SHALL** for mandatory requirements
     - Click **SHOULD** for desirable requirements
   - Click the same button again to deselect

4. **Fill in SLC Criteria** (required)
   - Complete all 14 SLC criteria dropdowns
   - Check **Mitigation** checkbox for any criterion where risk mitigation exists

5. **Calculate Score**
   - Click "Calculate Score" button
   - View results including:
     - Overall sovereignty score (0-1 numerical value when SCs selected, percentage otherwise)
     - SLC criteria breakdown with raw and normalized scores
     - Sovereignty characteristics assessment with contributing criteria
     - Mitigation indicators showing which criteria have mitigations applied

6. **Reset Form**
   - Click "Reset" to clear all inputs and start fresh

## Scoring System

### Sovereignty Characteristics (Optional Strategic Framework)
Users can select which of the 13 sovereignty characteristics to evaluate:

1. **SC1: Autonomy** - Autonomous decision-making with human supervision
2. **SC2: Technological Independence** - Self-sufficiency in AI development
3. **SC3: Security and Digital Integrity** - Protection against cyber threats
4. **SC4: Legal and Ethical Frameworks** - Compliance with laws and ethical norms
5. **SC5: International Compliance** - Minimize external dependencies
6. **SC6: Control over Import/Export** - Regulate AI technology trade
7. **SC7: Resilience** - Robust and swift recovery from disruptions
8. **SC8: Indispensability** - Promote indispensable capabilities to allies
9. **SC9: Protection** - No negative impact on critical infrastructure
10. **SC10: Openness and Interoperability** - System compatibility
11. **SC11: Infrastructure Sovereignty** - Control over AI infrastructure
12. **SC12: Economic Considerations** - Economically viable development
13. **SC13: Accountability** - Clear accountability mechanisms

**Scoring Method:**
- Each SLC criterion score is normalized to 0-1 range
- **SHALL requirements** with mitigations:
  - Non-mitigated SLCs: Product (multiply all scores)
  - Mitigated SLCs: Average (sum/count)
  - Final SHALL score = (Product of non-mitigated) × (Average of mitigated)
- **SHALL requirements** without mitigations: Product of all normalized SLC scores
- **SHOULD requirements**: Average of all normalized SLC scores (regardless of mitigation)
- **Per-SC Score** = SHALL component × SHOULD component
- **Overall Sovereignty Score** = Product of all selected SC scores

### SLC-to-SC Mapping

Each SLC criterion contributes to one or more sovereignty characteristics:

- **SLC1** (Software Ownership) → SC1, SC2, SC3, SC8, SC9, SC11, SC12
- **SLC2** (Software Country) → SC1, SC2, SC3, SC8, SC9, SC11, SC12
- **SLC3** (Software License) → SC1, SC4, SC5
- **SLC5** (Update Frequency) → SC1, SC3, SC12
- **SLC33** (Data Country) → SC1, SC3, SC8, SC9, SC11
- **SLC34** (Data License) → SC1, SC8
- **SLC11** (Community) → SC1, SC2, SC3, SC8
- **SLC12** (Compliance) → SC1, SC4, SC5, SC13
- **SLC13** (Funding) → SC1, SC8, SC12
- **SLC16** (Interoperability) → SC1, SC8, SC10
- **SLC17** (Development) → SC1, SC6, SC7, SC8, SC9
- **SLC23** (AI Retraining) → SC1, SC7, SC8
- **SLC24** (APIs/Services) → SC1, SC8, SC9, SC11, SC13
- **SLC25** (Explainability) → SC1, SC9, SC13

### SLC Criteria (Software, Licensing & Compliance)

All criteria scores are **normalized to 0-1 range** for fair comparison:

- **SLC1 - Software Ownership**: NGO (3), GO (2), PO (1)
- **SLC2 - Software Country of Origin**: White-list (10), Grey-list (5), Black-list (1)
- **SLC3 - Software License**: Public Domain (5), Permissive (4), LGPL (3), Copyleft (2), Proprietary (1)
- **SLC5 - Update Frequency**: 1 month (1) to 12+ months (12) - dropdown selection
- **SLC33 - Data Country of Origin**: White-list (10), Grey-list (5), Black-list (1)
- **SLC34 - Data License**: Public Domain (5), Permissive (4), LGPL (3), Copyleft (2), Proprietary (1)
- **SLC11 - Community Size**: >100k (4), >10k (3), >1k (2), <1k (1)
- **SLC12 - Regulatory Compliance**: Comprehensive maintained (5), Comprehensive (4), Partial maintained (3), Partial (2), None (1)
- **SLC13 - Funding**: No funding needed (4), Unaligned funding (3), Aligned funding (2), No funding (1)
- **SLC16 - Interoperability**: Enterprise (5), Domain (4), Functional (3), Connected (2), Isolated (1)
- **SLC17 - Development Processes**: All known (4), Most known (3), Most unknown (2), All unknown (1)
- **SLC23 - AI Model Retraining**: Internal (3), Retrained (2), External (1)
- **SLC24 - Dependencies**: 1 (4), 2-4 (3), 5-9 (2), ≥10 (1)
- **SLC25 - Explainability**: White/Grey-box (3), External explainability (2), Consistent (1), Not explainable (0)

**Note**: Normalization formula: `(score - min) / (max - min)` ensures all criteria contribute fairly regardless of their original score range.

### Sovereignty Rating
- **90-100%**: Excellent Sovereignty
- **75-89%**: High Sovereignty
- **60-74%**: Moderate Sovereignty
- **40-59%**: Low Sovereignty
- **<40%**: Very Low Sovereignty

## API Endpoints

### POST `/api/calculate-score`
Calculate the sovereignty score for a technology.

**Request Body:**
```json
{
  "technologyName": "Example Technology",
  "description": "Optional description",
  "criteria": {
    "slc1": "ngo",
    "slc2": "whitelist",
    "slc3": "public_domain",
    "slc5": "3",
    "slc33": "whitelist",
    "slc34": "permissive",
    "slc11": "huge",
    "slc12": "comprehensive_maintained",
    "slc13": "no_funding",
    "slc16": "enterprise",
    "slc17": "all_known",
    "slc23": "internal",
    "slc24": "one",
    "slc25": "whitebox"
  },
  "mitigations": {
    "slc1": false,
    "slc2": false,
    "slc3": true,
    "slc5": false,
    "slc33": false,
    "slc34": false,
    "slc11": false,
    "slc12": false,
    "slc13": false,
    "slc16": false,
    "slc17": true,
    "slc23": false,
    "slc24": false,
    "slc25": false
  },
  "selectedSC": {
    "sc1": "should",
    "sc2": "shall",
    "sc4": "shall",
    "sc11": "should"
  }
}
```

**Response:**
```json
{
  "technologyName": "Example Technology",
  "description": "Optional description",
  "totalScore": 30,
  "maxScore": 30,
  "percentageScore": 100,
  "slc": {
    "score": 70,
    "maxScore": 70,
    "percentage": 100,
    "details": {
      "slc1": {
        "name": "SLC1: Software Ownership",
        "selection": "Non-Governmental Organization (NGO)",
        "score": 3,
        "normalizedScore": 1
      }
      /* ... other SLC details ... */
    }
  },
  "sovereignty": {
    "overallScore": 0.95,
    "overallPercentage": 95,
    "characteristics": {
      "sc1": {
        "name": "Autonomy",
        "code": "SC1",
        "type": "should",
        "shallScore": 1,
        "shouldScore": 0.98,
        "score": 0.98,
        "percentage": 98,
        "contributingCriteria": [
          {
            "slc": "slc1",
            "name": "SLC1: Software Ownership",
            "score": 3,
            "maxScore": 3,
            "normalizedScore": 1,
            "hasMitigation": false
          }
          /* ... other contributing criteria ... */
        ],
        "mitigatedCount": 1,
        "nonMitigatedCount": 6
      }
      /* ... other SC details ... */
    },
    "selectedCount": 4
  },
  "rating": "Excellent Sovereignty"
}
```

## Future Enhancements

- **Database Integration**: Store and retrieve evaluation results
- **User Authentication**: Allow users to save and manage their evaluations
- **Historical Tracking**: Compare evaluations over time
- **Export Reports**: Generate PDF reports with charts and visualizations
- **Comparative Analysis**: Side-by-side comparison of multiple technologies
- **Custom Weighting**: Allow users to adjust importance of different criteria
- **Mitigation Documentation**: Add text descriptions for each mitigation strategy


## Dependencies

- `express`: ^4.18.2 - Web framework
- `cors`: ^2.8.5 - Enable CORS for API requests

## License

MIT

