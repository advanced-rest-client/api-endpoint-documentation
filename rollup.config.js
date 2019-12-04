import { createCompatibilityConfig } from '@open-wc/building-rollup';
import path from 'path';
import cpy from 'rollup-plugin-cpy';

const config = createCompatibilityConfig({
  input: path.join('demo', 'index.html'),
  indexHTMLPlugin: {
    minify: {
      minifyJS: true,
      removeComments: true,
    },
  },
});

config[0].context = 'window';
config[1].context = 'window';

export default [
  config[0],
  {
    ...config[1],
    plugins: [
      ...config[1].plugins,
      cpy({
        files: [
          path.join('demo', '*.json'),
          path.join('demo', 'vendor.js'),
        ],
        dest: 'dist',
        options: {
          parents: false,
        },
      }),
    ],
  },
];
