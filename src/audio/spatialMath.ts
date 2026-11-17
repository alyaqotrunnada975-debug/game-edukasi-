import { LocationId } from '../types/game';

export type SpatialSoundKind = 'wind' | 'water' | 'waterfall' | 'jungle' | 'chime';

export interface SpatialSoundSource {
  id: string;
  kind: SpatialSoundKind;
  position: [number, number, number];
  refDistance: number;
  maxDistance: number;
  baseVolume: number;
  label: string;
}

export interface SpatialAttenuationResult {
  distance: number;
  gainFactor: number;
  pan: number;
}

/**
 * Pure 3D spatial distance attenuation + camera-relative stereo panning.
 * Fades smoothly to 0 beyond maxDistance and reaches 1 inside refDistance.
 */
export function computeSpatialAttenuation(
  listenerPos: [number, number, number],
  listenerYaw: number,
  sourcePos: [number, number, number],
  refDistance: number,
  maxDistance: number,
): SpatialAttenuationResult {
  const dx = sourcePos[0] - listenerPos[0];
  const dy = sourcePos[1] - listenerPos[1];
  const dz = sourcePos[2] - listenerPos[2];
  const distance = Math.hypot(dx, dy, dz);

  let gainFactor = 0;
  if (distance <= refDistance) {
    gainFactor = 1;
  } else if (distance < maxDistance) {
    const span = Math.max(0.001, maxDistance - refDistance);
    const t = Math.min(1, Math.max(0, (distance - refDistance) / span));
    // Smooth cosine-like quadratic ease-out rolloff
    const smooth = 1 - t;
    gainFactor = smooth * smooth;
  }

  // Camera right vector matches ExploreScene3D: _camRight = (cos(yaw), 0, -sin(yaw))
  const rightX = Math.cos(listenerYaw);
  const rightZ = -Math.sin(listenerYaw);
  const horizDist = Math.max(0.6, Math.hypot(dx, dz));
  const rawPan = (dx * rightX + dz * rightZ) / horizDist;
  const pan = Math.max(-0.92, Math.min(0.92, rawPan));

  return { distance, gainFactor, pan };
}

/**
 * Spatial coordinates matched directly to each location's 3D landmarks and water/foliage props.
 */
export function getLocationSpatialSources(locationId: LocationId): SpatialSoundSource[] {
  switch (locationId) {
    case 'benteng-kuto-besak':
      return [
        {
          id: 'bkb-waterfall',
          kind: 'waterfall',
          position: [9.5, 1.0, -6.5],
          refDistance: 2.8,
          maxDistance: 13.0,
          baseVolume: 0.34,
          label: 'Air Terjun Tebing Kanan',
        },
        {
          id: 'bkb-fortress-wind',
          kind: 'wind',
          position: [0, 2.2, -8.8],
          refDistance: 3.4,
          maxDistance: 14.5,
          baseVolume: 0.28,
          label: 'Angin Bastion Benteng',
        },
        {
          id: 'bkb-gazebo-jungle',
          kind: 'jungle',
          position: [-8.8, 1.2, -4.5],
          refDistance: 2.6,
          maxDistance: 11.8,
          baseVolume: 0.22,
          label: 'Rimbun Pepohonan Barat',
        },
      ];
    case 'museum-smb2':
      return [
        {
          id: 'smb-bronze-chime',
          kind: 'chime',
          position: [0, 1.8, -8.8],
          refDistance: 3.0,
          maxDistance: 13.0,
          baseVolume: 0.24,
          label: 'Gema Serambi Museum',
        },
        {
          id: 'smb-courtyard-wind',
          kind: 'wind',
          position: [-8.5, 1.4, -3.5],
          refDistance: 2.8,
          maxDistance: 12.5,
          baseVolume: 0.24,
          label: 'Semilir Angin Pelataran',
        },
        {
          id: 'smb-garden-birds',
          kind: 'jungle',
          position: [6.8, 1.0, 2.8],
          refDistance: 2.4,
          maxDistance: 11.0,
          baseVolume: 0.22,
          label: 'Kicau Burung Taman Museum',
        },
      ];
    case 'jembatan-ampera':
      return [
        {
          id: 'amp-musi-water',
          kind: 'water',
          position: [0, 0.2, -10.5],
          refDistance: 3.8,
          maxDistance: 15.2,
          baseVolume: 0.38,
          label: 'Aliran Sungai Musi',
        },
        {
          id: 'amp-bridge-wind',
          kind: 'wind',
          position: [0, 2.5, -8.8],
          refDistance: 3.4,
          maxDistance: 14.5,
          baseVolume: 0.3,
          label: 'Angin Menara Ampera',
        },
        {
          id: 'amp-gazebo-trees',
          kind: 'jungle',
          position: [-9.0, 1.2, -4.5],
          refDistance: 2.6,
          maxDistance: 11.0,
          baseVolume: 0.2,
          label: 'Pepohonan Tepi Dermaga',
        },
      ];
    case 'pulau-kemaro':
      return [
        {
          id: 'kmr-lotus-water',
          kind: 'water',
          position: [7.6, 0.2, -4.2],
          refDistance: 3.2,
          maxDistance: 13.5,
          baseVolume: 0.34,
          label: 'Riak Kolam Teratai',
        },
        {
          id: 'kmr-pagoda-chime',
          kind: 'chime',
          position: [0, 2.2, -8.8],
          refDistance: 3.2,
          maxDistance: 13.8,
          baseVolume: 0.28,
          label: 'Lonceng Angin Pagoda',
        },
        {
          id: 'kmr-wetland-jungle',
          kind: 'jungle',
          position: [-8.5, 1.0, -2.5],
          refDistance: 2.8,
          maxDistance: 12.0,
          baseVolume: 0.24,
          label: 'Suara Alam Rawa Kemaro',
        },
      ];
    case 'rumah-limas':
      return [
        {
          id: 'lms-breeze',
          kind: 'wind',
          position: [0, 1.8, -8.8],
          refDistance: 3.2,
          maxDistance: 13.5,
          baseVolume: 0.26,
          label: 'Angin Bawah Rumah Panggung',
        },
        {
          id: 'lms-village-garden',
          kind: 'jungle',
          position: [7.5, 1.1, 1.2],
          refDistance: 2.8,
          maxDistance: 12.5,
          baseVolume: 0.26,
          label: 'Taman Desa Sumatera',
        },
        {
          id: 'lms-left-jar-chime',
          kind: 'chime',
          position: [-7.0, 1.0, -4.4],
          refDistance: 2.4,
          maxDistance: 10.5,
          baseVolume: 0.18,
          label: 'Gemericik Serambi Kayu',
        },
      ];
    case 'taman-purbakala':
    default:
      return [
        {
          id: 'prb-candi-wind',
          kind: 'wind',
          position: [0, 2.1, -8.8],
          refDistance: 3.5,
          maxDistance: 14.5,
          baseVolume: 0.3,
          label: 'Angin Reruntuhan Candi',
        },
        {
          id: 'prb-ancient-chime',
          kind: 'chime',
          position: [-7.4, 1.3, -4.0],
          refDistance: 2.8,
          maxDistance: 12.0,
          baseVolume: 0.24,
          label: 'Gema Prasasti Batu',
        },
        {
          id: 'prb-forest-jungle',
          kind: 'jungle',
          position: [8.0, 1.2, 1.2],
          refDistance: 2.8,
          maxDistance: 12.2,
          baseVolume: 0.24,
          label: 'Rimbun Hutan Karanganyar',
        },
      ];
  }
}
