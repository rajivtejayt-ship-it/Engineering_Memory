'use client';

import * as React from 'react';
import { MockChatMessage, getResponseForPrompt, MOCK_AI_CONTEXT_BY_TOPIC } from '@/mock-data/ai-knowledge-base';

type StreamingState = 'idle' | 'thinking' | 'generating' | 'streaming' | 'done';

interface UseMockChatReturn {
  messages: MockChatMessage[];
  streamingState: StreamingState;
  streamingText: string;
  sendMessage: (prompt: string) => void;
  isStreaming: boolean;
  currentContext: typeof MOCK_AI_CONTEXT_BY_TOPIC['default'] | null;
}

let messageIdCounter = 0;
function generateId() {
  return `msg-${++messageIdCounter}-${Date.now()}`;
}

function detectTopic(prompt: string) {
  const lower = prompt.toLowerCase();
  if (lower.includes('auth') || lower.includes('jwt') || lower.includes('login')) return 'authentication';
  if (lower.includes('risk') || lower.includes('risky') || lower.includes('danger')) return 'risks';
  return 'default';
}

export function useMockChat(): UseMockChatReturn {
  const [messages, setMessages] = React.useState<MockChatMessage[]>([]);
  const [streamingState, setStreamingState] = React.useState<StreamingState>('idle');
  const [streamingText, setStreamingText] = React.useState('');
  const [currentContext, setCurrentContext] = React.useState<typeof MOCK_AI_CONTEXT_BY_TOPIC['default'] | null>(null);

  const isStreaming = streamingState !== 'idle' && streamingState !== 'done';

  const sendMessage = React.useCallback((prompt: string) => {
    if (isStreaming) return;

    // Add user message
    const userMessage: MockChatMessage = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setStreamingState('thinking');
    setStreamingText('');

    const fullResponse = getResponseForPrompt(prompt);
    const topic = detectTopic(prompt);
    setCurrentContext(MOCK_AI_CONTEXT_BY_TOPIC[topic] ?? MOCK_AI_CONTEXT_BY_TOPIC['default']);

    // Stage 1: Thinking
    const thinkingTimer = setTimeout(() => {
      setStreamingState('generating');

      // Stage 2: Generating
      const generatingTimer = setTimeout(() => {
        setStreamingState('streaming');
        let charIndex = 0;
        const charsPerTick = 8; // Characters per frame (controls speed)

        const streamInterval = setInterval(() => {
          charIndex += charsPerTick;
          if (charIndex >= fullResponse.length) {
            charIndex = fullResponse.length;
            clearInterval(streamInterval);

            // Finalize the message
            const assistantMessage: MockChatMessage = {
              id: generateId(),
              role: 'assistant',
              content: fullResponse,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setStreamingText('');
            setStreamingState('done');

            // Reset to idle after short delay
            setTimeout(() => setStreamingState('idle'), 300);
          } else {
            setStreamingText(fullResponse.slice(0, charIndex));
          }
        }, 16); // ~60fps streaming

        return () => clearInterval(streamInterval);
      }, 800); // Generating delay

      return () => clearTimeout(generatingTimer);
    }, 1200); // Thinking delay

    return () => clearTimeout(thinkingTimer);
  }, [isStreaming]);

  return {
    messages,
    streamingState,
    streamingText,
    sendMessage,
    isStreaming,
    currentContext,
  };
}
