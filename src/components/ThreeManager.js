import { useRef, useEffect } from 'react';
import { withPrefix } from '../utils';
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import GLTFLoader from 'three-gltf-loader';
import _, { update } from 'lodash';
import {TrackballControls} from './TrackballControls';

const {
  DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer,
  Color, Raycaster, Vector2, Box3, ArrowHelper, } = THREE
const OrbitControls = oc(THREE)
const loader = new GLTFLoader()
const raycaster = new Raycaster()

const ThreeManager = () => {
  const canvasRef = useRef()

  useEffect(() => {
    main()
  }, [])

  function main() {
    const canvas = document.createElement('canvas');
    const renderer = new WebGLRenderer({ canvas, alpha: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setScissorTest(true);
  
    const sceneElements = [];
    function addScene(elem, fn) {
      const ctx = document.createElement('canvas').getContext('2d');
      elem.appendChild(ctx.canvas);
      sceneElements.push({elem, ctx, fn});
    }

    function makeScene(elem) {
      const scene = new Scene();

      const camera = new PerspectiveCamera( 
        // 70,                               //FOV
        // elem.width / elem.height,         //aspect
        // 1,                                //near clipping plane
        // 100                               //far clipping plane
      )
      const initCamPos = elem.dataset.cameraPosition.split(',').map(i => parseFloat(i))
      camera.position.set(...initCamPos);
      camera.lookAt(0, 0, 0);
      scene.add(camera);

      const controls = new OrbitControls(camera, elem);
      controls.noZoom = true;
      controls.noPan = true;
      controls.enabled = false;
      controls.autoRotate = true
      // controls.autoRotateSpeed = 0.1
      // controls.addEventListener("change", () => {
      //   console.log(camera.position, controls.target)
      // })

      {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        camera.add(light);
      }

      return {scene, camera, controls};
    }

    async function initScene(elem) {
      let scene, camera, controls
      const model = await new Promise((yes, no) => {
        loader.load(
          withPrefix(elem.dataset.threeModel),
          gltf => yes(gltf.scene)
        )
      })
      
      elem.addEventListener("mouseup", () => { controls.enabled = false })
      elem.addEventListener("mousedown", () => { controls.enabled = true })
      elem.addEventListener("touchend", () => { controls.enabled = false })
      elem.addEventListener("touchstart", (e) => {
        const { width, height, x, y } = elem.getBoundingClientRect()
        const user = new Vector2(
          (e.targetTouches[0].clientX - x) / width * 2 - 1,
          -((e.targetTouches[0].clientY - y) / height * 2 - 1)
        )
        raycaster.setFromCamera(user, camera)
        // scene.add(new ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000) )
        if (raycaster.ray.intersectsBox(new Box3().setFromObject( model ))) {
          controls.enabled = true
        }
      })

      const s = makeScene(elem);
      scene = s.scene
      camera = s.camera
      controls = s.controls
      // controls.update();

      scene.add(model);
      return (time, rect) => {
        // model.rotation.y = time * .1;
        camera.aspect = rect.width / rect.height;
        camera.updateProjectionMatrix();
        // controls.handleResize();
        controls.update();
        renderer.render(scene, camera);
      };
    }

    document.querySelectorAll('.ThreeManagerTarget').forEach(async (elem) => {
      // const sceneInitFunction = sceneInitFunctionsByName[sceneName];
      const sceneRenderFunction = await initScene(elem);
      // requestAnimationFrame(render)
      addScene(elem, sceneRenderFunction);
    });
    
    function render(time) {
      // time *= 0.0001;
  
      for (const {elem, fn, ctx} of sceneElements) {
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
  
          // copy the rendered scene to this element's canvas
          ctx.globalCompositeOperation = 'copy';
          ctx.drawImage(
              rendererCanvas,
              0, rendererCanvas.height - height, width, height,  // src rect
              0, 0, width, height);                              // dst rect
        }
      }
  
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

  }
  // return null
  return (
    <canvas id="boopCanvas" ref={canvasRef} style={{position: 'fixed', zIndex: -1}} />
  )
}

export default ThreeManager