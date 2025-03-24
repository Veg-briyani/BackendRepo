import React, { useState, ReactNode } from 'react';
import { Bell, BookOpen, DollarSign, FileText, Home, Printer, Users, Package, AlertTriangle } from 'lucide-react';

interface SidebarItemProps {
  icon: ReactNode;
  title: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UsersContent />;
      case 'books':
        return <BooksContent />;
      case 'kyc':
        return <KYCContent />;
      case 'royalties':
        return <RoyaltiesContent />;
      case 'orders':
        return <OrdersContent />;
      case 'prints':
        return <PrintsContent />;
      case 'notifications':
        return <NotificationsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4 text-xl font-bold">Author Dashboard</div>
        <div className="mt-8">
          <SidebarItem
            icon={<Home size={20} />}
            title="Dashboard"
            active={activeSection === 'dashboard'}
            onClick={() => setActiveSection('dashboard')}
          />
          <SidebarItem
            icon={<Users size={20} />}
            title="User Management"
            active={activeSection === 'users'}
            onClick={() => setActiveSection('users')}
          />
          <SidebarItem
            icon={<BookOpen size={20} />}
            title="Book Management"
            active={activeSection === 'books'}
            onClick={() => setActiveSection('books')}
          />
          <SidebarItem
            icon={<AlertTriangle size={20} />}
            title="KYC Verification"
            active={activeSection === 'kyc'}
            onClick={() => setActiveSection('kyc')}
            badge={5}
          />
          <SidebarItem
            icon={<DollarSign size={20} />}
            title="Royalty Management"
            active={activeSection === 'royalties'}
            onClick={() => setActiveSection('royalties')}
            badge={3}
          />
          <SidebarItem
            icon={<Package size={20} />}
            title="Order Management"
            active={activeSection === 'orders'}
            onClick={() => setActiveSection('orders')}
            badge={0}
          />
          <SidebarItem
            icon={<Printer size={20} />}
            title="Print Logs"
            active={activeSection === 'prints'}
            onClick={() => setActiveSection('prints')}
            badge={0}
          />
          <SidebarItem
            icon={<Bell size={20} />}
            title="Notifications"
            active={activeSection === 'notifications'}
            onClick={() => setActiveSection('notifications')}
            badge={8}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Navbar */}
        <div className="bg-white p-4 shadow flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                8
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <span className="text-gray-700">Admin</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, title, active, onClick, badge }: SidebarItemProps) => (
  <div
    className={`flex items-center justify-between px-6 py-3 cursor-pointer ${
      active ? 'bg-indigo-900' : 'hover:bg-indigo-700'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center">
      {icon}
      <span className="ml-2">{title}</span>
    </div>
    {typeof badge === 'number' && (
      <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
        {badge}
      </span>
    )}
  </div>
);

// Dashboard Content
const DashboardContent = () => (
  <div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Total Authors"
        value="156"
        icon={<Users size={24} className="text-indigo-600" />}
        change="+12% from last month"
      />
      <StatCard
        title="Total Books"
        value="432"
        icon={<BookOpen size={24} className="text-emerald-600" />}
        change="+8% from last month"
      />
      <StatCard
        title="Pending KYCs"
        value="5"
        icon={<AlertTriangle size={24} className="text-amber-600" />}
        change="-2 from last week"
      />
      <StatCard
        title="Pending Payouts"
        value="₹24,560"
        icon={<DollarSign size={24} className="text-blue-600" />}
        change="+₹8,320 from last month"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Author</th>
                <th className="pb-2">Book</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">ORD-7842</td>
                <td className="py-3">Rohit Sharma</td>
                <td className="py-3">The Indian Odyssey</td>
                <td className="py-3">₹1,250</td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Delivered
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">ORD-7841</td>
                <td className="py-3">Priya Singh</td>
                <td className="py-3">Beyond the Horizon</td>
                <td className="py-3">₹980</td>
                <td className="py-3">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    Shipped
                  </span>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">ORD-7840</td>
                <td className="py-3">Amit Kumar</td>
                <td className="py-3">Tech Transformations</td>
                <td className="py-3">₹1,450</td>
                <td className="py-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                    Processing
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Royalty Payouts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Author</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Method</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">Neha Desai</td>
                <td className="py-3">₹8,540</td>
                <td className="py-3">Bank Transfer</td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Paid
                  </span>
                </td>
                <td className="py-3">Mar 10, 2025</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Suresh Patel</td>
                <td className="py-3">₹6,240</td>
                <td className="py-3">UPI</td>
                <td className="py-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                    Pending
                  </span>
                </td>
                <td className="py-3">Mar 08, 2025</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Arjun Reddy</td>
                <td className="py-3">₹12,800</td>
                <td className="py-3">Bank Transfer</td>
                <td className="py-3">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    Paid
                  </span>
                </td>
                <td className="py-3">Mar 07, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

// User Management Content
const UsersContent = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">User Management</h2>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
        Add New User
      </button>
    </div>

    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border rounded-md w-64"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Filter by:</span>
          <select className="border rounded-md px-2 py-1">
            <option value="all">All Users</option>
            <option value="author">Authors</option>
            <option value="admin">Admins</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 pl-4">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">KYC Status</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  RS
                </div>
                Rohit Sharma
              </td>
              <td className="py-3">rohit.sharma@example.com</td>
              <td className="py-3">Author</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Approved
                </span>
              </td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Active
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  PS
                </div>
                Priya Singh
              </td>
              <td className="py-3">priya.singh@example.com</td>
              <td className="py-3">Author</td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Pending
                </span>
              </td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Active
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  AK
                </div>
                Amit Kumar
              </td>
              <td className="py-3">amit.kumar@example.com</td>
              <td className="py-3">Admin</td>
              <td className="py-3">-</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Active
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">Showing 1-3 of 156 users</div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Previous</button>
          <button className="px-3 py-1 border rounded-md bg-indigo-600 text-white">1</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">3</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  </div>
);

// Book Management Content
const BooksContent = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Book Management</h2>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
        Add New Book
      </button>
    </div>

    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books..."
            className="pl-10 pr-4 py-2 border rounded-md w-64"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Filter by:</span>
          <select className="border rounded-md px-2 py-1">
            <option value="all">All Categories</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="business">Business</option>
            <option value="self-help">Self-Help</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 pl-4">Title</th>
              <th className="pb-2">Author</th>
              <th className="pb-2">ISBN</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Price</th>
              <th className="pb-2">Stock</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">The Indian Odyssey</td>
              <td className="py-3">Rohit Sharma</td>
              <td className="py-3">978-1234567890</td>
              <td className="py-3">Fiction</td>
              <td className="py-3">₹499</td>
              <td className="py-3">42</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Active
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">Beyond the Horizon</td>
              <td className="py-3">Priya Singh</td>
              <td className="py-3">978-0987654321</td>
              <td className="py-3">Self-Help</td>
              <td className="py-3">₹350</td>
              <td className="py-3">78</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Active
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">Tech Transformations</td>
              <td className="py-3">Amit Kumar</td>
              <td className="py-3">978-5678901234</td>
              <td className="py-3">Business</td>
              <td className="py-3">₹599</td>
              <td className="py-3">15</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Active
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">Showing 1-3 of 432 books</div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Previous</button>
          <button className="px-3 py-1 border rounded-md bg-indigo-600 text-white">1</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">3</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  </div>
);

// KYC Verification Content
const KYCContent = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">KYC Verification Requests</h2>
      <div className="flex space-x-2">
        <select className="border rounded-md px-2 py-1">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 pl-4">Author</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Phone</th>
              <th className="pb-2">Submitted On</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  MS
                </div>
                Manish Shah
              </td>
              <td className="py-3">manish.shah@example.com</td>
              <td className="py-3">+91 98765 43210</td>
              <td className="py-3">Mar 08, 2025</td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Pending
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Review</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  SR
                </div>
                Sneha Rao
              </td>
              <td className="py-3">sneha.rao@example.com</td>
              <td className="py-3">+91 87654 32109</td>
              <td className="py-3">Mar 07, 2025</td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Pending
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Review</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  KP
                </div>
                Kiran Patel
              </td>
              <td className="py-3">kiran.patel@example.com</td>
              <td className="py-3">+91 76543 21098</td>
              <td className="py-3">Mar 06, 2025</td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Pending
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Review</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">KYC Review - Manish Shah</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium mb-2">Personal Information</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium w-32">Name:</span>
              <span>Manish Shah</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Email:</span>
              <span>manish.shah@example.com</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Phone:</span>
              <span>+91 98765 43210</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Address:</span>
              <span>123 Main Street, Mumbai, Maharashtra, 400001</span>
            </div>
          </div>

          <h3 className="font-medium mt-4 mb-2">Banking Information</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-medium w-32">Bank:</span>
              <span>HDFC Bank</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">Account No:</span>
              <span>XXXX XXXX 5678</span>
            </div>
            <div className="flex">
              <span className="font-medium w-32">IFSC Code:</span>
              <span>HDFC0001234</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">ID Verification</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Aadhaar Card</h4>
              <div className="border p-2 rounded-md">
                <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
                  <span className="text-gray-500">Click to view document</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">PAN Card</h4>
              <div className="border p-2 rounded-md">
                <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
                  <span className="text-gray-500">Click to view document</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex-1">
              Approve
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex-1">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Royalties Content
const RoyaltiesContent = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Royalty Management</h2>
      <div className="flex space-x-2">
        <select className="border rounded-md px-2 py-1">
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Pending Payouts"
        value="₹24,560"
        icon={<DollarSign size={24} className="text-amber-600" />}
        change="3 requests"
      />
      <StatCard
        title="Approved"
        value="₹18,720"
        icon={<DollarSign size={24} className="text-green-600" />}
        change="2 requests"
      />
      <StatCard
        title="Total Paid (This Month)"
        value="₹1,56,840"
        icon={<DollarSign size={24} className="text-blue-600" />}
        change="+₹32,450 from last month"
      />
    </div>

    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 pl-4">Author</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2">Payment Method</th>
              <th className="pb-2">Requested On</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  SP
                </div>
                Suresh Patel
              </td>
              <td className="py-3">₹8,240</td>
              <td className="py-3">Bank Transfer</td>
              <td className="py-3">Mar 10, 2025</td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Pending
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  AR
                </div>
                Anita Reddy
              </td>
              <td className="py-3">₹12,320</td>
              <td className="py-3">UPI</td>
              <td className="py-3">Mar 09, 2025</td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Pending
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4 flex items-center">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-2">
                  VK
                </div>
                Vishal Khanna
              </td>
              <td className="py-3">₹4,000</td>
              <td className="py-3">Bank Transfer</td>
              <td className="py-3">Mar 08, 2025</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Approved
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Process</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">Showing 1-3 of 18 payout requests</div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Previous</button>
          <button className="px-3 py-1 border rounded-md bg-indigo-600 text-white">1</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  </div>
);

// Orders Content
const OrdersContent = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Order Management</h2>
      <div className="flex space-x-2">
        <select className="border rounded-md px-2 py-1">
          <option value="all">All Orders</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed Payment</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="New Orders"
        value="24"
        icon={<Package size={24} className="text-indigo-600" />}
        change="+5 from yesterday"
      />
      <StatCard
        title="Shipped"
        value="18"
        icon={<Package size={24} className="text-amber-600" />}
        change="Last 24 hours"
      />
      <StatCard
        title="Delivered"
        value="42"
        icon={<Package size={24} className="text-green-600" />}
        change="Last 7 days"
      />
    </div>

    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 pl-4">Order ID</th>
              <th className="pb-2">Author</th>
              <th className="pb-2">Book</th>
              <th className="pb-2">Quantity</th>
              <th className="pb-2">Total</th>
              <th className="pb-2">Payment</th>
              <th className="pb-2">Order Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">ORD-7842</td>
              <td className="py-3">Rohit Sharma</td>
              <td className="py-3">The Indian Odyssey</td>
              <td className="py-3">5</td>
              <td className="py-3">₹2,495</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Paid
                </span>
              </td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Delivered
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">ORD-7841</td>
              <td className="py-3">Priya Singh</td>
              <td className="py-3">Beyond the Horizon</td>
              <td className="py-3">2</td>
              <td className="py-3">₹700</td>
              <td className="py-3">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                  Paid
                </span>
              </td>
              <td className="py-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  Shipped
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">ORD-7840</td>
              <td className="py-3">Amit Kumar</td>
              <td className="py-3">Tech Transformations</td>
              <td className="py-3">3</td>
              <td className="py-3">₹1,797</td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Pending
                </span>
              </td>
              <td className="py-3">
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                  Processing
                </span>
              </td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">View</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">Showing 1-3 of 84 orders</div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Previous</button>
          <button className="px-3 py-1 border rounded-md bg-indigo-600 text-white">1</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">3</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  </div>
);

// Prints Content
const PrintsContent = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Print Logs</h2>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
        Add New Print Log
      </button>
    </div>

    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2 pl-4">Book Title</th>
              <th className="pb-2">Author</th>
              <th className="pb-2">Print Date</th>
              <th className="pb-2">Quantity</th>
              <th className="pb-2">Press Name</th>
              <th className="pb-2">Cost</th>
              <th className="pb-2">Edition</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">The Indian Odyssey</td>
              <td className="py-3">Rohit Sharma</td>
              <td className="py-3">Mar 10, 2025</td>
              <td className="py-3">500</td>
              <td className="py-3">Paramount Printing</td>
              <td className="py-3">₹25,000</td>
              <td className="py-3">First</td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">Beyond the Horizon</td>
              <td className="py-3">Priya Singh</td>
              <td className="py-3">Mar 08, 2025</td>
              <td className="py-3">300</td>
              <td className="py-3">Supreme Publishers</td>
              <td className="py-3">₹18,000</td>
              <td className="py-3">Second</td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 pl-4">Tech Transformations</td>
              <td className="py-3">Amit Kumar</td>
              <td className="py-3">Mar 05, 2025</td>
              <td className="py-3">200</td>
              <td className="py-3">Digital Print Solutions</td>
              <td className="py-3">₹15,000</td>
              <td className="py-3">First</td>
              <td className="py-3">
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-500">Showing 1-3 of 42 print logs</div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Previous</button>
          <button className="px-3 py-1 border rounded-md bg-indigo-600 text-white">1</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">3</button>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  </div>
);

// Notifications Content
const NotificationsContent = () => (
  <div>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
        Send New Notification
      </button>
    </div>

    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex mb-4 border-b">
        <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-medium">
          All
        </button>
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
          Admin
        </button>
        <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
          Author
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="font-medium">New Payout Request</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Suresh Patel has requested a payout of ₹8,240
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500">2 hours ago</div>
          </div>
          <div className="mt-3 flex justify-end space-x-2">
            <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
            <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
          </div>
        </div>

        <div className="p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-medium">New KYC Submission</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Manish Shah has submitted KYC documents for verification
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500">5 hours ago</div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Review</button>
          </div>
        </div>

        <div className="p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-medium">New Order Placed</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Amit Kumar has placed an order for 3 copies of Tech Transformations
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500">Yesterday</div>
          </div>
          <div className="mt-3 flex justify-end">
            <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">View Order</button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
        <button className="text-indigo-600 hover:text-indigo-800 font-medium">
          Load More
        </button>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
          <select className="w-full border rounded-md px-3 py-2">
            <option value="">Select Recipient</option>
            <option value="all">All Authors</option>
            <option value="single">Individual Author</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
          <select className="w-full border rounded-md px-3 py-2">
            <option value="">Select Author</option>
            <option value="1">Rohit Sharma</option>
            <option value="2">Priya Singh</option>
            <option value="3">Amit Kumar</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea 
            className="w-full border rounded-md px-3 py-2 h-32"
            placeholder="Enter your notification message here..."
          />
        </div>
        
        <div className="flex justify-end">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Send Notification
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ title, value, icon, change }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <div className="text-2xl font-bold mt-1">{value}</div>
        {change && <div className="text-xs text-gray-500 mt-1">{change}</div>}
      </div>
      <div className="p-2 rounded-lg bg-indigo-50">
        {icon}
      </div>
    </div>
  </div>
);

export default AdminDashboard;
 