import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const repoBase = process.env.GITHUB_ACTIONS ? '/ai-rca-platform/' : '/';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: repoBase
});
