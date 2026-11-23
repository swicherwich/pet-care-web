import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// base './' дозволяє розгортати збірку в підкаталозі GitHub Pages (/pet-care-web/).
export default defineConfig({
  base: './',
  plugins: [react(), svgr({ svgrOptions: { icon: false, svgProps: { 'aria-hidden': 'true', focusable: 'false' } } })],
  build: { target: 'es2022', sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/unit/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    css: false,
  },
});
