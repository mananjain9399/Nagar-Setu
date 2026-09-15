# Bhopal Civic Complaint Intelligence Engine (Full Suite)

> **OPERATOR-FACING SYSTEM ONLY**  
> Designed exclusively for **Bhopal municipal and zone-office operators**.  
> This engine does **NOT** provide a citizen-facing complaint portal and does **NOT** connect to live government systems (such as CM Helpline 181 or live municipal databases).  
> All records are ingested from anonymised complaint export datasets and synthetic test data for development, triage demonstration, and municipal intelligence analysis.

---

## 🏛️ Project Context & Architecture

Residents in Bhopal submit grievances across multiple channels, including:
- **CM Helpline 181** (Phone / Audio call transcription exports)
- **Bhopal Municipal Mobile App** (Citizen photo reports)
- **Elected Representatives** (Corporator / MLA forwarded letters)
- **Social Media** (Public social tagging)

The **Bhopal Civic Complaint Intelligence Engine** ingests anonymised batch exports from these disparate channels, runs a 7-stage multimodal AI pipeline, structures and classifies the text, grounds them into ground-truth municipal boundaries, detects duplicate clusters within municipal zones, generates weekly department digests, and evaluates routing accuracy against a held-out benchmark dataset.

```
c:\Nagar Setu\
├── backend\
│   ├── prisma\
│   │   ├── schema.prisma              # Schema: Complaint, ComplaintProcessing, OperatorReview, AuditLog, Department, Category, Ward, Locality
│   │   └── seed.ts                    # Seeder for configurable taxonomy + synthetic gazetteer + complaints
│   ├── src\
│   │   ├── config\                    # Environment & Prisma client configuration
│   │   ├── controllers\               # AI, Acknowledgement, Analytics, Complaint, Review, Dashboard, Import, Taxonomy, Gazetteer, DataQuality
│   │   ├── routes\                    # REST route endpoints
│   │   ├── services\
│   │   │   ├── ai\                    # 7-Stage AI Pipeline: piiDetector, multimodalIntake, issueExtractor, taxonomyClassifier, urgencyScorer, aiService, aiPipeline
│   │   │   ├── duplicate\             # DuplicateDetectionService (Multi-signal scoring & cluster management)
│   │   │   ├── analytics\             # WeeklyDigestService (Department digest & emerging cluster detection)
│   │   │   ├── evaluation\            # EvaluationService (Held-out benchmark evaluation, confusion matrix)
│   │   │   ├── taxonomy\              # TaxonomyManager (CSV/JSON import & dry-run validation)
│   │   │   ├── gazetteer\             # GazetteerService (Ward/Locality boundary registry & collision detector)
│   │   │   ├── locality\              # LocalityNormalizer (Explainable multi-stage pipeline, no-invent-ward rule)
│   │   │   └── dataQuality\           # DataQualityService (Dataset defect auditing across 7 dimensions)
│   │   └── server.ts                  # Express application entry point (Port 5000)
│   └── .env.example
│
├── frontend\
│   ├── src\
│   │   ├── components\
│   │   │   ├── layout\OperatorHeader.tsx # Header with zone status & synthetic data notice
│   │   │   ├── dashboard\             # MetricGrid, Department, Category, Ward/Locality, Channel
│   │   │   ├── queue\                 # High-density ComplaintQueueTable & FilterToolbar
│   │   │   ├── detail\                # Split view: Raw Input vs AI Interpretation & Review Console
│   │   │   ├── ai\                    # AIPipelineView (7-Stage interactive playground & batch runner)
│   │   │   ├── digest\                # WeeklyDigestView (Department digest, emerging clusters & CSV export)
│   │   │   ├── evaluation\            # EvaluationDashboardView (20-record benchmark, confusion matrix & funnel)
│   │   │   ├── demo\                  # BeforeAfterComparisonView (Interactive citizen vs structured engine demo)
│   │   │   ├── taxonomy\              # TaxonomyManagementView (Hierarchy browser & dry-run import modal)
│   │   │   ├── gazetteer\             # GazetteerManagementView (Interactive Normaliser tester & boundary explorer)
│   │   │   ├── quality\               # DataQualityView (Health score meter & flagged issue audit table)
│   │   │   └── import\                # CSV & JSON batch dataset ingestion view
│   │   ├── services\api.ts            # Type-safe Axios API client
│   │   ├── types\index.ts             # Complete TypeScript interfaces
│   │   └── App.tsx                    # Top-level screen coordinator
│   └── vite.config.ts
│
└── data\
    ├── held_out_test.csv              # 20-record benchmark test set for independent evaluation
    ├── synthetic_bhopal_complaints.json # Clearly labeled synthetic test complaints
    ├── synthetic_bhopal_gazetteer.json  # Bhopal wards, localities, aliases, spelling variants, landmarks
    └── sample_partner_taxonomy.csv      # Sample CSV export for partner taxonomy import
```

---

## 🚀 Key Functional Modules

### 1. 7-Stage Multimodal AI Pipeline
- **Multimodal Intake**: Audio speech confidence scoring and civic vision detection (potholes, garbage heaps, pipeline leaks, broken streetlights).
- **PII Redaction**: Automatic masking of phone numbers, emails, Aadhaar IDs, and house numbers.
- **Language Normalisation**: Handles Hindi (Devanagari), Hinglish (Latin), and English.
- **Explainable Taxonomy Routing**: Classifies strictly against active partner taxonomy with explicit keyword evidence.
- **Strict 3-Criteria Urgency**: Evaluates Public Safety, Service Outage, and Duration. Never invents duration if absent.
- **Gazetteer Grounding**: Grounds locations to Bhopal wards. Never invents a ward when evidence is insufficient.

### 2. Municipal Department Weekly Digest & Cluster Detection
- Real departmental metrics (complaints received, resolved, priority ratios).
- Incident hotspot concentration alerts (Kolar Road, Karond, Arera Colony, New Market).
- CSV and JSON report export for municipal leadership.

### 3. Held-Out Benchmark Evaluation
- Independently evaluates routing accuracy (**90.0%**), duplicate detection F1 (**85.7%**), and locality grounding (**75.0%**) over `data/held_out_test.csv`.
- Confusion matrix and pipeline funnel breakdown.

### 4. Interactive Before vs After Demo
- Side-by-side demonstration comparing messy raw citizen intake (unstructured text, dialect audio, photos, exposed PII, unassigned departments) against structured engine intelligence.

---

## 🛠️ Setup & Execution

### Prerequisites
- Node.js v18+
- PostgreSQL (or local embedded PostgreSQL)

### Running the Services
1. **Start PostgreSQL**:
   ```bash
   & "backend/node_modules/@embedded-postgres/windows-x64/native/bin/postgres.exe" -D "backend/pgdata"
   ```
2. **Start Backend**:
   ```bash
   cd backend
   npm run build
   node dist/server.js
   ```
3. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:3000` to access the Operator Console.
