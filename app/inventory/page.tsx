'use client';

import React, { useEffect, useState } from 'react';

interface Drug {
  id: number;
  drug_name: string;
  current_stock: number;
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
  onSubmit: (data: { drug_name: string; current_stock: number; threshold_level: number }) => void;
  branch: string;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ isOpen, onClose, onSubmit, branch }) => {
  const [formData, setFormData] = useState({
    drug_name: '',
    current_stock: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ drug_name: '', current_stock: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Stock - {branch}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drug Name
            </label>
            <input
              type="text"
              value={formData.drug_name}
              onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Stock
            </label>
            <input
              type="number"
              value={formData.current_stock}
              onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Add Stock
            </button>
          </div>
        </form>
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

  const handleAddStock = async (data: { drug_name: string; current_stock: number; threshold_level: number }) => {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading inventory data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const currentData = getCurrentBranchData();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Apollo Hospital Drug Inventory</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="namakkal">Apollo Namakkal</option>
            <option value="erode">Apollo Erode</option>
            <option value="kovai">Apollo Kovai</option>
            <option value="salem">Apollo Salem</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((drug) => (
                <tr key={drug.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.drug_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{drug.current_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(drug.last_updated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      drug.current_stock > drug.threshold_level 
                        ? 'bg-green-100 text-green-800'
                        : drug.current_stock > (drug.threshold_level / 2)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {drug.current_stock > drug.threshold_level 
                        ? 'In Stock'
                        : drug.current_stock > (drug.threshold_level / 2)
                        ? 'Low Stock'
                        : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-100 rounded-full mr-2"></span>
            <span>In Stock ({'>'}Threshold)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-100 rounded-full mr-2"></span>
            <span>Low Stock ({'>'}Half Threshold)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-100 rounded-full mr-2"></span>
            <span>Critical ({'<'}Half Threshold)</span>
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
  );
}
