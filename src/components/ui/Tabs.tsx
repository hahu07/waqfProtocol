import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

interface TabProps {
  label: string;
  children: React.ReactNode;
}

interface TabsProps extends VariantProps<typeof tabsVariants> {
  defaultValue?: string;
  children: React.ReactElement<TabProps>[];
  className?: string;
}

const tabsVariants = cva('flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto', {
  variants: {
    variant: {
      default: '',
      primary: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const Tabs = ({ children, defaultValue, variant, className }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue || children[0].props.label);

  return (
    <div className={`w-full ${className}`}>
      <div className={tabsVariants({ variant })}>
        {React.Children.map(children, (child) => (
          <button
            className={`px-4 py-3 sm:py-2 font-medium text-sm focus:outline-none min-w-[80px] ${activeTab === child.props.label
              ? 'border-b-2 border-primary text-primary dark:text-primary-300'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            onClick={() => setActiveTab(child.props.label)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="py-4 px-2 sm:px-0">
        {React.Children.toArray(children).find(
          (child) => (child as React.ReactElement<TabProps>).props.label === activeTab
        )}
      </div>
    </div>
  );
};

export const Tab = ({ children }: TabProps) => {
  return <div>{children}</div>;
};
