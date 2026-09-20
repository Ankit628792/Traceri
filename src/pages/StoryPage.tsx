import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useArchive } from '../context/ArchiveContext';
import { StoryMode } from '../components/StoryMode';
import { EditorialPageTransition } from '../components/EditorialPageTransition';

export const StoryPage: React.FC = () => {
  const { archive, selectReceipt } = useArchive();
  const navigate = useNavigate();

  const handleFollowThread = (startReceiptId: string) => {
    const thread = archive.threads.find((t) => t.receiptIds.includes(startReceiptId));
    if (thread) {
      navigate({ to: '/threads', search: { threadId: thread.id } });
    } else {
      navigate({ to: '/threads' });
    }
  };

  return (
    <EditorialPageTransition
      folio={{
        volume: 'VOL. 01',
        section: 'NARRATIVE MONOGRAPH & CHAPTERS',
        edition: 'CHRONICLE ESSAY',
      }}
    >
      <StoryMode
        archive={archive}
        onSelectReceipt={selectReceipt}
        onFollowThread={handleFollowThread}
      />
    </EditorialPageTransition>
  );
};
