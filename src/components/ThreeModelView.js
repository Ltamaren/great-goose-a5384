import { useRef, useEffect } from 'react';
import { withPrefix } from '../utils';
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import GLTFLoader from 'three-gltf-loader';
import _ from 'lodash';

const {
  PointLight, PerspectiveCamera, Scene, WebGLRenderer,
  Color, Raycaster, Vector2, Vector3, Matrix4, Box3,
  Mesh, BoxBufferGeometry, MeshBasicMaterial, ArrowHelper, } = THREE
const OrbitControls = oc(THREE)
const loader = new GLTFLoader()

const raycaster = new Raycaster()

const ThreeModelView = (props) => {
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

  useEffect(() => {
    initScene()
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  function initScene() {
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
    scene.background = new Color(props.bgColor);

    const cameraInitPos = props.cameraInitPos.split(',').map(i => parseFloat(i))
    camera = new PerspectiveCamera( 
        70,                               //FOV
        canvas.width / canvas.height,     //aspect
        1,                                //near clipping plane
        100                               //far clipping plane
    );
    camera.position.set( ...cameraInitPos );
    
    loader.load(
      withPrefix(_.get(props, 'scene', null)),
      (gltf) => {
        scene.add(gltf.scene)
        modelRef.current = gltf.scene
        bboxRef.current = new Box3().setFromObject( gltf.scene );
        // const box = makeBox(bboxRef.current)
        // scene.add(box)
        update()
      }
    )

    const light2 = new PointLight()
    light2.position.set(0,6.748,-11.808)
    light2.intensity = 1
    scene.add(light2)

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchend", handleTouchEnd)

    controls = new OrbitControls( camera, renderer.domElement );
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.1;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enabled = false;
    controls.addEventListener("change", render)

    window.addEventListener( 'resize', handleResize );

    sceneRef.current = scene
    rendererRef.current = renderer
    canvasRef.current = canvas
    cameraRef.current = camera
    controlsRef.current = controls

    render()
  }

  function makeBox(bbox) {
    // make a BoxBufferGeometry of the same size as Box3
    const dimensions = new Vector3().subVectors( bbox.max, bbox.min );
    const boxGeo = new BoxBufferGeometry(dimensions.x, dimensions.y, dimensions.z);

    // move new mesh center so it's aligned with the original object
    const matrix = new Matrix4().setPosition(dimensions.addVectors(bbox.min, bbox.max).multiplyScalar( 0.5 ));
    boxGeo.applyMatrix(matrix);

    // make a mesh
    const mesh = new Mesh(boxGeo, new MeshBasicMaterial( { color: 0xffcc55 } ));
    return mesh
  }

  function handleResize() {
    const dims = cnrRef.current.getBoundingClientRect()
    cameraRef.current.aspect = dims.width / dims.height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize( dims.width, dims.height );
  }

  function handleMouseDown() {
    controlsRef.current.enabled = true
  }
  
  function handleMouseUp() {
    controlsRef.current.enabled = false
  }

  function handleTouchStart(e) {
    const { width, height, x, y } = cnrRef.current.getBoundingClientRect()
    const user = new Vector2(
      (e.targetTouches[0].clientX - x) / width * 2 - 1,
      -((e.targetTouches[0].clientY - y) / height * 2 - 1)
    )
    raycaster.setFromCamera(user, cameraRef.current)
    // sceneRef.current.add(new ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000) )
    if (raycaster.ray.intersectsBox(bboxRef.current)) {
      controlsRef.current.enabled = true
    }
  }

  function handleTouchEnd() {
    controlsRef.current.enabled = false
  }
  
  function run () {
    frameRef.current = requestAnimationFrame( run );
    update()
  }

  function update () {
    controlsRef.current.update();
    rendererRef.current.render( sceneRef.current, cameraRef.current );
  }
  
  function render() {
    rendererRef.current.render( sceneRef.current, cameraRef.current );
  }

  return(
    <div className="ThreeModelView" ref={cnrRef} style={{
      width: '100%',
      paddingBottom: '100%',
      position: 'relative',
    }}>
      <canvas
        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, touchAction: 'pan-y'}}
        ref={canvasRef} />
    </div>
  )
}

export default ThreeModelView