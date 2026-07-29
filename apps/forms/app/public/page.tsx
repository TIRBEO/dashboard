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
  CheckCircle2, AlertCircle, FolderOpen, Globe, Lock, EyeOff, ExternalLink,
} from 'lucide-react';

const VISIBILITY_FILTERS = ['All', 'Public', 'Unlisted'] as const;

const SAMPLE_FORMS = [
  { id: 'p1', title: 'Customer Satisfaction Survey', description: 'Help us improve our services by sharing your feedback.', fields: 8, responses: 1240, visibility: 'public', category: 'Feedback' },
  { id: 'p2', title: 'Event Registration — Tech Conf 2026', description: 'Register your spot for the annual technology conference.', fields: 6, responses: 567, visibility: 'public', category: 'Registration' },
  { id: 'p3', title: 'Beta Program Application', description: 'Apply to join our early access beta program.', fields: 10, responses: 892, visibility: 'public', category: 'Registration' },
  { id: 'p4', title: 'Product Feedback Form', description: 'Tell us what you think about our latest product release.', fields: 5, responses: 2100, visibility: 'public', category: 'Feedback' },
  { id: 'p5', title: 'Support Ticket Intake', description: 'Submit a support request and we will get back to you.', fields: 7, responses: 3400, visibility: 'unlisted', category: 'Contact' },
  { id: 'p6', title: 'Newsletter Subscription', description: 'Sign up to receive our monthly newsletter and updates.', fields: 3, responses: 8900, visibility: 'public', category: 'Registration' },
  { id: 'p7', title: 'Partner Onboarding Form', description: 'Required form for new partner account setup.', fields: 12, responses: 156, visibility: 'unlisted', category: 'Registration' },
  { id: 'p8', title: 'Job Application — Engineering', description: 'Submit your application for open engineering positions.', fields: 9, responses: 432, visibility: 'public', category: 'Contact' },
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

export default function PublicDirectoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Overview': true,
    'Public': true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'All' | 'Public' | 'Unlisted'>('All');
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

  const filtered = SAMPLE_FORMS.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = visibilityFilter === 'All' || f.visibility === visibilityFilter.toLowerCase();
    return matchesSearch && matchesVisibility;
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
                      const active = item.href === '/public';
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
            <Eye className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-semibold text-[var(--color-text)]">Directory</span>
          </div>
          <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] text-sm ml-4">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Search public forms..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
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
              <h1 className="text-[28px] font-semibold text-[var(--color-text)] leading-tight">Discover Forms</h1>
              <p className="mt-1 text-[var(--color-text-secondary)]">Browse public forms and surveys from the community</p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {VISIBILITY_FILTERS.map(f => (
                <button key={f} onClick={() => setVisibilityFilter(f)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    visibilityFilter === f
                      ? 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]'
                  )}>
                  {f === 'Public' ? <Globe className="w-3.5 h-3.5" /> : f === 'Unlisted' ? <EyeOff className="w-3.5 h-3.5" /> : null}
                  {f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" />
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No forms found</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(f => (
                  <div key={f.id}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-sm transition-shadow group flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-surface)] flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        f.visibility === 'public'
                          ? 'bg-[var(--color-success-surface)] text-[var(--color-success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-text-tertiary)]'
                      )}>
                        {f.visibility === 'public' ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {f.visibility}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-[var(--color-text)] mb-1">{f.title}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-4 flex-1">{f.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)] mb-4">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{f.fields} fields</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{f.responses.toLocaleString()} responses</span>
                    </div>
                    <button onClick={() => router.push(`/f/${f.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Fill Form
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
