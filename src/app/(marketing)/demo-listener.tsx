'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/components/providers/app-provider';
import { useToast } from '@/components/feedback/toast';

export function DemoListener() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDemoMode, setIsAuthenticated, importRepository } = useApp();
  const { toast } = useToast();

  React.useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      // Demo mode activated!
      setDemoMode(true);
      setIsAuthenticated(true);
      importRepository('https://github.com/engineering-memory/demo', 'engineering-memory');
      toast({
        title: 'Demo Mode Activated',
        description: 'Loaded sample repository and bypassed authentication.',
        type: 'success'
      });
      router.push('/dashboard');
    }
  }, [searchParams, setDemoMode, setIsAuthenticated, importRepository, toast, router]);

  return null;
}
