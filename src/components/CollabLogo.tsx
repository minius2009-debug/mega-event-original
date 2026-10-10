import React from 'react';

interface CollabLogoProps {
  className?: string;
  size?: number | string;
}

export default function CollabLogo({ className = 'w-10 h-10', size }: CollabLogoProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Main Brand Gradient: Electric Blue (left) to Neon Violet/Purple (top & bottom) */}
        <linearGradient id="collabMainGrad" x1="40" y1="200" x2="360" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D72FE" />
          <stop offset="35%" stopColor="#2563EB" />
          <stop offset="70%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        <linearGradient id="collabTopGrad" x1="120" y1="200" x2="340" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        <linearGradient id="collabBottomGrad" x1="120" y1="200" x2="340" y2="340" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="60%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        {/* Head Gradients */}
        <linearGradient id="headLeftGrad" x1="30" y1="175" x2="90" y2="225" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#1D72FE" />
        </linearGradient>

        <linearGradient id="headTopGrad" x1="175" y1="35" x2="225" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        <linearGradient id="headBottomGrad" x1="175" y1="315" x2="225" y2="375" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* --- C-SHAPED BODY (THREE COLLABORATING MEMBERS LINKED) --- */}
      {/* 
        The body forms the letter 'C' with 3 distinct interlocking figures:
        - Top figure curving down & right
        - Left figure vertical anchor
        - Bottom figure curving up & right
      */}
      <path
        d="
          M 312 128
          C 319 135 319 146 312 153
          C 305 160 294 160 287 153
          C 264 126 235 110 200 110
          C 185 110 172 118 165 130
          C 155 146 138 156 118 156
          L 118 175
          C 118 190 126 200 126 200
          C 126 200 118 210 118 225
          L 118 244
          C 138 244 155 254 165 270
          C 172 282 185 290 200 290
          C 235 290 264 274 287 247
          C 294 240 305 240 312 247
          C 319 254 319 265 312 272
          C 283 306 244 326 200 326
          C 185 326 172 318 165 306
          C 155 290 138 280 118 280
          L 100 280
          C 85 280 72 268 72 252
          L 72 235
          C 72 220 62 210 50 200
          C 62 190 72 180 72 165
          L 72 148
          C 72 132 85 120 100 120
          L 118 120
          C 138 120 155 110 165 94
          C 172 82 185 74 200 74
          C 244 74 283 94 312 128
          Z
        "
        fill="url(#collabMainGrad)"
        style={{ display: 'none' }}
      />

      {/* Precise Geometric Representation matching logo2.webp */}
      {/* 1. Main Continuous C Arc Body */}
      <g>
        {/* Top Arc Segment */}
        <path
          d="
            M 315 145
            C 285 85 210 65 155 85
            C 142 90 132 102 125 116
            C 115 136 100 150 78 156
            C 72 158 68 164 68 170
            L 68 172
            C 78 178 88 188 92 200
            C 88 212 78 222 68 228
            L 68 230
            C 68 236 72 242 78 244
            C 100 250 115 264 125 284
            C 132 298 142 310 155 315
            C 210 335 285 315 315 255
            C 322 242 312 230 298 234
            C 255 248 200 240 170 215
            C 162 208 162 192 170 185
            C 200 160 255 152 298 166
            C 312 170 322 158 315 145
            Z
          "
          fill="none"
        />

        {/* Outer Circular Ring Body with Human Cutouts */}
        {/* Base thick C ring from 40deg to 320deg */}
        <path
          d="
            M 305 135
            A 135 135 0 1 0 305 265
            L 282 245
            A 102 102 0 1 1 282 155
            Z
          "
          fill="url(#collabMainGrad)"
        />

        {/* Head 1: Top Person Head */}
        <circle
          cx="200"
          cy="65"
          r="26"
          fill="url(#headTopGrad)"
        />

        {/* Head 2: Left Person Head */}
        <circle
          cx="65"
          cy="200"
          r="26"
          fill="url(#headLeftGrad)"
        />

        {/* Head 3: Bottom Person Head */}
        <circle
          cx="200"
          cy="335"
          r="26"
          fill="url(#headBottomGrad)"
        />

        {/* Subtle Shoulder Connection Bridging */}
        {/* Top Shoulder Neck Anchor */}
        <path
          d="
            M 168 85
            C 175 98 186 104 200 104
            C 214 104 225 98 232 85
            C 218 80 182 80 168 85
            Z
          "
          fill="url(#headTopGrad)"
        />

        {/* Left Shoulder Neck Anchor */}
        <path
          d="
            M 85 168
            C 98 175 104 186 104 200
            C 104 214 98 225 85 232
            C 80 218 80 182 85 168
            Z
          "
          fill="url(#headLeftGrad)"
        />

        {/* Bottom Shoulder Neck Anchor */}
        <path
          d="
            M 168 315
            C 175 302 186 296 200 296
            C 214 296 225 302 232 315
            C 218 320 182 320 168 315
            Z
          "
          fill="url(#headBottomGrad)"
        />

        {/* Rounded Cap at Top Right Tip */}
        <circle
          cx="293.5"
          cy="145"
          r="16.5"
          fill="url(#collabTopGrad)"
        />

        {/* Rounded Cap at Bottom Right Tip */}
        <circle
          cx="293.5"
          cy="255"
          r="16.5"
          fill="url(#collabBottomGrad)"
        />
      </g>
    </svg>
  );
}
