import app from './app';

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`  BHOPAL CIVIC COMPLAINT INTELLIGENCE ENGINE - OPERATOR BACKEND `);
    console.log(`  Phase 2: Taxonomy, Gazetteer, Normalisation, Data Quality     `);
    console.log(`  Port: ${PORT} | Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`================================================================`);
  });
}

export default app;
