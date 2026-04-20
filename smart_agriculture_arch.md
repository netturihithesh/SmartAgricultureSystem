flowchart TD
    %% ==========================================
    %% Client Layer
    %% ==========================================
    Client(Farmer - Web/Mobile Browser)
    
    %% ==========================================
    %% Frontend Tier
    %% ==========================================
    subgraph Frontend_Tier [Frontend / UI Tier]
        ReactUI[React Single Page Application]
        State[Context State Management]
    end

    %% ==========================================
    %% Application API Tier
    %% ==========================================
    subgraph Application_Tier [FastAPI Backend API Tier]
        FastAPI_Router{FastAPI HTTP Router}
        Service_Data[Core Logic & Data Handlers]
        Service_ML[Inference Pipeline Controller]
    end

    %% ==========================================
    %% ML & Model Tier
    %% ==========================================
    subgraph ML_Tier [Machine Learning Inference Engine]
        Custom_Model[(Custom Disease ML Model \n Trained on Kaggle)]
    end

    %% ==========================================
    %% External Data Tier
    %% ==========================================
    subgraph Data_Tier [Cloud Data Tier]
        Supabase[(Supabase PostgreSQL)]
        Supa_Auth[Supabase Auth Service]
    end

    Ext_Weather[OpenWeatherMap API]

    %% ==========================================
    %% Architectural Integrations & Flows
    %% ==========================================
    Client -- "HTTPS / UI Interaction" --> ReactUI
    ReactUI -- "Manage State" --> State
    
    %% Frontend to Backend
    ReactUI -- "REST API Calls (JSON)" --> FastAPI_Router
    
    %% Router Dispatching
    FastAPI_Router --> Service_Data
    FastAPI_Router --> Service_ML

    %% Service to Database logic
    Service_Data <-->|"Read/Write User Data"| Supabase
    ReactUI <-->|"JWT Login/Validation"| Supa_Auth
    Service_Data -.->|"Validate JWT"| Supa_Auth

    %% Service to ML Inference logic
    Service_ML -->|"Pass Image Bytes"| Custom_Model
    Custom_Model -->|"Return Prediction JSON"| Service_ML

    %% Frontend to External Endpoints
    ReactUI -->|"Fetch Weather/Alerts"| Ext_Weather

    %% ==========================================
    %% Print/Document Friendly Styling
    %% ==========================================
    linkStyle default stroke:#000000,stroke-width:2px,color:#000000
    
    style Client fill:#d1e7dd,stroke:#0f5132,stroke-width:2px,color:#000000
    style Ext_Weather fill:#cfe2ff,stroke:#084298,stroke-width:2px,color:#000000
    style Custom_Model fill:#e2d9f3,stroke:#4a249d,stroke-width:2px,color:#000000

    style ReactUI fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style State fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000

    style FastAPI_Router fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style Service_Data fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style Service_ML fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000

    style Supabase fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style Supa_Auth fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
