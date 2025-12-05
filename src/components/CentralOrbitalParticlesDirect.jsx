import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Box } from '@mui/material';

const CentralOrbitalParticlesDirect = ({ radius = 60, particleCount = 24, isDark = false }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const sphereRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = 120;
    const height = 120;

    // Escena
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Cámara
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Grupo para partículas
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Esfera central fusionada con partículas - más visible y luminosa
    const sphereRadius = radius * 0.4;
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.5,
      color: isDark ? '#ffffff' : '#e0f2fe',
      roughness: 0.05,
      metalness: 0.95,
      emissive: isDark ? '#22c55e' : '#16a34a',
      emissiveIntensity: 0.6
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereRef.current = sphere;
    group.add(sphere);

    // Crear partículas fusionadas con la esfera - algunas dentro, algunas en la superficie
    const orbitsCount = 4;
    const particles = [];
    const sphereSurfaceRadius = sphereRadius;
    
    for (let orbitIndex = 0; orbitIndex < orbitsCount; orbitIndex++) {
      // Primera órbita: partículas dentro de la esfera (más cerca del centro)
      // Segunda órbita: partículas en la superficie de la esfera
      // Tercera y cuarta: partículas orbitando cerca de la superficie
      let orbitRadius;
      if (orbitIndex === 0) {
        orbitRadius = sphereRadius * 0.6; // Dentro de la esfera
      } else if (orbitIndex === 1) {
        orbitRadius = sphereSurfaceRadius * 0.95; // En la superficie
      } else {
        orbitRadius = sphereSurfaceRadius + (orbitIndex - 1) * radius * 0.15; // Cerca de la superficie
      }
      
      const particlesPerOrbit = Math.floor(particleCount / orbitsCount);
      
      for (let i = 0; i < particlesPerOrbit; i++) {
        const angle = (i / particlesPerOrbit) * Math.PI * 2;
        const height = (Math.random() - 0.5) * radius * 0.25;
        const size = orbitIndex === 0 ? 1.2 + Math.random() * 0.8 : 1.5 + Math.random() * 1;
        const opacity = orbitIndex === 0 ? 0.6 + Math.random() * 0.3 : 0.5 + Math.random() * 0.3;
        const speed = 0.4 + Math.random() * 0.3;
        const phase = Math.random() * Math.PI * 2;
        
        const particleGeometry = new THREE.SphereGeometry(size, 8, 8);
        // Partículas dentro de la esfera tienen color más similar a la esfera
        const particleColor = orbitIndex === 0 
          ? (isDark ? '#22c55e' : '#16a34a') // Verde similar al margen neto
          : (isDark ? '#93c5fd' : '#3b82f6'); // Azul para las externas
        
        const particleMaterial = new THREE.MeshStandardMaterial({
          transparent: true,
          color: particleColor,
          opacity: opacity,
          emissive: particleColor,
          emissiveIntensity: orbitIndex === 0 ? 0.5 : 0.3, // Más brillo para las internas
          roughness: 0.1,
          metalness: 0.9
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        const initialX = Math.cos(angle + phase) * orbitRadius;
        const initialZ = Math.sin(angle + phase) * orbitRadius;
        particle.position.set(initialX, height, initialZ);
        
        particle.userData = {
          angle,
          radius: orbitRadius,
          height,
          speed,
          phase,
          rotationSpeed: 0.25 + orbitIndex * 0.08,
          opacity,
          orbitIndex,
          baseSize: size
        };
        
        group.add(particle);
        particles.push(particle);
      }
    }
    
    particlesRef.current = particles;

    // Luces mejoradas para efecto de fusión
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    // Luz principal desde arriba para iluminar la esfera
    const pointLight1 = new THREE.PointLight(isDark ? '#22c55e' : '#16a34a', 1.2);
    pointLight1.position.set(0, 30, 30);
    scene.add(pointLight1);
    
    // Luz secundaria para profundidad
    const pointLight2 = new THREE.PointLight(0xffffff, 0.6);
    pointLight2.position.set(-25, -25, -25);
    scene.add(pointLight2);
    
    // Luz adicional para partículas internas
    const pointLight3 = new THREE.PointLight(isDark ? '#93c5fd' : '#3b82f6', 0.8);
    pointLight3.position.set(25, 0, 25);
    scene.add(pointLight3);

    // Animación
    const clock = new THREE.Clock();
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      
      // Rotar grupo global
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.1;
      }
      
      // Rotar esfera con pulsación sutil
      if (sphereRef.current) {
        sphereRef.current.rotation.y += delta * 0.12;
        sphereRef.current.rotation.x += delta * 0.04;
        // Pulsación sutil de la esfera
        const pulseScale = 1 + Math.sin(elapsedTime * 2) * 0.08;
        sphereRef.current.scale.set(pulseScale, pulseScale, pulseScale);
        // Variar opacidad de la esfera
        sphereRef.current.material.opacity = 0.5 + Math.sin(elapsedTime * 1.5) * 0.15;
      }
      
      // Animar partículas fusionadas con la esfera
      particles.forEach((particle) => {
        const data = particle.userData;
        data.angle += delta * data.speed * data.rotationSpeed;
        
        const x = Math.cos(data.angle + data.phase) * data.radius;
        const z = Math.sin(data.angle + data.phase) * data.radius;
        const y = data.height + Math.sin(elapsedTime * 0.8 + data.phase) * 4;
        
        particle.position.set(x, y, z);
        
        // Partículas dentro de la esfera: efecto de fusión más intenso
        if (data.orbitIndex === 0) {
          // Partículas internas: variar tamaño y opacidad para efecto de fusión
          const pulse = 1 + Math.sin(elapsedTime * 2 + data.phase) * 0.15;
          particle.scale.set(pulse, pulse, pulse);
          particle.material.opacity = data.opacity * (0.8 + Math.sin(elapsedTime * 1.5 + data.phase) * 0.2);
          particle.material.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 2 + data.phase) * 0.2;
        } else if (data.orbitIndex === 1) {
          // Partículas en la superficie: efecto de adherencia a la esfera
          const distanceFromCenter = Math.sqrt(x * x + y * y + z * z);
          const distanceToSurface = Math.abs(distanceFromCenter - sphereSurfaceRadius);
          // Si está muy cerca de la superficie, aumentar brillo
          if (distanceToSurface < sphereRadius * 0.1) {
            particle.material.emissiveIntensity = 0.6;
            particle.material.opacity = data.opacity * 1.2;
          } else {
            particle.material.emissiveIntensity = 0.3;
            particle.material.opacity = data.opacity;
          }
        } else {
          // Partículas externas: variar opacidad según profundidad
          const distanceFromCenter = Math.sqrt(x * x + z * z);
          const normalizedDistance = distanceFromCenter / radius;
          particle.material.opacity = data.opacity * (0.7 + normalizedDistance * 0.3);
        }
        
        // Rotación individual de partículas para efecto más orgánico
        particle.rotation.x += delta * 0.5;
        particle.rotation.y += delta * 0.3;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [radius, particleCount, isDark]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '120px',
        height: '120px',
        pointerEvents: 'none',
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    />
  );
};

export default CentralOrbitalParticlesDirect;


