# zero-to-pinia

## 在這個階段

### 確保必要的開發環境設定

- ```zsh
  pnpm init
  git init
  ```
- 複製必要檔案
  - `.npmrc`
  - `.gitignore`
  - `.prettierrc.js`
  - `.prettierignore`
- 建立 `pnpm-workspace.yaml`
  ```yml
  packages:
    - 'packages/*'
  ```
- 安裝必要依賴包
  ```zsh
  pnpm add -w -D @types/node typescript prettier vue
  ```
- 產出 `tsconfig.json` ，調整部分內容
  ```zsh
  npx tsc --init
  ```
- 建立一個名為 `pinia` 的 package ，生成 `package.json`
- 在 `pinia` 下安裝必要依賴包
  - `@vue/devtools-api`
  - `vue-demi`
