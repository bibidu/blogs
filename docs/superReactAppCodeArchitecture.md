## 代码参考
[elastic/elastic-charts@19.3.0](https://github.com/elastic/elastic-charts)

## 代码架构

### 描述
单个页面多store数据架构


### 技术栈
`react` `redux` `re-select`



### 目录结构

```tree
- chart_types
  - goal_chart
    - state
      - selectors
      - state.js

- components
  - chart.js

- state
  - actions
  - selectors
  - reducers
  - chart_state.js
    - getInitialState: function
    - createReducer: function
```

### 细节
- components/chart.js
  ```javascript
    export default class extends React.Component{
      constructor(props) {
        super(props)
        const reducer = createReducer(uuid.v4())
        this.chartStore = createStore(reducer, enhancers)
      }

      render() {
        return <Provider>
          <div>
            {/* ... */}
          </div>
        </Provider>
      }
    }
  ```

- chart_types/goal_chart/state/state.js
  ```javascript
    export default class GoalChartState {
      constructor(props) {
        this.onElementClickCaller = createOnElementClickCaller()
      }

      isChartEmpty = () => false

      chartRenderer = () => <GoalChartRenderer />
    }

    function createOnElementClickCaller() {
      return function(state) {
        return getSelector(state)
      }
    }

    function getSelector(state) {
      const selector = createCachedSelector(
        [getLastClickSelector],
        (lastClick)
      )({
        keySelector: (state) => state.chartId
      })

      return selector(state)
    }
  ```

- chart_state.js
  ```javascript

    function getInitialState(chartId) {
      return {
        chartId,
        attrA,
        attrB,
        // ...
      }
    }

    export default function createReducer(chartId) {

       // 单页多store，存在多个state
      const initialState = getInitialState(chartId)

      return function(state = initialState, action) {
        switch(action.type) {
          case initState: {
            const chartState = initStateByType(action.chartType)

            return {
              ...state,
              chartState,
            }
          }
        }
      }
    }

    function initStateByType(charType) {
      if (chartType === 'goal') {
        return new GoalState()
      }
    }
  ```
