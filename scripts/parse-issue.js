const YAML = require('yaml');

const parseIssue = (item, comments = []) => {
    const content = item.body;
    const index1 = content.indexOf('```');
    const index2 = content.substr(index1 + 3).indexOf('```') + index1 + 3;
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
        comments: comments.map(c => ({
            name: c.user.login,
            avatar: c.user.avatar_url,
            link: c.user.html_url,
            createdAt: c.created_at,
            body: c.body,
        })),
    };
}

module.exports.parseIssue = parseIssue;

if (typeof require !== 'undefined' && require.main === module) {

}