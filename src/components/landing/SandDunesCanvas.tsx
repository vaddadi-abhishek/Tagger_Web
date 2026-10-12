import { useEffect, useRef } from "react";
import * as THREE from "three";

interface SandDunesCanvasProps {
  isDark?: boolean;
}

export function SandDunesCanvas({ isDark = false }: SandDunesCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ══════════════════════════════════════════════════════════════════
    // DARK MODE: CELESTIAL STARS SYSTEM
    // (Flowing Dune Ribbon + Serene Non-Reactive Background Sky)
    // ══════════════════════════════════════════════════════════════════
    if (isDark) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 16);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // ──────────────────────────────────────────────────────────────────
      // LAYER 1: Deep Cosmic Background Stars (25,000 stars)
      // DOES NOT react to mouse cursor at all; softly twinkles across the sky
      // ──────────────────────────────────────────────────────────────────
      const BG_STARS_COUNT = 25000;
      const bgGeometry = new THREE.BufferGeometry();
      const bgPositions = new Float32Array(BG_STARS_COUNT * 3);
      // bgAttr: [starSize, twinkleSpeed, phase]
      const bgAttributes = new Float32Array(BG_STARS_COUNT * 3);
      const bgColorMix = new Float32Array(BG_STARS_COUNT);

      for (let i = 0; i < BG_STARS_COUNT; i++) {
        const i3 = i * 3;

        // Spread widely across viewport and deep in z-space
        bgPositions[i3] = (Math.random() - 0.5) * 64.0;
        bgPositions[i3 + 1] = (Math.random() - 0.5) * 38.0;
        bgPositions[i3 + 2] = -6.0 - Math.random() * 22.0;

        const sizeRoll = Math.random();
        let starSize: number;
        if (sizeRoll < 0.78) {
          starSize = 0.65 + Math.random() * 0.55; // subtle pinprick
        } else if (sizeRoll < 0.95) {
          starSize = 1.1 + Math.random() * 0.75;  // gentle star
        } else {
          starSize = 1.9 + Math.random() * 0.9;   // brighter beacon
        }

        const twinkleSpeed = 0.8 + Math.random() * 2.2;
        const phase = Math.random() * Math.PI * 2;

        bgAttributes[i3] = starSize;
        bgAttributes[i3 + 1] = twinkleSpeed;
        bgAttributes[i3 + 2] = phase;

        bgColorMix[i] = Math.random();
      }

      bgGeometry.setAttribute("position", new THREE.BufferAttribute(bgPositions, 3));
      bgGeometry.setAttribute("aAttr", new THREE.BufferAttribute(bgAttributes, 3));
      bgGeometry.setAttribute("aColorMix", new THREE.BufferAttribute(bgColorMix, 1));

      const bgVertexShader = `
        uniform float uTime;
        uniform float uPixelRatio;

        attribute vec3 aAttr; // [size, twinkleSpeed, phase]
        attribute float aColorMix;

        varying vec4 vColor;
        varying float vAlpha;

        void main() {
          float pSize = aAttr.x;
          float twinkleSpeed = aAttr.y;
          float phase = aAttr.z;

          // Subtle, serene deep-space cosmic drift across the sky (NO mouse interaction)
          float x = position.x + uTime * 0.025;
          x = mod(x + 32.0, 64.0) - 32.0;

          vec3 transformed = vec3(x, position.y, position.z);
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Gentle asynchronous twinkling
          float twinkle = 0.52 + 0.48 * sin(uTime * twinkleSpeed + phase);

          // Distance-attenuated point size
          float distToCam = -mvPosition.z;
          gl_PointSize = max((pSize * (0.8 + 0.4 * twinkle) * uPixelRatio * 22.0) / max(distToCam, 1.0), 1.0);

          // Soft starlight spectral colors
          vec3 colDiamond = vec3(0.96, 0.98, 1.00);
          vec3 colSirius  = vec3(0.75, 0.88, 1.00);
          vec3 colGold    = vec3(1.00, 0.88, 0.68);

          vec3 starColor;
          if (aColorMix < 0.48) {
            starColor = mix(colDiamond, colSirius, aColorMix / 0.48);
          } else {
            starColor = mix(colDiamond, colGold, (aColorMix - 0.48) / 0.52);
          }

          vColor = vec4(starColor, 1.0);
          vAlpha = (0.26 + 0.34 * twinkle);
        }
      `;

      const bgFragmentShader = `
        varying vec4 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);

          if (dist > 0.5) {
            discard;
          }

          float core = smoothstep(0.25, 0.0, dist);
          float halo = exp(-dist * 4.2);
          float brightness = core * 0.75 + halo * 0.45;

          gl_FragColor = vec4(vColor.rgb, brightness * vAlpha);
        }
      `;

      const bgMaterial = new THREE.ShaderMaterial({
        vertexShader: bgVertexShader,
        fragmentShader: bgFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const bgStars = new THREE.Points(bgGeometry, bgMaterial);
      scene.add(bgStars);

      // ──────────────────────────────────────────────────────────────────
      // LAYER 2: River of Stars (130,000 stream stars)
      // Flows exclusively along the exact light-mode sand dune S-curve line
      // and dynamically reacts to mouse cursor with streamline void deflection
      // ──────────────────────────────────────────────────────────────────
      const STREAM_STARS_COUNT = 130000;
      const streamGeometry = new THREE.BufferGeometry();
      const streamPositions = new Float32Array(STREAM_STARS_COUNT * 3);
      // aAttr1: [speed, transverse, starSize, colorMix]
      const streamAttributes1 = new Float32Array(STREAM_STARS_COUNT * 4);
      // aAttr2: [subLayer, phase, twinkleSpeed, unused]
      const streamAttributes2 = new Float32Array(STREAM_STARS_COUNT * 4);

      const xSpan = 38.0;

      for (let i = 0; i < STREAM_STARS_COUNT; i++) {
        const i3 = i * 3;
        const i4 = i * 4;

        const subLayer = i % 6;
        const phase = Math.random() * Math.PI * 2;
        const x = (Math.random() - 0.5) * xSpan;

        // Gaussian transverse dispersion matching sand dunes exactly
        const u1 = Math.random();
        const u2 = Math.random();
        const randNormal = Math.sqrt(-2.0 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2.0 * Math.PI * u2);
        const transverse = randNormal * 1.05;

        streamPositions[i3] = x;
        streamPositions[i3 + 1] = 0.0;
        streamPositions[i3 + 2] = (Math.random() - 0.5) * 2.5;

        // Laminar drift speed identical to sand dunes
        const speed = 0.42 + Math.random() * 0.42;

        // Hierarchical star size distribution for rich celestial depth
        const sizeRoll = Math.random();
        let starSize: number;
        if (sizeRoll < 0.70) {
          starSize = 0.85 + Math.random() * 0.75; // micro stardust
        } else if (sizeRoll < 0.92) {
          starSize = 1.7 + Math.random() * 1.3;  // medium twinkling star gems
        } else {
          starSize = 3.2 + Math.random() * 2.4;  // radiant stellar beacons with diffraction spikes
        }

        const colorMix = Math.random();
        streamAttributes1[i4] = speed;
        streamAttributes1[i4 + 1] = transverse;
        streamAttributes1[i4 + 2] = starSize;
        streamAttributes1[i4 + 3] = colorMix;

        const twinkleSpeed = 1.2 + Math.random() * 3.4;
        streamAttributes2[i4] = subLayer;
        streamAttributes2[i4 + 1] = phase;
        streamAttributes2[i4 + 2] = twinkleSpeed;
        streamAttributes2[i4 + 3] = 0.0;
      }

      streamGeometry.setAttribute("position", new THREE.BufferAttribute(streamPositions, 3));
      streamGeometry.setAttribute("aAttr1", new THREE.BufferAttribute(streamAttributes1, 4));
      streamGeometry.setAttribute("aAttr2", new THREE.BufferAttribute(streamAttributes2, 4));

      const streamVertexShader = `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uInfluence;
        uniform float uPixelRatio;

        attribute vec4 aAttr1; // speed, transverse, starSize, colorMix
        attribute vec4 aAttr2; // subLayer, phase, twinkleSpeed, unused

        varying vec4 vColor;
        varying float vAlpha;
        varying float vSize;
        varying float vTwinkle;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                     mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
        }

        void main() {
          float speed = aAttr1.x;
          float transverse = aAttr1.y;
          float pSize = aAttr1.z;
          float colorMix = aAttr1.w;

          float subLayer = aAttr2.x;
          float phase = aAttr2.y;
          float twinkleSpeed = aAttr2.z;

          // 1. Continuous laminar free flow along the EXACT same line as light mode sand dunes
          float width = 38.0;
          float drift = uTime * 0.46 * speed;
          float x = position.x + drift;
          x = mod(x + width * 0.5, width) - width * 0.5;

          // 2. Realistic Sand Dune Trajectory (Identical mathematical equation)
          float tRise = smoothstep(-6.0, 7.0, x);
          float baseY = mix(-2.3, 0.65, tRise);

          // Harmonic organic waves along the free-flowing dune spine
          float wave1 = sin(x * 0.22 - 0.2) * 0.52;
          float wave2 = cos(x * 0.46 + subLayer * 0.35) * 0.26;
          float wave3 = sin(x * 0.85 + phase * 0.4) * 0.12;
          float microNoise = (noise(vec2(x * 0.35, uTime * 0.08 + subLayer * 0.5)) - 0.5) * 0.22;

          float layerOffset = (subLayer - 2.5) * 0.34;
          float y = baseY + wave1 + wave2 + wave3 + microNoise + layerOffset + transverse;

          float z = position.z + cos(x * 0.2 + subLayer * 0.4) * 0.7;
          vec3 transformed = vec3(x, y, z);

          // 3. Stardust Parting Around Mouse (Streamline void deflection)
          if (uInfluence > 0.001) {
            vec2 toVoid = transformed.xy - uMouse;
            float dist = length(toVoid);
            float voidRadius = 2.8;
            float fieldRadius = voidRadius * 3.2;

            float proximity = smoothstep(fieldRadius, 0.0, dist) * uInfluence;

            if (proximity > 0.001) {
              float avoidance = hash(vec2(subLayer * 7.3 + phase * 1.7, colorMix * 11.0));
              float scatterAngle = noise(toVoid * 0.55 + uTime * 0.3 + phase * 0.6) * 6.2832;
              vec2 scatterDir = vec2(cos(scatterAngle), sin(scatterAngle));
              vec2 radialDir = (dist > 0.001) ? (toVoid / dist) : vec2(1.0, 0.0);

              vec2 scatterMotion = mix(scatterDir, radialDir, avoidance);
              float scatterStrength = proximity * proximity * voidRadius * 1.1;
              transformed.xy += scatterMotion * scatterStrength * (0.25 + avoidance * 0.85);

              float coreExclusion = smoothstep(voidRadius * 0.85, 0.0, dist) * avoidance;
              transformed.xy += radialDir * coreExclusion * voidRadius * 1.3;
              transformed.z += (noise(toVoid * 0.4 + uTime * 0.22 + phase) - 0.5) * proximity * 1.1;
            }
          }

          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // 4. Multi-frequency organic twinkling
          float t1 = sin(uTime * twinkleSpeed + phase);
          float t2 = cos(uTime * (twinkleSpeed * 0.63) + phase * 2.1);
          float twinkle = 0.52 + 0.48 * (0.65 * t1 + 0.35 * t2);
          vTwinkle = twinkle;

          // 5. Point Size with distance attenuation
          float distToCam = -mvPosition.z;
          float calculatedSize = (pSize * (0.75 + 0.45 * twinkle) * uPixelRatio * 26.0) / max(distToCam, 1.0);
          gl_PointSize = max(calculatedSize, 1.0);
          vSize = gl_PointSize;

          // 6. Stellar Spectral Colors (Diamond White, Starlight Gold, Sirius Ice Cyan, Solar Amber)
          vec3 colDiamond = vec3(0.98, 0.99, 1.00); // Pure White
          vec3 colGold    = vec3(1.00, 0.84, 0.54); // Mindspace Starlight Gold (#FFD78A)
          vec3 colIceBlue = vec3(0.74, 0.89, 1.00); // Sirius Cyan (#BDE3FF)
          vec3 colAmber   = vec3(1.00, 0.70, 0.34); // Solar Amber (#FFB357)

          vec3 starColor;
          if (colorMix < 0.38) {
            starColor = mix(colDiamond, colIceBlue, colorMix / 0.38);
          } else if (colorMix < 0.72) {
            starColor = mix(colDiamond, colGold, (colorMix - 0.38) / 0.34);
          } else if (colorMix < 0.88) {
            starColor = mix(colGold, colAmber, (colorMix - 0.72) / 0.16);
          } else {
            starColor = mix(colIceBlue, colDiamond, (colorMix - 0.88) / 0.12);
          }

          vColor = vec4(starColor, 1.0);

          float edgeFadeX = smoothstep(19.0, 13.5, abs(x));
          float densityFalloff = exp(-pow(transverse * 0.85, 2.0));
          vAlpha = edgeFadeX * (0.50 + 0.50 * densityFalloff) * (0.65 + 0.35 * twinkle);
        }
      `;

      const streamFragmentShader = `
        varying vec4 vColor;
        varying float vAlpha;
        varying float vSize;
        varying float vTwinkle;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);

          if (dist > 0.5) {
            discard;
          }

          // Soft atmospheric starlight halo
          float glow = exp(-dist * 4.6);
          // Crisp optical stellar core
          float core = smoothstep(0.18, 0.0, dist);

          // Telescope 4-point cross diffraction spikes for radiant stars
          float spikes = 0.0;
          if (vSize > 5.8) {
            float horiz = smoothstep(0.055, 0.0, abs(coord.y)) * smoothstep(0.48, 0.0, abs(coord.x));
            float vert  = smoothstep(0.055, 0.0, abs(coord.x)) * smoothstep(0.48, 0.0, abs(coord.y));
            spikes = (horiz + vert) * 0.44;
          }

          float brightness = (core * 0.88 + glow * 0.52 + spikes * 0.40) * vTwinkle;
          brightness = clamp(brightness, 0.0, 1.0);

          vec3 finalRgb = vColor.rgb + vec3(core * 0.35);
          float alpha = brightness * vAlpha;

          gl_FragColor = vec4(finalRgb, alpha);
        }
      `;

      const streamMaterial = new THREE.ShaderMaterial({
        vertexShader: streamVertexShader,
        fragmentShader: streamFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(999, 999) },
          uInfluence: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const streamPoints = new THREE.Points(streamGeometry, streamMaterial);
      scene.add(streamPoints);

      // Mouse interaction along the exact dune trajectory
      const mouseTarget = new THREE.Vector2(999, 999);
      const mouseCurrent = new THREE.Vector2(999, 999);
      let isPointerOnDune = false;
      let currentInfluence = 0;

      const getDuneCenterY = (x: number) => {
        const t = Math.max(0, Math.min(1, (x - (-6.0)) / (7.0 - (-6.0))));
        const smoothT = t * t * (3 - 2 * t);
        const baseY = -2.3 + smoothT * (0.65 - (-2.3));
        const wave1 = Math.sin(x * 0.22 - 0.2) * 0.52;
        return baseY + wave1;
      };

      const onPointerMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        const planeZ = 0;
        const fovRad = (camera.fov * Math.PI) / 180;
        const dist = camera.position.z - planeZ;
        const vHeight = 2 * Math.tan(fovRad / 2) * dist;
        const vWidth = vHeight * (rect.width / rect.height);

        const worldX = (ndcX * vWidth) / 2;
        const worldY = (ndcY * vHeight) / 2;

        mouseTarget.set(worldX, worldY);

        const duneY = getDuneCenterY(worldX);
        const distToDuneSpine = Math.abs(worldY - duneY);

        // Only stream particles along the dune line react to pointer
        if (distToDuneSpine <= 3.4 && worldX >= -18 && worldX <= 18) {
          isPointerOnDune = true;
        } else {
          isPointerOnDune = false;
        }
      };

      const onPointerLeave = () => {
        isPointerOnDune = false;
      };

      window.addEventListener("mousemove", onPointerMove, { passive: true });
      window.addEventListener("mouseleave", onPointerLeave, { passive: true });

      const handleResize = () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);
        streamMaterial.uniforms.uPixelRatio.value = pixelRatio;
        bgMaterial.uniforms.uPixelRatio.value = pixelRatio;
      };

      const resizeObserver = new ResizeObserver(() => handleResize());
      resizeObserver.observe(container);

      let animationFrameId: number;
      let isVisible = true;
      const clock = new THREE.Clock();

      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0.02 }
      );
      visibilityObserver.observe(container);

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        if (!isVisible) return;

        const elapsedTime = clock.getElapsedTime();
        streamMaterial.uniforms.uTime.value = elapsedTime;
        bgMaterial.uniforms.uTime.value = elapsedTime;

        const targetInfluence = isPointerOnDune ? 1.0 : 0.0;
        const lerpSpeed = targetInfluence > currentInfluence ? 0.06 : 0.04;
        currentInfluence += (targetInfluence - currentInfluence) * lerpSpeed;
        streamMaterial.uniforms.uInfluence.value = currentInfluence;

        mouseCurrent.lerp(mouseTarget, 0.08);
        streamMaterial.uniforms.uMouse.value.copy(mouseCurrent);

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("mousemove", onPointerMove);
        window.removeEventListener("mouseleave", onPointerLeave);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();

        bgGeometry.dispose();
        bgMaterial.dispose();
        streamGeometry.dispose();
        streamMaterial.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    // ══════════════════════════════════════════════════════════════════
    // LIGHT MODE: REALISTIC SAND DUNES (Warm Desert Ribbon Flow)
    // ══════════════════════════════════════════════════════════════════
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // High-Density Sand Grains: 150,000 particles
    const PARTICLE_COUNT = 150000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const attributes1 = new Float32Array(PARTICLE_COUNT * 4);
    const attributes2 = new Float32Array(PARTICLE_COUNT * 2);

    const xSpan = 38.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      const i2 = i * 2;

      const subLayer = i % 6;
      const phase = Math.random() * Math.PI * 2;
      const x = (Math.random() - 0.5) * xSpan;

      const u1 = Math.random();
      const u2 = Math.random();
      const randNormal = Math.sqrt(-2.0 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2.0 * Math.PI * u2);
      const transverse = randNormal * 1.05;

      positions[i3] = x;
      positions[i3 + 1] = 0.0;
      positions[i3 + 2] = (Math.random() - 0.5) * 2.5;

      attributes1[i4] = 0.42 + Math.random() * 0.42;
      attributes1[i4 + 1] = transverse;
      attributes1[i4 + 2] = 1.1 + Math.random() * 1.2;
      attributes1[i4 + 3] = Math.random();

      attributes2[i2] = subLayer;
      attributes2[i2 + 1] = phase;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aAttr1", new THREE.BufferAttribute(attributes1, 4));
    geometry.setAttribute("aAttr2", new THREE.BufferAttribute(attributes2, 2));

    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uInfluence;
      uniform float uPixelRatio;

      attribute vec4 aAttr1;
      attribute vec2 aAttr2;

      varying vec4 vColor;
      varying float vAlpha;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      void main() {
        float speed = aAttr1.x;
        float transverse = aAttr1.y;
        float pSize = aAttr1.z;
        float colorMix = aAttr1.w;
        float subLayer = aAttr2.x;
        float phase = aAttr2.y;

        float width = 38.0;
        float drift = uTime * 0.46 * speed;
        float x = position.x + drift;
        x = mod(x + width * 0.5, width) - width * 0.5;

        float tRise = smoothstep(-6.0, 7.0, x);
        float baseY = mix(-2.3, 0.65, tRise);

        float wave1 = sin(x * 0.22 - 0.2) * 0.52;
        float wave2 = cos(x * 0.46 + subLayer * 0.35) * 0.26;
        float wave3 = sin(x * 0.85 + phase * 0.4) * 0.12;
        float microNoise = (noise(vec2(x * 0.35, uTime * 0.08 + subLayer * 0.5)) - 0.5) * 0.22;

        float layerOffset = (subLayer - 2.5) * 0.34;
        float y = baseY + wave1 + wave2 + wave3 + microNoise + layerOffset + transverse;

        float z = position.z + cos(x * 0.2 + subLayer * 0.4) * 0.7;
        vec3 transformed = vec3(x, y, z);

        if (uInfluence > 0.001) {
          vec2 toVoid = transformed.xy - uMouse;
          float dist = length(toVoid);
          float voidRadius = 2.8;
          float fieldRadius = voidRadius * 3.2;

          float proximity = smoothstep(fieldRadius, 0.0, dist) * uInfluence;

          if (proximity > 0.001) {
            float avoidance = hash(vec2(subLayer * 7.3 + phase * 1.7, colorMix * 11.0));
            float scatterAngle = noise(toVoid * 0.55 + uTime * 0.3 + phase * 0.6) * 6.2832;
            vec2 scatterDir = vec2(cos(scatterAngle), sin(scatterAngle));
            vec2 radialDir = (dist > 0.001) ? (toVoid / dist) : vec2(1.0, 0.0);

            vec2 scatterMotion = mix(scatterDir, radialDir, avoidance);
            float scatterStrength = proximity * proximity * voidRadius * 1.1;
            transformed.xy += scatterMotion * scatterStrength * (0.25 + avoidance * 0.85);

            float coreExclusion = smoothstep(voidRadius * 0.85, 0.0, dist) * avoidance;
            transformed.xy += radialDir * coreExclusion * voidRadius * 1.3;
            transformed.z += (noise(toVoid * 0.4 + uTime * 0.22 + phase) - 0.5) * proximity * 1.1;
          }
        }

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        float distToCam = -mvPosition.z;
        gl_PointSize = (pSize * uPixelRatio * 25.0) / max(distToCam, 1.0);

        vec3 colDeepUmber  = vec3(0.24, 0.15, 0.09); // #3D2617
        vec3 colDarkBronze = vec3(0.44, 0.30, 0.18); // #704D2E
        vec3 colWarmCamel  = vec3(0.68, 0.49, 0.31); // #AE7D4F
        vec3 colGoldenSand = vec3(0.82, 0.63, 0.42); // #D1A16B
        vec3 colChampagne  = vec3(0.92, 0.80, 0.64); // #EBCCA3

        vec3 grainColor;
        if (colorMix < 0.25) {
          grainColor = mix(colChampagne, colGoldenSand, colorMix / 0.25);
        } else if (colorMix < 0.55) {
          grainColor = mix(colGoldenSand, colWarmCamel, (colorMix - 0.25) / 0.30);
        } else if (colorMix < 0.82) {
          grainColor = mix(colWarmCamel, colDarkBronze, (colorMix - 0.55) / 0.27);
        } else {
          grainColor = mix(colDarkBronze, colDeepUmber, (colorMix - 0.82) / 0.18);
        }

        float litRidge = smoothstep(-0.2, 1.8, y) * 0.12;
        grainColor += vec3(litRidge, litRidge * 0.85, litRidge * 0.6);

        vColor = vec4(grainColor, 1.0);

        float edgeFadeX = smoothstep(19.0, 13.5, abs(x));
        float baseAlpha = 0.92;
        float densityFalloff = exp(-pow(transverse * 0.85, 2.0));
        vAlpha = edgeFadeX * baseAlpha * (0.45 + 0.55 * densityFalloff);
      }
    `;

    const fragmentShader = `
      varying vec4 vColor;
      varying float vAlpha;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);

        if (dist > 0.5) {
          discard;
        }

        float softEdge = smoothstep(0.5, 0.15, dist);
        float core = smoothstep(0.2, 0.0, dist) * 0.25;

        vec3 finalRgb = vColor.rgb + core;
        float alpha = softEdge * vAlpha;

        gl_FragColor = vec4(finalRgb, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(999, 999) },
        uInfluence: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const mouseTarget = new THREE.Vector2(999, 999);
    const mouseCurrent = new THREE.Vector2(999, 999);
    let isPointerOnDune = false;
    let currentInfluence = 0;

    const getDuneCenterY = (x: number) => {
      const t = Math.max(0, Math.min(1, (x - (-6.0)) / (7.0 - (-6.0))));
      const smoothT = t * t * (3 - 2 * t);
      const baseY = -2.3 + smoothT * (0.65 - (-2.3));
      const wave1 = Math.sin(x * 0.22 - 0.2) * 0.52;
      return baseY + wave1;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      const planeZ = 0;
      const fovRad = (camera.fov * Math.PI) / 180;
      const dist = camera.position.z - planeZ;
      const vHeight = 2 * Math.tan(fovRad / 2) * dist;
      const vWidth = vHeight * (rect.width / rect.height);

      const worldX = (ndcX * vWidth) / 2;
      const worldY = (ndcY * vHeight) / 2;

      mouseTarget.set(worldX, worldY);

      const duneY = getDuneCenterY(worldX);
      const distToDuneSpine = Math.abs(worldY - duneY);

      if (distToDuneSpine <= 3.4 && worldX >= -18 && worldX <= 18) {
        isPointerOnDune = true;
      } else {
        isPointerOnDune = false;
      }
    };

    const onPointerLeave = () => {
      isPointerOnDune = false;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("mouseleave", onPointerLeave, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(pixelRatio);
      material.uniforms.uPixelRatio.value = pixelRatio;
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    let animationFrameId: number;
    let isVisible = true;
    const clock = new THREE.Clock();

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    visibilityObserver.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      const targetInfluence = isPointerOnDune ? 1.0 : 0.0;
      const lerpSpeed = targetInfluence > currentInfluence ? 0.06 : 0.04;
      currentInfluence += (targetInfluence - currentInfluence) * lerpSpeed;
      material.uniforms.uInfluence.value = currentInfluence;

      mouseCurrent.lerp(mouseTarget, 0.08);
      material.uniforms.uMouse.value.copy(mouseCurrent);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
