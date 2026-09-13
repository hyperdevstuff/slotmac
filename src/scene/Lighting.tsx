import { useSceneTheme } from '../theme/materials'

export function Lighting() {
  const { def } = useSceneTheme()

  return (
    <>
      <ambientLight intensity={def.ambient} />
      <directionalLight position={[7, 12, 9]} intensity={def.keyIntensity} color={def.line} />
      <directionalLight position={[-9, 5, -7]} intensity={def.keyIntensity * 0.22} color={def.accent} />
      <pointLight position={[0, 1.4, 5.5]} intensity={def.pointIntensity} distance={26} decay={2} color={def.accent} />
    </>
  )
}
