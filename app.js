const querystring = require('querystring');
const { access } = require('./src/util/log');
const handleBlogRouter = require('./src/router/blog');
const handleUserRouter = require('./src/router/user');

const getCookieExpire = () => {
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    console.log('d.toGMTSring', d.toGMTString());
    return d.toGMTString();
}

let SESSION_DATA = {};

//用户处理post data
const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        if (req.method !== 'POST') {
            resolve({});
            return;
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({});
            return;
        }
        let postData = '';
        req.on('data', chunk => {
            postData += chunk;
        })
        req.on('end', () => {
            if (!postData) {
                resolve({});
                return;
            }
            console.log(postData);
            resolve(JSON.parse(postData));
        })
    });
    return promise;
}

const serverHandle = (req, res) => {
    //access
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`);

    res.setHeader('Content-Type', 'application/json');

    const url = req.url;
    req.path = url.split('?')[0];

    req.query = querystring.parse(url.split('?')[1]);

    //解析cookie
    req.cookie = {};
    const cookieStr = req.headers.cookie || '';
    cookieStr.split(';').forEach(item => {
        if (!item) {
            return;
        }
        const arr = item.split('=');
        const key = arr[0].trim();
        const val = arr[1].trim();
        req.cookie[key] = val;
    });

    //解析session
    let needSetCookie = false;
    let userId = req.cookie.userid;
    if (userId) {
        if (!SESSION_DATA[userId]) SESSION_DATA[userId] = {}
    } else {
        needSetCookie = true;
        userId = `${Date.now()}_${Math.random()}`;
        SESSION_DATA[userId] = {};
    }
    req.session = SESSION_DATA[userId];
    //post data
    getPostData(req).then(postData => {
        req.body = postData;

        const blogResult = handleBlogRouter(req, res);
        if (blogResult) {
            blogResult.then(blogData => {

                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpire()}`);
                }

                res.end(
                    JSON.stringify(blogData)
                );
            });
            return;
        }

        const userResult = handleUserRouter(req, res);
        if (userResult) {
            userResult.then(userData => {
                if (needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly; expires=${getCookieExpire()}`);
                }
                res.end(JSON.stringify(userData));
            });
            return;
        }

        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("404 Not Found\n");
        res.end();
    })

}

module.exports = serverHandle;

//process.env.NODE_ENV