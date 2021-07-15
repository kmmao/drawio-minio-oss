# 介绍
基于drawio的私有化实现以及私有化云端存储方案

# 功能特性
- 支持OSS部署(本来就是支持的，限于部署服务器的带宽问题，将静态页面转到OSS部署加快页面访问速度)
- 新增基于MinIO的第三方存储方案
- 在私有化后，新增用户登录、并且管理创建的流程图文件(方便云端管理自己创建的流程图文件)

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
2. 安装docker-compose环境
3. 一台主机(推荐Linux系统)

### 拉取源码



# 参考源码
https://github.com/jgraph/drawio 感谢核心贡献
https://github.com/othorizon/drawio-webdav 提供MinIO存储支持
