import "./HammerLoading.css";

type HammerLoadingProps = {
  message?: string;
  fullScreen?: boolean;
};

export default function HammerLoading({
  message = "Getting things ready...",
  fullScreen = true,
}: HammerLoadingProps) {
  return (
    <div
      className={`hammer-loading ${fullScreen ? "hammer-loading--screen" : ""}`}
      role="status"
      aria-label={message}
    >
      <svg
        className="hammer-scene"
        viewBox="0 0 240 160"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <ellipse cx="120" cy="137" rx="76" ry="7" fill="#171717" opacity=".08" />

        {/* Wooden plank */}
        <path d="M45 115 H195 L187 136 H53 Z" fill="#9B6039" />
        <path d="M45 115 H195 L191 122 H49 Z" fill="#C58A55" />
        <path d="M62 127 Q85 123 104 129 M140 128 Q160 124 179 128"
          stroke="#754326" strokeWidth="1.5" fill="none" />

        {/* Nail */}
        <g className="hammer-nail">
          <path d="M115 97 H125 L123 115 H117 Z" fill="#AEB7C0" />
          <path d="M119 99 V113" stroke="#F3F4F6" strokeWidth="2" />
          <path d="M109 94 Q120 90 131 94 L129 99 H111 Z"
            fill="#D1D5DB" stroke="#8B949E" strokeWidth="1.5" />
        </g>

        {/* Hammer */}
        <g className="hammer-tool">
          <path d="M133 43 L145 50 L168 103 Q170 108 165 111
            L161 113 Q157 114 155 109 L132 57 Z" fill="#A66B3F" />
          <path d="M138 55 L159 105" stroke="#D7A16D"
            strokeWidth="3" strokeLinecap="round" />

          <path d="M86 27 Q83 25 85 21 L91 11
            Q93 8 97 10 L125 27 L135 33
            Q139 36 136 41 L130 51 Q128 55 124 52
            L112 45 L95 38 Z" fill="#444B55" />
          <path d="M91 20 L117 35" stroke="#8B949E"
            strokeWidth="3" strokeLinecap="round" />
          <path d="M85 21 L80 29 Q78 33 82 36 L91 41 L97 31 Z"
            fill="#68717D" />
          <path d="M125 27 L135 33 Q139 36 136 41
            L130 51 Q128 55 124 52 L117 48 L128 31 Z"
            fill="#303640" />
        </g>

        {/* Impact sparks */}
        <g className="hammer-sparks" stroke="#E9A23B"
          strokeWidth="3" strokeLinecap="round">
          <path d="M102 87 L96 80" />
          <path d="M136 86 L143 79" />
          <path d="M120 81 V73" />
          <path d="M101 99 H92" />
          <path d="M139 99 H147" />
        </g>
      </svg>

      <div className="hammer-loading__brand">
        <div className="hammer-loading__name">
          Fix<span>Mate</span>
        </div>
        <div className="hammer-loading__message">{message}</div>
        <div className="hammer-loading__dots" aria-hidden="true">
          <i /><i /><i />
        </div>
      </div>
    </div>
  );
}
