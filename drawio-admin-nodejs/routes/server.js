import {UserService} from "./user-service";
import {GlobalConfig} from "../global-config";

const express = require('express');
const router = express.Router();
// https://docs.min.io/cn/javascript-client-quickstart-guide.html
const Minio = require('minio');
const BucketName = GlobalConfig.config.BucketName;

let baseUrl = process.env.DRAWIO_URL
if (!baseUrl || baseUrl.length === 0) {
    baseUrl = "/drawio/index.html"
    console.log('not red env [drawioUrl] use default:', baseUrl)

} else {
    console.log('drawio url :', baseUrl)
}
/* GET home page. */
router.get('/', open);
router.get('/getDrawioUrl', getDrawioUrl);
router.get('/login', UserService.login);
router.get('/listUserFile', UserService.apiListUserFile);
router.put('/', save);
router.post('/apiCreateFile', UserService.apiCreateFile);
router.post('/apiDeleteFile', UserService.apiDeleteFile);
router.get('/apiCreateUser', UserService.apiCreateUser);
router.get('/apiUpdateUser', UserService.apiUpdateUser);
router.get('/apiDeleteUser', UserService.apiDeleteUser);
router.get('/apiListUser', UserService.apiListUser);

function getDrawioUrl(req, res, next) {
    res.status(200).send({
        baseUrl
    })
}

function open(req, res, next) {
    let fileName = req.param('filename');
    minioClient.getObject(BucketName, fileName, function (err, dataStream) {
        let size;
        let bufferList = [];
        if (err) {
            if (err.code === 'NoSuchKey') {
                res.render('edit', {fileName: fileName, imageData: GlobalConfig.config.NewFileContent});
                return;
            }
            console.log(err);
            res.send(500, err);
            return;
        }
        dataStream.on('data', function (chunk) {
            size += chunk.length;
            bufferList = bufferList.concat(Array.from(chunk));
        });
        dataStream.on('end', function () {
            // https://nodejs.org/api/buffer.html#buffer_buf_tostring_encoding_start_end
            let fileContent = Buffer.from(bufferList).toString();
            // console.log('End. Total size = ' + size + ',content = ' + fileContent);
            res.render('edit', {fileName: fileName, imageData: fileContent});
        });
        dataStream.on('error', function (err) {
            console.log(err);
            res.send(500, err);

        });
    });
}

function save(req, res, next) {
    let filename = req.body.filename;
    let data = req.body.data;
    try {
        minioClient.putObject(BucketName, filename, data, function (err, etag) {
            console.log(err, etag); // err should be null
            if (err) {
                res.send(500, err.toString);
            }
        });
    } catch (e) {
        res.send(500, e.toString());
    }
    res.send('success');
}

function initMinioBucket(minioClient) {
    minioClient.bucketExists(GlobalConfig.config.BucketName, function (err) {
        if (err) {
            if (err.code == 'NoSuchBucket') return console.log("bucket does not exist.")
            minioClient.makeBucket(GlobalConfig.config.BucketName, '', function (err) {
                if (err) return console.log('Error creating bucket.', err)
                console.log('Bucket created successfully in "".', GlobalConfig.config.BucketName)
            })
            return console.log(err)
        }
        // if err is null it indicates that the bucket exists.
        console.log('Bucket exists.', GlobalConfig.config.BucketName, err)
    })
}

let minioClient;

function connectMinio() {
    try {
        minioClient = new Minio.Client(GlobalConfig.config.MinioConfig);

    } catch (e) {
        setTimeout(() => {
            connectMinio()
        }, 2000)
        return
    }

    // initMinioBucket(minioClient)
    UserService.loadUserListByIo(minioClient)
}

connectMinio()
module.exports = router;
