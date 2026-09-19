import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/* The DESIGN.md rules that are load-bearing enough to fail a build. */

const SRC = path.resolve('src');
const STYLESHEET = path.join(SRC, 'styles', 'global.css');
const SCRIPT_DIR = path.join(SRC, 'scripts');

const MAX_SCRIPT_BYTES = 4 * 1024;

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(full) : Promise.resolve([full]);
    }),
  );
  return files.flat();
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function stripThemeBlock(css: string): string {
  const start = css.indexOf('@theme');
  if (start === -1) return css;
  const open = css.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(0, start) + css.slice(i + 1);
    }
  }
  return css;
}

const COLOUR_FUNCTIONS = /\b(rgba?|hsla?|hwb|oklch|oklab|lab|lch|color-mix|color)\(/g;

function readCall(source: string, open: number): string {
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '(') depth += 1;
    if (source[i] === ')') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return source.slice(open);
}

// Lookarounds keep `white-space` from reading as a colour.
const NAMED_COLOURS =
  /(?<![\w-])(white|black|red|green|blue|gray|grey|silver|navy|teal|olive|maroon|purple|fuchsia|aqua|lime|yellow|orange|pink|brown|beige|ivory|tan|gold|cyan|magenta)(?![\w-])/;

describe('palette containment', () => {
  /* Derived forms pass: the glass edge needs alpha variants. Do not widen. */
  it('has no colour literal under src/ outside the @theme block', async () => {
    const files = (await walk(SRC)).filter((f) => /\.(css|astro|ts|js)$/.test(f));
    const offences: string[] = [];

    for (const file of files) {
      let source = stripComments(await readFile(file, 'utf8'));
      if (file === STYLESHEET) source = stripThemeBlock(source);
      const relative = path.relative(process.cwd(), file);

      for (const match of source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        offences.push(`${relative}: ${match[0]}`);
      }

      for (const match of source.matchAll(COLOUR_FUNCTIONS)) {
        const call = readCall(source, match.index + match[0].length - 1);
        if (!call.includes('var(--color-')) {
          offences.push(`${relative}: ${match[1]}${call.slice(0, 40)}`);
        }
      }

      if (file.endsWith('.css')) {
        const named = NAMED_COLOURS.exec(source);
        if (named) offences.push(`${relative}: named colour "${named[0]}"`);
      }
    }

    expect(offences, 'a fourth colour is not a one-off; see DESIGN.md §3').toEqual([]);
  });
});

describe('the script exception', () => {
  it('ships exactly one client script', async () => {
    const scripts = await readdir(SCRIPT_DIR);
    expect(scripts, 'the magnifier exception does not generalise').toEqual(['magnifier.ts']);
  });

  it('keeps the magnifier inside its budget', async () => {
    const { size } = await stat(path.join(SCRIPT_DIR, 'magnifier.ts'));
    expect(size, 'the lens is an enhancement, not an application').toBeLessThanOrEqual(
      MAX_SCRIPT_BYTES,
    );
  });

  it('has no other executable script in a component or page', async () => {
    const files = (await walk(SRC)).filter((f) => f.endsWith('.astro'));
    const offences: string[] = [];

    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        const [, attributes = '', body = ''] = match;
        // Structured data is markup, not a runtime.
        if (attributes.includes('application/ld+json')) continue;
        if (body.trim() === `import '~/scripts/magnifier';`) continue;
        offences.push(`${path.relative(process.cwd(), file)}: <script${attributes}>`);
      }
    }

    expect(offences, 'one script, and the exception sets no precedent').toEqual([]);
  });
});

describe('type floors', () => {
  /* It shipped once at 13px, which is what this floor prevents. */
  it('never sets the display face below its floor', async () => {
    const css = await readFile(STYLESHEET, 'utf8');
    const rem = (value: string) =>
      value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value);

    const tokens = ['--text-label', '--titlecard-min'];
    for (const token of tokens) {
      const match = new RegExp(`${token}:\\s*([^;]+);`).exec(css);
      expect(match, `${token} is missing`).not.toBeNull();
      expect(rem(match![1]!.trim()), `${token} is under the 30px floor`).toBeGreaterThanOrEqual(30);
    }
  });
});

describe('motion guards', () => {
  /* A hidden start state once applied in browsers that never animated it. */
  it('declares every animation inside prefers-reduced-motion: no-preference', async () => {
    const css = stripComments(await readFile(STYLESHEET, 'utf8'));
    const offences: string[] = [];
    const stack: string[] = [];
    let header = '';

    for (let i = 0; i < css.length; i += 1) {
      const char = css[i];
      if (char === '{') {
        stack.push(header.trim());
        header = '';
      } else if (char === '}') {
        stack.pop();
        header = '';
      } else if (char === ';') {
        const declaration = header.trim();
        if (/^animation(-name)?\s*:/.test(declaration)) {
          const guarded = stack.some((entry) =>
            /prefers-reduced-motion\s*:\s*no-preference/.test(entry),
          );
          if (!guarded) offences.push(declaration);
        }
        header = '';
      } else {
        header += char;
      }
    }

    expect(offences, 'an unguarded animation can strand content invisible').toEqual([]);
  });
});
