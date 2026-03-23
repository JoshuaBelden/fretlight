import type { FretPosition } from '$lib/instruments/types.js';

class PracticeState {
	isActive = $state(false);
	runSequence = $state<FretPosition[]>([]);
	currentIndex = $state(0);
	countInRemaining = $state(0);
	isPlaying = $state(false);
	complexity = $state(3);
	variant = $state(0);
	previousBpm = $state(120);

	get currentPosition(): FretPosition | null {
		if (!this.isActive || this.currentIndex >= this.runSequence.length) return null;
		return this.runSequence[this.currentIndex];
	}

	get nextPosition(): FretPosition | null {
		if (!this.isActive || this.currentIndex + 1 >= this.runSequence.length) return null;
		return this.runSequence[this.currentIndex + 1];
	}

	get totalNotes(): number {
		return this.runSequence.length;
	}

	get isComplete(): boolean {
		return this.currentIndex >= this.runSequence.length - 1;
	}

	activate(sequence: FretPosition[], savedBpm: number) {
		this.runSequence = sequence;
		this.currentIndex = 0;
		this.countInRemaining = 0;
		this.isPlaying = false;
		this.isActive = true;
		this.previousBpm = savedBpm;
	}

	deactivate() {
		this.isActive = false;
		this.isPlaying = false;
		this.runSequence = [];
		this.currentIndex = 0;
		this.countInRemaining = 0;
	}

	begin() {
		this.currentIndex = 0;
		this.countInRemaining = 4;
		this.isPlaying = true;
	}

	advance(): boolean {
		if (this.countInRemaining > 0) {
			this.countInRemaining--;
			return false; // still counting in
		}
		if (this.currentIndex < this.runSequence.length - 1) {
			this.currentIndex++;
			return true;
		}
		// Run complete
		this.isPlaying = false;
		return false;
	}

	back() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
		}
	}

	pause() {
		this.isPlaying = false;
	}

	resume() {
		if (this.isActive && !this.isComplete) {
			this.countInRemaining = 0;
			this.isPlaying = true;
		}
	}

	reset() {
		this.currentIndex = 0;
		this.isPlaying = false;
		this.countInRemaining = 0;
	}

	setComplexity(n: number) {
		this.complexity = Math.max(1, Math.min(5, n));
	}

	regenerate() {
		this.variant++;
	}
}

export const practiceState = new PracticeState();
