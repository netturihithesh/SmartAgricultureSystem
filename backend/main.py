from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart Agriculture API", version="1.0.0")

# Configure CORS so the React frontend can talk to our API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Should be frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Agriculture API"}

# Router mounting will go here (e.g., app.include_router(prediction_router))
