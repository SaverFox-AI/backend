# SaverFox Money Adventure Evaluation Experiment Guide

This guide explains how to run evaluation experiments to compare prompt versions for the SaverFox AI service using Opik.

## Overview

The experiment system consists of:
1. **Evaluation Dataset** (`eval_dataset.jsonl`): 50 test cases with varying user profiles
2. **Experiment Runner** (`experiment_runner.py`): Script that runs generate/evaluate cycles and logs to Opik
3. **Opik Dashboard**: Web interface to view traces, metrics, and compare experiments

## Dataset Structure

The `eval_dataset.jsonl` file contains 50 test cases with variations across:

### Age Groups (4 levels)
- **6 years**: Early childhood, simple concepts
- **8 years**: Elementary school, basic financial decisions
- **10 years**: Pre-teen, more complex scenarios
- **12 years**: Early teen, advanced financial reasoning

### Allowance Levels (3 levels)
- **Rp 35,000/week** (Rp 5,000/day): Lower allowance
- **Rp 70,000/week** (Rp 10,000/day): Medium allowance
- **Rp 210,000/week** (Rp 30,000/day): Higher allowance

### Habit Tags (3 types)
- **impulsive**: Tends to spend immediately
- **saver**: Tends to save consistently
- **balanced**: Mix of spending and saving

### Goal Deadlines (3 types)
- **near**: 1-3 weeks (urgent goals)
- **medium**: 1-3 months (moderate timeline)
- **far**: 4+ months (long-term goals)

### Example Dataset Item

```json
{
  "id": "test_001",
  "user_age": 6,
  "allowance": 35000,
  "habit_tag": "impulsive",
  "goal_context": "Menabung untuk mainan robot (deadline: 2 minggu)",
  "goal_deadline": "near",
  "recent_activities": ["Membeli permen Rp 2.000", "Jajan es krim Rp 5.000"]
}
```

## Prerequisites

1. **AI Service Running**: Ensure the SaverFox AI service is running
   ```bash
   cd backend/apps/ai-python
   poetry run python -m src.main
   ```

2. **Environment Variables**: Configure your `.env` file with:
   - `LLM_PROVIDER`: "openai" or "gemini"
   - `OPENAI_API_KEY` or `GEMINI_API_KEY`: Your LLM API key
   - `OPIK_API_KEY`: Your Opik API key from Comet
   - `OPIK_PROJECT_NAME`: Project name (e.g., "money-adventures")

3. **Dependencies**: Install required packages
   ```bash
   poetry install
   ```

## Running Experiments

### Basic Usage

Run an experiment with default settings:

```bash
poetry run python experiment_runner.py --experiment-name "baseline-v1"
```

### Advanced Options

```bash
poetry run python experiment_runner.py \
  --experiment-name "improved-prompts-v2" \
  --dataset eval_dataset.jsonl \
  --ai-service-url http://localhost:8000 \
  --output results_v2.json \
  --timeout 60
```

### Command-Line Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--experiment-name` | Name for the Opik experiment | Auto-generated timestamp |
| `--dataset` | Path to JSONL dataset file | `eval_dataset.jsonl` |
| `--ai-service-url` | Base URL of AI service | `http://localhost:8000` |
| `--output` | Path to save results JSON | `experiment_results.json` |
| `--timeout` | HTTP request timeout (seconds) | 60 |

## Experiment Workflow

For each dataset item, the experiment runner:

1. **Generate Scenario**: Calls `/api/adventure/generate` with user context
2. **Evaluate All Choices**: Calls `/api/adventure/evaluate` for each choice
3. **Compute Metrics**: Calculates aggregate scores
4. **Log to Opik**: Traces are automatically logged via the AI service

## Metrics Computed

### Per-Item Metrics

- **scenario_word_count**: Number of words in generated scenario
- **scenario_length_valid**: Whether scenario ≤ 70 words
- **mean_age_appropriateness**: Average across all choices (0.0-1.0)
- **mean_goal_alignment**: Average across all choices (0.0-1.0)
- **mean_financial_reasoning**: Average across all choices (0.0-1.0)
- **has_failure**: Whether any choice has age_appropriateness < 0.7

### Aggregate Metrics

