import { StageHeader } from '@/components/StageHeader';
import { EngineChat } from '@/components/EngineChat';
import Link from 'next/link';

export default function EnginePage() {
  return (
    <div className="stack gap-lg">
      <StageHeader
        eyebrow="Module · AI Engine"
        title="Interactive Core"
        subtitle="Conversational legal education with source-aware framing. Understand process and public information — do not expect case guarantees."
        actions={
          <>
            <Link href="/foil" className="btn btn-ghost">
              FOIL Builder
            </Link>
            <Link href="/research" className="btn">
              Research Desk
            </Link>
          </>
        }
      />
      <EngineChat />
    </div>
  );
}
