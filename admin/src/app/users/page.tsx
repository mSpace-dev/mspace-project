"use client";
// SMS Modal component (outside main function)
function SMSModal({ smsTarget, smsMessage, setSMSMessage, setShowSMSModal, setSMSTarget, setSMSResult, smsSending, setSMSSending, smsResult }: {
  smsTarget: User | null;
  smsMessage: string;
  setSMSMessage: (msg: string) => void;
  setShowSMSModal: (show: boolean) => void;
  setSMSTarget: (user: User | null) => void;
  setSMSResult: (result: string | null) => void;
  smsSending: boolean;
  setSMSSending: (sending: boolean) => void;
  smsResult: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={() => { setShowSMSModal(false); setSMSTarget(null); setSMSMessage(""); setSMSResult(null); }}
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold text-blue-700 mb-2 text-center">Send SMS</h3>
        {smsTarget && (
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold text-gray-900">To: {smsTarget.name}</p>
            <p className="text-sm text-gray-600">{smsTarget.phone}</p>
          </div>
        )}
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 mb-4"
          rows={4}
          maxLength={160}
          placeholder="Type your SMS message here..."
          value={smsMessage}
          onChange={e => setSMSMessage(e.target.value)}
        />
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">{smsMessage.length}/160 characters</span>
          <button
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-blue-500 hover:to-green-500 transition-colors disabled:opacity-50"
            disabled={smsSending || !smsMessage.trim()}
            onClick={async () => {
              if (!smsTarget) return;
              setSMSSending(true);
              setSMSResult(null);
              try {
                const res = await fetch('/api/send-sms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: smsMessage, recipients: [smsTarget.phone] })
                });
                const data = await res.json();
                if (data.success) {
                  setSMSResult('✅ SMS sent successfully!');
                  setSMSMessage("");
                } else {
                  setSMSResult('❌ Failed to send SMS.');
                }
              } catch {
                setSMSResult('❌ Network error.');
              } finally {
                setSMSSending(false);
              }
            }}
          >
            {smsSending ? 'Sending...' : 'Send SMS'}
          </button>
        </div>
        {smsResult && (
          <div className={`mb-2 p-3 rounded-lg text-center ${smsResult.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{smsResult}</div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "seller";
  district?: string;
  province?: string;
  phone?: string;
  receivedSMS?: number;
  sentSMS?: number;
  lastLogin?: string;
}

const districts = [
  "Colombo", "Gampaha", "Kandy", "Matara", "Kurunegala", "Jaffna", "Badulla", "Galle", "Anuradhapura", "Polonnaruwa"
];
const provinces = [
  "Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsTarget, setSMSTarget] = useState<User | null>(null);
  const [smsMessage, setSMSMessage] = useState("");
  const [smsSending, setSMSSending] = useState(false);
  const [smsResult, setSMSResult] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedDistrict, selectedProvince, searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/customers");
      const customerData = await response.json();
      const customers: User[] = (customerData.users || []).map((u: any) => ({ ...u, role: "customer" }));
      const sellerResponse = await fetch("/api/sellers");
      const sellerData = await sellerResponse.json();
      const sellers: User[] = (sellerData.users || []).map((u: any) => ({ ...u, role: "seller" }));
      const allUsers: User[] = [...customers, ...sellers];
      setUsers(allUsers);
    } catch (error) {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (selectedDistrict) {
      filtered = filtered.filter(u => u.district === selectedDistrict);
    }
    if (selectedProvince) {
      filtered = filtered.filter(u => u.province === selectedProvince);
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter(u => u.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    }
    setFilteredUsers(filtered);
  };

  const customers = filteredUsers.filter(u => u.role === "customer");
  const sellers = filteredUsers.filter(u => u.role === "seller");

  // Helper to format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  // Grid columns: Name, Received SMS, Sent SMS, Last Login
  const renderGrid = (users: User[], type: "Customer" | "Seller") => (
    <div>
      <h2 className={`text-2xl font-bold ${type === "Customer" ? "text-green-700" : "text-blue-700"} mb-4`}>{type}s</h2>
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No {type.toLowerCase()}s found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Name</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Received SMS</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Sent SMS</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Last Login</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">District</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Province</th>
                <th className="px-4 py-2 text-left text-gray-700 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b">
                  <td className="px-4 py-2 font-bold text-gray-900">{user.name}</td>
                  <td className="px-4 py-2 text-gray-800">{user.receivedSMS ?? '-'}</td>
                  <td className="px-4 py-2 text-gray-800">{user.sentSMS ?? '-'}</td>
                  <td className="px-4 py-2 text-gray-800">{formatDate(user.lastLogin)}</td>
                  <td className="px-4 py-2 text-gray-700">{user.district ?? '-'}</td>
                  <td className="px-4 py-2 text-gray-700">{user.province ?? '-'}</td>
                  <td className="px-4 py-2">
                    <button
                      className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow hover:from-blue-500 hover:to-green-500 transition-colors font-semibold"
                      onClick={() => { setSMSTarget(user); setShowSMSModal(true); }}
                    >
                      Send SMS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  const [activeSheet, setActiveSheet] = useState<'customers' | 'sellers'>('customers');

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>
        <div className="flex flex-wrap gap-4 mb-8 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by District</label>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="" className="text-gray-900">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d} className="text-gray-900">{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Province</label>
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="" className="text-gray-900">All Provinces</option>
              {provinces.map(p => (
                <option key={p} value={p} className="text-gray-900">{p}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Type user name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Excel-like sheet tabs */}
        <div className="mb-6 flex gap-2">
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${activeSheet === 'customers' ? 'bg-white border-blue-500 text-blue-700' : 'bg-gray-200 border-transparent text-gray-600'}`}
            onClick={() => setActiveSheet('customers')}
          >
            Customers
          </button>
          <button
            className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${activeSheet === 'sellers' ? 'bg-white border-green-500 text-green-700' : 'bg-gray-200 border-transparent text-gray-600'}`}
            onClick={() => setActiveSheet('sellers')}
          >
            Sellers
          </button>
        </div>

        <div className="bg-white rounded-b-lg shadow p-4 relative">
          {activeSheet === 'customers' ? renderGrid(customers, 'Customer') : renderGrid(sellers, 'Seller')}
          {showSMSModal && (
            <SMSModal
              smsTarget={smsTarget}
              smsMessage={smsMessage}
              setSMSMessage={setSMSMessage}
              setShowSMSModal={setShowSMSModal}
              setSMSTarget={setSMSTarget}
              setSMSResult={setSMSResult}
              smsSending={smsSending}
              setSMSSending={setSMSSending}
              smsResult={smsResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}