- **mean_age_appropriateness**: Overall average across all items
- **mean_goal_alignment**: Overall average across all items
- **mean_financial_reasoning**: Overall average across all items
- **failure_rate**: Percentage of items with age_appropriateness < 0.7
- **mean_scenario_word_count**: Average scenario length
- **scenario_length_compliance**: Percentage of scenarios ≤ 70 words

### Breakdown Metrics

The experiment also computes breakdowns by:
- **Age Group**: Metrics for each age (6, 8, 10, 12)
- **Habit Tag**: Metrics for each habit (impulsive, saver, balanced)
- **Goal Deadline**: Metrics for each deadline type (near, medium, far)

## Example Output

```
================================================================================
EXPERIMENT SUMMARY: baseline-v1
================================================================================
Total Items: 50
Successful: 50
Failed: 0

AGGREGATE METRICS:
  Mean Age Appropriateness: 0.847
  Mean Goal Alignment: 0.792
  Mean Financial Reasoning: 0.815
  Failure Rate (<0.7 age_app): 8.0%
  Mean Scenario Word Count: 58.3
  Scenario Length Compliance: 96.0%
================================================================================
```

## Viewing Results in Opik Dashboard

### 1. Access Opik Dashboard

Visit: https://www.comet.com/opik

Login with your Comet account credentials.

### 2. Navigate to Your Project

- Select your workspace (configured in `OPIK_WORKSPACE`)
- Select your project (configured in `OPIK_PROJECT_NAME`)

### 3. View Traces

**Generation Traces:**
- Trace Name: `saverfox.money_adventure.generate`
- Metadata: user_age, allowance_daily, goal_context, language, max_story_words
- Tags: generation, indonesian, age_{user_age}
- Output: scenario, choices, word_count

**Evaluation Traces:**
- Trace Name: `saverfox.money_adventure.evaluate`
- Metadata: user_age, choice, expense_amount, saving_amount, goal_name, language
- Tags: evaluation, indonesian, age_{user_age}
- Output: feedback, scores
- Feedback Scores: age_appropriateness, goal_alignment, financial_reasoning

### 4. Compare Experiments

To compare two prompt versions:

1. Run baseline experiment:
   ```bash
   poetry run python experiment_runner.py --experiment-name "baseline-v1"
   ```

2. Modify prompts in `src/scenario_generator.py` or `src/choice_evaluator.py`

3. Run improved experiment:
   ```bash
   poetry run python experiment_runner.py --experiment-name "improved-v2"
   ```

4. In Opik dashboard:
   - Go to "Experiments" tab
   - Select both experiments
   - Click "Compare"
   - View side-by-side metrics

### 5. Key Metrics to Monitor

**Quality Metrics:**
- Age appropriateness scores by age group
- Goal alignment for different deadline types
- Financial reasoning for different habit tags

**Compliance Metrics:**
- Scenario length (should be ≤ 60 words)
- Response format validity
- Error rates

**Performance Metrics:**
- Response time (from Opik traces)
- Token usage (from LLM provider)
- Success rate

## Interpreting Results

### Good Performance Indicators

✅ **Age Appropriateness > 0.8**: Scenarios are well-suited for target age
✅ **Goal Alignment > 0.75**: Choices align with user's savings goals
✅ **Financial Reasoning > 0.75**: Choices demonstrate good financial thinking
✅ **Failure Rate < 10%**: Very few inappropriate scenarios
✅ **Scenario Length Compliance > 95%**: Most scenarios meet word limit

### Areas for Improvement

⚠️ **Age Appropriateness < 0.7**: Scenarios may be too complex or simple
⚠️ **Goal Alignment < 0.6**: Choices don't align with user goals
⚠️ **High Failure Rate (>15%)**: Many scenarios are inappropriate
⚠️ **Low Compliance (<90%)**: Scenarios are too long

### Breakdown Analysis

**By Age Group:**
- Check if younger ages (6-8) have lower appropriateness scores
- Verify older ages (10-12) have more complex scenarios

**By Habit Tag:**
- Ensure "impulsive" users get guidance on saving
- Verify "saver" users get encouragement
- Check "balanced" users get nuanced feedback

**By Deadline:**
- "Near" deadlines should emphasize urgency
- "Far" deadlines should focus on long-term planning
- "Medium" deadlines should balance both

## Prompt Iteration Workflow

