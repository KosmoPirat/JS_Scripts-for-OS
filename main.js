const request = require('request');
const fs = require('fs');
const events = require('events');

const host = 'https://www.originalstyle.com';
const requestBody = {
    Culture: 'en-GB',
    Relevance: 'relevance',
    ProductsOnPage: 5000,
    Page: 1,
    TotalPages: null,
    Keywords: '',
    Display: 'reference',
    NewOnly: false
};

const failedStream = fs.createWriteStream('failed.txt', { flags: 'a' });
const eventEmitter = new events.EventEmitter();

let productsAmount = 0;
let itemsProcessed = 0;
let reqId = 0;

request.post(`${host}/umbraco/api/CatalogueSearch/Full`, { json: requestBody }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            return;
        }

        productsAmount = body.Products.length;
        saveProductsToFolder(body.Products);
    }
);

const saveProductsToFolder = (products) => {
    products.forEach(product => {
        const { SKU, ImageSrc } = product;

        requestPictureWithinRetries(ImageSrc, SKU, reqId);
        reqId++;
    })
};

const requestPictureWithinRetries = (ImageSrc, SKU, reqId) => {
    requestPicture(ImageSrc, SKU)
        .then((SKU, body) => {
            console.log(`SUCCESS -- id: ${reqId}\n code: ${SKU}`);
            eventEmitter.emit('item processed');
            console.log(`body request: ${SKU}, ${body}`);
            downloadData(body, SKU);
            // Сохранить в папку
        })
        .catch(res => {
            if (res.error === null) {
                failedStream.write(`id:${reqId}; code:${res.SKU}; requestUrl: ${host}${ImageSrc}\n`);
                eventEmitter.emit('item processed');
            } else {
                console.log(`RETRY for id:${reqId} code : ${res.SKU}\n requestUrl: ${host}${ImageSrc} ::: ${res.error}`);
                requestPictureWithinRetries(ImageSrc, SKU, reqId);
            }
        })
};

const requestPicture = (url, SKU) => {
    return new Promise((resolve, reject) => {
        request.get(`${host}${url}`, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject({SKU, error});
            }
            resolve(SKU, body);
        });
    })
};

const downloadData = (data, fileName) => {
    const successStream = fs.createWriteStream(`.convert/${fileName}_1.jpg`.toLowerCase());
    data.pipe(successStream);
    successStream.on('finish', () => successStream.close());
};

eventEmitter.addListener('item processed', () => {
    console.log(`PROGRESS: ${++itemsProcessed}/${productsAmount}`);
    if (itemsProcessed === productsAmount) {
        console.log('Job successfully finished');
        failedStream.end();
    }
});