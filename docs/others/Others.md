

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

## 非安全Chrome
```
open -n /Applications/Google\ Chrome.app/ --args --disable-web-security  --user-data-dir=/Users/mr.du/Documents/MyChromeDevUserData
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