import type { InstrumentConfig, TuningPreset } from '$lib/instruments/types.js';
import { GUITAR_CONFIG } from '$lib/instruments/guitar.js';
import { BANJO_CONFIG } from '$lib/instruments/banjo.js';
import { GUITAR_STANDARD, getTuningsForInstrument, getTuningById } from '$lib/instruments/tunings.js';

export const ALL_INSTRUMENTS: InstrumentConfig[] = [GUITAR_CONFIG, BANJO_CONFIG];

class InstrumentState {
	instrument = $state<InstrumentConfig>(GUITAR_CONFIG);
	tuning = $state<TuningPreset>(GUITAR_STANDARD);
	capoFret = $state(0);

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
	}

	setTuning(id: string) {
		const t = getTuningById(id);
		if (t) this.tuning = t;
	}

	setCapo(fret: number) {
		this.capoFret = Math.max(0, Math.min(12, Math.round(fret)));
	}
}

export const instrumentState = new InstrumentState();
