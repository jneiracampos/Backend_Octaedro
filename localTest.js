// This module is for local testing

const {getValidResult, levenshtein, minWordsArray} = require("./services/model.service")

// const dict_orden = ["r", "i", "a", "s", "e", "c"];  IESCRA -ISAECR

const results = [2,6,1,4,5,3];

// grupos_investigacion_array = ['ASIREC', 'SIAECR', 'SIACER', 'ISARCE', 'CERISA', 'CREISA',
// 'AISREC', 'ASIERC', 'ECRSAI', 'ISACRE', 'SAICER', 'IASRCE',
// 'AISERC', 'RCEIAS', 'IASCRE', 'RCEAIS', 'ERCSAI', 'ECRASI',
// 'CEIRSA', 'SIAREC', 'SIACRE', 'EASRCI', 'CISERA', 'RECAIS',
// 'SAIECR', 'SIARCE', 'CRESIA', 'CRSEIA', 'IASREC', 'CRIESA',
// 'ASICER', 'CAICER', 'ERCSIA']

// console.log(minWordsArray("SIAREC", grupos_investigacion_array));

console.log(getValidResult(results))