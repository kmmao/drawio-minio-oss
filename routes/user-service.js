import {GlobalConfig} from "../global-config";

let userList = {
    "admin": {
        username: 'admin',
        password: "admin"
    }
}
const sessionList = {}
let client
const login = (req, res, next) => {
    let username = req.query.username
    let password = req.query.password
    if (userList.length === 0) {
        loadUserListByIo(client)
    }
    if (userList[username] && userList[username].password === password) {
        let token = saveSession(userList[username])
        res.send({code: 200, token: token})
    } else {
        res.send({
            code: 403,
            msg: '账号或密码错误'
        })
    }
}
const saveSession = (user) => {
    let token = user.username + new Date().getTime()
    console.log('u', user, token)
    sessionList[token] = user
    return token
}
const getSession = (token) => {
    return sessionList[token]
}
const loadUserListByIo = (minioClient) => {
    client = minioClient
    minioClient.getObject(GlobalConfig.config.BucketName, GlobalConfig.config.userListFile, function (err, dataStream) {
        let size;
        let bufferList = [];
        if (err) {
            if (err.code === 'NoSuchKey') {
                //创建文件
                saveUserList(minioClient)
                return;
            }
            console.log(err);
            return;
        }
        dataStream.on('data', function (chunk) {
            size += chunk.length;
            bufferList = bufferList.concat(Array.from(chunk));
        });
        dataStream.on('end', function () {
            // https://nodejs.org/api/buffer.html#buffer_buf_tostring_encoding_start_end
            let fileContent = Buffer.from(bufferList).toString();
            console.log('End. Total size = ' + size + ',content = ' + fileContent);
            userList = JSON.parse(fileContent)
        });
        dataStream.on('error', function (err) {
            console.log(err);

        });
    });
}
const saveUserList = (minioClient) => {
    try {
        minioClient.putObject(GlobalConfig.config.BucketName, GlobalConfig.config.userListFile, JSON.stringify(userList), function (err, etag) {
            console.log(err, etag); // err should be null
            if (err) {
                console.log('save user list error', err)
            }
        });
    } catch (e) {
        console.log('save user list error', e)
    }
}
const listFile = (minioClient, user) => {
    console.log('cc', minioClient.listObjects)
    return new Promise(((resolve, reject) => {
        let prefix = GlobalConfig.config.userPrivatePrefix + "/" + user.username
        console.log('list file prefix', prefix)
        let stream = minioClient.listObjects(GlobalConfig.config.BucketName, prefix, true)
        let list = []
        stream.on('data', function (obj) {
            console.log('data', obj)
            // resolve(obj)
            obj.name = obj.name.replace(prefix + "/", '')
            obj.lastModified = new Date(obj.lastModified).Format("yyyy-MM-dd hh:mm:ss")
            list.push(obj)

        })
        stream.on('end', function (obj) {
            console.log('data', obj)
            if ('undefined' === typeof obj) {
                // obj = []
            }
            resolve(list)
        })
        stream.on('error', function (err) {
            console.log('aa', err)
            reject(err)
        })
    }))
}
const apiListUserFile = async (req, res, next) => {
    let token = req.query.token
    let user = getSession(token)
    if (user && user.username) {
        let list = await listFile(client, user)
        console.log('list', list)
        res.send(200, {
            code: 200,
            data: list
        })
    } else {
        res.send({
            code: 404,
            msg: '登录失效'
        })
    }
}
const checkSession = (req, res, cb) => {
    console.log('fff', req.body.token)
    let token = req.query.token
    if (!token) {
        token = req.body.token
    }
    let user = getSession(token)
    if (user && user.username) {
        cb(user)
    } else {
        res.send({
            code: 404,
            msg: '登录失效'
        })
    }
}
const apiCreateFile = (req, res, next) => {
    let name = req.body.name
    if (!name) {
        res.send(200, {
            code: 300,
            msg: '请输入文件名'
        });
    }
    if (name.indexOf('/') === 0) {
        name = name.substr(1, name.length - 1)
    }
    if (name.lastIndexOf('/') === name.length - 1) {
        name = name.substr(0, name.length - 1)
    }
    checkSession(req, res, (user) => {
        try {
            let prefix = GlobalConfig.config.userPrivatePrefix + "/" + user.username
            let filename = prefix + '/' + name
            console.log('create file ', filename)
            client.putObject(GlobalConfig.config.BucketName, filename, GlobalConfig.config.NewFileContent, function (err, etag) {
                console.log(err, etag); // err should be null
                if (err) {
                    res.send(500, err.toString);
                }
            });
            res.send(200, {
                code: 200,
                msg: '创建成功'
            })
        } catch (e) {
            res.send(500, e.toString());
        }
    })

}
const apiDeleteFile = (req, res, next) => {
    let name = req.body.name
    if (!name) {
        res.send(200, {
            code: 300,
            msg: '请输入文件名'
        });
        return
    }
    checkSession(req, res, (user) => {
        try {
            let prefix = GlobalConfig.config.userPrivatePrefix + "/" + user.username
            let filename = prefix + '/' + name
            console.log('remove file ', filename)
            client.removeObject(GlobalConfig.config.BucketName, filename, function (err, etag) {
                console.log(err, etag); // err should be null
                if (err) {
                    res.send(500, err.toString);
                }
            });
            res.send(200, {
                code: 200,
                msg: '删除成功'
            })
        } catch (e) {
            res.send(500, e.toString());
        }
    })

}
export const UserService = {
    login: login,
    loadUserListByIo: loadUserListByIo,
    apiCreateFile: apiCreateFile,
    apiDeleteFile: apiDeleteFile,
    apiListUserFile: apiListUserFile
}
