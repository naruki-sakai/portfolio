# ParticleText チューニングガイド

TOP ページタイトル「Naruki Sakai Portfolio」のパーティクルアニメーションを
手作業で微調整するための作業ノート。

---

## 1. ファイル構成と対象箇所

```
apps/web/src/
  components/particle-text.tsx   ← 本体（全ロジック）
  app/page.tsx                   ← props を渡している呼び出し側
```

### particle-text.tsx の構造マップ

| セクション | 行の目安 | 何をしているか |
|---|---|---|
| **定数** (`GRAY_COLOR`, `DARK_RATIO`, `hexToRgb`) | 62-68 | グレー色・黒比率・色変換ユーティリティ |
| **props デフォルト** | 70-81 | density, particleSize, repulsionRadius 等の既定値 |
| **initParticles** | 122-212 | Canvas 生成・テキストピクセル走査・粒子配列の構築 |
| **animate > physics** | 229-301 | 毎フレームの位置・速度更新（反発 / 戻りスプリング） |
| **animate > per-char state** | 303-325 | wasDisplaced / bounceT の管理 |
| **animate > render** | 327-396 | smoothScatter 計算 → crisp text 描画 → 粒子バッチ描画 |
| **mouse handlers** | 434-459 | hovering フラグと RAF の起動/停止 |

> 調整時に触るのは **太字** の 4 セクション（定数・initParticles・physics・render）がほとんど。
> mouse handlers はまず触らなくて OK。

---

## 2. 触れるパラメータ一覧と推奨レンジ

### 2-A. 粒子数（密度）

| 場所 | 変数 | 現在値 | 推奨レンジ | 効果 |
|---|---|---|---|---|
| props / page.tsx | `density` | 1.6 | 1.0 - 2.5 | **低いほど粒子が多い**。gap = round(density * dpr) でサンプリング間隔になる |

```tsx
// page.tsx — ここを変えれば粒子数が変わる
<ParticleText density={1.6} ... />
```

- dpr=2 の場合: density=1.6 → gap=3 / density=1.0 → gap=2（粒子約 2.25 倍）
- **注意**: 1.0 未満にすると gap=1 で全ピクセル走査になり重い

### 2-B. 粒子サイズ

| 場所 | 変数 | 現在値 | 推奨レンジ | 効果 |
|---|---|---|---|---|
| props / page.tsx | `particleSize` | 2.5 | 1.5 - 4.0 | 円の直径(CSS px)。大きいと存在感 UP |

```tsx
// render セクション — radius はここから算出
const radius = particleSize / 2;  // L334
```

### 2-C. 散りの強さ・速度・減衰

すべて **animate > physics** セクション内。

| 変数 / 式 | 行の目安 | 現在値 | 推奨 | 効果 |
|---|---|---|---|---|
| `repulsionStrength` (props) | 77 | 22 | 10 - 40 | 反発力の基本強度。大きい = 速く遠くへ |
| `repulsionRadius` (props) | 76 | 100 | 60 - 200 | 影響範囲(px)。大きい = 広い範囲の文字が散る |
| **hover damping** `p.vx *= 0.88` | 268-269 | 0.88 | 0.82 - 0.94 | 低い = 早く止まる / 高い = 滑る |
| **hover noise** `* 0.5` | 264-265 | 0.5 | 0.2 - 1.2 | 高い = 粒子のランダム揺れ大 |
| **origin spring** `* 0.005` | 260-261 | 0.005 | 0.002 - 0.02 | 高い = ホバー中も原点に引っ張られて散りが控えめ |
| **return spring** `dx * 0.1` | 278-279 | 0.1 | 0.05 - 0.2 | 高い = 戻りが速い |
| **return damping** `*= 0.8` | 280-281 | 0.8 | 0.7 - 0.9 | 低い = キレのある戻り / 高い = ヌルっと戻る |

```ts
// physics — nearMouse ブロック内
p.vx += (p.ox - p.x) * 0.005;   // origin spring（←この係数）
p.vx += (Math.random() - 0.5) * 0.5;  // noise（←この振幅）
p.vx *= 0.88;                   // damping（←この係数）
```

### 2-D. リングの厚み

| 変数 | 行の目安 | 現在値 | 推奨 | 効果 |
|---|---|---|---|---|
| `spread` 初期化 | 201 | `0.7 + Math.random() * 0.6` (= 0.7-1.3) | 下限 0.5-0.8 / 幅 0.4-1.0 | 反発力に掛かる乗数。幅が広い = リングが太い |

