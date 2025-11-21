import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'

/*
  ARViewer
  - Creates a WebXR immersive-ar session using three.js
  - Supports hit-test to place an object where the reticle appears
  - Exposes color and size through props
*/
export default function ARViewer({ color = '#ff6b6b', size = 1, shape = 'box' }) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const reticleRef = useRef(null)
  const xrRef = useRef({ session: null, hitTestSource: null, localSpace: null })
  const lastPlacedRef = useRef(null)
  const arButtonRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.xr.enabled = true
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.01, 20)
    cameraRef.current = camera

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.2)
    scene.add(light)

    // Reticle for hit-test
    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff99 })
    )
    reticle.matrixAutoUpdate = false
    reticle.visible = false
    scene.add(reticle)
    reticleRef.current = reticle

    const onResize = () => {
      if (!rendererRef.current || !cameraRef.current || !containerRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      rendererRef.current.setSize(w, h)
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // XR Button
    const btn = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test']
    })
    btn.className = 'hidden' // keep default button hidden; we control UI from React
    container.appendChild(btn)
    arButtonRef.current = btn

    const startSession = async () => {
      // trigger default ARButton flow
      btn.click()
    }

    // Allow tap to place object
    const onSelect = () => {
      const reticle = reticleRef.current
      if (!reticle || !reticle.visible) return
      const object = makeObject(color, size, shape)
      object.position.setFromMatrixPosition(reticle.matrix)
      object.quaternion.setFromRotationMatrix(reticle.matrix)
      scene.add(object)
      lastPlacedRef.current = object
    }

    const controller = renderer.xr.getController(0)
    controller.addEventListener('select', onSelect)
    scene.add(controller)

    // Animation loop with hit test
    const clock = new THREE.Clock()
    const renderLoop = (timestamp, frame) => {
      const session = renderer.xr.getSession()
      if (frame && session) {
        const referenceSpace = renderer.xr.getReferenceSpace()
        let { hitTestSource } = xrRef.current
        if (!hitTestSource) {
          session.requestReferenceSpace('viewer').then((viewerSpace) => {
            session.requestHitTestSource({ space: viewerSpace }).then((source) => {
              xrRef.current.hitTestSource = source
            })
          })
        }
        const source = xrRef.current.hitTestSource
        if (source) {
          const hitTestResults = frame.getHitTestResults(source)
          if (hitTestResults.length) {
            const hit = hitTestResults[0]
            const pose = hit.getPose(referenceSpace)
            if (pose) {
              reticle.visible = true
              reticle.matrix.fromArray(pose.transform.matrix)
            }
          } else {
            reticle.visible = false
          }
        }
      }
      // subtle animation for last placed
      if (lastPlacedRef.current) {
        lastPlacedRef.current.rotation.y += clock.getDelta() * 0.5
      }
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(renderLoop)

    // Expose start via data attribute for our custom button to call
    container.dataset.ready = 'true'
    container.addEventListener('start-ar', () => startSession())

    return () => {
      window.removeEventListener('resize', onResize)
      try {
        const s = renderer.xr.getSession()
        if (s) s.end()
      } catch {}
      renderer.setAnimationLoop(null)
      container.innerHTML = ''
    }
  }, [])

  // Update placed object's material/scale when controls change
  useEffect(() => {
    const obj = lastPlacedRef.current
    if (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.material.color = new THREE.Color(color)
        }
      })
      obj.scale.setScalar(size)
    }
  }, [color, size])

  return (
    <div ref={containerRef} className="relative w-full h-[70vh] bg-black/40 rounded-xl overflow-hidden">
      {/* Fallback overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-start justify-end p-3">
        <div className="text-xs text-white/70">Move your phone to find a surface</div>
      </div>
    </div>
  )
}

function makeObject(color, size, shape) {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({ color })
  let mesh
  switch (shape) {
    case 'cylinder':
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.4, 24), material)
      break
    case 'sphere':
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), material)
      break
    default:
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.4), material)
  }
  mesh.castShadow = true
  mesh.receiveShadow = true

  // simple base to give it a "product on a platform" feel
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.02, 32),
    new THREE.MeshStandardMaterial({ color: new THREE.Color('#1f2937') })
  )
  base.position.y = -0.135

  group.add(base)
  group.add(mesh)
  group.scale.setScalar(size)
  return group
}
