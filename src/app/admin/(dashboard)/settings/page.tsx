'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../../../convex/_generated/api';
import {
  Settings,
  Save,
  Globe,
  Mail,
  Palette,
  Bell,
  Shield,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { TwoFactorSetup } from '@/components/admin/TwoFactorSetup';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminAuth';

interface SettingGroup {
  id: string;
  label: string;
  icon: typeof Globe;
  color: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'toggle' | 'color'; placeholder?: string }[];
}

const SETTING_GROUPS: SettingGroup[] = [
  {
    id: 'general',
    label: 'General',
    icon: Globe,
    color: 'text-brand-400',
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'Eric Tomchik' },
      { key: 'site_description', label: 'Site Description', type: 'textarea', placeholder: 'Credit repair and business credit expert...' },
      { key: 'site_url', label: 'Site URL', type: 'text', placeholder: 'https://erictomchik.com' },
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Building Business Credit with Just an EIN' },
    ],
  },
  {
    id: 'contact',
    label: 'Contact & Email',
    icon: Mail,
    color: 'text-green-400',
    fields: [
      { key: 'contact_email', label: 'Contact Email', type: 'text', placeholder: 'info@erictomchik.com' },
      { key: 'support_email', label: 'Support Email', type: 'text', placeholder: 'support@erictomchik.com' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '+1 (555) 000-0000' },
      { key: 'business_address', label: 'Business Address', type: 'textarea' },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: Globe,
    color: 'text-violet-400',
    fields: [
      { key: 'social_facebook', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/...' },
      { key: 'social_instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/...' },
      { key: 'social_twitter', label: 'X / Twitter URL', type: 'text', placeholder: 'https://x.com/...' },
      { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/in/...' },
      { key: 'social_youtube', label: 'YouTube URL', type: 'text', placeholder: 'https://youtube.com/...' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    color: 'text-yellow-400',
    fields: [
      { key: 'notify_new_order', label: 'Email on new orders', type: 'toggle' },
      { key: 'notify_new_contact', label: 'Email on contact form submissions', type: 'toggle' },
      { key: 'notify_new_subscriber', label: 'Email on new subscribers', type: 'toggle' },
      { key: 'notify_new_ticket', label: 'Email on new tickets', type: 'toggle' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO & Analytics',
    icon: Globe,
    color: 'text-orange-400',
    fields: [
      { key: 'seo_title_suffix', label: 'Title Suffix', type: 'text', placeholder: '| Eric Tomchik' },
      { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
      { key: 'google_search_console', label: 'Search Console Verification', type: 'text' },
      { key: 'meta_keywords', label: 'Default Meta Keywords', type: 'textarea', placeholder: 'credit repair, business credit, EIN...' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Shield,
    color: 'text-red-400',
    fields: [
      { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
      { key: 'maintenance_message', label: 'Maintenance Message', type: 'textarea', placeholder: 'We are currently performing scheduled maintenance...' },
      { key: 'announcement_enabled', label: 'Show Announcement Banner', type: 'toggle' },
      { key: 'announcement_text', label: 'Announcement Text', type: 'text', placeholder: 'New book available now!' },
    ],
  },
];

export default function SettingsPage() {
  const allSettings = useAdminQuery(api.siteSettings.getAll, {}) as Record<string, unknown> | undefined;
  const setMany = useAdminMutation(api.siteSettings.setMany);

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeGroup, setActiveGroup] = useState('general');

  // Security group (handled separately with custom rendering)
  const SECURITY_GROUP = {
    id: 'security',
    label: 'Security',
    icon: ShieldCheck,
    color: 'text-green-400',
  };

  // Sync from Convex
  useEffect(() => {
    if (allSettings) {
      const v: Record<string, string> = {};
      for (const [key, val] of Object.entries(allSettings)) {
        v[key] = typeof val === 'string' ? val : JSON.stringify(val);
      }
      setValues((prev) => {
        // Only update keys we don't have yet (preserve edits)
        const merged = { ...prev };
        for (const [key, val] of Object.entries(v)) {
          if (!(key in merged)) merged[key] = val;
        }
        return Object.keys(merged).length === Object.keys(prev).length ? prev : merged;
      });
    }
  }, [allSettings]);

  const setValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const settings = Object.entries(values).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
    }));
    await setMany({ settings });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const group = SETTING_GROUPS.find((g) => g.id === activeGroup) ?? SETTING_GROUPS[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-brand-400" />
            Site Settings
          </h1>
          <p className="text-surface-400 mt-1">Configure your website and business settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm flex items-center gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saved ? '✓ Saved' : <><Save className="w-4 h-4" /> Save All</>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {SETTING_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeGroup === g.id
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`}
            >
              <g.icon className={`w-4 h-4 ${activeGroup === g.id ? g.color : ''}`} />
              {g.label}
            </button>
          ))}
          <button
            onClick={() => setActiveGroup('security')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
              activeGroup === 'security'
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-surface-400 hover:text-white hover:bg-surface-800'
            }`}
          >
            <SECURITY_GROUP.icon className={`w-4 h-4 ${activeGroup === 'security' ? SECURITY_GROUP.color : ''}`} />
            {SECURITY_GROUP.label}
          </button>
        </div>

        {/* Settings Form */}
        <div className="flex-1 card p-6 space-y-5">
          {activeGroup === 'security' ? (
            <>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Security
              </h2>
              <TwoFactorSetup />
            </>
          ) : (
          <>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <group.icon className={`w-5 h-5 ${group.color}`} />
            {group.label}
          </h2>

          <div className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-surface-400 mb-1">{field.label}</label>
                {field.type === 'toggle' ? (
                  <button
                    onClick={() =>
                      setValue(field.key, values[field.key] === 'true' ? 'false' : 'true')
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      values[field.key] === 'true' ? 'bg-brand-500' : 'bg-surface-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        values[field.key] === 'true' ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={values[field.key] || ''}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                    rows={3}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    value={values[field.key] || ''}
                    onChange={(e) => setValue(field.key, e.target.value)}
                    className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