```ts
// initParticles 内
spread: 0.7 + Math.random() * 0.6,  // ← ここを変える
// 例: 0.5 + Math.random() * 1.0 → 範囲 [0.5, 1.5] でさらに太く
```

厚みの追加手段（上級）:
- noise 振幅（L264-265）を上げる → フレーム揺らぎで帯が広がる
- origin spring（L260-261）を弱くする → 粒子が散ったままの距離が広がる

### 2-E. クロスフェード速度（文字 ⇄ 粒子）

| 変数 / 式 | 行の目安 | 現在値 | 推奨 | 効果 |
|---|---|---|---|---|
| `avgCharDisp / 4` の **除数** | 346 | 4 | 2 - 8 | 小さい = scatter が早く 1 に達する（文字が早く消える） |
| **lerp 増加方向** | 347 | 0.5 | 0.2 - 0.8 | 高い = 文字→粒子が速い（残像が減る） |
| **lerp 減少方向** | 347 | 0.12 | 0.05 - 0.25 | 高い = 粒子→文字が速い（低いほどチカチカしにくい） |

```ts
// render セクション
const rawScatter = Math.min(1, avgCharDisp / 4);  // ← 除数
const lerpFactor = rawScatter > cd.smoothScatter ? 0.5 : 0.12;
//                                                 ↑増加  ↑減少
cd.smoothScatter += (rawScatter - cd.smoothScatter) * lerpFactor;
```

**文字の残像が出る → 増加方向の lerp を上げる（0.5→0.7 等）または除数を小さくする（4→3）**
**チカチカする → 減少方向の lerp を下げる（0.12→0.08 等）**

### 2-F. グレー比率・色の切替タイミング

| 変数 | 行の目安 | 現在値 | 推奨 | 効果 |
|---|---|---|---|---|
| `DARK_RATIO` | 63 | 0.9 | 0.8 - 0.98 | 高い = グレー粒子が少ない |
| `GRAY_COLOR` | 62 | `#9CA3AF` | 任意 | グレーの実際の色味 |
| **ブレンド開始 scatter** `/ 0.6` の除数 | 380 | 0.6 | 0.3 - 0.8 | 小さい = より早くから文字色に寄り始める |

```ts
// render セクション — グレー粒子のブレンド
const bt = Math.max(0, Math.min(1, 1 - scatter / 0.6));  // ← 0.6 が閾値
// scatter >= 0.6 → bt=0 → 純グレー
// scatter = 0    → bt=1 → 完全に文字色
```

### 2-G. Canvas 余白

| 変数 | 行の目安 | 現在値 | 推奨 | 効果 |
|---|---|---|---|---|
| `paddingX` | 130 | `fontSize * 3` (=144px) | fontSize * 2 - 4 | 左右の余白 |
| `paddingY` | 131 | `fontSize * 3` (=144px) | fontSize * 2 - 4 | 上下の余白 |

```ts
// initParticles 内
const paddingX = Math.ceil(fontSize * 3);
const paddingY = Math.ceil(fontSize * 3);
```

### 2-H. バウンス（戻り時の Y 揺れ）

| 変数 | 行の目安 | 現在値 | 推奨 | 効果 |
|---|---|---|---|---|
| bounceT 減少速度 | 322 | `- 0.04` | 0.02 - 0.08 | 小さい = ゆっくりバウンド |
| Y-offset 振幅 | 357 | `-3` | -1 - -6 | 大きい = 跳ね上がりが大きい |

```ts
cd.bounceT = Math.max(0, cd.bounceT - 0.04);  // 速度
const bounceY = cd.bounceT > 0 ? -3 * Math.sin(cd.bounceT * Math.PI) : 0;  // 振幅
```

---

## 3. 症状別レシピ

### 粒子が Canvas の端で切れる
```ts
// initParticles (L130-131) — 余白を増やす
const paddingX = Math.ceil(fontSize * 4);  // 3→4
const paddingY = Math.ceil(fontSize * 4);
```

### 動きが遅い（もっさり）
```ts
// physics — nearMouse
repulsionStrength: 30,           // props (22→30)
p.vx *= 0.85;                   // damping を下げる (0.88→0.85)
// physics — return
p.vx += dx * 0.15;              // spring 強め (0.1→0.15)
```

