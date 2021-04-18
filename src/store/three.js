import create from 'zustand'

let DPR = 1
if (typeof window !== 'undefined') {
  DPR = window.devicePixelRatio
}

const useStore = create((set,get) => {
  return {
    scenes: {},
    addScene: (scene) => {
      const scenes = get().scenes
      console.log(scene)
      set(state => ({ scenes: {...scenes, [scene.id]: scene} }))
    },

    canvas: null,
    setCanvas: (canvas) => set(state => ({ canvas })),

    renderer: null,
    setRenderer: (renderer) => set(state => ({ renderer })),
    
    devicePixelRatio: DPR,
    setDevicePixelRatio: (dpr) => set(state => ({ devicePixelRatio: dpr })),
  }
})

export default useStore