# backend/app/inference.py
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import onnxruntime as ort
import numpy as np
import cv2
import json
import traceback
import os
from pathlib import Path
from pydantic import BaseModel
from google import genai
from google.genai import types

router = APIRouter()

# Schema for Gemini Text Response
class DiseaseInfo(BaseModel):
    symptoms: str
    cause: str
    treatment: str

# Setup paths dynamically
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "ml_engine" / "models" / "crop_disease.onnx"
CLASS_NAMES_PATH = BASE_DIR / "ml_engine" / "models" / "class_names.json"

# Global session variables
session = None
class_names = []

def load_model():
    global session, class_names
    if session is None:
        if not MODEL_PATH.exists() or not CLASS_NAMES_PATH.exists():
            print(f"⚠️ Model not found at {MODEL_PATH}")
            return False
            
        print("🧠 Loading ONNX Model Engine into memory...")
        # providers=['CPUExecutionProvider'] ensures it runs flawlessly anywhere
        session = ort.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
        
        with open(CLASS_NAMES_PATH, "r") as f:
            class_names = json.load(f)
        print(f"✅ Fast ONNX Engine loaded successfully! Tracking {len(class_names)} diseases.")
    return True

@router.on_event("startup")
async def startup_event():
    load_model()

def preprocess_image(img_bytes):
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img = img.astype(np.float32) / 255.0
    # The division above automatically upcasts to float64, must recast back to float32
    img = (img - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    img = np.transpose(img, (2, 0, 1))[np.newaxis, :].astype(np.float32)
    return img

@router.post("/detect")
async def detect(image: UploadFile = File(...)):
    """Instant offline detection using our trained ONNX model."""
    if not image.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Unsupported file type")
        
    if session is None and not load_model():
        raise HTTPException(status_code=500, detail="ONNX model missing or failed to initialize.")
        
    try:
        print(f"--- Incoming Local Diagnosis Request: {image.filename} ---")
        img_bytes = await image.read()
        
        # Format the image perfectly for EfficientNetV2
        img_tensor = preprocess_image(img_bytes)
        
        # Execute ONNX Inference (Runs in ~80 milliseconds safely offline)
        outputs = session.run(None, {'image': img_tensor})[0]
        
        # Calculate Softmax probabilities to get accurate percentages
        exp_outputs = np.exp(outputs[0] - np.max(outputs[0]))
        probs = exp_outputs / np.sum(exp_outputs)
        
        best_idx = probs.argmax()
        confidence = round(float(probs[best_idx]) * 100, 2)
        raw_name = class_names[best_idx]
        
        # Reformat "Tomato___Early_blight" to "Tomato - Early Blight"
        parts = raw_name.split("___")
        if len(parts) == 2:
            crop = parts[0]
            condition = parts[1].replace("_", " ")
        else:
            crop = raw_name
            condition = "Unknown"
            
        disease_name = f"{crop} - {condition}"
        if condition.lower() == "healthy":
            disease_name = f"{crop} - Healthy"
            
        # Hybrid Architecture: Use Gemini API purely for text generation based on the local AI's visual diagnosis
        api_key = os.getenv("GEMINI_API_KEY")
        
        result = {
            "disease_name": disease_name,
            "confidence_level": f"{confidence}%",
            "symptoms": "Specific symptoms vary. Monitor for localized lesions, wilting, or distinct spotting on foliage.",
            "cause": "Likely pathogenic, fungal, or pest-related stress factors.",
            "treatment": "Isolate affected plants. Consult local agricultural guidelines for targeted chemical or organic treatment."
        }
        
        if condition.lower() == "unknown":
            pass # Keep defaults
        elif condition.lower() == "healthy" or "healthy" in disease_name.lower():
            result["symptoms"] = "No visible stress or pathogenic damage."
            result["cause"] = "Consistent nutrient flow and stable environment."
            result["treatment"] = "Crop is healthy! Maintain current irrigation, spacing, and nutrient schedule."
        elif api_key:
            try:
                print(f"🧠 Local Model detected '{disease_name}'. Asking Gemini for dynamic treatment plans...")
                client = genai.Client(api_key=api_key)
                prompt = f"An agricultural AI has definitively visually diagnosed a crop with '{disease_name}'. Briefly provide the typical symptoms, biological causes, and the best agricultural treatment for this specific condition."
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=DiseaseInfo,
                        temperature=0.2,
                    )
                )
                
                info = json.loads(response.text)
                result["symptoms"] = info.get("symptoms", result["symptoms"])
                result["cause"] = info.get("cause", result["cause"])
                result["treatment"] = info.get("treatment", result["treatment"])
                print("✅ Dynamic Treatment Plan generated via Gemini API!")
            except Exception as e:
                print(f"⚠️ Gemini Text API failed, falling back to default text: {e}")
            
        print(f"--- Fast Hybrid Result: {result['disease_name']} ({confidence}%) ---")
        return JSONResponse(content=result)
        
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Inference Error: " + str(exc))