### 動きが速すぎる／暴れる
```ts
repulsionStrength: 14,           // props (22→14)
p.vx *= 0.92;                   // damping を上げる (0.88→0.92)
p.vx += (Math.random() - 0.5) * 0.2;  // noise を下げる (0.5→0.2)
```

### リングが細すぎる（線に見える）
```ts
// initParticles — spread の幅を広げる
spread: 0.5 + Math.random() * 1.0,  // [0.5, 1.5]（現状 [0.7, 1.3]）
// physics — noise を少し上げる
p.vx += (Math.random() - 0.5) * 0.8;  // 0.5→0.8
```

### リングが太すぎる（ぼやける）
```ts
spread: 0.85 + Math.random() * 0.3,  // [0.85, 1.15] に狭める
p.vx += (Math.random() - 0.5) * 0.3;  // noise を下げる
```

### 文字→粒子の切替で残像が見える
```ts
// render — 増加 lerp を上げる
const lerpFactor = rawScatter > cd.smoothScatter ? 0.7 : 0.12;
//                                                 ↑ 0.5→0.7
// または rawScatter の除数を下げる
const rawScatter = Math.min(1, avgCharDisp / 3);  // 4→3
```

### 粒子が少なすぎる
```ts
// page.tsx — density を下げる
<ParticleText density={1.2} ... />  // 1.6→1.2
```
> 重い場合は particleSize を上げて密度はそのままにする手もある

### グレーが目立ちすぎる
```ts
const DARK_RATIO = 0.95;  // L63: 0.9→0.95
```

---

## 4. チカチカ対策（最重要）

「粒子が文字に戻るときにチカチカする」問題の原因と対処を
原因→メカニズム→対処の順で列挙する。

### 4-1. 粒子色の毎フレーム再抽選

**原因**: `p.dark` を毎フレーム `Math.random()` で再計算すると、
1 フレームごとに各粒子の色が変わり高速点滅する。

**現状の対処（済）**: `dark` は `initParticles` の生成時に **一度だけ** 決定。
animate 内では `p.dark` を再代入していない。

**確認方法**: animate 内で `p.dark =` や `Math.random()` で dark を
上書きしている箇所がないことを grep で確認。

```
# リポジトリルートで
grep -n "p\.dark" apps/web/src/components/particle-text.tsx
```
→ initParticles 内の初期化行と、render 内の参照行だけなら OK。

### 4-2. scatter 値の急変（step 関数的な切替）

**原因**: 複数粒子が同一フレームで origin にスナップ
→ avgCharDisp がガクッと減る → rawScatter が急に下がる
→ α が急変 → 視覚的にポップする

**現状の対処（済）**: `smoothScatter` による時間平滑化。

```ts
cd.smoothScatter += (rawScatter - cd.smoothScatter) * lerpFactor;
```

**さらにチカチカする場合の追加対処**:
- **減少方向の lerpFactor を下げる**: `0.12` → `0.06` - `0.08`
  - 粒子→文字の遷移がさらに緩やかになる
  - 副作用: 文字が完全に表示されるまで時間がかかる
- **smoothstep を追加適用**:
  ```ts
  const scatter = cd.smoothScatter;
  // ↓ に変更
  const s = cd.smoothScatter;
  const scatter = s * s * (3 - 2 * s);  // smoothstep
  ```
  0 付近と 1 付近の変化が緩やかになる。

### 4-3. globalAlpha の急な 0/1 切替

**原因**: crisp text の alpha が `1 - scatter`。scatter が 0.02→0 で
text alpha が 0.98→1.0 に飛ぶ。粒子側の alpha も同時に 0.02→0 で消える。
この瞬間に描画モードが切り替わり、フレーム間の見た目が変わる。

**現状の対処（済）**:
- `smoothScatter` が 0.005 以下になるまでは粒子描画を続ける
- 粒子レイヤーは settled なもの (pos===origin) をスキップするので
  settled 粒子が「一瞬テクスチャとして見えてポップ」することはない

**さらにチカチカする場合の追加対処**:
- **text alpha にイージングを掛ける**:
  ```ts
  // 現在
  ctx.globalAlpha = 1 - scatter;
  // 変更例 — 二次曲線で text がより早く不透明に
  ctx.globalAlpha = 1 - scatter * scatter;
  ```
  text が早めに濃くなり、粒子消失と text 出現のタイミングが滑らかに重なる。

### 4-4. 粒子→文字の描画順／ブレンドのフレーム間不整合

