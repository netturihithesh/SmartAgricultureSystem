from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.app.inference import router as detection_router
import backend.scripts.update_crop_prices as update_prices

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

@app.post("/api/prices/update")
def update_crop_prices_api():
    try:
        update_prices.main()
        return {"status": "success", "message": "Crop prices updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount the disease & pest detection router
app.include_router(detection_router, prefix="/detect")
