import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Su GitHub Actions imposta il path del repo, in locale usa './'
  base: process.env.GITHUB_ACTIONS ? '/wunderkammer/' : './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pigmenti: resolve(__dirname, 'modules/01-pigmenti/index.html'),
        gestalt: resolve(__dirname, 'modules/02-gestalt/index.html'),
        morfogenesi: resolve(__dirname, 'modules/03-morfogenesi/index.html'),
        restauro: resolve(__dirname, 'modules/04-restauro/index.html'),
        frequenza: resolve(__dirname, 'modules/05-frequenza/index.html'),
        chimera: resolve(__dirname, 'modules/06-chimera/index.html'),
      },
    },
  },
});
