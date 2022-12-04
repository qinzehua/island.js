import { build as viteBuild, InlineConfig } from "vite";
import { join } from "path";
import fs from "fs-extra";
import { pathToFileURL } from "url";

import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from "./constants";

export async function bundle(root: string): Promise<any> {
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: "production",
    root,
    build: {
      ssr: isServer,
      outDir: isServer ? ".temp" : "build",
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm",
        },
      },
    },
  });

  console.log(`Building client + server bundles...`);

  try {
    const [clientBundle, serverBundle] = await Promise.all([
      viteBuild(resolveViteConfig(false)),
      viteBuild(resolveViteConfig(true)),
    ]);
    return [clientBundle, serverBundle];
  } catch (e) {
    console.log(e);
  }
}

export async function renderPage(
  render: () => string,
  root: string,
  clientBundle
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  console.log(`Rendering page in server side...`);
  const appHtml = render();
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>title</title>
        <meta name="description" content="xxx">
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script type="module" src="/${clientChunk?.fileName}"></script>
      </body>
    </html>`.trim();
  await fs.ensureDir(join(root, "build"));
  await fs.writeFile(join(root, "build/index.html"), html);
  await fs.remove(join(root, ".temp"));
}

export async function build(root: string = process.cwd()): Promise<void> {
  const [clientBundle, serverBundle] = await bundle(root);
  const serverEntryPath = join(root, ".temp", "ssr-entry.js");
  const { render } = await import(pathToFileURL(serverEntryPath).toString());
  await renderPage(render, root, clientBundle);
}
