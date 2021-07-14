# 介绍
基于drawio的私有化改造

# 功能特性
- 支持OSS部署(本来就是支持的限于部署服务器的带宽问题，将静态页面转到OSS部署加快页面访问速度)
- 废弃第三方的远程数据存储
- 新增基于MinIO的第三方存储方案
- 在私有化后，新增用户登录、并且管理创建的流程图文件

# Docker版部署指南
## 需要的组件服务说明
1. MinIO服务(tcp服务)
2. Drawio私有云后端服务(http服务)
3. Drawio的私有云后台前端（html静态）
4. Drawio的核心服务（html静态）

## docker-compose一站式全部部署





# 参考源码

https://github.com/othorizon/drawio-webdav 提供MinIO存储支持
