# vue-chrome-extension

## 模块安装
```
npm install
```

### 运行调试
```
npm run serve
```

### 打包编译
```
npm run build
```

### 打包编译crx文件
```
npm run build:crx
```

### 调试插件
- 使用`npm run serve`运行项目
- 打开谷歌浏览器拓展程序页面
- 打开开发者模式，选择`加载已解压的扩展程序`
- 导入项目中的`dist`文件夹即可到目标页查看插件状态

### 发布
```
# 打包zip:
npm run build:zip
# 访问上传： https://chrome.google.com/webstore/devconsole/ea79ae7b-aa25-4185-92f4-8418c3113612/fjjkihnjlinkjpfeooipegebcakeocef/edit/package
# Edge: https://partner.microsoft.com/en-us/dashboard/microsoftedge/cb67edc7-1dfc-46fd-be12-3866913f24f0/packages/dashboard
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### 参考文档

- http://blog.haoji.me/chrome-plugin-develop.html
- https://juejin.cn/post/6845166890701029384
