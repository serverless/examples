import mongoose from 'mongoose';

const connection = mongoose.connect(process.env.DB_URL as string, {
  dbName: process.env.DB_NAME,
});

// This connect() call is fire-and-forget at module scope (nothing awaits it), so an
// unhandled rejection here (e.g. an unreachable/unauthenticated MongoDB host) would
// otherwise crash the whole Lambda process. Attaching a handler lets a failed connection
// surface later as a normal per-request error (caught by BooksController) instead.
connection.catch((err) => {
  console.error('MongoDB connection error:', err);
});

export default connection;
