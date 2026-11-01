import app from './app.js';
app.listen(process.env.PORT || 3001, '0.0.0.0', () => console.log('Contact API listening on port ' + (process.env.PORT || 3001)));
