flowchart LR
    %% Actors
    Farmer([Farmer]) 
    Admin([System Admin])
    ML_Model[\Custom ML Model/]
    WeatherAPI[\OpenWeatherMap/]

    %% System Boundary
    subgraph System [Smart Agriculture System]
        direction TB
        UC1(Sign Up / Login)
        UC2(Manage Crop Profiles)
        UC3(Scan Leaf for Disease)
        UC4(View Daily Crop Tasks)
        UC5(Check Weather Advisories)
        UC6(Generate Profit Estimates)
        UC7(Manage Data / Settings)
    end

    %% Farmer Relationships
    Farmer --- UC1
    Farmer --- UC2
    Farmer --- UC3
    Farmer --- UC4
    Farmer --- UC5
    Farmer --- UC6

    %% Admin Relationships
    UC7 --- Admin

    %% External System Includes (Dependency)
    UC3 -.->|«includes»| ML_Model
    UC5 -.->|«includes»| WeatherAPI
    
    %% Document-Friendly Styling
    linkStyle default stroke:#000000,stroke-width:1.5px,color:#000000
    
    style Farmer fill:#d1e7dd,stroke:#0f5132,stroke-width:2px,color:#000000
    style Admin fill:#fff3cd,stroke:#856404,stroke-width:2px,color:#000000
    style ML_Model fill:#e2d9f3,stroke:#4a249d,stroke-width:2px,color:#000000
    style WeatherAPI fill:#cfe2ff,stroke:#084298,stroke-width:2px,color:#000000
    
    style UC1 fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UC2 fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UC3 fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UC4 fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UC5 fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UC6 fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
    style UC7 fill:#ffffff,stroke:#6c757d,stroke-width:1.5px,color:#000000
