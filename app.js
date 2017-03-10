/**
 * Created by cmartinezdemorentin on 02/03/17.
 */

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/assets/css')));
app.use('/images', express.static(path.join(__dirname, 'public/assets/images')));
app.use('/js', express.static(path.join(__dirname, 'public/assets/js')));

app.get("/", function(request, response)
{
    response.render('index');
});

app.get("/graphicDesign", function(request, response)
{
    response.render('productDetail',
        {
            header: 'Graphic Design - Product info',
            product: 'Graphic Design',
            detail: 'We provide the best graphic design for individual or corporate business purpose, also communication design, practice of palnning and projecting ideas and experiences with visual eye.',
            clase: 'graphic-design'
        });
});

app.get("/webDevelopment", function(request, response)
{
    response.render('productDetail',
        {
            header: 'Web development - Product info',
            product: 'Web development',
            detail: 'We provide the best web development service for any personal or corporate project with great solutions on demand, and we also use modern web technology as well.',
            clase: 'webdevelopment'
        });
});

app.get("/printingDesign", function(request, response)
{
    response.render('productDetail',
        {
            header: 'Print Design - Product info',
            product: 'Print Design',
            detail: 'We provide the best service with high-quality printing design and cost-effective printing for any business purpose.',
            clase: 'printing'
        });
});

app.post('/formSubmit', parseUrlencoded, function(req,res)
{
    var data = req.body;
    res.render('formResult',
        {
            name: data.name,
            surname: data.surname,
            company: data.company,
            phone: data.phone,
            email: data.email,
            interests: data.interests
        });
});

var product1Data = {
    'Name' : 'Graphic Design',
    'Description' : 'We provide the best graphic design for individual or corporate business purpose, also communication design, practice of palnning and projecting ideas and experiences with visual eye.',
    'Image path' : 'images/graphic-design.png'
};

var product2Data = {
    'Name' : 'Web development',
    'Description' : 'We provide the best service with high-quality printing design and cost-effective printing for any business purpose.',
    'Image path' : 'images/webdevelopment.png'
};

var product3Data = {
    'Name' : 'Print Design',
    'Description' : 'We provide the best service with high-quality printing design and cost-effective printing for any business purpose.',
    'Image path' : 'images/printing.png'
};

app.get('/productData', function(req, res)
{
    switch(req.query.product)
    {
        case '1':
            res.json(product1Data);
            break;
        case '2':
            res.json(product2Data);
            break;
        case '3':
            res.json(product3Data);
            break;
        default:
            res.status(404).json('Selected product does not exist');
            break;
    }
});

io.on('connection', function(client)
{
   console.log('Conexión entrante');
});

app.listen(process.env.PORT||8080);
