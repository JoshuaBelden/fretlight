import type { InstrumentConfig, TuningPreset } from '$lib/instruments/types.js';
import { GUITAR_CONFIG } from '$lib/instruments/guitar.js';
import { BANJO_CONFIG } from '$lib/instruments/banjo.js';
import { GUITAR_STANDARD, getTuningsForInstrument, getTuningById } from '$lib/instruments/tunings.js';

export const ALL_INSTRUMENTS: InstrumentConfig[] = [GUITAR_CONFIG, BANJO_CONFIG];

class InstrumentState {
	instrument = $state<InstrumentConfig>(GUITAR_CONFIG);
	tuning = $state<TuningPreset>(GUITAR_STANDARD);
	capoFret = $state(0);

	constructor() {
		try {
			const savedInstrumentId = localStorage.getItem('instrumentId');
			if (savedInstrumentId) {
				const instr = ALL_INSTRUMENTS.find((i) => i.id === savedInstrumentId);
				if (instr) this.instrument = instr;
			}
			const savedTuningId = localStorage.getItem('tuningId');
			if (savedTuningId) {
				const tuning = getTuningById(savedTuningId);
				if (tuning) this.tuning = tuning;
			}
		} catch {}
	}

	get availableTunings(): TuningPreset[] {
		return getTuningsForInstrument(this.instrument.id);
	}

	setInstrument(id: string) {
		const instr = ALL_INSTRUMENTS.find((i) => i.id === id);
		if (!instr) return;
		this.instrument = instr;
		// Auto-select the default tuning for the new instrument
		const defaultTuning = getTuningById(instr.defaultTuningId);
		if (defaultTuning) this.tuning = defaultTuning;
		// Reset capo
		this.capoFret = 0;
		try {
			localStorage.setItem('instrumentId', id);
			localStorage.setItem('tuningId', instr.defaultTuningId);
		} catch {}
	}

	setTuning(id: string) {
		const t = getTuningById(id);
		if (t) this.tuning = t;
		try {
			localStorage.setItem('tuningId', id);
		} catch {}
	}

	setCapo(fret: number) {
		this.capoFret = Math.max(0, Math.min(12, Math.round(fret)));
	}
}

export const instrumentState = new InstrumentState();
