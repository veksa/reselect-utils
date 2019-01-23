import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  external: ['react', 'react-redux'],
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'es2015',
        },
      },
    }),
  ],
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      sourcemap: true,
      exports: 'named',
      name: 'ReselectUtils',
      globals: {
        react: 'React',
        'react-redux': 'ReactRedux',
      },
    },
  ],
};