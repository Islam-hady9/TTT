from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import auth, ponds, operations, batches, samplings, transfers, predictions, alerts, harvests, feeding, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins temporarily for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ponds.router, prefix="/api/ponds", tags=["Ponds"])
app.include_router(operations.router, prefix="/api/operations", tags=["Operations"])
app.include_router(batches.router, prefix="/api/batches", tags=["Batches"])
app.include_router(samplings.router, prefix="/api/samplings", tags=["Samplings"])
app.include_router(transfers.router, prefix="/api/transfers", tags=["Transfers"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(harvests.router, prefix="/api/harvests", tags=["Harvests"])
app.include_router(feeding.router, prefix="/api/feeding", tags=["Feeding"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {
        "message": "Tibyan Aquaculture API",
        "version": "2.0.0 - Fish Lifecycle Management",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
