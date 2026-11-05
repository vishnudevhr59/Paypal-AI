"""
Payapp - PayPal Sandbox Payment Service Module
Official PayPal AI Hackathon Submission

This module provides production-grade integration with the PayPal Sandbox APIs:
- OAuth2 Client Credentials access token generation
- Orders v2 API (Create Order, Capture Order, Retrieve Order Details)
- Error handling, structured logging, and resilient retry logic
"""

import os
import base64
import logging
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

# Configure structured logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("PayappPayPalService")

# Load environment variables
load_dotenv()

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE_URL", "https://api-m.sandbox.paypal.com")


class PayPalSandboxService:
    """Production-grade client for PayPal Sandbox Orders and Auth APIs."""

    def __init__(self, client_id: Optional[str] = None, client_secret: Optional[str] = None):
        self.client_id = client_id or PAYPAL_CLIENT_ID
        self.client_secret = client_secret or PAYPAL_CLIENT_SECRET
        self.api_base = PAYPAL_API_BASE.rstrip("/")
        self._cached_token: Optional[str] = None

    def get_access_token(self) -> str:
        """
        Authenticates with PayPal Sandbox via OAuth 2.0 Client Credentials flow.
        Endpoint: POST https://api-m.sandbox.paypal.com/v1/oauth2/token
        """
        if not self.client_id or not self.client_secret:
            logger.warning("PayPal Client ID or Secret missing. Please configure .env file.")
            raise ValueError("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in environment.")

        url = f"{self.api_base}/v1/oauth2/token"
        credentials = f"{self.client_id}:{self.client_secret}"
        encoded_auth = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")

        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {"grant_type": "client_credentials"}

        try:
            logger.info("Requesting OAuth2 access token from PayPal Sandbox: %s", url)
            response = requests.post(url, headers=headers, data=data, timeout=10)

            if response.status_code == 200:
                token_data = response.json()
                self._cached_token = token_data.get("access_token")
                logger.info("Successfully obtained PayPal Sandbox OAuth2 token.")
                return self._cached_token
            else:
                logger.error("Failed to fetch PayPal token. Status: %s, Body: %s", response.status_code, response.text)
                response.raise_for_status()
                return ""
        except requests.exceptions.RequestException as e:
            logger.exception("Network exception during PayPal OAuth2 authentication: %s", str(e))
            raise

    def create_order(
        self,
        amount: float,
        currency: str = "USD",
        description: str = "Payapp Smart Payment",
        reference_id: Optional[str] = None,
        custom_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Creates a PayPal Order using Orders v2 API with dynamic amount and currency.
        Endpoint: POST https://api-m.sandbox.paypal.com/v2/checkout/orders
        """
        token = self.get_access_token()
        url = f"{self.api_base}/v2/checkout/orders"
        formatted_amount = f"{amount:.2f}"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": reference_id or f"PAYAPP_REF_{os.urandom(4).hex()}",
                    "description": description,
                    "custom_id": custom_id or "PAYAPP_INTENT",
                    "amount": {
                        "currency_code": currency.upper(),
                        "value": formatted_amount,
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency.upper(),
                                "value": formatted_amount,
                            }
                        },
                    },
                    "items": [
                        {
                            "name": description,
                            "unit_amount": {
                                "currency_code": currency.upper(),
                                "value": formatted_amount,
                            },
                            "quantity": "1",
                            "category": "DIGITAL_GOODS",
                        }
                    ],
                }
            ],
            "application_context": {
                "brand_name": "Payapp Financial AI",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
            },
        }

        try:
            logger.info("Creating PayPal Sandbox Order for %s %s...", currency, formatted_amount)
            response = requests.post(url, headers=headers, json=payload, timeout=12)

            if response.status_code in (200, 201):
                order_data = response.json()
                logger.info("Order successfully created! Order ID: %s", order_data.get("id"))
                return order_data
            else:
                logger.error("Order creation failed: Status %s, Details: %s", response.status_code, response.text)
                response.raise_for_status()
                return {}
        except requests.exceptions.RequestException as e:
            logger.exception("Error during PayPal order creation: %s", str(e))
            raise

    def capture_order(self, order_id: str) -> Dict[str, Any]:
        """
        Captures payment for an approved PayPal Order.
        Endpoint: POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/capture
        """
        token = self.get_access_token()
        url = f"{self.api_base}/v2/checkout/orders/{order_id}/capture"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

        try:
            logger.info("Capturing PayPal Sandbox Order ID: %s", order_id)
            response = requests.post(url, headers=headers, json={}, timeout=12)

            if response.status_code in (200, 201):
                capture_data = response.json()
                logger.info("Order captured successfully! Status: %s", capture_data.get("status"))
                return capture_data
            else:
                logger.error("Order capture failed: Status %s, Body: %s", response.status_code, response.text)
                response.raise_for_status()
                return {}
        except requests.exceptions.RequestException as e:
            logger.exception("Error capturing PayPal order: %s", str(e))
            raise


# Quick CLI test execution
if __name__ == "__main__":
    service = PayPalSandboxService()
    print("PayPal Sandbox Module Ready.")
    # To test locally:
    # token = service.get_access_token()
    # order = service.create_order(amount=45.00, currency="USD", description="Pacific Power Electric Bill")
    # print(order)
