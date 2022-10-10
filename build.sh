#!/bin/bash

if [ "$1" ]; then
    ACTION=$1
fi

# 获取当前版本并创建目录
build_version() {
    if [ "$ACTION" = "r" ]; then
        # release 版本
        cd support/web
        releaseVersion=$(npm version patch)
        vesionDir=${releaseVersion:1}
        cd ../../
    else
        # build 版本
        cd support/web
        currentVersion=$(npm run env | grep npm_package_version | cut -d '=' -f 2)
        if [[ $currentVersion =~ "-" ]]; then
            vesionDir=${currentVersion::-1}"x"
        else
            vesionDir=$currentVersion"-x"
        fi
        cd ../../
    fi

    # 创建版本目录
    ls build >/dev/null 2>&1
    if [ $? == 0 ]; then
        rm -rf build
    fi
    mkdir -p build/$vesionDir
}

# 构建web服务
build_web() {
    cd support/web
    npm install
    npm run build
    mv dist ../../build/$vesionDir/agent
    cd ../../
}

# 构建custiner服务
build_customer() {
    cd customer/uniapp
    npm install
    npm run build
    mv dist/build/h5 ../../build/$vesionDir/customer
    rm -rf dist
    cd ../../
}

# 升级web服务的版本
upgrade_versions() {
    cd support/web
    if [ "$ACTION" != "r" ]; then
        # 升级版本
        npm version prerelease --no-git-tag-version
    fi
    # 推送package.json
    git add package.json
    git commit -m "upgrade versions"
    git push origin 跑不通_master
    cd ../../
}

# 拷贝inde.html
copy_html() {
    # 复制index.html文件
    #    sed -i "s/[0-9].[0-9].[0-9]-./$vwesionDir/g" index.html
    cp index.html build/$vesionDir/index.html
}

# 推送至show-cs
push_repository() {
    if [ -d "show-cs" ]; then
        rm -rf show-cs
    fi
    git clone https://${GIT_USER}:${GIT_PASS}@gitee.com/goeasy-io/show-cs.git
    # 清除老数据
    ls show-cs/$vesionDir >/dev/null 2>&1
    if [ $? == 0 ]; then
        rm -rf show-cs/$vesionDir
    fi
    # 移动版本目录
    mv build/$vesionDir show-cs/

    # 切换仓库
    cd show-cs
    # 设置信息
    git config user.name "${GIT_USER}"
    git config user.password "${GIT_PASS}"
    git config user.email "${GIT_EMAIL}"
    # 标记推送
    git add $vesionDir
    git commit -m "$vesionDir is built"
    git push

    cd ../
}

# 清理本地目录
clear_file() {
    rm -rf show-cs
    rm -rf build
    rm -rf customer/uniapp/node_modules
    rm -rf support/web/node_modules
}

build_version
build_web
build_customer
upgrade_versions
copy_html
push_repository
clear_file
