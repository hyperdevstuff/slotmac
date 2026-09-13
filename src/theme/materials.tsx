import * as THREE from 'three'
import { THEME, type ThemeDef } from './definitions'

/**
 * The one place the theme's colours become three.js materials. They are module
 * singletons: the look never changes at runtime, so every mesh shares one instance
 * and nothing needs a provider or disposal.
 */
const surface = new THREE.MeshStandardMaterial({
  color: new THREE.Color(THEME.surface),
  metalness: THEME.metalness,
  roughness: THEME.roughness,
  transparent: THEME.surfaceOpacity < 1,
  opacity: THEME.surfaceOpacity,
  depthWrite: THEME.surfaceOpacity > 0,
})

const panel = new THREE.MeshStandardMaterial({
  color: new THREE.Color(THEME.panelSurface),
  metalness: THEME.metalness,
  roughness: THEME.roughness,
  transparent: THEME.panelOpacity < 1,
  opacity: THEME.panelOpacity,
  depthWrite: THEME.panelOpacity > 0,
})

export interface SceneTheme {
  def: ThemeDef
  /** the main body */
  surface: THREE.Material
  /** inset plates, trims and the screen surround */
  panel: THREE.Material
}

const VALUE: SceneTheme = { def: THEME, surface, panel }

export function useSceneTheme(): SceneTheme {
  return VALUE
}
