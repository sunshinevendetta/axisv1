"use client";
import { useRef, useState } from 'react';
import PrismBackground from '@/components/backgrounds/PrismBackground';

const RECORD_SECONDS = 15;

function RecordablePlayer({
  width,
  height,
  label,
}: {
  width: number;
  height: number;
  label: string;
}) {
  const shaderRef = useRef<HTMLDivElement>(null);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const startRecording = () => {
    // Source: the shader canvas at whatever size it's actually rendering
    const srcCanvas = shaderRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!srcCanvas) {
      alert('Canvas not found.');
      return;
    }

    // Target: hidden full-res canvas we copy into each frame
    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = width;
    dstCanvas.height = height;
    const ctx = dstCanvas.getContext('2d')!;

    // Record from the full-res destination canvas
    const stream = dstCanvas.captureStream(60);
    const chunks: BlobPart[] = [];
    const mimeType =
      ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
        .find((t) => MediaRecorder.isTypeSupported(t)) ?? 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 16_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(rafId);
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prismatic-${width}x${height}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setRecording(false);
      setProgress(0);
    };

    // Every animation frame: copy shader canvas → upscale into recording canvas
    let rafId: number;
    const copyFrame = () => {
      ctx.drawImage(srcCanvas, 0, 0, width, height);
      rafId = requestAnimationFrame(copyFrame);
    };
    rafId = requestAnimationFrame(copyFrame);

    recorder.start();
    setRecording(true);
    setProgress(0);

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min(elapsed / (RECORD_SECONDS * 1000), 1));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      recorder.stop();
    }, RECORD_SECONDS * 1000);
  };

  // Preview: 300px wide, correct aspect ratio
  const PREVIEW_W = 300;
  const previewH = Math.round((height / width) * PREVIEW_W);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>

      {/* Preview box — shader renders here at real screen size, no upscaling */}
      <div
        ref={shaderRef}
        style={{
          width: PREVIEW_W,
          height: previewH,
          position: 'relative',
          borderRadius: 10,
          overflow: 'hidden',
          border: recording
            ? '2px solid rgba(208, 221, 238, 0.82)'
            : '1px solid rgba(255,255,255,0.15)',
          boxShadow: recording ? '0 0 24px rgba(148, 163, 184, 0.24)' : 'none',
          transition: 'border 0.2s, box-shadow 0.2s',
        }}
      >
        <PrismBackground />

        {recording && (
          <div style={{
            position: 'absolute',
            top: 8,
            left: 10,
            fontSize: 11,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            zIndex: 10,
            textShadow: '0 0 6px black',
          }}>
            <span style={{
              width: 7, height: 7,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(240,244,248,0.98), rgba(149,170,198,0.92))',
              display: 'inline-block',
              animation: 'blink 1s infinite',
            }} />
            REC {Math.round(progress * RECORD_SECONDS)}s / {RECORD_SECONDS}s
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{
        width: PREVIEW_W,
        height: 4,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          background: recording ? 'linear-gradient(90deg, rgba(241,245,249,0.96), rgba(148,163,184,0.92))' : 'transparent',
          borderRadius: 99,
          transition: 'width 0.1s linear',
        }} />
      </div>

      <div style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>

      <button
        onClick={startRecording}
        disabled={recording}
        style={{
          padding: '9px 24px',
          background: recording
            ? 'rgba(255,255,255,0.06)'
            : 'linear-gradient(135deg, rgba(244,247,251,0.96), rgba(173,186,204,0.86))',
          color: recording ? 'rgba(255,255,255,0.25)' : 'black',
          border: recording ? 'none' : '1px solid rgba(219, 228, 242, 0.35)',
          borderRadius: 999,
          fontWeight: 700,
          fontSize: 13,
          cursor: recording ? 'not-allowed' : 'pointer',
          letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}
      >
        {recording ? 'Recording…' : '⏺  Record 15s'}
      </button>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

export default function PurePrismRecord() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 48,
      padding: '60px 40px',
    }}>
      <div style={{
        color: 'white',
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: '0.2em',
        opacity: 0.5,
        textTransform: 'uppercase',
      }}>
        Prismatic Burst — Export
      </div>

      <div style={{
        display: 'flex',
        gap: 48,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <RecordablePlayer width={1920} height={1080} label="1920 × 1080 — Landscape" />
        <RecordablePlayer width={1080} height={1920} label="1080 × 1920 — Portrait" />
      </div>
    </div>
  );
}
