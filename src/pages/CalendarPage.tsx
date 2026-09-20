import React from 'react';
import { useArchive } from '../context/ArchiveContext';
import { LifeCalendar } from '../components/LifeCalendar';
import { EditorialPageTransition } from '../components/EditorialPageTransition';

export const CalendarPage: React.FC = () => {
  const { archive, selectReceipt } = useArchive();

  return (
    <EditorialPageTransition
      folio={{
        volume: 'VOL. 01',
        section: 'CHRONOLOGICAL LIFE CALENDAR',
        edition: 'TEMPORAL MATRIX',
      }}
    >
      <LifeCalendar
        archive={archive}
        onSelectReceipt={selectReceipt}
      />
    </EditorialPageTransition>
  );
};
