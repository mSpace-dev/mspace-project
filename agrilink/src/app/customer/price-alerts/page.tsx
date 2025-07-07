"use client";

import { useState, useEffect } from "react";
import CustomerUserProfile from "../../../components/CustomerUserProfile";

interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  province: string;
}

interface PriceAlert {
  id: string;
  cropName: string;
  variety: string;
  location: string;
  alertType: 'above' | 'below' | 'change';
  targetPrice?: number;
  changePercentage?: number;
  currentPrice: number;
  isActive: boolean;
  createdDate: string;
  lastTriggered?: string;
  notificationMethod: 'email' | 'sms' | 'both';
}

export default function CustomerPriceAlerts() {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    // Get customer info from localStorage
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      const parsedCustomer = JSON.parse(customerData);
      setCustomer(parsedCustomer);
    }
  }, []);
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: "1",
      cropName: "Rice",
      variety: "Nadu",
      location: "Colombo",
      alertType: "above",
      targetPrice: 130,
      currentPrice: 120,
      isActive: true,
      createdDate: "2025-01-05",
      notificationMethod: "both"
    },
    {
      id: "2",
      cropName: "Tomato",
      variety: "Local",
      location: "Kandy",
      alertType: "below",
      targetPrice: 180,
      currentPrice: 200,
      isActive: true,
      createdDate: "2025-01-04",
      lastTriggered: "2025-01-06",
      notificationMethod: "email"
    },
    {
      id: "3",
      cropName: "Onion",
      variety: "Big Onion",
      location: "Gampaha",
      alertType: "change",
      changePercentage: 10,
      currentPrice: 180,
      isActive: false,
      createdDate: "2025-01-03",
      notificationMethod: "sms"
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    cropName: "",
    variety: "",
    location: "",
    alertType: "above" as 'above' | 'below' | 'change',
    targetPrice: "",
    changePercentage: "",
    notificationMethod: "email" as 'email' | 'sms' | 'both'
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const alert: PriceAlert = {
      id: Date.now().toString(),
      cropName: newAlert.cropName,
      variety: newAlert.variety,
      location: newAlert.location,
      alertType: newAlert.alertType,
      targetPrice: newAlert.alertType !== 'change' ? Number(newAlert.targetPrice) : undefined,
      changePercentage: newAlert.alertType === 'change' ? Number(newAlert.changePercentage) : undefined,
      currentPrice: 0, // Would be fetched from API
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      notificationMethod: newAlert.notificationMethod
    };
    
    setAlerts([...alerts, alert]);
    setShowCreateModal(false);
    setNewAlert({
      cropName: "",
      variety: "",
      location: "",
      alertType: "above",
      targetPrice: "",
      changePercentage: "",
      notificationMethod: "email"
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertStatus = (alert: PriceAlert) => {
    if (!alert.isActive) return { status: 'inactive', color: 'gray' };
    
    switch (alert.alertType) {
      case 'above':
        return alert.currentPrice > (alert.targetPrice || 0) 
          ? { status: 'triggered', color: 'red' }
          : { status: 'monitoring', color: 'green' };
      case 'below':
        return alert.currentPrice < (alert.targetPrice || 0)
          ? { status: 'triggered', color: 'red' }
          : { status: 'monitoring', color: 'green' };
      case 'change':
        return { status: 'monitoring', color: 'green' };
      default:
        return { status: 'unknown', color: 'gray' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/home" className="text-2xl font-bold text-green-700 hover:text-green-600 transition-colors">
                AgriLink
              </a>
              <span className="ml-2 text-sm text-gray-500">Sri Lanka</span>
            </div>
            
            <div className="flex items-center space-x-8">
              <a href="/home" className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              <CustomerUserProfile 
                        isLoggedIn={!!customer} 
                        userRole="customer"
                        userName={customer?.name || "Customer"}
                        userEmail={customer?.email || ""}
                      />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Price Alerts</h1>
            <p className="text-gray-600 mt-2">Stay informed about market price changes for your crops</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Alert</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.filter(a => a.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Triggered Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.filter(a => a.lastTriggered === new Date().toISOString().split('T')[0]).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.filter(a => !a.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Grid */}
        {alerts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No price alerts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first price alert.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Create Alert
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => {
              const alertStatus = getAlertStatus(alert);
              return (
                <div key={alert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{alert.cropName}</h3>
                      <p className="text-sm text-gray-500">{alert.variety} • {alert.location}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alertStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                      alertStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alertStatus.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600">
                      {alert.alertType === 'above' && `Alert when price goes above Rs. ${alert.targetPrice}`}
                      {alert.alertType === 'below' && `Alert when price goes below Rs. ${alert.targetPrice}`}
                      {alert.alertType === 'change' && `Alert when price changes by ${alert.changePercentage}%`}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Current price: Rs. {alert.currentPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {alert.notificationMethod === 'email' && (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {alert.notificationMethod === 'sms' && (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                      {alert.notificationMethod === 'both' && (
                        <>
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </>
                      )}
                      <span className="text-xs text-gray-500 capitalize">{alert.notificationMethod}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created {alert.createdDate}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                        alert.isActive 
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {alert.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Alert Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Price Alert</h3>
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                    <input
                      type="text"
                      required
                      value={newAlert.cropName}
                      onChange={(e) => setNewAlert({...newAlert, cropName: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g., Rice, Tomato"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Variety</label>
                    <input
                      type="text"
                      required
                      value={newAlert.variety}
                      onChange={(e) => setNewAlert({...newAlert, variety: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="e.g., Nadu, Local"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select
                      required
                      value={newAlert.location}
                      onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="">Select Location</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Anuradhapura">Anuradhapura</option>
                      <option value="Nuwara Eliya">Nuwara Eliya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                    <select
                      value={newAlert.alertType}
                      onChange={(e) => setNewAlert({...newAlert, alertType: e.target.value as 'above' | 'below' | 'change'})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="above">Price goes above</option>
                      <option value="below">Price goes below</option>
                      <option value="change">Price changes by %</option>
                    </select>
                  </div>

                  {newAlert.alertType !== 'change' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (Rs.)</label>
                      <input
                        type="number"
                        required
                        value={newAlert.targetPrice}
                        onChange={(e) => setNewAlert({...newAlert, targetPrice: e.target.value})}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="e.g., 150"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Change Percentage (%)</label>
                      <input
                        type="number"
                        required
                        value={newAlert.changePercentage}
                        onChange={(e) => setNewAlert({...newAlert, changePercentage: e.target.value})}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        placeholder="e.g., 10"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notification Method</label>
                    <select
                      value={newAlert.notificationMethod}
                      onChange={(e) => setNewAlert({...newAlert, notificationMethod: e.target.value as 'email' | 'sms' | 'both'})}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    >
                      <option value="email">Email only</option>
                      <option value="sms">SMS only</option>
                      <option value="both">Both Email & SMS</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium"
                    >
                      Create Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
