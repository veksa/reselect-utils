import { defineConfig, Options } from 'tsup';

export default defineConfig(options => {
  const commonOptions: Partial<Options> = {
    entry: {
      reselectUtils: 'src/index.ts',
    },
    sourcemap: true,
    ...options,
  };

  return [
    // Modern ESM
    {
      ...commonOptions,
      format: ['esm'],
      external: ['react', 'react-dom'],
      target: 'es2019',
      outExtension: () => ({ js: '.mjs' }),
      dts: true,
      clean: true,
    },
    {
      ...commonOptions,
      format: 'cjs',
      external: ['react', 'react-dom'],
      outDir: './dist/cjs/',
      outExtension: () => ({ js: '.cjs' }),
    },
  ];
});
