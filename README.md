# Digital Sovereignty Evaluation Web App

A web application for evaluating the sovereignty level of digital technologies based on technical and legal criteria.

## Overview

This application calculates a sovereignty score based on evaluation criteria from Tables 1 and 2:
- **Technical Criteria**: Data storage/processing location, open source status, interoperability, encryption
- **Legal/Organizational Criteria**: Provider location, data governance (GDPR), contractual control, auditability, certifications

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

1. Enter the **Technology Name** (e.g., "Cloud Storage Service")
2. Add an optional **Description**
3. Select values for all **Technical Criteria**:
   - Data Storage Location
   - Data Processing Location
   - Open Source status
   - Interoperability
   - Encryption
4. Select values for all **Legal & Organizational Criteria**:
   - Provider Location
   - Data Governance (GDPR compliance)
   - Contractual Control
   - Auditability
   - Security Certifications
5. Click **Calculate Score**
6. View the results showing:
   - Overall sovereignty score (percentage)
   - Technical criteria score breakdown
   - Legal/organizational criteria score breakdown
   - Sovereignty rating (Excellent, High, Moderate, Low, Very Low)

## Scoring System

### Technical Criteria (Table 1)
Each criterion is scored from 1-3:
- **Data Storage/Processing Location**: Local (3), EU (2), Foreign (1)
- **Open Source**: Full (3), Partial (2), Closed (1)
- **Interoperability**: High/Open Standards (3), Medium (2), Low/Proprietary (1)
- **Encryption**: End-to-End (3), In Transit Only (2), None/Weak (1)

### Legal & Organizational Criteria (Table 2)
Each criterion is scored from 1-3:
- **Provider Location**: National (3), EU (2), Foreign (1)
- **Data Governance**: GDPR Full (3), GDPR Partial (2), Non-Compliant (1)
- **Contractual Control**: Full (3), Shared (2), Limited (1)
- **Auditability**: Full Transparency (3), Partial (2), Opaque (1)
- **Certifications**: Multiple EU (3), Some (2), None (1)

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
    "dataStorage": "local",
    "dataProcessing": "eu",
    "openSource": "full",
    "interoperability": "high",
    "encryption": "e2e",
    "providerLocation": "national",
    "dataGovernance": "gdpr_full",
    "contractualControl": "full",
    "auditability": "full",
    "certifications": "multiple"
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
  "technical": {
    "score": 15,
    "maxScore": 15,
    "percentage": 100,
    "details": { /* ... */ }
  },
  "legal": {
    "score": 15,
    "maxScore": 15,
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
