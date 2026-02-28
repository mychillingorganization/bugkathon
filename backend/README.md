# GDGoC Certificate System - Backend

This is the FastAPI backend for the Bugkathon Certificate Generator, utilizing Python 3.12 and SQL Server.

## 🚀 Key Technologies
- **Framework**: `FastAPI` (Python 3.12)
- **Database**: `SQL Server` via `SQLAlchemy`
- **Graphics**: `lxml` (SVG) and `cairosvg` (PDF)

## ⚠️ Important: Run with Docker
**Do not run this locally using `pip install`.** 
Libraries like `cairosvg` and `aioodbc` require complex C-components (Cairo graphics, MS ODBC drivers) that are difficult to install natively on Windows.

Instead, build and run using Docker:
```bash
docker-compose up --build
```
*(Ensure you have a `.env` file created from `.env.example` before running).*

## 📖 API Documentation
Once running, the interactive Swagger UI documentation is available at:
[http://localhost:8000/docs](http://localhost:8000/docs)