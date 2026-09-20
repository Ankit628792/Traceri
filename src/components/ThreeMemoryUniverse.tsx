import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ProcessedArchive, LifeReceipt } from '../types';
import { CATEGORY_META } from '../utils/engine';
import { Boxes } from 'lucide-react';

interface ThreeMemoryUniverseProps {
  archive: ProcessedArchive;
  onSelectReceipt: (receipt: LifeReceipt) => void;
}

export const ThreeMemoryUniverse: React.FC<ThreeMemoryUniverseProps> = ({
  archive,
  onSelectReceipt,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredReceipt, setHoveredReceipt] = useState<LifeReceipt | null>(null);
  const [use2DFallback, setUse2DFallback] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || use2DFallback) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setUse2DFallback(true);
        return;
      }
    } catch {
      setUse2DFallback(true);
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0b0d);
    scene.fog = new THREE.FogExp2(0x0a0b0d, 0.003);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 40, 160);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambient and Point lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xcfa04e, 1.5, 200);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    // Group for objects
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // Map each receipt to a 3D coordinate based on its category angle and chronological radius
    const receiptObjects: { mesh: THREE.Mesh; receipt: LifeReceipt }[] = [];
    const categoryAngles: Record<string, number> = {
      music: 0,
      movies: Math.PI * 0.22,
      places: Math.PI * 0.44,
      purchases: Math.PI * 0.66,
      photos: Math.PI * 0.88,
      messages: Math.PI * 1.1,
      searches: Math.PI * 1.32,
      events: Math.PI * 1.54,
      notes: Math.PI * 1.76,
    };

    archive.receipts.forEach((receipt, i) => {
      const catMeta = CATEGORY_META[receipt.type];
      const baseAngle = categoryAngles[receipt.type] || 0;
      const radius = 25 + (i / archive.receipts.length) * 55;
      const angleOffset = (Math.random() - 0.5) * 0.35;
      const angle = baseAngle + angleOffset;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 35;

      const geometry = new THREE.SphereGeometry(1.6, 16, 16);
      const color = new THREE.Color(catMeta.color);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.2,
        emissive: color,
        emissiveIntensity: 0.25,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { receiptId: receipt.id };
      universeGroup.add(mesh);

      receiptObjects.push({ mesh, receipt });
    });

    // Draw connection lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x3a4252,
      transparent: true,
      opacity: 0.4,
    });

    archive.connections.forEach((conn) => {
      const objA = receiptObjects.find((o) => o.receipt.id === conn.from);
      const objB = receiptObjects.find((o) => o.receipt.id === conn.to);
      if (objA && objB) {
        const points = [objA.mesh.position, objB.mesh.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, lineMaterial);
        universeGroup.add(line);
      }
    });

    // Raycaster for mouse picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(receiptObjects.map((o) => o.mesh));
      if (intersects.length > 0) {
        const hit = receiptObjects.find((o) => o.mesh === intersects[0].object);
        if (hit) {
          onSelectReceipt(hit.receipt);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Drag rotation controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onDragMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      universeGroup.rotation.y += deltaX * 0.005;
      universeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onDragMove);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        universeGroup.rotation.y += 0.0015;
      }

      // Check intersections
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(receiptObjects.map((o) => o.mesh));
      if (intersects.length > 0) {
        const hit = receiptObjects.find((o) => o.mesh === intersects[0].object);
        if (hit) {
          setHoveredReceipt(hit.receipt);
          renderer.domElement.style.cursor = 'pointer';
        }
      } else {
        setHoveredReceipt(null);
        renderer.domElement.style.cursor = 'default';
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onDragMove);
      renderer.dispose();
    };
  }, [archive, use2DFallback, onSelectReceipt]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Editorial Header */}
      <div className="border-b border-[#232730] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#A795DC] uppercase tracking-widest mb-1">
            SPATIAL MEMORY TOPOLOGY
          </div>
          <h2 className="font-editorial text-4xl sm:text-5xl text-[#FAF8F5]">
            3D Memory Universe
          </h2>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            id="toggle-2d-universe-btn"
            onClick={() => setUse2DFallback((prev) => !prev)}
            className="px-3 py-1.5 rounded bg-[#13161C] border border-[#242934] text-[#8E939E] hover:text-[#FAF8F5]"
          >
            {use2DFallback ? 'SWITCH TO 3D WEBGL' : '2D SPATIAL FALLBACK'}
          </button>
        </div>
      </div>

      {/* Universe Container */}
      <div className="relative w-full h-[560px] bg-[#0A0B0D] border border-[#232730] rounded-2xl overflow-hidden shadow-2xl">
        
        {use2DFallback ? (
          /* 2D Fallback Representation */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#0C0E12]">
            <Boxes className="w-12 h-12 text-[#A795DC] mb-4 opacity-50" />
            <h3 className="font-editorial text-2xl text-[#FAF8F5] mb-2">
              2D Constellation Mode
            </h3>
            <p className="font-mono text-xs text-[#8E939E] max-w-md mb-6">
              WebGL is paused. All {archive.totalTraces} traces are indexed in spatial memory clusters.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {archive.receipts.map((r) => {
                const cat = CATEGORY_META[r.type];
                return (
                  <button
                    key={r.id}
                    onClick={() => onSelectReceipt(r)}
                    className="px-2 py-1 rounded bg-[#161922] border border-[#242A36] text-[11px] font-mono text-[#FAF8F5] hover:border-[#CFA04E] transition-colors flex items-center space-x-1.5"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{r.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* 3D WebGL Canvas */
          <div ref={containerRef} className="w-full h-full" />
        )}

        {/* Floating Controls HUD */}
        <div className="absolute top-4 left-4 pointer-events-none text-xs font-mono text-[#8E939E] bg-black/60 backdrop-blur px-3 py-2 rounded border border-[#242934]">
          <div className="text-[#FAF8F5] font-semibold">INTERACTIVE HUD</div>
          <div>DRAG TO ORBIT · CLICK NODE TO INSPECT</div>
        </div>

        {/* Hovered Node Preview Card in Bottom Corner */}
        {hoveredReceipt && (
          <div
            onClick={() => onSelectReceipt(hoveredReceipt)}
            className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md bg-[#12151D]/90 backdrop-blur-md border border-[#CFA04E] rounded-xl p-4 shadow-2xl cursor-pointer hover:bg-[#181C26] transition-all"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#CFA04E] mb-1">
              <span>{hoveredReceipt.id} · CLICK TO OPEN FULL TRACE</span>
              <span className="uppercase">{hoveredReceipt.type}</span>
            </div>
            <div className="font-editorial text-lg text-[#FAF8F5] leading-tight">
              {hoveredReceipt.title}
            </div>
            {hoveredReceipt.location && (
              <div className="text-xs font-mono text-[#5F9E7D] mt-1">
                📍 {hoveredReceipt.location.name} ({hoveredReceipt.location.city})
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
