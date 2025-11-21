import { useId } from 'react'

export default function Controls({ color, setColor, size, setSize, shape, setShape, onStartAR }) {
  const colorId = useId()
  const sizeId = useId()
  const shapeId = useId()

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label htmlFor={colorId} className="block text-sm text-white/80 mb-1">Color</label>
          <input id={colorId} type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-full h-10 bg-transparent" />
        </div>
        <div>
          <label htmlFor={sizeId} className="block text-sm text-white/80 mb-1">Size</label>
          <input id={sizeId} type="range" min="0.5" max="2.5" step="0.1" value={size} onChange={(e)=>setSize(parseFloat(e.target.value))} className="w-full" />
        </div>
        <div>
          <label htmlFor={shapeId} className="block text-sm text-white/80 mb-1">Shape</label>
          <select id={shapeId} value={shape} onChange={(e)=>setShape(e.target.value)} className="w-full bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-white">
            <option value="box">Box</option>
            <option value="sphere">Sphere</option>
            <option value="cylinder">Cylinder</option>
          </select>
        </div>
        <div className="flex md:justify-end">
          <button onClick={onStartAR} className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 12l8.954-8.955c.44-.439 1.196-.128 1.196.488V7.5c6.213 0 7.5 4.5 7.5 9 0-3-1.5-6-7.5-6v3.966c0 .616-.756.927-1.196.488L2.25 12z"/></svg>
            Start AR
          </button>
        </div>
      </div>
    </div>
  )
}
