import { HeroSection } from '@/components/landing/hero-section';
import { MicroscopeSection } from '@/components/landing/microscope-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { WorkflowSection } from '@/components/landing/workflow-section';
import { StatsSection } from '@/components/landing/stats-section';
import { ImportCtaSection } from '@/components/landing/import-cta-section';
import { DemoListener } from './demo-listener';
import { Suspense } from 'react';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <Suspense fallback={null}>
        <DemoListener />
      </Suspense>
      <HeroSection />
      <MicroscopeSection />
      <FeaturesSection />
      <WorkflowSection />
      <StatsSection />
      <ImportCtaSection />
    </div>
  );
}
