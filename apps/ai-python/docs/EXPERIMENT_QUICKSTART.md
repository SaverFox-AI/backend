# SaverFox Experiment Quick Start

## 🚀 Quick Setup (5 minutes)

### 1. Start AI Service
```bash
cd backend/apps/ai-python
poetry run python -m src.main
```

### 2. Run Baseline Experiment
```bash
poetry run python experiment_runner.py --experiment-name "baseline-v1"
```

### 3. View Results
- **Console**: See summary in terminal output
- **File**: Check `experiment_results.json`
- **Opik Dashboard**: https://www.comet.com/opik

---

## 📊 Dataset Overview

**50 test cases** with variations:

| Dimension | Values |
|-----------|--------|
| **Age** | 6, 8, 10, 12 years |
| **Allowance** | Rp 35k, 70k, 210k/week |
| **Habit** | impulsive, saver, balanced |
| **Deadline** | near (1-3 weeks), medium (1-3 months), far (4+ months) |

---

## 📈 Key Metrics

### Quality Scores (0.0 - 1.0)
- **age_appropriateness**: How suitable for the child's age?
- **goal_alignment**: How well aligned with savings goals?
- **financial_reasoning**: Quality of financial thinking?

### Target Thresholds
- ✅ **Good**: > 0.80
- ⚠️ **Acceptable**: 0.70 - 0.80
- ❌ **Needs Improvement**: < 0.70

### Other Metrics
- **Failure Rate**: % with age_appropriateness < 0.7 (target: <10%)
- **Scenario Length**: Word count (target: ≤60 words)
- **Compliance**: % meeting length requirement (target: >95%)

---

## 🔄 Iteration Workflow

```
1. Run Baseline
   ↓
2. Review Metrics in Opik
   ↓
3. Identify Weak Areas
   ↓
4. Update Prompts
   ↓
5. Run New Experiment
   ↓
6. Compare Results
   ↓
7. Repeat
```

---

## 🛠️ Common Commands

### Run with Custom Name
```bash
poetry run python experiment_runner.py --experiment-name "my-experiment"
```

### Run with Custom Dataset
```bash
poetry run python experiment_runner.py --dataset my_data.jsonl
```

### Run with Different Service URL
```bash
poetry run python experiment_runner.py --ai-service-url http://localhost:8080
```

### Save to Custom Output
```bash
poetry run python experiment_runner.py --output my_results.json
```

---

## 🎯 Prompt Modification Locations

### Scenario Generation
**File**: `src/scenario_generator.py`
- **System Prompt**: `_build_system_prompt()` method
- **User Prompt**: `_build_user_prompt()` method

### Choice Evaluation
**File**: `src/choice_evaluator.py`
- **System Prompt**: `_build_system_prompt()` method
- **User Prompt**: `_build_user_prompt()` method

---

## 📊 Example Output

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

---

## 🔍 Opik Dashboard Views

### Traces Tab
- View individual generation/evaluation traces
- Filter by age, experiment name, tags
- Inspect input/output for each call

### Experiments Tab
- Compare multiple experiments side-by-side
- View aggregate metrics
- Identify performance trends

### Feedback Tab
- Review evaluation scores
- Analyze score distributions
- Identify outliers

---

## 🐛 Troubleshooting

### Service Not Running
```bash
# Check health
curl http://localhost:8000/health

# View logs
poetry run python -m src.main
```

### Opik Connection Failed
```bash
# Verify API key
echo $OPIK_API_KEY

# Test connection
poetry run python -c "from opik import Opik; Opik()"
```

### Dataset Format Error
```bash
# Validate JSON
poetry run python -c "
import json
with open('eval_dataset.jsonl') as f:
    for line in f:
        if line.strip() and not line.startswith('#'):
            json.loads(line)
"
```

---

## 💡 Tips

1. **Start Simple**: Run baseline before making changes
2. **One Change**: Modify one prompt aspect at a time
3. **Document**: Use descriptive experiment names
4. **Review Traces**: Check individual examples in Opik
5. **Monitor Trends**: Track metrics across experiments
6. **Test Edge Cases**: Pay attention to ages 6 and 12

---

## 📚 Full Documentation

See `EXPERIMENT_GUIDE.md` for complete details on:
- Dataset structure
- Metrics explanation
- Advanced usage
- Prompt iteration strategies
- Opik dashboard navigation

---

## 🎓 Example Experiment Sequence

```bash
# 1. Baseline
poetry run python experiment_runner.py --experiment-name "baseline-v1"

# 2. Shorter scenarios
# (Edit src/scenario_generator.py to emphasize brevity)
poetry run python experiment_runner.py --experiment-name "shorter-v2"

# 3. More age-appropriate
# (Edit prompts to add age-specific examples)
poetry run python experiment_runner.py --experiment-name "age-tuned-v3"

# 4. Better goal alignment
# (Edit prompts to emphasize goal context)
poetry run python experiment_runner.py --experiment-name "goal-focused-v4"
```

Then compare all experiments in Opik dashboard!

---

## ✅ Success Criteria

Your prompts are ready for production when:
- ✅ Mean age_appropriateness > 0.85
- ✅ Mean goal_alignment > 0.80
- ✅ Mean financial_reasoning > 0.80
- ✅ Failure rate < 5%
- ✅ Scenario length compliance > 98%
- ✅ Consistent performance across all age groups

---

**Ready to start? Run your first experiment now!**

```bash
poetry run python experiment_runner.py --experiment-name "baseline-v1"
```
