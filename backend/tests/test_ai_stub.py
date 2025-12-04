from backend.app.ai.stub import score_lead, summarize_communications


def test_score_lead():
    res = score_lead({"name": "Bob"})
    assert "score" in res
    assert isinstance(res["score"], int)


def test_summarize():
    txt = "a" * 500
    s = summarize_communications(txt)
    assert len(s) <= 243
