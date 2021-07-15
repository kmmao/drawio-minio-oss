# 介绍
基于drawio的私有化实现以及私有化云端存储方案

# 功能特性
- 支持OSS部署(本来就是支持的，限于部署服务器的带宽问题，将静态页面转到OSS部署加快页面访问速度)
- 新增基于MinIO的第三方存储方案
- 在私有化后，新增用户登录、并且管理创建的流程图文件(方便云端管理自己创建的流程图文件)

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
### 部署前提准备
1. 安装docker环境
2. 安装docker-compose环境(版本不要太低)
3. 一台主机(推荐Linux系统)

### 拉取源码
> 部署依赖于源码部署，所以需要将整个源码拉下来
```shell
git clone https://github.com/mathcoder23/drawio-minio-oss
cd drawio-minio-oss
```
### 运行docker-compose
```shell
cd docker/compose/
docker-compose -f docker-compose-drawio.yml up
```
### 登录MinIO后台配置账号
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
#### 2.为用户分配读写权限

#### 3. 创建Bucket
我们在yml中配置的Bucket名称为`drawio`,因此需要创建一个这个
### 重启docker-compose
> 这一步的作用是重新连接到minio服务
>
### 登录Drawio私有云后台
> 当服务重启后，进入`http://localhost:8080`,使用默认的账号密码`admin`和`admin`登录
### 创建新的流程图
### 编辑流程图

# 参考源码
https://github.com/jgraph/drawio 感谢核心贡献

https://github.com/othorizon/drawio-webdav 提供MinIO存储支持
