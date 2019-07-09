const querystring = require('querystring');
const handleBlogRouter = require('./src/router/blog');
const handleUserRouter = require('./src/router/user');

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
    res.setHeader('Content-Type', 'application/json');

    const url = req.url;
    req.path = url.split('?')[0];

    req.query = querystring.parse(url.split('?')[1]);

    //post data
    getPostData(req).then(postData => {
        req.body = postData;

        const blogResult = handleBlogRouter(req, res);
        if (blogResult) {
            blogResult.then(blogData => {
                res.end(
                    JSON.stringify(blogData)
                );
            });
            return;
        }

        const userResult = handleUserRouter(req, res);
        if (userResult) {
            userResult.then(userData => {
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