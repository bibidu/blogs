#！ /bin/bash

# 安装依赖
echo "准备安装依赖"
npm i
echo "安装依赖完成"

# 停止已启动服务
echo "准备停止已启动服务"
pm2 stop blogs
echo "停止已启动服务完成"

# 开启服务
echo "准备开启服务"
pm2 start index.js --name blogs
echo "开启服务完成"
