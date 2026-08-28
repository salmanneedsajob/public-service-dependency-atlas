import type { Metadata } from 'next';
import ExplorerMode from '@/components/ExplorerMode';
import { buildExplorerFolders } from '@/lib/explorer-data';

export const metadata: Metadata = {
  title: 'Explorer mode | Public Service Dependency Atlas',
  description: 'A file-manager view of the public documents and missing procedures in Bengaluru public services.',
};

export default function ExplorerPage() {
  return <ExplorerMode folders={buildExplorerFolders()} />;
}
