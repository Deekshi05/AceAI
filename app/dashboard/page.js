import React from 'react'

function Dashboard() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AI Mock Interview Dashboard</h1>
      <p className="text-lg text-gray-600">Welcome to your interview practice dashboard!</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-3">Start Practice</h2>
          <p className="text-gray-600 mb-4">Begin your AI-powered mock interview session</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Start Interview
          </button>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-3">Review History</h2>
          <p className="text-gray-600 mb-4">Check your previous interview performances</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            View History
          </button>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-3">Settings</h2>
          <p className="text-gray-600 mb-4">Customize your interview preferences</p>
          <button className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
