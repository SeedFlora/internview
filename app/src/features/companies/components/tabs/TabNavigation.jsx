import React from "react";

/**
 * Reusable Tab Navigation Component
 * @param {Array} tabs - Array of tab objects { id, label }
 * @param {string} activeTab - Current active tab id
 * @param {Function} onTabChange - Callback when tab changes
 */
export const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 bg-white -mx-4 md:-mx-6 px-4 md:px-6 sticky top-0 z-40">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`py-4 text-sm md:text-base font-semibold transition-all relative ${
              activeTab === tab.id
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-800"
            }`}
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
