'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Apollo Hospital Inventory Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage and track drug inventory across all Apollo Hospital branches
          </p>
          <Link 
            href="/inventory"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            View Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
