
## React-Native真机调试
```md
# 断vpn
# 断代理
# 断wifi重连
```

## Git/Npm
```
git commit --amend --author="duxianzhang <duxianzhang@58.com>" -m ""
```
```
git push --set-upstream origin feature/textContainer
```
```
npm i @w/tz-design-react --registry=http://cnpm.58v5.cn/
```

## Umi提交前跑测试用例
```
rm -rf node_modules/ && yarn --frozen-lockfile && yarn build && yarn test:coverage -- --forceExit --detectOpenHandles --runInBand --maxWorkers=2
```

## 非安全Chrome
```
open -n /Applications/Google\ Chrome.app/ --args --disable-web-security  --user-data-dir=/Users/mr.du/Documents/MyChromeDevUserData
```
## 非安全Edge
```
open -n /Applications/Microsoft\ Edge.app/ --args --disable-web-security  --user-data-dir=/Users/mr.du/Documents/MyEdgeDevUserData
```

## 配置SSH KEY
```bash
# 检查是否已存在id_rsa id_rsa.pub
cd ~/.ssh && ls

# 生成SSH KEY (全部空格即可)
ssh-keygen -t rsa -C "xxx@mail.com"

# 检查是否生成id_rsa id_rsa.pub
cd ~/.ssh && ls

# 获取SSH KEY (拷贝所有)
cat id_rsa.pub
```
进入Github -> Setting -> SSH and GPG keys -> New

```bash
# 验证是否成功
ssh -T git@github.com

# 期望输出
# Hi xxx! You have successfully authenticated.
```

## Git rebase
用于修改、删除已提交的Git记录
```bash
# 修改最近几次提交信息（HEAD~后数字可修改）
git rebase -i HEAD~3
```

```bash
# 修改rebase的 `操作` （p: 保留提交内容及提交记录、f: 保留提交内容但不保留提交记录）
# pick feat: 2nd submit
# pick feat: 3rd submit
# pick feat: 4th submit

# => (rebase的第一次提交记录不能为 f)

# pick feat: 2nd submit
# f feat: 3rd submit
# f feat: 4th submit
```

```bash
# 修改reabse的 `提交信息`
git commit --amend
```

```bash
# 结束rebase流程
git rebase --continue
```

```bash
# 提交远端
git push / git push -f
```