1. **Baseline**: Run experiment with current prompts
2. **Analyze**: Review Opik dashboard and identify weak areas
3. **Iterate**: Modify prompts in `scenario_generator.py` or `choice_evaluator.py`
4. **Test**: Run new experiment with updated prompts
5. **Compare**: Use Opik to compare metrics side-by-side
6. **Repeat**: Continue iterating until metrics meet targets

### Example Prompt Improvements

**If age appropriateness is low for young children (6-8):**
- Add more explicit age-appropriate language guidance
- Include examples of simple scenarios
- Emphasize avoiding complex financial concepts

**If goal alignment is low:**
- Strengthen the goal context in prompts
- Add explicit instructions to consider user's savings goal
- Include goal deadline in scenario generation

**If scenarios are too long:**
- Add stricter word count enforcement
- Provide examples of concise scenarios
- Add post-processing to truncate if needed

## Troubleshooting

### AI Service Connection Issues

```bash
# Check if service is running
curl http://localhost:8000/health

# View service logs
poetry run python -m src.main
```

### Opik Connection Issues

```bash
# Verify Opik API key
echo $OPIK_API_KEY

# Check Opik configuration
poetry run python -c "from opik import Opik; client = Opik(); print('Connected!')"
```

### Dataset Issues

```bash
# Validate dataset format
poetry run python -c "
import json
with open('eval_dataset.jsonl') as f:
    for i, line in enumerate(f, 1):
        if line.strip() and not line.startswith('#'):
            json.loads(line)
print('Dataset valid!')
"
```

### Timeout Issues

If requests are timing out:
- Increase timeout: `--timeout 120`
- Check LLM provider rate limits
- Verify network connectivity

## Advanced Usage

### Custom Dataset

Create your own dataset with specific test cases:

```jsonl
{"id": "custom_001", "user_age": 7, "allowance": 50000, "habit_tag": "saver", "goal_context": "Menabung untuk buku", "goal_deadline": "near", "recent_activities": ["Menabung Rp 7.000"]}
{"id": "custom_002", "user_age": 11, "allowance": 150000, "habit_tag": "balanced", "goal_context": "Menabung untuk sepatu", "goal_deadline": "medium", "recent_activities": ["Jajan Rp 12.000", "Menabung Rp 15.000"]}
```

Run with custom dataset:
```bash
poetry run python experiment_runner.py --dataset my_custom_dataset.jsonl --experiment-name "custom-test"
```

### Batch Experiments

Run multiple experiments in sequence:

```bash
#!/bin/bash
# run_experiments.sh

experiments=("baseline-v1" "improved-v2" "optimized-v3")

for exp in "${experiments[@]}"; do
  echo "Running experiment: $exp"
  poetry run python experiment_runner.py \
    --experiment-name "$exp" \
    --output "results_${exp}.json"
  sleep 5  # Rate limiting
done

echo "All experiments completed!"
```

### Analyzing Results Programmatically

```python
import json

# Load results
with open('experiment_results.json') as f:
    data = json.load(f)

# Analyze specific metrics
for result in data['results']:
    if result['success']:
        metrics = result['metrics']
        if metrics['mean_age_appropriateness'] < 0.7:
            print(f"Low score for item: {result['item_id']}")
            print(f"  Age: {result['input']['user_age']}")
            print(f"  Scenario: {result['generation']['scenario'][:100]}...")
```

## Best Practices

1. **Run Baseline First**: Always establish a baseline before making changes
2. **One Change at a Time**: Modify one aspect of prompts per experiment
3. **Document Changes**: Use descriptive experiment names (e.g., "baseline-v1", "shorter-scenarios-v2")
4. **Review Traces**: Don't just look at aggregate metrics—review individual traces in Opik
5. **Test Edge Cases**: Pay attention to extreme ages (6 and 12) and deadline types
6. **Monitor Compliance**: Ensure scenarios meet length and format requirements
7. **Iterate Gradually**: Make small, incremental improvements rather than large changes

## Next Steps

After running experiments:

1. **Review Opik Dashboard**: Analyze traces and identify patterns
2. **Iterate Prompts**: Make targeted improvements based on metrics
3. **A/B Testing**: Run experiments with different prompt versions
4. **Production Deployment**: Deploy the best-performing prompt version
5. **Continuous Monitoring**: Set up ongoing evaluation with new test cases

## Support

For issues or questions:
- Check Opik documentation: https://www.comet.com/docs/opik
- Review AI service logs for errors
- Verify environment configuration in `.env`

## License

MIT
