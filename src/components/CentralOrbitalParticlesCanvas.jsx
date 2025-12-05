import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const CentralOrbitalParticlesCanvas = ({ radius = 60, particleCount = 24, isDark = false }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Crear partículas en órbitas circulares
    const orbits = [];
    const orbitsCount = 3;
    
    for (let orbitIndex = 0; orbitIndex < orbitsCount; orbitIndex++) {
      const orbitRadius = (radius * 0.4) + (orbitIndex * radius * 0.2);
      const particlesPerOrbit = Math.floor(particleCount / orbitsCount);
      const orbitParticles = [];
      
      for (let i = 0; i < particlesPerOrbit; i++) {
        const angle = (i / particlesPerOrbit) * Math.PI * 2;
        const height = (Math.random() - 0.5) * radius * 0.3;
        
        orbitParticles.push({
          angle,
          radius: orbitRadius,
          height,
          size: 1.5 + Math.random() * 1,
          opacity: 0.5 + Math.random() * 0.3,
          speed: 0.5 + Math.random() * 0.3,
          phase: Math.random() * Math.PI * 2
        });
      }
      
      orbits.push({
        radius: orbitRadius,
        particles: orbitParticles,
        rotationSpeed: 0.3 + orbitIndex * 0.1
      });
    }

    particlesRef.current = orbits;

    // Función de animación
    const animate = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Actualizar rotaciones
      rotationRef.current.y += 0.003;
      rotationRef.current.x += 0.0008;
      rotationRef.current.z += 0.001;

      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);

      // Dibujar esfera transparente central
      const sphereRadius = radius * 0.25;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sphereRadius);
      gradient.addColorStop(0, isDark ? 'rgba(74, 144, 226, 0.15)' : 'rgba(135, 206, 235, 0.15)');
      gradient.addColorStop(0.5, isDark ? 'rgba(74, 144, 226, 0.08)' : 'rgba(135, 206, 235, 0.08)');
      gradient.addColorStop(1, 'rgba(74, 144, 226, 0)');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Dibujar partículas orbitantes
      particlesRef.current.forEach((orbit, orbitIndex) => {
        orbit.particles.forEach((particle) => {
          // Actualizar ángulo
          particle.angle += particle.speed * orbit.rotationSpeed * 0.01;
          
          // Calcular posición 3D
          const x = Math.cos(particle.angle + particle.phase) * particle.radius;
          const z = Math.sin(particle.angle + particle.phase) * particle.radius;
          const y = particle.height + Math.sin(Date.now() * 0.001 + particle.phase) * 5;

          // Rotación 3D
          let x1 = x * cosY - z * sinY;
          let z1 = x * sinY + z * cosY;
          let y1 = y * cosX - z1 * sinX;
          let z2 = y * sinX + z1 * cosX;

          // Proyección isométrica
          const scale = 1;
          const projectedX = centerX + (x1 - z2) * scale;
          const projectedY = centerY + (y1 + (x1 + z2) * 0.5) * scale;

          // Calcular profundidad para opacidad
          const depth = Math.abs(z2) / radius;
          const finalOpacity = particle.opacity * (0.7 + depth * 0.3);

          // Dibujar partícula con glow
          const particleGradient = ctx.createRadialGradient(
            projectedX, projectedY, 0,
            projectedX, projectedY, particle.size * 2
          );
          particleGradient.addColorStop(0, isDark ? `rgba(147, 197, 253, ${finalOpacity})` : `rgba(59, 130, 246, ${finalOpacity})`);
          particleGradient.addColorStop(0.5, isDark ? `rgba(147, 197, 253, ${finalOpacity * 0.5})` : `rgba(59, 130, 246, ${finalOpacity * 0.5})`);
          particleGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

          ctx.beginPath();
          ctx.arc(projectedX, projectedY, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particleGradient;
          ctx.fill();

          // Brillo central
          ctx.beginPath();
          ctx.arc(projectedX, projectedY, particle.size * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${finalOpacity * 0.6})` : `rgba(255, 255, 255, ${finalOpacity * 0.8})`;
          ctx.fill();
        });
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [radius, particleCount, isDark]);

  return (
    <Box
      component="canvas"
      ref={canvasRef}
      width={120}
      height={120}
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    />
  );
};

export default CentralOrbitalParticlesCanvas;


