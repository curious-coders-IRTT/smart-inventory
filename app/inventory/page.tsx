'use client';

import React, { useEffect, useState } from 'react';

interface Drug {
  id: number;
  drug_name: string;
  current_stock: number;
  last_updated: string;
}

interface BranchData {
  namakkal: Drug[];
  erode: Drug[];
  kovai: Drug[];
  salem: Drug[];
}

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
                      drug.current_stock > 50 
                        ? 'bg-green-100 text-green-800'
                        : drug.current_stock > 20
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {drug.current_stock > 50 
                        ? 'In Stock'
                        : drug.current_stock > 20
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
            <span>In Stock ({'>'}50)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-100 rounded-full mr-2"></span>
            <span>Low Stock (20-50)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-100 rounded-full mr-2"></span>
            <span>Critical ({'<'}20)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
