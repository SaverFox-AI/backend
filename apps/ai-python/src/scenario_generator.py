"""Scenario generation using LLM for money adventures."""

import logging
from typing import Optional

from src.config import settings
from src.models import GenerateAdventureRequest
from src.llm_provider import get_llm_provider
from src.json_utils import extract_json

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
            ValueError: If LLM response cannot be parsed or validation fails
            Exception: If LLM call fails
        """
        daily_allowance = request.allowance / 7
        logger.info(
            f"Generating Indonesian scenario for age {request.user_age}, "
            f"daily allowance Rp {daily_allowance:,.0f}"
        )
        
        # Build prompts
        system_prompt = self._build_system_prompt()
        user_prompt = self._build_user_prompt(request)
        
        # Try generation with retry for word limit
        max_attempts = 2
        for attempt in range(max_attempts):
            try:
                # Call LLM
                response_text = await self.llm_provider.generate_completion(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                )
                
                # Extract JSON from response
                data = extract_json(response_text)
                if not data:
                    logger.error("json_parse_failed: Could not extract JSON from LLM response")
                    if attempt < max_attempts - 1:
                        logger.info("Retrying with repair prompt...")
                        user_prompt += "\n\nPERINGATAN: Respons sebelumnya gagal di-parse. Berikan HANYA JSON yang valid tanpa teks tambahan!"
                        continue
                    raise ValueError("Failed to extract valid JSON from LLM response")
                
                scenario = data.get("scenario", "")
                choices = data.get("choices", [])
                
                if not scenario or not choices:
                    raise ValueError("Missing scenario or choices in response")
                
                if len(choices) < 2:
                    raise ValueError("Must have at least 2 choices")
                
                # Validate story length (60 words max)
                word_count = len(scenario.split())
                
                if word_count > 70:
                    logger.warning(f"constraint_violation: Story exceeds 60 words ({word_count} words)")
                    
                    if attempt < max_attempts - 1:
                        # Retry with stricter prompt
                        logger.info("Regenerating with stricter word limit...")
                        user_prompt += f"\n\nPENTING: Cerita sebelumnya terlalu panjang ({word_count} kata). Buat cerita MAKSIMAL 60 kata!"
                        continue
                    else:
                        # Last attempt - log but accept
                        logger.error(f"Story still too long after {max_attempts} attempts: {word_count} words")
                
                logger.info(
                    f"Successfully generated Indonesian scenario with {len(choices)} choices "
                    f"({word_count} words) on attempt {attempt + 1}"
                )
                return scenario, choices
                
            except ValueError as e:
                if attempt < max_attempts - 1:
                    logger.warning(f"Attempt {attempt + 1} failed: {e}, retrying...")
                    continue
                else:
                    logger.error(f"All {max_attempts} attempts failed")
                    raise
            except Exception as e:
                logger.error(f"Failed to generate scenario: {e}")
                raise
