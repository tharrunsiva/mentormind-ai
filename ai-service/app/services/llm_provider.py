import os
import json
import httpx
from typing import Optional, Dict, Any, List

class LLMProvider:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "demo").lower()
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.active_provider = self._detect_active_provider()

    def _detect_active_provider(self) -> str:
        if self.provider == "gemini" and self.gemini_key:
            return "gemini"
        elif self.provider == "openai" and self.openai_key:
            return "openai"
        return "demo"

    async def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        """Generates text using the configured provider or fallback engine."""
        if self.active_provider == "gemini" and self.gemini_key:
            try:
                # Call Gemini API via httpx
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
                payload = {
                    "contents": [{
                        "parts": [{"text": f"{system_instruction}\n\n{prompt}"}]
                    }]
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as e:
                print(f"[LLMProvider Warning] Gemini API call failed: {e}. Falling back to internal engine.")

        elif self.active_provider == "openai" and self.openai_key:
            try:
                url = "https://api.openai.com/v1/chat/completions"
                headers = {"Authorization": f"Bearer {self.openai_key}"}
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_instruction or "You are MentorMind AI."},
                        {"role": "user", "content": prompt}
                    ]
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return data["choices"][0]["message"]["content"]
            except Exception as e:
                print(f"[LLMProvider Warning] OpenAI API call failed: {e}. Falling back to internal engine.")

        # Fallback response generator
        return self._generate_fallback(prompt, system_instruction)

    def _generate_fallback(self, prompt: str, system_instruction: str) -> str:
        """Contextual fallback generation when no cloud API key is configured."""
        p_lower = prompt.lower()
        if "interview" in p_lower:
            return "Good technical explanation. Structure your response with explicit trade-offs and code patterns."
        elif "roadmap" in p_lower:
            return "Phased learning path prioritizing prerequisite topics."
        return "MentorMind AI recommends focusing on hands-on project milestones and continuous assessment."

llm_service = LLMProvider()
