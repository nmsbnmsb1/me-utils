const fs=require('node:fs')
const path=require('node:path')
const { CryptoUtils, FileUtils, TimeUtils,fsPromisify } = require('../lib');

// const crypto = require('crypto');
// console.log(CryptoUtils.md5('aaa')); //47bce5c74f589f4867dbd57e9ca9f808
// console.log(CryptoUtils.sha256('aaa')); //9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0

(async () => {
    //isExist
    console.log('isExist')
    console.log(await FileUtils.isExist(`/Users/xxx/Downloads/Test`));
    console.log(await FileUtils.isExist(`/Users/xxx/Downloads/Test/F02DEACF-FBA1-48FA-93EC-41235319A67F.png`));
    console.log(await FileUtils.isExist(`/Users/xxx/Downloads/Test/F02DEACF-FBA1-48FA-93EC-41235319A67F1.png`));
    //isFile
    console.log('isFile')
    console.log(await FileUtils.isFile(`/Users/xxx/Downloads/Test`));
    console.log(await FileUtils.isFile(`/Users/xxx/Downloads/Test/F02DEACF-FBA1-48FA-93EC-41235319A67F.png`));
    console.log(await FileUtils.isFile(`/Users/xxx/Downloads/Test/F02DEACF-FBA1-48FA-93EC-41235319A67F1.png`));
    //isDirectory
    console.log('isDirectory')
    console.log(await FileUtils.isDirectory(`/Users/xxx/Downloads/Test`));
    console.log(await FileUtils.isDirectory(`/Users/xxx/Downloads/Test/F02DEACF-FBA1-48FA-93EC-41235319A67F.png`));
    console.log(await FileUtils.isDirectory(`/Users/xxx/Downloads/Test/F02DEACF-FBA1-48FA-93EC-41235319A67F1.png`));
   //mkdir
    console.log('mkdir')
    console.log(await FileUtils.mkdir(`/Users/xxx/Downloads/Test/Test1`));
    console.log(await FileUtils.mkdir(`/Users/xxx/Downloads/Test1/Test1_sub`));
    //getdirFiles
    console.log('getdirFiles')
    console.log(await FileUtils.getdirFiles(`/Users/xxx/Downloads/Test`,'a'));
    console.log(await FileUtils.getdirFiles(`/Users/xxx/Downloads/Test2`));
    //rmdir
    console.log('rm')
    console.log(await FileUtils.rm(`/Users/xxx/Downloads/Test11`));
    console.log(await FileUtils.rm(`/Users/xxx/Downloads/Test/Test2`));
    //return;
})();