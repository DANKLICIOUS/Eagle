'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Building2,
  Clock3,
  FileSearch,
  FolderLock,
  Home,
  Scale,
  Settings,
  Workflow,
} from 'lucide-react';
import clsx from 'clsx';

const ITEMS = [
  { href: '/', label: 'Command', icon: Home },
  { href: '/engine', label: 'AI Engine', icon: BrainCircuit },
  { href: '/flows', label: 'Flows', icon: Workflow },
  { href: '/vault', label: 'Vault', icon: FolderLock },
  { href: '/officers', label: 'Officers', icon: Building2 },
  { href: '/foil', label: 'FOIL', icon: Scale },
  { href: '/research', label: 'Research', icon: FileSearch },
  { href: '/timeline', label: 'Timeline', icon: Clock3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function NavRail() {
  const pathname = usePathname();

  return (
    <nav className="nav-rail" aria-label="Primary">
      <Link href="/" className="nav-logo" title="Eagle Intelligence">
        EI
      </Link>
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx('nav-item', active && 'active')}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="tooltip">{label}</span>
          </Link>
        );
      })}
      <div className="nav-spacer" />
    </nav>
  );
}
