# Album Viewer - Deployment Guide

## Docker Deployment (Coolify)

### Quick Start

1. **Build the image:**
   ```bash
   docker build -t album-viewer .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -v album-viewer-data:/app/data \
     -e DATABASE_URL=/app/data/local.db \
     album-viewer
   ```

### Coolify Setup

1. **Create a new service** in Coolify
2. **Set the Git repository** to your album-viewer repo
3. **Configure environment variables:**
   - `DATABASE_URL=/app/data/local.db`
4. **Add a volume mount:**
   - Mount `/app/data` to persist the SQLite database
5. **Set the port:** 3000
6. **Deploy!**

### Important Notes

- **Database Persistence:** Make sure to mount `/app/data` as a volume to persist your SQLite database across container restarts
- **First Run:** On first deployment, you'll need to run migrations:
  ```bash
  docker exec -it <container-id> npm run db:push
  ```
- **File Uploads:** CSV files are imported into the database, so no additional volume is needed for uploads

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `/app/data/local.db` | Path to SQLite database file |

### Coolify Volume Configuration

In Coolify, add a persistent volume:
- **Source:** `album-viewer-data` (named volume)
- **Destination:** `/app/data`

This ensures your database persists across deployments!
