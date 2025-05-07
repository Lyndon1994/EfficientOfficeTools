# Contribution Guide

Welcome to contribute to Search Tool! Please follow the steps below:

## Workflow

1. Fork this repo and clone locally
2. Create a new branch for your work
3. Make sure your code passes lint before commit
4. Submit a Pull Request and describe your changes

## Code Style

- Follow ESLint rules
- Use semantic names for components and variables
- Add clear comments, especially for complex logic

## Local Development

```bash
npm install
npm run serve
```
Load the `dist` folder in Chrome Extensions page.

## Feedback

For issues or suggestions, please submit an Issue.

---

## Advanced Contribution

### 1. Directory Structure

- `src/options/components/App.vue`: Main component for the Option page
- `src/chrome/background/index.js`: Background script, includes LLM logic
- `src/popup/components/App.vue`: Main component for the popup page
- `src/_locales/`: i18n files
- `src/assets/`: static assets

### 2. LLM Development Tips

- It is recommended to debug LLM config in the Option page, supports multi-model JSON config, see README.
- To extend model fields or support more services, handle parsing and request logic in `background/index.js`.
- Custom prompt menus are supported and can be edited directly in the Option page.

### 3. UI/UX Contribution

- Both Option and popup pages are responsive, please adapt to different resolutions.
- Add screenshots or documentation to improve user experience.

### 4. Testing & Compatibility

- Test with the latest Chrome browser.
- If there are compatibility issues, please describe them in PR or Issue.

---

Thank you for your contribution!
