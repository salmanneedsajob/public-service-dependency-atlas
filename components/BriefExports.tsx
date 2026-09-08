'use client';

import { useRef, useState } from 'react';

type ExportPanel = { id: string; eyebrow: string; title: string; blurb: string; text: string; copyLabel: string };

function Panel({ panel }: { panel: ExportPanel }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [shown, setShown] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(panel.text);
      setState('copied');
      window.setTimeout(() => setState('idle'), 2000);
    } catch {
      // Clipboard access can be refused; reveal the text and select it so the reader can copy it by hand.
      setState('failed');
      setShown(true);
      window.setTimeout(() => {
        const node = preRef.current;
        if (!node) return;
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }, 0);
    }
  }

  return (
    <section className="bya-export" aria-labelledby={`${panel.id}-heading`}>
      <p className="bya-eyebrow">{panel.eyebrow}</p>
      <h3 id={`${panel.id}-heading`}>{panel.title}</h3>
      <p>{panel.blurb}</p>
      <div className="bya-export-actions">
        <button type="button" className="bya-copy" onClick={copy} data-copied={state === 'copied'}>
          {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select it below' : panel.copyLabel}
        </button>
        <button type="button" className="bya-toggle" onClick={() => setShown((value) => !value)} aria-expanded={shown} aria-controls={`${panel.id}-text`}>
          {shown ? 'Hide the text' : 'Read the text'}
        </button>
      </div>
      {shown ? (
        <pre className="bya-pre" id={`${panel.id}-text`} ref={preRef}>
          {panel.text}
        </pre>
      ) : null}
    </section>
  );
}

export function BriefExports({ clarification, agentBrief }: { clarification: string; agentBrief: string }) {
  return (
    <div className="bya-exports">
      <Panel
        panel={{
          id: 'clarification',
          eyebrow: 'Take this to the office',
          title: 'Prepare my clarification',
          blurb:
            'The questions this situation leaves open, each with the document and date that raised it, and a note of what you have already read. It contains no personal details — you fill those in yourself before sending.',
          text: clarification,
          copyLabel: 'Copy the clarification',
        }}
      />
      <Panel
        panel={{
          id: 'agent-brief',
          eyebrow: 'Same record, different reader',
          title: 'Copy for my agent',
          blurb:
            'The identical evidence shaped for an assistant: supported facts with their grades and dates, the unresolved questions kept unresolved, and an explicit instruction that it authorises nothing.',
          text: agentBrief,
          copyLabel: 'Copy for my agent',
        }}
      />
    </div>
  );
}
