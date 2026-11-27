/* Compare the same input route at two local revision URLs. */
const { chromium, devices } = require('playwright');

const base = process.argv[2] || 'http://127.0.0.1:8313';
const cpuRate = Number(process.env.CPU_RATE || 4);
const profiles = [
  ['Android emulado', devices['Pixel 7']],
  ['Tela grande DPR 2', { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 }]
];

async function measure(page, fullscreen) {
  if (fullscreen) {
    await page.locator('#worldFullscreen').click();
    await page.waitForFunction(() => !!document.fullscreenElement);
  }
  await page.evaluate(() => {
    Math.random = () => .99;
    const original = window.benchmarkDraw ||= forestTerrain.draw;
    const measurement = { active: true, draws: [], frames: [] };
    window.benchmark = measurement;
    forestTerrain.draw = (...args) => {
      const start = performance.now();
      original(...args);
      if (measurement.active) measurement.draws.push(performance.now() - start);
    };
    let last = performance.now();
    function measureFrame(now) {
      if (!measurement.active) return;
      measurement.frames.push(now - last);
      last = now;
      requestAnimationFrame(measureFrame);
    }
    requestAnimationFrame(measureFrame);
  });

  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowLeft']) {
    await page.keyboard.down(key);
    await page.waitForTimeout(670);
    await page.keyboard.up(key);
  }

  return page.evaluate(() => {
    benchmark.active = false;
    const { draws, frames } = benchmark;
    const percentile = (values, fraction) => {
      const sorted = values.slice(2).sort((a, b) => a - b);
      return Number(sorted[Math.floor((sorted.length - 1) * fraction)].toFixed(2));
    };
    const canvas = document.querySelector('#ibrahimExploreCanvas');
    return {
      surface: [canvas.width, canvas.height],
      css: [canvas.clientWidth, canvas.clientHeight],
      frames: frames.length,
      drawP50: percentile(draws, .50),
      drawP95: percentile(draws, .95),
      frameP95: percentile(frames, .95),
      late: frames.filter(time => time > 26).length,
      heapMb: Math.round(performance.memory.usedJSHeapSize / 1e6)
    };
  });
}

async function run() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--window-size=1920,1080']
  });
  try {
    const results = [];
    for (const [name, options] of profiles) {
      const context = await browser.newContext(options);
      try {
        const page = await context.newPage();
        const session = await context.newCDPSession(page);
        await session.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
        await page.goto(base);
        await page.locator('#openExploreMode').click();
        for (const fullscreen of [false, true]) {
          results.push({ name, fullscreen, ...await measure(page, fullscreen) });
        }
      } finally {
        await context.close();
      }
    }
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
