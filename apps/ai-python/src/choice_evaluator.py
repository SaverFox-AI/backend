"""Choice evaluation using LLM for money adventure decisions."""

import json
import logging
from typing import Optional

from src.config import settings
from src.models import EvaluateChoiceRequest, Scores
from src.llm_provider import get_llm_provider

logger = logging.getLogger(__name__)


class ChoiceEvaluator:
    """Evaluates player choices and generates educational feedback using LLM."""
    
    def __init__(self) -> None:
        """Initialize the LLM provider."""
        self.llm_provider = get_llm_provider()
        logger.info(f"ChoiceEvaluator initialized with {settings.llm_provider} provider")
    
    def _build_system_prompt(self) -> str:
        """
        Build the system prompt for choice evaluation.
        
        Returns:
            System prompt string
        """
        return """Kamu adalah pendidik literasi keuangan yang mengevaluasi keputusan uang anak-anak Indonesia.

ATURAN PENTING:
1. Gunakan bahasa Indonesia yang ramah dan mendukung
2. Berikan feedback maksimal 2-3 kalimat
3. Fokus pada hal positif dari pilihan mereka
4. Berikan saran perbaikan dengan lembut (jika perlu)
5. JANGAN menghakimi atau membuat anak merasa buruk
6. Bersikap positif dan edukatif

Evaluasi pilihan dengan 3 dimensi (skor 0.0 - 1.0):
- age_appropriateness: Seberapa sesuai keputusan ini untuk usia anak?
- goal_alignment: Seberapa sejalan dengan tujuan menabung mereka?
- financial_reasoning: Seberapa baik penalaran keuangan dalam keputusan ini?

Format respons dalam JSON:
{
    "feedback": "Feedback yang mendukung dan edukatif (2-3 kalimat)",
    "scores": {
        "age_appropriateness": 0.85,
        "goal_alignment": 0.75,
        "financial_reasoning": 0.90
    }
}"""
    
    def _build_user_prompt(self, request: EvaluateChoiceRequest) -> str:
        """
        Build the user prompt for choice evaluation.
        
        Args:
            request: The evaluation request with scenario and choice
            
        Returns:
            Formatted prompt string
        """
        prompt = f"""Evaluasi keputusan anak ini:

Cerita:
{request.scenario}

Konteks Pengguna:
- Usia: {request.user_age} tahun
- Pilihan yang dibuat: {request.choice_text}"""
        
        if request.amounts:
            amounts_str = ", ".join([f"{k}: Rp {v:,.0f}" for k, v in request.amounts.items()])
            prompt += f"\n- Jumlah terkait: {amounts_str}"
        
        prompt += """

Berikan evaluasi yang:
1. Mendukung dan positif
2. Menyoroti aspek baik dari pilihan
3. Memberikan saran lembut untuk perbaikan (jika ada)
4. Sesuai dengan usia anak
5. Mendorong pembelajaran tanpa menghakimi

Pertimbangkan:
- Apakah pilihan ini masuk akal untuk usia mereka?
- Apakah sejalan dengan tujuan menabung (jika ada)?
- Apakah menunjukkan pemikiran keuangan yang baik?

Berikan respons dalam format JSON yang diminta!"""
        
        return prompt
    
    async def evaluate(self, request: EvaluateChoiceRequest) -> tuple[str, Scores]:
        """
        Evaluate a player's choice and generate feedback with scores.
        
        Args:
            request: The evaluation request with scenario and choice
            
        Returns:
            Tuple of (feedback text, scores object)
            
        Raises:
            ValueError: If LLM response cannot be parsed
            Exception: If LLM call fails
        """
        try:
            logger.info(
                f"Evaluating Indonesian choice for age {request.user_age}: "
                f"'{request.choice_text[:50]}...'"
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
                feedback = data.get("feedback", "")
                scores_data = data.get("scores", {})
                
                if not feedback or not scores_data:
                    raise ValueError("Missing feedback or scores in response")
                
                # Validate and create Scores object with new metrics
                scores = Scores(
                    age_appropriateness=scores_data.get("age_appropriateness", 0.5),
                    goal_alignment=scores_data.get("goal_alignment", 0.5),
                    financial_reasoning=scores_data.get("financial_reasoning", 0.5),
                )
                
                logger.info(
                    f"Successfully evaluated choice with scores: "
                    f"age={scores.age_appropriateness:.2f}, "
                    f"goal={scores.goal_alignment:.2f}, "
                    f"reasoning={scores.financial_reasoning:.2f}"
                )
                
                return feedback, scores
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                logger.debug(f"Response content: {response_text}")
                raise ValueError(f"Invalid JSON response from LLM: {e}")
            
            except Exception as e:
                logger.error(f"Failed to create Scores object: {e}")
                raise ValueError(f"Invalid scores in response: {e}")
        
        except Exception as e:
            logger.error(f"Failed to evaluate choice: {e}")
            raise
