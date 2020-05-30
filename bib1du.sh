#! /usr/bin/env
cd /usr/application/github/blogs/
npm i
pm2 start index.js --name blogs