**原因**: 本コードは毎フレーム同一の順序で描画している。
1. clearRect
2. for each char: crisp text (alpha = 1-scatter)
3. for each char: dark particles (alpha = scatter)
4. for each char: gray particles (alpha = scatter)

この順序は固定で問題なし。ただし **条件分岐で一部だけスキップ** すると
フレーム間でレイヤー構成が変わりポップする。

**現状の対処（済）**: `scatter > 0.005` で判定しており、
0.005→0 の瞬間に粒子レイヤーが消えても視覚的にほぼ不可視。

**もし問題になる場合**:
- しきい値を `0.002` にさらに下げる
- または条件を外して常に描画し、alpha に任せる（パフォーマンス微減）

### 4-5. 収束判定（settled）での突然の描画モード切替

**原因**: animate 末尾で `!anyMoving` のとき `drawSettled(ctx)` が呼ばれ、
フレーム N は「粒子+text 混合描画」→ フレーム N+1 は「text のみ」に突然切り替わる。

**現状の対処**: smoothScatter が 0.005 以下になるまで `anyMoving = true` が
維持されるので、drawSettled が呼ばれる時点では scatter ≈ 0 で
混合描画と drawSettled の見た目はほぼ同一。

**もし問題になる場合（ヒステリシス導入）**:
```ts
// 現在
if (scatter > 0.005 || cd.bounceT > 0) {
  anyMoving = true;
}
// 変更例 — 閾値を別にする
const keepThreshold = anyMoving ? 0.002 : 0.01;
if (scatter > keepThreshold || cd.bounceT > 0) {
  anyMoving = true;
}
```
一度アニメ中に入ったら、より低い閾値まで描画を続ける。
戻りの「最後の一瞬」のポップを吸収できる。

### 4-6. グレー→主色の色切替が急すぎる

**原因**: グレー粒子の fillStyle が scatter の値で RGB 補間される。
scatter が急変すると色もジャンプする。

**現状の対処（済）**: scatter 自体が smoothScatter で平滑化されているため
色変化も滑らか。

**さらに調整する場合**:
- ブレンド開始点を早める: `1 - scatter / 0.6` → `1 - scatter / 0.8`
  → scatter=0.8 からブレンド開始（より早く文字色に寄る）
- ブレンド曲線を緩やかに:
  ```ts
  const bt = Math.max(0, Math.min(1, 1 - scatter / 0.6));
  // ↓
  const rawBt = Math.max(0, Math.min(1, 1 - scatter / 0.6));
  const bt = rawBt * rawBt;  // 二次曲線で緩やかに
  ```

### チカチカ対策チェックリスト

調整後に以下を順に確認する:

- [ ] `p.dark` が animate 内で再代入されていない
- [ ] `smoothScatter` の減少 lerp が 0.15 以下
- [ ] `scatter > 0.005` の粒子描画閾値が十分に低い
- [ ] `drawSettled` が呼ばれる瞬間の scatter が 0.005 以下
- [ ] text alpha (`1 - scatter`) に急なジャンプがない
- [ ] グレー→主色ブレンドの `bt` が scatter に連動して滑らか
- [ ] bounceT が 0 になるタイミングで描画がポップしない

---

## 5. 推奨デバッグ方法

### scatter 値をリアルタイム表示

render ループの for-each char 内に一時的に追加:

```ts
// render セクション — charDisp 計算の直後に追加
if (cd.char === 'N') {  // 先頭文字で代表
  console.log(
    `scatter: raw=${rawScatter.toFixed(3)} smooth=${scatter.toFixed(3)} ` +
    `lerp=${lerpFactor} bounce=${cd.bounceT.toFixed(2)}`
  );
}
```

### 粒子数の確認

initParticles 末尾に追加:

```ts
const total = chars.reduce((sum, c) => sum + c.particles.length, 0);
console.log(`Total particles: ${total}`);
```

### RAF の停止/再開を確認

animate 末尾の分岐に追加:

```ts
if (anyMoving) {
  animFrameRef.current = requestAnimationFrame(animate);
} else {
  console.log('Animation loop stopped');
  drawSettled(ctx);
}
```

### 描画モード切替の瞬間を捕捉

```ts
// render 末尾の anyMoving 判定の前に
const scatterValues = chars.map(c => c.smoothScatter.toFixed(4));
if (chars.some(c => c.smoothScatter > 0 && c.smoothScatter < 0.02)) {
  console.log('Near-zero scatter:', scatterValues.join(', '));
}
```

