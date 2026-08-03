# SmartAgri - Intelligent Precision Farming and AI Diagnostic SaaS Platform

**SmartAgri** is a modern, high-performance precision agriculture web platform combining offline ONNX deep-learning vision models, Google Gemini 1.5 Flash Vision, dynamic sow-date-aware crop calendars, OpenWeatherMap task adjustment rules, economic profit estimators, and a multi-provider fallback conversational AI (AgriBot).

---

## College Project Documentation Index

For complete academic presentation, evaluation, and code review, refer to the following project documentation specifications:

- **[Master Project Documentation Report (`PROJECT_DOCUMENTATION.md`)](file:///c:/Users/nettu/project/PROJECT_DOCUMENTATION.md)**  
  *Complete 8-Chapter Academic Project Report covering Literature Review, SRS, Architecture, ML Subsystems, Implementation Details, Test Cases, and UI Walkthrough.*
- **[Software Requirements Specification (`SMARTAGRI_SRS.md`)](file:///c:/Users/nettu/project/SMARTAGRI_SRS.md)**  
  *Detailed functional and non-functional requirements, user stories, hardware/software constraints.*
- **[System Architecture Flowchart (`smart_agriculture_arch.md`)](file:///c:/Users/nettu/project/smart_agriculture_arch.md)**  
  *Mermaid 4-tier system architecture specification (Client, Frontend SPA, FastAPI Backend, Cloud Data/ML).*
- **[Data Flow Diagrams (`smart_agriculture_dfd.md`)](file:///c:/Users/nettu/project/smart_agriculture_dfd.md)**  
  *Context Level 0 DFD, Process Level 1 DFD, and Data Processing Level 2 diagrams.*
- **[Use Case Diagrams and Specifications (`smart_agriculture_use_case.md`)](file:///c:/Users/nettu/project/smart_agriculture_use_case.md)**  
  *Actor interaction matrices for Farmer, Admin, and external AI/Weather microservices.*

---

## Repository Topology

```
.
├── frontend/                 # React 18 + Vite + MUI + Recharts User UI Layer
├── backend/                  # FastAPI Backend API Service & Inference Controller
│   ├── app/                  # Preprocessing, ONNX Loader, & Gemini Fallback
│   └── main.py               # Application Entry Point
├── ml_engine/                # EfficientNetV2 PyTorch/ONNX Training Engine
├── PROJECT_DOCUMENTATION.md  # Master Academic College Project Report
├── SMARTAGRI_SRS.md          # Software Requirements Specification (SRS)
├── smart_agriculture_arch.md # System Architecture Diagram
├── smart_agriculture_dfd.md  # Data Flow Diagrams (DFD)
└── smart_agriculture_use_case.md # System Use Case Diagram
```

---

## Quick Start Guide

### 1. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup (FastAPI Python)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Key Technology Stack

- **Frontend**: React 18, Vite, Material-UI (MUI v5), Recharts, Antigravity Theme Tokens
- **Backend API**: FastAPI, Uvicorn, Pydantic, OpenCV, NumPy
- **Machine Learning**: ONNX Runtime Engine (EfficientNetV2), Google Gemini 1.5 Flash Vision API
- **Conversational AI**: Groq Llama-3.3-70B, Gemini 1.5 Flash, DeepSeek Chat fallback chain
- **Cloud Database and Auth**: Supabase Cloud PostgreSQL, Supabase Auth (JWT)
- **External Services**: OpenWeatherMap API
