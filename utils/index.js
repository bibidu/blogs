const fs = require('fs').promises
const marked = require('marked')

exports.getMdAndResolve = async function(mdpath) {
  try {
    const content = await fs.readFile(mdpath, 'utf8')
    const markedHtml = marked(content)

    return markedHtml
  } catch (error) {
    console.log(error);
    return ''
  }
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
