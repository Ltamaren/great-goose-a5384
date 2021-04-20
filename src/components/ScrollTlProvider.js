import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ScrollTlProvider = () => {
  useEffect(() => {
    const scrollables = Array.from(document.querySelectorAll('.block-title, .block-content, .button'))
    scrollables.forEach(node => {
      gsap.set(node, { opacity: 0 })
      // tl.add(
        gsap.to(node, {
          opacity: 1,
          scrollTrigger: node,
          start: "top 75%",
          end: "bottom center",
          scrub: true,
        })
      // )
    })
  }, [])

  return null
}

export default ScrollTlProvider