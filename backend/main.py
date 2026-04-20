from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.inference import router as detection_router

app = FastAPI(title="Smart Agriculture API", version="1.0.0")

# Configure CORS so the React frontend can talk to our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Agriculture API"}

# Mount the disease & pest detection router
app.include_router(detection_router, prefix="/detect")
