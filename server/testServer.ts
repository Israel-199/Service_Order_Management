import express from 'express';

const app = express();

app.get('/ping', (req, res) => {
  console.log('Ping received');
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Test server listening on port 3000');
});
