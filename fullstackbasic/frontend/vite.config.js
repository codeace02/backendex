import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // proxy: {
    //   // '/api': 'http://localhost:8080' //append b krayega nd cors b remove krega , i.e ye jo url request hui h wo b isi server s hui h
    // }
  },
  plugins: [react()],
})
