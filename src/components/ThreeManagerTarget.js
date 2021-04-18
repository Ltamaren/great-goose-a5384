const ThreeManagerTarget = (props) => {
  return(
    <div
      className="ThreeManagerTarget"
      data-three-model={props.scene}
      data-camera-position={props.cameraInitPos}
      style={{
        width: '100%',
        paddingBottom: '100%',
        position: 'relative',
    }}>
    </div>
  )
}

export default ThreeManagerTarget