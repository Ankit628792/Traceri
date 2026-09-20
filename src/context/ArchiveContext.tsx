import React, { createContext, useContext, useState, useMemo } from 'react';
import { LifeReceipt, ProcessedArchive } from '../types';
import { SAMPLE_DATASET } from '../data/sampleDataset';
import { processArchiveData } from '../utils/engine';

interface ArchiveContextType {
  rawDataset: LifeReceipt[];
  setRawDataset: (data: LifeReceipt[]) => void;
  archive: ProcessedArchive;
  selectedReceipt: LifeReceipt | null;
  setSelectedReceipt: (receipt: LifeReceipt | null) => void;
  selectReceipt: (receipt: LifeReceipt) => void;
  showDatasetModal: boolean;
  setShowDatasetModal: (show: boolean) => void;
}

const ArchiveContext = createContext<ArchiveContextType | null>(null);

export const ArchiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawDataset, setRawDataset] = useState<LifeReceipt[]>(SAMPLE_DATASET);
  const [selectedReceipt, setSelectedReceipt] = useState<LifeReceipt | null>(null);
  const [showDatasetModal, setShowDatasetModal] = useState<boolean>(false);

  // Compute processed archive deterministically
  const archive = useMemo(() => {
    return processArchiveData(rawDataset);
  }, [rawDataset]);

  const selectReceipt = (receipt: LifeReceipt) => {
    setSelectedReceipt(receipt);
  };

  return (
    <ArchiveContext.Provider
      value={{
        rawDataset,
        setRawDataset,
        archive,
        selectedReceipt,
        setSelectedReceipt,
        selectReceipt,
        showDatasetModal,
        setShowDatasetModal,
      }}
    >
      {children}
    </ArchiveContext.Provider>
  );
};


export function useArchive() {
  const context = useContext(ArchiveContext);
  if (!context) {
    throw new Error('useArchive must be used within an ArchiveProvider');
  }
  return context;
}
