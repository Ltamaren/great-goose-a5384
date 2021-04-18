import { useRef, useEffect } from 'react';
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import GLTFLoader from 'three-gltf-loader';
import _ from 'lodash';
import { withPrefix } from '../utils';
import useThreeStore from '../store/three'
import renderer from './ThreeManager'

const {
  PointLight, PerspectiveCamera, Scene, WebGLRenderer,
  Color, Raycaster, Vector2, Vector3, Matrix4, Box3,
  Mesh, BoxBufferGeometry, MeshBasicMaterial, ArrowHelper, } = THREE
const OrbitControls = oc(THREE)
const loader = new GLTFLoader()

const raycaster = new Raycaster()

const INIT_POS = '{"cameraPosition":{"x":-4.854831631971536,"y":1.1582137352538657,"z":0.7749090484638657},"targetPosition":{"x":-1.706169253874643,"y":1.5165199445198663,"z":-1.4398500949057278}}'

const HeroBarn = (props) => {
  const cnrRef = useRef()
  const canvasRef = useRef()
  const cameraRef = useRef()
  const controlsRef = useRef()
  const rendererRef = useRef()
  const sceneRef = useRef()
  const modelRef = useRef()
  const bboxRef = useRef()
  const lightRef = useRef()
  const frameRef = useRef()
  const { addScene } = useThreeStore(state => state)

  useEffect(() => {
    console.log("BOOP")
    handleMounted()
  }, [])

  async function handleMounted() {
    // const sceneData = makeScene(cnrRef.current)
    const sceneRenderFn = await initScene(cnrRef.current)
    console.log("BOOP", scene)
    const scene = {
      id: 'hero-barn',
      elem: cnrRef.current,
      ctx: canvasRef.current.getContext('2d'),
      fn: sceneRenderFn,
    }
    addScene(scene)
  }

  async function initScene() {
    const cnr = cnrRef.current
    const canvas = canvasRef.current
    var scene, renderer, camera, controls

    renderer = new WebGLRenderer({ canvas });
                
    //this is to get the correct pixel detail on portable devices
    renderer.setPixelRatio( window.devicePixelRatio );

    //and this sets the canvas' size.
    const cnrDims = cnr.getBoundingClientRect()
    renderer.setSize( cnrDims.width, cnrDims.height );

    scene = new Scene();
    scene.background = new Color('black');

    const cameraInitPos = props.cameraInitPos.split(',').map(i => parseFloat(i))
    camera = new PerspectiveCamera( 
        70,                               //FOV
        canvas.width / canvas.height,     //aspect
        1,                                //near clipping plane
        100                               //far clipping plane
    );

    const savedCamera = JSON.parse(INIT_POS)

    // camera.position.set( ...cameraInitPos );
    camera.position.copy(savedCamera.cameraPosition)
    
    await new Promise((yes, no) => {
      loader.load(
        withPrefix(_.get(props, 'scene', null)),
        (gltf) => {
          scene.add(gltf.scene)
          modelRef.current = gltf.scene
          bboxRef.current = new Box3().setFromObject( gltf.scene );
          // const box = makeBox(bboxRef.current)
          // scene.add(box)
          // update()
        }
      )
    })

    const light2 = new PointLight()
    light2.position.set(0,6.748,-11.808)
    light2.intensity = 1
    scene.add(light2)

    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.copy(savedCamera.targetPosition)
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    // window._CONTROLS = controls
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enabled = false;
    // controls.addEventListener("change", render)
    
    window.addEventListener( 'resize', handleResize );
    
    sceneRef.current = scene
    rendererRef.current = renderer
    canvasRef.current = canvas
    cameraRef.current = camera
    controlsRef.current = controls
    window._CAMERA = cameraRef.current
    // render()
    // run()

    return (time, rect) => {
      console.log("rendering hero")
      renderer.render(scene, camera)
    }
  }

  function handleResize() {
    const dims = cnrRef.current.getBoundingClientRect()
    cameraRef.current.aspect = dims.width / dims.height;
    cameraRef.current.updateProjectionMatrix();
    // rendererRef.current.setSize( dims.width, dims.height );
  }

  // function run () {
    // frameRef.current = requestAnimationFrame( run );
    // update()
  // }

  // function update () {
  //   controlsRef.current.update();
  //   rendererRef.current.render( sceneRef.current, cameraRef.current );
  // }
  
  // function render() {
  //   rendererRef.current.render( sceneRef.current, cameraRef.current );
  // }

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