const axios = require('axios');
const TOKEN = process.env.GITHUB_TOKEN;

async function getPostComments(number) {
    const res = await axios.get(
        `https://api.github.com/repos/wangsijie/blog/issues/${number}/comments`,
        {
            headers: { authorization: `bearer ${TOKEN}` },
        }
    );
    comments = res.data;
    return comments;
}

module.exports.getPostComments = getPostComments;

if (typeof require !== 'undefined' && require.main === module) {
    getPostComments(55).then(console.log);
}
