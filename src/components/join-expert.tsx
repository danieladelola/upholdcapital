"use client";

import React from "react";

export default function JoinExpert() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Join Expert</h1>
        <p className="text-gray-700 mb-6">
          Joining as an Expert allows you to publish and manage your trading strategies so
          others can follow and copy your trades. Experts gain visibility, can monetize
          their trades, and build a following on the platform.
        </p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Benefits</h2>
          <ul className="list-disc pl-5 text-gray-700 space-y-2">
            <li>Publish and post trades for followers to copy</li>
            <li>Earn from profit-sharing and subscriptions</li>
            <li>Grow your audience and reputation on the platform</li>
            <li>Access analytics and performance insights</li>
          </ul>
        </div>

        <div className="flex items-center justify-center">
          <button
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => {
              // Placeholder action: actual behavior (signup flow) should be implemented.
              // For now, navigate to a signup or expert onboarding flow when available.
              window.location.href = "/(auth)/sign-up";
            }}
          >
            Become an Expert
          </button>
        </div>
      </div>
    </div>
  );
}
