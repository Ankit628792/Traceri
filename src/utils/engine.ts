import {
  LifeReceipt,
  Connection,
  LifeMoment,
  LifeThread,
  LifeChapter,
  LifeDiscovery,
  CategoryRelationship,
  ProcessedArchive,
  TraceCategory,
} from '../types';

import barbicanGraphic from '../assets/images/barbican_brutalist_1789886648678.jpg';
import solarisGraphic from '../assets/images/solaris_film_still_1789886660783.jpg';
import kyotoGraphic from '../assets/images/kyoto_night_canal_1789886673217.jpg';
import tokyoGraphic from '../assets/images/tokyo_jazz_kissa_1789886692472.jpg';
import monocleGraphic from '../assets/images/monocle_cafe_table_1789886707374.jpg';

export { barbicanGraphic, solarisGraphic, kyotoGraphic, tokyoGraphic, monocleGraphic };

export const CATEGORIES: TraceCategory[] = [
  'music',
  'movies',
  'places',
  'purchases',
  'photos',
  'messages',
  'searches',
  'events',
  'notes',
];

export const CATEGORY_META: Record<
  TraceCategory,
  { label: string; color: string; bgClass: string; textClass: string; icon: string }
> = {
  music: {
    label: 'MUSIC',
    color: '#8B78C2',
    bgClass: 'bg-[#8B78C2]/15',
    textClass: 'text-[#A795DC]',
    icon: 'Radio',
  },
  movies: {
    label: 'MOVIES',
    color: '#D25A5A',
    bgClass: 'bg-[#D25A5A]/15',
    textClass: 'text-[#E27878]',
    icon: 'Film',
  },
  places: {
    label: 'PLACES',
    color: '#5F9E7D',
    bgClass: 'bg-[#5F9E7D]/15',
    textClass: 'text-[#76B896]',
    icon: 'Compass',
  },
  purchases: {
    label: 'PURCHASES',
    color: '#CFA04E',
    bgClass: 'bg-[#CFA04E]/15',
    textClass: 'text-[#DFB367]',
    icon: 'Receipt',
  },
  photos: {
    label: 'PHOTOS',
    color: '#5C8EA8',
    bgClass: 'bg-[#5C8EA8]/15',
    textClass: 'text-[#77A6BF]',
    icon: 'Camera',
  },
  messages: {
    label: 'MESSAGES',
    color: '#D67C6B',
    bgClass: 'bg-[#D67C6B]/15',
    textClass: 'text-[#E59585]',
    icon: 'MessageSquare',
  },
  searches: {
    label: 'SEARCHES',
    color: '#569CA6',
    bgClass: 'bg-[#569CA6]/15',
    textClass: 'text-[#70B5BF]',
    icon: 'Search',
  },
  events: {
    label: 'EVENTS',
    color: '#D9883E',
    bgClass: 'bg-[#D9883E]/15',
    textClass: 'text-[#EB9E58]',
    icon: 'Calendar',
  },
  notes: {
    label: 'NOTES',
    color: '#BFA27E',
    bgClass: 'bg-[#BFA27E]/15',
    textClass: 'text-[#D1B898]',
    icon: 'FileText',
  },
};

/**
 * Calculate distance in km between two [lat, lng] points
 */
