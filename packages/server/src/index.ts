import app from './server';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Green Agent API server running on http://localhost:${PORT}`);
});
