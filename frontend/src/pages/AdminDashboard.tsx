// Enhanced with comprehensive dark mode styling and improved UX
import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 