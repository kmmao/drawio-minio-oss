# DrawIO 基于MinIO以及OSS私有云方案
基于drawio的私有化实现以及私有化云端存储方案

# 功能特性
- 支持OSS部署(本来就是支持的，限于部署服务器的带宽问题，将静态页面转到OSS部署加快页面访问速度)
- 新增基于MinIO的第三方存储方案
- 在私有化后，新增用户登录、并且管理创建的流程图文件(方便云端管理自己创建的流程图文件)
- 支持通过接口创建、管理、删除登录用户信息

# 效果示例
## 登录界面
# Drawio-minio-oss版部署指南
## 需要的组件服务说明
1. MinIO服务(tcp服务、内网通讯)
2. Drawio私有云后端服务(http服务，公网)
3. Drawio的私有云后台前端（html静态，公网）
4. Drawio的核心服务（html静态，公网）

## docker-compose一站式全部部署(非oss方案)
> 此方案非oss方案，即一个主机部署即可
### 1.部署前提准备
1. 安装docker环境
2. 安装docker-compose环境(版本不要太低)
3. 一台主机(推荐Linux系统)

### 2.拉取源码
> 部署依赖于源码部署，所以需要将整个源码拉下来
```shell
git clone https://github.com/mathcoder23/drawio-minio-oss
cd drawio-minio-oss
```
### 3.运行docker-compose
```shell
cd docker/compose/
docker-compose -f docker-compose-drawio.yml up
```
### 4.登录MinIO后台配置账号
在docker-compose中我们给drawio-admin配置的MinIO连接参数如下
```
    minio1:
        image: minio/minio:RELEASE.2021-07-08T01-15-01Z
        hostname: minio1
        volumes:
          - minio-data1:/data1
        expose:
          - "9000"
          - "9001"
        environment:
          MINIO_ROOT_USER: minio
          MINIO_ROOT_PASSWORD: minio123
        command: server /data1 --console-address ":9001"
        healthcheck:
          test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
          interval: 30s
          timeout: 20s
          retries: 3
    drawio-admin:
        build:
          context: ../../drawio-admin-nodejs
          dockerfile: Dockerfile
        image: drawio-admin:1.20
        environment:
          DRAWIO_URL: ''
          MINIO_ACCESS_KEY: 'test123123'
          MINIO_SECRET_KEY: 'test123123'
          MINIO_BUCKET: 'drawio'
        depends_on:
          - minio1
```
根据我们配置的MinIO后台账号`minio`和`minio123`,登录`http://localhost:9001`
#### 1.创建用户
ADMIN->Users点击Create User,这里我们创建的用户账号密码为`test123123`和`test123123`,因为yml中已经配置了，如果想自定义可以自行更改
![创建用户](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/mio-create-user.png)
#### 2.为用户分配读写权限
![为用户分配读写权限1](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/user-assign1.png)
![为用户分配读写权限2](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/user-assign2.png)

#### 3. 创建Bucket
我们在yml中配置的Bucket名称为`drawio`,因此需要创建一个这个
![创建Bucket](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/create-bucket.png)

### 5.重启docker-compose
> 这一步的作用是重新连接到minio服务
> Ctrl+C关闭后重新执行docker-compose命令
### 6.登录Drawio私有云后台
> 当服务重启后，进入`http://localhost:8080`,使用默认的账号密码`admin`和`admin`登录
![登录](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/login-example.png)

### 7.创建新的流程图
![创建新的流程图](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/create-drawio.png)

### 8.编辑流程图

![编辑流程图1](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/drawio-edit1.png)
![编辑流程图](https://raw.githubusercontent.com/mathcoder23/drawio-minio-oss/19503bf801dc1d7b153fdb895979c6572c4dedea/readme/images/drawio-edit.png)

### 9.完成
> 到此我们部署后的基本流程全部都跑通了。
>但是限于服务器带宽，我们访问页面很慢，所以我们将静态也迁移至OSS上将会快很多，下面参考增加OSS的部署方案

### 10.进阶版-登录用户管理接口
> 这个目前只支持通过api的方式管理，具体的接口用法参考postman导出的json接口工程。
> 路径：`drawio-admin-nodejs/Drawio私有云接口.postman_collection.json`

## docker-compose-OSS方案部部署
### 1.部署前提准备
1. 此部署方案与非OSS方案非常像，因此，你需要先跑通非OSS方案
2. 准备OSS云或其他静态托管服务商

### 2.文档说明
> OSS版文档基于非OSS上只对有更改的地方进行说明，不会再重复

### 3.托管静态Html到OSS
#### 1.由于html的静态化，我们需要先修改静态代码指向的`Drawio私有云后端服务地址`
编辑`html/admin/config.js`

将`window.baseUrl = '/api'`更改为后端地址，`http://ip:8080/api`这里的ip是公网ip，注意后面不要加斜杠

这里的`http://ip:8080/api`也可以改为`//ip:8080/api`，跟随前端协议变化而变化，但是需要自行配置https

#### 2.上传html文件夹内所有文件到OSS
注意不要上传html本身，当然如果你不介意多一个/html路径也可以

OSS的静态托管教程以及域名绑定等操作，这里不细谈，具体参见对应的文档即可

这里假设配置的OSS访问地址为`http://xxx.com` html中的`admin、drawio`文件夹上传在此根目录,这个地址下面配置要用

后台管理入口地址：`http://xxx.com/admin/drawio.html`

Drawio入口地址：`http://xxx.com/drawio/index.html` 此地址对用户透明，仅部署配置使用

为了保证部署的可用性，请分别访问上述地址看是否正常。

#### 3.修改yml中DRAWIO_URL值
> `DRAWIO_URL`的配置是可以直接访问的drawio页面，`http://xxx.com/drawio/index.html`，之所以后台要配置这个地址，是由于后台是采用代理技术来实现
>minio的持久化
yml部分代码
```yaml
# Drawio 管理后台服务
drawio-admin:
build:
  context: ../../drawio-admin-nodejs
  dockerfile: Dockerfile
image: drawio-admin:1.21
environment:
  DRAWIO_URL: 'http://xxx.com/drawio/index.html' ###### 将这里更改为上述地址，其余不变
  MINIO_ACCESS_KEY: 'test123123'
  MINIO_SECRET_KEY: 'test123123'
  MINIO_BUCKET: 'drawio'
depends_on:
      - minio1
```
#### 4.重启服务
#### 5.进入后台体验速度的改变
后台管理入口地址：`http://xxx.com/admin/drawio.html`





# 参考源码
https://github.com/jgraph/drawio 感谢核心贡献

https://github.com/othorizon/drawio-webdav 提供MinIO存储支持
