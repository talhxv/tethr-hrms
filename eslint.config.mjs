// Flat ESLint config (ESLint 9). Encodes the architecture playbook's hard rules:
//  - no `any`, no enums (string-literal unions instead), consistent type imports
//  - the two-bucket boundary: core/ must never import from modules/
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/generated/**',
      '**/*.config.{js,cjs,mjs,ts}',
      'packages/web/vite.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { import: importPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            'packages/shared/tsconfig.json',
            'packages/ui/tsconfig.json',
            'packages/api/tsconfig.json',
            'packages/worker/tsconfig.json',
            'packages/web/tsconfig.json',
          ],
        },
        node: true,
      },
    },
    rules: {
      // tsc owns undefined-symbol checking for TS files.
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      // Deliberately OFF: this rule conflicts with NestJS constructor injection.
      // Classes injected by type rely on `emitDecoratorMetadata`, which needs the
      // value import to survive — converting them to `import type` (as this rule's
      // autofix would) erases the reference and breaks DI at runtime.
      '@typescript-eslint/consistent-type-imports': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message:
            'Use string-literal union types instead of enums (generated GraphQL code is exempt and ignored).',
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
  // The two-bucket rule: core/ is the platform layer; it must not depend on the
  // HR domain. Dependencies flow modules/ -> core/, never the reverse.
  {
    files: ['packages/api/src/**/*.ts'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './packages/api/src/core',
              from: './packages/api/src/modules',
              message:
                'core/ (platform) must not import from modules/ (HR domain). Invert the dependency or publish an interface.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/web/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
  },
  // The worker is a standalone Node process; logging to stdout is expected.
  {
    files: ['packages/worker/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);
