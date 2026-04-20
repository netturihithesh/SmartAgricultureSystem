import os
import shutil
from pathlib import Path
from tqdm import tqdm

# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------
# Point this to where your bash script downloaded the zip files
DOWNLOAD_DIR = Path("./datasets") 

# This will be the final merged dataset folder
OUTPUT_DIR = Path("./unified_dataset")

# ---------------------------------------------------------
# Dataset Mapping Dictionary
# ---------------------------------------------------------
# This dictionary helps map the random folder structures from 
# different Kaggle datasets into the unified CropName___DiseaseName format.
# You will likely need to adjust these source folder names based on the 
# exact extraction paths of the downloaded Kaggle datasets.
FOLDER_MAPPING = {
    # 1. PlantVillage (usually already in the correct format)
    "datasets/plantvillage/PlantVillage/Tomato___Bacterial_spot": "Tomato___Bacterial_spot",
    "datasets/plantvillage/PlantVillage/Tomato___Early_blight": "Tomato___Early_blight",
    "datasets/plantvillage/PlantVillage/Tomato___healthy": "Tomato___healthy",
    "datasets/plantvillage/PlantVillage/Potato___Early_blight": "Potato___Early_blight",
    "datasets/plantvillage/PlantVillage/Potato___healthy": "Potato___healthy",
    "datasets/plantvillage/PlantVillage/Corn___Common_rust": "Maize___Common_rust", # Renaming Corn to Maize for consistency
    "datasets/plantvillage/PlantVillage/Corn___healthy": "Maize___healthy",
    
    # 2. Rice Dataset Example
    "datasets/rice/RiceDiseaseDataset/train/Blast": "Rice___Blast",
    "datasets/rice/RiceDiseaseDataset/train/Blight": "Rice___Blight",
    "datasets/rice/RiceDiseaseDataset/train/BrownSpot": "Rice___Brown_spot",
    
    # 3. Wheat Dataset Example
    "datasets/wheat/train/Healthy": "Wheat___healthy",
    "datasets/wheat/train/septoria": "Wheat___Septoria",
    "datasets/wheat/train/stripe_rust": "Wheat___Stripe_rust",
    
    # 4. Cotton Dataset Example
    "datasets/cotton/train/diseased cotton leaf": "Cotton___Diseased_leaf",
    "datasets/cotton/train/fresh cotton leaf": "Cotton___healthy",
    
    # 5. Sugarcane Example
    "datasets/sugarcane/Healthy": "Sugarcane___healthy",
    "datasets/sugarcane/RedRot": "Sugarcane___Red_rot",
    
    # 6. Mango Example
    "datasets/mango/Anthracnose": "Mango___Anthracnose",
    "datasets/mango/Healthy": "Mango___healthy"
}

def merge_datasets():
    print(f"🚀 Starting dataset aggregation into: {OUTPUT_DIR}")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    total_images_copied = 0
    
    for source_path_str, target_class in FOLDER_MAPPING.items():
        source_path = Path(source_path_str)
        target_path = OUTPUT_DIR / target_class
        
        if not source_path.exists():
            print(f"⚠️ Warning: Source path not found (skipping): {source_path}")
            continue
            
        print(f"Processing {target_class} from {source_path.name}...")
        
        # Ensure target folder exists
        target_path.mkdir(parents=True, exist_ok=True)
        
        # Grab all common image types
        image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
        images = []
        for ext in image_extensions:
            images.extend(source_path.rglob(ext))
            
        for img_file in tqdm(images, desc=target_class, leave=False):
            # Rename file uniquely to avoid overwriting identical names (like image_1.jpg)
            unique_filename = f"{target_class}_{total_images_copied}_{img_file.name}"
            dest_file = target_path / unique_filename
            
            # Copy file
            shutil.copy2(img_file, dest_file)
            total_images_copied += 1
            
    print("\n✅ Dataset grouping complete!")
    print(f"🎉 Total images aggregated: {total_images_copied}")
    print(f"📂 You can now point your Colab DataLoader to: {OUTPUT_DIR.absolute()}")

if __name__ == "__main__":
    merge_datasets()
