import { useRef, useState, useEffect } from "react";
import { FaPlay, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

// 👉 Apni reel video files yahin daalo: src/assets/reels/
// File names match karo ya neeche import + list update kar do.
import reel1 from "../assets/reels/reel1.mp4";
import reel2 from "../assets/reels/reel7.mp4";
import reel3 from "../assets/reels/reel11.mp4";
import reel4 from "../assets/reels/reel4.mp4";
import reel5 from "../assets/reels/reel5.mp4";
import reel6 from "../assets/reels/reel8.mp4";
import reel7 from "../assets/reels/reel2.mp4";
import reel8 from "../assets/reels/reel6.mp4";
import reel9 from "../assets/reels/reel9.mp4";
import reel10 from "../assets/reels/reel10.mp4";
import reel11 from "../assets/reels/reel3.mp4";
import reel12 from "../assets/reels/reel12.mp4";
const reels = [
  { id: 1, src: reel1, caption: "" },
  { id: 2, src: reel2, caption: "" },
  { id: 3, src: reel3, caption: "" },
  { id: 4, src: reel4, caption: "" },
  { id: 5, src: reel5, caption: "" },
  { id: 6, src: reel6, caption: "" },
  { id: 7, src: reel7, caption: "" },
  { id: 8, src: reel8, caption: "" },
  { id: 9, src: reel9, caption: "" },
  { id: 10, src: reel10, caption: "" },
  { id: 11, src: reel11, caption: "" },
  { id: 12, src: reel12, caption: "" },
];

const ReelCard = ({ reel }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  // Autoplay when card scrolls into view, pause when it leaves
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          v.play().then(() => setPlaying(true)).catch(() => { });
        } else {
          v.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(v);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="reel-card" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={reel.src}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        className="reel-video"
      />

      {!playing && (
        <div className="reel-play-overlay">
          <FaPlay />
        </div>
      )}

      <button className="reel-mute-btn" onClick={toggleMute} aria-label="Toggle sound">
        {muted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>

      <div className="reel-caption-overlay">
        <p>{reel.caption}</p>
      </div>
    </div>
  );
};

export default function ReelsSection() {
  return (
    <section className="reels-section">
      <div className="reels-header">
        <h2 className="reels-title">✨ Celestika Reels</h2>
        <p className="reels-subtitle">Tap to play, swipe to explore</p>
      </div>

      <div className="reels-track">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>
    </section>
  );
}