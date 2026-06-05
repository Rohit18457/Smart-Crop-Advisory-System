import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Loader, CheckCircle, Lightbulb, BarChart3, Calendar, Droplets } from 'lucide-react';
import Card from '../components/Common/Card';
import { getCropRecommendation } from '../api';
import { saveHistory } from '../services/historyService';

const CropRecommendation = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    rainfall: '',
    humidity: '',
    ph: ''
  });
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await getCropRecommendation(formData);
      if (data.success) {
        const rec = data.recommendation;
        setRecommendation({
          crop: rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1),
          confidence: rec.confidence,
          topRecommendations: rec.top_recommendations,
          inputParams: rec.input_params
        });

        // Save to Supabase history
        const topCrops = rec.top_recommendations?.map(r => r.crop).join(', ') || rec.crop;
        saveHistory(
          'crop_recommendation',
          `Recommended: ${rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1)}`,
          `Top crops: ${topCrops}. Conditions: N=${formData.N}, P=${formData.P}, K=${formData.K}, Temp=${formData.temperature}°C`,
          rec.confidence,
          { crop: rec.crop, input: formData, alternatives: rec.top_recommendations }
        );
      } else {
        setError(data.error || data.errors?.join(', ') || 'Prediction failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.N && formData.P && formData.K && formData.temperature && formData.rainfall && formData.humidity && formData.ph;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{t('cropRecommendation')}</h1>
        <p className="text-surface-500 mt-1">Get AI-powered crop recommendations based on your soil and climate conditions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card title="Farm Conditions" icon={Sprout} iconBg="bg-emerald-100" iconColor="text-emerald-600">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Soil Nutrients */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-3">Soil Nutrients (mg/kg)</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">Nitrogen (N)</label>
                  <input
                    type="number"
                    name="N"
                    id="crop-nitrogen"
                    value={formData.N}
                    onChange={handleInputChange}
                    placeholder="e.g. 90"
                    className="input-field"
                    min="0"
                    max="200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">Phosphorus (P)</label>
                  <input
                    type="number"
                    name="P"
                    id="crop-phosphorus"
                    value={formData.P}
                    onChange={handleInputChange}
                    placeholder="e.g. 42"
                    className="input-field"
                    min="0"
                    max="200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1">Potassium (K)</label>
                  <input
                    type="number"
                    name="K"
                    id="crop-potassium"
                    value={formData.K}
                    onChange={handleInputChange}
                    placeholder="e.g. 43"
                    className="input-field"
                    min="0"
                    max="300"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                {t('temperature')} (°C)
              </label>
              <input
                type="number"
                name="temperature"
                id="crop-temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                placeholder="e.g. 25"
                className="input-field"
                min="-10"
                max="60"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                {t('humidity')} (%)
              </label>
              <input
                type="number"
                name="humidity"
                id="crop-humidity"
                value={formData.humidity}
                onChange={handleInputChange}
                placeholder="e.g. 65"
                className="input-field"
                min="0"
                max="100"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Soil pH
              </label>
              <input
                type="number"
                name="ph"
                id="crop-ph"
                value={formData.ph}
                onChange={handleInputChange}
                placeholder="e.g. 6.5"
                className="input-field"
                min="0"
                max="14"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                {t('rainfall')} (mm)
              </label>
              <input
                type="number"
                name="rainfall"
                id="crop-rainfall"
                value={formData.rainfall}
                onChange={handleInputChange}
                placeholder="e.g. 200"
                className="input-field"
                min="0"
                max="2000"
                step="0.1"
                required
              />
            </div>

            <button
              type="submit"
              id="crop-submit-btn"
              disabled={!isFormValid || loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sprout className="h-5 w-5" />
                  {t('getRecommendation')}
                </>
              )}
            </button>
          </form>
        </Card>

        {/* Recommendation Result */}
        <Card title="Recommendation Result" icon={CheckCircle} iconBg="bg-emerald-100" iconColor="text-emerald-600">
          {!recommendation && !loading && !error && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-10 w-10 text-surface-300" />
              </div>
              <p className="text-surface-500 font-medium">Fill in your farm conditions</p>
              <p className="text-surface-400 text-sm mt-1">to get personalized crop recommendations</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Loader className="animate-spin h-10 w-10 text-primary-600" />
              </div>
              <p className="text-surface-700 font-semibold">Analyzing your farm conditions...</p>
              <p className="text-surface-500 text-sm mt-1">Our AI is processing your data</p>
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-600 font-semibold">Recommendation Failed</p>
              <p className="text-surface-500 text-sm mt-1">{error}</p>
            </div>
          )}

          {recommendation && (
            <div className="space-y-6 animate-fade-in">
              {/* Recommended Crop */}
              <div className="text-center bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl p-6 border border-primary-100">
                <div className="text-4xl mb-2">🌾</div>
                <h3 className="text-3xl font-extrabold text-primary-700 mb-1">{recommendation.crop}</h3>

                <div className="flex justify-center gap-8 mt-5 mb-4">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{t('confidence')}</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">{recommendation.confidence}%</p>
                  </div>
                </div>

                <div className="progress-bar h-2.5">
                  <div
                    className="progress-bar-fill bg-gradient-to-r from-primary-500 to-emerald-400 h-2.5"
                    style={{ width: `${recommendation.confidence}%` }}
                  />
                </div>
              </div>

              {/* Top Recommendations */}
              {recommendation.topRecommendations && recommendation.topRecommendations.length > 1 && (
                <div>
                  <h4 className="font-bold text-surface-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Top Recommendations
                  </h4>
                  <ul className="space-y-2.5">
                    {recommendation.topRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-center justify-between bg-surface-50 rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-surface-800 capitalize">{rec.crop}</span>
                        </div>
                        <span className={`text-sm font-bold ${index === 0 ? 'text-emerald-600' : 'text-surface-500'}`}>
                          {rec.confidence}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Input Summary */}
              {recommendation.inputParams && (
                <div>
                  <h4 className="font-bold text-surface-900 mb-3 flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-primary-600" />
                    Input Parameters Used
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(recommendation.inputParams).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center bg-surface-50 rounded-lg px-3 py-2">
                        <span className="text-xs font-medium text-surface-500 uppercase">{key}</span>
                        <span className="text-sm font-bold text-surface-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Additional Information */}
      {recommendation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card title="Market Information" icon={BarChart3} iconBg="bg-violet-100" iconColor="text-violet-600">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Recommended Crop</span>
                <span className="font-bold text-surface-900">{recommendation.crop}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">AI Confidence</span>
                <span className="badge badge-success">{recommendation.confidence}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Alternatives</span>
                <span className="font-bold text-surface-900">{recommendation.topRecommendations?.length || 0}</span>
              </div>
            </div>
          </Card>

          <Card title="Growth Timeline" icon={Calendar} iconBg="bg-sky-100" iconColor="text-sky-600">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Sowing</span>
                <span className="font-bold text-surface-900">Current Season</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Temperature</span>
                <span className="font-bold text-surface-900">{formData.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Rainfall</span>
                <span className="font-bold text-surface-900">{formData.rainfall} mm</span>
              </div>
            </div>
          </Card>

          <Card title="Soil Analysis" icon={Droplets} iconBg="bg-amber-100" iconColor="text-amber-600">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">N-P-K</span>
                <span className="font-bold text-surface-900">{formData.N}:{formData.P}:{formData.K}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">pH Level</span>
                <span className="font-bold text-surface-900">{formData.ph}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500">Humidity</span>
                <span className="font-bold text-surface-900">{formData.humidity}%</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CropRecommendation;