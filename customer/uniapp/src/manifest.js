const fs = require('fs');

fs.readFile(`${__dirname}/manifest.json`,
    function (err, data) {
        if (err) {
            console.error(err);
        } else {
            var _data = JSON.parse(data.toString())
            const baseUrl = `/show-cs/${_data['versionName']}/customer/`;
            _data['h5'].publicPath = baseUrl;
            _data['h5'].router.base = baseUrl;

            _data = JSON.stringify(_data);

            fs.writeFile(`${__dirname}/manifest.json`, _data, {
                encoding: "utf-8"
            }, function (err) {
                if (err) {
                    console.log('写入publicPath失败', err);
                } else {
                    console.log('写入publicPath成功');
                }
            });
        }
})