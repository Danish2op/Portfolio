import { useGLTF } from '@react-three/drei';

export const dracoDecoderPath =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

export type WorldAssetDefinition = {
  id: string;
  path: string;
};

export const worldAssetRegistry: WorldAssetDefinition[] = [];

export function primeAssetRegistry() {
  useGLTF.setDecoderPath(dracoDecoderPath);

  for (const asset of worldAssetRegistry) {
    useGLTF.preload(asset.path, true);
  }
}
