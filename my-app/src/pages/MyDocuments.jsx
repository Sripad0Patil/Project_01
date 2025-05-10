import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaDownload, FaTrash, FaEye } from 'react-icons/fa';
import './MyDocuments.css';

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documents.find(doc => doc.id === documentId).filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = async (documentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/${documentId}/view`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to view document');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="documents-container">
        <div className="loading-spinner">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-container">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>My Documents</h1>
        <p>View and manage your uploaded documents</p>
      </div>

      {documents.length === 0 ? (
        <div className="no-documents">
          <FaFileAlt className="no-documents-icon" />
          <p>No documents uploaded yet</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">
                <FaFileAlt />
              </div>
              <div className="document-info">
                <h3>{doc.filename}</h3>
                <p className="document-type">{doc.type}</p>
                <p className="document-date">
                  Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                </p>
              </div>
              <div className="document-actions">
                <button
                  className="action-button view"
                  onClick={() => handleView(doc.id)}
                  title="View Document"
                >
                  <FaEye />
                </button>
                <button
                  className="action-button download"
                  onClick={() => handleDownload(doc.id)}
                  title="Download Document"
                >
                  <FaDownload />
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleDelete(doc.id)}
                  title="Delete Document"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDocuments; 