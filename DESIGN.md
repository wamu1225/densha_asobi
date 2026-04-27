---
version: "alpha"
name: "でんしゃあそび"
description: "電車の中でこどもが楽しめる12種類のゲームサイト。幼稚園〜小学3年生向け。"

colors:
  sky:
    50:  "#f0f9ff"
    100: "#e0f2fe"
    200: "#bae6fd"
    400: "#38bdf8"
    500: "#0ea5e9"
    600: "#0284c7"
  sun:
    300: "#fde68a"
    400: "#fbbf24"
    500: "#f59e0b"
  coral:
    400: "#fb7185"
    500: "#f43f5e"
  leaf:
    400: "#4ade80"
    500: "#22c55e"
  cream:
    50:  "#fafaf9"
    100: "#f5f5f4"
    200: "#e7e5e4"
  ink:
    700: "#374151"
    800: "#1f2937"
    900: "#111827"

  semantic:
    primary:   "{colors.sky.500}"
    primary-light: "{colors.sky.100}"
    surface:   "{colors.cream.50}"
    surface-alt: "{colors.sky.50}"
    text:      "{colors.ink.800}"
    text-muted: "{colors.ink.700}"
    correct:   "{colors.leaf.500}"
    wrong:     "{colors.coral.500}"
    highlight: "{colors.sun.400}"

typography:
  families:
    display: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif"
    body:    "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif"

  scale:
    hero:
      fontFamily: "{typography.families.display}"
      fontSize: "2rem"
      fontWeight: "800"
      lineHeight: "1.2"
      letterSpacing: "-0.01em"
    title:
      fontFamily: "{typography.families.display}"
      fontSize: "1.5rem"
      fontWeight: "700"
      lineHeight: "1.3"
    heading:
      fontFamily: "{typography.families.display}"
      fontSize: "1.25rem"
      fontWeight: "700"
      lineHeight: "1.4"
    body-lg:
      fontFamily: "{typography.families.body}"
      fontSize: "1.125rem"
      fontWeight: "400"
      lineHeight: "1.6"
    body:
      fontFamily: "{typography.families.body}"
      fontSize: "1rem"
      fontWeight: "400"
      lineHeight: "1.6"
    game-number:
      fontFamily: "{typography.families.display}"
      fontSize: "3.5rem"
      fontWeight: "800"
      lineHeight: "1"

layout:
  spacing:
    xs:  "4px"
    sm:  "8px"
    md:  "16px"
    lg:  "24px"
    xl:  "32px"
    2xl: "48px"
  radius:
    sm:   "8px"
    md:   "12px"
    lg:   "16px"
    xl:   "20px"
    2xl:  "24px"
    full: "9999px"
  tap-target: "56px"
  max-width: "448px"

elevation:
  card:
    shadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)"
  button:
    shadow: "0 4px 14px rgba(0,0,0,0.15)"
  header:
    shadow: "0 2px 8px rgba(0,0,0,0.12)"

components:
  game-card:
    height: "100px"
    rounded: "{layout.radius.2xl}"
    shadow: "{elevation.card.shadow}"

  primary-button:
    height: "{layout.tap-target}"
    rounded: "{layout.radius.xl}"
    typography: "{typography.scale.heading}"
    shadow: "{elevation.button.shadow}"
    backgroundColor: "{colors.semantic.primary}"
    textColor: "#ffffff"

  answer-button:
    height: "80px"
    rounded: "{layout.radius.xl}"
    backgroundColor: "#ffffff"
    textColor: "{colors.semantic.text}"
    typography: "{typography.scale.game-number}"

  score-badge:
    rounded: "{layout.radius.full}"
    backgroundColor: "{colors.sun.300}"
    textColor: "{colors.ink.900}"
---

## Overview

**でんしゃあそび** は「電車の中での暇つぶし」をコンセプトにした、幼稚園〜小学3年生向けのゲームサイトです。

### デザインの方向性

- **明るく、楽しく、カラフル** — 子どもがワクワクする鮮やかな配色
- **大きく、押しやすい** — 最小タップターゲット 56px、文字は常に大きめ
- **丸みのある形** — 角丸を多用し、怖くない・やわらかい印象
- **電車のイメージ** — 空の青（スカイブルー）をベースカラーに

