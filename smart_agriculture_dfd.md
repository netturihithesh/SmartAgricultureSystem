flowchart LR
    %% ==========================================
    %% Entity Declarations 
    %% ==========================================
    User(Farmer / User)
    WeatherAPI(OpenWeatherMap API)
    ML_Model(Custom ML Model via Kaggle)

    %% ==========================================
    %% System Components
    %% ==========================================
    subgraph React_UI_Client [React UI Client]
        UI_Auth[Auth Module]
        UI_Dash[Dashboard Engine]
        UI_Predict[Disease Predictor]
        UI_Weather[Weather Widget]
        UI_Profit[Profit Estimator]
    end

    subgraph FastAPI_Server [FastAPI Server]
        API_Detect[detect API Route]
        API_Data[api Data Route]
    end

    subgraph Supabase_Cloud [Supabase Cloud]
        Supa_Auth[Auth Engine]
        Supa_DB[(PostgreSQL DB)]
    end

    %% ==========================================
    %% Data Flows
    %% ==========================================
    User -- "Email & Password" --> UI_Auth
    UI_Auth -- "Credentials" --> Supa_Auth
    Supa_Auth -- "Auth Token" --> UI_Auth
    UI_Auth -- "Session Info" --> UI_Dash

    UI_Dash -- "Request Crop Data" --> API_Data
    UI_Profit -- "Request Economic Data" --> API_Data
    API_Data -- "Query Data" --> Supa_DB
    Supa_DB -- "Crop Data & Financial JSON" --> API_Data
    API_Data -- "Crop Data" --> UI_Dash
    API_Data -- "Profit Estimates" --> UI_Profit
    UI_Dash -- "Show Calendar" --> User
    UI_Profit -- "Show Financials" --> User

    User -- "Upload Leaf Image" --> UI_Predict
    UI_Predict -- "Multipart Image" --> API_Detect
    API_Detect -- "Image Data" --> ML_Model
    ML_Model -- "Disease & Confidence" --> API_Detect
    API_Detect -- "Diagnosis Output" --> UI_Predict
    UI_Predict -- "Show Treatment" --> User

    User -- "Location" --> UI_Weather
    UI_Weather -- "Geocoordinates" --> WeatherAPI
    WeatherAPI -- "5-Day Forecast" --> UI_Weather
    UI_Weather -- "Advisories & Alerts" --> User

    %% ==========================================
    %% Print/Document Friendly Styling
    %% ==========================================
    linkStyle default stroke:#000000,stroke-width:2px,color:#000000
    
    style User fill:#d1e7dd,stroke:#0f5132,stroke-width:2px,color:#000000
    style WeatherAPI fill:#cfe2ff,stroke:#084298,stroke-width:2px,color:#000000
    style ML_Model fill:#e2d9f3,stroke:#4a249d,stroke-width:2px,color:#000000

    style UI_Auth fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UI_Dash fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UI_Predict fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UI_Weather fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UI_Profit fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    
    style API_Detect fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style API_Data fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    
    style Supa_Auth fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style Supa_DB fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
