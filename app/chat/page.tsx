'use client';

import React, { useState, KeyboardEvent } from 'react';
import OpenAI from 'openai';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Branch {
  id: string;
  name: string;
}

// Sample branch data with table names
const SAMPLE_BRANCHES: Branch[] = [
  { id: 'apollo_erode', name: 'Erode' },
  { id: 'apollo_kovai', name: 'Kovai' },
  { id: 'apollo_namakkal', name: 'Namakkal' },
  { id: 'apollo_salem', name: 'Salem' },
];

// Sample inventory data - you can replace this with your actual inventory data
const SAMPLE_INVENTORY = {
  apollo_erode: [
    { item: 'Bandages', quantity: 100, price: 5.99 },
    { item: 'Antibiotics', quantity: 50, price: 15.99 },
  ],
  apollo_kovai: [
    { item: 'Bandages', quantity: 75, price: 5.99 },
    { item: 'Antibiotics', quantity: 30, price: 15.99 },
  ],
  apollo_namakkal: [
    { item: 'Bandages', quantity: 60, price: 5.99 },
    { item: 'Antibiotics', quantity: 40, price: 15.99 },
  ],
  apollo_salem: [
    { item: 'Bandages', quantity: 80, price: 5.99 },
    { item: 'Antibiotics', quantity: 35, price: 15.99 },
  ],
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const getBranchData = async (branchId: string) => {
    try {
      const response = await fetch('/api/fetch-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName: branchId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const generatePrompt = (data: any, question: string) => {
    const context = JSON.stringify(data, null, 2);
    return `Based on the following inventory data from Apollo Hospital branches, please answer the question. If the answer cannot be determined from the data, please say so.

The data includes inventory information from different branches, with each record containing a 'branch_name' field indicating which branch it belongs to.

Inventory Data:
${context}

Question: ${question}

Please provide a clear and concise answer based on the data provided. If comparing data across branches, please mention which branches you're comparing.`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get data based on selected branch
      const data = await getBranchData(selectedBranch);
      
      if (!data) {
        throw new Error('Failed to fetch data');
      }

      // Generate prompt with context
      const prompt = generatePrompt(data, inputMessage);

      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const result = await response.json();
      
      // Add bot response to chat
      const botMessage: Message = {
        text: result.answer,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Apollo Hospital Chat Assistant</h1>
      
      {/* Branch Selection */}
      <div className="mb-6">
        <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
          Select Branch
        </label>
        <select
          id="branch"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Branches</option>
          {SAMPLE_BRANCHES.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4 h-[500px] overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.isUser ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.isUser
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-75">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-100">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex space-x-4">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question here..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className={`px-6 py-3 rounded-lg font-semibold text-white ${
            isLoading || !inputMessage.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
