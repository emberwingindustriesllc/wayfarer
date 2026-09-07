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
  // Walking animation frame cycle (0 -> 1 -> 2 -> 1 -> 0)
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isWalking) {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, [isWalking]);

  const scale = size === 'sm' ? 2 : size === 'lg' ? 4 : 3;
  const width = 24 * scale;
  const height = 30 * scale;

  // Frame offsets for walking animation (classic Mario/Mega Man/Shovel Knight bobbing)
  const bobY = isWalking ? (frame % 2 === 1 ? -2 : 0) : (frame === 0 ? 0 : 0);
  const leftLegOffset = isWalking ? (frame === 1 ? -3 : frame === 3 ? 3 : 0) : 0;
  const rightLegOffset = isWalking ? (frame === 1 ? 3 : frame === 3 ? -3 : 0) : 0;
  const staffAngle = isWalking ? (frame === 1 ? 12 : frame === 3 ? -12 : 0) : 0;
  const lanternSwing = isWalking ? (frame === 1 ? -8 : frame === 3 ? 8 : 0) : 0;

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ width, height }}
    >
      {/* 8-Bit Pixel Aura of Faith */}
      {showAura && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-500 animate-pulse-gentle"
          style={{
            background: `radial-gradient(circle, rgba(229, 185, 116, 0.4) 0%, rgba(229, 185, 116, 0.1) 60%, transparent 80%)`,
            filter: 'blur(6px)',
            transform: 'scale(1.3)'
          }}
        />
      )}

      {/* Retro Pixel Art SVG Sprite (Shovel Knight / Mega Man / Zelda style) */}
      <svg
        viewBox="0 0 24 30"
        className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
        style={{
          imageRendering: 'pixelated',
          shapeRendering: 'crispEdges',
          transform: `translateY(${bobY}px)`
        }}
      >
        <defs>
          {/* Pixel palette */}
          {/* Hood/Cloak: Deep Midnight Navy */}
          {/* Armor/Tunic: Royal Blue & Steel */}
          {/* Trim/Accents: Gold */}
          {/* Staff: Warm Wood & Amber Gem */}
        </defs>

        {/* Pixel Shadow */}
        <rect x="5" y="27" width="14" height="2" fill="#000000" fillOpacity="0.5" />

        {/* ================= LEGS / BOOTS ================= */}
        {/* Left Boot */}
        <g style={{ transform: `translateY(${leftLegOffset}px)` }}>
          <rect x="7" y="22" width="4" height="4" fill="#3f2719" />
          <rect x="6" y="24" width="5" height="3" fill="#29180e" />
          <rect x="5" y="26" width="3" height="2" fill="#1b0e07" />
        </g>

        {/* Right Boot */}
        <g style={{ transform: `translateY(${rightLegOffset}px)` }}>
          <rect x="13" y="22" width="4" height="4" fill="#3f2719" />
          <rect x="13" y="24" width="5" height="3" fill="#29180e" />
          <rect x="16" y="26" width="3" height="2" fill="#1b0e07" />
        </g>

        {/* ================= TUNIC & ARMOR BODY ================= */}
        {/* Cloak Hem / Skirt */}
        <rect x="7" y="19" width="10" height="4" fill="#1e2238" />
        <rect x="8" y="22" width="8" height="1" fill="#e5b974" />

        {/* Chest Armor (Shovel Knight style Knightly Tunic) */}
        <rect x="7" y="12" width="10" height="7" fill="#2c3358" />
        <rect x="8" y="13" width="8" height="5" fill="#3d4778" />
        {/* Golden Cross / Crest on Chest */}
        <rect x="11" y="14" width="2" height="4" fill="#e5b974" />
        <rect x="10" y="15" width="4" height="2" fill="#f7d89c" />

        {/* Belt & Buckle */}
        <rect x="7" y="18" width="10" height="2" fill="#523927" />
        <rect x="11" y="18" width="2" height="2" fill="#e5b974" />

        {/* Pauldrons (Gold Shoulder Guards) */}
        <rect x="5" y="12" width="3" height="3" fill="#e5b974" />
        <rect x="6" y="11" width="2" height="1" fill="#f7d89c" />
        <rect x="16" y="12" width="3" height="3" fill="#e5b974" />
        <rect x="16" y="11" width="2" height="1" fill="#f7d89c" />

        {/* ================= PILGRIM'S STAFF (Left Hand) ================= */}
        <g style={{ transformOrigin: '4px 17px', transform: `rotate(${staffAngle}deg)` }}>
          {/* Wooden Shaft */}
          <rect x="3" y="4" width="2" height="24" fill="#6d4c3d" />
          <rect x="4" y="5" width="1" height="22" fill="#8c6227" />
          {/* Carved Crook Head */}
          <rect x="2" y="2" width="4" height="3" fill="#b8893d" />
          <rect x="1" y="3" width="2" height="2" fill="#b8893d" />
          {/* Glowing Amber Crystal Gem */}
          <rect x="2" y="1" width="3" height="3" fill="#f59e0b" />
          <rect x="3" y="1" width="1" height="1" fill="#fef08a" />
          {/* Left Hand Gauntlet holding staff */}
          <rect x="3" y="16" width="3" height="3" fill="#523927" />
        </g>

        {/* ================= HOOD & HEAD (Veiled Crusader) ================= */}
        {/* Outer Hood */}
        <rect x="7" y="3" width="10" height="9" fill="#1e2238" />
        <rect x="8" y="2" width="8" height="2" fill="#1e2238" />
        <rect x="6" y="5" width="2" height="6" fill="#161929" />
        <rect x="16" y="5" width="2" height="6" fill="#161929" />

        {/* Hood Shadow / Face Visor */}
        <rect x="8" y="5" width="8" height="6" fill="#08090f" />

        {/* Glowing Hero Eyes (Zelda / Mega Man style determined gaze) */}
        <rect x="10" y="7" width="1" height="2" fill="#fef08a" />
        <rect x="13" y="7" width="1" height="2" fill="#fef08a" />

        {/* Cowl Rim */}
        <rect x="7" y="10" width="10" height="2" fill="#161929" />
        <rect x="8" y="11" width="8" height="1" fill="#e5b974" />

        {/* ================= LANTERN OF FAITH (Right Hand) ================= */}
        <g style={{ transformOrigin: '18px 16px', transform: `rotate(${lanternSwing}deg)` }}>
          {/* Right Hand Gauntlet */}
          <rect x="18" y="16" width="3" height="3" fill="#523927" />
          {/* Chain */}
          <rect x="19" y="19" width="1" height="2" fill="#b8893d" />
          {/* Lantern Top */}
          <rect x="17" y="21" width="5" height="1" fill="#b8893d" />
          {/* Lantern Glass & Flame */}
          <rect x="18" y="22" width="3" height="3" fill="#f59e0b" />
          <rect x="19" y="23" width="1" height="1" fill="#fef08a" />
          {/* Lantern Base */}
          <rect x="17" y="25" width="5" height="1" fill="#b8893d" />
          {/* Pixel Light Sparks */}
          <rect x="22" y="23" width="1" height="1" fill="#fde047" fillOpacity="0.7" />
        </g>
      </svg>
    </div>
  );
};
