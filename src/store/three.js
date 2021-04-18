import create from 'zustand'

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
  }
})

export default useStore