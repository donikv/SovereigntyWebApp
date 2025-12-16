# Digital Sovereignty Evaluation Web App

A web application for evaluating the sovereignty level of digital technologies based on Software, Licensing, and Compliance (SLC) criteria with optional strategic sovereignty characteristics assessment.

## Overview

This application calculates sovereignty scores for technologies based on:
- **SLC Criteria** (14 criteria): Measurable attributes including software ownership, licensing, compliance, update frequency, community support, funding, interoperability, and AI-specific factors
- **Sovereignty Characteristics** (13 characteristics - optional): Strategic framework for evaluating autonomy, independence, security, resilience, and accountability
- **Mitigation & Thresholds**: Risk mitigation strategies and pass/fail thresholds for strict compliance checking

### Key Features

- **Normalized Scoring**: All criteria normalized to 0-1 range for fair comparison
- **Flexible Assessment**: Optional sovereignty characteristics with SHALL/SHOULD designation
- **Threshold-Based Evaluation**: Set minimum requirements for SHALL criteria
- **Mitigation Framework**: Support for risk mitigation strategies
- **Import/Export**: Save and load evaluations as JSON files
- **Collapsible Thresholds**: Clean UI with expandable threshold settings per criterion

## Scoring Methodology

### Basic Concepts

**SHALL vs SHOULD Requirements:**
- **SHALL** (mandatory): Non-negotiable requirements with strict evaluation
- **SHOULD** (desirable): Recommended but flexible requirements with averaged scoring

**Mitigation:**
- Represents compensating controls or risk management strategies
- Changes how a criterion contributes to SHALL requirements
- Does not affect SHOULD requirements

**Thresholds:**
- Set minimum acceptable values for SHALL requirements
- Only applies to non-mitigated SHALL criteria
- Results in binary pass/fail evaluation (1 or 0)

### Score Calculation Process

#### 1. Normalization
All SLC criteria are normalized to 0-1 range:
```
normalized_score = (actual_score - min_score) / (max_score - min_score)
```

#### 2. SHALL Characteristic Scoring
For characteristics marked as SHALL:

**Non-mitigated criteria:**
- If score ≥ threshold: contributes 1 (pass)
- If score < threshold: contributes 0 (fail)
- Final non-mitigated component = **product** of all pass/fail values

**Mitigated criteria:**
- Uses normalized score (0-1)
- Final mitigated component = **average** of normalized scores

**Combined SHALL score:**
```
SHALL_score = (product of non-mitigated) × (average of mitigated)
```

#### 3. SHOULD Characteristic Scoring
For characteristics marked as SHOULD:
- All criteria use normalized scores (0-1)
- Mitigation has no effect on calculation
- Final SHOULD score = **average** of all normalized scores

#### 4. Per-Characteristic Score
```
SC_score = SHALL_component × SHOULD_component
```
- If marked as SHALL only: SHALL_component × 1
- If marked as SHOULD only: 1 × SHOULD_component

#### 5. Overall Sovereignty Score
```
Overall_score = product of all selected SC scores
```

### Example Calculation

**Scenario:**
- SC1 (Autonomy) marked as SHALL
- Contributing SLCs: SLC1 (no mitigation, threshold set), SLC3 (mitigated), SLC5 (no mitigation, no threshold)

**Calculation:**
1. SLC1: score 0.8, threshold 0.6 → meets threshold → contributes 1
2. SLC3: score 0.7, mitigated → contributes 0.7 (averaged)
3. SLC5: score 0.5, no threshold set → contributes 1 (default pass)
4. Non-mitigated product: 1 × 1 = 1
5. Mitigated average: 0.7 / 1 = 0.7
6. SC1 SHALL score: 1 × 0.7 = 0.7
7. SC1 SHOULD component: 1 (not marked as SHOULD)
8. SC1 final score: 0.7 × 1 = 0.7 (70%)

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vue.js 3 (CDN version, no build step)
- **Styling**: Vanilla CSS with responsive design

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

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage Guide

### 1. Basic Information
- Enter **Technology Name** (required)
- Add **Description** (optional)

### 2. Data Management
- **📥 Export Data**: Save current evaluation as JSON
- **📤 Import Data**: Load previously saved evaluation

### 3. Sovereignty Characteristics (Optional)
- Click **Show** to display all 13 characteristics
- For each characteristic:
  - Click **SHALL** for mandatory requirements
  - Click **SHOULD** for desirable requirements
  - Click again to deselect

