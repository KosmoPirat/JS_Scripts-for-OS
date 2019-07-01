const fs = require('fs');
const fetch = require('node-fetch');
const request = require('request');

class Parser {
    constructor(urlFrom, urlTo,) {
        this.urlFrom = urlFrom;
        this.urlTo = urlTo;
    }

    getHtmlRequest(urlFrom, options) {
        return fetch(urlFrom, options).then(res => res.json());
    }

    downloadFiles(url, filename) {
         request.get(url)
            .on('response',  (response) => {
                let file = fs.createWriteStream(`./convert/${filename}`);
                console.log(response.statusCode);
                console.log(response.headers['content-type']);
                console.log(url, filename);
                response.pipe(file);
                file.on('finish', () => file.close())
            })
            .on('error', (err) => {
                console.error(`Ошибка запроса, url: ${url}, fileName: ${filename}. ${err}`);
                fs.unlinkSync(`./convert/${filename}`);
            })
    }

    /*Результат кода выше и кода в коментариях аналогичны!*/
        /*request(url)
            .pipe(fs.createWriteStream(`./convert/${filename}`))
            //.on('error', err => console.log(`file didn't save: ${err};\n`));
            .on('close', filename => console.log(`save file: ${filename};\n`))

    }*/

    writeData(data, urlTo) {
        fs.writeFile(urlTo, data, error => {
                if (error) {
                    console.log(`Ошибка записи в  файт writeData(). Error code: ${error}`)
                } else {
                    console.log("Запись файла завершена успешно!");
                }
            }
        );
    }
}

module.exports = Parser;