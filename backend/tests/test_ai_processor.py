from app import ai_processor


def test_score_lead_range_and_determinism():
    lead = {"name": "Example Company", "email": "contact@example.com", "lead_score": 0.5}
    s1 = ai_processor.score_lead(lead, seed=42)
    s2 = ai_processor.score_lead(lead, seed=42)
    assert 0.0 <= s1 <= 1.0
    assert s1 == s2


def test_recommend_actions():
    assert ai_processor.recommend_next_action(0.9) == "Call now"
    assert ai_processor.recommend_next_action(0.65) == "Schedule meeting"
    assert ai_processor.recommend_next_action(0.4) == "Nurture via email"
    assert ai_processor.recommend_next_action(0.1) == "Cold outreach"


def test_enrich_with_opengov():
    lead = {"name": "Unique Demo Ltd"}
    enriched = ai_processor.enrich_with_opengov(lead)
    assert enriched.get("enriched") is True
    assert "official_registry_id" in enriched


def test_apply_demo_scoring_deterministic():
    companies = [{"name": "A"}, {"name": "B"}]
    scored1 = ai_processor.apply_demo_scoring(companies, deterministic=True)
    scored2 = ai_processor.apply_demo_scoring(companies, deterministic=True)
    assert scored1 == scored2
    for s in scored1:
        assert "lead_score" in s
        assert "recommended_action" in s
