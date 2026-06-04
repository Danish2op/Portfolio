import fs from 'node:fs/promises';
import path from 'node:path';

import { chromium } from 'playwright';

const ROOT = process.cwd();
const SITE_ID = 'itomdev.com';
const RESEARCH_DIR = path.join(ROOT, 'docs', 'research', SITE_ID);
const DESIGN_DIR = path.join(ROOT, 'docs', 'design-references', SITE_ID);

const url = 'https://itomdev.com/';

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

async function writeMarkdown(filePath, content) {
  await fs.writeFile(filePath, `${content.trim()}\n`);
}

async function collectPageSnapshot(page, label, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({
    fullPage: true,
    path: path.join(DESIGN_DIR, `${label}-full.png`),
  });

  const scrollHeights = await page.evaluate(() => ({
    viewportHeight: window.innerHeight,
    totalHeight: document.documentElement.scrollHeight,
  }));

  const slices = Math.max(
    1,
    Math.ceil(scrollHeights.totalHeight / scrollHeights.viewportHeight),
  );

  for (let index = 0; index < slices; index += 1) {
    const y = index * scrollHeights.viewportHeight;
    await page.evaluate((scrollY) => {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }, y);
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(DESIGN_DIR, `${label}-slice-${index + 1}.png`),
    });
  }

  return page.evaluate(() => {
    const collectUnique = (values) =>
      [...new Set(values.filter(Boolean).map((value) => String(value).trim()))];

    const textFrom = (selector, limit = 20) =>
      [...document.querySelectorAll(selector)]
        .map((node) => node.textContent?.trim())
        .filter(Boolean)
        .slice(0, limit);

    const sampleElements = [...document.querySelectorAll('body *')].slice(0, 500);
    const styleSamples = sampleElements.map((element) => {
      const styles = getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      return {
        tag: element.tagName.toLowerCase(),
        text: element.textContent?.trim().slice(0, 140) || null,
        className: element.className?.toString().slice(0, 160) || null,
        position: styles.position,
        display: styles.display,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
        color: styles.color,
        background: styles.backgroundImage !== 'none' ? styles.backgroundImage : styles.backgroundColor,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
        transform: styles.transform,
        transition: styles.transition,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    });

    const fixedOrSticky = sampleElements
      .map((element) => {
        const styles = getComputedStyle(element);
        if (!['fixed', 'sticky'].includes(styles.position)) {
          return null;
        }

        const rect = element.getBoundingClientRect();

        return {
          tag: element.tagName.toLowerCase(),
          text: element.textContent?.trim().slice(0, 120) || null,
          className: element.className?.toString().slice(0, 160) || null,
          position: styles.position,
          top: styles.top,
          zIndex: styles.zIndex,
          background: styles.backgroundColor,
          backdropFilter: styles.backdropFilter,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        };
      })
      .filter(Boolean);

    const clickable = [...document.querySelectorAll('a, button')]
      .map((element) => {
        const styles = getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          text: element.textContent?.trim().slice(0, 120) || null,
          href: element.tagName.toLowerCase() === 'a' ? element.getAttribute('href') : null,
          cursor: styles.cursor,
          color: styles.color,
          background: styles.backgroundImage !== 'none' ? styles.backgroundImage : styles.backgroundColor,
          borderRadius: styles.borderRadius,
          transition: styles.transition,
        };
      })
      .filter((entry) => entry.text || entry.href);

    const media = {
      images: [...document.querySelectorAll('img')].map((image) => ({
        src: image.currentSrc || image.src,
        alt: image.alt,
        width: image.naturalWidth,
        height: image.naturalHeight,
      })),
      videos: [...document.querySelectorAll('video')].map((video) => ({
        src: video.currentSrc || video.src || video.querySelector('source')?.src || null,
        poster: video.poster || null,
        autoplay: video.autoplay,
        muted: video.muted,
        loop: video.loop,
      })),
    };

    const sectionLikeNodes = sampleElements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const text = element.textContent?.trim();
        if (!text || text.length < 18 || rect.height < 160 || rect.width < 240) {
          return null;
        }

        const styles = getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          className: element.className?.toString().slice(0, 200) || null,
          text: text.slice(0, 220),
          top: rect.top,
          height: rect.height,
          display: styles.display,
          background: styles.backgroundImage !== 'none' ? styles.backgroundImage : styles.backgroundColor,
          position: styles.position,
        };
      })
      .filter(Boolean)
      .slice(0, 30);

    return {
      title: document.title,
      url: window.location.href,
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      htmlClasses: document.documentElement.className,
      bodyClasses: document.body.className,
      headings: {
        h1: textFrom('h1', 6),
        h2: textFrom('h2', 20),
        h3: textFrom('h3', 20),
      },
      navText: textFrom('nav a, header a', 30),
      paragraphSamples: textFrom('p', 30),
      fontFamilies: collectUnique(styleSamples.map((sample) => sample.fontFamily)).slice(0, 20),
      colors: collectUnique(styleSamples.map((sample) => sample.color)).slice(0, 24),
      backgrounds: collectUnique(styleSamples.map((sample) => sample.background)).slice(0, 24),
      fixedOrSticky,
      clickable: clickable.slice(0, 60),
      media,
      sectionLikeNodes,
      behaviorHints: {
        hasLenisClass:
          document.documentElement.classList.contains('lenis') ||
          document.body.classList.contains('lenis'),
        stickyCount: fixedOrSticky.filter((entry) => entry.position === 'sticky').length,
        fixedCount: fixedOrSticky.filter((entry) => entry.position === 'fixed').length,
        hasVideo: media.videos.length > 0,
      },
      styleSamples: styleSamples.slice(0, 120),
    };
  });
}

