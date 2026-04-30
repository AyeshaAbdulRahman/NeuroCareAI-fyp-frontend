import json
import urllib.error
import urllib.parse
import urllib.request

from flask import current_app


class ChatbotServiceError(Exception):
    """Raised when the external chatbot service cannot be reached or parsed."""


def _safe_references(raw_references):
    if isinstance(raw_references, list):
        return raw_references
    return []


class ChatbotServiceClient:
    """Thin HTTP client for the external agentic RAG chatbot service."""

    def __init__(self, service_url: str, timeout_seconds: int = 90):
        self.service_url = service_url
        self.timeout_seconds = int(timeout_seconds)

    def chat(self, *, message: str, session_id: str, history=None):
        payload = {
            "message": message,
            "session_id": session_id,
            "history": history or [],
        }
        parsed = self._request_json(
            self.service_url,
            data=payload,
            method="POST",
        )
        return {
            "reply": parsed.get("reply") or "I could not generate a response at this time.",
            "references": _safe_references(parsed.get("references")),
            "raw": parsed,
        }

    def health(self):
        health_url = self._health_url()
        return self._request_json(health_url, method="GET")

    def _health_url(self) -> str:
        parsed = urllib.parse.urlparse(self.service_url)
        path = parsed.path or "/chat"
        if path.endswith("/chat"):
            path = f"{path[:-5]}/health"
        else:
            path = "/health"
        return urllib.parse.urlunparse(parsed._replace(path=path))

    def _request_json(self, url: str, data=None, method: str = "GET"):
        body = None if data is None else json.dumps(data).encode("utf-8")
        request = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method=method,
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                response_data = response.read().decode("utf-8")
        except (urllib.error.URLError, TimeoutError) as exc:
            raise ChatbotServiceError(str(exc)) from exc

        if not response_data:
            return {}

        try:
            return json.loads(response_data)
        except json.JSONDecodeError as exc:
            raise ChatbotServiceError("Invalid JSON returned by chatbot service") from exc


def get_chatbot_service():
    return ChatbotServiceClient(
        service_url=current_app.config.get("CHATBOT_SERVICE_URL"),
        timeout_seconds=current_app.config.get("CHATBOT_TIMEOUT_SECONDS", 90),
    )
