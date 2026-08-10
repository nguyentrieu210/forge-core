import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Desk chạy cục bộ.
 *
 * `main-base.tsx` khởi tạo `new FrappeAdapterImpl({})` — base rỗng nghĩa là same-origin, nên mọi
 * lời gọi `/api` đi vào chính dev server này. Không có proxy thì Vite trả `index.html` (200,
 * text/html) cho `/api/method/metaforge.api.get_boot`; adapter map thành `not_found` và Desk
 * dừng ở màn "Forge connection — Không tìm thấy bản ghi", dù worker vẫn khoẻ.
 *
 * `VITE_FORGE_BACKEND` là cổng chỉnh backend mà `server/RUNBOOK_LOCAL.md` đã nhắc tới; mặc định
 * 8799 khớp cổng worker trong runbook.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Runtime imports workspace packages through /@fs while its own entry is resolved
  // from this app.  Without dedupe, a local nested pnpm install can hand ReactDOM one
  // React instance and @metaforge/ui another, producing an invalid-hook-call blank
  // screen on 5173.  One renderer instance is a correctness requirement, not merely
  // a bundle-size optimization.
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_FORGE_BACKEND ?? "http://127.0.0.1:8799",
        changeOrigin: true,
      },
    },
  },
});
