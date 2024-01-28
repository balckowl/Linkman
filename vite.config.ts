import { crx, defineManifest } from "@crxjs/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const manifest = defineManifest({
  manifest_version: 3,
  name: "Linkman",
  version: "1.0.0",
  permissions: ["alarms", "tabs", "webNavigation", "activeTab", "storage"],
  icons: {
    "128": "icons/icon.png"
  },
  action: {
    default_popup: "",
  },
  background: {
    service_worker: "src/background/index.ts",
  },
  content_scripts: [
    {
      matches: ["https://zenn.dev/*"],
      js: ["src/contentScript/script.tsx"],
    },
  ],
  web_accessible_resources: [
    {
      matches: ["<all_urls>"],
      resources: ["src/index.css"]
    },
    {
      resources: ["src/assets/badge.png"],
      matches: ["<all_urls>"]
    }
  ]
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})
