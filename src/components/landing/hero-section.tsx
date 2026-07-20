'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { transitions } from '@/design-system/motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/feedback/badge';
import { Card } from '@/components/ui/card';
import { GitPullRequest, MessageSquare, Terminal, ArrowRight, Sparkles } from 'lucide-react';
import { defaultIconProps } from '@/design-system/icons';
import { FileStreamLoader } from '@/components/ui/file-stream-loader';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 flex flex-col items-center overflow-hidden bg-[var(--bg-base)]">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 md:px-12 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.structural}
          className="flex flex-col items-center"
        >
          <Badge variant="outline" className="mb-8 px-3 py-1 border-[var(--accent)]/30 bg-[var(--accent)]/5 text-[var(--accent)] gap-2">
            <Sparkles size={12} {...defaultIconProps} />
            Engineering Intelligence Platform
          </Badge>
          
          <h1 className="text-[var(--text-display-lg)] md:text-[5rem] lg:text-[6rem] font-bold tracking-tight leading-[1.1] text-[var(--text)] max-w-4xl">
            The Archaeology of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text)] to-[var(--text-secondary)]">Intent</span>
          </h1>
          
          <p className="mt-8 max-w-2xl text-[var(--text-body)] md:text-[var(--text-title-lg)] text-[var(--text-secondary)] leading-relaxed font-medium">
            Stop digging through isolated pull requests and fragmented slack threads. Reconstruct the exact reasoning, technical context, and historical decisions behind any line of code.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <Button size="lg" asChild className="h-14 px-8 text-base">
              <Link href="/login">
                Analyze Repository <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-[var(--bg-panel)]">
              View Documentation
            </Button>
          </div>
        </motion.div>

        {/* Hero Interactive Visualization */}
        <motion.div 
          className="w-full max-w-5xl mt-24 relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.structural, delay: 0.2 }}
        >
          {/* Glass Panel Container */}
          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--bg-panel)]/40 backdrop-blur-xl shadow-2xl p-6 md:p-10 flex flex-col gap-8 relative overflow-hidden">
            
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[var(--accent)]/20 blur-[120px] rounded-full pointer-events-none" />

            {/* Top Bar - Simulated Terminal */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-6 relative z-10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[var(--border-hover)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--border-hover)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--border-hover)]" />
              </div>
              <div className="h-8 flex items-center bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-4 ml-4 text-xs font-mono text-[var(--text-secondary)]">
                <Terminal size={14} className="mr-2" /> engineering-memory / src / auth.ts
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
              
              {/* Left Column: Code & Context */}
              <div className="col-span-1 md:col-span-7 flex flex-col gap-6">
                <Card variant="interactive" className="p-0 overflow-hidden font-mono text-sm bg-[#0d1117] border-white/10">
                  <div className="flex bg-[#161b22] px-4 py-2 border-b border-white/10 text-[#8b949e] text-xs font-semibold">
                    src/core/auth/strategy.ts
                  </div>
                  <div className="p-4 overflow-x-auto text-[#c9d1d9] leading-relaxed">
                    <div className="opacity-50 flex"><span className="w-6 inline-block text-right mr-4 select-none">42</span><span>{'// Legacy auth implementation'}</span></div>
                    <div className="flex"><span className="w-6 inline-block text-right mr-4 select-none opacity-50">43</span><span className="text-[#ff7b72]">export async function</span> <span className="text-[#d2a8ff]">validateSession</span><span>(token: string) {'{'}</span></div>
                    <div className="flex bg-[var(--accent)]/20 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)]" />
                      <span className="w-6 inline-block text-right mr-4 select-none opacity-50 text-[var(--accent)]">44</span><span>  const payload = await jwt.verify(token, env.JWT_SECRET);</span>
                    </div>
                    <div className="flex"><span className="w-6 inline-block text-right mr-4 select-none opacity-50">45</span><span>  return payload;</span></div>
                    <div className="flex"><span className="w-6 inline-block text-right mr-4 select-none opacity-50">46</span><span>{'}'}</span></div>
                  </div>
                </Card>

                <div className="flex items-center gap-4 px-2">
                  <FileStreamLoader label="Reconstructing dependencies..." className="max-w-none flex-1" />
                </div>
              </div>

              {/* Right Column: Historical Investigation */}
              <div className="col-span-1 md:col-span-5 flex flex-col gap-4">
                <div className="text-[var(--text-meta)] font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Contextual Evidence
                </div>
                
                <Card className="p-4 border-[var(--accent)]/40 bg-[var(--accent)]/5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-[var(--accent)]">
                      <Sparkles size={16} {...defaultIconProps} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text)] mb-1">Architectural Shift</h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        This token verification pattern was introduced during the migration from session cookies to JWTs to support the mobile application API.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card variant="basic" className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8957e5]/20 text-[#8957e5]">
                      <GitPullRequest size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">Migrate to JWT Auth Strategy</p>
                      <p className="text-xs text-[var(--text-secondary)]">Merged 14 months ago • PR #892</p>
                    </div>
                  </div>
                </Card>

                <Card variant="basic" className="p-3 opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--danger)]/20 text-[var(--danger)]">
                      <MessageSquare size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">Security: Token validation failure</p>
                      <p className="text-xs text-[var(--text-secondary)]">Closed issue • #890</p>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
