import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'tts-proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/api/tts', (req, res) => {
          try {
            const url = new URL(req.url, 'http://localhost:5173');
            const q = url.searchParams.get('q') || '';
            const tl = url.searchParams.get('tl') || 'en';

            if (!q) {
              res.writeHead(400);
              res.end('Missing query');
              return;
            }

            const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(q)}&tl=${encodeURIComponent(tl)}&client=tw-ob`;

            https.get(googleTtsUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            }, (ttsRes) => {
              res.writeHead(ttsRes.statusCode || 200, {
                'Content-Type': ttsRes.headers['content-type'] || 'audio/mpeg',
                'Cache-Control': 'public, max-age=86400',
                'Access-Control-Allow-Origin': '*'
              });
              ttsRes.pipe(res);
            }).on('error', (err) => {
              console.error('TTS Proxy Error:', err);
              res.writeHead(500);
              res.end('TTS Proxy Error');
            });
          } catch (e) {
            console.error('TTS Middleware Exception:', e);
            res.writeHead(500);
            res.end('Server Error');
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
