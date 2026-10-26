// import fs from 'fs';

// const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

// export default {
//   name: pkg.name,
//   triggers: {
//     keywords: [
//       "npm",
//       "package info",
//       "packages like",
//       "compare packages",
//       "package alternatives",
//       "npm vs",
//       "best npm package for"
//     ]
//   },
//   query_format: {
//     regex: [
//       "HD_PACKAGES.NPM_PACKAGES",
//       "(npm( packages?)?|package info) HD_PACKAGES.NPM_PACKAGES",
//       "(latest|current) version of HD_PACKAGES.NPM_PACKAGES",
//       "compare( npm)?( packages?)? HD_PACKAGES.NPM_PACKAGES(,| vs| versus| and) HD_PACKAGES.NPM_PACKAGES((,| vs| versus| and) HD_PACKAGES.NPM_PACKAGES)?",
//       "HD_PACKAGES.NPM_PACKAGES vs HD_PACKAGES.NPM_PACKAGES( vs HD_PACKAGES.NPM_PACKAGES)?",
//       "(npm )?(alternatives?( to| for)|packages? (like|similar to)) HD_PACKAGES.NPM_PACKAGES( npm)?",
//       "HD_PACKAGES.NPM_PACKAGES [0-9]+(\\.[0-9]+)? vs [0-9]+(\\.[0-9]+)?",
//       "(best|top) npm (package|library) for [a-zA-Z0-9 -]+",
//       "(npm )?(package|library) for [a-zA-Z0-9 -]+"
//     ]
//   },
//   client: {
//     location: pkg.module,
//     moduleName: pkg.umdName || 'HD' + pkg.name,
//     baseURL: '/' + pkg.name
//   },
//   format: {
//     mainline: true,
//     sidebar: true
//   },
//   permissions: {},
//   info: {},
//   github: "https://github.com/your-username/package-info-component",
//   demovideo: "https://www.youtube.com/watch?v=your-video-id"
// };

import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import hdConfig from './hyperdart.config';
import hDBackend from '@hyperdart/backend';

function createDartFramePlugin(hdConfig, pkg) {
  const baseURL = hdConfig?.client?.baseURL || "/";
  const updatedConfig = {
    ...hdConfig,
    client: {
      ...hdConfig.client,
      location: '/' + pkg.source,
    },
  };

  return {
    name: 'vite-plugin-dart-frame',
    configureServer(server) {
      // Mock local authentication to prevent 404 errors in test harness
      server.middlewares.use('/nodeapi/auth', (req, res) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ authenticated: true, user: "local-dev" }));
      });

      server.middlewares.use(baseURL, async (req, res, next) => {
        try {
          const rawHtml = await hDBackend.createDartFrame(updatedConfig, null);
          const html = await server.transformIndexHtml(req.originalUrl, rawHtml);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html");
          res.end(html);
        } catch (e) {
          server.ssrFixStacktrace(e);
          next(e);
        }
      });
    },
  };
}

export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  const { dir: outDir, name: fileName } = path.parse(pkg.module);

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      createDartFramePlugin(hdConfig, pkg),
      cssInjectedByJsPlugin(),
      visualizer(),
    ],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
    server: {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      proxy: {
        '/nodeapi': {
          target: 'https://dev.hyperdart.com',
          changeOrigin: true,
          secure: true,
        },
        '/c': {
          target: 'https://dev.hyperdart.com',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    build: {
      lib: {
        entry: pkg.source,
        name: pkg.umdName || 'HD' + pkg.name,
        fileName,
        formats: ['es'],
      },
      emptyOutDir: false,
      outDir,
    },
  };
});