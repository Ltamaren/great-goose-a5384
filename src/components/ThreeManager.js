import { useRef, useLayoutEffect } from 'react';
import useThreeStore from '../store/three'
import { WebGLRenderer, Color } from 'three'

const ThreeManager = () => {
  const frameRef = useRef()
  const canvasRef = useRef()
  const rendererRef = useRef()
  const scenesRef = useRef()

  useLayoutEffect(() => {
    init()
    const unsub = useThreeStore.subscribe(
      (registered) => {
        let regs = registered
        for (const id in regs) {
          regs[id].rect = regs[id].elem.getBoundingClientRect()
        }
        scenesRef.current = regs
        resize()
      },
      state => state.scenes
    )
    window.addEventListener("resize", resize)
    return () => {
      window.removeEventListener("resize", resize)
      unsub()
    }
  }, [])

  function resize() {
    const scenes = scenesRef.current
    // let rW = 0
    // let rH = 0
    for (const id in scenes) {
      const scale = window.devicePixelRatio
      const { elem, ctx } = scenes[id]
      const { width, height } = elem.getBoundingClientRect()
      const sW = width * scale
      const sH = height * scale
      ctx.canvas.width = sW
      ctx.canvas.height = sH
      // rW = Math.max(rW, sW)
      // rH = Math.max(rH, sH)
    }
    // rendererRef.current.setSize(rW, rH)
  }

  function init() {
    const canvas = document.createElement("canvas")
    canvasRef.current = canvas;
    
    const renderer = new WebGLRenderer({canvas: canvasRef.current, alpha: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setScissorTest(true);
    rendererRef.current = renderer;
    
    frameRef.current = requestAnimationFrame(render)
  }

  function render(time) {
    const canvas = canvasRef.current
    const renderer = rendererRef.current
    const scenes = scenesRef.current

    time *= 0.001;

    for (const id in scenes) {
      const {elem, fn, ctx} = scenes[id]
      // get the viewport relative position of this element
      const rect = elem.getBoundingClientRect();
      const {left, right, top, bottom, width, height} = rect;
      const rendererCanvas = renderer.domElement;

      const isOffscreen =
      bottom < 0 ||
      top > window.innerHeight ||
      right < 0 ||
      left > window.innerWidth;
      
      if (!isOffscreen) {
        const scale = window.devicePixelRatio
        const scaledWidth = width * scale
        const scaledHeight = height * scale
        // make sure the renderer's canvas is big enough
        if (canvas.width/scale < width || canvas.height/scale < height) {
          renderer.setSize(width, height, false);
        }

        renderer.setScissor(0, 0, width, height);
        renderer.setViewport(0, 0, width, height);

        fn(time, rect, renderer);

        // copy the rendered scene to this element's canvas
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(
            rendererCanvas,
            0, canvas.height - scaledHeight, scaledWidth, scaledHeight,  // src rect
            0, 0, scaledWidth, scaledHeight);                              // dst rect
      }
    }

    frameRef.current = requestAnimationFrame(render);
  }

  return null
  return(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        display: 'block',
        // zIndex: '-1',
      }} />
  )
}

export default ThreeManager