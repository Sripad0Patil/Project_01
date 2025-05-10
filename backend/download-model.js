const fs = require('fs');
const path = require('path');
const https = require('https');

const modelDir = path.join(__dirname, 'models', 'face_detection');

// Create model directory if it doesn't exist
if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}

// Model files to download
const files = [
  {
    name: 'model.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'model.weights.bin',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model.weights'
  }
];

// Download file helper function
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        https.get(response.headers.location, (redirectedResponse) => {
          redirectedResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Download all model files
async function downloadModel() {
  try {
    console.log('Downloading face detection model...');
    
    for (const file of files) {
      const filepath = path.join(modelDir, file.name);
      console.log(`Downloading ${file.name}...`);
      await downloadFile(file.url, filepath);
      console.log(`Downloaded ${file.name}`);
    }
    
    console.log('Model downloaded successfully!');
  } catch (error) {
    console.error('Error downloading model:', error);
    process.exit(1);
  }
}

downloadModel(); 