const fs = require('fs')
const path = require('path')
const express = require('express')
const md2html = require('@bib1du/markdown2html')
const app = express()
const {
  getMdAndResolve,
  getMd,
  extractRoutes,
  isFile,
} = require('./utils')

app.use(express.static(path.join(__dirname, './static')))

let routes = [] // 项目路由配置

const baseDir = './docs2'
let startTime = new Date().getTime()

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
    // const hasAuth = req.url.includes('from=5213')
    // console.log(req.url)
    // if (hasAuth) {
    //   req.url = req.url.replace(/\?from=5213$/, '')
    // } else {
    //   if (req.url === '/') {
    //     renderNull(res)
    //   }
    // }
    const matched = getMatchedRoute(req.url)
    if (matched) {
      const { url, name } = matched
      const mayExistFilepath = `${baseDir}${url}.md`
      if (await isFile(mayExistFilepath)) {
        const content = await getMd(mayExistFilepath)
        const { html, css } = md2html.parse(content, { splitStyle: true })

        return res.end(
          renderHtml({
            showSidebar: true,
            title: name,
            css,
            content: html + `
            <script>
              const el = document.querySelector('a[href="${url}"]')
              el.classList.add('checked-item')
            </script>
            </body>`,
          })
        )
      }
    }
    
    renderNull(res)
  })
  
  app.listen(8080, () => {
    console.log(`start on 8080`);
  })
}

function renderNull(res) {
  res.writeHead(200, { 'Content-Type': 'text/html;charset=UTF-8' })
  res.end(
    renderHtml({
      title: 404,
      content: '404',
    })
  )
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

function renderHtml({
  showSidebar = false,
  title,
  css = '',
  content,
  cssType,
}) {
  const initCSS = cssType ? '' : fs.readFileSync('./main.css', 'utf8')
  const baseHtml = fs.readFileSync('./base.html', 'utf8')
  const sidebarHtml = routes.reduce(
    (p, {name, url}) => `${p}<a href="${url}" class="sidebar-item">${name}</a>`,
    ''
  )
  return baseHtml
    .replace(/\{title}/g, '')
    .replace(/\{style}/g, initCSS + '\n' + css)
    .replace(/\{content}/g, content)
    .replace(/\{sidebar}/g, showSidebar ? sidebarHtml : `
    <script type="">
      document.querySelector('.sidebar').style.display = 'none'
      const styles = {
        width: '800px',
        minWidth: '70%',
        margin: '20px auto',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
      }
      Object.entries(styles).forEach(([k, v]) => document.querySelector('.app').style[k] = v)
    </script>
    `)
}
