import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 10200,
        allowedHosts: [
            'comcon.nasgrid.tech',
            '.nasgrid.tech',
            'localhost'
        ],
        watch: {
            usePolling: true
        }
    },
})