#!/bin/bash

if [ "$1" ]; then
    ACTION=$1
fi

appkey=$config_appkey
git_usernamne=${}
git_password=${}
git_email=${}

# 获取当前版本并创建目录
confirm_version() {

    originBranch=$(git rev-parse --abbrev-ref HEAD)

    if [ "$ACTION" = "r" ]; then
        # release 版本
        cd support/web
        currentVersion=$(npm version patch)
        versionDir=currentVersion
        //todo: 提交, 打tag，切换到tag

    else
        # build 版本
        cd support/web
        currentVersion=$(npm run env | grep npm_package_version | cut -d '=' -f 2)
        if [[ $currentVersion =~ "-" ]]; then
            vesionDir=${currentVersion:-1}"x"
        else
            vesionDir=$currentVersion"-x"
        fi
    fi

    echo "version confirmed:$currentVersion"

}

# 获取当前版本并创建目录
make_build_folder() {

    # 创建版本目录
    cd ../../
    ls build >/dev/null 2>&1
    if [ $? == 0 ]; then
        rm -rf build
    fi
    mkdir -p build/$vesionDir

    echo "made dir: build/$vesionDir"
}
# 构建web服务
build_web() {
    cd support/web
    npm install
    npm run build  --appkey=$appkey
    mv dist ../../build/$vesionDir/agent
    cd ../../
}

# 构建custiner服务
build_customer() {
    cd customer/uniapp
    npm install
    npm run build -- --appkey=
    mv dist/build/h5 ../../build/$vesionDir/customer
    rm -rf dist
    cd ../../
}

# 升级web服务的版本
upgrade_versions() {
    cd support/web


    if [ "$ACTION" = "r" ]; then
      git checkout -f $originBranch
    fi


  nextVersion=$(npm version prerelease --no-git-tag-version)

  git add .
  git commit -m "$currentVersion is built"
  git push

  echo "$currentVersion is build, next version $nextVersion"


}

# 拷贝inde.html
copy_html() {
    # 复制index.html文件
    #    sed -i "s/[0-9].[0-9].[0-9]-./$vwesionDir/g" index.html
    cp index.html build/$vesionDir/index.html
}

# 推送至show-cs
deploy() {
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
}

# 清理本地目录
clear_file() {
    rm -rf show-cs
    rm -rf build
    rm -rf customer/uniapp/node_modules
    rm -rf support/web/node_modules
}


confirm_version
make_build_folder
build_web
build_customer
copy_html
deploy
clear_file
upgrade_versions

