# 贡献指南

欢迎参与 Search Tool 的开发！请遵循以下流程：

## 开发流程

1. Fork 本仓库并 clone 到本地
2. 新建分支进行开发
3. 提交前请确保代码通过 lint 检查
4. 提交 Pull Request，描述你的更改内容

## 代码规范

- 遵循 ESLint 规则
- 组件命名、变量命名需语义化
- 注释清晰，逻辑复杂处需详细说明

## 本地调试

```bash
npm install
npm run serve
```
在 Chrome 扩展页面加载 `dist` 文件夹。

## 打包编译
```bash
npm run build
```

## 打包编译crx文件
```bash
npm run build:crx
```

## 反馈与建议

如有问题或建议，请提交 Issue。

---

## 进阶贡献说明

### 1. 目录结构说明

- `src/options/components/App.vue`：Option 页面主组件
- `src/chrome/background/index.js`：后台脚本，包含 LLM 调用等核心逻辑
- `src/popup/components/App.vue`：弹窗页面主组件
- `src/_locales/`：多语言配置
- `src/assets/`：静态资源

### 2. LLM 相关开发建议

- LLM 配置建议在 Option 页面调试，支持多模型 JSON 配置，详见 README。
- 如需扩展模型字段或支持更多服务，建议先在 `background/index.js` 处理解析和请求逻辑。
- 支持自定义 prompt 菜单，可在 Option 页面直接编辑。

### 3. UI/UX 贡献建议

- Option 页面、弹窗页面均支持响应式布局，建议适配不同分辨率。
- 可补充截图、文档说明，提升用户体验。

### 4. 测试与兼容性

- 建议在最新版 Chrome 浏览器下测试。
- 如有兼容性问题，请在 PR 或 Issue 中说明。

### 5. 发布

# 打包zip:

```bash
npm run build:zip
# 访问上传： https://chrome.google.com/webstore/devconsole/ea79ae7b-aa25-4185-92f4-8418c3113612/fjjkihnjlinkjpfeooipegebcakeocef/edit/package
# Edge: https://partner.microsoft.com/en-us/dashboard/microsoftedge/cb67edc7-1dfc-46fd-be12-3866913f24f0/packages/dashboard
```

---

感谢你的贡献！
