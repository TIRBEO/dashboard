'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getLoginUrl, User } from '../../lib/auth';
import { api } from '../../lib/api-client';
import { cn } from '../../lib/utils';
import {
  FileText, Plus, Search, LayoutDashboard, Grid3X3, Settings,
  HelpCircle, Bell, LogOut, Menu, X, ChevronDown, ChevronRight,
  Clock, BarChart3, Users, Eye, MessageSquare, Star, UserPlus, ShoppingCart,
  CheckCircle2, AlertCircle, FolderOpen, Sparkles,
} from 'lucide-react';

const ALL_CATEGORIES = ['All', 'Surveys', 'Contact', 'Orders', 'Registration', 'Feedback'];

const TEMPLATE_DATA = [
  { id: 't1', name: 'Contact Us', description: 'Standard contact form with name, email, subject, and message fields.', category: 'Contact', fields: 4, responses: 1280, icon: MessageSquare },
  { id: 't2', name: 'Customer Feedback', description: 'Collect detailed feedback with satisfaction ratings and open-ended questions.', category: 'Feedback', fields: 6, responses: 3450, icon: Star },
  { id: 't3', name: 'Event Registration', description: 'Register attendees for events with name, email, ticket type, and dietary preferences.', category: 'Registration', fields: 7, responses: 892, icon: UserPlus },
  { id: 't4', name: 'Product Order', description: 'Simple product order form with item selection, quantities, and shipping details.', category: 'Orders', fields: 5, responses: 2100, icon: ShoppingCart },
  { id: 't5', name: 'Employee Survey', description: 'Annual employee satisfaction survey with anonymous response collection.', category: 'Surveys', fields: 12, responses: 543, icon: BarChart3 },
  { id: 't6', name: 'Support Ticket', description: 'Submit support requests with priority level, category, and detailed description.', category: 'Contact', fields: 6, responses: 4320, icon: MessageSquare },
  { id: 't7', name: 'Newsletter Signup', description: 'Collect email addresses and preferences for newsletter subscriptions.', category: 'Registration', fields: 3, responses: 8900, icon: UserPlus },
  { id: 't8', name: 'Satisfaction Survey', description: 'Post-purchase satisfaction survey with product ratings and delivery feedback.', category: 'Feedback', fields: 8, responses: 1567, icon: Star },
  { id: 't9', name: 'Volunteer Registration', description: 'Volunteer sign-up form with availability, skills, and emergency contact.', category: 'Registration', fields: 9, responses: 234, icon: UserPlus },
  { id: 't10', name: 'Order Customization', description: 'Custom product order form with size, color, and personalization options.', category: 'Orders', fields: 7, responses: 789, icon: ShoppingCart },
];

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { href: '/', label: 'My Forms', icon: FileText },
      { href: '/templates', label: 'Templates', icon: Grid3X3 },
    ],
  },
  {
    label: 'Public',
    items: [
      { href: '/public', label: 'Directory', icon: Eye },
    ],
  },
];

export default function TemplatesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Overview': true,
    'Public': false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
      setLoading(false);
    });
  }, []);

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const filtered = TEMPLATE_DATA.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'All' || t.category === category;
    return matchesSearch && matchesCategory;
  });

  const navigate = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-[var(--color-sidebar)] border-r border-[var(--color-border)] transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-6 h-16 border-b border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">T</div>
            <span className="font-semibold text-[var(--color-text)] text-lg">Tirbeo</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {NAV_SECTIONS.map(section => (
              <div key={section.label} className="mb-4">
                <button onClick={() => toggleSection(section.label)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider hover:text-[var(--color-text)] transition-colors">
                  {section.label}
                  {expandedSections[section.label] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {expandedSections[section.label] && (
                  <div className="mt-1 space-y-0.5">
                    {section.items.map(item => {
                      const active = item.href === '/templates';
                      return (
                        <a key={item.href} href={item.href} onClick={e => { e.preventDefault(); navigate(item.href); }}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            active ? 'bg-[var(--color-sidebar-active)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)]'
                          )}>
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="border-t border-[var(--color-border)] p-3">
            <a href="/public" onClick={e => { e.preventDefault(); navigate('/public'); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text)] transition-colors">
              <Eye className="w-4 h-4" />
              Public Directory
            </a>
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 h-16 bg-[var(--color-header)] border-b border-[var(--color-border)] backdrop-blur-md flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-semibold text-[var(--color-text)]">Templates</span>
          </div>
          <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] text-sm ml-4">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Search templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]" />
          </div>
          <div className="flex-1 sm:hidden" />
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-error)]" />
            </button>
            <div className="flex items-center gap-2 pl-3 ml-3 border-l border-[var(--color-border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-surface)] flex items-center justify-center text-[var(--color-primary)] font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-[var(--color-text)]">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-[28px] font-semibold text-[var(--color-text)] leading-tight">Templates</h1>
              <p className="mt-1 text-[var(--color-text-secondary)]">Choose from {TEMPLATE_DATA.length} pre-built templates to get started quickly</p>
            </div>

            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
              {ALL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    category === cat
                      ? 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]'
                  )}>
                  {cat}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
                <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" />
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No templates found</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Try a different search term or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(t => (
                  <div key={t.id}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-sm transition-shadow group flex flex-col">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center mb-4">
                      <t.icon className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <h3 className="text-base font-medium text-[var(--color-text)] mb-1">{t.name}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 flex-1">{t.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]">
                        {t.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)] mb-4">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{t.fields} fields</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t.responses.toLocaleString()} responses</span>
                    </div>
                    <button onClick={() => router.push(`/create?template=${t.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
                      <Sparkles className="w-3.5 h-3.5" />
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
