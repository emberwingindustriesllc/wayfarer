'use client';

import React, { useState, useEffect } from 'react';

interface WayfarerAvatarProps {
  isWalking?: boolean;
  faith?: number;
  wisdom?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showAura?: boolean;
}

export const WayfarerAvatar: React.FC<WayfarerAvatarProps> = ({
  isWalking = false,
  faith = 10,
  wisdom = 0,
  size = 'md',
  className = '',
  showAura = true
}) => {
  const [frame, setFrame] = useState(0);

  // 4-frame fluid walking cycle
  useEffect(() => {
    if (!isWalking) {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 140);
    return () => clearInterval(interval);
  }, [isWalking]);

  // Size dimensions
  const dimensions = {
    sm: { w: 48, h: 68 },
    md: { w: 68, h: 96 },
    lg: { w: 92, h: 130 }
  }[size];

  // Walking mechanics calculations
  const bobY = isWalking ? (frame % 2 === 1 ? 3 : 0) : 0;
  const leftLegRot = isWalking ? (frame === 0 ? 22 : frame === 1 ? 5 : frame === 2 ? -20 : -5) : 0;
  const rightLegRot = isWalking ? (frame === 0 ? -22 : frame === 1 ? -5 : frame === 2 ? 20 : 5) : 0;
  const staffRot = isWalking ? (frame === 0 ? -12 : frame === 1 ? 4 : frame === 2 ? 15 : -4) : 0;
  const lanternRot = isWalking ? (frame === 0 ? 16 : frame === 1 ? 4 : frame === 2 ? -14 : 0) : 0;
  const capeFlutter = isWalking ? (frame % 2 === 1 ? 4 : 0) : 0;

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ width: dimensions.w, height: dimensions.h }}
    >
      {/* Divine Faith Halo / Aura */}
      {showAura && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-700 animate-pulse-gentle"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(229, 185, 116, 0.15) 50%, transparent 75%)',
            filter: 'blur(8px)',
            transform: `scale(${1.2 + Math.min(faith, 40) * 0.01}) translateY(-8px)`
          }}
        />
      )}

      {/* High-Fidelity Character Vector Artwork */}
      <svg
        viewBox="0 0 100 140"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] overflow-visible"
        style={{ transform: `translateY(${bobY}px)` }}
      >
        <defs>
          {/* Steel Armor Gradient */}
          <linearGradient id="crusaderSteel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="45%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Crimson Velvet Mantle Gradient */}
          <linearGradient id="crimsonMantle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="40%" stopColor="#b91c1c" />
            <stop offset="80%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          {/* Ornate Gold Trim Gradient */}
          <linearGradient id="divineGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>

          {/* Glowing Amber Orb */}
          <radialGradient id="celestialAmber" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="35%" stopColor="#fbbf24" />
            <stop offset="75%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>

          {/* Lantern Fire Glow */}
          <radialGradient id="lanternFlameGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dynamic Ground Shadow */}
        <ellipse cx="50" cy="134" rx="28" ry="6" fill="#000000" fillOpacity="0.6" />

        {/* ================= BACK LAYER: FLOWING CAPE ================= */}
        <g style={{ transformOrigin: '50px 40px', transform: `rotate(${capeFlutter}deg)` }}>
          <path
            d="M 32 38 Q 16 85, 20 128 Q 50 134, 80 128 Q 84 85, 68 38 Z"
            fill="url(#crimsonMantle)"
            stroke="#450a0a"
            strokeWidth="1.5"
          />
          {/* Gold Filigree Embroidery on Cape Hem */}
          <path
            d="M 22 125 Q 50 132, 78 125"
            stroke="url(#divineGold)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="4 2"
          />
        </g>

        {/* ================= LEGS & ARMORED BOOTS ================= */}
        {/* Left Leg (Armored Greave & Sabaton) */}
        <g style={{ transformOrigin: '40px 90px', transform: `rotate(${leftLegRot}deg)` }}>
          {/* Thigh plate / Chausses */}
          <rect x="36" y="90" width="10" height="18" rx="3" fill="#1e293b" />
          {/* Steel Knee Poleyn */}
          <circle cx="41" cy="108" r="4.5" fill="url(#crusaderSteel)" stroke="#334155" strokeWidth="1" />
          <circle cx="41" cy="108" r="1.5" fill="url(#divineGold)" />
          {/* Armored Shin Greave */}
          <path d="M 37 111 L 45 111 L 44 126 L 38 126 Z" fill="url(#crusaderSteel)" stroke="#1e293b" strokeWidth="1" />
          {/* Sabaton / Boot */}
          <path d="M 35 125 L 45 125 L 46 132 L 32 132 Z" fill="#334155" stroke="#0f172a" strokeWidth="1" />
          <line x1="33" y1="130" x2="45" y2="130" stroke="url(#divineGold)" strokeWidth="1" />
        </g>

        {/* Right Leg (Armored Greave & Sabaton) */}
        <g style={{ transformOrigin: '60px 90px', transform: `rotate(${rightLegRot}deg)` }}>
          <rect x="54" y="90" width="10" height="18" rx="3" fill="#1e293b" />
          <circle cx="59" cy="108" r="4.5" fill="url(#crusaderSteel)" stroke="#334155" strokeWidth="1" />
          <circle cx="59" cy="108" r="1.5" fill="url(#divineGold)" />
          <path d="M 55 111 L 63 111 L 62 126 L 56 126 Z" fill="url(#crusaderSteel)" stroke="#1e293b" strokeWidth="1" />
          <path d="M 53 125 L 63 125 L 64 132 L 50 132 Z" fill="#334155" stroke="#0f172a" strokeWidth="1" />
          <line x1="51" y1="130" x2="63" y2="130" stroke="url(#divineGold)" strokeWidth="1" />
        </g>

        {/* ================= TORSO & CRUSADER CUIRASS ================= */}
        {/* Navy Arming Tunic */}
        <path d="M 34 40 L 66 40 L 68 94 L 32 94 Z" fill="#0f172a" />

        {/* Steel Cuirass / Breastplate */}
        <path
          d="M 36 42 C 40 40, 60 40, 64 42 C 67 56, 66 76, 62 86 C 54 90, 46 90, 38 86 C 34 76, 33 56, 36 42 Z"
          fill="url(#crusaderSteel)"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Gold Inlaid Cross of Grace on Cuirass */}
        <path
          d="M 48 48 L 52 48 L 52 56 L 60 56 L 60 60 L 52 60 L 52 76 L 48 76 L 48 60 L 40 60 L 40 56 L 48 56 Z"
          fill="url(#divineGold)"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {/* Leather Baldric & Double Belt with Gold Buckle */}
        <path d="M 37 45 L 63 85" stroke="#78350f" strokeWidth="3" />
        <rect x="34" y="83" width="32" height="4.5" rx="1" fill="#451a03" stroke="#29180e" strokeWidth="1" />
        <rect x="47" y="82" width="6" height="6.5" rx="1" fill="url(#divineGold)" stroke="#78350f" strokeWidth="1" />

        {/* Prayer Knot & Canteen hanging on belt */}
        <circle cx="39" cy="90" r="3.5" fill="#a16207" stroke="#451a03" strokeWidth="1" />
        <line x1="61" y1="87" x2="61" y2="98" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="1.5 2" />

        {/* Ornate Gold Pauldrons (Shoulder Plates) */}
        {/* Left Shoulder */}
        <path
          d="M 28 38 C 30 33, 40 33, 42 38 C 42 46, 30 50, 26 44 Z"
          fill="url(#crusaderSteel)"
          stroke="url(#divineGold)"
          strokeWidth="1.5"
        />
        {/* Right Shoulder */}
        <path
          d="M 72 38 C 70 33, 60 33, 58 38 C 58 46, 70 50, 74 44 Z"
          fill="url(#crusaderSteel)"
          stroke="url(#divineGold)"
          strokeWidth="1.5"
        />

        {/* ================= THE CRUSADER HELM & VISOR ================= */}
        {/* Traveler's Crimson Cowl around Neck */}
        <ellipse cx="50" cy="37" rx="18" ry="8" fill="url(#crimsonMantle)" stroke="#450a0a" strokeWidth="1" />

        {/* Steel Great Helm / Sallet */}
        <path
          d="M 38 12 C 42 8, 58 8, 62 12 C 67 18, 67 34, 63 38 C 57 41, 43 41, 37 38 C 33 34, 33 18, 38 12 Z"
          fill="url(#crusaderSteel)"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Golden Helm Crest & Brow Band */}
        <path d="M 49 7 L 51 7 L 51 18 L 49 18 Z" fill="url(#divineGold)" />
        <path d="M 36 21 Q 50 17, 64 21" stroke="url(#divineGold)" strokeWidth="2.5" fill="none" />

        {/* Crusader Cross T-Visor Slit */}
        <path
          d="M 40 23 L 60 23 L 59 26 L 52 26 L 52 35 L 48 35 L 48 26 L 41 26 Z"
          fill="#050811"
        />

        {/* Glowing Eyes of Purpose inside visor */}
        <circle cx="45" cy="24.5" r="1.5" fill="#fef08a" className="animate-pulse" />
        <circle cx="55" cy="24.5" r="1.5" fill="#fef08a" className="animate-pulse" />

        {/* ================= LEFT ARM & STAFF OF WISDOM ================= */}
        <g style={{ transformOrigin: '32px 42px', transform: `rotate(${staffRot}deg)` }}>
          {/* Left Arm in Steel Vambrace */}
          <path d="M 30 42 L 22 66 L 27 68 L 36 46 Z" fill="url(#crusaderSteel)" stroke="#1e293b" strokeWidth="1" />
          {/* Steel Gauntlet Grip */}
          <rect x="18" y="64" width="7" height="6" rx="2" fill="url(#crusaderSteel)" stroke="#0f172a" strokeWidth="1" />

          {/* Carved Briarwood Staff of Wisdom */}
          <line x1="22" y1="4" x2="16" y2="136" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="23" y1="6" x2="17" y2="134" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />

          {/* Intricate Spiral Crook at Staff Head */}
          <path
            d="M 22 24 C 20 14, 12 10, 14 3 C 17 -3, 30 -2, 30 9 C 30 18, 24 20, 22 24"
            stroke="url(#divineGold)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Luminous Celestial Amber Sphere resting in crook */}
          <circle cx="21" cy="7" r="7" fill="url(#celestialAmber)" className="animate-pulse" />
          <circle cx="19" cy="5" r="2.5" fill="#ffffff" fillOpacity="0.8" />
          {/* Radiating Amber Aura */}
          <circle cx="21" cy="7" r="14" fill="url(#celestialAmber)" fillOpacity="0.25" className="animate-ping" style={{ animationDuration: '3s' }} />
        </g>

        {/* ================= RIGHT ARM & LANTERN OF FAITH ================= */}
        <g style={{ transformOrigin: '68px 42px', transform: `rotate(${lanternRot}deg)` }}>
          {/* Right Arm in Steel Vambrace */}
          <path d="M 68 42 L 78 66 L 73 68 L 64 46 Z" fill="url(#crusaderSteel)" stroke="#1e293b" strokeWidth="1" />
          {/* Steel Gauntlet holding chain */}
          <rect x="75" y="64" width="7" height="6" rx="2" fill="url(#crusaderSteel)" stroke="#0f172a" strokeWidth="1" />

          {/* Suspension Dark Steel Chain */}
          <line x1="79" y1="69" x2="80" y2="82" stroke="#475569" strokeWidth="1.5" strokeDasharray="2 1.5" />

          {/* Hexagonal Brass Filigree Lantern */}
          {/* Cap & Hook */}
          <circle cx="80" cy="81" r="2.5" fill="url(#divineGold)" stroke="#78350f" strokeWidth="1" />
          <polygon points="73,85 87,85 84,88 76,88" fill="url(#divineGold)" stroke="#78350f" strokeWidth="0.8" />

          {/* Glass Chamber & Brass Frame Pillars */}
          <rect x="74" y="88" width="12" height="16" rx="1.5" fill="#0f172a" stroke="url(#divineGold)" strokeWidth="1.2" />
          <line x1="78" y1="88" x2="78" y2="104" stroke="url(#divineGold)" strokeWidth="1" />
          <line x1="82" y1="88" x2="82" y2="104" stroke="url(#divineGold)" strokeWidth="1" />

          {/* Flickering Flame & Radiant Glow */}
          <ellipse cx="80" cy="96" rx="3.5" ry="5" fill="#fef08a" className="animate-pulse" />
          <ellipse cx="80" cy="97" rx="1.8" ry="3" fill="#ffffff" />
          {/* Big Warm Radiant Halo */}
          <circle cx="80" cy="96" r="22" fill="url(#lanternFlameGlow)" pointerEvents="none" />

          {/* Brass Lantern Base */}
          <polygon points="72,104 88,104 85,108 75,108" fill="url(#divineGold)" stroke="#78350f" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
};
