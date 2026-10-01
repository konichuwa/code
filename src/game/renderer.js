import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from './constants.js';

export class GameRenderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  // Draw Themed Background based on current level config
  drawBackground(theme, levelNum, animTimer, lightningFlash = 0, arenaName = '') {
    const ctx = this.ctx;
    ctx.save();

    // 1. Sky / Base Wall Atmospheric Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    switch (theme) {
      case 'alley':
        skyGrad.addColorStop(0, '#080c14');
        skyGrad.addColorStop(0.5, '#0f172a');
        skyGrad.addColorStop(1, '#1e293b');
        break;
      case 'subway':
        skyGrad.addColorStop(0, '#121214');
        skyGrad.addColorStop(0.5, '#1c1917');
        skyGrad.addColorStop(1, '#292524');
        break;
      case 'chinatown':
        skyGrad.addColorStop(0, '#220510');
        skyGrad.addColorStop(0.5, '#4c0519');
        skyGrad.addColorStop(1, '#831843');
        break;
      case 'docks':
        skyGrad.addColorStop(0, '#021826');
        skyGrad.addColorStop(0.5, '#082f49');
        skyGrad.addColorStop(1, '#0e7490');
        break;
      case 'warehouse':
        skyGrad.addColorStop(0, '#111114');
        skyGrad.addColorStop(0.5, '#1c1917');
        skyGrad.addColorStop(1, '#451a03');
        break;
      case 'rooftop':
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.6, '#1e1b4b');
        skyGrad.addColorStop(1, '#312e81');
        break;
      case 'arena':
        skyGrad.addColorStop(0, '#170526');
        skyGrad.addColorStop(0.5, '#2e1065');
        skyGrad.addColorStop(1, '#3b0764');
        break;
      case 'cyber':
        skyGrad.addColorStop(0, '#040407');
        skyGrad.addColorStop(0.5, '#1e1035');
        skyGrad.addColorStop(1, '#083344');
        break;
      case 'bridge':
        skyGrad.addColorStop(0, '#1e1b4b');
        skyGrad.addColorStop(0.35, '#831843');
        skyGrad.addColorStop(0.7, '#b45309');
        skyGrad.addColorStop(1, '#f59e0b');
        break;
      case 'penthouse':
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.5, '#0c1e3d');
        skyGrad.addColorStop(1, '#172554');
        break;
      case 'volcano':
        skyGrad.addColorStop(0, '#180404');
        skyGrad.addColorStop(0.4, '#450a0a');
        skyGrad.addColorStop(0.8, '#991b1b');
        skyGrad.addColorStop(1, '#ea580c');
        break;
      case 'snow':
        skyGrad.addColorStop(0, '#041d30');
        skyGrad.addColorStop(0.5, '#0369a1');
        skyGrad.addColorStop(0.85, '#38bdf8');
        skyGrad.addColorStop(1, '#e0f2fe');
        break;
      case 'train':
        skyGrad.addColorStop(0, '#020617');
        skyGrad.addColorStop(0.5, '#1e293b');
        skyGrad.addColorStop(1, '#475569');
        break;
      case 'space':
        skyGrad.addColorStop(0, '#010206');
        skyGrad.addColorStop(0.6, '#090516');
        skyGrad.addColorStop(1, '#02182b');
        break;
      case 'colosseum':
        skyGrad.addColorStop(0, '#14040e');
        skyGrad.addColorStop(0.5, '#450a0a');
        skyGrad.addColorStop(1, '#78350f');
        break;
      default:
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(1, '#1e293b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // Realistic lightning flash overlay
    if (lightningFlash > 0) {
      ctx.fillStyle = `rgba(224, 242, 254, ${Math.min(0.65, lightningFlash * 0.45)})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    }

    // 2. Realistic Environmental Details per Theme
    if (theme === 'alley') {
      // Distant city skyline
      ctx.fillStyle = '#0f172a';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(i * 105, 50, 75, GROUND_Y - 50);
      }
      // Brick walls with depth shading
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, 40, 240, GROUND_Y - 40);
      ctx.fillRect(540, 50, 240, GROUND_Y - 50);

      // Fire escape stairs & railings
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      for (let f = 0; f < 3; f++) {
        const fy = 90 + f * 65;
        ctx.strokeRect(40, fy, 120, 8);
        ctx.beginPath();
        ctx.moveTo(150, fy + 8);
        ctx.lineTo(60, fy + 65);
        ctx.stroke();
      }

      // Windows with warm amber interior lights
      for (let r = 0; r < 3; r++) {
        const wy = 80 + r * 65;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(190, wy, 28, 40);
        ctx.fillRect(580, wy + 15, 28, 40);
        ctx.fillRect(660, wy + 15, 28, 40);
        // Window mullions
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(190 + 13, wy, 2, 40);
        ctx.fillRect(190, wy + 19, 28, 2);
      }

      // Glowing Neon Sign ("HOTEL // 24H")
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#f43f5e';
      ctx.font = '900 16px monospace';
      ctx.fillText('HOTEL // 24H', 60, 65);
      ctx.shadowBlur = 0;

      // Industrial Dumpster
      ctx.fillStyle = '#065f46';
      ctx.fillRect(470, GROUND_Y - 60, 70, 60);
      ctx.strokeStyle = '#047857';
      ctx.strokeRect(470, GROUND_Y - 60, 70, 60);

      // Sewer Steam wisps rising
      ctx.fillStyle = 'rgba(226, 232, 240, 0.15)';
      for (let s = 0; s < 5; s++) {
        const sy = GROUND_Y - 15 - s * 14;
        const sx = 360 + Math.sin(animTimer * 0.08 + s) * 12;
        ctx.beginPath();
        ctx.arc(sx, sy, 12 + s * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'subway') {
      // White subway wall tiles with grey grout
      ctx.fillStyle = '#262626';
      ctx.fillRect(0, 30, CANVAS_WIDTH, GROUND_Y - 30);
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 1;
      for (let tx = 0; tx < CANVAS_WIDTH; tx += 40) {
        ctx.beginPath();
        ctx.moveTo(tx, 30);
        ctx.lineTo(tx, GROUND_Y);
        ctx.stroke();
      }
      for (let ty = 30; ty < GROUND_Y; ty += 25) {
        ctx.beginPath();
        ctx.moveTo(0, ty);
        ctx.lineTo(CANVAS_WIDTH, ty);
        ctx.stroke();
      }

      // Concrete pillars with safety yellow stripes
      const pillars = [120, 380, 640];
      pillars.forEach((px) => {
        ctx.fillStyle = '#52525b';
        ctx.fillRect(px, 30, 60, GROUND_Y - 30);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(px, 120, 60, 18);
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + 10, 120, 12, 18);
        ctx.fillRect(px + 38, 120, 12, 18);
      });

      // Passing express train silhouette in background
      const trainX = ((animTimer * 8) % (CANVAS_WIDTH + 600)) - 400;
      ctx.fillStyle = '#171717';
      ctx.fillRect(trainX, 160, 380, 80);
      ctx.fillStyle = '#fef08a';
      for (let w = 0; w < 5; w++) {
        ctx.fillRect(trainX + 25 + w * 70, 175, 45, 25);
      }

      // Overhead Metro Transit Sign
      ctx.fillStyle = '#09090b';
      ctx.fillRect(250, 45, 300, 38);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.strokeRect(250, 45, 300, 38);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LINE 4 • DOWNTOWN EXPRESS ➔', 400, 69);
    } else if (theme === 'chinatown') {
      // Pagoda roof silhouettes
      ctx.fillStyle = '#31101e';
      ctx.beginPath();
      ctx.moveTo(80, 110);
      ctx.quadraticCurveTo(200, 70, 320, 110);
      ctx.lineTo(310, 130);
      ctx.lineTo(90, 130);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(480, 100);
      ctx.quadraticCurveTo(620, 60, 760, 100);
      ctx.lineTo(750, 120);
      ctx.lineTo(490, 120);
      ctx.closePath();
      ctx.fill();

      // Swaying silk lanterns with candle glow
      for (let i = 0; i < 6; i++) {
        const lx = 70 + i * 130;
        const sway = Math.sin(animTimer * 0.05 + i * 1.2) * 5;
        // String
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, 60);
        ctx.lineTo(lx + sway, 90);
        ctx.stroke();

        // Lantern radial glow
        const glow = ctx.createRadialGradient(lx + sway, 105, 4, lx + sway, 105, 24);
        glow.addColorStop(0, '#fef08a');
        glow.addColorStop(0.4, '#ef4444');
        glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx + sway, 105, 24, 0, Math.PI * 2);
        ctx.fill();

        // Lantern body
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(lx + sway, 105, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(lx + sway - 5, 101, 10, 8);
      }

      // Neon Kanji Arch ("DRAGON CLASH")
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#fde047';
      ctx.font = '900 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('龍 虎 門 ★ CHINATOWN CLASH', 400, 50);
      ctx.shadowBlur = 0;
    } else if (theme === 'docks') {
      // Harbor ocean water in horizon
      ctx.fillStyle = '#0c4a6e';
      ctx.fillRect(0, GROUND_Y - 90, CANVAS_WIDTH, 90);

      // Cargo shipping container stacks
      const containers = [
        { x: 40, y: GROUND_Y - 140, w: 140, h: 55, col: '#b91c1c', txt: 'MAERSK' },
        { x: 40, y: GROUND_Y - 85, w: 140, h: 85, col: '#0369a1', txt: 'PACIFIC' },
        { x: 190, y: GROUND_Y - 110, w: 130, h: 110, col: '#ca8a04', txt: 'CARGO' },
        { x: 620, y: GROUND_Y - 130, w: 140, h: 65, col: '#047857', txt: 'EVERGREEN' },
        { x: 620, y: GROUND_Y - 65, w: 140, h: 65, col: '#7c3aed', txt: 'GLOBAL' },
      ];
      containers.forEach((c) => {
        ctx.fillStyle = c.col;
        ctx.fillRect(c.x, c.y, c.w, c.h);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(c.txt, c.x + 12, c.y + 24);
      });

      // Giant Harbor Gantry Crane
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(480, GROUND_Y);
      ctx.lineTo(540, 45);
      ctx.lineTo(720, 45);
      ctx.lineTo(760, GROUND_Y);
      ctx.moveTo(540, 45);
      ctx.lineTo(440, 45);
      ctx.stroke();

      // Blinking Harbor Beacon
      const beaconAlpha = 0.5 + Math.sin(animTimer * 0.1) * 0.5;
      ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
      ctx.beginPath();
      ctx.arc(540, 42, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (theme === 'warehouse') {
      // Industrial Steel Girders
      ctx.fillStyle = '#27272a';
      ctx.fillRect(0, 30, CANVAS_WIDTH, 20);
      for (let gx = 60; gx < CANVAS_WIDTH; gx += 160) {
        ctx.fillRect(gx, 30, 24, GROUND_Y - 30);
      }

      // Molten Foundry Furnace
      const furnaceGlow = ctx.createRadialGradient(400, GROUND_Y - 40, 10, 400, GROUND_Y - 40, 160);
      furnaceGlow.addColorStop(0, '#f97316');
      furnaceGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.4)');
      furnaceGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = furnaceGlow;
      ctx.fillRect(200, GROUND_Y - 180, 400, 180);

      // Furnace frame
      ctx.fillStyle = '#18181b';
      ctx.fillRect(320, GROUND_Y - 120, 160, 120);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(340, GROUND_Y - 80, 120, 70);

      // Rising molten sparks
      for (let p = 0; p < 14; p++) {
        const px = 330 + ((p * 29 + animTimer * 4) % 140);
        const py = GROUND_Y - 30 - ((animTimer * 3 + p * 20) % 140);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px, py, 3, 3);
      }
    } else if (theme === 'rooftop') {
      // Skyscraper Skyline with lit windows
      const towers = [
        { x: 40, w: 80, h: 220 },
        { x: 130, w: 70, h: 260 },
        { x: 210, w: 90, h: 200 },
        { x: 310, w: 100, h: 280 },
        { x: 420, w: 85, h: 240 },
        { x: 520, w: 95, h: 270 },
        { x: 630, w: 110, h: 210 },
      ];
      towers.forEach((t) => {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(t.x, GROUND_Y - t.h, t.w, t.h);
        ctx.fillStyle = '#fef08a';
        for (let wy = GROUND_Y - t.h + 20; wy < GROUND_Y - 20; wy += 26) {
          for (let wx = t.x + 10; wx < t.x + t.w - 10; wx += 16) {
            if ((wx + wy) % 5 !== 0) {
              ctx.fillRect(wx, wy, 8, 12);
            }
          }
        }
      });

      // Helipad Ring
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(400, GROUND_Y - 25, 120, 22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '900 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('H', 400, GROUND_Y - 18);

      // Rain streaks
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.35)';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < 25; r++) {
        const rx = (r * 35 + animTimer * 10) % CANVAS_WIDTH;
        const ry = (animTimer * 18 + r * 15) % (GROUND_Y - 30);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 10, ry + 22);
        ctx.stroke();
      }
    } else if (theme === 'arena') {
      // Chain-link cage fence texture
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x + (GROUND_Y - 40), GROUND_Y);
        ctx.moveTo(x, 40);
        ctx.lineTo(x - (GROUND_Y - 40), GROUND_Y);
        ctx.stroke();
      }

      // Stadium floodlights with volumetric glow
      const lights = [160, 400, 640];
      lights.forEach((lx) => {
        // Spotlight cone
        const cone = ctx.createLinearGradient(lx, 20, lx, GROUND_Y);
        cone.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        cone.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = cone;
        ctx.beginPath();
        ctx.moveTo(lx - 20, 20);
        ctx.lineTo(lx + 20, 20);
        ctx.lineTo(lx + 80, GROUND_Y);
        ctx.lineTo(lx - 80, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Light bulb
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lx, 20, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cheering crowd silhouettes
      ctx.fillStyle = '#0f051d';
      for (let c = 0; c < 35; c++) {
        const cx = c * 24;
        const bob = Math.sin(animTimer * 0.15 + c) * 6;
        ctx.beginPath();
        ctx.arc(cx, GROUND_Y - 40 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 10, GROUND_Y - 32 + bob, 20, 32 - bob);
      }
    } else if (theme === 'cyber') {
      // Neon holographic billboards
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#06b6d4';
      ctx.font = '900 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('CYBER // ZONE 08', 50, 75);

      ctx.shadowColor = '#ec4899';
      ctx.fillStyle = '#ec4899';
      ctx.fillText('NEO-TOKYO CLASH', 480, 95);
      ctx.shadowBlur = 0;

      // Heavy rain with puddle ripples
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.2;
      for (let r = 0; r < 30; r++) {
        const rx = (r * 32 + animTimer * 8) % CANVAS_WIDTH;
        const ry = (animTimer * 16 + r * 18) % (GROUND_Y - 20);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 8, ry + 20);
        ctx.stroke();
      }
    } else if (theme === 'bridge') {
      // Suspension Bridge Towers & Cables
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(200, 40, 35, GROUND_Y - 40);
      ctx.fillRect(560, 40, 35, GROUND_Y - 40);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      // Main catenary suspension cable
      ctx.beginPath();
      ctx.moveTo(0, 100);
      ctx.quadraticCurveTo(200, 40, 380, 140);
      ctx.quadraticCurveTo(560, 40, CANVAS_WIDTH, 100);
      ctx.stroke();

      // Vertical hanger cables
      for (let vx = 50; vx < CANVAS_WIDTH; vx += 30) {
        ctx.beginPath();
        ctx.moveTo(vx, 80);
        ctx.lineTo(vx, GROUND_Y);
        ctx.stroke();
      }
    } else if (theme === 'penthouse') {
      // Panoramic skyscraper window frames
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 35);
      ctx.fillRect(0, 0, 30, GROUND_Y);
      ctx.fillRect(CANVAS_WIDTH - 30, 0, 30, GROUND_Y);
      ctx.fillRect(260, 0, 14, GROUND_Y);
      ctx.fillRect(520, 0, 14, GROUND_Y);

      // Night city glittering below
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 40; i++) {
        const px = (i * 22) % CANVAS_WIDTH;
        const py = 120 + ((i * 17) % (GROUND_Y - 140));
        ctx.fillRect(px, py, 4, 4);
      }
    } else if (theme === 'volcano') {
      // Jagged obsidian cavern rocks
      ctx.fillStyle = '#1c0505';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(120, 80);
      ctx.lineTo(240, 30);
      ctx.lineTo(380, 90);
      ctx.lineTo(520, 40);
      ctx.lineTo(660, 100);
      ctx.lineTo(CANVAS_WIDTH, 0);
      ctx.closePath();
      ctx.fill();

      // Molten magma river glow
      const lavaGlow = ctx.createLinearGradient(0, GROUND_Y - 80, 0, GROUND_Y);
      lavaGlow.addColorStop(0, 'rgba(234, 88, 12, 0)');
      lavaGlow.addColorStop(0.6, '#f97316');
      lavaGlow.addColorStop(1, '#ea580c');
      ctx.fillStyle = lavaGlow;
      ctx.fillRect(0, GROUND_Y - 70, CANVAS_WIDTH, 70);

      // Rising volcanic fire embers
      for (let e = 0; e < 20; e++) {
        const ex = (e * 42 + animTimer * 2) % CANVAS_WIDTH;
        const ey = GROUND_Y - 20 - ((animTimer * 3 + e * 18) % 180);
        ctx.fillStyle = e % 2 === 0 ? '#fef08a' : '#f97316';
        ctx.fillRect(ex, ey, 3.5, 3.5);
      }
    } else if (theme === 'snow') {
      // Snow-covered temple & mountain peaks
      ctx.fillStyle = '#0f2b48';
      ctx.beginPath();
      ctx.moveTo(60, GROUND_Y - 180);
      ctx.lineTo(240, GROUND_Y);
      ctx.lineTo(0, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(560, GROUND_Y - 210);
      ctx.lineTo(760, GROUND_Y);
      ctx.lineTo(400, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Snow flurry blizzard
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 45; s++) {
        const sx = (s * 25 + animTimer * 4) % CANVAS_WIDTH;
        const sy = (animTimer * 5 + s * 14) % (GROUND_Y - 20);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5 + (s % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (theme === 'train') {
      // Speeding bullet train roof panels
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 40, CANVAS_WIDTH, GROUND_Y - 40);

      // Metallic seams
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      for (let x = 0; x < CANVAS_WIDTH; x += 120) {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, GROUND_Y);
        ctx.stroke();
      }

      // Parallax telegraph poles rushing by
      const poleX = ((animTimer * 18) % (CANVAS_WIDTH + 200)) - 100;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(poleX, 0);
      ctx.lineTo(poleX, GROUND_Y);
      ctx.stroke();

      // High-speed wind lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      for (let w = 0; w < 10; w++) {
        const wx = ((animTimer * 25 + w * 90) % (CANVAS_WIDTH + 150)) - 75;
        const wy = 70 + w * 22;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx - 80, wy);
        ctx.stroke();
      }
    } else if (theme === 'space') {
      // Deep space starfield
      ctx.fillStyle = '#ffffff';
      for (let st = 0; st < 60; st++) {
        const stX = (st * 37) % CANVAS_WIDTH;
        const stY = (st * 19) % (GROUND_Y - 60);
        const stSize = (st % 3 === 0) ? 2 : 1;
        ctx.fillRect(stX, stY, stSize, stSize);
      }

      // Curvature of Planet Earth in low orbit
      const earthGrad = ctx.createLinearGradient(0, GROUND_Y - 140, 0, GROUND_Y);
      earthGrad.addColorStop(0, 'rgba(14, 165, 233, 0.1)');
      earthGrad.addColorStop(0.5, '#0284c7');
      earthGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(400, GROUND_Y + 450, 520, Math.PI, Math.PI * 2);
      ctx.fill();

      // Glowing atmospheric limb
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(400, GROUND_Y + 450, 520, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else if (theme === 'colosseum') {
      // Grand stone archways
      ctx.fillStyle = '#291811';
      for (let a = 0; a < 6; a++) {
        const ax = a * 140;
        ctx.fillRect(ax + 10, 50, 40, GROUND_Y - 50);
        ctx.beginPath();
        ctx.arc(ax + 75, 90, 45, Math.PI, 0);
        ctx.fill();
      }

      // Flaming torches with animated fire
      const torches = [120, 360, 600];
      torches.forEach((tx) => {
        // Torch bracket
        ctx.fillStyle = '#78350f';
        ctx.fillRect(tx - 4, 110, 8, 25);
        // Flame
        const fSway = Math.sin(animTimer * 0.2 + tx) * 3;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(tx + fSway, 100, 10, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(tx + fSway * 0.6, 102, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 3. Ground / Floor with Realistic Texture & Puddle Reflections
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    if (theme === 'volcano') {
      groundGrad.addColorStop(0, '#450a0a');
      groundGrad.addColorStop(0.3, '#1c0505');
      groundGrad.addColorStop(1, '#050101');
    } else if (theme === 'snow') {
      groundGrad.addColorStop(0, '#cbd5e1');
      groundGrad.addColorStop(0.3, '#94a3b8');
      groundGrad.addColorStop(1, '#475569');
    } else if (theme === 'space' || theme === 'train') {
      groundGrad.addColorStop(0, '#334155');
      groundGrad.addColorStop(0.3, '#1e293b');
      groundGrad.addColorStop(1, '#0f172a');
    } else {
      groundGrad.addColorStop(0, '#1e293b');
      groundGrad.addColorStop(0.2, '#0f172a');
      groundGrad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Curb / Border texture line
    ctx.fillStyle = theme === 'snow' ? '#e2e8f0' : '#475569';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

    // Wet Puddle Reflections for rainy / urban arenas
    if (theme === 'cyber' || theme === 'alley' || theme === 'rooftop') {
      ctx.fillStyle = theme === 'cyber' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(148, 163, 184, 0.18)';
      ctx.beginPath();
      ctx.ellipse(220, GROUND_Y + 35, 75, 12, 0, 0, Math.PI * 2);
      ctx.ellipse(580, GROUND_Y + 40, 95, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Road dashed stripes / floor markers
    if (theme !== 'volcano' && theme !== 'snow' && theme !== 'space') {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.5)';
      for (let x = 20; x < CANVAS_WIDTH; x += 80) {
        ctx.fillRect(x, GROUND_Y + 32, 42, 5);
      }
    }

    ctx.restore();
  }

  // Draw Player Character with geometric animation
  drawPlayer(player) {
    const ctx = this.ctx;
    ctx.save();

    // Floor Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, GROUND_Y - 2, player.width * 0.7, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const isFacingRight = player.facing === 'right';
    const cx = player.x + player.width / 2;
    const cy = player.y;

    // Flash white if recently hit
    if (player.invulnerable > 0 && Math.floor(player.animTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.6;
    }

    // Shield effect if crouching/blocking
    if (player.isCrouching) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const sx = isFacingRight ? cx + 15 : cx - 15;
      ctx.arc(sx, cy + player.height * 0.4, 30, isFacingRight ? -Math.PI / 2 : Math.PI / 2, isFacingRight ? Math.PI / 2 : -Math.PI / 2);
      ctx.stroke();
    }

    // Special aura if performing special
    if (player.isSpecial) {
      ctx.save();
      ctx.shadowColor = player.data.secondaryColor;
      ctx.shadowBlur = 18;
      ctx.strokeStyle = player.data.secondaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(player.x - 4, player.y - 4, player.width + 8, player.height + 8);
      ctx.restore();
    }

    // Legs
    const walkOffset = Math.sin(player.animTimer * 0.3) * (player.vx !== 0 ? 8 : 2);
    ctx.fillStyle = player.data.clothColor;
    if (player.isCrouching) {
      ctx.fillRect(cx - 16, cy + 38, 14, 16);
      ctx.fillRect(cx + 2, cy + 38, 14, 16);
    } else {
      ctx.fillRect(cx - 14, cy + 42, 10, 32 + (player.vx !== 0 ? walkOffset : 0));
      ctx.fillRect(cx + 4, cy + 42, 10, 32 - (player.vx !== 0 ? walkOffset : 0));
    }

    // Torso / Gi / Jacket
    ctx.fillStyle = player.data.color;
    const bodyH = player.isCrouching ? 28 : 36;
    ctx.fillRect(cx - 16, cy + 14, 32, bodyH);

    // Belt / Trim
    ctx.fillStyle = player.data.secondaryColor;
    ctx.fillRect(cx - 16, cy + (player.isCrouching ? 36 : 42), 32, 6);

    // Head & Hair
    ctx.fillStyle = player.data.skinColor;
    const headY = player.isCrouching ? cy + 4 : cy - 2;
    ctx.beginPath();
    ctx.arc(cx, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Headband / Mask
    ctx.fillStyle = player.data.secondaryColor;
    if (player.id === 'sayon') {
      // Red martial headband
      ctx.fillRect(cx - 13, headY - 6, 26, 6);
      // Flowing tail
      const tailX = isFacingRight ? cx - 18 : cx + 14;
      ctx.fillRect(tailX, headY - 4, 10, 4);
    } else if (player.id === 'bob') {
      // Flat top brawler hair
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 14, headY - 14, 28, 8);
    } else if (player.id === 'kira') {
      // Ninja cowl
      ctx.fillStyle = '#581c87';
      ctx.fillRect(cx - 13, headY - 12, 26, 12);
      ctx.fillStyle = '#06b6d4'; // Glowing eyes
      ctx.fillRect(isFacingRight ? cx + 2 : cx - 8, headY - 2, 6, 3);
    } else if (player.id === 'jax') {
      // Cyborg visor
      ctx.fillStyle = '#10b981';
      ctx.fillRect(isFacingRight ? cx : cx - 10, headY - 3, 11, 4);
    }

    // Arms & Attack extension
    ctx.fillStyle = player.data.skinColor;
    if (player.isAttacking) {
      const punchReach = isFacingRight ? 36 : -36;
      ctx.fillStyle = player.data.secondaryColor;
      ctx.fillRect(cx + (isFacingRight ? 8 : -20), cy + 22, punchReach, 12);
      // Fist
      ctx.fillStyle = player.data.color;
      ctx.fillRect(cx + punchReach + (isFacingRight ? 0 : -8), cy + 20, 14, 16);
    } else if (player.isSpecial && player.id === 'sayon') {
      // Flying kick extension
      ctx.fillStyle = player.data.secondaryColor;
      const kickX = isFacingRight ? cx + 20 : cx - 40;
      ctx.fillRect(kickX, cy + 30, 35, 14);
    } else {
      // Idle arms
      ctx.fillRect(cx - (isFacingRight ? 18 : -10), cy + 20, 8, 20);
      ctx.fillRect(cx + (isFacingRight ? 10 : -18), cy + 20, 8, 20);
    }

    ctx.restore();
  }

  // Draw Standard Enemies
  drawEnemy(enemy) {
    const ctx = this.ctx;
    ctx.save();

    // Floor Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(enemy.x + enemy.width / 2, GROUND_Y - 2, enemy.width * 0.65, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const cx = enemy.x + enemy.width / 2;
    const cy = enemy.y;
    const isFacingRight = enemy.facing === 'right';

    // Flash on hitstun
    if (enemy.hitstun > 0 && Math.floor(enemy.animTimer / 3) % 2 === 0) {
      ctx.globalAlpha = 0.65;
    }

    // Legs
    const walk = Math.sin(enemy.animTimer * 0.25) * (enemy.vx !== 0 ? 6 : 0);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 12, cy + 40, 8, 30 + walk);
    ctx.fillRect(cx + 4, cy + 40, 8, 30 - walk);

    // Torso
    ctx.fillStyle = enemy.color;
    ctx.fillRect(cx - 14, cy + 12, 28, 32);

    // Head & Face
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 11, 0, Math.PI * 2);
    ctx.fill();

    // Bandana / Hat
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(cx - 12, cy - 8, 24, 5);

    // Punching arm
    if (enemy.isAttacking) {
      ctx.fillStyle = enemy.color;
      const reach = isFacingRight ? 28 : -28;
      ctx.fillRect(cx + (isFacingRight ? 6 : -18), cy + 20, reach, 10);
    } else {
      ctx.fillStyle = enemy.color;
      ctx.fillRect(cx - 16, cy + 18, 6, 18);
      ctx.fillRect(cx + 10, cy + 18, 6, 18);
    }

    // Overhead Small HP Bar
    const barW = 36;
    const barH = 5;
    const barX = cx - barW / 2;
    const barY = cy - 18;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(barX, barY, barW * hpRatio, barH);

    ctx.restore();
  }

  // Draw Boss with Distinctive Weapon/Visuals
  drawBoss(boss) {
    const ctx = this.ctx;
    ctx.save();

    // Floor Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(boss.x + boss.width / 2, GROUND_Y - 2, boss.width * 0.8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const cx = boss.x + boss.width / 2;
    const cy = boss.y;
    const isFacingRight = boss.facing === 'right';

    // Boss special aura
    if (boss.isSpecial) {
      ctx.save();
      ctx.shadowColor = boss.data.weaponColor;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = boss.data.weaponColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(boss.x - 6, boss.y - 6, boss.width + 12, boss.height + 12);
      ctx.restore();
    }

    // Boss Body (Larger silhouette)
    ctx.fillStyle = boss.color;
    ctx.fillRect(cx - 18, cy + 16, 36, 42);

    // Boss Legs
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 16, cy + 54, 12, 32);
    ctx.fillRect(cx + 4, cy + 54, 12, 32);

    // Boss Head
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Specific Boss Weapon / Visual Features:
    ctx.fillStyle = boss.data.weaponColor;
    if (boss.attackType === 'hammer') {
      // Sledge's Giant Hammer
      const hx = isFacingRight ? cx + 24 : cx - 36;
      ctx.fillRect(hx, cy + 10, 14, 40);
      ctx.fillStyle = '#475569';
      ctx.fillRect(hx - 8, cy + 6, 30, 18);
    } else if (boss.attackType === 'staff') {
      // Master Lee's Bo Staff
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx + (isFacingRight ? 10 : -10), cy - 20);
      ctx.lineTo(cx + (isFacingRight ? 35 : -35), cy + 70);
      ctx.stroke();
    } else if (boss.attackType === 'shieldWall') {
      // Iron Wall Riot Shield
      ctx.fillStyle = '#334155';
      const sx = isFacingRight ? cx + 14 : cx - 28;
      ctx.fillRect(sx, cy + 10, 16, 60);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(sx + 3, cy + 25, 10, 10);
    } else if (boss.attackType === 'pistol') {
      // Cross's Dual Pistols
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(isFacingRight ? cx + 18 : cx - 28, cy + 24, 16, 7);
    } else if (boss.attackType === 'teleportShadow') {
      // Overlord Shadow dark particle swirl
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(isFacingRight ? cx + 6 : cx - 6, cy - 2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (boss.attackType === 'fireStomp') {
      // Ignis: Magma spikes & flaming fists
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(cx, cy - 16, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(isFacingRight ? cx + 18 : cx - 28, cy + 24, 14, 14);
    } else if (boss.attackType === 'iceShards') {
      // Frostbite: Ice crystal horns & frost blades
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(isFacingRight ? cx + 16 : cx - 26, cy + 20, 16, 8);
    } else if (boss.attackType === 'sonicDash') {
      // Phantom Bullet: Neon cyber visor & wind aura
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(cx - 8, cy - 4, 16, 4);
    } else if (boss.attackType === 'orbitalBeam') {
      // Omega Core: Mechanized plasma conduits
      ctx.fillStyle = '#10b981';
      ctx.fillRect(isFacingRight ? cx + 18 : cx - 28, cy + 18, 14, 18);
    } else if (boss.attackType === 'apexCataclysm') {
      // Arch-Overlord Shin: Void Dragon Emperor Halo
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // Draw Top HUD (Player HP, Energy, Score, Level Info, Boss HP, Arena Display, Dev Intro)
  drawHUD(player, currentLevel, activeBoss, activeArenaName = '', arenaBannerTimer = 0, devIntroTimer = 0) {
    const ctx = this.ctx;
    ctx.save();

    // Top HUD Bar Background
    ctx.fillStyle = 'rgba(10, 10, 18, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 48);
    ctx.strokeStyle = '#27273d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(CANVAS_WIDTH, 48);
    ctx.stroke();

    // Player Avatar Box
    ctx.fillStyle = player.data.color;
    ctx.fillRect(12, 8, 32, 32);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(12, 8, 32, 32);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(player.name.charAt(0), 22, 30);

    // Player HP Bar
    const hpBarX = 52;
    const hpBarY = 10;
    const hpBarW = 160;
    const hpBarH = 14;

    ctx.fillStyle = '#1e1e2d';
    ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);
    const hpRatio = Math.max(0, player.hp / player.maxHp);
    ctx.fillStyle = hpRatio > 0.3 ? '#22c55e' : '#ef4444';
    ctx.fillRect(hpBarX, hpBarY, hpBarW * hpRatio, hpBarH);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px monospace';
    ctx.fillText(`HP ${Math.round(player.hp)}/${player.maxHp}`, hpBarX + 4, hpBarY + 11);

    // Player Energy / Mana Bar
    const spBarY = 28;
    const spBarH = 10;
    ctx.fillStyle = '#1e1e2d';
    ctx.fillRect(hpBarX, spBarY, hpBarW, spBarH);
    const spRatio = Math.max(0, player.energy / player.maxEnergy);
    ctx.fillStyle = spRatio >= 1.0 ? '#a855f7' : '#3b82f6';
    ctx.fillRect(hpBarX, spBarY, hpBarW * spRatio, spBarH);
    ctx.strokeRect(hpBarX, spBarY, hpBarW, spBarH);

    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText(`SP ${Math.round(player.energy)}%`, hpBarX + 4, spBarY + 8);

    // Level Display & Score (Center)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px sans-serif';
    const lvlNum = currentLevel?.level || 1;
    const lvlName = (currentLevel?.name || 'Urban District').toUpperCase();
    ctx.fillText(`LEVEL ${lvlNum}: ${lvlName}`, CANVAS_WIDTH / 2, 17);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    const arenaDisp = (activeArenaName || 'Downtown Alleyway').toUpperCase();
    ctx.fillText(`SCORE: ${player?.score || 0}  •  [B] ARENA: ${arenaDisp}`, CANVAS_WIDTH / 2, 34);

    // Active Boss Bar (Top Center so it doesn't overlap top-right high scores box)
    if (activeBoss && activeBoss.active) {
      const bBarW = 240;
      const bBarX = CANVAS_WIDTH / 2 - bBarW / 2;
      const bBarY = 48;
      const bBarH = 14;

      ctx.fillStyle = '#1e1e2d';
      ctx.fillRect(bBarX, bBarY, bBarW, bBarH);
      const bHpRatio = Math.max(0, activeBoss.hp / activeBoss.maxHp);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(bBarX, bBarY, bBarW * bHpRatio, bBarH);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bBarX, bBarY, bBarW, bBarH);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      const bossName = (activeBoss.name || 'Boss').toUpperCase();
      ctx.fillText(`⚔️ BOSS: ${bossName} • ${Math.round(activeBoss.hp)} / ${activeBoss.maxHp}`, CANVAS_WIDTH / 2, bBarY + 11);
    }

    // Arena Change Toast Notification Banner
    if (arenaBannerTimer > 0) {
      const bAlpha = Math.min(1.0, arenaBannerTimer / 20);
      ctx.save();
      ctx.globalAlpha = bAlpha;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(CANVAS_WIDTH / 2 - 160, 68, 320, 26);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(CANVAS_WIDTH / 2 - 160, 68, 320, 26);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`🏟️ ARENA: ${arenaDisp}`, CANVAS_WIDTH / 2, 85);
      ctx.restore();
    }

    // Cinematic Intro Toast Banner: Developed by Sayon
    if (devIntroTimer > 0) {
      this.drawDevIntro(devIntroTimer);
    }

    // Combo Counter
    if (player.comboCount > 1) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'italic bold 20px sans-serif';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      let comboRank = 'GOOD!';
      if (player.comboCount >= 15) comboRank = 'UNSTOPPABLE GOD!';
      else if (player.comboCount >= 10) comboRank = 'ULTRA CLASH!';
      else if (player.comboCount >= 5) comboRank = 'SUPER COMBO!';
      ctx.fillText(`${player.comboCount} HIT ${comboRank}`, 52, 75);
    }

    ctx.restore();
  }

  // Cinematic Intro Splash when game starts
  drawDevIntro(timer) {
    const ctx = this.ctx;
    ctx.save();
    const alpha = Math.min(1.0, timer / 25);
    ctx.globalAlpha = alpha;

    const w = 380;
    const h = 58;
    const x = CANVAS_WIDTH / 2 - w / 2;
    const y = 80;

    // Glowing arcade banner
    ctx.fillStyle = 'rgba(10, 10, 20, 0.92)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 14;
    ctx.strokeRect(x, y, w, h);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px system-ui, sans-serif';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillText('⚔️ URBAN CLASH ⚔️', CANVAS_WIDTH / 2, y + 23);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px monospace';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.fillText('⚡ DEVELOPED BY SAYON ⚡', CANVAS_WIDTH / 2, y + 45);

    ctx.restore();
  }

  // Draw Character Selection Screen
  drawSelectScreen(roster, selectedId, animTimer, isSayonUnlocked = false, lockNotice = '', activeArena = null, selectedStage = null) {
    const ctx = this.ctx;
    ctx.save();

    // Dark Arcade Background
    ctx.fillStyle = '#090910';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Header Title & Developed by Sayon
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 30px system-ui, sans-serif';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 14;
    ctx.fillText('URBAN CLASH', CANVAS_WIDTH / 2, 35);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px monospace';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.fillText('⚡ DEVELOPED BY SAYON ⚡', CANVAS_WIDTH / 2, 52);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.shadowBlur = 0;
    ctx.fillText('SELECT YOUR STREET FIGHTER', CANVAS_WIDTH / 2, 69);

    // Character Selection Cards
    const fighterKeys = Object.keys(roster);
    const cardWidth = 160;
    const cardHeight = 224;
    const spacing = 24;
    const totalW = fighterKeys.length * cardWidth + (fighterKeys.length - 1) * spacing;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    const cardY = 80;

    fighterKeys.forEach((key, idx) => {
      const f = roster[key];
      const isLocked = f.isSecretLocked && !isSayonUnlocked;
      const cx = startX + idx * (cardWidth + spacing);
      const isSelected = f.id === selectedId;

      // Card Box
      ctx.fillStyle = isSelected ? (isLocked ? '#27171d' : '#1e1b4b') : (isLocked ? '#0e0e16' : '#11111e');
      ctx.fillRect(cx, cardY, cardWidth, cardHeight);

      ctx.strokeStyle = isSelected ? (isLocked ? '#f43f5e' : f.color) : (isLocked ? '#4c1d24' : '#27273a');
      ctx.lineWidth = isSelected ? 3 : 1;
      if (isSelected) {
        ctx.shadowColor = isLocked ? '#f43f5e' : f.color;
        ctx.shadowBlur = 12;
      }
      ctx.strokeRect(cx, cardY, cardWidth, cardHeight);
      ctx.shadowBlur = 0;

      // Fighter Miniature Sprite Preview
      const previewY = cardY + 70;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx + cardWidth / 2, previewY + 36, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!isLocked) {
        // Body preview
        ctx.fillStyle = f.color;
        ctx.fillRect(cx + cardWidth / 2 - 14, previewY - 14, 28, 30);
        // Head
        ctx.fillStyle = f.skinColor;
        ctx.beginPath();
        ctx.arc(cx + cardWidth / 2, previewY - 26, 12, 0, Math.PI * 2);
        ctx.fill();
        // Accent
        ctx.fillStyle = f.secondaryColor;
        ctx.fillRect(cx + cardWidth / 2 - 12, previewY - 32, 24, 6);

        // Name & Title
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(f.name, cx + cardWidth / 2, cardY + 130);

        ctx.fillStyle = f.id === 'sayon' ? '#f59e0b' : '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(f.id === 'sayon' ? '★ UNLOCKED GRANDMASTER' : f.title, cx + cardWidth / 2, cardY + 146);
      } else {
        // Locked silhouette
        ctx.fillStyle = '#1e1e2d';
        ctx.fillRect(cx + cardWidth / 2 - 14, previewY - 14, 28, 30);
        ctx.beginPath();
        ctx.arc(cx + cardWidth / 2, previewY - 26, 12, 0, Math.PI * 2);
        ctx.fill();

        // Lock icon
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx + cardWidth / 2, previewY - 12, 10, Math.PI, 0, false);
        ctx.stroke();

        ctx.fillStyle = '#e11d48';
        ctx.fillRect(cx + cardWidth / 2 - 12, previewY - 12, 24, 18);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + cardWidth / 2, previewY - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Name & Locked Status
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f43f5e';
        ctx.font = '900 15px sans-serif';
        ctx.fillText('LOCKED', cx + cardWidth / 2, cardY + 128);

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('WIN GAME TO UNLOCK', cx + cardWidth / 2, cardY + 145);
      }

      // Mini Stat Bars
      const stats = [
        { label: 'SPD', val: f.stats.speed },
        { label: 'POW', val: f.stats.power },
        { label: 'DEF', val: f.stats.defense },
      ];
      stats.forEach((st, sIdx) => {
        const sy = cardY + 164 + sIdx * 16;
        ctx.textAlign = 'left';
        ctx.fillStyle = isLocked ? '#475569' : '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(st.label, cx + 12, sy + 7);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx + 42, sy, 100, 8);
        ctx.fillStyle = isLocked ? '#4b5563' : f.color;
        ctx.fillRect(cx + 42, sy, (100 * st.val) / 100, 8);
      });

      // Special badge for Sayon
      if (f.id === 'sayon') {
        ctx.fillStyle = isLocked ? '#881337' : '#ea580c';
        ctx.fillRect(cx + cardWidth - 68, cardY + 6, 62, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isLocked ? '🔒 LOCKED' : '★ SUPREME', cx + cardWidth - 37, cardY + 18);
      }

      // If selected, draw "CLICK TO FIGHT" badge at bottom of card
      if (isSelected) {
        ctx.fillStyle = isLocked ? '#e11d48' : '#22c55e';
        ctx.fillRect(cx + 8, cardY + cardHeight - 20, cardWidth - 16, 16);
        ctx.fillStyle = isLocked ? '#ffffff' : '#052e16';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isLocked ? '🔒 LOCKED' : 'SELECTED [READY]', cx + cardWidth / 2, cardY + cardHeight - 8);
      }
    });

    // Selected Fighter Detail Footer
    const selFighter = roster[selectedId] || roster.bob;
    const isSelectedLocked = selFighter?.isSecretLocked && !isSayonUnlocked;
    if (selFighter) {
      ctx.fillStyle = isSelectedLocked ? '#220e17' : '#131322';
      ctx.fillRect(startX, 315, totalW, 46);
      ctx.strokeStyle = isSelectedLocked ? '#881337' : '#2a2a40';
      ctx.strokeRect(startX, 315, totalW, 46);

      ctx.textAlign = 'left';
      if (isSelectedLocked) {
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🔒 SAYON IS LOCKED! Defeat Level 15 Final Boss with Bob, Kira, or Jax to unlock!', startX + 12, 332);

        ctx.fillStyle = '#fda4af';
        ctx.font = '11px sans-serif';
        ctx.fillText('Grandmaster Sayon: 200 HP, 150 SP, 35 Power, 100 Speed, and Dragon God Barrage!', startX + 12, 350);
      } else {
        ctx.fillStyle = selFighter.id === 'sayon' ? '#f59e0b' : '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`SPECIAL MOVE: ${selFighter.specialName} [X Key] ${selFighter.id === 'sayon' ? '★ SUPREME GOD TIER' : ''}`, startX + 12, 332);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(selFighter.specialDesc, startX + 12, 350);
      }
    }

    // Interactive Selected Stage & Arena Badges in Selection Screen
    const stageName = selectedStage ? `STAGE ${selectedStage.level}: ${selectedStage.name.toUpperCase()}` : 'STAGE 1: DOWNTOWN';
    const arenaTitle = activeArena && activeArena.name ? activeArena.name.toUpperCase() : 'DEFAULT';

    ctx.textAlign = 'center';
    // Stage Badge (Left)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(CANVAS_WIDTH / 2 - 210, 368, 205, 22);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 210, 368, 205, 22);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`🗺️ ${stageName.slice(0, 22)} [N]`, CANVAS_WIDTH / 2 - 108, 383);

    // Arena Badge (Right)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(CANVAS_WIDTH / 2 + 5, 368, 205, 22);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH / 2 + 5, 368, 205, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`🏟️ ARENA: ${arenaTitle.slice(0, 16)} [B]`, CANVAS_WIDTH / 2 + 108, 383);

    // Lock alert notice
    if (lockNotice) {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(lockNotice, CANVAS_WIDTH / 2, 396);
    }

    // Big Prominent Start Button (Y: 396 to 442)
    const pulseAlpha = 0.8 + 0.2 * Math.sin(animTimer * 0.1);
    const btnW = 420;
    const btnH = 38;
    const btnX = CANVAS_WIDTH / 2 - btnW / 2;
    const btnY = 398;

    const grad = ctx.createLinearGradient(btnX, btnY, btnX, btnY + btnH);
    if (isSelectedLocked) {
      grad.addColorStop(0, '#581c87');
      grad.addColorStop(1, '#3b0764');
      ctx.fillStyle = grad;
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('🔒 SELECT BOB, KIRA, OR JAX TO PLAY [SAYON LOCKED]', CANVAS_WIDTH / 2, btnY + 24);
    } else {
      grad.addColorStop(0, '#e11d48');
      grad.addColorStop(1, '#9f1239');
      ctx.fillStyle = grad;
      ctx.fillRect(btnX, btnY, btnW, btnH);

      ctx.strokeStyle = `rgba(251, 191, 36, ${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('⚔️ CLICK HERE TO START BATTLE [OR PRESS SPACE / ENTER]', CANVAS_WIDTH / 2, btnY + 24);
    }

    ctx.restore();
  }

  // Draw Level Clear Banner
  drawLevelClear(level, score, timer) {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#22c55e';
    ctx.font = '900 36px system-ui, sans-serif';
    ctx.shadowColor = '#15803d';
    ctx.shadowBlur = 20;
    ctx.fillText('LEVEL CLEAR!', CANVAS_WIDTH / 2, 180);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${level?.name || 'Stage'} Cleared!`, CANVAS_WIDTH / 2, 220);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`STAGE CLEAR BONUS: +1000 PTS`, CANVAS_WIDTH / 2, 255);
    ctx.fillText(`TOTAL SCORE: ${score}`, CANVAS_WIDTH / 2, 280);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(`Proceeding to next chapter in ${Math.ceil(timer / 60)}s...`, CANVAS_WIDTH / 2, 330);

    ctx.restore();
  }

  // Draw Game Over Screen
  drawGameOver(score, levelNum) {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = 'rgba(10, 5, 5, 0.88)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 20;
    ctx.fillText('K.O. - GAME OVER', CANVAS_WIDTH / 2, 170);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Fallen at Level ${levelNum}`, CANVAS_WIDTH / 2, 215);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`FINAL SCORE: ${score}`, CANVAS_WIDTH / 2, 255);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('PRESS [SPACEBAR] OR CLICK TO RETRY', CANVAS_WIDTH / 2, 320);

    ctx.restore();
  }

  // Draw Grand Victory Screen (Level 15 Complete)
  drawVictory(score, fighterName, newlyUnlocked = false) {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = 'rgba(5, 10, 20, 0.92)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.font = '900 36px system-ui, sans-serif';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 25;
    ctx.fillText('VICTORY! ALL 15 LEVELS CONQUERED!', CANVAS_WIDTH / 2, 135);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Arch-Overlord Shin Defeated by ${fighterName}`, CANVAS_WIDTH / 2, 180);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(`GRAND CHAMPION SCORE: ${score}`, CANVAS_WIDTH / 2, 225);

    // Sayon Unlocked Celebration Banner
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(110, 255, CANVAS_WIDTH - 220, 72);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(110, 255, CANVAS_WIDTH - 220, 72);

    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 18px system-ui, sans-serif';
    ctx.fillText('★ SUPREME FIGHTER UNLOCKED: SAYON ★', CANVAS_WIDTH / 2, 285);

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('The most powerful grandmaster is now fully unlocked on the fighter selection screen!', CANVAS_WIDTH / 2, 308);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('PRESS [SPACEBAR] OR CLICK TO RETURN TO ROSTER', CANVAS_WIDTH / 2, 375);

    ctx.restore();
  }
}
