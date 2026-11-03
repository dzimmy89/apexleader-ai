// How render.mjs (and cloud/gpu-check.mjs) start Chrome.
//   CHROME_ARGS set      -> exactly those flags
//   CHROME_PATH on a Mac -> the Mac's Chrome with Metal
//   CHROME_PATH on Linux -> Chrome with Vulkan on the machine's GPU (the render
//                           image; --no-sandbox because the task runs as root)
//   neither              -> Playwright's headless shell on SwiftShader (CPU)
export function chromeArgs() {
  if (process.env.CHROME_ARGS) return process.env.CHROME_ARGS.split(/\s+/).filter(Boolean);
  if (!process.env.CHROME_PATH) return ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
  if (process.platform === 'darwin') return ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-angle=metal'];
  return ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-gpu-blocklist', '--enable-gpu-rasterization',
    '--use-angle=vulkan', '--enable-features=Vulkan', '--disable-vulkan-surface'];
}
