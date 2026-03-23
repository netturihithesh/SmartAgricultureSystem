# 🌾 Smart Agriculture System

This repository contains the full modern SaaS architecture for the Smart Agriculture System. The pipeline leverages React, FastAPI, Scikit-learn, and Firebase.

## 📂 Project Structure

```
.
├── frontend/           # React JS + Material UI + Recharts (User UI Layer)
├── backend/            # FastAPI (Backend API Service Layer)
│   ├── api/            # API Route definitions
│   ├── core/           # Firebase admin configs & core settings
│   ├── models/         # Pydantic schemas for data validation
│   ├── services/       # Interaction with Firebase & ML Model
│   ├── main.py         # FastAPI application entry point
│   └── requirements.txt
├── ml_engine/          # Scikit-learn (Machine Learning logic)
│   ├── data/           # Raw and processed datasets
│   ├── models/         # Pickled/saved trained models
│   ├── notebooks/      # Jupyter exploratory analytics
│   ├── train.py        # Main training pipeline script
│   └── requirements.txt
└── docs/               # System documentation & architectural diagrams
```

## 🚀 Getting Started

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. ML Engine
Use the `ml_engine/train.py` script to generate your pipeline models that will be consumed by the FastAPI backend.
