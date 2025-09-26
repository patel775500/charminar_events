import { Link } from 'react-router-dom'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { BuilderComponent, builder } from '@builder.io/react'
import '@/lib/builder'

function BouncySphere({ color, label, to, delay=0 }: { color: string; label: string; to: string; delay?: number }){
  const ref = useRef<any>()
  useFrame((state)=>{
    const t = state.clock.getElapsedTime() + delay
    const y = Math.sin(t*1.5) * 0.2 + 0.5
    if(ref.current){ ref.current.position.y = y }
  })
  return (
    <Link to={to} className="group select-none">
      <mesh ref={ref} castShadow receiveShadow scale={1.1}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.2}
          thickness={0.6}
        />
      </mesh>
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-48 -translate-x-1/2 translate-y-20 text-center text-sm font-semibold tracking-wide text-white/90 drop-shadow">
        {label}
      </div>
    </Link>
  )
}

export default function Landing(){
  const [cms, setCms] = useState<any>(null)
  const [checked, setChecked] = useState(false)

  useEffect(()=>{
    const key = import.meta.env.VITE_PUBLIC_BUILDER_KEY as string | undefined
    if(!key){ setChecked(true); return }
    builder.get('page', { userAttributes: { urlPath: '/' }}).promise()
      .then((res)=> setCms(res))
      .finally(()=> setChecked(true))
  },[])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
      {checked && cms && (
        <div className="mx-auto max-w-6xl">
          <BuilderComponent model="page" content={cms} />
        </div>
      )}
      {(!checked || !cms) && (
      <>
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(1000px_400px_at_10%_10%,rgba(236,72,153,.25),transparent),radial-gradient(800px_300px_at_90%_20%,rgba(139,92,246,.25),transparent)]" />
      <div className="relative grid min-h-[520px] grid-cols-1 items-center gap-8 p-6 md:grid-cols-2 md:p-10">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold leading-tight text-white md:text-5xl"
          >
            Automated Event Management
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-3 max-w-xl text-white/70"
          >
            Dark, cinematic, Netflix-like vibe with soft, glossy, realistic spheres.
          </motion.p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/attendee" className="btn btn-primary">Attendee</Link>
            <Link to="/organizer" className="btn btn-outline">Organizer</Link>
            <Link to="/admin" className="btn btn-outline">Admin</Link>
          </div>
        </div>
        <div className="relative h-[420px]">
          <Canvas shadows camera={{ position: [0, 1.2, 4.2], fov: 42 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[4, 6, 3]} intensity={2} castShadow />
            <BouncySphere color="#ec4899" label="Create an Event" to="/organizer" />
            <BouncySphere color="#8b5cf6" label="Register Here" to="/attendee" delay={0.6} />
            <ContactShadows opacity={0.5} scale={10} blur={2} far={2} resolution={256} color="#000" />
            <Environment preset="city" />
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI/3} maxPolarAngle={Math.PI/2} />
          </Canvas>
        </div>
      </div>
      )}
    </div>
  )
}
