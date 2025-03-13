'use client';

import Layout from './components/Layout';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Image
              src="/apollo_logo.svg"
              alt="Apollo Logo"
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Apollo Hospital Inventory Management System
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Manage and track drug inventory across all Apollo Hospital branches
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/inventory"
              className="w-full sm:w-auto inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:px-8 rounded-lg transition duration-300"
            >
              View Inventory
            </Link>
            <Link 
              href="/chat"
              className="w-full sm:w-auto inline-block bg-white border-2 border-blue-500 hover:bg-blue-50 text-blue-500 font-bold py-3 px-6 sm:px-8 rounded-lg transition duration-300"
            >
              Open Chat
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
