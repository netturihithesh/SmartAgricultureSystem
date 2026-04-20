// backend/app/model.py
import torch
import torch.nn as nn
import torchvision.models as models

class PlantVillageNet(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        # Use MobileNetV3 Small as lightweight backbone
        backbone = models.mobilenet_v3_small(pretrained=True)
        # Freeze early layers (optional)
        for param in backbone.features.parameters():
            param.requires_grad = False
        # Replace classifier head
        backbone.classifier = nn.Sequential(
            nn.Linear(backbone.classifier[0].in_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )
        self.net = backbone

    def forward(self, x):
        return self.net(x)

def load_model(weights_path: str, device: str = "cpu"):
    """Load checkpoint and return model ready for inference."""
    checkpoint = torch.load(weights_path, map_location=device)
    num_classes = checkpoint["num_classes"]
    model = PlantVillageNet(num_classes)
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()
    model.to(device)
    return model
