'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import { SlopfolioBadge } from '@/components/SlopfolioBadge';
import type { ExplorerDocument, ExplorerFolder, ExplorerMissingFile } from '@/lib/explorer-data';
import { sourceGroupSummary, type SourceGroupKind } from '@/lib/source-groups';

function FileIcon({ kind = 'specific', missing = false }: { kind?: SourceGroupKind; missing?: boolean }) {
  const icon = missing ? '⌧' : kind === 'general' ? '⌂' : kind === 'citizen' ? '◌' : '▤';
  return <span className={`file-icon file-icon-${kind}${missing ? ' file-icon-missing' : ''}`} aria-hidden="true">{icon}</span>;
}

function folderDocuments(folder: ExplorerFolder) {
  return [...folder.specificDocuments, ...folder.generalReferences, ...folder.citizenAccounts];
}

function sourceLabel(document: ExplorerDocument) {
  if (document.kind === 'general') return 'general reference · not specific to a step';
  if (document.kind === 'citizen') return `reported experience · Grade ${document.evidenceGrade}`;
  return `specific document · Grade ${document.evidenceGrade}`;
}

function SourceFileGroup({ id, title, sources, kind, onSelect, selectedId }: {
  id: string;
  title: string;
  sources: ExplorerDocument[];
  kind: SourceGroupKind;
  onSelect: (source: ExplorerDocument) => void;
  selectedId?: string;
}) {
  return (
    <section aria-labelledby={id}>
      <div className="file-group-heading"><h3 id={id}>{title}</h3><span>{sources.length}</span></div>
      {sources.length ? <div className="file-grid">{sources.map((document) => <a key={document.id} className={`file-card file-card-${kind} ${selectedId === document.id ? 'selected' : ''}`} href={document.url} target="_blank" rel="noreferrer" onClick={() => onSelect(document)}><FileIcon kind={kind} /><b>{document.title}</b><small>{sourceLabel(document)} ↗</small></a>)}</div> : <p className="file-group-empty">None recorded for this service.</p>}
    </section>
  );
}

