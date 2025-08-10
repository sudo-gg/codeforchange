import React, { useRef, useEffect, useState } from 'react';
import Sketch from 'react-p5';
import { Button } from 'react-bootstrap';

// --- CONFIG ---
const GALAXY_CONFIG = {
  'Anxiety': { x: -300, y: -200, color: [100, 149, 237], nebulaColor: [100, 149, 237, 30] },
  'Burnout': { x: 400, y: -100, color: [255, 165, 0], nebulaColor: [255, 165, 0, 25] },
  'SmallWin': { x: -100, y: 300, color: [144, 238, 144], nebulaColor: [144, 238, 144, 20] },
  'Depression': { x: 250, y: 250, color: [138, 43, 226], nebulaColor: [138, 43, 226, 25] },
  'Success': { x: -400, y: 150, color: [255, 215, 0], nebulaColor: [255, 215, 0, 30] },
  'Stress': { x: 350, y: -300, color: [220, 20, 60], nebulaColor: [220, 20, 60, 25] },
  'Loneliness': { x: 0, y: -400, color: [20, 20, 250], nebulaColor: [20, 20, 250, 30] },
//   'Anger': { x: 200, y: -150, color: [139, 40, 30], nebulaColor: [139, 40, 30, 30] },
//   'Sadness': { x: -50, y: -250, color: [100, 100, 100], nebulaColor: [100, 100, 100, 30] },
//   'Front-End Development': { x: 100, y: 100, color: [10, 200, 30], nebulaColor: [10, 200, 30, 30] },
//   'other': { x: 0, y: 0, color: [255, 255, 255], nebulaColor: [255, 255, 255, 30] }
};
const GALAXY_RADIUS = 120;
const DEEP_SPACE_STARS_COUNT = 800;

