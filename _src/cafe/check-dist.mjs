/*
 * ビルド結果の構造検査
 *
 * 2026-09-04に、Astroが出力するHTMLで同じ種類の破損を3回出した。
 *   1. <nav> 内で .map() を使い、閉じタグが文書末尾へ出た
 *   2. <title> に式と文字列を混ぜ、</head> がタイトルの途中に入って <body> が消えた
 *   3. ページ側の <script> を <Base> の外に置き、</html> の後ろへ出た
 *
 * いずれもブラウザが自動補正するため、表示を見ても気づけない。
 * ビルドのたびにこの検査を通し、失敗したら配置しない。
 *
 *   node check-dist.mjs
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const DIST = resolve('dist');
const problems = [];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function count(hay, needle) {
  return hay.split(needle).length - 1;
}

if (!existsSync(DIST)) {
  console.error('dist/ がありません。先に npm run build を実行してください。');
  process.exit(1);
}

const files = walk(DIST);
if (files.length === 0) problems.push('dist/ にHTMLがありません');

for (const f of files) {
  const rel = f.replace(DIST, 'dist').replace(/\\/g, '/');
  const t = readFileSync(f, 'utf8');

  // 1. 基本タグが1つずつあること
  //    <head> と <header> を取り違えないよう、直後が空白か > のものだけ数える
  for (const [tag, close] of [
    ['html', '</html>'],
    ['head', '</head>'],
    ['body', '</body>'],
  ]) {
    const opens = (t.match(new RegExp('<' + tag + '[ >]', 'g')) || []).length;
    if (opens !== 1) problems.push(`${rel}: <${tag}> が ${opens} 個`);
    if (count(t, close) !== 1) problems.push(`${rel}: ${close} が ${count(t, close)} 個`);
  }

  const iHeadEnd = t.indexOf('</head>');
  const iBody = t.indexOf('<body');
  const iBodyEnd = t.indexOf('</body>');
  const iHtmlEnd = t.indexOf('</html>');

  // 2. 順序
  if (!(iHeadEnd < iBody && iBody < iBodyEnd && iBodyEnd < iHtmlEnd)) {
    problems.push(`${rel}: head/body/html の順序が不正`);
  }

  // 3. </html> の後ろに中身がないこと
  const after = t.slice(iHtmlEnd + '</html>'.length).trim();
  if (after.length > 0) problems.push(`${rel}: </html> の後ろに ${after.length} 文字ある`);

  // 4. title / description / robots が head 内にあること
  for (const needle of ['<title>', 'name="description"', 'name="robots"']) {
    const i = t.indexOf(needle);
    if (i < 0) problems.push(`${rel}: ${needle} が無い`);
    else if (i > iHeadEnd) problems.push(`${rel}: ${needle} が head の外にある`);
  }

  // 5. title が途中で切れていないこと（区切り記号まで含まれる想定）
  const m = /<title>([\s\S]*?)<\/title>/.exec(t);
  if (m && !m[1].includes('｜')) problems.push(`${rel}: title が途中で切れている疑い「${m[1]}」`);

  // 6. script が body 内にあること
  let idx = -1;
  while ((idx = t.indexOf('<script', idx + 1)) >= 0) {
    if (idx < iBody || idx > iBodyEnd) problems.push(`${rel}: <script> が body の外にある`);
  }

  // 7. nav が main より前に閉じていること
  const iNavEnd = t.indexOf('</nav>');
  const iMain = t.indexOf('<main');
  if (iNavEnd >= 0 && iMain >= 0 && iNavEnd > iMain) {
    problems.push(`${rel}: </nav> が <main> より後ろにある`);
  }

  // 8. 内部参照の実在（/works/cafe/ 配下のみ検査）
  const refs = new Set();
  for (const r of t.matchAll(/(?:src|href)="(\/works\/cafe\/[^"#?]*)"/g)) refs.add(r[1]);
  for (const ref of refs) {
    let p = join(DIST, ref.replace('/works/cafe/', '').replace(/\//g, '\\'));
    if (ref.endsWith('/')) p = join(p, 'index.html');
    if (!existsSync(p)) problems.push(`${rel}: 参照切れ ${ref}`);
  }
}

if (problems.length > 0) {
  console.error(`\n検査に失敗しました（${problems.length}件）\n`);
  for (const p of problems) console.error('  - ' + p);
  console.error('\n配置しないでください。\n');
  process.exit(1);
}

console.log(`検査OK: ${files.length} ページに構造の問題なし`);
