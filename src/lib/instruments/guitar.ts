import type { InstrumentConfig } from './types.js';

export const GUITAR_CONFIG: InstrumentConfig = {
	id: 'guitar',
	name: 'Guitar',
	stringCount: 6,
	fretCount: 22,
	defaultTuningId: 'guitar-standard',
	inlayFrets: [3, 5, 7, 9, 15, 17, 19, 21],
	doubleInlayFrets: [12]
};
