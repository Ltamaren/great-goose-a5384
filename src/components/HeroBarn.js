import { useRef, useEffect } from 'react';
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import GLTFLoader from 'three-gltf-loader';
import _ from 'lodash';
import { withPrefix } from '../utils';
import useThreeStore from '../store/three'
import renderer from './ThreeManager'

const {
  PointLight, PerspectiveCamera, Scene,
  Color, Raycaster, } = THREE
const OrbitControls = oc(THREE)
const loader = new GLTFLoader()

const INIT_POS = '{"cameraPosition":{"x":-4.854831631971536,"y":1.1582137352538657,"z":0.7749090484638657},"targetPosition":{"x":-1.706169253874643,"y":1.5165199445198663,"z":-1.4398500949057278}}'

const HeroBarn = (props) => {
  const cnrRef = useRef()
  const canvasRef = useRef()
  const cameraRef = useRef()
  const controlsRef = useRef()
  const rendererRef = useRef()
  const sceneRef = useRef()
  const frameRef = useRef()
  const { addScene } = useThreeStore(state => state)

  useEffect(() => {
    handleMounted()
    return () => {
      window.removeEventListener("resize", setSize)
    }
  }, [])

  async function handleMounted() {
    const sceneRenderFn = await initScene(cnrRef.current)
    const ctx = canvasRef.current.getContext('2d')
    const scene = {
      id: 'hero-barn',
      elem: cnrRef.current,
      fn: sceneRenderFn,
      ctx,
    }
    addScene(scene)
  }

  async function initScene() {
    const cnr = cnrRef.current
    var scene, camera, controls

    scene = new Scene();
    scene.background = new Color('black');

    const cameraInitPos = props.cameraInitPos.split(',').map(i => parseFloat(i))
    camera = new PerspectiveCamera( 
        70,                               //FOV
        cnr.width / cnr.height,           //aspect
        1,                                //near clipping plane
        10                                //far clipping plane
    );

    const savedCamera = JSON.parse(INIT_POS)

    // camera.position.set( ...cameraInitPos );
    camera.position.copy(savedCamera.cameraPosition)
    
    const barn = await new Promise((yes, no) => {
      loader.load(
        withPrefix(_.get(props, 'scene', null)),
        (gltf) => {
          yes(gltf.scene)
        }
      )
    })
    scene.add(barn)

    const light2 = new PointLight()
    light2.position.set(0,6.748,-11.808)
    light2.intensity = 1
    scene.add(light2)

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.copy(savedCamera.targetPosition)
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enabled = false;
    
    window.addEventListener( 'resize', setSize );
    
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera
    controlsRef.current = controls
    window._CAMERA = cameraRef.current

    return (time, rect, renderer) => {
      renderer.render(scene, camera)
    }
  }

  function setSize() {
    const dims = cnrRef.current.getBoundingClientRect()
    cameraRef.current.aspect = dims.width / dims.height;
    cameraRef.current.updateProjectionMatrix();
  }

  return(
    <div className="HeroBarn" ref={cnrRef} style={{
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0, left: 0,
    }}>
      <canvas
        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, touchAction: 'pan-y'}}
        ref={canvasRef} />
    </div>
  )
}

export default HeroBarn