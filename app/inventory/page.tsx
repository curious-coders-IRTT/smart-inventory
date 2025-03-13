'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';

interface Drug {
  id: number;
  drug_name: string;
  current_stock: number;
  threshold: number | null;
  created_at: string;
  last_updated: string;
}

interface BranchData {
  namakkal: Drug[];
  erode: Drug[];
  kovai: Drug[];
  salem: Drug[];
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { drug_name: string; current_stock: number; threshold: number }) => void;
  branch: string;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose, onSubmit, branch }) => {
  const [formData, setFormData] = useState({
    drug_name: '',
    current_stock: 0,
    threshold: 100 // default threshold value
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ drug_name: '', current_stock: 0, threshold: 100 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add New Stock - {branch}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drug Name
              </label>
              <input
                type="text"
                value={formData.drug_name}
                onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold Level
              </label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
                min="0"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
              >
                Add Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function InventoryPage() {
  const [branchData, setBranchData] = useState<BranchData>({
    namakkal: [],
    erode: [],
    kovai: [],
    salem: [],
  });
  const [selectedBranch, setSelectedBranch] = useState('namakkal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branches = ['namakkal', 'erode', 'kovai', 'salem'];
        const data: BranchData = {
          namakkal: [],
          erode: [],
          kovai: [],
          salem: [],
        };

        for (const branch of branches) {
          const response = await fetch(`/api/drugs?branch=${branch}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch data for ${branch}`);
          }
          const branchData = await response.json();
          data[branch as keyof BranchData] = branchData;
        }

        setBranchData(data);
      } catch (err) {
        setError('Failed to load drug inventory data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddStock = async (data: { drug_name: string; current_stock: number; threshold: number }) => {
    try {
      const response = await fetch('/api/drugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          branch: selectedBranch,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add stock');
      }

      // Refresh the data
      const newData = await response.json();
      setBranchData(prev => ({
        ...prev,
        [selectedBranch]: [...prev[selectedBranch as keyof BranchData], newData],
      }));

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding stock:', err);
      setError('Failed to add stock');
    }
  };

  const getCurrentBranchData = () => {
    return branchData[selectedBranch as keyof BranchData] || [];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Loading inventory data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  const currentData = getCurrentBranchData();

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Drug Inventory</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="namakkal">Apollo Namakkal</option>
              <option value="erode">Apollo Erode</option>
              <option value="kovai">Apollo Kovai</option>
              <option value="salem">Apollo Salem</option>
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm font-medium shadow-sm"
            >
              Add Stock
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((drug) => (
                  <tr key={drug.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-900">{drug.id}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-900">{drug.drug_name}</td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-900">{drug.current_stock}</td>
                    <td className="hidden sm:table-cell px-4 sm:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(drug.last_updated).toLocaleString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors duration-150 ${
                        drug.current_stock >= (drug.threshold || 100) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {drug.current_stock >= (drug.threshold || 100) ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span>
              <span>In Stock (≥ Threshold)</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-100 rounded-full mr-2"></span>
              <span>Low Stock (&lt; Threshold)</span>
            </div>
          </div>
        </div>

        <AddStockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddStock}
          branch={selectedBranch}
        />
      </div>
    </Layout>
  );
}
