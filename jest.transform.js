module.exports = require('babel-jest').createTransformer({
  retainLines: true,
  presets: [
    [
      'env',
      {
        // useBuiltIns: true,
        // debug: false,
        targets: {
          node: true,
        },
      },
    ],
  ],
  plugins: ['transform-object-rest-spread'],
});
