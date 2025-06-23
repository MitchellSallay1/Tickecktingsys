import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'line' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'line',
  size = 'md',
  fullWidth = false,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-200';

  const variants = {
    line: {
      list: 'border-b border-gray-200',
      tab: {
        base: 'border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700',
        active: 'border-primary-600 text-primary-600',
        disabled: 'text-gray-400 cursor-not-allowed',
      },
    },
    pill: {
      list: 'bg-gray-100 p-1 rounded-lg',
      tab: {
        base: 'rounded-md hover:bg-gray-200 hover:text-gray-900',
        active: 'bg-white text-gray-900 shadow',
        disabled: 'text-gray-400 cursor-not-allowed',
      },
    },
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };

  return (
    <div
      className={`flex ${fullWidth ? 'w-full' : ''} ${variants[variant].list}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            className={`
              ${baseStyles}
              ${sizes[size]}
              ${variants[variant].tab.base}
              ${isActive ? variants[variant].tab.active : 'text-gray-500'}
              ${isDisabled ? variants[variant].tab.disabled : ''}
              ${fullWidth ? 'flex-1' : ''}
            `}
            onClick={() => !isDisabled && onChange(tab.id)}
            disabled={isDisabled}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs; 