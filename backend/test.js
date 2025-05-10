const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000';

async function testFaceComparison() {
  try {
    // 1. Upload reference image
    console.log('Uploading reference image...');
    const referenceForm = new FormData();
    referenceForm.append('image', fs.createReadStream(path.join(__dirname, 'test-images', 'reference.jpg')));
    
    const uploadResponse = await axios.post(`${API_URL}/api/upload-reference`, referenceForm, {
      headers: {
        ...referenceForm.getHeaders()
      }
    });
    
    if (!uploadResponse.data.success) {
      throw new Error('Failed to upload reference image');
    }
    
    const referenceImagePath = uploadResponse.data.imagePath;
    console.log('Reference image uploaded:', referenceImagePath);

    // 2. Read selfie image and convert to base64
    console.log('Reading selfie image...');
    const selfieBuffer = fs.readFileSync(path.join(__dirname, 'test-images', 'selfie.jpg'));
    const selfieBase64 = `data:image/jpeg;base64,${selfieBuffer.toString('base64')}`;

    // 3. Compare faces
    console.log('Comparing faces...');
    const compareResponse = await axios.post(`${API_URL}/api/compare-faces`, {
      selfieDataUrl: selfieBase64,
      referenceImagePath: referenceImagePath
    });

    console.log('Comparison result:', compareResponse.data);

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
  }
}

// Create test-images directory if it doesn't exist
const testImagesDir = path.join(__dirname, 'test-images');
if (!fs.existsSync(testImagesDir)) {
  fs.mkdirSync(testImagesDir);
  console.log('Created test-images directory. Please add test images:');
  console.log('1. reference.jpg - A clear face photo for reference');
  console.log('2. selfie.jpg - A selfie to compare with the reference');
}

testFaceComparison(); 