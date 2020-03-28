## static
```js
class ReactToReactNative {
  static create(...args) {
    return new ReactToReactNative().init(...args).start()
  }
}
```

## exports
```js
exports.omit = (...args) => {}

exports.omitWithDefValue = (...args) => {
  const value = exports.omit(...args)
  return value || []
}
```