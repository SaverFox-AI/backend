"""Scenario generation using LLM for money adventures."""

import json
import logging
from typing import Optional

from src.config import settings
from src.models import GenerateAdventureRequest
from src.llm_provider import get_llm_provider

logger = logging.getLogger(__name__)


class ScenarioGenerator:
    """Generates contextual money adventure scenarios using LLM."""
    
    def __init__(self) -> None:
        """Initialize the LLM provider."""
        self.llm_provider = get_llm_provider()
        logger.info(f"ScenarioGenerator initialized with {settings.llm_provider} provider")
    
    def _build_system_prompt(self) -> str:
        """
        Build the system prompt for scenario generation.
        
        Returns:
            System prompt string
        """
        return """Kamu adalah pendidik literasi keuangan yang membuat cerita petualangan uang untuk anak-anak Indonesia.

ATURAN PENTING:
1. Gunakan bahasa Indonesia yang ramah anak
2. Cerita maksimal 60 kata
3. Berikan panduan lembut tanpa menggurui
4. JANGAN meminta informasi pribadi (nama, alamat, sekolah)
5. JANGAN gunakan topik dewasa (pinjaman, kartu kredit, investasi kompleks)
6. Fokus pada situasi sehari-hari anak (jajan, menabung, berbagi)

Format respons dalam JSON:
{
    "scenario": "Cerita situasi keuangan (maks 60 kata)",
    "choices": [
        "Pilihan pertama",
        "Pilihan kedua",
        "Pilihan ketiga"
    ]
}"""
    
    def _build_user_prompt(self, request: GenerateAdventureRequest) -> str:
        """
        Build the user prompt for scenario generation.
        
        Args:
            request: The generation request with user context
            
        Returns:
            Formatted prompt string
        """
        # Calculate daily allowance from weekly allowance
        daily_allowance = request.allowance / 7
        
        prompt = f"""Buat cerita petualangan uang untuk anak:

Konteks Pengguna:
- Usia: {request.user_age} tahun
- Uang saku harian: Rp {daily_allowance:,.0f}"""
        
        if request.goal_context:
            prompt += f"\n- Tujuan menabung: {request.goal_context}"
        
        if request.recent_activities:
            activities_str = ", ".join(request.recent_activities[:3])  # Limit to 3
            prompt += f"\n- Aktivitas terakhir: {activities_str}"
        
        prompt += """

Buat cerita yang:
1. Sesuai usia dan relatable untuk anak Indonesia
2. Melibatkan jumlah uang yang masuk akal (sekitar uang saku mereka)
3. Mengajarkan keputusan keuangan
4. Memberikan 3 pilihan berbeda (menabung, membelanjakan, berbagi, dll)
5. Maksimal 60 kata untuk cerita

Contoh situasi yang baik:
- Menemukan uang di jalan
- Mendapat hadiah uang dari kakek/nenek
- Teman mengajak jajan
- Melihat mainan/buku yang diinginkan
- Ada teman yang membutuhkan bantuan

Berikan respons dalam format JSON yang diminta!"""
        
        return prompt
    
    async def generate(self, request: GenerateAdventureRequest) -> tuple[str, list[str]]:
        """
        Generate a money adventure scenario with choices.
        
        Args:
            request: The generation request with user context
            
        Returns:
            Tuple of (scenario text, list of choices)
            
        Raises:
            ValueError: If LLM response cannot be parsed
            Exception: If LLM call fails
        """
        try:
            daily_allowance = request.allowance / 7
            logger.info(
                f"Generating Indonesian scenario for age {request.user_age}, "
                f"daily allowance Rp {daily_allowance:,.0f}"
            )
            
            # Build prompts
            system_prompt = self._build_system_prompt()
            user_prompt = self._build_user_prompt(request)
            
            # Call LLM
            response_text = await self.llm_provider.generate_completion(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            )
            
            # Parse JSON response
            try:
                data = json.loads(response_text)
                scenario = data.get("scenario", "")
                choices = data.get("choices", [])
                
                if not scenario or not choices:
                    raise ValueError("Missing scenario or choices in response")
                
                if len(choices) < 2:
                    raise ValueError("Must have at least 2 choices")
                
                # Validate story length (60 words max)
                word_count = len(scenario.split())
                if word_count > 70:  # Allow some flexibility
                    logger.warning(f"Story exceeds 60 words: {word_count} words")
                
                logger.info(
                    f"Successfully generated Indonesian scenario with {len(choices)} choices "
                    f"({word_count} words)"
                )
                return scenario, choices
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                logger.debug(f"Response content: {response_text}")
                raise ValueError(f"Invalid JSON response from LLM: {e}")
        
        except Exception as e:
            logger.error(f"Failed to generate scenario: {e}")
            raise
