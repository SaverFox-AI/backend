# SaverFox AI Evaluation System - Summary

## 📦 What Was Created

This evaluation system enables systematic testing and comparison of prompt versions for the SaverFox Money Adventure AI service using Opik observability.

### Files Created

1. **`eval_dataset.jsonl`** (50 test cases)
   - Comprehensive test dataset with diverse user profiles
   - Variations across age, allowance, habits, and goal deadlines
   - JSONL format for easy parsing and extension

2. **`experiment_runner.py`** (Experiment orchestration)
   - Automated experiment runner
   - Calls /generate and /evaluate endpoints
   - Computes aggregate metrics
   - Logs results to Opik
   - Saves detailed JSON output

3. **`EXPERIMENT_GUIDE.md`** (Complete documentation)
   - Detailed explanation of dataset structure
   - Metrics definitions and interpretation
   - Opik dashboard navigation
   - Prompt iteration workflow
   - Troubleshooting guide

4. **`EXPERIMENT_QUICKSTART.md`** (Quick reference)
   - 5-minute setup guide
   - Common commands
   - Key metrics at a glance
   - Example workflows

5. **`EVALUATION_SYSTEM_SUMMARY.md`** (This file)
   - Overview of the evaluation system
   - Quick start instructions
   - Architecture explanation

---

## 🎯 Purpose

The evaluation system helps you:

