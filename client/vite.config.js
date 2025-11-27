import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',  // ← Add this to listen on all interfaces
        port: 10200,       // ← Add this to match your port
        allowedHosts: [
            'comcon.nasgrid.tech',
            '.nasgrid.tech',
            'localhost'
        ],
        proxy: {
            '/api': {
                // Use comcon_server in Docker, localhost otherwise
                target: process.env.DOCKER_ENV === 'true' 
                    ? 'http://comcon_server:10100' 
                    : 'http://localhost:10100',
                changeOrigin: true,
            },
        },
        watch: {
            usePolling: true  // ← Add this for hot reload in Docker
        }
    },
})