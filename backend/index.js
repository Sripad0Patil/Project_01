const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Initialize face-api
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Enable CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// In-memory user storage (replace with database in production)
const users = [];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    // Save user
    users.push(newUser);

    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log user details with masked password
    const maskedPassword = '*'.repeat(password.length);
    console.log('New user registered:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: maskedPassword, // Log masked password
      hashedPassword: hashedPassword, // Log hashed password
      registeredAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log login
    console.log('User logged in:', {
      id: user.id,
      email: user.email,
      loginTime: new Date().toISOString()
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get user profile endpoint
app.get('/api/profile', authenticateToken, (req, res) => {
  const user = users.find(user => user.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email
  });
});

// Create necessary directories
const uploadDir = path.join(__dirname, 'uploads');
const modelPath = path.join(__dirname, 'models');
[uploadDir, modelPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Load face-api models
async function loadModels() {
  try {
    console.log('Loading face detection models...');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    console.log('Models loaded successfully');
  } catch (error) {
    console.error('Error loading models:', error);
    throw error;
  }
}

// Extract face from image
async function extractFaceFromImage(imageBuffer) {
  try {
    console.log('Processing image for face extraction...');
    const img = await canvas.loadImage(imageBuffer);
    console.log('Image loaded, dimensions:', img.width, 'x', img.height);

    let detections = null;
    let confidenceThreshold = 0.2; // Even lower initial threshold
    
    while (!detections && confidenceThreshold > 0.05) { // Much lower minimum threshold
      console.log(`Attempting face detection with confidence threshold: ${confidenceThreshold}`);
      detections = await faceapi.detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: confidenceThreshold }))
      .withFaceLandmarks()
      .withFaceDescriptor();

      if (!detections) {
        confidenceThreshold -= 0.02; // Smaller steps
      }
    }

    if (!detections) {
      throw new Error('No face detected in image after multiple attempts');
    }

    console.log('Face detected with confidence:', detections.detection.score);

    // More lenient face size and position checks
    const { box } = detections.detection;
    const faceSize = box.width * box.height;
    const imageSize = img.width * img.height;
    const faceRatio = faceSize / imageSize;

    if (faceRatio < 0.001) { // Much lower minimum face size ratio
      throw new Error('Face is too small in the image');
    }

    if (faceRatio > 0.8) { // Higher maximum face size ratio
      throw new Error('Face is too large in the image');
    }

    return {
      faceImage: imageBuffer,
      descriptor: detections.descriptor,
      detection: detections.detection
    };
  } catch (error) {
    console.error('Error extracting face:', error);
    throw error;
  }
}

// Compare faces
async function compareFaces(face1Descriptor, face2Descriptor) {
  try {
    console.log('Comparing face descriptors...');
    const distance = faceapi.euclideanDistance(face1Descriptor, face2Descriptor);
    const similarity = 1 - distance;
    
    // Convert to percentage for easier comparison
    const similarityPercentage = similarity * 100;
    
    // Lower thresholds for more lenient matching
    const thresholds = {
      high: 45,    // Lowered from 55
      medium: 35,  // Lowered from 45
      low: 25      // Lowered from 35
    };
    
    // Calculate match confidence level
    let confidenceLevel = 'none';
    if (similarityPercentage >= thresholds.high) {
      confidenceLevel = 'high';
    } else if (similarityPercentage >= thresholds.medium) {
      confidenceLevel = 'medium';
    } else if (similarityPercentage >= thresholds.low) {
      confidenceLevel = 'low';
    }
    
    console.log('Face comparison results:', {
      distance,
      similarity,
      similarityPercentage: similarityPercentage.toFixed(2) + '%',
      thresholds,
      confidenceLevel,
      match: similarityPercentage >= thresholds.medium
    });

    return {
      similarityPercentage,
      confidenceLevel,
      thresholds,
      match: similarityPercentage >= thresholds.medium
    };
  } catch (error) {
    console.error('Error comparing faces:', error);
    throw error;
  }
}

