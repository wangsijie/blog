const axios = require('axios');
const { getPostComments } = require('./get-post-comments');
const { parseIssue } = require('./parse-issue');
const TOKEN = process.env.GITHUB_TOKEN;

async function getPosts() {
    if (!TOKEN) {
        throw new Error('GITHUB_TOKEN is missing');
    }
    console.log(`use token: ${TOKEN.substr(0, 6)}********`);
    const items = [];
    let page = 1;
    while(true) {
        console.log('fetch posts, page: ' + page);
        const res = await axios.get(
            'https://api.github.com/repos/wangsijie/blog/issues',
            {
                headers: { authorization: `bearer ${TOKEN}` },
                params: {
                    state: 'closed',
                    page,
                }
            }
        );
        items.push(...res.data);
        const pageSearch = /page=(\d*)>;\srel="next"/.exec(res.headers.link);
        if (!pageSearch) {
            break;
        }
        page = Number(pageSearch[1]);
    }
    console.log('fetched posts count:' + items.length);
    const posts = [];
    for (const item of items) {
        let comments = [];
        if (item.comments) {
            console.log('fetch comments for:' + item.number);
            comments = await getPostComments(item.number);
        }
        posts.push(parseIssue(item, comments));
    }
    return posts;
}

module.exports = getPosts;

if (typeof require !== 'undefined' && require.main === module) {
    getPosts().then(posts => require('fs').writeFileSync('data.json', JSON.stringify(posts, null, 2)))
}