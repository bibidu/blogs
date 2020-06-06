const fs = require('fs').promises
const marked = require('marked')

exports.getMdAndResolve = async function(mdpath) {
  try {
    // 支持标html标签
    const codes = []
    const mark = '@@@!!!!!@@@'
    const content = (await fs.readFile(mdpath, 'utf8'))
      .replace(/\`\`\`code([\w\W]+)\`\`\`/g, (_, b) => {
        codes.push(b)
        return mark + (codes.length - 1)
      })
    const markedHtml = marked(content)
      .replace(new RegExp(`${mark}(\\d)`, 'g'), (_, index) => {
        return codes[index]
      })

    return markedHtml
  } catch (error) {
    console.log(error);
    return ''
  }
}

exports.getMd = function(mdpath) {
  return fs.readFile(mdpath, 'utf8')
}

exports.extractRoutes = function(content) {
  const routes = []
  content.replace(/<a\s+href="([\/\w]+)">(.+?)<\/a/mg, (_, url, name) => {
    routes.push({ url, name })
  })

  return routes
}

exports.isFile = async function(mayExistFilepath) {
  try {
    await fs.stat(mayExistFilepath)
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
