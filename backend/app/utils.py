// backend/app/utils.py
import io
from PIL import Image
import torchvision.transforms as T

def preprocess_image(file_stream, img_size: int = 224):
    """Convert uploaded file stream to a tensor ready for model inference."""
    # Ensure we have a file-like object
    if isinstance(file_stream, bytes):
        file_stream = io.BytesIO(file_stream)
    img = Image.open(file_stream).convert('RGB')
    transform = T.Compose([
        T.Resize((img_size, img_size)),
        T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    return transform(img).unsqueeze(0)  // shape (1, C, H, W)
