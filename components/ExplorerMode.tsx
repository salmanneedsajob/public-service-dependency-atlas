'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ModeToggle } from '@/components/ModeToggle';
import type { ExplorerDocument, ExplorerFolder, ExplorerMissingFile } from '@/lib/explorer-data';

function FileIcon({ missing = false }: { missing?: boolean }) {
  return <span className={`file-icon${missing ? ' file-icon-missing' : ''}`} aria-hidden="true">{missing ? '⌧' : '▤'}</span>;
}

export default function ExplorerMode({ folders }: { folders: ExplorerFolder[] }) {
  const [selectedFolderId, setSelectedFolderId] = useState(folders[0]?.id ?? '');
  const [selectedDocument, setSelectedDocument] = useState<ExplorerDocument | null>(folders[0]?.documents[0] ?? null);
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
    setSelectedDocument(folder.documents[0] ?? null);
  }

  if (!selectedFolder) return null;

  return (
    <main className="explorer-page">
      <header className="site-header explorer-header">
        <Link className="wordmark" href="/">Public service dependency atlas</Link>
        <nav aria-label="Explorer navigation"><a href="#folders">Services</a><a href="#files">Files</a></nav>
        <ModeToggle mode="explorer" />
      </header>

      <section className="explorer-intro">
        <div><p className="eyebrow">Explorer mode · Bengaluru-first</p><h1>The public filing cabinet</h1></div>
        <p>Open a service folder to see the public documents that exist — and the grey files where a procedure should be, but is not published.</p>
      </section>

      <section className="explorer-shell" aria-label="Public-service document explorer">
        <aside className="folder-pane" id="folders">
          <div className="explorer-pane-heading"><span>Service folders</span><b>{folders.length}</b></div>
          <div className="folder-list">
            {folders.map((folder) => <button key={folder.id} className={folder.id === selectedFolder.id ? 'folder-row selected' : 'folder-row'} onClick={() => chooseFolder(folder)}><span className="folder-icon" aria-hidden="true">▰</span><span><b>{folder.title}</b><small>{folder.documents.length} documents · {folder.missingFiles.length} missing</small></span></button>)}
          </div>
        </aside>

        <section className="file-pane" id="files" aria-labelledby="folder-title">
          <div className="file-pane-heading"><div><p className="eyebrow">{selectedFolder.category}</p><h2 id="folder-title">{selectedFolder.title}</h2></div><Link href={selectedFolder.href}>Open service entry →</Link></div>
          <div className="file-groups">
            <section aria-labelledby="official-files-heading"><div className="file-group-heading"><h3 id="official-files-heading">Published documents</h3><span>{selectedFolder.documents.length}</span></div><div className="file-grid">{selectedFolder.documents.map((document) => <a key={document.id} className={selectedDocument?.id === document.id ? 'file-card selected' : 'file-card'} href={document.url} target="_blank" rel="noreferrer" onClick={() => setSelectedDocument(document)}><FileIcon /><b>{document.title}</b><small>{document.type} · opens source ↗</small></a>)}</div></section>
            <section aria-labelledby="missing-files-heading"><div className="file-group-heading"><h3 id="missing-files-heading">Missing procedures</h3><span>{selectedFolder.missingFiles.length}</span></div><div className="file-grid">{selectedFolder.missingFiles.map((file) => <button key={file.id} className="file-card missing-file" onClick={() => setMissingFile({ folder: selectedFolder, file })}><FileIcon missing /><b>{file.name}</b><small>not published</small></button>)}</div></section>
          </div>
        </section>

        <aside className="properties-pane" aria-live="polite">
          <div className="explorer-pane-heading"><span>Properties</span></div>
          {selectedDocument ? <div className="properties-content"><FileIcon /><h2>{selectedDocument.title}</h2><dl><div><dt>Publisher</dt><dd>{selectedDocument.publisher}</dd></div><div><dt>Accessed</dt><dd>{selectedDocument.accessedAt}</dd></div><div><dt>Evidence grade</dt><dd>Grade {selectedDocument.evidenceGrade}</dd></div><div><dt>Type</dt><dd>{selectedDocument.type}</dd></div></dl><a href={selectedDocument.url} target="_blank" rel="noreferrer">Open published source ↗</a></div> : <p className="properties-empty">Choose a published document to inspect its source details.</p>}
        </aside>
      </section>

      <footer className="explorer-footer"><p><b>Independent research, not official government guidance.</b> This explorer renders dated evidence held in the atlas; verify current requirements with the responsible agency.</p><span>Atlas snapshot 2026-08-28 · Bengaluru, Karnataka, India</span></footer>

      {missingFile && <div className="missing-dialog-backdrop" role="presentation" onMouseDown={() => setMissingFile(null)}><section className="missing-dialog" role="dialog" aria-modal="true" aria-labelledby="missing-dialog-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setMissingFile(null)} aria-label="Close">×</button><FileIcon missing /><p className="eyebrow">No such document exists</p><h2 id="missing-dialog-title">{missingFile.file.situation}</h2><p>{missingFile.file.missing}</p><Link className="primary-link" href={`${missingFile.folder.href}#what-nobody-has-documented`} onClick={() => setMissingFile(null)}>See what nobody has documented <span>→</span></Link></section></div>}
    </main>
  );
}
