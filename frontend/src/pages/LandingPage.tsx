import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

export function LandingPage() {
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
  const navigate = useNavigate();

  if (view === 'login') {
    return (
      <LoginForm 
        onSuccess={() => navigate('/dashboard')}
        onBackClick={() => setView('landing')}
      />
    );
  }

  if (view === 'signup') {
    return (
      <SignupForm 
        onSuccess={() => navigate('/dashboard')}
        onBackClick={() => setView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-blue-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RS</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">RepaySignal</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Your Loan Repayment Companion
            </h2>
            <p className="text-xl text-slate-600 max-w-lg mx-auto">
              Get personalized risk assessments, timely interventions, and actionable insights to improve your loan repayment trajectory.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Risk Assessment</h3>
              <p className="text-sm text-slate-600">
                AI-powered analysis of your repayment potential based on educational background and market data.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Smart Interventions</h3>
              <p className="text-sm text-slate-600">
                Receive targeted recommendations when your risk profile changes or needs attention.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-slate-600">
                Your data is encrypted and never shared. Only used to help you succeed.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setView('signup')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Create Account
            </button>
            <button
              onClick={() => setView('login')}
              className="px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg border-2 border-slate-200 hover:border-slate-300 transition-all duration-200"
            >
              Sign In
            </button>
          </div>

          {/* Trust Badges */}
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-slate-600">Trusted by educational institutions</p>
            <div className="flex items-center justify-center gap-6 flex-wrap opacity-60">
              <span className="text-slate-500 font-semibold">IIT</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500 font-semibold">BITS</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500 font-semibold">IIIT</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-500 font-semibold">NIT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-600">
            <p>© 2026 RepaySignal. All rights reserved. | 
              <a href="#" className="ml-2 text-blue-600 hover:underline">Privacy Policy</a> • 
              <a href="#" className="ml-2 text-blue-600 hover:underline">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