---

## Colors

### ベースカラー

スカイブルー（`sky.500: #0ea5e9`）が主役。電車の窓から見える空の色。ヘッダー、プライマリボタンに使用。

### ゲームカードカラー

12種のゲームそれぞれに個別の背景色を割り当て、一目で区別できるようにする。彩度が高く、明度も十分なものを選ぶ（テキストが白でも読めること）。

### フィードバックカラー

- **正解**: `leaf.500 (#22c55e)` — 緑で「OK」
- **不正解**: `coral.500 (#f43f5e)` — 赤で「NG」
- **ハイライト/コンボ**: `sun.400 (#fbbf24)` — 黄色で特別感

---

## Typography

### フォント

**M PLUS Rounded 1c**（Google Fonts）を採用。日本語の丸ゴシック体で、子どもに親しみやすい印象。フォールバックは Hiragino / Meiryo。

### 使い分け

| 用途 | サイズ | ウェイト |
|---|---|---|
| サイトタイトル | 2rem | 800 |
| ゲームタイトル | 1.5rem | 700 |
| ゲーム内見出し | 1.25rem | 700 |
| 本文・説明文 | 1rem〜1.125rem | 400 |
| 計算式・数字 | 3.5rem | 800 |

---

## Layout

### スマートフォン縦持ちファースト

最大幅 `448px`（max-w-lg）で中央寄せ。余白は `16px`（md）を基本に、コンテンツ間は `24px`（lg）。

### タップターゲット

ボタン・カードの最小高さは `56px`。特に答えボタンは `80px` 以上確保し、誤タップを防ぐ。

### グリッド

トップページのゲームカード: `3列 × 4行`。各カードは正方形 `aspect-square`。

---

## Elevation & Depth

3段階のシャドウで奥行きを表現:

1. **カード**: `0 4px 6px rgba(0,0,0,0.1)` — 背景から浮いて見える
2. **ボタン**: `0 4px 14px rgba(0,0,0,0.15)` — より押しやすそうに
3. **ヘッダー**: `0 2px 8px rgba(0,0,0,0.12)` — ページに固定された感

---

## Shapes

全体的に丸みを強調:

- ゲームカード、回答ボタン: `border-radius: 20px`（xl）
- 通知バナー、バッジ: `border-radius: 16px`（lg）
- 小さいボタン: `border-radius: 12px`（md）
- 丸バッジ（コンボ数など）: `border-radius: 9999px`（full）

---

## Components

### TopPageCard（ゲーム選択カード）

- 背景: ゲームごとの固有カラー（彩度高め）
- テキスト: 白、太字、中央揃え
- 絵文字アイコン: 32px
- ゲーム名: 12px bold、2行まで
- 影: `elevation.card`
- タップ時: `scale(0.93)` でフィードバック

### AnswerButton（回答ボタン）

- 背景: 白
- テキスト: ゲームカラー or インク
- 高さ: 80px
- 数字: 3.5rem bold
- 影: あり
- タップ時: `scale(0.95)`

### GameHeader

- 背景: ゲームテーマカラー
- テキスト: 白
- 高さ: 56px
- 戻るボタン: 円形、半透明白

### FeedbackFlash

- 正解: 背景が `green-50` にフラッシュ + ✅
- 不正解: 背景が `red-50` にフラッシュ + ❌
- 持続: 300ms

---

## Do's and Don'ts

### Do's ✅

- テキストは最小 16px（小さい子でも読める）
- ボタンには必ず押したフィードバック（scale / 色変化）
- ゲーム中は画面がシンプルに（情報を絞る）
- 正解・不正解は色だけでなく形（✅❌）でも示す（色盲配慮）

### Don'ts ❌

- 複数の操作が同時に要求される画面にしない
- 小さいアイコンのみのボタン（テキストを必ず添える）
- 濃い色の上に濃い文字（コントラスト比 4.5:1 以上を維持）
- 音声なしでは意味が伝わらない演出（電車内は音が出せない）
