import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@react-three')) {
            return 'three-react';
          }

          if (id.includes('node_modules/@dimforge/rapier3d-compat')) {
            return 'rapier';
          }

          if (id.includes('node_modules/draco3d')) {
            return 'draco';
          }

          if (
            id.includes('node_modules/three-stdlib') ||
            id.includes('node_modules/camera-controls') ||
            id.includes('node_modules/maath')
          ) {
            return 'three-helpers';
          }

          if (
            id.includes('node_modules/three/')
          ) {
            return 'three-core';
          }

          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }

          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
  plugins: [react()],
});
