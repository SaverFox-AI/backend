"""Choice evaluation using LLM for money adventure decisions."""

import logging
from typing import Optional

from src.config import settings
from src.models import EvaluateChoiceRequest, Scores
from src.llm_provider import get_llm_provider
from src.json_utils import extract_json

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
            ValueError: If LLM response cannot be parsed or scores are invalid
            Exception: If LLM call fails
        """
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
        
        # Extract JSON from response
        data = extract_json(response_text)
        if not data:
            logger.error("eval_parse_failed: Could not extract JSON from LLM response")
            raise ValueError("Failed to extract valid JSON from evaluation response")
        
        feedback = data.get("feedback", "")
        scores_data = data.get("scores", {})
        
        if not feedback or not scores_data:
            logger.error("eval_parse_failed: Missing feedback or scores in response")
            raise ValueError("Missing feedback or scores in response")
        
        # Validate and create Scores object
        # If any score is missing, treat as evaluation failure
        try:
            age_app = scores_data.get("age_appropriateness")
            goal_align = scores_data.get("goal_alignment")
            fin_reason = scores_data.get("financial_reasoning")
            
            if age_app is None or goal_align is None or fin_reason is None:
                logger.error("eval_parse_failed: Missing score fields")
                raise ValueError("Missing required score fields")
            
            scores = Scores(
                age_appropriateness=float(age_app),
                goal_alignment=float(goal_align),
                financial_reasoning=float(fin_reason),
            )
            
            logger.info(
                f"Successfully evaluated choice with scores: "
                f"age={scores.age_appropriateness:.2f}, "
                f"goal={scores.goal_alignment:.2f}, "
                f"reasoning={scores.financial_reasoning:.2f}"
            )
            
            return feedback, scores
            
        except (ValueError, TypeError) as e:
            logger.error(f"eval_parse_failed: Invalid scores in response: {e}")
            raise ValueError(f"Invalid scores in response: {e}")
