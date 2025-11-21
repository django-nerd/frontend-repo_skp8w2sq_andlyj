import { useEffect, useState } from 'react'
import ARViewer from './components/ARViewer'
import Controls from './components/Controls'

function App() {
  const [color, setColor] = useState('#ff6b6b')
  const [size, setSize] = useState(1)
  const [shape, setShape] = useState('box')
  const [supported, setSupported] = useState(null)

  useEffect(() => {
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr.isSessionSupported('immersive-ar').then((ok) => setSupported(ok))
    } else {
      setSupported(false)
    }
  }, [])

  const startAR = () => {
    const container = document.querySelector('[data-ready="true"]')
    if (container) {
      container.dispatchEvent(new Event('start-ar'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="relative min-h-screen p-6 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AR Product Visualizer</h1>
          <p className="text-blue-200 mt-3">Place a virtual product in your space and tweak its look in real time.</p>
        </div>

        {/* Controls */}
        <div className="max-w-5xl mx-auto mb-6">
          <Controls
            color={color}
            setColor={setColor}
            size={size}
            setSize={setSize}
            shape={shape}
            setShape={setShape}
            onStartAR={startAR}
          />
          {supported === false && (
            <div className="mt-3 text-sm text-amber-300">
              Your device or browser may not support WebXR AR. Try a recent mobile browser.
            </div>
          )}
        </div>

        {/* AR Viewport */}
        <div className="max-w-5xl mx-auto">
          <ARViewer color={color} size={size} shape={shape} />
        </div>

        {/* Tips */}
        <div className="max-w-3xl mx-auto mt-6 text-center text-white/70 text-sm">
          <p>Tap the screen to place the object on a detected surface. Adjust color, size, and shape while in AR.</p>
        </div>
      </div>
    </div>
  )
}

export default App
