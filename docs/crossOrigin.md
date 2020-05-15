## 跨域

- Axios配置
```javascript
const ins = axios.create({
  baseURL: 'https://tzuv.58.com',
  withCredentials: true
})
```

- Charles配置

  *map remote*

    Protocol: `https`
    Host: `tzuv.58.com`
    Port: `443`
    Path: `/*`

    Protocol: `http`
    Host: `localhost`
    Port: `8001`
    Path: `/`

- Express配置
```javascript
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header("Access-Control-Allow-Credentials", true) // 前端配置withCredentials: true时, 后端也必须配置
  res.header('Access-Control-Allow-Headers', 'content-type,Content-Length, Authorization,Origin,Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT')
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'])
  next()
})
```