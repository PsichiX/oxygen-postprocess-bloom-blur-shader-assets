# Oxygen Game Engine Postprocess Bloom Blur Shader Assets

## Install
```bash
npm install --save oxygen-postprocess-bloom-blur-shader-assets
```

## Usage
**webpack.config.js** - *config.plugins* section:
```javascript
new PackWebpackPlugin([
  { input: [
    'static/assets',
    // include assets into generated assets.pack
    '<oxygen-postprocess-bloom-blur-shader-assets>/assets'
  ] }
])
```
