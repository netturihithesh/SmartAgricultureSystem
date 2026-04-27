# 1. Install necessary libraries
!pip install onnx onnxscript albumentations timm

import os
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
import torchvision.models as models
import numpy as np
from tqdm import tqdm
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2

# 2. Use Kaggle's pre-loaded dataset path 
# (Make sure to add the "New Plant Diseases Dataset" to your Kaggle notebook data)
DATA_DIR = "/kaggle/input/new-plant-diseases-dataset/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/train"

# 3. Super-Fast ResNet18 Architecture (100% ONNX Compatible, no padding issues)
class CropDiseaseResNet(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        # Use ResNet18 - it exports to ONNX flawlessly every time
        self.backbone = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        # Replace the final layer for 36 classes
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Linear(in_features, num_classes)

    def forward(self, x):
        return self.backbone(x)

# 4. Data Loading using standard RGB processing
class EfficientDataset(Dataset):
    def __init__(self, root_dir):
        self.dataset = ImageFolder(root_dir)
        self.classes = self.dataset.classes
        
        # Standard ResNet ImageNet Normalization
        self.transform = A.Compose([
            A.Resize(height=224, width=224),
            A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ToTensorV2()
        ])

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        img_path, label = self.dataset.samples[idx]
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) # Crucial!
        image = self.transform(image=image)['image']
        return image, label

print("Loading dataset...")
dataset = EfficientDataset(DATA_DIR)
dataloader = DataLoader(dataset, batch_size=128, shuffle=True, num_workers=4, pin_memory=True)

# Export class names instantly
with open('/kaggle/working/class_names.json', 'w') as f:
    json.dump(dataset.classes, f)

# 5. Fast Training Loop (5 Epochs is enough for ~94% on ResNet)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = CropDiseaseResNet(len(dataset.classes)).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

print("Starting Fast Training...")
model.train()
for epoch in range(5):
    running_loss = 0.0
    correct = 0
    total = 0
    
    pbar = tqdm(dataloader, desc=f"Epoch {epoch+1}/5")
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

# 6. Flawless ONNX Export!
print("\n📦 Exporting to Flawless ONNX...")
model.eval()
dummy_input = torch.randn(1, 3, 224, 224).to(device)

torch.onnx.export(
    model, dummy_input, '/kaggle/working/crop_disease.onnx',
    do_constant_folding=True,
    opset_version=13, # ResNet flawlessly supports 13
    input_names=['image'], 
    output_names=['predictions'],
    dynamic_axes={'image': {0: 'batch_size'}}
)

print("✅ DONE! Download crop_disease.onnx and class_names.json from the Kaggle /kaggle/working/ directory.")