> デバッグログは **必ず本番前に削除** すること。
> console.log を animate 内に入れるとフレームごとに出力されて重い。
> 必要な文字だけに限定する。

---

## 6. 調整の進め方（推奨手順）

### Step 1: チカチカ解消（最優先）

1. `pnpm --filter web dev` で開発サーバ起動
2. hover → leave を繰り返し、粒子→文字の遷移を観察
3. チカチカがある場合:
   - まず **減少 lerp** を下げる（`0.12` → `0.08`）
   - 次に text alpha を `1 - scatter * scatter` に変更
   - それでも残るなら smoothstep を追加
4. チカチカが消えたら次へ

### Step 2: 速度・ダイナミクス

1. `repulsionStrength` で散る速度を調整
2. damping で「滑り感」を調整
3. return spring + return damping で戻りの体感を調整

### Step 3: 粒子数とサイズ

1. `density` を変えて粒子数を調整（console で total 確認）
2. `particleSize` を変えて存在感を調整
3. パフォーマンス（Chrome DevTools の FPS）を確認

### Step 4: リング形状

1. `spread` の範囲を調整
2. noise 振幅で微調整
3. origin spring で散り方の「形」を調整

### Step 5: 色と比率

1. `DARK_RATIO` でグレー粒子の割合を調整
2. ブレンド閾値（`/ 0.6`）で色遷移のタイミング
3. `GRAY_COLOR` で実際のグレー色味

### Step 6: Canvas サイズと余白

1. padding を最終調整（散りが端で切れないか確認）
2. 余白が大きすぎて hover 領域が不自然でないか確認

---

## 7. プリセット

以下はすべて **page.tsx の props** と **particle-text.tsx 内の定数/式** の
組み合わせ。まるごとコピペして試せる。

### A. 控えめ（subtile）

page.tsx:
```tsx
<ParticleText
  text="Naruki Sakai Portfolio"
  fontSize={48}
  density={2.0}
  particleSize={2.0}
  repulsionRadius={80}
  repulsionStrength={14}
/>
```

particle-text.tsx:
```
DARK_RATIO = 0.95
spread: 0.85 + Math.random() * 0.3          // [0.85, 1.15]
hover damping: 0.91
hover noise: 0.3
origin spring: 0.008
return spring: 0.1 / return damping: 0.82
lerp 増加: 0.4 / 減少: 0.10
rawScatter 除数: 4
ブレンド閾値: / 0.5
paddingX/Y: fontSize * 2.5
bounceY 振幅: -2
```

特徴: 粒子少なめ・小さめ。控えめに散り、すぐ戻る。ポートフォリオとして上品。

### B. 標準（balanced）— 現在の設定

page.tsx:
```tsx
<ParticleText
  text="Naruki Sakai Portfolio"
  fontSize={48}
  density={1.6}
  particleSize={2.5}
  repulsionRadius={100}
  repulsionStrength={22}
/>
```

particle-text.tsx:
```
DARK_RATIO = 0.9
spread: 0.7 + Math.random() * 0.6           // [0.7, 1.3]
hover damping: 0.88
hover noise: 0.5
origin spring: 0.005
return spring: 0.1 / return damping: 0.8
lerp 増加: 0.5 / 減少: 0.12
rawScatter 除数: 4
ブレンド閾値: / 0.6
paddingX/Y: fontSize * 3
bounceY 振幅: -3
```

### C. 派手め（dynamic）

page.tsx:
```tsx
<ParticleText
  text="Naruki Sakai Portfolio"
  fontSize={48}
  density={1.2}
  particleSize={3.0}
  repulsionRadius={130}
  repulsionStrength={32}
/>
```

particle-text.tsx:
```
DARK_RATIO = 0.85
spread: 0.5 + Math.random() * 1.0           // [0.5, 1.5]
hover damping: 0.85
hover noise: 0.8
origin spring: 0.003
return spring: 0.12 / return damping: 0.78
lerp 増加: 0.6 / 減少: 0.10
rawScatter 除数: 3
ブレンド閾値: / 0.7
paddingX/Y: fontSize * 4
bounceY 振幅: -5
```

特徴: 粒子多め・大きめ。広範囲に散り、ダイナミックに戻る。
存在感は強いがチカチカしやすいので、
**必ず Step 1（チカチカ解消）を先に確認** すること。
