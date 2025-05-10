import sys
import json
import easyocr
import cv2
import numpy as np
from PIL import Image
import io

def preprocess_image(image_path):
    # Read image
    img = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                 cv2.THRESH_BINARY, 11, 2)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(thresh)
    
    # Save preprocessed image
    cv2.imwrite(image_path, denoised)
    return image_path

def extract_pan_number(image_path):
    try:
        # Initialize EasyOCR reader
        reader = easyocr.Reader(['en'])
        
        # Preprocess image
        processed_path = preprocess_image(image_path)
        
        # Read text from image
        results = reader.readtext(processed_path)
        
        # PAN number pattern
        pan_pattern = r'[A-Z]{5}[0-9]{4}[A-Z]{1}'
        
        # Extract all text
        all_text = ' '.join([text for _, text, _ in results])
        
        # Find PAN number
        import re
        matches = re.findall(pan_pattern, all_text)
        
        if matches:
            return {
                'success': True,
                'panNumber': matches[0]
            }
        else:
            return {
                'success': False,
                'error': 'Could not find PAN number in the image'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': 'Please provide image path'
        }))
        sys.exit(1)
        
    image_path = sys.argv[1]
    result = extract_pan_number(image_path)
    print(json.dumps(result)) 