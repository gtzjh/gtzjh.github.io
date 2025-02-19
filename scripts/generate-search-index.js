const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 配置参数
const SITE_ROOT = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(SITE_ROOT, 'search.json');
const IGNORE_PATHS = ['/students/', '/projects/', '/news/']; // 需要忽略的路径

// 获取所有HTML文件
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getHtmlFiles(filePath, fileList);
        } else if (path.extname(file) === '.html') {
            // 检查是否需要忽略
            const relativePath = path.relative(SITE_ROOT, filePath);
            if (!IGNORE_PATHS.some(ignore => relativePath.includes(ignore))) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

// 提取页面内容
function extractContent(filePath) {
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);
    
    // 移除所有导航相关的内容
    $('#navbar-placeholder').remove();
    $('.navbar').remove();
    $('.navbar-nav').remove();
    $('.dropdown-menu').remove();
    $('.nav-item').remove();
    $('.nav-link').remove();
    $('script').remove();
    $('style').remove();
    
    // 增强内容处理
    const content = $('body').text()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\u4e00-\u9fa5]/g, ' ') // 保留中英文和数字
        .trim();
    
    // 修改这里：确保 url 始终是相对于根目录的路径
    let url = path.relative(SITE_ROOT, filePath)
        .replace(/\\/g, '/');  // 统一使用正斜杠
    
    return {
        title: $('title').text(),
        url: url,
        content: content
    };
}

// 生成索引
function generateIndex() {
    const htmlFiles = getHtmlFiles(SITE_ROOT);
    const indexData = htmlFiles.map(extractContent);
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(indexData));
    console.log(`Generated search index with ${indexData.length} pages`);
}

generateIndex(); 