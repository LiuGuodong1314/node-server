let express = require('express');
let favicon = require('express-favicon');
let path = require("path");
let http = require("http");
let bodyParser = require('body-parser');
let history = require('connect-history-api-fallback');
let proxy = require('http-proxy-middleware');
let app = express();
let yaml = require('node-yaml')

let active = app.get('env') || 'dev'
let {server, proxyTable} = yaml.readSync(path.join(__dirname, `application-${active.trim()}.yml`))
if (!server) {
    server = {}
}
if (!proxyTable) {
    proxyTable = {}
}

app.use(history({
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    // logger: console.log.bind(console),
    disableDotRule: true,
    rewrites: [
        {
            from: /^\/node-ui\/.*$/,
            to: function ({request, parsedUrl}) {
                // let {headers} = request
                // let {cookie} = headers
                // console.log(`${parsedUrl.path},${cookie}`)
                return '/index.html'
            }
        }
    ]
}));

Object.keys(proxyTable).forEach(function (key) {
    app.use(key, proxy(proxyTable[key]));
});

app.use(bodyParser.json({
    limit: '1024mb'
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    console.log(req.originalUrl);
    next()
})

// app.all("*", (req, res, next)=>{
//   let {url,  headers} = req
//   let {cookie} = headers
//   // 只拦截页面
//   // todo 登录页面 可不用
//
//   console.log(url, cookie)
//   next()
// })

// app.get('/node-ui/', function (req, res) {
//   let {url,  headers} = req
//   let {cookie} = headers
//   console.log(url, cookie)
//
//   res.redirect("index.html");
// });

app.use(favicon(path.join(__dirname, "dist", "favicon.ico")));
app.use(express.static(path.join(__dirname, "dist")));

http.createServer(app).listen(server.port, function () {
    let {address, port} = this.address()
    console.log(`Server listening on ${address} ${port}`);
});

