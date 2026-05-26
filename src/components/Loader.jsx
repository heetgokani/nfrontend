import React, { useEffect, useState } from "react";

const Loader = () => {
  // 1. Check session storage immediately before the component even renders.
  // If they have seen it, start as false. If not, start as true.
  const [isVisible, setIsVisible] = useState(() => {
    return sessionStorage.getItem("nikam_loader_seen") !== "true";
  });

  const [fade, setFade] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // 2. If they have already seen the loader this session, stop running any code.
    if (!isVisible) return;

    // Generate particles
    const particleArray = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 4 + 3}s`,
      animationDelay: `${Math.random() * 2}s`,
      opacity: Math.random() * 0.5 + 0.1,
      scale: Math.random() * 0.5 + 0.3,
    }));
    setParticles(particleArray);

    const hideLoader = () => {
      setFade(true); // Trigger the CSS fade-out transition
      setTimeout(() => {
        setIsVisible(false); // Completely remove from DOM

        // 3. Mark the loader as "seen" so it never shows again during this visit
        sessionStorage.setItem("nikam_loader_seen", "true");
      }, 800); // Wait for the 0.8s fade transition to finish
    };

    // If the page is already fully loaded
    if (document.readyState === "complete") {
      setTimeout(hideLoader, 500); // Show for at least half a second
    } else {
      // Wait for all website assets to download
      window.addEventListener("load", hideLoader);
    }

    return () => window.removeEventListener("load", hideLoader);
  }, [isVisible]);

  // If isVisible is false, render absolutely nothing to the screen
  if (!isVisible) return null;

  const renderWheatDef = () => {
    const grains = [];
    for (let i = 0; i < 9; i++) {
      const y = -100 - i * 9;
      grains.push(
        <g key={`grain-${i}`}>
          <path d={`M 0,${y} Q -12,${y - 4} -2,${y - 14} Z`} fill="#D4A035" />
          <path d={`M 0,${y - 4} Q 12,${y - 8} 2,${y - 18} Z`} fill="#F2C25A" />
          <path
            d={`M 0,${y} Q -10,${y - 15} -20,${y - 30} M 0,${y - 4} Q 10,${y - 19} 20,${y - 34}`}
            stroke="#E8BC4C"
            strokeWidth="0.8"
            fill="none"
            opacity="0.85"
          />
        </g>,
      );
    }
    grains.push(
      <path
        key="tip"
        d="M 0,-181 Q -4,-185 0,-195 Q 4,-185 0,-181 Z"
        fill="#D4A035"
      />,
    );
    grains.push(
      <path
        key="tip-awn"
        d="M 0,-195 Q 5,-210 2,-225"
        stroke="#E8BC4C"
        strokeWidth="0.8"
        fill="none"
        opacity="0.85"
      />,
    );

    return (
      <g id="real-wheat">
        <path
          d="M 0,0 C 8,-30 -8,-70 0,-100"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 0,-15 C -20,-20 -35,0 -40,15"
          fill="none"
          stroke="#A68A2E"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 1,-35 C 25,-40 35,-5 40,15"
          fill="none"
          stroke="#C2A540"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {grains}
      </g>
    );
  };

  const stalks = [
    { x: 30, y: 215, scale: 0.6, delay: "0.0s", duration: "4.2s" },
    { x: 70, y: 210, scale: 0.85, delay: "0.2s", duration: "4.0s" },
    { x: 110, y: 218, scale: 1.0, delay: "0.4s", duration: "4.3s" },
    { x: 150, y: 222, scale: 1.15, delay: "0.6s", duration: "4.1s" },
    { x: 190, y: 215, scale: 0.95, delay: "0.8s", duration: "4.4s" },
    { x: 230, y: 208, scale: 0.75, delay: "1.0s", duration: "4.0s" },
    { x: 270, y: 212, scale: 0.6, delay: "1.2s", duration: "4.5s" },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Outfit:wght@300;400;500&display=swap');

          .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #ffffff 0%, #f4fbf4 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            overflow: hidden;
            transition: opacity 0.8s ease-in-out;
            opacity: ${fade ? "0" : "1"};
            pointer-events: ${fade ? "none" : "all"};
          }
          
          .pollen { position: absolute; width: 2px; height: 2px; background-color: #E8BC4C; border-radius: 50%; filter: blur(0.5px); animation: float-pollen linear infinite; pointer-events: none; z-index: 1; }
          @keyframes float-pollen { 0% { transform: translateY(0) translateX(0); opacity: 0; } 20% { opacity: var(--max-opacity); } 80% { opacity: var(--max-opacity); } 100% { transform: translateY(-80px) translateX(80px); opacity: 0; } }
          .loader-content { display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2; }
          .farm-scene { width: 260px; height: 200px; position: relative; margin-bottom: 25px; }
          .sway-wrapper { transform-origin: 0 0; will-change: transform; animation: rolling-wind infinite ease-in-out alternate; }
          @keyframes rolling-wind { 0% { transform: rotate(-3deg) skewX(-2deg); } 40% { transform: rotate(14deg) skewX(10deg); } 70% { transform: rotate(10deg) skewX(6deg); } 100% { transform: rotate(-5deg) skewX(-4deg); } }
          .text-container { text-align: center; }
          .welcome-text { font-family: 'Outfit', sans-serif; font-size: 0.8rem; color: #7a8c7a; text-transform: uppercase; letter-spacing: 5px; display: block; margin-bottom: 8px; font-weight: 500; }
          .brand-text { font-family: 'Playfair Display', serif; font-size: 2.6rem; margin: 0; font-weight: 600; letter-spacing: 0.5px; background: linear-gradient(135deg, #183321 0%, #2A5C38 50%, #407E18 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0px 4px 15px rgba(64, 126, 24, 0.08); }
          .sun-glow { animation: pulse-sun 4s infinite alternate ease-in-out; }
          @keyframes pulse-sun { 0% { opacity: 0.5; transform: scale(0.95); transform-origin: center; } 100% { opacity: 0.8; transform: scale(1.05); transform-origin: center; } }
        `}
      </style>

      <div className="loader-overlay">
        {particles.map((p) => (
          <div
            key={p.id}
            className="pollen"
            style={{
              left: p.left,
              top: p.top,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
              transform: `scale(${p.scale})`,
              "--max-opacity": p.opacity,
            }}
          />
        ))}
        <div className="loader-content">
          <div className="farm-scene">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 300 250"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ overflow: "visible" }}
            >
              <defs>
                {renderWheatDef()}
                <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(212, 160, 55, 0.15)" />
                  <stop offset="50%" stopColor="rgba(64, 126, 24, 0.05)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <circle
                cx="150"
                cy="160"
                r="140"
                fill="url(#sunGradient)"
                className="sun-glow"
              />
              <path
                d="M -20,215 Q 150,180 320,215 L 320,250 L -20,250 Z"
                fill="#2c4c23"
              />
              {stalks.map((stalk, index) => (
                <g
                  key={index}
                  transform={`translate(${stalk.x}, ${stalk.y}) scale(${stalk.scale})`}
                >
                  <g
                    className="sway-wrapper"
                    style={{
                      animationDuration: stalk.duration,
                      animationDelay: stalk.delay,
                    }}
                  >
                    <use href="#real-wheat" />
                  </g>
                </g>
              ))}
              <path
                d="M -20,218 Q 150,200 320,218 Q 150,235 -20,218 Z"
                fill="#375f2b"
              />
              <path
                d="M -10,216 Q 150,204 310,216 Q 150,225 -10,216 Z"
                fill="#467836"
              />
            </svg>
          </div>
          <div className="text-container">
            <span className="welcome-text">Welcome to</span>
            <h1 className="brand-text">Nikam Organic</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loader;
