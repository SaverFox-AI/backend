"""
SaverFox Money Adventure Experiment Runner

This script runs evaluation experiments using Opik to compare prompt versions
for the SaverFox AI service. It processes the evaluation dataset, calls the
/generate and /evaluate endpoints, and logs results to Opik experiments.

Usage:
    poetry run python experiment_runner.py --experiment-name "baseline-v1"
    poetry run python experiment_runner.py --experiment-name "improved-prompts-v2" --dataset eval_dataset.jsonl
"""

import asyncio
import json
import logging
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import statistics

import httpx
from opik import Opik
from opik.evaluation import evaluate
from opik.evaluation.metrics import base_metric

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AdventureExperiment:
    """Runs experiments on the SaverFox AI service with Opik tracking."""
    
    def __init__(
        self,
        ai_service_url: str = "http://localhost:8000",
        dataset_path: str = "eval_dataset.jsonl",
        experiment_name: Optional[str] = None,
        timeout: int = 60
    ):
        """
        Initialize the experiment runner.
        
        Args:
            ai_service_url: Base URL of the AI service
            dataset_path: Path to the JSONL dataset file
            experiment_name: Name for the Opik experiment
            timeout: HTTP request timeout in seconds
        """
        self.ai_service_url = ai_service_url.rstrip('/')
        self.dataset_path = Path(dataset_path)
        self.experiment_name = experiment_name or f"saverfox-eval-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        self.timeout = timeout
        
        # Initialize Opik client
        self.opik_client = Opik()
        logger.info(f"Initialized Opik client for experiment: {self.experiment_name}")
        
        # HTTP client for API calls
        self.http_client = httpx.AsyncClient(timeout=timeout)
        
        # Results storage
        self.results: List[Dict[str, Any]] = []
    
    def load_dataset(self) -> List[Dict[str, Any]]:
        """
        Load the evaluation dataset from JSONL file.
        
        Returns:
            List of dataset items
        """
        if not self.dataset_path.exists():
            raise FileNotFoundError(f"Dataset file not found: {self.dataset_path}")
        
        dataset = []
        with open(self.dataset_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                # Skip empty lines and comments
                if not line or line.startswith('#'):
                    continue
                
                try:
                    item = json.loads(line)
                    dataset.append(item)
                except json.JSONDecodeError as e:
                    logger.warning(f"Skipping invalid JSON at line {line_num}: {e}")
        
        logger.info(f"Loaded {len(dataset)} items from dataset")
        return dataset
    
    async def call_generate(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call the /generate endpoint with dataset item.
        
        Args:
            item: Dataset item with user context
            
        Returns:
            Generation response with scenario, choices, and trace_id
        """
        request_data = {
            "user_age": item["user_age"],
            "allowance": item["allowance"],
            "goal_context": item.get("goal_context"),
            "recent_activities": item.get("recent_activities", [])
        }
        
        try:
            response = await self.http_client.post(
                f"{self.ai_service_url}/api/adventure/generate",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to call /generate for item {item['id']}: {e}")
            raise
    
    async def call_evaluate(
        self,
        scenario: str,
        choice_index: int,
        choice_text: str,
        user_age: int,
        amounts: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Call the /evaluate endpoint with choice.
        
        Args:
            scenario: The generated scenario
            choice_index: Index of the selected choice
            choice_text: Text of the selected choice
            user_age: User's age
            amounts: Optional amounts dictionary
            
        Returns:
            Evaluation response with feedback, scores, and trace_id
        """
        request_data = {
            "scenario": scenario,
            "choice_index": choice_index,
            "choice_text": choice_text,
            "user_age": user_age,
            "amounts": amounts
        }
        
        try:
            response = await self.http_client.post(
                f"{self.ai_service_url}/api/adventure/evaluate",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to call /evaluate: {e}")
            raise
    
    async def run_single_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run a single dataset item through generate and evaluate.
        
        Args:
            item: Dataset item
            
        Returns:
            Result dictionary with all data and metrics
        """
        item_id = item["id"]
        logger.info(f"Processing item {item_id}: age={item['user_age']}, habit={item['habit_tag']}")
        
        result = {
            "item_id": item_id,
            "input": item,
            "success": False,
            "error": None,
            "generation": None,
            "evaluation": None,
            "metrics": {}
        }
        
        try:
            # Step 1: Generate scenario
            gen_response = await self.call_generate(item)
            result["generation"] = gen_response
            
            scenario = gen_response["scenario"]
            choices = gen_response["choices"]
            gen_trace_id = gen_response.get("opik_trace_id")
            
            # Validate scenario length (60 words max)
            word_count = len(scenario.split())
            result["metrics"]["scenario_word_count"] = word_count
            result["metrics"]["scenario_length_valid"] = word_count <= 70  # Allow some flexibility
            
            # Step 2: Evaluate each choice
            evaluations = []
            for idx, choice_text in enumerate(choices):
                eval_response = await self.call_evaluate(
                    scenario=scenario,
                    choice_index=idx,
                    choice_text=choice_text,
                    user_age=item["user_age"],
                    amounts=None  # Could be enhanced with mock amounts
                )
                evaluations.append(eval_response)
            
            result["evaluation"] = evaluations
            
            # Step 3: Compute aggregate metrics
            all_scores = [eval_resp["scores"] for eval_resp in evaluations]
            
            # Average scores across all choices
            result["metrics"]["mean_age_appropriateness"] = statistics.mean(
                [s["age_appropriateness"] for s in all_scores]
            )
            result["metrics"]["mean_goal_alignment"] = statistics.mean(
                [s["goal_alignment"] for s in all_scores]
            )
            result["metrics"]["mean_financial_reasoning"] = statistics.mean(
                [s["financial_reasoning"] for s in all_scores]
            )
            
            # Check for failures (age_appropriateness < 0.7)
            result["metrics"]["has_failure"] = any(
                s["age_appropriateness"] < 0.7 for s in all_scores
            )
            
            # Store trace IDs
            result["metrics"]["generation_trace_id"] = gen_trace_id
            result["metrics"]["evaluation_trace_ids"] = [
                e.get("opik_trace_id") for e in evaluations
            ]
            
            result["success"] = True
            logger.info(
                f"✓ Item {item_id} completed: "
                f"age_app={result['metrics']['mean_age_appropriateness']:.2f}, "
                f"goal_align={result['metrics']['mean_goal_alignment']:.2f}, "
                f"fin_reason={result['metrics']['mean_financial_reasoning']:.2f}"
            )
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"✗ Item {item_id} failed: {e}")
        
        return result
    
    async def run_experiment(self) -> Dict[str, Any]:
        """
        Run the full experiment on all dataset items.
        
        Returns:
            Experiment summary with aggregate metrics
        """
        logger.info(f"Starting experiment: {self.experiment_name}")
        logger.info(f"AI Service URL: {self.ai_service_url}")
        
        # Load dataset
        dataset = self.load_dataset()
        
        # Process all items
        for item in dataset:
            result = await self.run_single_item(item)
            self.results.append(result)
        
        # Compute aggregate metrics
        successful_results = [r for r in self.results if r["success"]]
        failed_count = len(self.results) - len(successful_results)
        
        if not successful_results:
            logger.error("No successful results to aggregate!")
            return {
                "experiment_name": self.experiment_name,
                "total_items": len(dataset),
                "successful": 0,
                "failed": failed_count,
                "error": "All items failed"
            }
        
        # Aggregate metrics
        summary = {
            "experiment_name": self.experiment_name,
            "timestamp": datetime.now().isoformat(),
            "total_items": len(dataset),
            "successful": len(successful_results),
            "failed": failed_count,
            "metrics": {
                "mean_age_appropriateness": statistics.mean(
                    [r["metrics"]["mean_age_appropriateness"] for r in successful_results]
                ),
                "mean_goal_alignment": statistics.mean(
                    [r["metrics"]["mean_goal_alignment"] for r in successful_results]
                ),
                "mean_financial_reasoning": statistics.mean(
                    [r["metrics"]["mean_financial_reasoning"] for r in successful_results]
                ),
                "failure_rate": sum(
                    1 for r in successful_results if r["metrics"]["has_failure"]
                ) / len(successful_results),
                "mean_scenario_word_count": statistics.mean(
                    [r["metrics"]["scenario_word_count"] for r in successful_results]
                ),
                "scenario_length_compliance": sum(
                    1 for r in successful_results if r["metrics"]["scenario_length_valid"]
                ) / len(successful_results)
            },
            "breakdown_by_age": self._compute_age_breakdown(successful_results),
            "breakdown_by_habit": self._compute_habit_breakdown(successful_results),
            "breakdown_by_deadline": self._compute_deadline_breakdown(successful_results)
        }
        
        logger.info("=" * 80)
        logger.info(f"EXPERIMENT SUMMARY: {self.experiment_name}")
        logger.info("=" * 80)
        logger.info(f"Total Items: {summary['total_items']}")
        logger.info(f"Successful: {summary['successful']}")
        logger.info(f"Failed: {summary['failed']}")
        logger.info("")
        logger.info("AGGREGATE METRICS:")
        logger.info(f"  Mean Age Appropriateness: {summary['metrics']['mean_age_appropriateness']:.3f}")
        logger.info(f"  Mean Goal Alignment: {summary['metrics']['mean_goal_alignment']:.3f}")
        logger.info(f"  Mean Financial Reasoning: {summary['metrics']['mean_financial_reasoning']:.3f}")
        logger.info(f"  Failure Rate (<0.7 age_app): {summary['metrics']['failure_rate']:.1%}")
        logger.info(f"  Mean Scenario Word Count: {summary['metrics']['mean_scenario_word_count']:.1f}")
        logger.info(f"  Scenario Length Compliance: {summary['metrics']['scenario_length_compliance']:.1%}")
        logger.info("=" * 80)
        
        return summary
    
    def _compute_age_breakdown(self, results: List[Dict[str, Any]]) -> Dict[int, Dict[str, float]]:
        """Compute metrics breakdown by age group."""
        age_groups = {}
        for result in results:
            age = result["input"]["user_age"]
            if age not in age_groups:
                age_groups[age] = []
            age_groups[age].append(result)
        
        breakdown = {}
        for age, group_results in age_groups.items():
            breakdown[age] = {
                "count": len(group_results),
                "mean_age_appropriateness": statistics.mean(
                    [r["metrics"]["mean_age_appropriateness"] for r in group_results]
                ),
                "mean_goal_alignment": statistics.mean(
                    [r["metrics"]["mean_goal_alignment"] for r in group_results]
                ),
                "mean_financial_reasoning": statistics.mean(
                    [r["metrics"]["mean_financial_reasoning"] for r in group_results]
                )
            }
        
        return breakdown
    
    def _compute_habit_breakdown(self, results: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """Compute metrics breakdown by habit tag."""
        habit_groups = {}
        for result in results:
            habit = result["input"]["habit_tag"]
            if habit not in habit_groups:
                habit_groups[habit] = []
            habit_groups[habit].append(result)
        
        breakdown = {}
        for habit, group_results in habit_groups.items():
            breakdown[habit] = {
                "count": len(group_results),
                "mean_age_appropriateness": statistics.mean(
                    [r["metrics"]["mean_age_appropriateness"] for r in group_results]
                ),
                "mean_goal_alignment": statistics.mean(
                    [r["metrics"]["mean_goal_alignment"] for r in group_results]
                ),
                "mean_financial_reasoning": statistics.mean(
                    [r["metrics"]["mean_financial_reasoning"] for r in group_results]
                )
            }
        
        return breakdown
    
    def _compute_deadline_breakdown(self, results: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
        """Compute metrics breakdown by goal deadline."""
        deadline_groups = {}
        for result in results:
            deadline = result["input"]["goal_deadline"]
            if deadline not in deadline_groups:
                deadline_groups[deadline] = []
            deadline_groups[deadline].append(result)
        
        breakdown = {}
        for deadline, group_results in deadline_groups.items():
            breakdown[deadline] = {
                "count": len(group_results),
                "mean_age_appropriateness": statistics.mean(
                    [r["metrics"]["mean_age_appropriateness"] for r in group_results]
                ),
                "mean_goal_alignment": statistics.mean(
                    [r["metrics"]["mean_goal_alignment"] for r in group_results]
                ),
                "mean_financial_reasoning": statistics.mean(
                    [r["metrics"]["mean_financial_reasoning"] for r in group_results]
                )
            }
        
        return breakdown
    
    def save_results(self, output_path: str = "experiment_results.json") -> None:
        """
        Save experiment results to JSON file.
        
        Args:
            output_path: Path to save results
        """
        output_data = {
            "experiment_name": self.experiment_name,
            "timestamp": datetime.now().isoformat(),
            "results": self.results
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results saved to: {output_path}")
    
    async def cleanup(self) -> None:
        """Cleanup resources."""
        await self.http_client.aclose()


async def main():
    """Main entry point for the experiment runner."""
    parser = argparse.ArgumentParser(
        description="Run SaverFox Money Adventure evaluation experiments"
    )
    parser.add_argument(
        "--experiment-name",
        type=str,
        help="Name for the Opik experiment",
        default=None
    )
    parser.add_argument(
        "--dataset",
        type=str,
        help="Path to the JSONL dataset file",
        default="eval_dataset.jsonl"
    )
    parser.add_argument(
        "--ai-service-url",
        type=str,
        help="Base URL of the AI service",
        default="http://localhost:8000"
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Path to save results JSON",
        default="experiment_results.json"
    )
    parser.add_argument(
        "--timeout",
        type=int,
        help="HTTP request timeout in seconds",
        default=60
    )
    
    args = parser.parse_args()
    
    # Create experiment runner
    experiment = AdventureExperiment(
        ai_service_url=args.ai_service_url,
        dataset_path=args.dataset,
        experiment_name=args.experiment_name,
        timeout=args.timeout
    )
    
    try:
        # Run experiment
        summary = await experiment.run_experiment()
        
        # Save results
        experiment.save_results(args.output)
        
        logger.info(f"\n✓ Experiment completed successfully!")
        logger.info(f"  View traces in Opik dashboard: https://www.comet.com/opik")
        logger.info(f"  Results saved to: {args.output}")
        
    except Exception as e:
        logger.error(f"Experiment failed: {e}", exc_info=True)
        return 1
    finally:
        await experiment.cleanup()
    
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
