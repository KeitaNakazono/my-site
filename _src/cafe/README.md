# works/cafe（喫茶ひととき）のソース

`https://keita-works.com/works/cafe/` として公開している自主制作サンプルのソースです。
Astroで書き、ビルドした結果を `works/cafe/` へ置いています。

## 必要なもの

- Node.js 22 以上（Astro 6 の要件）

## 作り直す手順

```
cd _src/cafe
npm ci
npm run build
rm -rf ../../works/cafe
mkdir -p ../../works/cafe
cp -r dist/* ../../works/cafe/
```

`astro.config.mjs` の `base` に `/works/cafe` を指定しているため、そのままのパスで動きます。

## 注意

- `works/cafe/` はビルド結果です。直接編集しても次のビルドで消えます。編集は `_src/cafe/src/` 側で行ってください。
- **`<title>` に式と文字列を混ぜて書かない。** `<title>{title}｜店名</title>` と書くと、Astroのコンパイラが `</head>` をタイトルの途中に出力し、`<body>` が消えます。フロントマターで文字列を組み立て、`<title>{pageTitle}</title>` と書いてください（2026-09-04に対処）。
- **レイアウトの `<nav>` は直書きにする。** `.map()` で書き出すと閉じタグが文書末尾へ出力され、`<nav>` がページ全体を包み込みます（2026-09-04に対処）。
- **ページ側の `<script>` は `slot="page-script"` を使う。** `<Base>` の外に置くと `</html>` の後ろへ出力されます（2026-09-04に対処）。
- ビルド後は `<body>` の有無と、`<script>` が `</body>` より前にあることを必ず確認してください。
