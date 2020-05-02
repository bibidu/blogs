const fs = require('fs')
const http = require('http')
const {
  getMdAndResolve,
  extractRoutes,
  isFile,
} = require('./utils')


let routes = [] // 项目路由配置

const baseDir = './docs'

const getSidebar = () => getMdAndResolve(`${baseDir}/_sidebar.md`)

async function setup() {
  const sidebar = await getSidebar()
  routes = extractRoutes(sidebar)

  startServer()
}

setup()

function startServer() {
  http.createServer(async (req, res) => {
    req.url !== '/favicon.ico' && console.log(req.url)
    const matched = getMatchedRoute(req.url)
    
  
    if (matched) {
      const { url, name } = matched
      const mayExistFilepath = `${baseDir}${url}.md`
      if (await isFile(mayExistFilepath)) {

        return res.end(
          renderHtml({
            title: name,
            content: await getMdAndResolve(mayExistFilepath),
          })
        )
      }
    }
  
    res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' })
    res.end(
      renderHtml({
        title: 404,
        content: '404'
      })
    )
  }).listen(8080, () => {
    console.log(`start on 8080`);
  })
}

function getMatchedRoute(url) {
  if (url === '/') return routes[0]
  for (let i = 0; i < routes.length; i++) {
    const item = routes[i]
    if (item.url === url) {
      return item
    }
  }
}

function renderHtml({ title, content, cssType }) {
  const css = cssType ? '' : fs.readFileSync('./main.css', 'utf8')
  const baseHtml = fs.readFileSync('./base.html', 'utf8')
  const sidebarHtml = routes.reduce((p, {name, url}) => `${p}<a href="${url}" class="sidebar-item">${name}</a>`, '')

  return baseHtml
    .replace(/\$title\$/g, title)
    .replace(/\$style\$/g, css)
    .replace(/\$content\$/g, content)
    .replace(/\$sidebar\$/g, sidebarHtml)
}
