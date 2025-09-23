import React, { useState, useEffect } from "react";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-6">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2">Loading audit trail...</span>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600 bg-red-50 rounded-lg">
          ⚠️ Something went wrong. Please try refreshing the page.
        </div>
      );
    }
    return this.props.children;
  }
}

const DonationCard = ({ donation }) => (
  <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 hover:bg-gray-100 transition-colors">
    <p><strong>Donation ID:</strong> {donation.id}</p>
    <p><strong>Type:</strong> {donation.type}</p>
    <p><strong>Donor Name:</strong> {donation.details.donorName}</p>
    <p><strong>Amount:</strong> {donation.details.amount} {donation.details.currency}</p>
    <p><strong>Purpose:</strong> {donation.details.purpose}</p>
    <p><strong>Payment Method:</strong> {donation.details.paymentMethod}</p>
    <p><strong>Status:</strong> <span className={`${donation.tracking.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{donation.tracking.status}</span></p>
    <p><strong>Created At:</strong> {new Date(donation.tracking.createdAt).toLocaleString()}</p>
    {donation.blockchain && (
      <div className="mt-2 pt-2 border-t border-gray-200">
        <p><strong>Blockchain TX:</strong> {donation.blockchain.txHash}</p>
        <p><strong>Network:</strong> {donation.blockchain.network}</p>
        <p><strong>Status:</strong> {donation.blockchain.status}</p>
      </div>
    )}
  </div>
);

const SupplyCard = ({ supply }) => (
  <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 hover:bg-gray-100 transition-colors">
    <p><strong>Supply ID:</strong> {supply.id}</p>
    <p><strong>Type:</strong> {supply.type}</p>
    <p><strong>Item:</strong> {supply.details.item}</p>
    <p><strong>Quantity:</strong> {supply.details.quantity} {supply.details.unit}</p>
    <p><strong>Category:</strong> {supply.details.category}</p>
    <div className="mt-2 pt-2 border-t border-gray-200">
      <p><strong>From:</strong> {supply.logistics.from.name}</p>
      <p><strong>To:</strong> {supply.logistics.to.name}</p>
      <p><strong>Location:</strong> {supply.logistics.location.locationName}</p>
    </div>
    <div className="mt-2 pt-2 border-t border-gray-200">
      <p><strong>Status:</strong> <span className={`${supply.tracking.status === 'delivered' ? 'text-green-600' : 'text-yellow-600'}`}>{supply.tracking.status}</span></p>
      <p><strong>Tracking ID:</strong> {supply.tracking.trackingId}</p>
      <p><strong>Created At:</strong> {new Date(supply.tracking.createdAt).toLocaleString()}</p>
    </div>
    {supply.blockchain && (
      <div className="mt-2 pt-2 border-t border-gray-200">
        <p><strong>Blockchain TX:</strong> {supply.blockchain.txHash}</p>
        <p><strong>Network:</strong> {supply.blockchain.network}</p>
        <p><strong>Status:</strong> {supply.blockchain.status}</p>
      </div>
    )}
  </div>
);

const AuditTrail = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/audit-trail');
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.error('Error fetching audit trail:', err);
        setError('Failed to load audit trail data');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditTrail();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-600 bg-red-50 rounded-lg">⚠️ {error}</div>;

  const { donations = [], supplies = [], statistics = {} } = data || {};

  return (
    <ErrorBoundary>
      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Audit Trail 🛡️</h2>
          <div className="text-sm text-gray-600">
            <p>Total Donations: {statistics.totalDonations || 0}</p>
            <p>Total Supplies: {statistics.totalSupplies || 0}</p>
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'donations' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Donations ({donations.length})
          </button>
          <button
            onClick={() => setActiveTab('supplies')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'supplies' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Supplies ({supplies.length})
          </button>
        </div>

        {activeTab === 'donations' ? (
          donations.length > 0 ? (
            donations.map((donation) => (
              <DonationCard key={donation.id} donation={donation} />
            ))
          ) : (
            <p className="text-gray-600">No donations found</p>
          )
        ) : (
          supplies.length > 0 ? (
            supplies.map((supply) => (
              <SupplyCard key={supply.id} supply={supply} />
            ))
          ) : (
            <p className="text-gray-600">No supplies found</p>
          )
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AuditTrail;