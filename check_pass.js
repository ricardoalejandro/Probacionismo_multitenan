const bcrypt = require('bcrypt');
const hash = '$2b$10$nkd.fc6sBcSqYrrEicVUVe6aeLM85cA4l/l5VE4B/XseV9GwYn7Aq';
const pass = 'escolastica123';

bcrypt.compare(pass, hash).then(res => {
    console.log('Match:', res);
});
