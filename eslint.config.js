import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/*.min.js',
    ],
  },
  {
    files: ['**/*.{js,ts,jsx,tsx,mjs,cjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...Object.fromEntries(
        Object.entries(tsPlugin.configs.recommended.rules).map(([k, v]) => [k, 'warn'])
      ),
      ...Object.fromEntries(
        Object.entries(js.configs.recommended.rules).map(([k, v]) => [k, 'warn'])
      ),
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'off',
      'no-redeclare': 'warn',
      'no-empty': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