1. **Measure Quality**: Quantify prompt performance with objective metrics
2. **Compare Versions**: A/B test different prompt variations
3. **Identify Issues**: Find weak areas (age groups, scenarios, etc.)
4. **Track Progress**: Monitor improvements over iterations
5. **Ensure Compliance**: Verify scenarios meet requirements (length, format)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Experiment Runner                         │
│                  (experiment_runner.py)                      │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Reads
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Evaluation Dataset                         │
│                  (eval_dataset.jsonl)                        │
│  50 test cases: age × allowance × habit × deadline          │
└─────────────────────────────────────────────────────────────┘
             │
             │ For each item
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Service                                │
│              (http://localhost:8000)                         │
│                                                              │
│  POST /api/adventure/generate  ──────────┐                  │
│                                           │                  │
│  POST /api/adventure/evaluate  ──────────┤                  │
│                                           │                  │
└───────────────────────────────────────────┼──────────────────┘
                                            │
                                            │ Traces
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Opik Platform                             │
│              (https://www.comet.com/opik)                    │
│                                                              │
│  • Trace storage and visualization                          │
│  • Experiment comparison                                    │
│  • Metrics aggregation                                      │
│  • Feedback score tracking                                  │
└─────────────────────────────────────────────────────────────┘
             │
             │ Results
             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Results JSON File                           │
│              (experiment_results.json)                       │
│  • Per-item results                                         │
│  • Aggregate metrics                                        │
│  • Breakdowns by age/habit/deadline                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start AI Service

```bash
cd backend/apps/ai-python
poetry run python -m src.main
```

Verify it's running:
```bash
curl http://localhost:8000/health
```

### Step 2: Run Baseline Experiment

```bash
poetry run python experiment_runner.py --experiment-name "baseline-v1"
```

This will:
- Load 50 test cases from `eval_dataset.jsonl`
- Call /generate for each case
- Call /evaluate for all choices
- Compute aggregate metrics
- Save results to `experiment_results.json`
- Log traces to Opik

### Step 3: View Results

**Console Output:**
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

**Opik Dashboard:**
1. Visit https://www.comet.com/opik
2. Navigate to your project
3. View traces, experiments, and metrics

---

## 📊 Dataset Details

### Coverage Matrix

| Age | Allowance (Rp/week) | Habit Tags | Deadline Types |
|-----|---------------------|------------|----------------|
| 6   | 35,000             | impulsive  | near (1-3 weeks) |
| 8   | 70,000             | saver      | medium (1-3 months) |
| 10  | 105,000            | balanced   | far (4+ months) |
| 12  | 210,000            |            |                |

### Test Case Distribution

- **By Age**: 12-13 cases per age group (6, 8, 10, 12)
- **By Habit**: ~17 cases per habit (impulsive, saver, balanced)
- **By Deadline**: ~17 cases per deadline (near, medium, far)
- **Total**: 50 diverse test cases

### Example Test Case

```json
{
  "id": "test_007",
  "user_age": 10,
  "allowance": 105000,
  "habit_tag": "impulsive",
  "goal_context": "Menabung untuk sepeda (deadline: 3 minggu)",
  "goal_deadline": "near",
  "recent_activities": [
    "Membeli komik Rp 15.000",
    "Jajan mie ayam Rp 12.000"
  ]
}
```

---

## 📈 Metrics Explained

### Primary Quality Metrics (0.0 - 1.0)

1. **age_appropriateness**
   - How suitable is the scenario/feedback for the child's age?
   - Target: > 0.80
   - Failure threshold: < 0.70

2. **goal_alignment**
   - How well do choices align with the user's savings goal?
   - Target: > 0.75
   - Considers goal context and deadline

3. **financial_reasoning**
   - Quality of financial thinking demonstrated in choices
   - Target: > 0.75
   - Evaluates decision-making logic

### Aggregate Metrics

- **Mean Scores**: Average across all test cases
- **Failure Rate**: % of cases with age_appropriateness < 0.7
- **Scenario Word Count**: Average length of generated scenarios
- **Length Compliance**: % of scenarios ≤ 70 words

### Breakdown Metrics

The system computes metrics broken down by:
- **Age Group**: Performance for each age (6, 8, 10, 12)
- **Habit Tag**: Performance for each habit type
- **Goal Deadline**: Performance for each deadline type

---

## 🔄 Iteration Workflow

### 1. Establish Baseline

```bash
poetry run python experiment_runner.py --experiment-name "baseline-v1"
```

Review metrics and identify weak areas.

### 2. Analyze Results

Check Opik dashboard for:
- Low-scoring test cases
- Patterns in failures (age group, habit, deadline)
- Scenario length issues
- Feedback quality

### 3. Modify Prompts

Edit prompts in:
- `src/scenario_generator.py` (generation prompts)
- `src/choice_evaluator.py` (evaluation prompts)

Example improvements:
- Add age-specific examples
- Emphasize goal context
- Strengthen word count limits
- Improve feedback tone

### 4. Run New Experiment

```bash
poetry run python experiment_runner.py --experiment-name "improved-v2"
```

### 5. Compare Results

In Opik dashboard:
1. Go to "Experiments" tab
2. Select "baseline-v1" and "improved-v2"
3. Click "Compare"
4. Review side-by-side metrics

### 6. Iterate

Repeat steps 2-5 until metrics meet targets:
- Mean age_appropriateness > 0.85
- Mean goal_alignment > 0.80
- Mean financial_reasoning > 0.80
- Failure rate < 5%
- Length compliance > 98%

---

## 🎯 Success Criteria

Your prompts are production-ready when:

| Metric | Target | Status |
|--------|--------|--------|
| Mean Age Appropriateness | > 0.85 | ⏳ |
| Mean Goal Alignment | > 0.80 | ⏳ |
| Mean Financial Reasoning | > 0.80 | ⏳ |
| Failure Rate | < 5% | ⏳ |
| Scenario Length Compliance | > 98% | ⏳ |
| Consistent Across Ages | All ages > 0.80 | ⏳ |

---

## 🛠️ Advanced Usage

### Custom Dataset

Create your own test cases:

```jsonl
{"id": "custom_001", "user_age": 7, "allowance": 50000, "habit_tag": "saver", "goal_context": "Menabung untuk buku", "goal_deadline": "near", "recent_activities": ["Menabung Rp 7.000"]}
```

Run with custom dataset:
```bash
poetry run python experiment_runner.py --dataset my_dataset.jsonl
```

### Batch Experiments

Run multiple experiments:

```bash
#!/bin/bash
for version in v1 v2 v3; do
  poetry run python experiment_runner.py \
    --experiment-name "test-${version}" \
    --output "results_${version}.json"
done
```

### Programmatic Analysis

```python
import json

with open('experiment_results.json') as f:
    data = json.load(f)

# Find low-scoring items
for result in data['results']:
    if result['success']:
        score = result['metrics']['mean_age_appropriateness']
        if score < 0.7:
            print(f"Low score: {result['item_id']} = {score:.2f}")
```

---

## 📚 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `EXPERIMENT_QUICKSTART.md` | Quick reference | All users |
| `EXPERIMENT_GUIDE.md` | Complete documentation | Detailed users |
| `EVALUATION_SYSTEM_SUMMARY.md` | System overview | New users |
| `eval_dataset.jsonl` | Test data | System (machine-readable) |
| `experiment_runner.py` | Orchestration script | System (executable) |

---

## 🔍 Opik Dashboard Features

### Traces View
- Individual generation/evaluation traces
- Input/output inspection
- Metadata filtering
- Performance metrics

### Experiments View
- Side-by-side comparison
- Aggregate metrics
- Trend analysis
- Export capabilities

### Feedback View
- Score distributions
- Outlier detection
- Metric correlations
- Quality insights

---

## 💡 Best Practices

1. **Always Run Baseline**: Establish baseline before changes
2. **One Change at a Time**: Isolate variables for clear attribution
3. **Document Experiments**: Use descriptive names (e.g., "shorter-scenarios-v2")
4. **Review Individual Traces**: Don't rely only on aggregates
5. **Test Edge Cases**: Pay attention to ages 6 and 12
6. **Monitor Compliance**: Ensure scenarios meet requirements
7. **Iterate Gradually**: Small improvements compound over time

---

## 🐛 Common Issues

### Service Connection Failed
```bash
# Check if service is running
curl http://localhost:8000/health

# Start service
poetry run python -m src.main
```

### Opik Authentication Failed
```bash
# Verify API key
echo $OPIK_API_KEY

# Test connection
poetry run python -c "from opik import Opik; Opik()"
```

### Dataset Parse Error
```bash
# Validate JSON format
poetry run python -c "
import json
with open('eval_dataset.jsonl') as f:
    for i, line in enumerate(f, 1):
        if line.strip() and not line.startswith('#'):
            try:
                json.loads(line)
            except:
                print(f'Error at line {i}')
"
```

---

## 📞 Support

- **Opik Documentation**: https://www.comet.com/docs/opik
- **AI Service Logs**: Check console output from `python -m src.main`
- **Environment Config**: Verify `.env` file settings

---

## 🎓 Example Session

```bash
# Terminal 1: Start AI service
cd backend/apps/ai-python
poetry run python -m src.main

# Terminal 2: Run experiments
cd backend/apps/ai-python

# Baseline
poetry run python experiment_runner.py --experiment-name "baseline-v1"

# Review results, modify prompts in src/scenario_generator.py

# Improved version
poetry run python experiment_runner.py --experiment-name "improved-v2"

# Compare in Opik dashboard
# https://www.comet.com/opik
```

---

## ✅ Next Steps

1. **Run Baseline**: Execute first experiment
2. **Review Opik**: Analyze traces and metrics
3. **Identify Issues**: Find weak areas
4. **Iterate Prompts**: Make targeted improvements
5. **Compare Results**: Track progress
6. **Deploy Best**: Use highest-performing version

---

**Ready to start? Run your first experiment:**

```bash
poetry run python experiment_runner.py --experiment-name "baseline-v1"
```

Then visit https://www.comet.com/opik to view your results!
