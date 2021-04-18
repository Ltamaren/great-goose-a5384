import { useRef, useEffect, useMemo } from 'react';
import useThreeStore from '../store/three'
import { WebGLRenderer } from 'three'

let canvas, renderer
if (typeof window !== 'undefined') {
  canvas = document.createElement('canvas')
  renderer = new WebGLRenderer({ canvas, alpha: true })
}

const ThreeManager = () => {
  const { scenes } = useThreeStore(state => state)
  const frameRef = useRef()

  useEffect(() => {
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setScissorTest(true);
  }, [])

  useEffect(() => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(render);
  }, [scenes])

  function render(time) {
    
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
        if (rendererCanvas.width !== width || rendererCanvas.height !== height) {
          renderer.setSize(width, height, true);
        }

        // make sure the canvas for this area is the same size as the area
        if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
          ctx.canvas.width = width;
          ctx.canvas.height = height;
          // ctx.canvas.style.width = 
        }

        renderer.setScissor(0, 0, width/2, height/2);
        renderer.setViewport(0, 0, width/2, height/2);

        fn(time, rect);
        // renderer.render(scene, camera);

        // copy the rendered scene to this element's canvas
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(
            rendererCanvas,
            0, rendererCanvas.height - height, width, height,  // src rect
            0, 0, width, height);                              // dst rect
      }
    }

    frameRef.current = requestAnimationFrame(render);
  }
  
  return null
}

export default ThreeManager
export {
  renderer
}