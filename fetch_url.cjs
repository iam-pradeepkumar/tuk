const https = require('https');
https.get('https://screenapp.io/share/lVqLXYJayn', (res) => {
  console.log(res.statusCode, res.headers.location);
}).on('error', console.error);
