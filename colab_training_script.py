# ==========================================
# 🚀 SMARTAGRI: PERFECT OFFLINE AI TRAINER
# ==========================================

import os
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision.datasets import ImageFolder
import torchvision.models as models
import numpy as np
from tqdm import tqdm
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2

print("==========================================")
print(" 🚀 SMARTAGRI: ONE-SHOT PRODUCTION ENGINE")
print("==========================================")

# ---------------------------------------------------------
# 1. KAGGLE DATASET INGESTION
# ---------------------------------------------------------
print("\n1️⃣ STEP 1: Authenticating Kaggle...")
if not os.path.exists('/content/kaggle.json'):
    print("❌ FATAL: Please upload 'kaggle.json' to the left file explorer first!")
    exit(1)

os.system("mkdir -p ~/.kaggle && cp /content/kaggle.json ~/.kaggle/ && chmod 600 ~/.kaggle/kaggle.json")

print("\n2️⃣ STEP 2: Downloading Massive Verified Datasets...")
datasets = [
    "vipoooool/new-plant-diseases-dataset",           # Base 38 classes (PlantVillage)
    "janmejaybhoi/cotton-disease-dataset",            # Cotton
    "vbookshelf/rice-leaf-diseases",                  # Standard Rice diseases
    "nirmalsankalana/sugarcane-leaf-disease-dataset", # Sugarcane
    "aryashah2k/mango-leaf-disease-dataset"           # Mango
]

for d in datasets:
    name = d.split('/')[1]
    print(f"   📥 Pulling {name}...")
    # Safe python OS call
    os.system(f"kaggle datasets download -q -d {d} -p /content/")
    
print("\n📦 Unzipping 5GB+ of HD Images (Takes ~2 minutes)...")
os.system("unzip -q -o '/content/*.zip' -d /content/raw_data/")

# ---------------------------------------------------------
# 2. UNIVERSAL DATASET MERGER
# ---------------------------------------------------------
print("\n🧬 STEP 3: Merging & Standardizing Crop Matrix...")
MASTER_DIR = "/content/dataset/train"
os.makedirs(MASTER_DIR, exist_ok=True)

# Helper function to move files quietly
def merge_dist(src_path, dest_folder):
    if os.path.exists(src_path):
        target = f"{MASTER_DIR}/{dest_folder}"
        os.makedirs(target, exist_ok=True)
        os.system(f"cp -r '{src_path}/'* '{target}/' 2>/dev/null")

# A. PlantVillage
pv_train = "/content/raw_data/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/train"
if os.path.exists(pv_train):
    for folder in os.listdir(pv_train):
        merge_dist(f"{pv_train}/{folder}", folder)

# B. Cotton
c_train = "/content/raw_data/train"
merge_dist(f"{c_train}/fresh cotton leaf", "Cotton___healthy")
merge_dist(f"{c_train}/diseased cotton leaf", "Cotton___Diseased")

# C. Rice
r_train = "/content/raw_data/rice_leaf_diseases"
merge_dist(f"{r_train}/Bacterial leaf blight", "Rice___Blight")
merge_dist(f"{r_train}/Brown spot", "Rice___Brown_spot")
merge_dist(f"{r_train}/Leaf smut", "Rice___Leaf_smut")

# D. Sugarcane
s_train = "/content/raw_data"
merge_dist(f"{s_train}/Healthy", "Sugarcane___healthy")
merge_dist(f"{s_train}/RedRot", "Sugarcane___Red_rot")
merge_dist(f"{s_train}/Rust", "Sugarcane___Rust")

# E. Mango
mango_classes = ['Anthracnose', 'Bacterial Canker', 'Cutting Weevil', 'Die Back', 'Gall Midge', 'Healthy', 'Powdery Mildew', 'Sooty Mould']
for mc in mango_classes:
    formatted = f"Mango___{mc.replace(' ', '_')}" if mc != 'Healthy' else "Mango___healthy"
    merge_dist(f"{s_train}/{mc}", formatted)

# ---------------------------------------------------------
# 3. HIGH-PERFORMANCE DATALOADER
# ---------------------------------------------------------
print("\n🧠 STEP 4: Initializing Augmented Data Engine...")
class PlantDataset(Dataset):
    def __init__(self, root_dir):
        self.dataset = ImageFolder(root_dir)
        self.classes = self.dataset.classes
        
        # PRODUCTION VISUAL AUGMENTATIONS (Forces true understanding, prevents overfitting)
        self.transform = A.Compose([
            A.Resize(height=224, width=224),
            A.HorizontalFlip(p=0.5),            
            A.VerticalFlip(p=0.2),
            A.RandomBrightnessContrast(p=0.2),  
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        img_path, label = self.dataset.samples[idx]
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = self.transform(image=image)['image']
        return image, label

train_dataset = PlantDataset(MASTER_DIR)
train_loader = DataLoader(train_dataset, batch_size=128, shuffle=True, num_workers=2, pin_memory=True)

with open('/content/class_names.json', 'w') as f:
    json.dump(train_dataset.classes, f)
print(f"✅ Neural Engine tracks exactly {len(train_dataset.classes)} unique disease states!")

# ---------------------------------------------------------
# 4. RESNET50 NEURAL ARCHITECTURE
# ---------------------------------------------------------
print("\n⚙️ STEP 5: Building Heavy-Duty ResNet50 Topology...")
class CropDiseaseResNet50(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.backbone = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        in_features = self.backbone.fc.in_features
        # Extreme Dropout to force neural reliability
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(in_features, num_classes)
        )
    def forward(self, x):
        return self.backbone(x)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = CropDiseaseResNet50(len(train_dataset.classes)).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.0003)
# Cosine Annealing ensures the AI settles into the deepest accuracy valley mathematically possible
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=25)

# ---------------------------------------------------------
# 5. MAX-ACCURACY TRAINING LOOP
# ---------------------------------------------------------
print(f"\n⚔️ STEP 6: Commencing 25-Epoch Optimization on {device.type.upper()}...")
model.train()
for epoch in range(25):
    running_loss, correct, total = 0.0, 0, 0
    pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/25 [LR: {scheduler.get_last_lr()[0]:.6f}]")
    
    for images, labels in pbar:
        images, labels = images.to(device), labels.to(device)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        pbar.set_postfix({"Acc": f"{100.*correct/total:.2f}%"})
        
    scheduler.step()

print("\n✅ Mastery Achieved. Saving Safety Checkpoint...")
torch.save(model.state_dict(), '/content/trained_weights_v2.pth')

# ---------------------------------------------------------
# 6. UNIVERSAL ONNX EXPORT
# ---------------------------------------------------------
print("\n📦 STEP 7: Exporting Final Inference Engine to ONNX...")
model.eval()
dummy_input = torch.randn(1, 3, 224, 224).to(device)

torch.onnx.export(
    model, dummy_input, '/content/crop_disease.onnx',
    do_constant_folding=True,
    opset_version=13,
    input_names=['image'], 
    output_names=['predictions'],
    dynamic_axes={'image': {0: 'batch_size'}}
)

print("\n🎉 ALL SYSTEMS GO! Please download:")
print("   👉 crop_disease.onnx")
print("   👉 crop_disease.onnx.data (If Generated)")
print("   👉 class_names.json")
