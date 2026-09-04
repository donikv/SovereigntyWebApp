# Digital Sovereignty Evaluation Web App

A web application for evaluating the sovereignty level of digital technologies based on Sovereignty Linked Criteria (SLC) to evaluate sovereignty characteristics. The app is deployed for testing purposes [here](http://zver11.zesoi.fer.hr:8081).

## Overview

This application calculates sovereignty scores for technologies based on:
- **SLC Criteria** (14 criteria): Measurable attributes including software ownership, licensing, compliance, update frequency, community support, funding, interoperability, and AI-specific factors
- **Sovereignty Characteristics** (13 characteristics): Strategic framework for evaluating autonomy, independence, security, resilience, accountability...
- **Mitigation & Thresholds**: Risk mitigation strategies and pass/fail thresholds for strict compliance checking

### Key Features

- **Normalized Scoring**: All criteria normalized to 0-1 range for fair comparison
- **Flexible Assessment**: Optional sovereignty characteristics with SHALL/SHOULD designation
- **Threshold-Based Evaluation**: Set minimum requirements for SHALL criteria
- **Mitigation Framework**: Support for risk mitigation strategies
- **Import/Export**: Save and load evaluations as JSON files

## Scoring Methodology

### Basic Concepts

**SHALL vs SHOULD Requirements:**
- **SHALL** (mandatory): Non-negotiable requirements with strict evaluation, that link directly to a Sovereignty Hazard (SH)
- **SHOULD** (desirable): Recommended but more flexible requirements with averaged scoring, whose failure does not lead directly to an SH.

**Mitigation:**
- Represents compensating controls or risk management strategies
- Changes how a criterion contributes to SH through SHALL requirements by providing a indirect path to SH

**Thresholds:**
- Set minimum acceptable values for SHALL requirements
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
- Contributing SLCs: SLC1 (no mitigation, threshold set), SLC3 (mitigated), SLC5 (no mitigation, no threshold, special case that is not recommended in practice)

**Calculation:**
1. SLC1: score 0.8, threshold 0.6 → meets threshold → contributes 1
2. SLC3: score 0.7, mitigated → contributes 0.7 (averaged)
3. SLC5: score 0.5, no threshold set → contributes 1
4. Non-mitigated product: 1 × 1 = 1
5. Mitigated average: 0.7 / 1 = 0.7
6. SC1 SHALL score: 1 × 0.7 = 0.7
7. SC1 SHOULD component: 1 (not marked as SHOULD)
8. SC1 final score: 0.7 × 1 = 0.7 (70%)

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vue.js 3 (CDN version, no build step)
- **Database**: MongoDB with abstraction layer for easy migration
- **Styling**: Vanilla CSS with responsive design

## Project Structure

```
SoveregnityWebApp/
├── backend/
│   ├── server.js              # Express server with DB initialization
│   ├── database/
│   │   ├── DatabaseAdapter.js # Abstract database interface
│   │   ├── MongoDBAdapter.js  # MongoDB implementation
│   │   ├── DatabaseFactory.js # Database factory for easy switching
│   │   └── index.js           # Database module exports
│   ├── routes/
│   │   ├── scoring.js         # API routes with DB operations
│   │   └── swh.js             # Software Heritage lookup endpoint
│   └── services/
│       ├── scoringService.js  # Scoring calculation logic
│       ├── metadataModel.js   # Sovereignty Metadata Model definition (3 layers)
│       └── swhService.js      # Software Heritage fetching and field mapping
├── frontend/
│   ├── index.html             # Main HTML page
│   ├── app.js                 # Vue.js application
│   ├── styles.css             # Styling
│   ├── components/
│   │   └── SlcInput.js        # Reusable SLC criterion input
│   └── thresholds/
│       ├── thresholds.html    # Thresholds configuration page
│       └── thresholds.js      # Thresholds management logic
├── .env.example               # Environment variables template
├── thresholds.json            # Threshold configuration -> Can be generated using thresholds.js (requires redeployment)
├── package.json               # Dependencies
└── README.md                  # This file
```

## Installation & Running

### Quick Start with Docker (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Start the application and database
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application at http://localhost:3000

# Stop the application
docker-compose down
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

### Manual Installation

#### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)

#### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database settings:
   ```env
   # Server Configuration
   PORT=3000
   SERVER_ADDRESS=localhost
   
   # Database Configuration
   DB_ENABLED=true
   DB_TYPE=mongodb
   
   # MongoDB Configuration (Local)
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=sovereignty_db
   
   # Or use MongoDB Atlas (Cloud)
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   # MONGODB_DB_NAME=sovereignty_db
   ```

3. **Start MongoDB (if using local instance):**
   ```bash
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Running Without Database

If you want to run the application without database functionality:

```bash
# In .env file, set:
DB_ENABLED=false

# Or run with environment variable:
DB_ENABLED=false npm start
```

## Usage Guide

### 1. Basic Information
- Enter **Technology Name** (required)
- Add **Description** (optional)

### 2. Data Management
- **📥 Export Data**: Save current evaluation as JSON (client-side)
- **📤 Import Data**: Load previously saved evaluation (client-side)
- **View Saved Evaluations**: Browse all evaluations stored in database (requires DB)
- **Export All (JSON)**: Export all evaluations from database (requires DB)
- **Export All (CSV)**: Export all evaluations as CSV (requires DB)

### 3. Sovereignty Metadata Model (Optional)
- Click **Show** to reveal the fields that are not collected anywhere else
- Click **View Metadata Model** to open the compiled 3-layer table, with **Save as PNG** / **Copy JSON**
- These fields are descriptive only and **do not affect the sovereignty score**

### 4. Sovereignty Characteristics (At least one needs to be selected)
- Click **Show** to display all 13 characteristics
- For each characteristic:
  - Click **SHALL** for mandatory requirements
  - Click **SHOULD** for desirable requirements
  - Click again to deselect

### 5. SLC Criteria (Required)
For each of the 14 criteria:
- Select value from dropdown
- Check **Mitigation** if compensating controls exist
- Select minimum acceptable value for pass/fail evaluation
- Thresholds are set during initialization of the app, and cannot be changed during running (The app provides an interface to create the thresholds.json file for future deployment)

### 6. Calculate & Review
- Click **Calculate Score** to see results:
  - Overall sovereignty score
  - Per-characteristic breakdown with SHALL/SHOULD components
  - Contributing SLC criteria with pass/fail indicators
  - Normalized scores and raw values

### 7. Reset
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

## Sovereignty Metadata Model

A compact, three-layer descriptive record of the technology under evaluation. It is a **view over data the app already collects** — 18 of its 23 fields reuse existing SLC criteria, form inputs, or Software Heritage lookup results. The model is defined in `backend/services/metadataModel.js` and served to the frontend via `/api/config`.

**The metadata model does not participate in scoring.** Adding or changing metadata values never changes a sovereignty score.

### Layer 1: Governance Layer

| Field | Source |
|---|---|
| Software maintainer | Auto-filled from SWH/GitHub repository owner |
| Licensing status | Auto-filled — declared SPDX identifier, or the category detected from the licence text |
| Compromising accessibility | Assessor judgement (Yes / No / Unknown) with a free-text justification |
| Traceability | Auto-filled — archived development history exists in Software Heritage |
| Auditability of source code | Auto-filled — source available for audit |
| Long-term availability | Auto-filled — archived with a recent successful capture |

### Layer 2: Software description Layer

| Field | Source |
|---|---|
| Name | Technology Name field |
| Description | Description field |
| Version | Auto-filled from the latest published release tag |
| Programming Language | Auto-filled from the repository's primary language |
| Operating System | Auto-filled from codemeta `operatingSystem` when present, else manual |

### Layer 3: Sustainability and Trust Layer

| Field | Source |
|---|---|
| Software ownership | SLC1 |
| Software country of origin | SLC2 |
| Software license | SLC3 |
| Data ownership | Manual (same organisation scale as SLC1) |
| Data country of origin | SLC33 |
| Data license | SLC34 |
| Community and ecosystem | SLC11 |
| Regulatory and legal compliance | SLC12 |
| Funding and sustainability | SLC13 |
| Interoperability | SLC16 |
| Development processes | SLC17 |
| Vendor lock-in | Manual (None / Low / Moderate / High / Unknown) |

### Output

**View Metadata Model** opens the compiled table, grouped by layer, with each row tagged by its source (e.g. `SLC1`, `SWH / Manual`). From there:
- **Save as PNG** — renders the table to an image, sized for inclusion in reports and slides
- **Copy JSON** — copies the resolved model to the clipboard

Metadata is persisted with the evaluation and is included in Export/Import Data.

### Adding a field

Add an entry to the relevant layer in `backend/services/metadataModel.js`. The frontend renders inputs and table rows from that definition — no UI changes are needed. Each field declares its `source`:
- `'form'` + `formField` — read from a top-level form field
- `'slc'` + `slc` — read from an SLC criterion, labelled with that criterion's option label
- `'metadata'` + `input` (`text` / `textarea` / `select` / `boolean`) — assessor-entered; add `autofill: true` if the Software Heritage lookup can populate it (then map it in `mapToSuggestions` in `backend/services/swhService.js`)

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

Calculate sovereignty score and optionally save to database.

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
  "mitigationDescriptions": {
    "slc3": "Mitigation strategy description",
    ...
  },
  "selectedSC": {
    "sc1": "shall",
    "sc2": "should"
  },
  "metadata": {
    "softwareMaintainer": "numpy (Organization)",
    "licensingStatus": "BSD-3-Clause",
    "version": "v2.5.2",
    "programmingLanguage": "Python",
    "traceability": true,
    "vendorLockIn": "low",
    ...
  },
  "saveToDb": true
}
```

`metadata` is optional and does not affect scoring — see [Sovereignty Metadata Model](#sovereignty-metadata-model).

**Response:**
```json
{
  "technologyName": "Example Technology",
  "id": "507f1f77bcf86cd799439011",
  "saved": true,
  "results": {
    "overallScore": 0.85,
    "slcScore": 0.90,
    "scScore": 0.85,
    "finalScore": 85,
    "classification": "High Sovereignty",
    "sovereignty": {
      "overallScore": 0.85,
      "overallPercentage": 85,
      "characteristics": { ... }
    },
    "slc": {
      "details": { ... }
    }
  }
}
```

### GET `/api/evaluations`

Get all saved evaluations with pagination.

**Query Parameters:**
- `limit` (default: 100) - Number of results per page
- `skip` (default: 0) - Number of results to skip
- `sort` (default: 'createdAt') - Field to sort by
- `order` (default: 'desc') - Sort order (asc/desc)

**Response:**
```json
{
  "evaluations": [...],
  "statistics": {
    "total": 50,
    "averageScores": {
      "avgOverallScore": 75.5,
      "avgSlcScore": 80.2,
      "avgScScore": 72.1,
      "avgFinalScore": 75.5
    },
    "scoreDistribution": [...]
  },
  "total": 50,
  "limit": 100,
  "skip": 0
}
```

### GET `/api/evaluations/:id`

Get a single evaluation by ID.

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "technologyName": "Example Technology",
  "description": "...",
  "criteria": { ... },
  "results": { ... },
  "createdAt": "2026-01-09T10:30:00.000Z",
  "updatedAt": "2026-01-09T10:30:00.000Z"
}
```

### DELETE `/api/evaluations/:id`

Delete an evaluation.

**Response:**
```json
{
  "success": true,
  "message": "Evaluation deleted"
}
```

### GET `/api/statistics`

Get evaluation statistics.

**Response:**
```json
{
  "total": 50,
  "averageScores": {
    "avgOverallScore": 75.5,
    "avgSlcScore": 80.2,
    "avgScScore": 72.1,
    "avgFinalScore": 75.5
  },
  "scoreDistribution": [
    { "_id": 80, "count": 15 },
    { "_id": 60, "count": 20 },
    ...
  ]
}
```

### POST `/api/evaluations/search`

Search evaluations by text.

**Request Body:**
```json
{
  "searchTerm": "cloud storage",
  "limit": 100,
  "skip": 0
}
```

**Response:**
```json
{
  "evaluations": [...],
  "total": 5
}
```

### GET `/api/export/json`

Export all evaluations as JSON.

**Query Parameters:**
- `startDate` (optional) - ISO date string
- `endDate` (optional) - ISO date string

**Response:** JSON file download

### GET `/api/export/csv`

Export all evaluations as CSV.

**Query Parameters:**
- `startDate` (optional) - ISO date string
- `endDate` (optional) - ISO date string

**Response:** CSV file download

### GET `/api/config`

Get server configuration and database status.

**Response:**
```json
{
  "serverAddress": "http://localhost:3000",
  "thresholds": { ... },
  "database": {
    "enabled": true,
    "connected": true,
    "type": "mongodb"
  }
}
```

## Dependencies

- `express`: ^4.18.2 - Web framework
- `cors`: ^2.8.5 - CORS support
- `mongodb`: ^6.x - MongoDB driver
- `dotenv`: ^16.x - Environment configuration

## Database Architecture

### Abstraction Layer

The application uses a database abstraction layer that makes it easy to switch between different database systems:

```javascript
// DatabaseAdapter - Abstract interface
class DatabaseAdapter {
  async connect() { ... }
  async saveEvaluation(evaluation) { ... }
  async getEvaluations(filter, options) { ... }
  // ... more methods
}

// MongoDBAdapter - MongoDB implementation
class MongoDBAdapter extends DatabaseAdapter {
  // Implements all DatabaseAdapter methods for MongoDB
}

// DatabaseFactory - Creates appropriate adapter
const db = await DatabaseFactory.createAdapter('mongodb', config);
```

### Adding a New Database

To migrate to a different database (e.g., PostgreSQL):

1. Create a new adapter class extending `DatabaseAdapter`:
   ```javascript
   // backend/database/PostgreSQLAdapter.js
   class PostgreSQLAdapter extends DatabaseAdapter {
     // Implement all required methods
   }
   ```

2. Add the adapter to `DatabaseFactory`:
   ```javascript
   case 'postgresql':
     this.adapter = new PostgreSQLAdapter(config);
     await this.adapter.connect();
     return this.adapter;
   ```

3. Update `.env`:
   ```env
   DB_TYPE=postgresql
   ```

### Data Schema

Evaluations are stored with the following structure:

```javascript
{
  _id: ObjectId,
  technologyName: String,
  description: String,
  criteria: {
    slc1: String,
    slc2: String,
    // ... all SLC criteria
  },
  selectedSC: {
    sc1: String,  // 'shall' or 'should'
    sc2: String,
    // ... selected characteristics
  },
  mitigations: {
    slc1: Boolean,
    slc2: Boolean,
    // ... mitigation flags
  },
  mitigationDescriptions: {
    slc1: String,
    slc2: String,
    // ... mitigation descriptions
  },
  metadata: {
    // Sovereignty Metadata Model fields not derived from criteria/form
    softwareMaintainer: String,
    licensingStatus: String,
    compromisingAccessibility: String,
    compromisingAccessibilityNote: String,
    traceability: Boolean,
    auditability: Boolean,
    longTermAvailability: Boolean,
    version: String,
    programmingLanguage: String,
    operatingSystem: String,
    dataOwnership: String,
    vendorLockIn: String
  },
  results: {
    overallScore: Number,
    slcScore: Number,
    scScore: Number,
    finalScore: Number,
    classification: String,
    sovereignty: Object,
    slc: Object
  },
  thresholds: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## License

MIT

