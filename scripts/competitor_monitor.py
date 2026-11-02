#!/usr/bin/env python3
"""Collect public news search RSS results for the approved competitor watchlist.

This first-stage collector stores headlines, dates, publishers and source URLs.
It does not generate AI summaries or assert that an article's claims are verified.
"""
from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "competitor-news.json"
WATCHLIST = [
    # China
    ("大牧人", "CN"), ("广兴", "CN"), ("小巨人", "CN"), ("万华", "CN"),
    ("中裕", "CN"), ("金凤", "CN"), ("石井", "CN"), ("云峰", "CN"),
    ("三缘", "CN"), ("任氏", "CN"), ("瑞格", "CN"), ("百航", "CN"),
    ("闽台", "CN"), ("晟兴科技", "CN"), ("四方新域", "CN"),
    ("罗克环控", "CN"), ("耀升", "CN"), ("科创信达", "CN"), ("华丽", "CN"),
    # International hatchery equipment
    ("Petersime", "INTL"), ("Pas Reform", "INTL"), ("Jamesway", "INTL"),
    ("KL Products poultry", "INTL"), ("HatchTech", "INTL"), ("Viscon poultry", "INTL"),
    ("EmTech incubators", "INTL"), ("Ceva Ecat-iD Campus", "INTL"),
    # International poultry equipment
    ("Big Dutchman", "INTL"), ("FACCO poultry", "INTL"), ("Roxell poultry", "INTL"),
    ("Vencomatic Group", "INTL"), ("Chore-Time poultry", "INTL"),
]

def clean(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()

def parse_date(value: str) -> str:
    if not value:
        return ""
    try:
        from email.utils import parsedate_to_datetime
        dt = parsedate_to_datetime(value)
        return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        return value

def fetch_company(company: str, region: str) -> list[dict]:
    query = urllib.parse.quote(f'"{company}" poultry OR hatchery')
    url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
    request = urllib.request.Request(url, headers={"User-Agent": "XingYi-Industry-Intelligence/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = response.read()
        root = ET.fromstring(payload)
    except Exception as exc:
        print(f"[WARN] {company}: feed unavailable: {exc}")
        return []
    items = []
    for node in root.findall("./channel/item")[:12]:
        title = clean(node.findtext("title", ""))
        link = clean(node.findtext("link", ""))
        if not title or not link:
            continue
        source_node = node.find("source")
        publisher = clean(source_node.text if source_node is not None else "Google News")
        items.append({
            "company": company,
            "region": region,
            "title": title,
            "publisher": publisher,
            "published_at": parse_date(node.findtext("pubDate", "")),
            "url": link,
            "source_type": "媒体检索聚合",
            "verification": "待核实",
        })
    return items

def main() -> None:
    DATA.parent.mkdir(parents=True, exist_ok=True)
    previous = {"items": []}
    if DATA.exists():
        try:
            previous = json.loads(DATA.read_text(encoding="utf-8"))
        except Exception:
            pass
    old_items = previous.get("items", [])
    known = {item.get("url") for item in old_items}
    new_items = []
    for company, region in WATCHLIST:
        for item in fetch_company(company, region):
            if item["url"] not in known:
                known.add(item["url"])
                new_items.append(item)
        time.sleep(1)
    combined = new_items + old_items
    combined.sort(key=lambda x: x.get("published_at", ""), reverse=True)
    # Keep a long-lived public archive, bounded to avoid unbounded repository growth.
    combined = combined[:5000]
    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "collector": "Google News RSS search; media leads require verification",
        "watchlist_count": len(WATCHLIST),
        "new_items_count": len(new_items),
        "items": combined,
    }
    DATA.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\\n", encoding="utf-8")
    print(f"Watchlist: {len(WATCHLIST)} companies; new items: {len(new_items)}; archive: {len(combined)}")

if __name__ == "__main__":
    main()
