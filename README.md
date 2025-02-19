# 使用注意事项

本项目使用静态部署方式。

搜索功能实现依赖于 `search.json` 文件，该文件由 `generate-search-index.js` 脚本生成。

因此，每次更新内容以后务必更新索引文件。

更新索引文件的命令如下：

```bash
node scripts/generate-search-index.js
```

更新索引文件后，务必确保 `search.json` 文件存在且内容正确。

本地预览，请：

1. 安装依赖：

```bash
npm install
```

2. 启动本地预览。

```bash
npx live-server --port=3000
```


