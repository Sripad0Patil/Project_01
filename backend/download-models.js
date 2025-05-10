const fs = require('fs');
const path = require('path');
const axios = require('axios');

const MODELS_DIR = path.join(__dirname, 'models');

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

// Model URLs
const MODEL_FILES = [
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json',
    filename: 'ssd_mobilenetv1_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1',
    filename: 'ssd_mobilenetv1_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
    filename: 'face_landmark_68_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
    filename: 'face_landmark_68_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json',
    filename: 'face_recognition_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1',
    filename: 'face_recognition_model-shard1'
  }
];

// Download a file
async function downloadFile(url, filename) {
  const filePath = path.join(MODELS_DIR, filename);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`Downloaded ${filename}`);
      resolve();
    });
    writer.on('error', reject);
  });
}

// Download all models
async function downloadModels() {
  try {
    console.log('Downloading face-api.js models...');
    
    for (const model of MODEL_FILES) {
      await downloadFile(model.url, model.filename);
    }

    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
    process.exit(1);
  }
}

// Run the download
downloadModels(); 