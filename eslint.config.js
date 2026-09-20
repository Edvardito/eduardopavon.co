import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/', '.astro/', '.vercel/', 'node_modules/'] },

  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  // Includes the jsx-a11y-equivalent rules for Astro templates.
  astro.configs['jsx-a11y-recommended'],

  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  {
    // Globals inline rather than the `globals` package for two names.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
    // Printing is this script's output.
    rules: { 'no-console': 'off' },
  },

  // Must stay last: turns off everything Prettier already handles.
  prettier,
);
