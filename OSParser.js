const fs = require('fs');

const Parser = require('./ParserBase');

class OSParser extends Parser {
    constructor(urlFrom, urlTo) {
        super(urlFrom, urlTo);
        this.requestOption = {
            method: 'post',
            body:JSON.stringify({
                Culture:"en-GB",
                Relevance:"relevance",
                ProductsOnPage:3463,
                Page:1,
                TotalPages:null,
                Keywords:"",
                Display:"reference",
                NewOnly:false
            }),
            headers: { 'Content-Type': 'application/json' },
        };
        this.getHtmlRequest(urlFrom, this.requestOption)
            .then(data => this.handleData(data));
    }

    handleData(data) {
        const newData = OSParser.getDatafromReq(data);
        const dataToCheck = this.getImageCompleteData(OSParser.getImageNameArr('./image_from_OS_rus'));
        const completeData = this.generateData(newData, dataToCheck);
        completeData.forEach(item => {
            this.downloadFiles(item.img, `${item.id}_1.jpg`.toLowerCase());
        });
        //this.writeData(JSON.stringify(res, null, 4), this.urlTo);
    }

    static getImageNameArr(urlFrom) {
        return  fs.readdirSync(urlFrom);
    }

    static getDatafromReq(arr) {
        const res = [];
        for (let item of arr.Products) {
            res.push({id: item.SKU, img: `https://www.originalstyle.com${item.ImageSrc}`});
        }
        return res;
    }

    getImageCompleteData(arr) {
        const imgNameArr = [];
        arr.forEach((item) => {
            if (/.+_1.jpg/.test(item)) {
                imgNameArr.push(item.replace(/_1\.jpg/, ''));
            }
        });
        return imgNameArr;
    }

    generateData(newData, dataToCheck) {
        const data = [];
        dataToCheck.forEach(item => {
            newData.forEach(dataItem => {
                if (dataItem.id.toLowerCase() === item.toLowerCase()) {
                    data.push(dataItem);
                }
            });
        });
        return data;
    }
}

const os = new OSParser('https://www.originalstyle.com/umbraco/api/CatalogueSearch/Full', './src/dataResult.json');