export default function ExplorerMode({ folders }: { folders: ExplorerFolder[] }) {
  const [selectedFolderId, setSelectedFolderId] = useState(folders[0]?.id ?? '');
  const [selectedDocument, setSelectedDocument] = useState<ExplorerDocument | null>(folders[0] ? folderDocuments(folders[0])[0] ?? null : null);
  const [missingFile, setMissingFile] = useState<{ folder: ExplorerFolder; file: ExplorerMissingFile } | null>(null);
  const selectedFolder = useMemo(() => folders.find((folder) => folder.id === selectedFolderId) ?? folders[0], [folders, selectedFolderId]);

  useEffect(() => {
    if (!missingFile) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMissingFile(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [missingFile]);

  function chooseFolder(folder: ExplorerFolder) {
    setSelectedFolderId(folder.id);
    setSelectedDocument(folderDocuments(folder)[0] ?? null);
  }

  if (!selectedFolder) return null;

  return (
    <main className="explorer-page">
      <header className="site-header explorer-header">
        <Link className="wordmark" href="/"><span className="wordmark-accent">BLR</span><span>Public Service Dependency Atlas</span></Link>
        <nav aria-label="Explorer navigation"><a href="#folders">Services</a><a href="#files">Files</a></nav>
        <ModeToggle mode="explorer" />
      </header>

      <section className="explorer-intro">
        <div><p className="eyebrow">Filing cabinet · Bengaluru-first</p><h1>The public filing cabinet</h1></div>
        <p>Open a service folder to see the public documents that exist — and the grey files where a procedure should be, but is not published.</p>
      </section>

      <section className="explorer-shell" aria-label="Public-service document explorer">
        <aside className="folder-pane" id="folders">
          <div className="explorer-pane-heading"><span>Service folders</span><b>{folders.length}</b></div>
          <div className="folder-list">
            {folders.map((folder) => <button key={folder.id} className={folder.id === selectedFolder.id ? 'folder-row selected' : 'folder-row'} onClick={() => chooseFolder(folder)}><span className="folder-icon" aria-hidden="true">▰</span><span><b>{folder.title}</b><small>{folder.status} · {sourceGroupSummary({ specificDocuments: folder.specificDocuments, generalReferences: folder.generalReferences, citizenAccounts: folder.citizenAccounts }, folder.missingFiles.length)}</small></span></button>)}
          </div>
        </aside>

        <section className="file-pane" id="files" aria-labelledby="folder-title">
          <div className="file-pane-heading"><div><p className="eyebrow">{selectedFolder.category} · {selectedFolder.status}</p><h2 id="folder-title">{selectedFolder.title}</h2></div><Link href={selectedFolder.href}>Open service entry →</Link></div>
          <div className="file-groups">
            <p className="source-group-intro">Files are grouped by how specific the source is. Each URL appears once; general references are starting points, and citizen accounts are reported experience.</p>
            <SourceFileGroup id="specific-files-heading" title="Specific documents" sources={selectedFolder.specificDocuments} kind="specific" onSelect={setSelectedDocument} selectedId={selectedDocument?.id} />
            <SourceFileGroup id="general-files-heading" title="General references" sources={selectedFolder.generalReferences} kind="general" onSelect={setSelectedDocument} selectedId={selectedDocument?.id} />
            <SourceFileGroup id="citizen-files-heading" title="Citizen accounts" sources={selectedFolder.citizenAccounts} kind="citizen" onSelect={setSelectedDocument} selectedId={selectedDocument?.id} />
            <section className="research-coverage" aria-labelledby="research-coverage-heading">
              <div className="file-group-heading"><h3 id="research-coverage-heading">Empty file research</h3></div>
              <div className="research-coverage-states">
                <p className="researched-silent"><b>{selectedFolder.researchCoverage.researchedSilent}</b> No public source explains this — we looked.</p>
                <p className="not-yet-researched"><b>{selectedFolder.researchCoverage.notYetResearched}</b> Not yet researched.</p>
              </div>
            </section>
            <section aria-labelledby="missing-files-heading"><div className="file-group-heading"><h3 id="missing-files-heading">Missing procedures</h3><span>{selectedFolder.missingFiles.length}</span></div><div className="file-grid">{selectedFolder.missingFiles.map((file) => <button key={file.id} className="file-card missing-file" onClick={() => setMissingFile({ folder: selectedFolder, file })}><FileIcon missing /><b>{file.name}</b><small>not published</small></button>)}</div></section>
          </div>
        </section>

        <aside className="properties-pane" aria-live="polite">
          <div className="explorer-pane-heading"><span>Properties</span></div>
          {selectedDocument ? <div className="properties-content"><FileIcon kind={selectedDocument.kind} /><h2>{selectedDocument.title}</h2><dl><div><dt>Publisher</dt><dd>{selectedDocument.publisher}</dd></div><div><dt>Accessed</dt><dd>{selectedDocument.accessedAt}</dd></div><div><dt>Evidence grade</dt><dd>Grade {selectedDocument.evidenceGrade}</dd></div><div><dt>Type</dt><dd>{sourceLabel(selectedDocument)}</dd></div>{selectedDocument.citedFor.length > 0 && <div><dt>Cited for</dt><dd>{selectedDocument.citedFor.slice(0, 2).join(' · ')}{selectedDocument.citedFor.length > 2 ? ` · +${selectedDocument.citedFor.length - 2} more` : ''}</dd></div>}</dl><a href={selectedDocument.url} target="_blank" rel="noreferrer">Open source ↗</a></div> : <p className="properties-empty">Choose a source to inspect its details.</p>}
        </aside>
      </section>

      <footer className="explorer-footer"><p><b>Independent research, not official government guidance.</b> This explorer renders dated evidence held in the atlas; verify current requirements with the responsible agency.</p><div className="explorer-footer-meta"><span>Atlas snapshot 2026-08-28 · Bengaluru, Karnataka, India</span><SlopfolioBadge /></div></footer>

      {missingFile && <div className="missing-dialog-backdrop" role="presentation" onMouseDown={() => setMissingFile(null)}><section className="missing-dialog" role="dialog" aria-modal="true" aria-labelledby="missing-dialog-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setMissingFile(null)} aria-label="Close">×</button><FileIcon missing /><p className="eyebrow">No such document exists</p><h2 id="missing-dialog-title">{missingFile.file.situation}</h2><p>{missingFile.file.missing}</p><Link className="primary-link" href={`${missingFile.folder.href}#what-nobody-has-documented`} onClick={() => setMissingFile(null)}>See what nobody has documented <span>→</span></Link></section></div>}
    </main>
  );
}
