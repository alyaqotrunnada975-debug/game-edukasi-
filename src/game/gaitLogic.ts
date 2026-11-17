import { SpriteAction } from '../types/game';

export interface GaitEvaluationInput {
  playerY: number;
  currentSpeed: number;
  hasMovementInput: boolean;
  isRunning: boolean;
  walkPhase: number;
}

/**
 * Computes crisp stride animation using only intact, uncut artist-drawn locomotion poses
 * ('jalan' <-> 'lari') while walking/running, and snaps immediately to 'idle' ready stance
 * ("posisi siap") when movement input stops.
 */
export function selectGaitAction(input: GaitEvaluationInput): SpriteAction {
  const { playerY, currentSpeed, hasMovementInput, isRunning, walkPhase } = input;

  if (playerY > 0.08) {
    return 'lompat';
  }

  // Snap immediately into upright ready stance when player releases movement controls
  const activelyStepping = hasMovementInput ? currentSpeed > 0.14 : currentSpeed > 1.35;
  if (!activelyStepping) {
    return 'idle';
  }

  const normalized = ((walkPhase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

  if (isRunning) {
    // High-energy run cycle: primarily lifted stride ('lari') pulsing with contact ('jalan')
    return normalized < Math.PI * 1.3 ? 'lari' : 'jalan';
  }

  // Smooth walk cycle alternating contact ('jalan') and passing lift ('lari') without slicing legs
  return normalized < Math.PI * 1.2 ? 'jalan' : 'lari';
}
