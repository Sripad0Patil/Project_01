import React, { useState } from 'react';
import axios from 'axios';

const PANVerification = ({ inputName, inputPanNumber, onVerificationComplete }) => {
  const [panCardFile, setPanCardFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPanCardFile(file);
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('panCardFile', file);

        const extractResponse = await axios.post('http://localhost:3000/api/extract-pan-data', formData);
        
        if (extractResponse.data.success) {
          onVerificationComplete({
            verified: true,
            panNumber: extractResponse.data.panNumber
          });
        } else {
          throw new Error(extractResponse.data.error || 'Failed to extract PAN number');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to process PAN card';
        setError(errorMessage);
        onVerificationComplete({
          verified: false,
          error: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="pan-verification">
      <div className="file-upload">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isLoading && <p>Processing PAN card...</p>}
        {error && <p className="error">{error}</p>}
        {panCardFile && !isLoading && !error && (
          <p className="success">PAN card uploaded successfully. Please wait for verification.</p>
        )}
      </div>
    </div>
  );
};

export default PANVerification; 