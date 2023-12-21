const DatauriParser = require('datauri/parser');

const parser = new DatauriParser();

//Parse Image to BASE 64
const bufferToDataURI = (fileFormat, buffer) => parser.format(fileFormat, buffer);

module.exports = {
  bufferToDataURI
};
