import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const FaceVerification = ({ accountNumber, onVerificationComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const countdownRef = useRef(null);
  const captureTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setCountdown(10);
    setIsCountingDown(true);
    
    // Set timeout for forced capture after 10 seconds
    captureTimeoutRef.current = setTimeout(() => {
      if (isCameraActive) {
        captureImage();
      }
    }, 10000);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setIsCountingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
        // Start face detection loop
        detectFace();
        // Start countdown immediately
        startCountdown();
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure you have granted camera permissions.');
      console.error('Camera access error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
      setFaceDetected(false);
      setFacePosition(null);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        setIsCountingDown(false);
      }
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      // Send to backend for face detection with lower confidence threshold
      const response = await axios.post('http://localhost:3000/api/test-face-detection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success && response.data.faces.length > 0) {
        const face = response.data.faces[0];
        setFaceDetected(true);
        setFacePosition(face.box);
        setError(null);
      } else {
        setFaceDetected(false);
        setFacePosition(null);
        setError('No face detected. Please look at the camera.');
      }
    } catch (err) {
      console.error('Face detection error:', err);
    }

    // Continue detection loop
    if (isCameraActive) {
      requestAnimationFrame(detectFace);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      setIsVerifying(true);
      setError(null);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      const formData = new FormData();
      formData.append('liveImage', blob, 'capture.jpg');
      formData.append('accountNumber', accountNumber);

      const response = await axios.post('http://localhost:3000/api/compare-faces', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setVerificationResult(response.data);
      if (response.data.success && response.data.match) {
        onVerificationComplete(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Face verification failed. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
      stopCamera();
    }
  };

  return (
    <div className="face-verification">
      <h2>Face Verification</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isCountingDown && (
        <div className="countdown">
          Capturing in {countdown} seconds...
        </div>
      )}

      {verificationResult && (
        <div className={`verification-result ${verificationResult.match ? 'success' : 'failure'}`}>
          <h3>Verification Results</h3>
          
          <div className="result-details">
            <div className="detail-item">
              <span className="label">Match Status:</span>
              <span className={`value ${verificationResult.match ? 'success' : 'failure'}`}>
                {verificationResult.match ? '✅ Verified' : '❌ Not Verified'}
              </span>
            </div>

            <div className="detail-item">
              <span className="label">Similarity Score:</span>
              <span className="value">{verificationResult.similarityPercentage}</span>
            </div>

            <div className="detail-item">
              <span className="label">Confidence Level:</span>
              <span className={`value confidence-${verificationResult.confidenceLevel}`}>
                {verificationResult.confidenceLevel.charAt(0).toUpperCase() + 
                 verificationResult.confidenceLevel.slice(1)}
              </span>
            </div>

            <div className="thresholds">
              <h4>Thresholds:</h4>
              <div className="threshold-item">
                <span className="label">High Confidence:</span>
                <span className="value">{verificationResult.thresholds.high}%</span>
              </div>
              <div className="threshold-item">
                <span className="label">Medium Confidence:</span>
                <span className="value">{verificationResult.thresholds.medium}%</span>
              </div>
              <div className="threshold-item">
                <span className="label">Low Confidence:</span>
                <span className="value">{verificationResult.thresholds.low}%</span>
              </div>
            </div>

            {verificationResult.extractionDetails && (
              <div className="extraction-details">
                <h4>Face Detection Details:</h4>
                <div className="detail-section">
                  <h5>Live Image:</h5>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value ${verificationResult.extractionDetails.live.success ? 'success' : 'failure'}`}>
                      {verificationResult.extractionDetails.live.success ? '✅ Detected' : '❌ Not Detected'}
                    </span>
                  </div>
                  {verificationResult.extractionDetails.live.confidence && (
                    <div className="detail-item">
                      <span className="label">Detection Confidence:</span>
                      <span className="value">
                        {(verificationResult.extractionDetails.live.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {verificationResult.extractionDetails.live.error && (
                    <div className="error-message">
                      {verificationResult.extractionDetails.live.error}
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h5>Reference Photo:</h5>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className={`value ${verificationResult.extractionDetails.reference.success ? 'success' : 'failure'}`}>
                      {verificationResult.extractionDetails.reference.success ? '✅ Detected' : '❌ Not Detected'}
                    </span>
                  </div>
                  {verificationResult.extractionDetails.reference.confidence && (
                    <div className="detail-item">
                      <span className="label">Detection Confidence:</span>
                      <span className="value">
                        {(verificationResult.extractionDetails.reference.confidence * 100).toFixed(2)}%
                      </span>
                    </div>
                  )}
                  {verificationResult.extractionDetails.reference.error && (
                    <div className="error-message">
                      {verificationResult.extractionDetails.reference.error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="result-message">{verificationResult.message}</p>
        </div>
      )}

      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ display: isCameraActive ? 'block' : 'none' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {isCameraActive && (
          <div className="face-guide">
            <div className="guide-box"></div>
            {faceDetected && facePosition && (
              <div 
                className="face-box"
                style={{
                  left: `${(facePosition.x / videoRef.current.videoWidth) * 100}%`,
                  top: `${(facePosition.y / videoRef.current.videoHeight) * 100}%`,
                  width: `${(facePosition.width / videoRef.current.videoWidth) * 100}%`,
                  height: `${(facePosition.height / videoRef.current.videoHeight) * 100}%`
                }}
              ></div>
            )}
          </div>
        )}
      </div>

      <div className="controls">
        {!isCameraActive ? (
          <button onClick={startCamera} disabled={isVerifying}>
            Start Camera
          </button>
        ) : (
          <button onClick={stopCamera} disabled={isVerifying}>
            Stop Camera
          </button>
        )}
      </div>

      <style jsx>{`
        .face-verification {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .camera-container {
          margin: 20px 0;
          position: relative;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
        }

        video {
          width: 100%;
          border-radius: 8px;
          background: #000;
        }

        .face-guide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .guide-box {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60%;
          height: 60%;
          border: 2px dashed #fff;
          border-radius: 50%;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        }

        .face-box {
          position: absolute;
          border: 2px solid #00ff00;
          border-radius: 4px;
          transition: all 0.1s ease;
        }

        .countdown {
          text-align: center;
          font-size: 24px;
          color: #007bff;
          margin: 20px 0;
          font-weight: bold;
        }

        .controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }

        button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background: #007bff;
          color: white;
          cursor: pointer;
          font-size: 16px;
        }

        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc3545;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #dc3545;
          border-radius: 4px;
          background: #fff;
        }

        .verification-result {
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .verification-result h3 {
          margin: 0 0 20px 0;
          text-align: center;
          color: #333;
        }

        .result-details {
          margin: 20px 0;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .label {
          font-weight: 600;
          color: #495057;
        }

        .value {
          font-weight: 500;
        }

        .value.success {
          color: #28a745;
        }

        .value.failure {
          color: #dc3545;
        }

        .confidence-high {
          color: #28a745;
        }

        .confidence-medium {
          color: #ffc107;
        }

        .confidence-low {
          color: #fd7e14;
        }

        .thresholds {
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .thresholds h4 {
          margin: 0 0 10px 0;
          color: #495057;
        }

        .threshold-item {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          padding: 5px 0;
          border-bottom: 1px solid #dee2e6;
        }

        .extraction-details {
          margin: 20px 0;
        }

        .extraction-details h4 {
          margin: 0 0 15px 0;
          color: #495057;
        }

        .detail-section {
          margin: 15px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .detail-section h5 {
          margin: 0 0 10px 0;
          color: #495057;
        }

        .result-message {
          margin: 20px 0 0 0;
          padding: 10px;
          text-align: center;
          font-weight: 500;
          border-radius: 4px;
        }

        .verification-result.success .result-message {
          background: #d4edda;
          color: #155724;
        }

        .verification-result.failure .result-message {
          background: #f8d7da;
          color: #721c24;
        }
      `}</style>
    </div>
  );
};

export default FaceVerification; 