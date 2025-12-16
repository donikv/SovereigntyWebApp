# Digital Sovereignty Evaluation Web App

A web application for evaluating the sovereignty level of digital technologies based on technical and legal criteria.

## Overview

This application calculates a sovereignty score based on SLC (Software, Licensing & Compliance) evaluation criteria:
- **SLC Criteria** (14 criteria): Software ownership, country of origin, licenses, update frequency, community, compliance, funding, interoperability, development processes, AI model retraining, dependencies, and explainability

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
3. Select values for all **SLC Criteria** (14 fields including software ownership, licenses, community size, compliance, funding, interoperability, development processes, AI model retraining, dependencies, and explainability)
4. Click **Calculate Score**
5. View the results showing:
   - Overall sovereignty score (percentage)
   - SLC criteria score breakdown with detailed results
   - Sovereignty rating (Excellent, High, Moderate, Low, Very Low)

## Scoring System

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
