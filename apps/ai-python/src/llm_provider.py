"""LLM provider abstraction supporting OpenAI and Gemini."""

import json
import logging
from abc import ABC, abstractmethod
from typing import Optional

from openai import AsyncOpenAI

from src.config import settings

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Generate a completion from the LLM.
        
        Args:
            system_prompt: System message for the LLM
            user_prompt: User message/prompt
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text response
        """
        pass


class OpenAIProvider(LLMProvider):
    """OpenAI LLM provider implementation."""
    
    def __init__(self) -> None:
        """Initialize OpenAI client."""
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required for OpenAI provider")
        
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.default_temperature = settings.openai_temperature
        self.default_max_tokens = settings.openai_max_tokens
        logger.info(f"Initialized OpenAI provider with model: {self.model}")
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate completion using OpenAI API."""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature or self.default_temperature,
                max_tokens=max_tokens or self.default_max_tokens,
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from OpenAI")
            
            return content
        
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise


class GeminiProvider(LLMProvider):
    """Google Gemini LLM provider implementation."""
    
    def __init__(self) -> None:
        """Initialize Gemini client."""
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is required for Gemini provider")
        
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(settings.gemini_model)
            self.default_temperature = settings.gemini_temperature
            self.default_max_tokens = settings.gemini_max_tokens
            logger.info(f"Initialized Gemini provider with model: {settings.gemini_model}")
        
        except ImportError:
            raise ImportError(
                "google-generativeai package is required for Gemini provider. "
                "Install it with: pip install google-generativeai"
            )
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate completion using Gemini API."""
        try:
            # Combine system and user prompts for Gemini
            combined_prompt = f"{system_prompt}\n\n{user_prompt}\n\nIMPORTANT: Return ONLY valid JSON, no extra text."
            
            # Configure generation parameters
            generation_config = {
                "temperature": temperature or self.default_temperature,
                "max_output_tokens": max_tokens or self.default_max_tokens,
            }
            
            # Generate content
            response = await self.model.generate_content_async(
                combined_prompt,
                generation_config=generation_config,
            )
            
            if not response.text:
                raise ValueError("Empty response from Gemini")
            
            return response.text
        
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise


class KimiProvider(LLMProvider):
    """Kimi (Moonshot AI) LLM provider implementation."""
    
    def __init__(self) -> None:
        """Initialize Kimi client."""
        if not settings.kimi_api_key:
            raise ValueError("KIMI_API_KEY is required for Kimi provider")
        
        self.client = AsyncOpenAI(
            api_key=settings.kimi_api_key,
            base_url="https://api.moonshot.cn/v1"
        )
        self.model = settings.kimi_model
        self.default_temperature = settings.kimi_temperature
        self.default_max_tokens = settings.kimi_max_tokens
        logger.info(f"Initialized Kimi provider with model: {self.model}")
    
    async def generate_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Generate completion using Kimi API."""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature or self.default_temperature,
                max_tokens=max_tokens or self.default_max_tokens,
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Empty response from Kimi")
            
            return content
        
        except Exception as e:
            logger.error(f"Kimi API error: {e}")
            raise


def get_llm_provider() -> LLMProvider:
    """
    Factory function to get the configured LLM provider.
    
    Returns:
        Configured LLM provider instance
        
    Raises:
        ValueError: If provider is not supported or not configured
    """
    provider_name = settings.llm_provider.lower()
    
    if provider_name == "openai":
        return OpenAIProvider()
    elif provider_name == "gemini":
        return GeminiProvider()
    elif provider_name == "kimi":
        return KimiProvider()
    else:
        raise ValueError(
            f"Unsupported LLM provider: {provider_name}. "
            "Supported providers: openai, gemini, kimi"
        )
