
import jsonServer from 'json-server';
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
    res.jsonp(req.query)
})

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
    if (req.method === 'POST') {
        req.body.createdAt = Date.now()
        req.body.updatedAt = Date.now()
    } else if (req.method === 'PATCH') {
        req.body.updatedAt = Date.now()
    }
    // Continue to JSON Server router
    next()
})

router.render = (req, res) => {
    const headers = res.getHeaders()
    const totalCountHeader = headers['x-total-count']

    if (req.method === 'GET' && totalCountHeader) {
        const linkHeader = headers['link']
        const linkParse = parseLinkHeader(linkHeader)
        const result = {
            data: res.locals.data,
            totalCount: totalCountHeader || 0,
            link: linkParse
        }
        return res.jsonp(result)
    }

    res.jsonp(res.locals.data)
}

// Use default router
server.use('/api', router)
server.listen(3000, () => {
    console.log('JSON Server is running')
})

function parseLinkHeader(linkHeader) {
    if (linkHeader === '')
        return linkHeader;

    const linkHeadersArray = linkHeader.split(", ").map(header => header.split("; "));
    const linkHeadersMap = linkHeadersArray.map(header => {
        const thisHeaderRel = header[1].replace(/"/g, "").replace("rel=", "");
        const thisHeaderUrl = header[0].slice(1, -1);
        return [thisHeaderRel, thisHeaderUrl]
    });
    return Object.fromEntries(linkHeadersMap);
}
