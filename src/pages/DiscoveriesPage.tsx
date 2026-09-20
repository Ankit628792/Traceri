import React from 'react';
import { useArchive } from '../context/ArchiveContext';
import { DiscoveriesView } from '../components/DiscoveriesView';
import { EditorialPageTransition } from '../components/EditorialPageTransition';

export const DiscoveriesPage: React.FC = () => {
  const { archive, selectReceipt } = useArchive();

  return (
    <EditorialPageTransition
      folio={{
        volume: 'VOL. 01',
        section: 'ARCHIVAL DISCOVERIES & PATTERNS',
        edition: 'DETERMINISTIC SYNTHESIS',
      }}
    >
      <DiscoveriesView
        archive={archive}
        onSelectReceipt={selectReceipt}
      />
    </EditorialPageTransition>
  );
};
