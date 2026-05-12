"use client";

import { useSyncExternalStore } from "react";

const AUDIO_REACTIVE_BINS = 16;
const AUDIO_REACTIVE_LERP = 0.18;

export type AudioReactiveState = {
  ready: boolean;
  playing: boolean;
  connected: boolean;
  rms: number;
  peak: number;
  bass: number;
  mid: number;
  high: number;
  fft: number[];
};

const DEFAULT_AUDIO_REACTIVE_STATE: AudioReactiveState = {
  ready: false,
  playing: false,
  connected: false,
  rms: 0,
  peak: 0,
  bass: 0,
  mid: 0,
  high: 0,
  fft: new Array(AUDIO_REACTIVE_BINS).fill(0),
};

let currentState = DEFAULT_AUDIO_REACTIVE_STATE;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function blendBins(previous: number[], next: number[], amount: number) {
  return next.map((value, index) => lerp(previous[index] ?? 0, value, amount));
}

export function getAudioReactiveState() {
  return currentState;
}

export function useAudioReactiveState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentState,
    () => DEFAULT_AUDIO_REACTIVE_STATE,
  );
}

export function resetAudioReactiveState() {
  currentState = DEFAULT_AUDIO_REACTIVE_STATE;
  emit();
}

function summarizeBins(data: ArrayLike<number>) {
  const fft = new Array(AUDIO_REACTIVE_BINS).fill(0);
  const chunkSize = Math.max(1, Math.floor(data.length / AUDIO_REACTIVE_BINS));

  for (let i = 0; i < AUDIO_REACTIVE_BINS; i += 1) {
    const start = i * chunkSize;
    const end = i === AUDIO_REACTIVE_BINS - 1 ? data.length : Math.min(data.length, start + chunkSize);
    if (start >= data.length) {
      fft[i] = 0;
      continue;
    }

    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j += 1) {
      sum += data[j] / 255;
      count += 1;
    }
    fft[i] = count > 0 ? sum / count : 0;
  }

  const bandAverage = (from: number, to: number) => {
    const start = Math.max(0, Math.min(AUDIO_REACTIVE_BINS - 1, from));
    const end = Math.max(start + 1, Math.min(AUDIO_REACTIVE_BINS, to));
    const slice = fft.slice(start, end);
    return slice.reduce((acc, value) => acc + value, 0) / Math.max(1, slice.length);
  };

  const rms = Math.sqrt(
    fft.reduce((acc, value) => acc + value * value, 0) / Math.max(1, fft.length),
  );
  const peak = fft.reduce((max, value) => Math.max(max, value), 0);

  return {
    fft,
    rms,
    peak,
    bass: bandAverage(0, 4),
    mid: bandAverage(4, 10),
    high: bandAverage(10, 16),
  };
}

export function updateAudioReactiveState(data: ArrayLike<number>, options: { playing: boolean; ready: boolean }) {
  const summary = summarizeBins(data);
  const smoothing = options.playing ? AUDIO_REACTIVE_LERP : 0.08;
  const next = {
    ready: options.ready,
    playing: options.playing,
    connected: true,
    rms: lerp(currentState.rms, summary.rms, smoothing),
    peak: lerp(currentState.peak, summary.peak, smoothing),
    bass: lerp(currentState.bass, summary.bass, smoothing),
    mid: lerp(currentState.mid, summary.mid, smoothing),
    high: lerp(currentState.high, summary.high, smoothing),
    fft: blendBins(currentState.fft, summary.fft, smoothing),
  };

  currentState = next;
  emit();
  return next;
}
