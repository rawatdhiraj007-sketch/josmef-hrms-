'use client';

import { useState } from 'react';
import {
  Boxes, Plus, ChevronRight, Send, Trash2, Settings as SettingsIcon,
  Mail, Lock, User, Check, X,
} from 'lucide-react';
import {
  Button, Input, Textarea, Select, Avatar, AvatarGroup,
  Badge, Card, CardHeader, CardBody, CardFooter,
  Tabs, Modal, Dropdown, DropdownItem, DropdownDivider, DropdownLabel,
  useToast,
} from '@/components/ui';

export default function ComponentsLibraryPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-2">
          <Boxes className="w-5 h-5 text-primary-600" /> Component Library
        </h2>
        <p className="text-sm text-surface-500 mt-1">
          The reusable primitives that power the entire app — Button, Input, Card, Avatar, Badge, Tabs, Modal, Dropdown, Toast.
        </p>
      </header>

      {/* ─── Buttons ─── */}
      <Section title="Buttons" description="6 variants × 3 sizes, with loading and icon support.">
        <div className="space-y-3">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="With icons">
            <Button leftIcon={<Plus className="w-3.5 h-3.5" />}>Create</Button>
            <Button variant="secondary" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>Continue</Button>
            <Button variant="danger" leftIcon={<Trash2 className="w-3.5 h-3.5" />}>Delete</Button>
          </Row>
          <Row label="Loading & disabled">
            <Button loading>Saving…</Button>
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </Row>
        </div>
      </Section>

      {/* ─── Form fields ─── */}
      <Section title="Form fields" description="Input, Textarea, Select with labels, descriptions, errors.">
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          <Input label="Email" type="email" placeholder="you@company.com" leftIcon={<Mail className="w-3.5 h-3.5" />} required />
          <Input label="Password" type="password" leftIcon={<Lock className="w-3.5 h-3.5" />} hint="Minimum 8 characters" />
          <Input label="Full name" leftIcon={<User className="w-3.5 h-3.5" />} placeholder="Maria Cruz" />
          <Input label="License #" placeholder="Invalid" error="License number is required" />
          <Select label="Department" defaultValue="">
            <option value="">Select…</option>
            <option>Engineering</option>
            <option>Sales</option>
            <option>HR</option>
          </Select>
          <Textarea label="Notes" placeholder="Add a note…" rows={3} />
        </div>
      </Section>

      {/* ─── Avatars ─── */}
      <Section title="Avatars" description="Initials fallback, status dot, group stack.">
        <Row label="Sizes">
          <Avatar name="A" size="xs" />
          <Avatar name="MC" size="sm" />
          <Avatar name="Maria Cruz" size="md" />
          <Avatar name="Pedro Reyes" size="lg" />
          <Avatar name="Juan Santos" size="xl" />
        </Row>
        <Row label="Status">
          <Avatar name="On" status="online" />
          <Avatar name="Aw" status="away" />
          <Avatar name="Bs" status="busy" />
          <Avatar name="Of" status="offline" />
        </Row>
        <Row label="Group">
          <AvatarGroup avatars={[
            { name: 'Maria Cruz' },
            { name: 'Juan Reyes' },
            { name: 'Anna Lim' },
            { name: 'Pedro Santos' },
            { name: 'Lisa Wong' },
            { name: 'Mark Tan' },
          ]} max={4} />
        </Row>
      </Section>

      {/* ─── Badges ─── */}
      <Section title="Badges" description="Status pills with dot, icon, variants.">
        <Row label="Variants">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="brand">Brand</Badge>
        </Row>
        <Row label="With dot">
          <Badge variant="success" dot>Active</Badge>
          <Badge variant="warning" dot>Pending</Badge>
          <Badge variant="danger" dot>Expired</Badge>
        </Row>
        <Row label="With icon">
          <Badge variant="success" icon={<Check className="w-3 h-3" />}>Verified</Badge>
          <Badge variant="danger" icon={<X className="w-3 h-3" />}>Rejected</Badge>
        </Row>
      </Section>

      {/* ─── Cards ─── */}
      <Section title="Cards" description="4 variants, compound parts (Header, Body, Footer).">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader icon={SettingsIcon} title="Default card" subtitle="A basic card." />
            <CardBody>
              <p className="text-sm text-surface-600">Card body content goes here. Cards have soft shadows and subtle borders.</p>
            </CardBody>
          </Card>
          <Card variant="elevated" hover>
            <CardHeader title="Elevated + hover" subtitle="Lifts up on hover." />
            <CardBody>
              <p className="text-sm text-surface-600">Hover over this card to see the lift effect.</p>
            </CardBody>
          </Card>
          <Card variant="outline">
            <CardHeader title="Outline" subtitle="No background, just border." />
            <CardBody>
              <p className="text-sm text-surface-600">Use for less emphasis.</p>
            </CardBody>
            <CardFooter>
              <Button size="sm" variant="ghost">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* ─── Tabs ─── */}
      <Section title="Tabs" description="Line, pill, enclosed variants. Keyboard navigable.">
        <Tabs
          tabs={[
            { value: 'overview', label: 'Overview' },
            { value: 'team',     label: 'Team', count: 12 },
            { value: 'history',  label: 'History' },
            { value: 'archived', label: 'Archived', disabled: true },
          ]}
          variant="line"
        >
          {(active) => (
            <div className="p-4 bg-surface-50 rounded-xl text-sm text-surface-700">
              Active tab: <span className="font-semibold">{active}</span>
            </div>
          )}
        </Tabs>
        <div className="mt-4">
          <Tabs
            tabs={[
              { value: 'a', label: 'Compact' },
              { value: 'b', label: 'Comfortable' },
            ]}
            variant="pill"
          />
        </div>
      </Section>

      {/* ─── Modal + Drawer ─── */}
      <Section title="Modal & Drawer" description="Accessible, scroll-locked, Esc-to-close.">
        <Row label="">
          <Button variant="secondary" onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
        </Row>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm delete"
          description="This action cannot be undone."
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => { setModalOpen(false); toast.success('Deleted'); }}>Delete</Button>
            </>
          }
        >
          <p className="text-sm text-surface-700">
            Are you sure you want to permanently remove this record from the system?
            All associated data will be lost.
          </p>
        </Modal>
        <Modal
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Edit profile"
          drawer="right"
          footer={
            <>
              <Button variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button onClick={() => { setDrawerOpen(false); toast.success('Saved'); }}>Save</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input label="Name" defaultValue="Maria Cruz" />
            <Input label="Email" defaultValue="maria@example.com" />
            <Select label="Department">
              <option>Engineering</option>
              <option>Sales</option>
            </Select>
          </div>
        </Modal>
      </Section>

      {/* ─── Dropdown ─── */}
      <Section title="Dropdown" description="Click outside / Esc to close. Items with icon + danger variant.">
        <Row label="">
          <Dropdown
            trigger={<Button variant="secondary" rightIcon={<ChevronRight className="w-3.5 h-3.5 rotate-90" />}>Actions</Button>}
          >
            <DropdownLabel>Manage</DropdownLabel>
            <DropdownItem icon={SettingsIcon} onClick={() => toast.info('Settings clicked')}>Settings</DropdownItem>
            <DropdownItem icon={User} onClick={() => toast.info('Profile clicked')}>Profile</DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={Trash2} variant="danger" onClick={() => toast.warning('Are you sure?')}>Delete</DropdownItem>
          </Dropdown>
        </Row>
      </Section>

      {/* ─── Toasts ─── */}
      <Section title="Toasts" description="Stacked top-right, auto-dismiss, 4 variants.">
        <Row label="">
          <Button variant="success" size="sm" onClick={() => toast.success('Saved successfully', 'Your changes have been applied.')}>Success</Button>
          <Button variant="danger" size="sm" onClick={() => toast.error('Something went wrong', 'Please try again or contact support.')}>Error</Button>
          <Button size="sm" variant="secondary" onClick={() => toast.warning('Heads up', 'License expires in 7 days.')}>Warning</Button>
          <Button size="sm" variant="ghost" onClick={() => toast.info('FYI', 'A new feature is available.')}>Info</Button>
        </Row>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Layout helpers
// ─────────────────────────────────────────────────────────

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-surface-200 bg-white shadow-card p-6">
      <header className="mb-5">
        <h3 className="font-semibold text-surface-900">{title}</h3>
        {description && <p className="text-xs text-surface-500 mt-0.5">{description}</p>}
      </header>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-surface-100 last:border-0">
      {label && <div className="text-2xs font-semibold uppercase tracking-wider text-surface-400 min-w-[110px] mt-2">{label}</div>}
      <div className="flex flex-wrap items-center gap-2 flex-1">{children}</div>
    </div>
  );
}
