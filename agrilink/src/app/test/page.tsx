'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Mail, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  PlayCircle,
  Eye,
  Loader2,
  TestTube,
  Server,
  Shield,
  Users,
  Activity
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp?: string;
}

export default function TestDashboard() {
  const [tests, setTests] = useState<{ [key: string]: TestResult | null }>({
    environment: null,
    database: null,
    email: null
  });
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [emailTestData, setEmailTestData] = useState({
    email: '',
    type: 'simple'
  });

  const runTest = async (testName: string, endpoint: string, options?: any) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      const response = await fetch(endpoint, {
        method: options?.method || 'GET',
        headers: options?.headers,
        body: options?.body
      });
      
      const result = await response.json();
      setTests(prev => ({ ...prev, [testName]: result }));
    } catch (error) {
      setTests(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          message: 'Network error occurred',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const runEnvironmentTest = () => runTest('environment', '/test/api/environment');
  
  const runDatabaseTest = () => runTest('database', '/test/api/database');
  
  const runEmailTest = () => {
    if (!emailTestData.email) {
      alert('Please enter an email address');
      return;
    }
    
    runTest('email', '/test/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailTestData)
    });
  };

  const runAllTests = async () => {
    await runEnvironmentTest();
    await runDatabaseTest();
    if (emailTestData.email) {
      await runEmailTest();
    }
  };

  const getStatusIcon = (result: TestResult | null) => {
    if (!result) return <AlertCircle className="h-5 w-5 text-gray-400" />;
    if (result.success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (result: TestResult | null) => {
    if (!result) return 'border-gray-200 bg-gray-50';
    if (result.success) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TestTube className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AgriLink Test Dashboard</h1>
          </div>
          <p className="text-lg text-gray-600">
            Comprehensive testing interface to verify all AgriLink systems are working correctly
          </p>
          
          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={runAllTests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <PlayCircle className="h-5 w-5" />
              <span>Run All Tests</span>
            </button>
            
            <a
              href="/test/subscriber"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Users className="h-5 w-5" />
              <span>Test Subscriber</span>
            </a>
            
            <a
              href="/test/api"
              target="_blank"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Eye className="h-5 w-5" />
              <span>View API Overview</span>
            </a>
          </div>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Environment Test */}
          <div className={`border-2 rounded-xl p-6 transition-all ${getStatusColor(tests.environment)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Settings className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Environment Config</h3>
              </div>
              {getStatusIcon(tests.environment)}
            </div>
            
            <p className="text-gray-600 mb-4">
              Verify all environment variables and configuration settings
            </p>
            
            <button
              onClick={runEnvironmentTest}
              disabled={loading.environment}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {loading.environment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              <span>{loading.environment ? 'Testing...' : 'Test Environment'}</span>
            </button>

            {tests.environment && (
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="font-medium text-sm">{tests.environment.message}</p>
                {tests.environment.data?.configured && (
                  <p className="text-sm text-gray-600 mt-1">
                    Configured: {tests.environment.data.configured}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Database Test */}
          <div className={`border-2 rounded-xl p-6 transition-all ${getStatusColor(tests.database)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Database className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-semibold">Database Connection</h3>
              </div>
              {getStatusIcon(tests.database)}
            </div>
            
            <p className="text-gray-600 mb-4">
              Test MongoDB connection and basic operations
            </p>
            
            <button
              onClick={runDatabaseTest}
              disabled={loading.database}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {loading.database ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{loading.database ? 'Testing...' : 'Test Database'}</span>
            </button>

            {tests.database && (
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="font-medium text-sm">{tests.database.message}</p>
                {tests.database.data?.connectionState && (
                  <p className="text-sm text-gray-600 mt-1">
                    Status: {tests.database.data.connectionState}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Email Test */}
          <div className={`border-2 rounded-xl p-6 transition-all ${getStatusColor(tests.email)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-purple-600" />
                <h3 className="text-xl font-semibold">Email Service</h3>
              </div>
              {getStatusIcon(tests.email)}
            </div>
            
            <p className="text-gray-600 mb-4">
              Test email configuration and sending capabilities
            </p>
            
            <div className="space-y-3 mb-4">
              <input
                type="email"
                placeholder="Enter test email address"
                value={emailTestData.email}
                onChange={(e) => setEmailTestData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <select
                value={emailTestData.type}
                onChange={(e) => setEmailTestData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="simple">Simple Test Email</option>
                <option value="welcome">Welcome Email</option>
                <option value="price-alert">Price Alert Email</option>
                <option value="newsletter">Newsletter Email</option>
              </select>
            </div>
            
            <button
              onClick={runEmailTest}
              disabled={loading.email || !emailTestData.email}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {loading.email ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              <span>{loading.email ? 'Sending...' : 'Send Test Email'}</span>
            </button>

            {tests.email && (
              <div className="mt-4 p-3 bg-white rounded-lg border">
                <p className="font-medium text-sm">{tests.email.message}</p>
                {tests.email.data?.recipient && (
                  <p className="text-sm text-gray-600 mt-1">
                    Sent to: {tests.email.data.recipient}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Quick Test Links</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/test/api"
              target="_blank"
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Server className="h-5 w-5 text-blue-600" />
              <span className="font-medium">API Overview</span>
            </a>
            
            <a
              href="/test/api/environment"
              target="_blank"
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-5 w-5 text-green-600" />
              <span className="font-medium">Environment Check</span>
            </a>
            
            <a
              href="/test/api/database"
              target="_blank"
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Database className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Database Status</span>
            </a>
            
            <a
              href="/test/subscriber"
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Test Subscriber</span>
            </a>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">How to Use This Test Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Environment Test:</h4>
              <ul className="space-y-1">
                <li>• Checks all required environment variables</li>
                <li>• Verifies configuration completeness</li>
                <li>• Provides recommendations for missing vars</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Database Test:</h4>
              <ul className="space-y-1">
                <li>• Tests MongoDB connection</li>
                <li>• Verifies read/write operations</li>
                <li>• Shows database statistics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Email Test:</h4>
              <ul className="space-y-1">
                <li>• Tests SMTP configuration</li>
                <li>• Sends various email types</li>
                <li>• Verifies email delivery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Test Subscriber:</h4>
              <ul className="space-y-1">
                <li>• Adds test email subscribers</li>
                <li>• Tests newsletter functionality</li>
                <li>• Useful for email campaign testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
