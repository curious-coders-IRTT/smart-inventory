'use client';

import React, { useState, KeyboardEvent, useEffect } from 'react';
import OpenAI from 'openai';
import Layout from '../components/Layout';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: string; // Change to string to avoid serialization issues
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

  // Load messages from localStorage when component mounts
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      const savedBranch = localStorage.getItem('selectedBranch');
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      }
      
      if (savedBranch) {
        setSelectedBranch(savedBranch);
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
      localStorage.removeItem('chatMessages');
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  // Save selected branch whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedBranch', selectedBranch);
  }, [selectedBranch]);

  // Function to clear chat history
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

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

    const userMessage: Message = {
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString(), // Store as ISO string
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const data = await getBranchData(selectedBranch);
      
      if (!data) {
        throw new Error('Failed to fetch data');
      }

      const prompt = generatePrompt(data, inputMessage);

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
      
      const botMessage: Message = {
        text: result.answer,
        isUser: false,
        timestamp: new Date().toISOString(), // Store as ISO string
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString(), // Store as ISO string
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
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chat Assistant</h1>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                Clear Chat
              </button>
            )}
          </div>
          
          {/* Branch Selection */}
          <div className="mb-6">
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
              Select Branch
            </label>
            <select
              id="branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
          <div className="flex-1 bg-white rounded-lg shadow-lg p-4 mb-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Start a conversation by typing a message below
              </div>
            ) : (
              messages.map((message, index) => (
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
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
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

          {/* Input Area - Fixed at bottom on mobile */}
          <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200">
            <div className="flex space-x-4 max-w-4xl mx-auto">
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
        </div>
      </div>
    </Layout>
  );
}
