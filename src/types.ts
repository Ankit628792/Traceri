export type TraceCategory =
  | 'music'
  | 'movies'
  | 'places'
  | 'purchases'
  | 'photos'
  | 'messages'
  | 'searches'
  | 'events'
  | 'notes';

export type ConnectionType =
  | 'TEMPORAL'
  | 'LOCATION'
  | 'SEMANTIC'
  | 'CATEGORY'
  | 'ENTITY'
  | 'SEQUENCE'
  | 'REPETITION'
  | 'CO_OCCURRENCE';

export type ConnectionStrength = 'STRONG' | 'MODERATE' | 'POSSIBLE';

export interface LocationData {
  name: string;
  city: string;
  country?: string;
  coordinates?: [number, number]; // [lat, lng]
}

export interface LifeReceipt {
  id: string;
  type: TraceCategory;
  timestamp: string; // ISO 8601
  title: string;
  subtitle?: string;
  description?: string;
  location?: LocationData;
  entities: string[];
  metadata: Record<string, any>;
  source?: string;
}

export interface Connection {
  id: string;
  from: string; // receipt id
  to: string;   // receipt id
  type: ConnectionType;
  strength: ConnectionStrength;
  evidence: string;
  deltaMinutes?: number;
}

export interface LifeMoment {
  id: string;
  title: string;
  timestamp: string;
  receiptIds: string[];
  receipts: LifeReceipt[];
  locationName?: string;
  dominantCategory: TraceCategory;
  durationMinutes: number;
}

export interface LifeThread {
  id: string;
  code: string; // e.g. "THREAD 01"
  title: string;
  editorialLabel: string; // e.g. 'Weekend Routine', 'The City Thread'
  graphicUrl?: string;
  themeColor: string;
  themeBg: string;
  patternType: string;
  patternCadence: string;
  receiptIds: string[];
  connections: Connection[];
  categoryTypes: TraceCategory[];
  narrativeAnnotation: string;
  leadReceiptId: string;
  sequenceStages?: {
    stage: string;
    description: string;
    receiptId: string;
  }[];
}

export interface LifeChapter {
  id: string;
  number: string; // "01", "02"
  title: string;
  subtitle: string;
  graphicUrl?: string;
  period: {
    start: string;
    end: string;
  };
  receiptCount: number;
  placeCount: number;
  moments: LifeMoment[];
  receiptIds: string[];
  dominantCategories: TraceCategory[];
  pullQuote: string;
  editorialLead?: string;
  narrativeParagraphs?: {
    heading: string;
    body: string;
    evidenceReceiptIds: string[];
    discoveredPattern?: string;
  }[];
}

export interface LifeDiscovery {
  id: string;
  type: 'REPETITION' | 'GAP' | 'CONNECTED_MOMENT' | 'SEQUENCE' | 'CONSTELLATION' | 'ACTIVITY_BURST';
  title: string;
  stat: string;
  label: string;
  receiptIds: string[];
  description: string;
  why: string[];
  confidence: ConnectionStrength;
}

export interface CategoryRelationship {
  sourceCategory: TraceCategory;
  targetCategory: TraceCategory;
  count: number;
}

export interface ProcessedArchive {
  receipts: LifeReceipt[];
  connections: Connection[];
  moments: LifeMoment[];
  threads: LifeThread[];
  chapters: LifeChapter[];
  discoveries: LifeDiscovery[];
  categoryRelationships: CategoryRelationship[];
  activityByHour: number[]; // 24 entries (0..23)
  activityByDayOfWeek: number[]; // 7 entries (0..6 Sun..Sat)
  entityCounts: { name: string; count: number; category: TraceCategory }[];
  placeCounts: { name: string; count: number; coordinates?: [number, number]; city: string }[];
  longestGap: {
    days: number;
    fromReceipt: LifeReceipt;
    toReceipt: LifeReceipt;
  } | null;
  mostConnectedMoment: LifeMoment | null;
  totalTraces: number;
  dateRange: {
    start: string;
    end: string;
  };
}