### 4. SLC Criteria (Required)
For each of the 14 criteria:
- Select value from dropdown
- Check **Mitigation** if compensating controls exist
- Click **▶ Set Threshold** to expand threshold settings (for SHALL evaluation)
- Select minimum acceptable value for pass/fail evaluation

### 5. Calculate & Review
- Click **Calculate Score** to see results:
  - Overall sovereignty score
  - Per-characteristic breakdown with SHALL/SHOULD components
  - Contributing SLC criteria with pass/fail indicators
  - Normalized scores and raw values

### 6. Reset
- Click **Reset** to clear all inputs

## SLC Criteria Reference

### Software & Licensing
- **SLC1 - Software Ownership**: NGO (3) > GO (2) > PO (1)
- **SLC2 - Software Country**: White-list (10) > Grey-list (5) > Black-list (1)
- **SLC3 - Software License**: Public Domain (5) > Permissive (4) > LGPL (3) > Copyleft (2) > Proprietary (1)
- **SLC5 - Update Frequency**: 1 month (1) to 12+ months (12)

### Data
- **SLC33 - Data Country**: White-list (10) > Grey-list (5) > Black-list (1)
- **SLC34 - Data License**: Public Domain (5) > Permissive (4) > LGPL (3) > Copyleft (2) > Proprietary (1)

### Community & Compliance
- **SLC11 - Community Size**: >100k (4) > >10k (3) > >1k (2) > <1k (1)
- **SLC12 - Regulatory Compliance**: Comprehensive maintained (5) > Comprehensive (4) > Partial maintained (3) > Partial (2) > None (1)
- **SLC13 - Funding**: No funding needed (4) > Unaligned (3) > Aligned (2) > None (1)

### Technical
- **SLC16 - Interoperability**: Enterprise (5) > Domain (4) > Functional (3) > Connected (2) > Isolated (1)
- **SLC17 - Development Processes**: All known (4) > Most known (3) > Most unknown (2) > All unknown (1)

### AI-Specific
- **SLC23 - AI Model Retraining**: Internal (3) > Retrained (2) > External (1)
- **SLC24 - External Dependencies**: 1 (4) > 2-4 (3) > 5-9 (2) > ≥10 (1)
- **SLC25 - Explainability**: White-box (3) > External (2) > Consistent (1) > Opaque (0)

## Sovereignty Characteristics

1. **SC1: Autonomy** - Autonomous decision-making
2. **SC2: Technological Independence** - Self-sufficiency
3. **SC3: Security & Integrity** - Cyber protection
4. **SC4: Legal & Ethical** - Compliance with laws
5. **SC5: International Compliance** - External dependencies
6. **SC6: Import/Export Control** - Technology trade
7. **SC7: Resilience** - Recovery capabilities
8. **SC8: Indispensability** - Strategic capabilities
9. **SC9: Protection** - Infrastructure safety
10. **SC10: Openness** - System compatibility
11. **SC11: Infrastructure** - Infrastructure control
12. **SC12: Economic** - Economic viability
13. **SC13: Accountability** - Clear accountability

## API Reference

### POST `/api/calculate-score`

**Request Body:**
```json
{
  "technologyName": "Example Technology",
  "description": "Optional description",
  "criteria": {
    "slc1": "ngo",
    "slc2": "whitelist",
    "slc3": "public_domain",
    ...
  },
  "mitigations": {
    "slc1": false,
    "slc2": false,
    "slc3": true,
    ...
  },
  "thresholds": {
    "slc1": "go",
    "slc2": "",
    "slc3": "permissive",
    ...
  },
  "selectedSC": {
    "sc1": "shall",
    "sc2": "should"
  }
}
```

**Response:**
```json
{
  "technologyName": "Example Technology",
  "sovereignty": {
    "overallScore": 0.85,
    "overallPercentage": 85,
    "characteristics": {
      "sc1": {
        "name": "Autonomy",
        "type": "shall",
        "score": 0.85,
        "percentage": 85,
        "contributingCriteria": [
          {
            "name": "SLC1: Software Ownership",
            "normalizedScore": 1,
            "meetsThreshold": true,
            "hasMitigation": false
          }
        ]
      }
    }
  },
  "slc": {
    "details": { ... }
  }
}
```

## Dependencies

- `express`: ^4.18.2 - Web framework
- `cors`: ^2.8.5 - CORS support

## License

MIT

