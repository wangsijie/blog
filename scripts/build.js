const fs = require('fs');
const moment = require('moment');
const showdown  = require('showdown');
const showdownHighlight = require("showdown-highlight");
const getPosts = require('./get-posts');

const converter = new showdown.Converter({ tables: true, extensions: [showdownHighlight] });

async function app() {
    fs.mkdirSync('build/posts', { recursive: true });
    const posts = await getPosts();
    // const posts = JSON.parse(fs.readFileSync('data.json', { encoding: 'utf-8' }));

    const header = fs.readFileSync('layout/header.html', { encoding: 'utf-8' });
    const footer = fs.readFileSync('layout/footer.html', { encoding: 'utf-8' });

    // index
    const postsContent = posts.filter(post => !post.labels.find(l => l.name === 'page')).reduce((prev, post) => {
        return prev + `<li class="post"><a href="/posts/${post.metaData.url || post.number}">${post.title}</a></li>`
    }, '');
    const indexPage = `${header.replace('{{title}}', '')}<ul>${postsContent}</ul>${footer}`;
    fs.writeFileSync('build/index.html', indexPage);

    posts.forEach(post => {
        const isPage = post.labels.find(l => l.name === 'page');
        const postPath = post.metaData.url || post.number;
        const postDate = moment(post.metaData.date || post.createdAt).format('YYYY/MM/DD');
        const categoryContent = post.metaData.categories ? `<span class="category">
                分类 ${post.metaData.categories}
            </span>` : '';
        const tags = Array.isArray(post.metaData.tags) ? post.metaData.tags : (post.metaData.tags ? [post.metaData.tags] : null);
        const tagsContent = tags && tags.length ? `<span class="tag">
                标签 ${tags.map(tag => `#${tag}`).join(' ')}
            </span>` : '';
        const content = `<div>
            <article id="post-${post.number}" itemscope itemprop="blogPost">
                <h1 class="article-title">
                    ${post.title}
                </h1>
                ${isPage ? '' : `<div class="article-meta">
                    <span class="date">发表于 ${postDate}</span>
                    ${categoryContent}
                    ${tagsContent}
                </div>`}
                <div class="article-entry markdown-body">
                    ${converter.makeHtml(post.markdownContent)}
                </div>
                ${isPage ? '' : `<div class="post-copyright">
                    <p>文章原始链接：<a href="https://sijie.wang/posts/${postPath}">https://sijie.wang/posts/${postPath}</a></p>
                    <p>
                        <img class="warning" src="/img/warning.png" />
                        本站文章除特别声明外，均采用
                        <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>
                        许可协议，转载请保留原始链接</p>
                </div>`}
                <div class="comment">
                    <a href="https://github.com/wangsijie/blog/issues/${post.number}">发表评论</a>
                </div>
            </article>
        </div>`;
        if (isPage) {
            fs.mkdirSync(`build/${postPath}`, { recursive: true });
            fs.writeFileSync(
                `build/${postPath}/index.html`,
                `${header.replace('{{title}}', `${post.title} - `)}<div class="post">${content}</div>${footer}`,
            );
        } else {
            fs.mkdirSync(`build/posts/${postPath}`, { recursive: true });
            fs.writeFileSync(
                `build/posts/${postPath}/index.html`,
                `${header.replace('{{title}}', `${post.title} - `)}<div class="post">${content}</div>${footer}`,
            );
        }
    });
}

app();
