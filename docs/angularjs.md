## 执行流程
- 声明版本信息
- 绑定JQuery
  - [确定使用JQuery的优先级并绑定](#confirm-jquery-priority)
- [绑定、扩展angular方法](#publish-external-api)
- [添加ng内置模块](#add-ng-module)
- [监听load事件并执行angularInit](#angular-init)

## Q&A
### 内置服务的注册时机？
- 声明ng模块并传入configFn（接收$provide进行内置服务注册）
- 用户modules前添加ng模块
- 页面load时创建注入器并传入modules
- 执行第一个module（即ng）时，发现configFn
```javascript
provideInjectro['$injector'].invoke(configFn)
// => 
$injectorProvider.invoke(configFn)
// =>
return (providerCache = {
    provide,
    service,
    directive,
    /* ... */
})
```

### 为什么providerInjector和protoInstanceInjector结构几乎相同，却不合并
实现方式不同，目的封装更彻底
```javascript
// normal
const obj = {}
function getObjById(id, noPrefix) {
  id = noPrefix ? prefix + id : id
  return obj[id]
}

// angularjs
const obj = {}
function getObjById(id) {
  return obj[id]
}
function getObjByIdWithoutPrefix(id) {
  return getObjById(prefix + id)
}
```

### Provider机制
angularjs的服务是基于Provider实现的。对开发者暴露了一系列基于provide的语法糖。provider作为服务提供者，至少需要提供 `$get` 方法

- provider

  ```javascript
  function provider(name, provider_) {
    if (isFunction(provider_) || isArray(provider_)) {
      // 注入依赖的其他服务
      provider_ = providerInjector.instantiate(provider_);
    }
    if (!provider_.$get) {
      throw $injectorMinErr('...');
    }
    return (providerCache[name + providerSuffix] = provider_);
  }
  ```

- factory
基于provider，默认传入的fn作为方法执行。fn执行结果需要不为undefined

  ```javascript
  function factory(name, factoryFn, enforce) {
    return provider(name, {
      $get: enforce !== false ? enforceReturnValue(name, factoryFn) : factoryFn
    });
  }
  ```

- service
基于factory，传入的fn作为类通过 new 调用。由于返回的是类的示例，所以不需要返回值。
  ```javascript
  function service(name, constructor) {
    return factory(name, ['$injector', function($injector) {
      return $injector.instantiate(constructor);
    }]);
  }
  ```

- value

  ```javascript
  基于factory，传入的是一个值。
  function value(name, val) {
    return factory(name, valueFn(val), false);
  }
  ```

- decorator
  基于provider，用于给已存在的服务进行修改
  ```javascript
  function decorator(serviceName, decorFn) {
    var origProvider = providerInjector.get(serviceName + providerSuffix),
        orig$get = origProvider.$get;

    origProvider.$get = function() {
      // 调用已存在的服务
      var origInstance = instanceInjector.invoke(orig$get, origProvider);
      // 开发者修改的时需要使用 `$delegate` 服务来获取装饰的服务， 所以invoke的第三个参数传{ $delegate: /*原服务返回值*/ }
      return instanceInjector.invoke(decorFn, null, {$delegate: origInstance});
    };
  }
  ```


## 代码实现
#### 确定使用JQuery的优先级(window > jqLite)并绑定 :id=confirm-jquery-priority
```javascript
var ngAttrPrefixes = ['ng-', 'data-ng-', 'ng:', 'x-ng-'];
var jq = function() {
  if (isDefined(jq.name_)) return jq.name_;
  var el;
  var i, ii = ngAttrPrefixes.length, prefix, name;
  for (i = 0; i < ii; ++i) {
    prefix = ngAttrPrefixes[i];
    el = window.document.querySelector('[' + prefix.replace(':', '\\:') + 'jq]');
    if (el) {
      name = el.getAttribute(prefix + 'jq');
      break;
    }
  }

  return (jq.name_ = name);
};

// 获取用户自定义引入的JQuery命名空间
var jqName = jq();

// 确定JQuery使用优先级(window > jqLite)
jQuery = isUndefined(jqName) ? window.jQuery
  : !jqName ? undefined
    : window[jqName]; 
```
?> [jqLite](#jqlite) 是angularjs内置的轻量JQuery

```javascript
if (jQuery && jQuery.fn.on) {
  jqLite = jQuery;
  extend(jQuery.fn, {
    scope: JQLitePrototype.scope,
    isolateScope: JQLitePrototype.isolateScope,
    controller: /** @type {?} */ (JQLitePrototype).controller,
    injector: JQLitePrototype.injector,
    inheritedData: JQLitePrototype.inheritedData
  });
originalCleanData = jQuery.cleanData;
  jQuery.cleanData = function(elems) {
    var events;
    for (var i = 0, elem; (elem = elems[i]) != null; i++) {
      events = jQuery._data(elem, 'events');
      if (events && events.$destroy) {
        jQuery(elem).triggerHandler('$destroy');
      }
    }
    originalCleanData(elems);
  };
} else {
  jqLite = JQLite;
}

angular.element = jqLite;
```


### publishExternalAPI :id=publish-external-api
```javascript
// 声明angular
angular = window.angular || (window.angular = {})
// 绑定方法到angular
extend(angular, {
    'errorHandlingConfig': errorHandlingConfig,
    'bootstrap': bootstrap,
    'element': jqLite,
    'forEach': forEach,
    'injector': createInjector,
    'isDate': isDate,
    '$$stringify': stringify
    // ...
})
// 声明angularModule
function setupModuleLoader(window) {
  // ...
  var angular = ensure(window, 'angular', Object);
  return (angular.module = function() {
    // 用于储存多个模块的信息
    var modules = {}
    var config = invokeLater('$injector', 'invoke', 'push', configBlocks);
    // 模块名 | 依赖项 | 配置函数
    return function module(name, requires, configFn) {
      return (modules[name] = function() {
        var moduleInstantce = {
          requires,
          name,
          provider,
          factory,
          service,
          value,
          constant,
          decorator,
          animation,
          filter,
          controller,
          directive,
          component,
          config,
          // ...
        }
        // ...
        return moduleInstantce
      })
    }
  })
}

angularModule = setupModuleLoader(window)
```
setupModuleLoader执行后保证angular.module的返回值具有moduleInstantce的所有key的方法, 而这些方法大多是被 [invokeLater](#invokeLater)绑定的。
```javascript
// test
const app = angular.module('myApp', [])
app.constant(k, v).controller(k, v).service(k, v)....
```
?> [ensure](#ensure)
```javascript
```

### addNgModule :id=add-ng-module
```javascript
angularModule('ng', ['ngLocale'], 
  ['$provide',
    function ngModule($provide) {
      $provide.provider({
        $$sanitizeUri: $$SanitizeUriProvider
      });
      $provide.provider('$compile', $CompileProvider).
        directive({
            a: htmlAnchorDirective,
            input: inputDirective,
            // ...
        }).
      $provide.provider({
        $timeout: $TimeoutProvider,
        $q: $QProvider,
        $http: $HttpProvider,
        // ...
      });
    }
  ])
```
由 [publishExternalAPI](#publish-external-api)中的`angularModule = setupModuleLoader(window)`可知, angularModule的入参`name, requires, configFn`分别对应`模块名 | 依赖项 | 配置函数`。

首先将ng添加到modules中，并返回moduleInstantce
### jqLite :id=jqlite

### ensure :id=ensure
```javascript
// 实现赋值+取值
function ensure(obj, name, factory) {
  return obj[name] || (obj[name] = factory());
}
```

### invokeLater :id=invokeLater
用于向 `invokeQueue` 中添加需要注册的服务/过滤器/其他。
该方法四个参数的含义：通过insertMethod(push | unshift)将[provider, method, arguments]插入到queue中.(最终会调用providerCache的provider并执行method方法并传入arguments, 执行时机见 [angularInit](#angular-init))
```javascript
function invokeLater(provider, method, insertMethod, queue) {
  // 利用javascript的浅拷贝，保证后续对queue的添加操作等同于对invokeQueue操作
  if (!queue) queue = invokeQueue;
  return function() {
    queue[insertMethod || 'push']([provider, method, arguments]);
    // 返回moduleInstance便于链式操作
    return moduleInstance;
  };
}
```

### angularInit :id=angular-init
```javascript
// 页面加载完毕时调用angularInit
jqLite(function() {
  angularInit(window.document, bootstrap);
});

function angularInit(element, bootstrap) {
  // 查找ng-app入口
  forEach(ngAttrPrefixes, function(prefix) {
    var name = prefix + 'app';
    if (!appElement && element.hasAttribute && element.hasAttribute(name)) {
      appElement = element;
      module = element.getAttribute(name);
    }
  });
  if (appElement) {
    // 执行bootstrap
    bootstrap(appElement, module ? [module] : [], config);
  }
}

function bootstrap() {

  if (window) {
    return doBootstrap()
  }

  function doBootstrap() {
    // 获取根元素
    element = jqLite(element)
    modules = modules || []
    // modules添加模块：使用$provide服务注册 $rootElement的值 element
    modules.unshift(['$provide', function($provide) {
      $provide.value('$rootElement', element);
    }]);
    // modules添加任务：ng模块
    modules.unshift('ng');
    // 创建 依赖注入器，依赖以下服务开始angular正式初始化
    var injector = createInjector(modules)
    injector.invoke(['$rootScope', '$rootElement', '$compile', '$injector',
       function bootstrapApply(scope, element, compile, injector) {
        scope.$apply(function() {
          element.data('$injector', injector);
          // 开始编译
          compile(element)(scope);
        });
      }])
  }
}
```
通过执行[createInjector](#create-injector) 并注册angularjs内置服务

### createInjector :id=create-injector
```javascript
function createInjector(modulesToLoad) {
  // 所有Provider服务的集合
  // $provide 包含了内置的一些注册provider方法及语法糖（factory、service、value等）
  // $inject 是一个服务的（注入 + 查找）服务，本质上$inject也是一个服务，是通过 createInternalInjector 创建的。用于查找providerCache上绑定的其他服务。
  var providerCache = {
    $provide: {
      provider: supportObject(provider),
      factory: supportObject(factory),
      service: supportObject(service),
      value: supportObject(value),
      constant: supportObject(constant),
      decorator: decorator
    },
    $inject: null,
    // xxProvider,
    // yyProvider,
    // ...
  }
  var providerInjector = (providerCache.$injector =
    createInternalInjector(providerCache, () => { /* shouldnt perform*/})
  )
  protoInstanceInjector =
      createInternalInjector(instanceCache, function(serviceName, caller) {
        var provider = providerInjector.get(serviceName + providerSuffix, caller);
        return instanceInjector.invoke(
            provider.$get, provider, undefined, serviceName);
      }, true),
  providerCache['$injectorProvider'] = { $get: valueFn(protoInstanceInjector)}

  // $inject服务
  instanceInjector = protoInstanceInjector

// 加载所有modules并通过 $inject服务执行invoke
// 在加载module时会先加载当前module依赖的requires、_invokeQueue、_configBlocks
// （在publishExternalAPI时通过：
//    var config = invokeLater('$injector', 'invoke', 'push', configBlocks);
//    if (configFn) config(configFn)
//  ）已注册到_configBlocks
  forEach(loadModules(modulesToLoad), fn => fn && instanceInjector.invoke(fn));
}
```
