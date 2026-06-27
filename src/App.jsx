import React, { useState, useRef, useEffect } from 'react'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import TextType from './TextType'
import { motion, AnimatePresence } from 'motion/react'


const FISH_SVGS = [
  '/fish/fish1.svg',
  '/fish/fish2.svg',
  '/fish/fish3.svg',
  '/fish/fish4.svg',
  '/fish/fish5.svg',
  '/fish/fish6.svg',
  '/fish/fish8.svg',
  '/fish/fish9.svg',
  '/fish/fish10.svg',
  '/fish/fish11.svg'
]

function Fish({ thought, oceanWidth, oceanHeight, onClick }) {
  const wrapRef = useRef(null)
  const state = useRef({
    x: Math.random() * (oceanWidth - 60),
    y: 30 + Math.random() * (oceanHeight - 80),
    dx: (Math.random() > 0.5 ? 1 : -1) * (0.08 + Math.random() * 0.08),
    dy: (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.04),
  })
  const [facingLeft, setFacingLeft] = useState(state.current.dx < 0)
  const [showLabel, setShowLabel] = useState(false)
  const fishSrc = useRef(FISH_SVGS[Math.floor(Math.random() * FISH_SVGS.length)])
  const size = useRef(80 + Math.random() * 75)
  const rafRef = useRef(null)

  useEffect(() => {
    const s = state.current
    let frame = 0
    function step() {
      frame++
      s.x += s.dx
      s.y += s.dy
  
      // randomly change vertical direction every ~3-6 seconds
      if (frame % (180 + Math.floor(Math.random() * 180)) === 0) {
        s.dy = (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.04)
      }
  
      if (s.dx > 0 && s.x > oceanWidth - size.current - 10) {
        s.x = oceanWidth - size.current - 10
        s.dx = -Math.abs(s.dx)
        setFacingLeft(true)
      } else if (s.dx < 0 && s.x < 10) {
        s.x = 10
        s.dx = Math.abs(s.dx)
        setFacingLeft(false)
      }
  
      if (s.dy > 0 && s.y > oceanHeight - size.current - 80) {
        s.dy = -Math.abs(s.dy)
      } else if (s.dy < 0 && s.y < 10) {
        s.dy = Math.abs(s.dy)
      }
  
      if (wrapRef.current) {
        wrapRef.current.style.left = s.x + 'px'
        wrapRef.current.style.top = s.y + 'px'
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [oceanWidth, oceanHeight])

  //const [body, fin] = colorPair.current
  const w = size.current
  const h = w * 0.55

  return (
    <motion.div
      ref={wrapRef}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'absolute',
        top: state.current.y,
        left: state.current.x,
        cursor: 'pointer',
        zIndex: 2,
      }}
    >
      {showLabel && (
        <div style={{
          position: 'absolute',
          top: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(5,20,60,0.7)',
          color: '#e3f2fd',
          fontSize: 11,
          whiteSpace: 'nowrap',
          padding: '2px 7px',
          borderRadius: 4,
          pointerEvents: 'none',
          maxWidth: 160,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {thought}
        </div>
      )}
      <img
  src={fishSrc.current}
  width={w}
  height={h}
  style={{
    display: 'block',
    transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
  }}
/>
    </motion.div>
  )
}

export default function App() {
  const [thoughts, setThoughts] = useState(() => {
    const saved = localStorage.getItem('thoughts')
    if (!saved) return [
      { text: 'shower thought', date: new Date() },
      { text: 'half-baked idea', date: new Date() },
      { text: 'that one song', date: new Date() },
    ]
    return JSON.parse(saved).map(t => ({ ...t, date: new Date(t.date) }))
  })
  const [input, setInput] = useState('')
  const oceanRef = useRef(null)
  const [selectedThought, setSelectedThought] = useState(null)
  const [oceanSize, setOceanSize] = useState({ width: 600, height: 360 })
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!oceanRef.current) return
    const ro = new ResizeObserver(([entry]) => {
      setOceanSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    ro.observe(oceanRef.current)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    localStorage.setItem('thoughts', JSON.stringify(thoughts))
  }, [thoughts])
  
  function addThought() {
    const val = input.trim()
    if (!val) return
    setThoughts(prev => [...prev, { text: val, date: new Date() }])
    setInput('')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* Ocean fills entire screen */}
      <div
        ref={oceanRef}
        style={{ position: 'absolute', inset: 0 }}
      >
        <ShaderGradientCanvas
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <ShaderGradient
            animate="on"
            axesHelper="off"
            brightness={1}
            cAzimuthAngle={180}
            cDistance={2.69}
            cPolarAngle={80}
            cameraZoom={9.1}
            color1="#90caf9"
            color2="#0d47a1"
            color3="#e3f2fd"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="on"
            lightType="3d"
            loop="on"
            loopDuration={10}
            pixelDensity={1}
            positionX={0}
            positionY={0}
            positionZ={0}
            range="enabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={50}
            rotationY={0}
            rotationZ={-60}
            shader="defaults"
            toggleAxis={false}
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.5}
            uFrequency={0}
            uSpeed={0.15}
            uStrength={1.5}
            uTime={8}
            wireframe={false}
            zoomOut={false}
          />
        </ShaderGradientCanvas>

        {thoughts.map((t, i) => (
  <Fish
    key={i}
    thought={t.text}
    oceanWidth={oceanSize.width}
    oceanHeight={oceanSize.height}
    onClick={() => setSelectedThought(t)}
  />
))}

      </div>

     {/* Input bar pinned to bottom */}
{/* Input bar pinned to bottom */}
<div style={{
  position: 'absolute',
  bottom: 0, left: 0, right: 0,
  padding: '16px 32px 24px 32px',
}}>
<div style={{ 
  display: 'flex', gap: 8, alignItems: 'center',
}}>
  <div style={{
    flex: 1,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '4px 8px',
    position: 'relative',
  }}>
    {!input && (
      <div style={{
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        <TextType
          text={["What's on your mind?"]}
          loop={false}
          typingSpeed={60}
          showCursor={true}
          cursorCharacter="|"
          style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}
        />
      </div>
    )}
    <input
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && addThought()}
      placeholder=""
      maxLength={350}
      style={{
        width: '100%', height: 42, fontSize: 14, borderRadius: 8,
        border: 'none', padding: '0 14px', outline: 'none',
        color: 'white',
        fontFamily: 'inherit',
        position: 'relative',
        zIndex: 2,
        background: 'transparent',
      }}
    />
  </div>
  <button
    onClick={addThought}
    style={{
      height: 42, padding: '0 20px', borderRadius: 10,
      border: '1px solid rgba(144, 202, 249, 0.5)',
      background: 'rgba(5, 20, 60, 0.55)',
      color: 'white', fontSize: 14, cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontFamily: 'inherit',
      boxShadow: '0 0 12px rgba(144, 202, 249, 0.3), inset 0 0 12px rgba(144, 202, 249, 0.05)',
      transition: 'box-shadow 0.2s, background 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 0 24px rgba(144, 202, 249, 0.6), inset 0 0 16px rgba(144, 202, 249, 0.1)'
      e.currentTarget.style.background = 'rgba(144, 202, 249, 0.25)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 0 12px rgba(144, 202, 249, 0.3), inset 0 0 12px rgba(144, 202, 249, 0.05)'
      e.currentTarget.style.background = 'rgba(144, 202, 249, 0.15)'
    }}
  >
    Release fish
  </button>
  <div style={{
    fontSize: 12, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap',
    background: 'rgba(5, 20, 60, 0.55)',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(12px)',
    borderRadius: 10,
    padding: '6px 12px',
    userSelect: 'none'
  }}>
    {thoughts.length} swimming
  </div>
</div>
</div>
      <AnimatePresence>
  {selectedThought && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => { setSelectedThought(null); setIsEditing(false); setShowDeleteConfirm(false) }}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(5, 20, 60, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          padding: '32px 40px',
          maxWidth: 420,
          width: '80%',
          color: 'white',
          fontSize: 18,
          lineHeight: 1.6,
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.15)',
          position: 'relative',
        }}
      >
        {showDeleteConfirm ? (
          <div>
            <p style={{ fontSize: 16, marginBottom: 24 }}>
              Are you sure you want to delete this thought?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setThoughts(prev => prev.filter(t => t !== selectedThought))
                  setSelectedThought(null)
                  setShowDeleteConfirm(false)
                }}
                style={{
                  background: 'rgba(180, 40, 40, 0.45)',
                  border: '1px solid rgba(255,100,100,0.4)',
                  color: 'white', borderRadius: 8,
                  padding: '8px 20px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13,
                }}
              >
                delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white', borderRadius: 8,
                  padding: '8px 20px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13,
                }}
              >
                go back
              </button>
            </div>
          </div>

        ) : (
          <>
            {/* trash icon */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                position: 'absolute', bottom: 16, right: 16,
                background: 'none', border: 'none',
                cursor: 'pointer', padding: 4, opacity: 0.5,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
            >
              <img src="/trash-can-svgrepo-com.svg" width={18} height={18}
                style={{ filter: 'invert(1)', display: 'block' }} />
            </button>

            {isEditing ? (
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 8, color: 'white', fontSize: 16,
                  padding: '10px 12px', fontFamily: 'inherit',
                  resize: 'none', outline: 'none', minHeight: 80,
                }}
              />
            ) : (
              selectedThought.text
            )}

            <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              {selectedThought.date.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
              {isEditing ? (
                <button
                  onClick={() => {
                    setThoughts(prev => prev.map(t =>
                      t === selectedThought ? { ...t, text: editText } : t
                    ))
                    setSelectedThought(prev => ({ ...prev, text: editText }))
                    setIsEditing(false)
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white', borderRadius: 8,
                    padding: '8px 20px', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13,
                  }}
                >
                  save
                </button>
              ) : (
                <button
                  onClick={() => { setIsEditing(true); setEditText(selectedThought.text) }}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white', borderRadius: 8,
                    padding: '8px 20px', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13,
                  }}
                >
                  edit
                </button>
              )}
              <button
                onClick={() => { setSelectedThought(null); setIsEditing(false); setShowDeleteConfirm(false) }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white', borderRadius: 8,
                  padding: '8px 20px', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13,
                }}
              >
                close
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
</div>
  )
}

