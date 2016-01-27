/* jshint node: true */
const fs = require('fs');

const postFiles = fs.readdirSync(__dirname);

function getPostTitle(post) {
  return post.match(/#\s*(.+)\n/)[1];
}

function getPostBody(post) {
  return post.match(/#(.+)\n([\S\s]*)/m)[2];
}

module.exports = postFiles.filter((filename) => {
  return filename.indexOf('.md') > -1;
}).map((filename) => {
  const post = fs.readFileSync(`${__dirname}/${filename}`, 'utf8');

  return {
    fullText: post,
    body: getPostBody(post),
    title: getPostTitle(post),
    slug: filename.replace('.md', ''),
  };
});