// --- GALAXY NAVIGATOR COMPONENT ---
const GalaxyNavigator = ({ galaxies, onGalaxyClick, currentGalaxy }) => {
  return (
    <div className="position-fixed top-0 start-0 m-3" style={{ zIndex: 1000, maxWidth: '200px' }}>
      <div className="glass-card p-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
        <h6 className="text-white mb-3 fw-bold">Navigate Galaxies</h6>
        <div className="d-flex flex-column gap-2">
          {galaxies.map(galaxy => (
            <Button
              key={galaxy}
              variant={currentGalaxy === galaxy ? "light" : "outline-light"}
              size="sm"
              onClick={() => onGalaxyClick(galaxy)}
              className="text-start fw-medium"
              style={{ fontSize: '0.85rem', backgroundColor: currentGalaxy === galaxy ? 'rgba(255, 255, 255, 0.9)' : 'transparent', borderColor: 'rgba(255, 255, 255, 0.3)', color: currentGalaxy === galaxy ? '#1a1a2e' : 'white' }}
            >
              {galaxy} Galaxy
            </Button>
          ))}
          <Button variant="outline-secondary" size="sm" onClick={() => onGalaxyClick(null)} className="mt-2 fw-medium" style={{ fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.7)' }}>
            View All
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN CANVAS COMPONENT ---
const NightSkyCanvas = ({ stars = [], onStarClick }) => {
    const [currentGalaxy, setCurrentGalaxy] = useState(null);
    const cameraRef = useRef({ x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 });
    const deepSpaceStarsRef = useRef([]);
    const hoveredStarRef = useRef(null);
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0 });
    const p5InstanceRef = useRef(null);

    useEffect(() => {
        const p5 = p5InstanceRef.current;
        if (!p5 || !stars || stars.length === 0) return;

        stars.forEach(star => {
            if (typeof star.x === 'undefined' || star.x === null) {
                const galaxyConfig = GALAXY_CONFIG[star.tag];
                if (galaxyConfig) {
                    const angle = p5.random(0, p5.TWO_PI);
                    const distance = p5.random(0, GALAXY_RADIUS);
                    star.x = galaxyConfig.x + p5.cos(angle) * distance;
                    star.y = galaxyConfig.y + p5.sin(angle) * distance;
                    star.pulseOffset = p5.random(0, p5.TWO_PI);
                }
            }
        });
    }, [stars]);

    const starsByGalaxy = stars.reduce((acc, star) => {
        const tag = star.tag || 'Unknown';
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(star);
        return acc;
    }, {});
    const galaxies = Object.keys(starsByGalaxy);

    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
        p5InstanceRef.current = p5;
        deepSpaceStarsRef.current = Array.from({ length: DEEP_SPACE_STARS_COUNT }, () => ({
            x: p5.random(-2000, 2000), y: p5.random(-2000, 2000), size: p5.random(0.5, 2),
            opacity: p5.random(0.8, 1), twinkleSpeed: p5.random(0.01, 0.03), twinkleOffset: p5.random(0, p5.TWO_PI)
        }));
    };

    const draw = (p5) => {
        p5.background(15, 15, 35);
        const camera = cameraRef.current;
        camera.x = p5.lerp(camera.x, camera.targetX, 0.08);
        camera.y = p5.lerp(camera.y, camera.targetY, 0.08);
        camera.zoom = p5.lerp(camera.zoom, camera.targetZoom, 0.08);

        p5.push();
        p5.translate(p5.width / 2, p5.height / 2);
        p5.scale(camera.zoom);
        p5.translate(-camera.x, -camera.y);

        p5.noStroke();
        deepSpaceStarsRef.current.forEach(star => {
            const twinkle = p5.sin(p5.millis() * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            p5.fill(255, 255, 255, star.opacity * twinkle * 255);
            p5.circle(star.x, star.y, star.size);
        });

        Object.keys(starsByGalaxy).forEach(tag => {
            const galaxyConfig = GALAXY_CONFIG[tag];
            if (!galaxyConfig || starsByGalaxy[tag].length === 0) return;
            p5.push();
            p5.translate(galaxyConfig.x, galaxyConfig.y);
            for (let i = 0; i < 3; i++) {
                const radius = GALAXY_RADIUS * (2 - i * 0.3);
                const alpha = galaxyConfig.nebulaColor[3] * (0.8 - i * 0.2);
                p5.fill(galaxyConfig.nebulaColor[0], galaxyConfig.nebulaColor[1], galaxyConfig.nebulaColor[2], alpha);
                p5.noStroke();
                p5.circle(0, 0, radius * 2);
            }
            p5.pop();
        });

        stars.forEach(star => {
            if (!star.x) return;
            const galaxyConfig = GALAXY_CONFIG[star.tag] || { color: [255, 255, 255] };
            const isHovered = hoveredStarRef.current === star.id;
            const baseSize = p5.map(star.karma || 1, 0, 50, 8, 20);
            const size = isHovered ? baseSize * 1.3 : baseSize;
            const pulse = p5.sin(p5.millis() * 0.003 + star.pulseOffset) * 0.2 + 0.8;
            
            for (let i = 8; i > 0; i--) {
                p5.fill(galaxyConfig.color[0], galaxyConfig.color[1], galaxyConfig.color[2], (1 - i / 8) * 0.3 * pulse * 255);
                p5.noStroke();
                p5.circle(star.x, star.y, size * (1.5 + pulse * 0.5) * (i / 8 * 2));
            }
            
            p5.fill(p5.lerpColor(p5.color(...galaxyConfig.color), p5.color(255), 0.4));
            p5.noStroke();
            p5.circle(star.x, star.y, size);
            p5.fill(255, 255, 255, 200);
            p5.circle(star.x, star.y, size * 0.4);
        });

        p5.pop();
    };

    const navigateToGalaxy = (galaxyTag) => {
        const camera = cameraRef.current;
        if (galaxyTag === null) {
            camera.targetX = 0; camera.targetY = 0; camera.targetZoom = 0.6;
            setCurrentGalaxy(null);
        } else {
            const config = GALAXY_CONFIG[galaxyTag];
            if (config) {
                camera.targetX = config.x; camera.targetY = config.y; camera.targetZoom = 1.5;
                setCurrentGalaxy(galaxyTag);
            }
        }
    };

    const windowResized = (p5) => p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    const mousePressed = (p5) => { isDraggingRef.current = true; lastMouseRef.current = { x: p5.mouseX, y: p5.mouseY }; };
    
    const mouseReleased = (p5) => {
      // Only check for clicks if the mouse wasn't dragged
      const wasDragged = p5.dist(p5.mouseX, p5.mouseY, lastMouseRef.current.x, lastMouseRef.current.y) > 5; // A small threshold
      isDraggingRef.current = false;
      if (wasDragged) return;

      // Check for star clicks
      const camera = cameraRef.current;
      const worldX = camera.x + (p5.mouseX - p5.width / 2) / camera.zoom;
      const worldY = camera.y + (p5.mouseY - p5.height / 2) / camera.zoom;

      for (const star of stars) {
          if (!star.x || !star.y) continue;

          const distance = p5.dist(worldX, worldY, star.x, star.y);
          const starSize = p5.map(star.karma || 1, 0, 50, 8, 20);

          if (distance < starSize / 2) { // Check against the radius
              onStarClick(star); // Pass the entire star object
              break;
          }
      }
    };
    
    const mouseDragged = (p5) => {
        if (!isDraggingRef.current) return;
        const camera = cameraRef.current;
        camera.targetX -= (p5.mouseX - lastMouseRef.current.x) / camera.zoom;
        camera.targetY -= (p5.mouseY - lastMouseRef.current.y) / camera.zoom;
        lastMouseRef.current = { x: p5.mouseX, y: p5.mouseY };
    };

    const mouseWheel = (p5, event) => {
        event.preventDefault();
        const camera = cameraRef.current;
        const zoomFactor = event.delta > 0 ? 0.9 : 1.1;
        const newZoom = p5.constrain(camera.targetZoom * zoomFactor, 0.3, 3);
        const mouseWorldX = camera.x + (p5.mouseX - p5.width / 2) / camera.zoom;
        const mouseWorldY = camera.y + (p5.mouseY - p5.height / 2) / camera.zoom;
        camera.targetZoom = newZoom;
        camera.targetX = mouseWorldX - (p5.mouseX - p5.width / 2) / newZoom;
        camera.targetY = mouseWorldY - (p5.mouseY - p5.height / 2) / newZoom;
        return false;
    };
    
    return (
        <div className="position-relative w-100 vh-100 overflow-hidden">
            <Sketch 
                setup={setup}
                draw={draw}
                windowResized={windowResized}
                mousePressed={mousePressed}
                mouseDragged={mouseDragged}
                mouseReleased={mouseReleased}
                mouseWheel={mouseWheel}
            />
            <GalaxyNavigator galaxies={galaxies} onGalaxyClick={navigateToGalaxy} currentGalaxy={currentGalaxy} />
            <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 1000 }}>
                <div className="glass-card p-2 rounded text-white" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', fontSize: '0.8rem', maxWidth: '200px' }}>
                    <div>Drag to pan</div>
                    <div>Scroll to zoom</div>
                    <div>Click stars to listen</div>
                </div>
            </div>
        </div>
    );
};

export default NightSkyCanvas;