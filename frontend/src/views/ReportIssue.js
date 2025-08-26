import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ReportIssue = () => {
  const navigate = () => window.history.back();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'medium',
    description: '',
    steps: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: navigator.userAgent,
    contactEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Bug Report',
    'Feature Request',
    'UI/UX Issue',
    'Performance Issue',
    'Security Concern',
    'Data Issue',
    'Login/Authentication',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.title.trim()) {
        toast.error('Issue title is required');
        setIsSubmitting(false);
        return;
      }

      if (!formData.category) {
        toast.error('Please select a category');
        setIsSubmitting(false);
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Issue description is required');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post('/issues', {
        ...formData,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId')
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.data.success) {
        toast.success(`Issue reported successfully! Ticket ID: ${response.data.data.id}`);
        
        // Reset form
        setFormData({
          title: '',
          category: '',
          priority: 'medium',
          description: '',
          steps: '',
          expectedBehavior: '',
          actualBehavior: '',
          browserInfo: navigator.userAgent,
          contactEmail: ''
        });

        // Optional: Navigate back after successful submission
        setTimeout(() => {
          navigate();
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit issue');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Server error occurred';
        toast.error(`Failed to submit issue: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-indigo-900 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate()}
            className="mb-4 flex items-center text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Report an Issue</h1>
              <p className="text-white/70 mt-2">Help us improve AuraSphere by reporting bugs or suggesting features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="" className="bg-slate-800">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Priority Level
                </label>
                <div className="flex flex-wrap gap-4">
                  {priorities.map((priority) => (
                    <label key={priority.value} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500"
                      />
                      <span className={`ml-2 text-sm font-medium ${priority.color}`}>
                        {priority.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Detailed Description
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Provide a detailed description of the issue..."
                />
                <p className="text-xs text-white/50 mt-1">
                  {formData.description.length}/2000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Steps to Reproduce
                </label>
                <textarea
                  name="steps"
                  value={formData.steps}
                  onChange={handleInputChange}
                  maxLength={1000}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Expected Behavior
                  </label>
                  <textarea
                    name="expectedBehavior"
                    value={formData.expectedBehavior}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="What should happen..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Actual Behavior
                  </label>
                  <textarea
                    name="actualBehavior"
                    value={formData.actualBehavior}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="What actually happens..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              System Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Browser Information
              </label>
              <textarea
                name="browserInfo"
                value={formData.browserInfo}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                readOnly
              />
              <p className="text-xs text-white/50 mt-1">This information is automatically detected</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate()}
              disabled={isSubmitting}
              className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.category || !formData.description.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
	  {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark" // matches your dark theme
          toastClassName="backdrop-blur-xl bg-white/10 border border-white/20"
        />
    </div>
  );
};

export default ReportIssue;