// Face verification endpoint
app.post('/api/compare-faces', upload.fields([
  { name: 'liveImage', maxCount: 1 },
  { name: 'referenceImage', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Face verification request received');
    
    if (!req.files.liveImage || !req.files.referenceImage) {
      console.log('Missing required images');
      return res.status(400).json({ 
        success: false, 
        message: 'Both live image and reference image are required'
      });
    }

    console.log('Processing images...');
    const liveImageBuffer = fs.readFileSync(req.files.liveImage[0].path);
    const referenceImageBuffer = fs.readFileSync(req.files.referenceImage[0].path);

    console.log('Extracting faces...');
    let liveFace, referenceFace;
    let extractionDetails = {
      live: { success: false, error: null },
      reference: { success: false, error: null }
    };

    try {
      liveFace = await extractFaceFromImage(liveImageBuffer);
      extractionDetails.live.success = true;
      extractionDetails.live.confidence = liveFace.detection.score;
      console.log('Live face extracted successfully');
    } catch (error) {
      console.error('Error extracting live face:', error);
      extractionDetails.live.error = error.message;
      return res.status(400).json({ 
        success: false, 
        message: 'Could not detect face in live image. Please ensure your face is clearly visible.',
        details: extractionDetails
      });
    }

    try {
      referenceFace = await extractFaceFromImage(referenceImageBuffer);
      extractionDetails.reference.success = true;
      extractionDetails.reference.confidence = referenceFace.detection.score;
      console.log('Reference photo face extracted successfully');
    } catch (error) {
      console.error('Error extracting reference photo face:', error);
      extractionDetails.reference.error = error.message;
      return res.status(400).json({ 
        success: false, 
        message: 'Could not detect face in reference photo. Please try again.',
        details: extractionDetails
      });
    }

    console.log('Comparing faces...');
    const comparisonResult = await compareFaces(liveFace.descriptor, referenceFace.descriptor);
    console.log('Comparison complete:', comparisonResult);

    res.json({
      success: true,
      match: comparisonResult.match,
      similarity: comparisonResult.similarityPercentage / 100,
      similarityPercentage: comparisonResult.similarityPercentage.toFixed(2) + '%',
      confidenceLevel: comparisonResult.confidenceLevel,
      thresholds: comparisonResult.thresholds,
      extractionDetails,
      message: comparisonResult.match 
        ? 'Face verification successful' 
        : 'Face verification failed - faces do not match'
    });
  } catch (error) {
    console.error('Face comparison error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Face comparison failed: ' + error.message
    });
  }
});

// Review and Submit endpoint
app.post('/api/submit-account', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaar', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      age,
      accountType,
      bank,
      aadhaarNumber,
      panNumber
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !age || !accountType || !bank || !aadhaarNumber || !panNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // PAN format validation (Indian PAN: 5 letters, 4 digits, 1 letter)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(panNumber.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PAN format. It should be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)'
      });
    }

    // Validate files
    if (!req.files.photo || !req.files.aadhaar || !req.files.panCard || !req.files.signature) {
      return res.status(400).json({
        success: false,
        message: 'All documents are required'
      });
    }

    // Create account object
    const account = {
      id: Date.now().toString(),
      fullName,
      email,
      phone,
      age,
      accountType,
      bank,
      aadhaarNumber,
      panNumber,
      documents: {
        photo: req.files.photo[0].path,
        aadhaar: req.files.aadhaar[0].path,
        panCard: req.files.panCard[0].path,
        signature: req.files.signature[0].path
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // In a real application, you would save this to a database
    // For now, we'll just log it
    console.log('New account application:', {
      ...account,
      documents: {
        photo: 'File path: ' + account.documents.photo,
        aadhaar: 'File path: ' + account.documents.aadhaar,
        panCard: 'File path: ' + account.documents.panCard,
        signature: 'File path: ' + account.documents.signature
      }
    });

    res.status(201).json({
      success: true,
      message: 'Account application submitted successfully',
      accountId: account.id
    });
  } catch (error) {
    console.error('Error submitting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting account application'
    });
  }
});

// Initialize models and start server
loadModels()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('Available routes:');
      console.log('- POST /api/signup');
      console.log('- POST /api/login');
      console.log('- GET /api/profile');
      console.log('- POST /api/compare-faces');
      console.log('- POST /api/submit-account');
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
  }); 