'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  CreditCard,
  Cpu,
  Shield,
  Monitor,
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeColor: string;
  borderColor: string;
}

const tabs: Tab[] = [
  {
    id: 'credit-score',
    label: 'Credit Score Guide',
    shortLabel: 'Credit',
    icon: CreditCard,
    color: 'text-emerald-400',
    activeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500',
    borderColor: 'border-emerald-500',
  },
  {
    id: 'ai-guide',
    label: 'AI Platform Guide',
    shortLabel: 'AI Guide',
    icon: Cpu,
    color: 'text-violet-400',
    activeColor: 'bg-violet-500/15 text-violet-400 border-violet-500',
    borderColor: 'border-violet-500',
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity Guide',
    shortLabel: 'Cyber',
    icon: Shield,
    color: 'text-blue-400',
    activeColor: 'bg-blue-500/15 text-blue-400 border-blue-500',
    borderColor: 'border-blue-500',
  },
  {
    id: 'pos-guide',
    label: 'POS Systems Guide',
    shortLabel: 'POS',
    icon: Monitor,
    color: 'text-amber-400',
    activeColor: 'bg-amber-500/15 text-amber-400 border-amber-500',
    borderColor: 'border-amber-500',
  },
];

interface ResourcesTabsProps {
  children: [ReactNode, ReactNode, ReactNode, ReactNode];
}

export default function ResourcesTabs({ children }: ResourcesTabsProps) {
  const [activeTab, setActiveTab] = useState('credit-score');

  // Support hash-based navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (tabs.some((t) => t.id === hash)) {
      setActiveTab(hash);
    }
  }, []);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    window.history.replaceState(null, '', `#${id}`);
    // Scroll to top of tab content
    document.getElementById('tab-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className="space-y-10">
      {/* Tab Bar */}
      <div className="sticky top-16 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <nav className="flex gap-1 sm:gap-2 overflow-x-auto py-3 scrollbar-hide" role="tablist" aria-label="Book resources">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium
                  whitespace-nowrap transition-all border border-transparent flex-shrink-0
                  ${isActive
                    ? tab.activeColor
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/60'
                  }
                `}
              >
                <tab.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? tab.color : ''}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div id="tab-content" className="scroll-mt-32">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            id={`panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {children[index]}
          </div>
        ))}
      </div>
    </div>
  );
}
