#!/bin/bash

if [ "$1" ]; then
    ACTION=$1
fi

# 设置信息
git config user.name "${GIT_USER}"
git config user.password "${GIT_PASS}"
git config user.email "${GIT_EMAIL}"

git remote rm origin
git remote add origin https://${GIT_USER}:${GIT_PASS}@gitee.com/goeasy-io/demo-customer-service.git

# 强制切换分支
git fetch
git checkout -f 跑不通_master

# 设置NPM源，提升安装速度
npm config set registry https://registry.npmmirror.com

if [ "$ACTION" = "b" ]; then
    # branch 版本
    cd support/web
    newVersion=$(npm version prerelease --no-git-tag-version)
    vwesionDir=${newVersion:1:-1}"x"
    cd ../../
fi

if [ "$ACTION" = "r" ]; then
    # release 版本
    cd support/web
    newVersion=$(npm version patch)
    vwesionDir=${newVersion:1}
    cd ../../
fi

# 创建版本目录
mkdir -p $vwesionDir

# 构建agent服务
cd support/web
npm install
npm run build
mv dist ../../$vwesionDir/agent

# 构建customer服务
cd ../../customer/uniapp
npm install
npm run build
mv dist/build/h5 ../../$vwesionDir/customer

# 复制index.html文件
cd ../../
sed -i "s/[0-9].[0-9].[0-9]-./$vwesionDir/g" index.html
cp index.html $vwesionDir/index.html

# 克隆仓库
git clone https://${GIT_USER}:${GIT_PASS}@gitee.com/goeasy-io/show-cs.git
# 清除老数据
rm -rf show-cs/$vwesionDir
# 移动版本目录
mv $vwesionDir show-cs/


# 切换仓库
cd show-cs
# 设置信息
git config user.name "${GIT_USER}"
git config user.password "${GIT_PASS}"
git config user.email "${GIT_EMAIL}"
# 标记推送
git add $vwesionDir
git commit -m "$vwesionDir is built"
git push
