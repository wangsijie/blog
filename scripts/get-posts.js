const YAML = require('yaml');
const axios = require('axios');
const TOKEN = process.env.GITHUB_TOKEN;

async function getPosts() {
    const items = [];
    let page = 1;
    while(true) {
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
    return items.map(item => {
        const content = item.body;
        const index1 = content.indexOf('---');
        const index2 = content.substr(index1 + 3).indexOf('---') + index1 + 3;
        const metaString = content.substr(index1 + 4, index2 - (index1 + 4));
        const metaData = YAML.parse(metaString);
        const markdownContent = content.substr(index2 + 4);
        return {
            number: item.number,
            title: item.title,
            labels: item.labels,
            createdAt: item.created_at,
            rawBody: item.body,
            metaData,
            markdownContent,
        };
    });
}

module.exports = getPosts;
