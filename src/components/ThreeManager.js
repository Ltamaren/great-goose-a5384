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
      },
      state => state.scenes
    )
    // window.addEventListener("resize", resize)
    return () => {
      // window.removeEventListener("resize", resize)
      unsub()
    }
  }, [])

  function resize() {
    const scenes = scenesRef.current
    for (const id in scenes) {
      const elem = scenes[id].elem
      const { width, height } = elem.getBoundingClientRect()
      scenes[id].dims = { width, height }
      scenes[id].ctx.canvas.width = width
      scenes[id].ctx.canvas.height = height
    }

    // canvasRef.current.width = window.innerWidth
    // canvasRef.current.height = window.innerHeight
    // rendererRef.current.setSize(window.innerWidth, window.innerWidth)
  }

  function init() {
    const canvas = document.createElement("canvas")
    canvasRef.current = canvas;
    
    const renderer = new WebGLRenderer({canvas: canvasRef.current, alpha: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setScissorTest(true);
    rendererRef.current = renderer;
    
    // resize()

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
        // make sure the renderer's canvas is big enough
        if (canvas.width < width || canvas.height < height) {
          renderer.setSize(width, height, false);
        }

        // make sure the canvas for this area is the same size as the area
        if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
          ctx.canvas.width = width;
          ctx.canvas.height = height;
        }

        renderer.setScissor(0, 0, width/2, height/2);
        renderer.setViewport(0, 0, width/2, height/2);

        fn(time, rect, renderer);

        // copy the rendered scene to this element's canvas
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(
            rendererCanvas,
            0, canvas.height - height, width, height,  // src rect
            0, 0, width, height);                              // dst rect
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