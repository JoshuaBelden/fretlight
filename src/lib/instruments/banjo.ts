import type { InstrumentConfig } from './types.js';

export const BANJO_CONFIG: InstrumentConfig = {
	id: 'banjo',
	name: '5-String Banjo',
	stringCount: 5,
	fretCount: 22,
	defaultTuningId: 'banjo-open-g',
	inlayFrets: [3, 5, 7, 10, 15, 17, 19, 22],
	doubleInlayFrets: [12]
};
