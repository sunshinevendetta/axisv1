"use client";
export default function VideoBackground() {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden" style={{ background: "black" }}>
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover hidden md:block" onEnded={e => (e.target as HTMLVideoElement).play()}>
        <source src="/video/backgrounds/membershipbg.webm" type="video/webm" />
        <source src="/video/backgrounds/membershipbg.mp4" type="video/mp4" />
      </video>
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover block md:hidden" onEnded={e => (e.target as HTMLVideoElement).play()}>
        <source src="/video/backgrounds/membershipbgv.webm" type="video/webm" />
        <source src="/video/backgrounds/membershipbgv.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
