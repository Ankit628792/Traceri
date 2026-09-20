import React from 'react';
import { useSearch } from '@tanstack/react-router';
import { useArchive } from '../context/ArchiveContext';
import { MomentsThreadsView } from '../components/MomentsThreadsView';
import { EditorialPageTransition } from '../components/EditorialPageTransition';

export const ThreadsPage: React.FC = () => {
  const { archive, selectReceipt } = useArchive();
  const search = useSearch({ strict: false }) as { threadId?: string };

  return (
    <EditorialPageTransition
      folio={{
        volume: 'VOL. 01',
        section: 'MOMENTS & RECURRENT THREADS',
        edition: `${archive.threads.length} LIVING THREADS`,
      }}
    >
      <MomentsThreadsView
        archive={archive}
        onSelectReceipt={selectReceipt}
        activeThreadId={search?.threadId}
      />
    </EditorialPageTransition>
  );
};
