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

    // 1. Three.js Scene, Camera, Renderer
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

    // 2. High-Density Sand Grains: 150,000 particles
    const PARTICLE_COUNT = 150000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    // aAttr1: [driftSpeed, transverseOffset, grainSize, colorSeed]
    const attributes1 = new Float32Array(PARTICLE_COUNT * 4);
    // aAttr2: [subLayerIdx, phaseSeed]
    const attributes2 = new Float32Array(PARTICLE_COUNT * 2);

    const xSpan = 38.0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const i4 = i * 4;
      const i2 = i * 2;

      // Assign to one of 6 braided dune sub-strands
      const subLayer = i % 6;
      const phase = Math.random() * Math.PI * 2;

      // Distribute x evenly across the horizontal span
      const x = (Math.random() - 0.5) * xSpan;

      // Concentrated bell-curve distribution across the dune ribbon
      const u1 = Math.random();
      const u2 = Math.random();
      const randNormal = Math.sqrt(-2.0 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2.0 * Math.PI * u2);
      const transverse = randNormal * 1.05;

      positions[i3] = x;
      positions[i3 + 1] = 0.0;
      positions[i3 + 2] = (Math.random() - 0.5) * 2.5;

      // aAttr1: [speed, transverse, size, colorMix]
      attributes1[i4] = 0.42 + Math.random() * 0.42; // laminar drift speed
      attributes1[i4 + 1] = transverse; // distance from ribbon centerline
      // Grain size: 1.1 to 2.3 for crisp, clearly visible sand grains
      attributes1[i4 + 2] = 1.1 + Math.random() * 1.2;
      attributes1[i4 + 3] = Math.random(); // color mix factor

      // aAttr2: [subLayer, phase]
      attributes2[i2] = subLayer;
      attributes2[i2 + 1] = phase;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aAttr1", new THREE.BufferAttribute(attributes1, 4));
    geometry.setAttribute("aAttr2", new THREE.BufferAttribute(attributes2, 2));

    // 3. GLSL Vertex Shader: Natural Free-Flow with Streamline Parting Around Mouse (No Swirls)
    const vertexShader = `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uInfluence; // 0.0 = normal free flow, 1.0 = smooth parting around mouse
      uniform float uPixelRatio;
      uniform float uTheme; // 0.0 = light, 1.0 = dark

      attribute vec4 aAttr1; // speed, transverse, size, colorMix
      attribute vec2 aAttr2; // subLayer, phase

      varying vec4 vColor;
      varying float vAlpha;

      // Pseudo-random noise
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

        // 1. Continuous laminar free flow along horizontal axis
        float width = 38.0;
        float drift = uTime * 0.46 * speed;
        float x = position.x + drift;
        x = mod(x + width * 0.5, width) - width * 0.5;

        // 2. Realistic Sand Dune Trajectory matching reference visual:
        // - Left (x < -2.0): flows low (y ~ -2.4 to -1.8) under the email input
        // - Center (x ~ -2.0 to 4.0): swoops gracefully upward (y ~ -1.5 to 0.4)
        // - Right (x > 4.0): undulates across (y ~ 0.4 to 1.1) towards top-right
        float tRise = smoothstep(-6.0, 7.0, x);
        float baseY = mix(-2.3, 0.65, tRise);

        // Harmonic organic waves along the free-flowing dune spine
        float wave1 = sin(x * 0.22 - 0.2) * 0.52;
        float wave2 = cos(x * 0.46 + subLayer * 0.35) * 0.26;
        float wave3 = sin(x * 0.85 + phase * 0.4) * 0.12;
        float microNoise = (noise(vec2(x * 0.35, uTime * 0.08 + subLayer * 0.5)) - 0.5) * 0.22;

        // Braided layer offset: lush, visible dune body
        float layerOffset = (subLayer - 2.5) * 0.34;
        float y = baseY + wave1 + wave2 + wave3 + microNoise + layerOffset + transverse;

        // 3D depth layer
        float z = position.z + cos(x * 0.2 + subLayer * 0.4) * 0.7;

        vec3 transformed = vec3(x, y, z);

        // 3. Natural Scattering: the flow loses coherence near the void instead of
// being pushed to a boundary. Each grain has its own continuous avoidance
// value, blending between turbulent scatter and gentle radial drift-away.
if (uInfluence > 0.001) {
  vec2 toVoid = transformed.xy - uMouse;
  float dist = length(toVoid);
  float voidRadius = 2.8;
  float fieldRadius = voidRadius * 3.2;

  float proximity = smoothstep(fieldRadius, 0.0, dist) * uInfluence;

  if (proximity > 0.001) {
    // Continuous per-grain avoidance (not a hard in/out flag) — some grains
    // barely notice the void and keep drifting through, most bend away.
    float avoidance = hash(vec2(subLayer * 7.3 + phase * 1.7, colorMix * 11.0));

    // Domain-warped turbulence: the direction of scatter comes from noise,
    // not from "away from the mouse", so paths look disturbed, not steered.
    float scatterAngle = noise(toVoid * 0.55 + uTime * 0.3 + phase * 0.6) * 6.2832;
    vec2 scatterDir = vec2(cos(scatterAngle), sin(scatterAngle));
    vec2 radialDir = (dist > 0.001) ? (toVoid / dist) : vec2(1.0, 0.0);

    // Low avoidance -> pure turbulence (drifts through).
    // High avoidance -> mostly radial (parts around).
    vec2 scatterMotion = mix(scatterDir, radialDir, avoidance);

    float scatterStrength = proximity * proximity * voidRadius * 1.1;
    transformed.xy += scatterMotion * scatterStrength * (0.25 + avoidance * 0.85);

    // Only strongly-avoidant grains get excluded from the very core —
    // this is what keeps the void legible without a hard shell.
    float coreExclusion = smoothstep(voidRadius * 0.85, 0.0, dist) * avoidance;
    transformed.xy += radialDir * coreExclusion * voidRadius * 1.3;

    // Depth turbulence so the disturbance reads in z too, not just xy.
    transformed.z += (noise(toVoid * 0.4 + uTime * 0.22 + phase) - 0.5) * proximity * 1.1;
  }
}

        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // 4. Point Size: Crisp, clearly visible sand grains (around 2.5px to 4.2px)
        float distToCam = -mvPosition.z;
        gl_PointSize = (pSize * uPixelRatio * 25.0) / max(distToCam, 1.0);

        // 5. Rich Desert Sand Palette (Visible, high-contrast, authentic tones)
        vec3 colDeepUmber  = mix(vec3(0.24, 0.15, 0.09), vec3(0.55, 0.28, 0.06), uTheme); // #3D2617 deep crease
        vec3 colDarkBronze = mix(vec3(0.44, 0.30, 0.18), vec3(0.75, 0.42, 0.10), uTheme); // #704D2E rich bronze
        vec3 colWarmCamel  = mix(vec3(0.68, 0.49, 0.31), vec3(0.92, 0.60, 0.18), uTheme); // #AE7D4F camel body
        vec3 colGoldenSand = mix(vec3(0.82, 0.63, 0.42), vec3(1.0, 0.78, 0.35), uTheme); // #D1A16B golden sand
        vec3 colChampagne  = mix(vec3(0.92, 0.80, 0.64), vec3(1.0, 0.90, 0.70), uTheme); // #EBCCA3 highlights

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

        // Subtle crest highlight along lit ridges
        float litRidge = smoothstep(-0.2, 1.8, y) * 0.12;
        grainColor += vec3(litRidge, litRidge * 0.85, litRidge * 0.6);

        vColor = vec4(grainColor, 1.0);

        // Edge fade out along canvas horizontal limits
        float edgeFadeX = smoothstep(19.0, 13.5, abs(x));
        float baseAlpha = mix(0.92, 0.98, uTheme);
        // Density falloff across the ribbon width: dense in the core, feathering at edges
        float densityFalloff = exp(-pow(transverse * 0.85, 2.0));
        vAlpha = edgeFadeX * baseAlpha * (0.45 + 0.55 * densityFalloff);
      }
    `;

    // 4. GLSL Fragment Shader: Micro-Grain Sharp Antialiasing
    const fragmentShader = `
      varying vec4 vColor;
      varying float vAlpha;
      uniform float uTheme;

      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);

        if (dist > 0.5) {
          discard;
        }

        // Crisp antialiased circular grain
        float softEdge = smoothstep(0.5, 0.15, dist);
        // Micro-specular sparkle
        float core = smoothstep(0.2, 0.0, dist) * mix(0.25, 0.6, uTheme);

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
        uTheme: { value: isDark ? 1.0 : 0.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 5. Mouse Interaction: Smooth Free Flow Around the Pointer (No Swirls)
    const mouseTarget = new THREE.Vector2(999, 999);
    const mouseCurrent = new THREE.Vector2(999, 999);
    let isPointerOnDune = false;
    let currentInfluence = 0;

    // Helper: calculate dune spine centerline Y for a given world X
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

      // Convert NDC to world coordinates on the z=0 plane
      const planeZ = 0;
      const fovRad = (camera.fov * Math.PI) / 180;
      const dist = camera.position.z - planeZ;
      const vHeight = 2 * Math.tan(fovRad / 2) * dist;
      const vWidth = vHeight * (rect.width / rect.height);

      const worldX = (ndcX * vWidth) / 2;
      const worldY = (ndcY * vHeight) / 2;

      mouseTarget.set(worldX, worldY);

      // Check if mouse is placed on the sand dune ribbon:
      const duneY = getDuneCenterY(worldX);
      const distToDuneSpine = Math.abs(worldY - duneY);

      if (distToDuneSpine <= 3.4 && worldX >= -18 && worldX <= 18) {
        // Pointed on sand dunes -> dunes flow around the mouse
        isPointerOnDune = true;
      } else {
        // Removed from sand dunes -> returns to normal free flow
        isPointerOnDune = false;
      }
    };

    const onPointerLeave = () => {
      isPointerOnDune = false;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("mouseleave", onPointerLeave, { passive: true });

    // 6. Responsive Resize Observer
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

    // 7. Render Loop: Continuous Free Flow Smoothly Parting Around the Mouse
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      // Target influence: 1.0 when pointer is placed on the sand dune, 0.0 when removed
      const targetInfluence = isPointerOnDune ? 1.0 : 0.0;

      // Smooth easing in and out
      const lerpSpeed = targetInfluence > currentInfluence ? 0.06 : 0.04;
      currentInfluence += (targetInfluence - currentInfluence) * lerpSpeed;
      material.uniforms.uInfluence.value = currentInfluence;

      // Smooth mouse tracking
      mouseCurrent.lerp(mouseTarget, 0.08);
      material.uniforms.uMouse.value.copy(mouseCurrent);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseleave", onPointerLeave);
      resizeObserver.disconnect();

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
