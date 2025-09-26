import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { useRef } from "react";

function BouncySphere({ color, to, label, delay = 0 }: { color: string; to: string; label: string; delay?: number }) {
  const ref = useRef<any>();
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + delay;
    const y = Math.sin(t * 1.5) * 0.25 + 0.6;
    if (ref.current) ref.current.position.y = y;
  });
  return (
    <Link to={to} className="group select-none">
      <mesh ref={ref} castShadow receiveShadow scale={1.15}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.08}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.15}
          thickness={0.7}
        />
      </mesh>
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-48 -translate-x-1/2 translate-y-20 text-center text-sm font-semibold tracking-wide text-white/90 drop-shadow">
        {label}
      </div>
    </Link>
  );
}

export default function SpheresHero() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black">
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(1000px_400px_at_10%_10%,rgba(236,72,153,.25),transparent),radial-gradient(800px_300px_at_90%_20%,rgba(139,92,246,.25),transparent)]" />
      <div className="relative grid min-h-[420px] grid-cols-1 items-center gap-8 p-6 md:grid-cols-2 md:p-10">
        <div>
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">Automated Event Management</h1>
          <p className="mt-3 max-w-xl text-white/80">Dark, cinematic, Netflix-like experience. Organizers create. Smart automation approves when there’s no clash and rejects overlapping venue/time. Attendees book with seamless vibes.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/customer" className="inline-flex items-center rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-4 py-2 font-semibold text-white shadow">Attendee</Link>
            <Link to="/organizer" className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">Organizer</Link>
            <Link to="/signup" className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/20">Sign up</Link>
          </div>
        </div>
        <div className="relative h-[420px]">
          <Canvas shadows camera={{ position: [0, 1.2, 4.2], fov: 42 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[4, 6, 3]} intensity={2} castShadow />
            <BouncySphere color="#ec4899" to="/organizer" label="Create an Event" />
            <BouncySphere color="#8b5cf6" to="/customer" label="Register Here" delay={0.6} />
            <ContactShadows opacity={0.5} scale={10} blur={2} far={2} resolution={256} color="#000" />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
