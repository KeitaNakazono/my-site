# works/cafe（喫茶ひととき）のソース

`https://keita-works.com/works/cafe/` として公開している自主制作サンプルのソースです。
Astroで書き、ビルドした結果を `works/cafe/` へ置いています。

## 作り直す手順

```
cd _src/cafe
npm install
npm run build
```

`dist/` の中身を、リポジトリ直下の `works/cafe/` へ丸ごとコピーします。
`astro.config.mjs` の `base` に `/works/cafe` を指定しているため、
そのままのパスで動きます。

## 注意

- `works/cafe/` はビルド結果です。直接編集しても次のビルドで消えます。編集はこの `_src/cafe/src/` 側で行ってください。
- レイアウトの `<nav>` は直書きにしています。`.map()` で書き出すとAstroが閉じタグを誤った位置に出力する問題が起きたためです（2026-09-04に対処）。
