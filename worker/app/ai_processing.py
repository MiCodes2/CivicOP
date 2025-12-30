import cv2
import numpy as np
from transformers import pipeline
import logging

logger = logging.getLogger(__name__)

# Initialize AI models
try:
    # Object detection model
    object_detector = pipeline("object-detection", model="facebook/detr-resnet-50")
    
    # Image classification for categories
    classifier = pipeline("image-classification", model="google/vit-base-patch16-224")
    
except Exception as e:
    logger.error(f"Failed to load AI models: {e}")
    object_detector = None
    classifier = None

def process_image(image_path: str) -> dict:
    """
    Process image with AI: detect objects, classify, mask privacy.
    """
    try:
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not load image")
        
        results = {
            "detected_objects": [],
            "category": "unknown",
            "confidence": 0.0,
            "privacy_masked": False
        }
        
        # Object detection
        if object_detector:
            detections = object_detector(image_path)
            results["detected_objects"] = [
                {
                    "label": det["label"],
                    "score": det["score"],
                    "box": det["box"]
                } for det in detections
            ]
        
        # Classification
        if classifier:
            classifications = classifier(image_path)
            if classifications:
                results["category"] = classifications[0]["label"]
                results["confidence"] = classifications[0]["score"]
        
        # Privacy masking (simple face detection)
        # In production, use more sophisticated privacy masking
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        for (x, y, w, h) in faces:
            cv2.rectangle(image, (x, y), (x+w, y+h), (0, 0, 0), -1)
        
        # Save masked image
        masked_path = image_path.replace('.jpg', '_masked.jpg').replace('.png', '_masked.png')
        cv2.imwrite(masked_path, image)
        results["privacy_masked"] = True
        results["masked_image_path"] = masked_path
        
        return results
        
    except Exception as e:
        logger.error(f"Error processing image {image_path}: {str(e)}")
        return {"error": str(e)}