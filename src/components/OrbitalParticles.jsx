import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const OrbitalParticles = ({ radius = 150, particleCount = 80, isDark = false }) => {
  const pointsRef = useRef();
  const pointsRef2 = useRef();
  const sphereRef = useRef();

  // Crear partículas distribuidas uniformemente en una esfera usando Fibonacci sphere
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    
    for (let i = 0; i < particleCount; i++) {
      // Distribución uniforme usando Fibonacci sphere
      const y = 1 - (i / (particleCount - 1)) * 2; // y va de 1 a -1
      const radius_at_y = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      
      const x = Math.cos(theta) * radius_at_y;
      const z = Math.sin(theta) * radius_at_y;
      
      positions[i * 3] = x * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = z * radius;
      
      // Variación de tamaños para profundidad (1.5 a 3.5)
      sizes[i] = 1.5 + Math.random() * 2;
    }
    
    return { positions, sizes };
  }, [particleCount, radius]);

  // Animación orbital suave y continua
  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Rotación lenta alrededor del eje Y (principal)
      pointsRef.current.rotation.y += delta * 0.3;
      // Rotación muy lenta alrededor del eje X para efecto 3D orbital
      pointsRef.current.rotation.x += delta * 0.08;
    }
    
    if (pointsRef2.current) {
      // Segunda capa con rotación opuesta para efecto más complejo
      pointsRef2.current.rotation.y -= delta * 0.2;
      pointsRef2.current.rotation.z += delta * 0.05;
    }
    
    if (sphereRef.current) {
      // Rotación sutil de la esfera transparente
      sphereRef.current.rotation.y += delta * 0.15;
      sphereRef.current.rotation.x += delta * 0.04;
    }
  });

  const particleColor = isDark ? '#93c5fd' : '#3b82f6';
  const particleColor2 = isDark ? '#60a5fa' : '#60a5fa';

  return (
    <group>
      {/* Esfera transparente con glass glow - núcleo de cristal */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[radius * 0.25, 32, 32]} />
        <meshStandardMaterial
          transparent
          opacity={0.08}
          color={isDark ? '#ffffff' : '#e0f2fe'}
          roughness={0.1}
          metalness={0.95}
          emissive={isDark ? '#4a90e2' : '#87ceeb'}
          emissiveIntensity={0.15}
        />
      </mesh>
      
      {/* Partículas orbitales principales */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          transparent
          color={particleColor}
          size={particles.sizes[0]}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.7}
        />
      </points>
      
      {/* Capa adicional de partículas más pequeñas para profundidad y volumen */}
      <points 
        ref={pointsRef2} 
        rotation={[Math.PI / 6, 0, Math.PI / 8]}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          transparent
          color={particleColor2}
          size={1.2}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.4}
        />
      </points>
    </group>
  );
};

export default OrbitalParticles;

