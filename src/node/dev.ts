import { createServer } from 'vite';
import pluginReact from '@vitejs/plugin-react';

import { pluginIndexHtml } from './plugin-island/indexHtml';
import { PACKAGE_ROOT } from './constants';

export function createDevServer(root: string) {
  return createServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact()],
    server: {
      fs: {
        allow: [PACKAGE_ROOT]
      }
    }
  });
}
