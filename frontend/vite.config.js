import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}', // This tells React plugin to process both .js and .jsx files
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  define: {
    global: 'window',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  }
});
