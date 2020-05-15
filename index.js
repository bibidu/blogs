const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()
const {
  getMdAndResolve,
  extractRoutes,
  isFile,
} = require('./utils')

app.use(express.static(path.join(__dirname, './static')))

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
  app.get('*', async (req, res) => {

    if (req.url === '/favicon.ico') {
      res.setHeader("Content-Type", 'image/x-icon')
      return res.end(fs.readFileSync('./favicon.ico'))
    }
    const matched = getMatchedRoute(req.url)
    
  
    if (matched) {
      const { url, name } = matched
      const mayExistFilepath = `${baseDir}${url}.md`
      if (await isFile(mayExistFilepath)) {
        const content = await getMdAndResolve(mayExistFilepath)
        console.log(content)
        return res.end(
          renderHtml({
            title: name,
            content: content + `
            <script>
              const el = document.querySelector('a[href="${url}"]')
              el.classList.add('checked-item')
            </script>
            </body>`,
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
  })
  
  app.listen(8080, () => {
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
  const sidebarHtml = routes.reduce(
    (p, {name, url}) => `${p}<a href="${url}" class="sidebar-item">${name}</a>`,
    ''
  )

  return baseHtml
    .replace(/\{title}/g, title)
    .replace(/\{style}/g, css)
    .replace(/\{content}/g, content)
    .replace(/\{sidebar}/g, sidebarHtml)
}
