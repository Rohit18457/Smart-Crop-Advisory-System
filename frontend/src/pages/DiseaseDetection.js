import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Loader, AlertTriangle, CheckCircle, X, Shield, BookOpen, LogIn, MessageSquare, Star } from 'lucide-react';
import Card from '../components/Common/Card';
import { predictDisease } from '../api';
import { saveHistory } from '../services/historyService';
import { savePrediction } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

const DiseaseDetection = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage({
          file,
          preview: reader.result
        });
        setResult(null);
        setError(null);
        setFeedbackSubmitted(false);
        setFeedbackComment('');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    // Check authentication
    if (!isAuthenticated) {
      setError('Please sign in to use disease detection feature.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await predictDisease(selectedImage.file);
      if (data.success) {
        const pred = data.prediction;
        setResult({
          disease: pred.disease,
          confidence: pred.confidence,
          severity: pred.confidence > 80 ? 'High' : pred.confidence > 50 ? 'Moderate' : 'Low',
          description: `Cause: ${pred.cause}`,
          isHealthy: pred.is_healthy,
          symptoms: pred.top_predictions.map(
            (p) => `${p.class.replace(/___/g, ' — ').replace(/_/g, ' ')}: ${p.confidence}% confidence`
          ),
          treatment: [pred.solution],
          prevention: [
            'Regularly inspect crops for early signs of disease',
            'Maintain proper spacing for air circulation',
            'Use disease-resistant varieties when possible',
            'Practice crop rotation to break disease cycles'
          ]
        });

        // Save to Supabase history
        saveHistory(
          'disease_detection',
          pred.is_healthy ? 'Healthy Plant Detected' : `${pred.disease} Detected`,
          `Confidence: ${pred.confidence}%. ${pred.cause}`,
          pred.confidence,
          { disease: pred.disease, solution: pred.solution }
        );

        // Save to Admin Predictions Table
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await savePrediction({
              user_id: user.id,
              prediction: pred.disease,
              confidence: parseFloat(pred.confidence),
              image_url: 'User Upload (Private)', // Real image not uploaded to public bucket by default
              flagged: false
            });
          }
        } catch (dbErr) {
          console.warn('Could not save to admin predictions table:', dbErr);
        }
      } else {
        setError(data.error || 'Prediction failed');
      }
    } catch (err) {
      console.error('Disease detection error:', err);
      
      // Handle specific authentication errors
      if (err.message.includes('Authorization') || err.message.includes('authentication') || err.message.includes('token')) {
        setError('Authentication failed. Please sign in again to use this feature.');
      } else {
        setError(err.message || 'Failed to connect to the server');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
  };

  const getSeverityConfig = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return { color: 'text-emerald-700', bg: 'bg-emerald-100', ring: 'ring-emerald-200' };
      case 'moderate': return { color: 'text-amber-700', bg: 'bg-amber-100', ring: 'ring-amber-200' };
      case 'severe': return { color: 'text-red-700', bg: 'bg-red-100', ring: 'ring-red-200' };
      default: return { color: 'text-surface-700', bg: 'bg-surface-100', ring: 'ring-surface-200' };
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackComment.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase.from('feedback').insert({
        user_id: user.id,
        rating: feedbackRating,
        comment: feedbackComment,
        is_correct: feedbackRating >= 3
      });
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{t('diseaseDetection')}</h1>
        <p className="text-surface-500 mt-1">Upload crop images to identify diseases and get treatment recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Upload */}
        <Card title="Upload Crop Image" icon={Camera} iconBg="bg-orange-100" iconColor="text-orange-600">
          <div className="space-y-4">
            {!selectedImage ? (
              <div
                {...getRootProps()}
                id="disease-dropzone"
                className={`
                  border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                  ${isDragActive 
                    ? 'border-primary-500 bg-primary-50 scale-[1.02]' 
                    : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Upload className="h-8 w-8 text-surface-400" />
                </div>
                <p className="text-lg font-semibold text-surface-900 mb-2">
                  {isDragActive ? 'Drop the image here' : t('dragDrop')}
                </p>
                <p className="text-sm text-surface-500">
                  Supports: JPG, PNG, WebP (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-scale-in">
                <div className="relative group">
                  <img
                    src={selectedImage.preview}
                    alt="Selected crop"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <button
                      onClick={clearImage}
                      className="p-3 bg-white rounded-xl text-red-500 hover:bg-red-50 transition-colors shadow-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-surface-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-surface-900">{selectedImage.file.name}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={clearImage} className="text-sm text-red-500 hover:text-red-600 font-medium">Remove</button>
                </div>

                <button
                  onClick={analyzeImage}
                  id="disease-analyze-btn"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      {t('analyze')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* Analysis Result */}
        <Card title="Analysis Result" icon={AlertTriangle} iconBg="bg-amber-100" iconColor="text-amber-600">
          {!result && !loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-10 w-10 text-surface-300" />
              </div>
              <p className="text-surface-500 font-medium">Upload a crop image</p>
              <p className="text-surface-400 text-sm mt-1">to detect diseases and get treatment</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Loader className="animate-spin h-10 w-10 text-primary-600" />
              </div>
              <p className="text-surface-700 font-semibold">Analyzing image...</p>
              <p className="text-surface-500 text-sm mt-1">Our AI model is processing</p>
              <div className="dot-pulse mt-4 justify-center">
                <span /><span /><span />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-600 font-semibold">Analysis Failed</p>
              <p className="text-surface-500 text-sm mt-1 mb-4">{error}</p>
              
              {/* Show login button if authentication error */}
              {(error.includes('Authentication') || error.includes('sign in') || !isAuthenticated) && (
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to Continue
                </Link>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fade-in">
              {/* Disease Information */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🦠</span>
                    <h3 className="text-xl font-extrabold text-red-800">{result.disease}</h3>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getSeverityConfig(result.severity).bg} ${getSeverityConfig(result.severity).color}`}>
                    {result.severity}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-surface-600 uppercase tracking-wider">{t('confidence')}</span>
                    <span className="text-sm font-bold text-red-700">{result.confidence}%</span>
                  </div>
                  <div className="progress-bar h-2.5">
                    <div className="progress-bar-fill bg-gradient-to-r from-red-500 to-orange-400 h-2.5" style={{ width: `${result.confidence}%` }} />
                  </div>
                </div>

                <p className="text-sm text-surface-700 leading-relaxed">{result.description}</p>
              </div>

              {/* Symptoms */}
              <div>
                <h4 className="font-bold text-surface-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Symptoms Identified
                </h4>
                <ul className="space-y-2.5">
                  {result.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-surface-700">{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Treatment and Prevention */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Treatment */}
          <Card title="Recommended Treatment" icon={CheckCircle} iconBg="bg-emerald-100" iconColor="text-emerald-600">
            <ul className="space-y-3.5">
              {result.treatment.map((treatment, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-emerald-700 text-xs font-bold">{index + 1}</span>
                  </div>
                  <span className="text-sm text-surface-700">{treatment}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-6 alert alert-warning">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Consult with a local agricultural expert before applying any treatments. 
                Follow all safety guidelines when using chemicals.
              </p>
            </div>
          </Card>

          {/* Prevention */}
          <Card title="Prevention Measures" icon={Shield} iconBg="bg-sky-100" iconColor="text-sky-600">
            <ul className="space-y-3.5">
              {result.prevention.map((prevention, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-sky-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-surface-700">{prevention}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <button className="w-full btn-secondary flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                Get Detailed Prevention Guide
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Additional Resources */}
      {result && (
        <Card title="Additional Resources" icon={BookOpen} iconBg="bg-violet-100" iconColor="text-violet-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Expert Consultation', desc: 'Connect with agricultural experts for personalized advice', action: 'Book Consultation', emoji: '👨‍🌾' },
              { title: 'Treatment Products', desc: 'Find recommended fungicides and treatments', action: 'View Products', emoji: '🧪' },
              { title: 'Disease Database', desc: 'Learn more about common crop diseases', action: 'Browse Database', emoji: '📚' }
            ].map((resource, i) => (
              <div key={i} className="p-5 bg-surface-50 border border-surface-100 rounded-2xl hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group">
                <span className="text-3xl mb-3 block">{resource.emoji}</span>
                <h4 className="font-bold text-surface-900 mb-2">{resource.title}</h4>
                <p className="text-sm text-surface-500 mb-4">{resource.desc}</p>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold group-hover:underline">
                  {resource.action} →
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Feedback Form */}
      {result && !feedbackSubmitted && (
        <Card title="Help Us Improve" icon={MessageSquare} iconBg="bg-blue-100" iconColor="text-blue-600">
          <div className="space-y-4">
            <p className="text-sm text-surface-600">Was this diagnosis accurate? Please rate your experience.</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setFeedbackRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`h-8 w-8 ${star <= feedbackRating ? 'text-yellow-400 fill-yellow-400' : 'text-surface-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Tell us more about your experience or suggest improvements..."
              className="w-full p-3 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              rows={3}
            />
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedbackComment.trim()}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Submit Feedback
            </button>
          </div>
        </Card>
      )}

      {result && feedbackSubmitted && (
        <Card title="Thank You!" icon={CheckCircle} iconBg="bg-emerald-100" iconColor="text-emerald-600">
          <p className="text-sm text-surface-600">Your feedback has been successfully securely submitted. This helps us improve the AI accuracy for everyone.</p>
        </Card>
      )}
    </div>
  );
};

export default DiseaseDetection;