async function collectScrollStates(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle' });

  const readHeaderState = () =>
    page.evaluate(() => {
      const candidate =
        document.querySelector('header') ??
        document.querySelector('nav') ??
        [...document.querySelectorAll('body *')].find((node) => {
          const styles = getComputedStyle(node);
          return ['fixed', 'sticky'].includes(styles.position) && node.textContent?.trim();
        });

      if (!candidate) {
        return null;
      }

      const styles = getComputedStyle(candidate);
      const rect = candidate.getBoundingClientRect();

      return {
        text: candidate.textContent?.trim().slice(0, 140) || null,
        className: candidate.className?.toString().slice(0, 180) || null,
        backgroundColor: styles.backgroundColor,
        boxShadow: styles.boxShadow,
        backdropFilter: styles.backdropFilter,
        borderBottom: styles.borderBottom,
        transform: styles.transform,
        height: rect.height,
      };
    });

  const topState = await readHeaderState();
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await page.waitForTimeout(400);
  const scrolledState = await readHeaderState();

  return {
    topState,
    scrolledState,
  };
}

function buildBehaviorMarkdown(states, desktopData) {
  const lines = [
    '# itomdev.com Behaviors',
    '',
    '## Global Signals',
    `- Possible smooth-scroll class present: ${desktopData.behaviorHints.hasLenisClass ? 'yes' : 'no'}`,
    `- Fixed overlays detected: ${desktopData.behaviorHints.fixedCount}`,
    `- Sticky elements detected: ${desktopData.behaviorHints.stickyCount}`,
    `- Video elements detected: ${desktopData.behaviorHints.hasVideo ? 'yes' : 'no'}`,
    '',
    '## Header / Nav State',
    `- Top state: ${states.topState ? JSON.stringify(states.topState) : 'No clear header candidate found.'}`,
    `- Scrolled state: ${states.scrolledState ? JSON.stringify(states.scrolledState) : 'No clear header candidate found.'}`,
    '',
    '## Clickable Samples',
    ...desktopData.clickable.slice(0, 20).map((item) => `- ${item.tag}: ${item.text || item.href || 'Unnamed'}`),
    '',
    '## Section Signals',
    ...desktopData.sectionLikeNodes
      .slice(0, 12)
      .map((node, index) => `- Section ${index + 1}: ${node.tag} | top=${Math.round(node.top)} | h=${Math.round(node.height)} | text="${node.text}"`),
  ];

  return lines.join('\n');
}

function buildTopologyMarkdown(desktopData, mobileData) {
  const lines = [
    '# itomdev.com Page Topology',
    '',
    '## Desktop Headings',
    ...desktopData.headings.h1.map((heading) => `- H1: ${heading}`),
    ...desktopData.headings.h2.map((heading) => `- H2: ${heading}`),
    '',
    '## Navigation Labels',
    ...desktopData.navText.map((item) => `- ${item}`),
    '',
    '## Section-like Blocks',
    ...desktopData.sectionLikeNodes
      .slice(0, 16)
      .map((node, index) => `- Block ${index + 1}: ${node.tag} | display=${node.display} | background=${node.background} | sample="${node.text}"`),
    '',
    '## Mobile Notes',
    `- Mobile viewport height: ${mobileData.viewportHeight}`,
    `- Mobile page height: ${mobileData.pageHeight}`,
    `- Mobile nav labels sampled: ${mobileData.navText.join(' | ') || 'none detected'}`,
  ];

  return lines.join('\n');
}

async function main() {
  await ensureDir(RESEARCH_DIR);
  await ensureDir(DESIGN_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const desktopData = await collectPageSnapshot(page, 'desktop', {
      width: 1440,
      height: 900,
    });

    const mobileData = await collectPageSnapshot(page, 'mobile', {
      width: 390,
      height: 844,
    });

    const scrollStates = await collectScrollStates(page);

    await fs.writeFile(
      path.join(RESEARCH_DIR, 'page.html'),
      await page.content(),
    );
    await writeJson(path.join(RESEARCH_DIR, 'desktop-data.json'), desktopData);
    await writeJson(path.join(RESEARCH_DIR, 'mobile-data.json'), mobileData);
    await writeJson(path.join(RESEARCH_DIR, 'scroll-states.json'), scrollStates);
    await writeMarkdown(
      path.join(ROOT, 'docs', 'research', 'BEHAVIORS.md'),
      buildBehaviorMarkdown(scrollStates, desktopData),
    );
    await writeMarkdown(
      path.join(ROOT, 'docs', 'research', 'PAGE_TOPOLOGY.md'),
      buildTopologyMarkdown(desktopData, mobileData),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
