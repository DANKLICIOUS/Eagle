'use client';

import { AI_OUTPUT_DISCLAIMER, LEGAL_DISCLAIMER } from '@/lib/compliance';
import { AlertTriangle } from 'lucide-react';

type Props = {
  variant?: 'legal' | 'ai';
  compact?: boolean;
};

export function DisclaimerBar({ variant = 'legal', compact = false }: Props) {
  const text = variant === 'ai' ? AI_OUTPUT_DISCLAIMER : LEGAL_DISCLAIMER;
  return (
    <div className="disclaimer-bar" role="note">
      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
      <span>{compact ? text.slice(0, 120) + (text.length > 120 ? '…' : '') : text}</span>
    </div>
  );
}
