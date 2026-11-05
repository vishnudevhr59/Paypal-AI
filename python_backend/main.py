"""
Payapp - FastAPI Backend Entrypoint
Official PayPal AI Hackathon Submission
"""

import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from paypal_service import PayPalSandboxService

app = FastAPI(
    title="Payapp API - Intelligent PayPal AI Payment Companion",
    description="Backend services for natural language payment orchestration, subscription fatigue audits, and PayPal Sandbox Checkout execution.",
    version="1.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

paypal_client = PayPalSandboxService()

# Schemas
class CreateOrderRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to be paid")
    currency: str = Field(default="USD", description="Currency code (USD, EUR, etc.)")
    description: str = Field(default="Payapp Automated Payment", description="Payment description/memo")
    recipient: Optional[str] = Field(default=None, description="Payee name or email")

class CaptureOrderRequest(BaseModel):
    order_id: str = Field(..., description="PayPal Order ID to capture")

class NaturalLanguagePrompt(BaseModel):
    prompt: str = Field(..., description="Natural language prompt from user (e.g., 'Pay my internet bill of $45')")

@app.get("/")
def root():
    return {
        "project": "Payapp - AI Payment Companion",
        "hackathon": "PayPal AI Hackathon",
        "status": "online",
        "paypal_endpoint": "https://api-m.sandbox.paypal.com",
    }

@app.post("/api/paypal/token")
def get_token():
    """Generates an OAuth2 access token from PayPal Sandbox."""
    try:
        token = paypal_client.get_access_token()
        return {"access_token": token, "token_type": "Bearer", "sandbox": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/paypal/orders")
def create_order(request: CreateOrderRequest):
    """Creates a PayPal order with dynamic amount and currency."""
    try:
        order = paypal_client.create_order(
            amount=request.amount,
            currency=request.currency,
            description=request.description,
        )
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Order creation error: {str(e)}")

@app.post("/api/paypal/orders/capture")
def capture_order(request: CaptureOrderRequest):
    """Captures an authorized PayPal order."""
    try:
        result = paypal_client.capture_order(request.order_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Capture error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
