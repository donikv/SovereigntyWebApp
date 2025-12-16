# Digital Sovereignty Evaluation Web App

A web application for evaluating the sovereignty level of digital technologies based on technical and legal criteria.

## Overview

This application calculates a sovereignty score based on:
- **SLC Criteria** (14 criteria): Software ownership, country of origin, licenses, update frequency, community, compliance, funding, interoperability, development processes, AI model retraining, dependencies, and explainability
- **Sovereignty Characteristics** (13 characteristics - optional): Strategic framework including autonomy, technological independence, security, legal frameworks, compliance, control, resilience, protection, interoperability, infrastructure, economic considerations, and accountability

The scoring system supports two types of sovereignty characteristic requirements:
- **SHALL** (mandatory): Calculated using product - all must be satisfied
- **SHOULD** (desirable): Calculated using average - recommended but not mandatory

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

1. Enter the **Technology Name** (e.g., "AI Model", "Software Platform")
2. Add an optional **Description**
3. **(Optional)** Select **Sovereignty Characteristics** to evaluate:
   - Click "Show" to display all 13 sovereignty characteristics
   - For each characteristic, mark it as **SHALL** (mandatory) or **SHOULD** (desirable)
   - SHALL criteria use product calculation (all must be satisfied)
   - SHOULD criteria use average calculation (recommended but flexible)
4. Fill in all **SLC Criteria** (14 fields)
5. Click **Calculate Score**
6. View the results showing:
   - Overall sovereignty score (percentage)
   - SLC criteria score breakdown
   - Sovereignty characteristics assessment (if selected)
   - Detailed breakdown of how each SLC criterion contributes to sovereignty characteristics
   - Sovereignty rating (Excellent, High, Moderate, Low, Very Low)

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
- **SHALL requirements** (mandatory): Score = Product of all normalized SLC scores contributing to this SC
- **SHOULD requirements** (desirable): Score = Average of all normalized SLC scores contributing to this SC
- **Overall Sovereignty Score** = (Product of all SHALL scores) × (Average of all SHOULD scores)

### SLC Criteria (Software, Licensing & Compliance)
- **SLC1 - Software Ownership**: NGO (3), GO (2), PO (1)
- **SLC2 - Software Country of Origin**: White-list (10), Grey-list (5), Black-list (1)
- **SLC3 - Software License**: Public Domain (5), Permissive (4), LGPL (3), Copyleft (2), Proprietary (1)
- **SLC5 - Update Frequency**: 0-12 months (direct score, lower is better)
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
    "slc5": 3,
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
    "details": { /* ... */ }
  },
  "sovereignty": {
    "overallScore": 0.95,
    "overallPercentage": 95,
    "shallScore": 0.97,
    "shouldScore": 0.98,
    "characteristics": {
      "sc1": {
        "name": "Autonomy",
        "code": "SC1",
        "type": "should",
        "score": 0.98,
        "percentage": 98,
        "contributingCriteria": [ /* ... */ ]
      }
      /* ... */
    },
    "shallCount": 2,
    "shouldCount": 2
  },
  "rating": "Excellent Sovereignty"
}
```

## Future Enhancements

- **Database Integration**: Store and retrieve evaluation results
- **User Authentication**: Allow users to save their evaluations
- **Historical Tracking**: Compare evaluations over time
- **Export Reports**: Generate PDF reports of evaluations
- **Comparative Analysis**: Compare multiple technologies side-by-side

## Dependencies

- `express`: ^4.18.2 - Web framework
- `cors`: ^2.8.5 - Enable CORS for API requests

## License

MIT
