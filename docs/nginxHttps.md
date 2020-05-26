- 域名解析
添加一条记录
主机记录: `r2rn`
记录类型: `A`
记录值: `39.107.227.103` 

- nginx配置80端口
```
server {
  listen 80;
  server_name r2rn.yushouxiang.com;
  location / {
    rewrite ^(.*) https://r2rn.yushouxiang.com$1 permanent;
  }
}
```

- nginx配置443端口
```
server {
  listen 443 ssl;
  server_name r2rn.yushouxiang.com;
  ssl_certificate /keys_two/https.crt;
  ssl_certificate_key /keys_two/https.key;
  ssl_session_timeout 5m;
  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://localhost:3000;
  }
}
```