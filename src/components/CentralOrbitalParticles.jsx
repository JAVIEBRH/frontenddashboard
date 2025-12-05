import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CentralOrbitalParticles = ({ radius = 60, particleCount = 24, isDark = false }) => {
  const groupRef = useRef();
  const sphereRef = useRef();
  const particlesRef = useRef([]);

  // Crear partículas en órbitas circulares dentro del área del donut
  const orbits = useMemo(() => {
    const orbitData = [];
    const orbitsCount = 3; // 3 órbitas concéntricas
    
    for (let orbitIndex = 0; orbitIndex < orbitsCount; orbitIndex++) {
      const orbitRadius = (radius * 0.4) + (orbitIndex * radius * 0.2); // Radios: 0.4, 0.6, 0.8 del radio interno
      const particlesPerOrbit = Math.floor(particleCount / orbitsCount);
      const orbitParticles = [];
      
      for (let i = 0; i < particlesPerOrbit; i++) {
        const angle = (i / particlesPerOrbit) * Math.PI * 2;
        const height = (Math.random() - 0.5) * radius * 0.3; // Variación de altura para efecto 3D
        
        orbitParticles.push({
          angle,
          radius: orbitRadius,
          height,
          size: 1.5 + Math.random() * 1,
          opacity: 0.5 + Math.random() * 0.3,
          speed: 0.5 + Math.random() * 0.3, // Velocidad variable
          phase: Math.random() * Math.PI * 2 // Fase inicial aleatoria
        });
      }
      
      orbitData.push({
        radius: orbitRadius,
        particles: orbitParticles,
        rotationSpeed: 0.3 + orbitIndex * 0.1 // Velocidad diferente por órbita
      });
    }
    
    return orbitData;
  }, [radius, particleCount]);

  // Animación continua
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotación global muy sutil
      groupRef.current.rotation.y += delta * 0.1;
    }
    
    if (sphereRef.current) {
      // Rotación sutil de la esfera
      sphereRef.current.rotation.y += delta * 0.15;
      sphereRef.current.rotation.x += delta * 0.05;
    }
    
    // Animar partículas en sus órbitas
    orbits.forEach((orbit, orbitIndex) => {
      orbit.particles.forEach((particle, particleIndex) => {
        const particleMesh = particlesRef.current[orbitIndex]?.[particleIndex];
        if (particleMesh) {
          // Actualizar ángulo de la órbita
          particle.angle += delta * particle.speed * orbit.rotationSpeed;
          
          // Calcular posición 3D en la órbita
          const x = Math.cos(particle.angle + particle.phase) * particle.radius;
          const z = Math.sin(particle.angle + particle.phase) * particle.radius;
          const y = particle.height + Math.sin(state.clock.elapsedTime + particle.phase) * 5; // Movimiento vertical sutil
          
          particleMesh.position.set(x, y, z);
          
          // Variar opacidad sutilmente para efecto de profundidad
          const distanceFromCenter = Math.sqrt(x * x + z * z);
          const normalizedDistance = distanceFromCenter / radius;
          particleMesh.material.opacity = particle.opacity * (0.7 + normalizedDistance * 0.3);
        }
      });
    });
  });

  const particleColor = isDark ? '#93c5fd' : '#3b82f6';
  const sphereColor = isDark ? '#4a90e2' : '#87ceeb';

  return (
    <group ref={groupRef}>
      {/* Esfera transparente central estilo cristal */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[radius * 0.25, 32, 32]} />
        <meshStandardMaterial
          transparent
          opacity={0.12}
          color={isDark ? '#ffffff' : '#e0f2fe'}
          roughness={0.1}
          metalness={0.9}
          emissive={sphereColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Partículas orbitantes */}
      {orbits.map((orbit, orbitIndex) => (
        <group key={orbitIndex}>
          {orbit.particles.map((particle, particleIndex) => {
            if (!particlesRef.current[orbitIndex]) {
              particlesRef.current[orbitIndex] = [];
            }
            
            const initialX = Math.cos(particle.angle + particle.phase) * particle.radius;
            const initialZ = Math.sin(particle.angle + particle.phase) * particle.radius;
            
            return (
              <mesh
                key={particleIndex}
                ref={(el) => {
                  if (el) particlesRef.current[orbitIndex][particleIndex] = el;
                }}
                position={[initialX, particle.height, initialZ]}
              >
                <sphereGeometry args={[particle.size, 8, 8]} />
                <meshStandardMaterial
                  transparent
                  color={particleColor}
                  opacity={particle.opacity}
                  emissive={particleColor}
                  emissiveIntensity={0.3}
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

export default CentralOrbitalParticles;

