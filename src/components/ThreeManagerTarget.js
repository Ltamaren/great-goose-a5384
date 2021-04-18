import { useEffect, useRef } from 'react'
import useThreeStore from '../store/three'
import { withPrefix } from '../utils'
import * as THREE from 'three'
import oc from 'three-orbit-controls'
import GLTFLoader from 'three-gltf-loader';
import { renderer } from './ThreeManager';

const {
  DirectionalLight, PerspectiveCamera, Scene, WebGLRenderer,
  Color, Raycaster, Vector2, Vector3, Matrix4, Box3,
  Mesh, BoxBufferGeometry, MeshBasicMaterial, ArrowHelper, } = THREE
const OrbitControls = oc(THREE)
const loader = new GLTFLoader()
const raycaster = new Raycaster()

const ThreeManagerTarget = (props) => {
  const cnrRef = useRef()
  const canvasRef = useRef()
  const { devicePixelRatio, addScene } = useThreeStore(state => state)

  useEffect(() => {
    handleMounted() // HANDLE ASYNC ?
  }, [])

  async function handleMounted() {
    const sceneData = makeScene(cnrRef.current)
    const sceneRenderFn = await initScene(cnrRef.current)
    const rect = canvasRef.current.getBoundingClientRect()
    // canvasRef.current.width = rect.width
    // canvasRef.current.height = rect.height
    const ctx = canvasRef.current.getContext('2d')
    addScene({
      id: props.id,
      elem: cnrRef.current,
      fn: sceneRenderFn,
      ctx,
    })
  }

  function makeScene(elem) {
    const scene = new Scene();

    const camera = new PerspectiveCamera()
    const initCamPos = props.cameraInitPos.split(',').map(i => parseFloat(i))
    camera.position.set(...initCamPos);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    const controls = new OrbitControls(camera, elem);
    controls.noZoom = true;
    controls.noPan = true;
    controls.enabled = false;
    controls.autoRotate = true

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
        withPrefix(props.scene),
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

    scene.add(model);
    return (time, rect) => {
      // model.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      // controls.handleResize()
      controls.update();
      renderer.render(scene, camera);
    };
  }

  return(
    <div
      className="ThreeManagerTarget"
      data-three-model={props.scene}
      data-camera-position={props.cameraInitPos}
      ref={cnrRef}
      style={{
        width: '100%',
        paddingBottom: '100%',
        position: 'relative',
    }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default ThreeManagerTarget