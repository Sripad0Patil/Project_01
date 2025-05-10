const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://127.0.0.1:3000';
const TEST_IMAGES_PATH = 'C:/Users/Darsh/OneDrive/Desktop/hackathon0/test-images';

// Add delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function testEndpoints() {
  try {
    console.log('Starting endpoint tests...\n');
    
    // Wait for server to be fully ready
    await delay(5000);
    console.log('Checking server health...');
    try {
      await axios.get(`${API_URL}/api/health`);
      console.log('Server is healthy!\n');
    } catch (error) {
      console.error('Server health check failed. Please ensure server is running.');
      return;
    }

    // Test 1: Face Detection
    console.log('Test 1: Face Detection');
    const formData = new FormData();
    const selfieImagePath = path.join(TEST_IMAGES_PATH, 'live.jpg.jpg');
    formData.append('image', fs.createReadStream(selfieImagePath));

    try {
      const response = await axios.post(`${API_URL}/api/test-face-detection`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      console.log('Face detection test result:', response.data);
    } catch (error) {
      console.error('Face detection test failed:', error.response?.data || error.message);
      if (!error.response) {
        console.log('Retrying face detection after delay...');
        await delay(3000);
        return testEndpoints();
      }
    }

    // Test 2: Account Registration
    console.log('\nTest 2: Account Registration');
    const registrationData = new FormData();
    registrationData.append('name', 'Test User');
    registrationData.append('email', `test${Date.now()}@example.com`); // Unique email
    registrationData.append('phone', `${Math.floor(Math.random() * 9000000000) + 1000000000}`); // Random phone
    registrationData.append('age', '25');
    registrationData.append('accountType', 'Savings');
    registrationData.append('bank', 'Test Bank');
    registrationData.append('state', 'Test State');
    registrationData.append('city', 'Test City');
    registrationData.append('branch', 'Test Branch');
    registrationData.append('aadhaarNumber', `${Math.floor(Math.random() * 900000000000) + 100000000000}`); // Random Aadhaar

    // Add test documents
    registrationData.append('aadhaarCard', fs.createReadStream(path.join(TEST_IMAGES_PATH, 'DarshAshokbhaiVithlaniimage.jpg')));
    registrationData.append('panCard', fs.createReadStream(path.join(TEST_IMAGES_PATH, 'DarshAshokbhaiVithlaniimage.jpg')));
    registrationData.append('photo', fs.createReadStream(path.join(TEST_IMAGES_PATH, 'DarshAshokbhaiVithlaniimage.jpg')));
    registrationData.append('signature', fs.createReadStream(path.join(TEST_IMAGES_PATH, 'DarshAshokbhaiVithlaniimage.jpg')));

    let accountNumber;
    try {
      const response = await axios.post(`${API_URL}/api/register`, registrationData, {
        headers: {
          ...registrationData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      console.log('Registration test result:', response.data);
      accountNumber = response.data.accountNumber;
      await delay(2000); // Wait for registration to complete
    } catch (error) {
      console.error('Registration test failed:', error.response?.data || error.message);
      return;
    }

    // Test 3: Face Verification
    console.log('\nTest 3: Face Verification');
    const verificationData = new FormData();
    verificationData.append('accountNumber', accountNumber);
    verificationData.append('liveImage', fs.createReadStream(path.join(TEST_IMAGES_PATH, 'live.jpg.jpg')));
    verificationData.append('panCard', fs.createReadStream(path.join(TEST_IMAGES_PATH, 'DarshAshokbhaiVithlaniimage.jpg')));

    try {
      const verifyResponse = await axios.post(`${API_URL}/api/compare-faces`, verificationData, {
        headers: {
          ...verificationData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      console.log('\nFace Verification Results:');
      console.log('------------------------');
      console.log('Success:', verifyResponse.data.success);
      console.log('Match:', verifyResponse.data.match ? '✅ Yes' : '❌ No');
      console.log('Similarity Score:', (verifyResponse.data.similarity * 100).toFixed(2) + '%');
      console.log('Message:', verifyResponse.data.message);
      console.log('------------------------\n');
    } catch (error) {
      console.error('Face verification test failed:', error.response?.data || error.message);
    }

    // Test 4: Get Account Details
    console.log('\nTest 4: Get Account Details');
    try {
      await delay(1000); // Wait for verification to be processed
      const accountResponse = await axios.get(`${API_URL}/api/account/${accountNumber}`);
      console.log('\nAccount Details:');
      console.log('------------------------');
      console.log('Name:', accountResponse.data.account.name);
      console.log('Account Number:', accountResponse.data.account.accountNumber);
      console.log('Face Verified:', accountResponse.data.account.faceVerified ? '✅ Yes' : '❌ No');
      console.log('KYC Status:', accountResponse.data.account.kycStatus);
      console.log('------------------------\n');
    } catch (error) {
      console.error('Account details test failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test script error:', error);
  }
}

testEndpoints(); 