function getGeoDistanceKm(p1: [number, number], p2: [number, number]): number {
  const R = 6371; // Earth radius km
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLon = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Process raw receipts into a full connected knowledge graph and story
 */
export function processArchiveData(rawReceipts: LifeReceipt[]): ProcessedArchive {
  // 1. Sort chronologically
  const receipts = [...rawReceipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 2. Build Connections
  const connections: Connection[] = [];
  const connectionMap = new Map<string, Connection[]>();

  for (let i = 0; i < receipts.length; i++) {
    const r1 = receipts[i];
    const t1 = new Date(r1.timestamp).getTime();

    for (let j = i + 1; j < receipts.length; j++) {
      const r2 = receipts[j];
      const t2 = new Date(r2.timestamp).getTime();
      const deltaMinutes = Math.round((t2 - t1) / (1000 * 60));

      // Check temporal proximity (< 180 minutes)
      const isTemporal = deltaMinutes <= 180;

      // Check location match
      let isLocation = false;
      let locEvidence = '';
      if (r1.location && r2.location) {
        if (
          r1.location.name.toLowerCase() === r2.location.name.toLowerCase() ||
          (r1.location.name && r2.location.name && (r1.location.name.includes(r2.location.name) || r2.location.name.includes(r1.location.name)))
        ) {
          isLocation = true;
          locEvidence = `SAME PLACE (${r1.location.name})`;
        } else if (r1.location.coordinates && r2.location.coordinates) {
          const dist = getGeoDistanceKm(r1.location.coordinates, r2.location.coordinates);
          if (dist < 1.0) {
            isLocation = true;
            locEvidence = `NEARBY (${dist.toFixed(1)} km)`;
          }
        }
      }

      // Check entity overlap
      const sharedEntities = r1.entities.filter((e1) =>
        r2.entities.some((e2) => e1.toLowerCase() === e2.toLowerCase())
      );
      const isEntity = sharedEntities.length > 0;

      // Check sequence (e.g. searches -> purchases/events/places)
      let isSequence = false;
      if (
        (r1.type === 'searches' && ['purchases', 'places', 'events', 'movies', 'music'].includes(r2.type) && deltaMinutes < 1440) ||
        (r1.type === 'places' && ['photos', 'purchases', 'notes', 'music'].includes(r2.type) && deltaMinutes < 240) ||
        (r1.type === 'movies' && ['notes', 'music'].includes(r2.type) && deltaMinutes < 240)
      ) {
        if (isEntity || isLocation || isTemporal) {
          isSequence = true;
        }
      }

      // If there is a meaningful relationship
      if (isLocation || isEntity || (isTemporal && deltaMinutes <= 45) || isSequence) {
        let connType: Connection['type'] = 'TEMPORAL';
        let evidence = `+${deltaMinutes} MIN`;
        let strength: Connection['strength'] = 'POSSIBLE';

        if (isSequence) {
          connType = 'SEQUENCE';
          evidence = `SEQUENCE (${r1.type.toUpperCase()} → ${r2.type.toUpperCase()})`;
          strength = 'STRONG';
        } else if (isLocation && isEntity) {
          connType = 'ENTITY';
          evidence = `${locEvidence} · SHARED [${sharedEntities.join(', ')}]`;
          strength = 'STRONG';
        } else if (isLocation) {
          connType = 'LOCATION';
          evidence = locEvidence;
          strength = isTemporal ? 'STRONG' : 'MODERATE';
        } else if (isEntity) {
          connType = 'ENTITY';
          evidence = `SHARED [${sharedEntities.join(', ')}]`;
          strength = isTemporal ? 'STRONG' : 'MODERATE';
        } else if (isTemporal) {
          connType = 'TEMPORAL';
          evidence = `+${deltaMinutes} MIN CONCURRENCY`;
          strength = deltaMinutes < 20 ? 'STRONG' : 'MODERATE';
        }

        const conn: Connection = {
          id: `CONN-${r1.id}-${r2.id}`,
          from: r1.id,
          to: r2.id,
          type: connType,
          strength,
          evidence,
          deltaMinutes,
        };

        connections.push(conn);

        if (!connectionMap.has(r1.id)) connectionMap.set(r1.id, []);
        if (!connectionMap.has(r2.id)) connectionMap.set(r2.id, []);
        connectionMap.get(r1.id)!.push(conn);
        connectionMap.get(r2.id)!.push(conn);
      }
    }
  }

  // 3. Cluster Moments (receipts happening within 90 minutes of each other in bursts)
  const moments: LifeMoment[] = [];
  const visitedMomentReceipts = new Set<string>();

  for (let i = 0; i < receipts.length; i++) {
    const root = receipts[i];
    if (visitedMomentReceipts.has(root.id)) continue;

    const clusterReceipts: LifeReceipt[] = [root];
    visitedMomentReceipts.add(root.id);

    let lastTime = new Date(root.timestamp).getTime();

    for (let j = i + 1; j < receipts.length; j++) {
      const candidate = receipts[j];
      if (visitedMomentReceipts.has(candidate.id)) continue;

      const candTime = new Date(candidate.timestamp).getTime();
      const diffMins = (candTime - lastTime) / (1000 * 60);

      if (diffMins <= 90) {
        clusterReceipts.push(candidate);
        visitedMomentReceipts.add(candidate.id);
        lastTime = candTime;
      } else {
        break;
      }
    }

    if (clusterReceipts.length >= 2) {
      const startTime = new Date(clusterReceipts[0].timestamp).getTime();
      const endTime = new Date(clusterReceipts[clusterReceipts.length - 1].timestamp).getTime();
      const durationMinutes = Math.max(1, Math.round((endTime - startTime) / (1000 * 60)));

      // Find dominant category
      const catFreq: Record<string, number> = {};
      clusterReceipts.forEach((r) => {
        catFreq[r.type] = (catFreq[r.type] || 0) + 1;
      });
      const domCat = (Object.entries(catFreq).sort((a, b) => b[1] - a[1])[0][0]) as TraceCategory;

      const locName = clusterReceipts.find((r) => r.location)?.location?.name;

      moments.push({
        id: `MOMENT-${moments.length + 1}`,
        title: locName ? `${locName}` : `${clusterReceipts[0].title}`,
        timestamp: clusterReceipts[0].timestamp,
        receiptIds: clusterReceipts.map((r) => r.id),
        receipts: clusterReceipts,
        locationName: locName,
        dominantCategory: domCat,
        durationMinutes,
      });
    }
  }

  // 4. Build Threads (meaningful narrative sequences)
  const threads: LifeThread[] = [];

  // Thread 1: The 35mm Solaris Retrospective (TR-001 -> TR-008)
  const solarisIds = receipts
    .filter((r) => r.entities.some((e) => ['solaris', 'tarkovsky', 'celluloid', '35mm'].includes(e.toLowerCase())))
    .map((r) => r.id);
  if (solarisIds.length >= 3) {
    threads.push({
      id: 'THREAD-01',
      code: 'THREAD 01',
      title: 'THE 35MM RETROSPECTIVE',
      editorialLabel: 'The 35mm Celluloid Obsession',
      graphicUrl: solarisGraphic,
      themeColor: '#D25A5A',
      themeBg: 'rgba(210, 90, 90, 0.12)',
      patternType: 'Cultural Intent to Consumption Sequence',
      patternCadence: 'Initial query to cinema exit: 8 hours 35 minutes',
      receiptIds: solarisIds,
      connections: connections.filter((c) => solarisIds.includes(c.from) && solarisIds.includes(c.to)),
      categoryTypes: Array.from(new Set(receipts.filter((r) => solarisIds.includes(r.id)).map((r) => r.type))),
      narrativeAnnotation: 'SEARCH → TICKET → CONCRETE → 35MM SCREENING → CELLULOID SOUND',
      leadReceiptId: solarisIds[0],
      sequenceStages: [
        { stage: 'DIGITAL QUERY', description: 'Search for 35mm Solaris screening near Moorgate', receiptId: solarisIds[0] },
        { stage: 'TRANSACTION', description: 'Archival ticket acquired at Barbican Box Office', receiptId: solarisIds[1] || solarisIds[0] },
        { stage: 'SPATIAL IMMERSION', description: 'Screening in Cinema 1 with Eduard Artemyev score', receiptId: solarisIds[2] || solarisIds[0] },
        { stage: 'ARCHIVAL NOTE', description: 'Field memo recording river reflections and ANS synthesizer', receiptId: solarisIds[3] || solarisIds[0] },
      ],
    });
  }

  // Thread 2: The Marylebone Coffee Routine (Monocle Cafe traces)
  const monocleIds = receipts
    .filter((r) => (r.location?.name && r.location.name.toLowerCase().includes('monocle')) || r.title.toLowerCase().includes('monocle'))
    .map((r) => r.id);
  if (monocleIds.length >= 2) {
    threads.push({
      id: 'THREAD-02',
      code: 'THREAD 02',
      title: 'THE MARYLEBONE RECURRENCE',
      editorialLabel: 'Weekend Routine',
      graphicUrl: monocleGraphic,
      themeColor: '#CFA04E',
      themeBg: 'rgba(207, 160, 78, 0.12)',
      patternType: 'Spatial Anchor & Habitual Cadence',
      patternCadence: 'Every 7.2 days on average · Morning anchor (08:35 - 09:15)',
      receiptIds: monocleIds,
      connections: connections.filter((c) => monocleIds.includes(c.from) && monocleIds.includes(c.to)),
      categoryTypes: Array.from(new Set(receipts.filter((r) => monocleIds.includes(r.id)).map((r) => r.type))),
      narrativeAnnotation: 'ROUTINE ANCHOR · 4 VISITS · PREFERRED CORNER TABLE',
      leadReceiptId: monocleIds[0],
      sequenceStages: [
        { stage: 'FIRST ENCOUNTER', description: 'Corner window table, Flat white & cinnamon bun', receiptId: monocleIds[0] },
        { stage: 'HABIT FORMATION', description: 'Return for architectural review and espresso', receiptId: monocleIds[1] || monocleIds[0] },
        { stage: 'RITUAL ANCHOR', description: 'Consistent pre-train stop before winter journeys', receiptId: monocleIds[2] || monocleIds[0] },
      ],
    });
  }

  // Thread 3: Ryuichi Sakamoto / Async Sound Thread
  const sakamotoIds = receipts
    .filter((r) => r.entities.some((e) => ['ryuichi sakamoto', 'async', 'vinyl', 'rough trade east'].includes(e.toLowerCase())))
    .map((r) => r.id);
  if (sakamotoIds.length >= 3) {
    threads.push({
      id: 'THREAD-03',
      code: 'THREAD 03',
      title: 'ASYNC: SOUND & LACQUER',
      editorialLabel: 'Sound & Lacquer',
      graphicUrl: tokyoGraphic,
      themeColor: '#8B78C2',
      themeBg: 'rgba(139, 120, 194, 0.12)',
      patternType: 'Tactile Medium Acquisition & Playback',
      patternCadence: 'Digital search → physical crate digging → vinyl stylus drop',
      receiptIds: sakamotoIds,
      connections: connections.filter((c) => sakamotoIds.includes(c.from) && sakamotoIds.includes(c.to)),
      categoryTypes: Array.from(new Set(receipts.filter((r) => sakamotoIds.includes(r.id)).map((r) => r.type))),
      narrativeAnnotation: 'QUERY → CRATE DIGGING → 2XLP ACQUISITION → PIANO DISINTEGRATION',
      leadReceiptId: sakamotoIds[0],
      sequenceStages: [
        { stage: 'ONLINE AUDIT', description: 'Search inventory for Async double vinyl edition', receiptId: sakamotoIds[0] },
        { stage: 'PHYSICAL ACQUISITION', description: 'Purchase at Rough Trade East under brewery neon', receiptId: sakamotoIds[1] || sakamotoIds[0] },
        { stage: 'HOMEPLAY', description: 'Listening to "andata" organ resonance late evening', receiptId: sakamotoIds[2] || sakamotoIds[0] },
      ],
    });
  }

  // Thread 4: The Daikanyama & Shibuya Architectural Traces
  const tokyoIds = receipts
    .filter((r) => r.location?.city === 'Tokyo' || r.entities.includes('Tokyo') || r.entities.includes('Shibuya'))
    .map((r) => r.id);
  if (tokyoIds.length >= 3) {
    threads.push({
      id: 'THREAD-04',
      code: 'THREAD 04',
      title: 'TOKYO METABOLISM & HORN SPEAKERS',
      editorialLabel: 'Tokyo Metabolism',
      graphicUrl: tokyoGraphic,
      themeColor: '#569CA6',
      themeBg: 'rgba(86, 156, 166, 0.12)',
      patternType: 'Cross-Continental Spatial Shift',
      patternCadence: 'Concentrated 48-hour metropolitan sequence',
      receiptIds: tokyoIds,
      connections: connections.filter((c) => tokyoIds.includes(c.from) && tokyoIds.includes(c.to)),
      categoryTypes: Array.from(new Set(receipts.filter((r) => tokyoIds.includes(r.id)).map((r) => r.type))),
      narrativeAnnotation: 'TSUTAYA BOOKS → ISOZAKI MONOGRAPH → JAZZ KISSA LION → SILENT LISTENING',
      leadReceiptId: tokyoIds[0],
      sequenceStages: [
        { stage: 'ARCHITECTURAL INTAKE', description: 'Daikanyama T-Site Tsutaya book procurement', receiptId: tokyoIds[0] },
        { stage: 'ACOUSTIC REFUGE', description: 'Lion Jazz Kissa massive horn speaker audition', receiptId: tokyoIds[1] || tokyoIds[0] },
        { stage: 'NIGHT DRIFT', description: 'Shibuya crossing reflections and field recording', receiptId: tokyoIds[2] || tokyoIds[0] },
      ],
    });
  }

  // Thread 5: The Kyoto Nocturne Cluster
  const kyotoIds = receipts
    .filter((r) => r.location?.city === 'Kyoto' || r.entities.includes('Kyoto'))
    .map((r) => r.id);
  if (kyotoIds.length >= 2) {
    threads.push({
      id: 'THREAD-05',
      code: 'THREAD 05',
      title: 'KYOTO SHIRAKAWA NOCTURNE',
      editorialLabel: 'Kyoto Nocturne',
      graphicUrl: kyotoGraphic,
      themeColor: '#4A7C59',
      themeBg: 'rgba(74, 124, 89, 0.12)',
      patternType: 'Nocturnal Contemplative Walk',
      patternCadence: 'Solitary canal exploration across twilight hours',
      receiptIds: kyotoIds,
      connections: connections.filter((c) => kyotoIds.includes(c.from) && kyotoIds.includes(c.to)),
      categoryTypes: Array.from(new Set(receipts.filter((r) => kyotoIds.includes(r.id)).map((r) => r.type))),
      narrativeAnnotation: 'GRAVEL SOUNDS → CANAL STONE BRIDGE → 35MM NOCTURNE → UKIYO-E LEAF',
      leadReceiptId: kyotoIds[0],
      sequenceStages: [
        { stage: 'CANAL CROSSING', description: 'Gion Shirakawa stone bridge footstep recordings', receiptId: kyotoIds[0] },
        { stage: 'DARKROOM CAPTURE', description: 'Lantern reflections exposed on 35mm film', receiptId: kyotoIds[1] || kyotoIds[0] },
      ],
    });
  }

  // Thread 6: The Seven Returns to Barbican
  const barbicanIds = receipts
    .filter((r) => (r.location?.name && r.location.name.toLowerCase().includes('barbican')) || r.title.toLowerCase().includes('barbican'))
    .map((r) => r.id);
  if (barbicanIds.length >= 4) {
    threads.push({
      id: 'THREAD-06',
      code: 'THREAD 06',
      title: 'SEVEN RETURNS TO THE CONCRETE',
      editorialLabel: 'The City Thread',
      graphicUrl: barbicanGraphic,
      themeColor: '#CFA04E',
      themeBg: 'rgba(207, 160, 78, 0.14)',
      patternType: 'Centripetal Spatial Attractor',
      patternCadence: '7 returns across 140 days · Median recurrence: 18 days',
      receiptIds: barbicanIds,
      connections: connections.filter((c) => barbicanIds.includes(c.from) && barbicanIds.includes(c.to)),
      categoryTypes: Array.from(new Set(receipts.filter((r) => barbicanIds.includes(r.id)).map((r) => r.type))),
      narrativeAnnotation: 'REPEATED SPATIAL ATTRACTOR · 7 RETURNS ACROSS 5 MONTHS',
      leadReceiptId: barbicanIds[0],
      sequenceStages: [
        { stage: 'CINEMATIC ENTRY', description: 'Solaris 35mm retrospective ticket in Cinema 1', receiptId: barbicanIds[0] },
        { stage: 'CONSERVATORY WALK', description: 'Ferns and tropical flora set against textured concrete', receiptId: barbicanIds[1] || barbicanIds[0] },
        { stage: 'ACOUSTIC SYMPOSIUM', description: 'Auditorium lecture on post-war architectural resonance', receiptId: barbicanIds[2] || barbicanIds[0] },
        { stage: 'SPRING RETURN', description: 'Seventh visit: midday sunlight cutting through the Silk Street towers', receiptId: barbicanIds[barbicanIds.length - 1] },
      ],
    });
  }

  // 5. Detect Chapters based on activity transitions and time spans
  const chapters: LifeChapter[] = [];

  // Chapter 1: The Arrival & Retrospective (November 2024)
  const ch1Receipts = receipts.filter(
    (r) => new Date(r.timestamp) <= new Date('2024-11-10T23:59:59Z')
  );
  if (ch1Receipts.length > 0) {
    chapters.push({
      id: 'CH-01',
      number: '01',
      title: 'THE RETROSPECTIVE',
      subtitle: 'Celluloid, concrete, and the sound of water',
      graphicUrl: solarisGraphic,
      period: {
        start: ch1Receipts[0].timestamp,
        end: ch1Receipts[ch1Receipts.length - 1].timestamp,
      },
      receiptCount: ch1Receipts.length,
      placeCount: new Set(ch1Receipts.map((r) => r.location?.name).filter(Boolean)).size,
      moments: moments.filter((m) => ch1Receipts.some((r) => m.receiptIds.includes(r.id))),
      receiptIds: ch1Receipts.map((r) => r.id),
      dominantCategories: ['movies', 'searches', 'photos', 'places', 'music'],
      pullQuote: 'SEARCH BECOMES CELLULOID.',
      editorialLead: 'The digital record begins not with grand intentions, but with a quiet query executed from a handheld terminal at Moorgate: "solaris 35mm screening london". Within forty-two minutes, a cardboard ticket was stamped at the Barbican box office, anchoring a sequence that bridged digital search to tactile celluloid.',
      narrativeParagraphs: [
        {
          heading: 'I. The Moorgate Convergence',
          body: 'On a mist-covered November afternoon, three seemingly disparate digital signals converged into physical reality. A search string typed on a handheld device near Moorgate immediately preceded a card transaction at the Barbican Cinema box office. The delta of 27 minutes demonstrates an uninterrupted intentional vector.',
          evidenceReceiptIds: ch1Receipts.slice(0, 3).map((r) => r.id),
          discoveredPattern: 'Zero-latency transition from digital intention to cultural admission.',
        },
        {
          heading: 'II. The Acoustic Envelope of Cinema 1',
          body: 'Inside the darkened auditorium, Andrei Tarkovsky’s 1972 35mm print unspooled. Eduard Artemyev’s hypnotic ANS synthesizer score mingled with the mechanical hum of the projector. The subsequent field memo noted the tactile presence of film grain against brutalist concrete walls.',
          evidenceReceiptIds: ch1Receipts.slice(3, 7).map((r) => r.id),
          discoveredPattern: 'Relational loop between acoustic observation and archival note taking.',
        },
      ],
    });
  }

  // Chapter 2: The Routine (Nov 11 - Dec 22, 2024)
  const ch2Receipts = receipts.filter(
    (r) =>
      new Date(r.timestamp) > new Date('2024-11-10T23:59:59Z') &&
      new Date(r.timestamp) <= new Date('2024-12-23T23:59:59Z')
  );
  if (ch2Receipts.length > 0) {
    chapters.push({
      id: 'CH-02',
      number: '02',
      title: 'THE ROUTINE',
      subtitle: 'Marylebone coffee, crate digging, and brutalist foliage',
      graphicUrl: monocleGraphic,
      period: {
        start: ch2Receipts[0].timestamp,
        end: ch2Receipts[ch2Receipts.length - 1].timestamp,
      },
      receiptCount: ch2Receipts.length,
      placeCount: new Set(ch2Receipts.map((r) => r.location?.name).filter(Boolean)).size,
      moments: moments.filter((m) => ch2Receipts.some((r) => m.receiptIds.includes(r.id))),
      receiptIds: ch2Receipts.map((r) => r.id),
      dominantCategories: ['places', 'purchases', 'music', 'events'],
      pullQuote: 'THE CITY REPEATS IN HABITS.',
      editorialLead: 'As late autumn turned toward December, the user’s trajectory settled into an unmistakable rhythmic geometry. Four morning visits to The Monocle Cafe in Marylebone established a spatial anchor, while weekend pilgrimages to East London record bins yielded tactile vinyl artifacts.',
      narrativeParagraphs: [
        {
          heading: 'I. The Marylebone Anchor',
          body: 'The card transactions at The Monocle Cafe reveal an unwavering pattern: flat whites, Swedish pastries, and architectural periodicals read from the corner window table. Every visit occurred between 08:30 and 09:15, proving that habit provides an architecture for conscious thought.',
          evidenceReceiptIds: ch2Receipts.filter((r) => r.title.toLowerCase().includes('monocle')).map((r) => r.id),
          discoveredPattern: 'Repetitive 7.2-day morning ritual in Marylebone.',
        },
        {
          heading: 'II. The Vinyl Hunt at Rough Trade',
          body: 'A query for Ryuichi Sakamoto’s Async culminated in an evening crate-digging trip to Brick Lane. The purchase slip for the 2xLP release was logged at 17:15, accompanied by an encrypted outgoing dispatch confirming the discovery.',
          evidenceReceiptIds: ch2Receipts.filter((r) => r.entities.some((e) => ['vinyl', 'sakamoto', 'async'].includes(e.toLowerCase()))).map((r) => r.id),
          discoveredPattern: 'Complete artifact journey: Search → Crate Search → Physical Acquisition → Late Night Playback.',
        },
      ],
    });
  }

  // Chapter 3: The Gap & The Shift (Dec 23, 2024 - Feb 28, 2025)
  const ch3Receipts = receipts.filter(
    (r) =>
      new Date(r.timestamp) > new Date('2024-12-23T23:59:59Z') &&
      new Date(r.timestamp) <= new Date('2025-02-28T23:59:59Z')
  );
  if (ch3Receipts.length > 0) {
    chapters.push({
      id: 'CH-03',
      number: '03',
      title: 'THE SHIFT & SILENCE',
      subtitle: '47 days of winter stillness followed by Tokyo & Kyoto',
      graphicUrl: kyotoGraphic,
      period: {
        start: ch3Receipts[0].timestamp,
        end: ch3Receipts[ch3Receipts.length - 1].timestamp,
      },
      receiptCount: ch3Receipts.length,
      placeCount: new Set(ch3Receipts.map((r) => r.location?.name).filter(Boolean)).size,
      moments: moments.filter((m) => ch3Receipts.some((r) => m.receiptIds.includes(r.id))),
      receiptIds: ch3Receipts.map((r) => r.id),
      dominantCategories: ['places', 'purchases', 'notes', 'photos'],
      pullQuote: '47 DAYS OF STILLNESS.',
      editorialLead: 'Between late December and mid-February, the ledger records a striking phenomenon: 47 consecutive days with zero logged commercial transactions. This temporal vacuum broke abruptly with a trans-continental relocation to Tokyo and Kyoto, where the pace of archival generation tripled.',
      narrativeParagraphs: [
        {
          heading: 'I. The Winter Vacuum',
          body: 'A digital silence lasting 47 days represents the longest archival hiatus in the entire dataset. In contrast to algorithmic models that extrapolate noise, this silence is treated here as concrete historical reality: an intentional period of offline contemplation.',
          evidenceReceiptIds: ch3Receipts.slice(0, 2).map((r) => r.id),
          discoveredPattern: '47-day stillness window separating the London routine from the Japan voyage.',
        },
        {
          heading: 'II. Tokyo Metabolism & Kyoto Nocturnes',
          body: 'When the ledger resumed, it exploded with new coordinates. From the Daikanyama Tsutaya architecture bookshelves to the acoustic silence of Shibuya’s Lion Jazz Kissa, the user tracked spatial acoustics across Tokyo before traveling south to walk the lamp-lit stone bridges of Gion Shirakawa.',
          evidenceReceiptIds: ch3Receipts.filter((r) => r.location?.city === 'Tokyo' || r.location?.city === 'Kyoto').map((r) => r.id),
          discoveredPattern: 'High-density cultural burst across Tokyo and Kyoto.',
        },
      ],
    });
  }

  // Chapter 4: The Return (March 2025 onwards)
  const ch4Receipts = receipts.filter(
    (r) => new Date(r.timestamp) > new Date('2025-02-28T23:59:59Z')
  );
  if (ch4Receipts.length > 0) {
    chapters.push({
      id: 'CH-04',
      number: '04',
      title: 'THE SEVENTH RETURN',
      subtitle: 'Spring light penetrating the concrete shafts',
      graphicUrl: barbicanGraphic,
      period: {
        start: ch4Receipts[0].timestamp,
        end: ch4Receipts[ch4Receipts.length - 1].timestamp,
      },
      receiptCount: ch4Receipts.length,
      placeCount: new Set(ch4Receipts.map((r) => r.location?.name).filter(Boolean)).size,
      moments: moments.filter((m) => ch4Receipts.some((r) => m.receiptIds.includes(r.id))),
      receiptIds: ch4Receipts.map((r) => r.id),
      dominantCategories: ['places', 'notes', 'music'],
      pullQuote: 'THE SAME PLACE, ALTERED.',
      editorialLead: 'Returning to London in the spring of 2025, the user’s steps navigated back to the Barbican Centre for a seventh documented visit. The space had not changed, yet the perspective of the observer was permanently shifted by the intervening journey.',
      narrativeParagraphs: [
        {
          heading: 'I. The Invariant Attractor',
          body: 'Seven distinct visits across five months confirm the Barbican Estate as the primary spatial attractor of the user’s life data. Whether for 35mm film, brutalist conservatory botany, acoustic symposia, or quiet reflection by the lake, the coordinate 51.5207° N, -0.0936° W exerts an unyielding gravity.',
          evidenceReceiptIds: ch4Receipts.map((r) => r.id),
          discoveredPattern: '7 returns to the Barbican: The invariant spatial center of gravity.',
        },
      ],
    });
  }

  // 6. Detect Discoveries
  // 6a. Longest Gap
  let maxGapDays = 0;
  let gapFrom: LifeReceipt = receipts[0];
  let gapTo: LifeReceipt = receipts[1] || receipts[0];

  for (let i = 0; i < receipts.length - 1; i++) {
    const tA = new Date(receipts[i].timestamp).getTime();
    const tB = new Date(receipts[i + 1].timestamp).getTime();
    const diffDays = Math.round((tB - tA) / (1000 * 60 * 60 * 24));
    if (diffDays > maxGapDays) {
      maxGapDays = diffDays;
      gapFrom = receipts[i];
      gapTo = receipts[i + 1];
    }
  }

  // 6b. Most Repeated Place
  const placeFreq: Record<string, { count: number; ids: string[]; city: string; coords?: [number, number] }> = {};
  receipts.forEach((r) => {
    if (r.location?.name) {
      const p = r.location.name;
      if (!placeFreq[p]) {
        placeFreq[p] = { count: 0, ids: [], city: r.location.city, coords: r.location.coordinates };
      }
      placeFreq[p].count += 1;
      placeFreq[p].ids.push(r.id);
    }
  });

  const sortedPlaces = Object.entries(placeFreq).sort((a, b) => b[1].count - a[1].count);
  const topPlace = sortedPlaces[0];

  // 6c. Most Connected Moment (nexus)
  const sortedMoments = [...moments].sort((a, b) => b.receipts.length - a.receipts.length);
  const peakMoment = sortedMoments[0] || null;

  const discoveries: LifeDiscovery[] = [];

  if (topPlace) {
    discoveries.push({
      id: 'DISC-01',
      type: 'REPETITION',
      title: 'THE SPATIAL ATTRACTOR',
      stat: `${topPlace[1].count}`,
      label: 'RETURNS',
      receiptIds: topPlace[1].ids,
      description: `You returned to ${topPlace[0]} ${topPlace[1].count} times across multiple seasons.`,
      why: ['LOCATION RECURRENCE', 'HABITUAL ANCHOR', 'TEMPORAL DRIFT'],
      confidence: 'STRONG',
    });
  }

  if (maxGapDays >= 10) {
    discoveries.push({
      id: 'DISC-02',
      type: 'GAP',
      title: 'THE ARCHIVAL STILLNESS',
      stat: `${maxGapDays}`,
      label: 'DAYS GAP',
      receiptIds: [gapFrom.id, gapTo.id],
      description: `Complete digital silence between ${new Date(gapFrom.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} and ${new Date(gapTo.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
      why: ['ZERO DIGITAL EMISSIONS', 'SEASONAL HIATUS', 'OFF-GRID INTERVAL'],
      confidence: 'STRONG',
    });
  }

  if (peakMoment) {
    discoveries.push({
      id: 'DISC-03',
      type: 'CONNECTED_MOMENT',
      title: 'THE HIGH-DENSITY NEXUS',
      stat: `${peakMoment.receipts.length}`,
      label: 'CONVERGENT TRACES',
      receiptIds: peakMoment.receiptIds,
      description: `${peakMoment.receipts.length} distinct life events across multiple categories unfolded within ${peakMoment.durationMinutes} minutes.`,
      why: ['CROSS-CATEGORY SYNCHRONICITY', 'HIGH CONTEXT DENSITY', 'TEMPORAL PROXIMITY'],
      confidence: 'STRONG',
    });
  }

  // Sequence Discovery
  const sequenceConns = connections.filter((c) => c.type === 'SEQUENCE');
  if (sequenceConns.length > 0) {
    const seq = sequenceConns[0];
    discoveries.push({
      id: 'DISC-04',
      type: 'SEQUENCE',
      title: 'SEARCH → ACTION CASSETTE',
      stat: '→',
      label: 'SEQUENCE FOUND',
      receiptIds: [seq.from, seq.to],
      description: 'An intent search directly materialized into a physical location check-in and transaction within hours.',
      why: ['INTENT CONVERSION', 'COGNITIVE TO PHYSICAL', 'DETERMINISTIC LINK'],
      confidence: 'STRONG',
    });
  }

  // 7. Calculate Category Relationship Matrix (9x9)
  const categoryRelationships: CategoryRelationship[] = [];
  const matrix: Record<string, Record<string, number>> = {};

  CATEGORIES.forEach((c1) => {
    matrix[c1] = {};
    CATEGORIES.forEach((c2) => {
      matrix[c1][c2] = 0;
    });
  });

  connections.forEach((conn) => {
    const rFrom = receipts.find((r) => r.id === conn.from);
    const rTo = receipts.find((r) => r.id === conn.to);
    if (rFrom && rTo) {
      matrix[rFrom.type][rTo.type] = (matrix[rFrom.type][rTo.type] || 0) + 1;
      if (rFrom.type !== rTo.type) {
        matrix[rTo.type][rFrom.type] = (matrix[rTo.type][rFrom.type] || 0) + 1;
      }
    }
  });

  CATEGORIES.forEach((c1) => {
    CATEGORIES.forEach((c2) => {
      categoryRelationships.push({
        sourceCategory: c1,
        targetCategory: c2,
        count: matrix[c1][c2] || 0,
      });
    });
  });

  // 8. Calculate Activity by Hour (0..23) and Day of Week (0..6)
  const activityByHour = new Array(24).fill(0);
  const activityByDayOfWeek = new Array(7).fill(0);

  receipts.forEach((r) => {
    const d = new Date(r.timestamp);
    const hour = d.getUTCHours();
    const day = d.getUTCDay();
    activityByHour[hour] += 1;
    activityByDayOfWeek[day] += 1;
  });

  // 9. Entity frequencies
  const entityMap: Record<string, { count: number; category: TraceCategory }> = {};
  receipts.forEach((r) => {
    r.entities.forEach((ent) => {
      if (!entityMap[ent]) {
        entityMap[ent] = { count: 0, category: r.type };
      }
      entityMap[ent].count += 1;
    });
  });

  const entityCounts = Object.entries(entityMap)
    .map(([name, data]) => ({ name, count: data.count, category: data.category }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // 10. Place counts with coordinates
  const placeCounts = sortedPlaces.map(([name, d]) => ({
    name,
    count: d.count,
    coordinates: d.coords,
    city: d.city,
  }));

  return {
    receipts,
    connections,
    moments,
    threads,
    chapters,
    discoveries,
    categoryRelationships,
    activityByHour,
    activityByDayOfWeek,
    entityCounts,
    placeCounts,
    longestGap:
      maxGapDays > 0
        ? {
            days: maxGapDays,
            fromReceipt: gapFrom,
            toReceipt: gapTo,
          }
        : null,
    mostConnectedMoment: peakMoment,
    totalTraces: receipts.length,
    dateRange: {
      start: receipts[0]?.timestamp || new Date().toISOString(),
      end: receipts[receipts.length - 1]?.timestamp || new Date().toISOString(),
    },
  };
}
