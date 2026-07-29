'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getLoginUrl, User } from '../lib/auth';
import { api } from '../lib/api-client';
import { formatRelativeDate, getStatusBadgeStyle, cn } from '../lib/utils';
import {
  FileText, Plus, Search, LayoutDashboard, Grid3X3, Settings,
  HelpCircle, Bell, LogOut, Menu, X, ChevronDown, ChevronRight,
  Clock, BarChart3, Users, Eye, MoreHorizontal, Copy, Archive,
  ExternalLink, CheckCircle2, AlertCircle, FolderOpen,
} from 'lucide-react';

interface Form {
  id: string;
  title: string;
  description?: string;
  status: string;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  fields?: any[];
}

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

export default function FormsDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<Form[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Overview': true,
    'Public': false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { window.location.href = getLoginUrl(); return; }
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      api.get<{ forms: Form[] }>('/api/forms')
        .then(d => { setForms(d.forms || []); setFormsLoading(false); })
        .catch(() => setFormsLoading(false));
    }
  }, [loading]);

  const toggleSection = (label: string) => {
    setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredForms = forms.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
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
                      const active = item.href === '/' ? true : false;
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
            <FileText className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-semibold text-[var(--color-text)]">Forms</span>
          </div>
          <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] text-sm ml-4">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Search forms..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-[28px] font-semibold text-[var(--color-text)] leading-tight">My Forms</h1>
                <p className="mt-1 text-[var(--color-text-secondary)]">{forms.length} total forms</p>
              </div>
              <button onClick={() => router.push('/create')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                New Form
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {(['all', 'published', 'draft', 'archived'] as const).map(status => (
                <button key={status} onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    statusFilter === status
                      ? 'bg-[var(--color-primary-surface)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]'
                  )}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-60">{forms.filter(f => f.status === status).length}</span>
                  )}
                </button>
              ))}
            </div>

            {formsLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 animate-pulse">
                    <div className="h-5 w-48 bg-[var(--color-surface-muted)] rounded mb-3" />
                    <div className="h-4 w-32 bg-[var(--color-surface-muted)] rounded" />
                  </div>
                ))}
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-tertiary)]" />
                <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">
                  {searchQuery ? 'No forms found' : 'No forms yet'}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                  {searchQuery ? 'Try a different search term' : 'Create your first form to get started'}
                </p>
                {!searchQuery && (
                  <button onClick={() => router.push('/create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors">
                    <Plus className="w-4 h-4" />
                    Create Form
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredForms.map(form => (
                  <div key={form.id}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-sm transition-shadow group relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-base font-medium text-[var(--color-text)] truncate">{form.title}</h3>
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', getStatusBadgeStyle(form.status))}>
                            {form.status}
                          </span>
                        </div>
                        {form.description && (
                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1 mb-2">{form.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{form.fields?.length || 0} fields</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{form.responseCount} responses</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {formatRelativeDate(form.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {form.status === 'published' && (
                          <a href={`/f/${form.id}/overview`} onClick={e => { e.preventDefault(); router.push(`/f/${form.id}/overview`); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-primary-surface)] text-[var(--color-primary)] text-sm font-medium hover:bg-[var(--color-primary-surface)]/80 transition-colors">
                            <BarChart3 className="w-3.5 h-3.5" />
                            View
                          </a>
                        )}
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === form.id ? null : form.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {menuOpen === form.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-1">
                                {form.status !== 'published' && (
                                  <button onClick={() => { router.push(`/f/${form.id}/edit`); setMenuOpen(null); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
                                    <ExternalLink className="w-4 h-4" /> Edit
                                  </button>
                                )}
                                {form.status === 'published' && (
                                  <button onClick={() => { router.push(`/f/${form.id}/overview`); setMenuOpen(null); }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
                                    <BarChart3 className="w-4 h-4" /> Overview
                                  </button>
                                )}
                                <button onClick={() => { router.push(`/f/${form.id}/responses`); setMenuOpen(null); }}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
                                  <Users className="w-4 h-4" /> Responses
                                </button>
                                <button onClick={() => { router.push(`/f/${form.id}/analytics`); setMenuOpen(null); }}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
                                  <BarChart3 className="w-4 h-4" /> Analytics
                                </button>
                                <button onClick={() => { router.push(`/f/${form.id}/collaborators`); setMenuOpen(null); }}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
                                  <Users className="w-4 h-4" /> Collaborators
                                </button>
                                <button onClick={() => { router.push(`/f/${form.id}/settings`); setMenuOpen(null); }}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors">
                                  <Settings className="w-4 h-4" /> Settings
                                </button>
                                <div className="border-t border-[var(--color-border)] my-1" />
                                <button onClick={() => { setMenuOpen(null); }}
                                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-surface-muted)] transition-colors">
                                  <Archive className="w-4 h-4" /> Archive
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
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
