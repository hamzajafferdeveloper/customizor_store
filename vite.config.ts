import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: '192.168.1.6', // <-- Use your actual IP address here
        port: 5173,
        strictPort: true,
        origin: 'http://192.168.1.6:5173', // <-- Explicitly define origin
        cors: true, // <-- Enable CORS
    },
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    optimizeDeps: {
        include: ['react-simple-maps', 'd3-scale', 'd3-geo'],
    },
});
