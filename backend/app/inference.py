# backend/app/inference.py
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

# Gemini client helper (loads GEMINI_API_KEY from .env)
from .gemini_client import analyze_image

router = APIRouter()

@router.post("/detect")
async def detect(image: UploadFile = File(...)):
    """Receive an image, forward to Gemini Vision, and return a structured prediction."""
    if not image.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    try:
        print(f"--- Incoming Diagnosis Request for file: {image.filename} ---")
        img_bytes = await image.read()
        print(f"--- Received Image Size: {len(img_bytes)} bytes ---")
        mime_type = image.content_type or "image/jpeg"
        result = analyze_image(img_bytes, mime_type)
        print(f"--- Detection Result: {result.get('disease_name', 'Unknown')} ({result.get('confidence_level', 'N/A')}) ---")
        return JSONResponse(content=result)
    except Exception as exc:
        import traceback
        traceback.print_exc() # Print full error to console for debugging
        raise HTTPException(status_code=500, detail=str(exc))
