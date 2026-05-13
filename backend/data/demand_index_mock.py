"""
Demand index mock data generator.

Generates 18 months of sector demand data across 12 sectors and 3 city tiers.
"""

import random
import datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy.orm import Session

SECTOR_DEMAND_BASE = {
    "IT_software":   {"base": 65, "trend": -8},
    "BFSI":          {"base": 72, "trend": +5},
    "BFSI_digital":  {"base": 70, "trend": +8},
    "consulting":    {"base": 68, "trend": +2},
    "manufacturing": {"base": 55, "trend": -2},
    "healthcare":    {"base": 78, "trend": +10},
    "FMCG":          {"base": 60, "trend": +1},
    "fintech":       {"base": 62, "trend": -4},
    "media":         {"base": 38, "trend": -5},
    "education":     {"base": 44, "trend": +3},
    "NGO":           {"base": 30, "trend": 0},
    "core_engineering": {"base": 50, "trend": +4},
}

ADJACENT_SECTORS = {
    "IT_software":   [{"sector": "BFSI_digital", "overlap": 0.8},
                      {"sector": "fintech", "overlap": 0.6}],
    "BFSI":          [{"sector": "consulting", "overlap": 0.7},
                      {"sector": "BFSI_digital", "overlap": 0.9}],
    "healthcare":    [{"sector": "BFSI", "overlap": 0.3}],
    "fintech":       [{"sector": "BFSI", "overlap": 0.8},
                      {"sector": "IT_software", "overlap": 0.6}],
    "media":         [{"sector": "education", "overlap": 0.5}],
}


def get_base_trend(field):
    """Get base demand and trend for a sector, with fallback for unknown fields."""
    return SECTOR_DEMAND_BASE.get(field, {"base": 50, "trend": 0})


def generate_demand_index(months_back=18):
    """Generate demand index time series for all sectors and city tiers."""
    data = []
    fields = list(SECTOR_DEMAND_BASE.keys())
    city_tiers = [1, 2, 3]

    today = datetime.date.today().replace(day=1)

    for field in fields:
        for city_tier in city_tiers:
            base_info = get_base_trend(field)
            base = base_info["base"]
            trend = base_info["trend"]

            city_mod = 8 if city_tier == 1 else (0 if city_tier == 2 else -10)
            prev_demand = None

            for m in range(months_back, -1, -1):
                month_date = today - relativedelta(months=m)
                month_index = months_back - m
                demand_percentile = base + trend * (month_index / 12) + random.uniform(-5, 5) + city_mod
                demand_percentile = max(0.0, min(100.0, demand_percentile))

                mom_delta = 0.0
                if prev_demand is not None:
                    mom_delta = demand_percentile - prev_demand
                prev_demand = demand_percentile

                data.append({
                    "field": field,
                    "city_tier": city_tier,
                    "month": month_date,
                    "demand_percentile": round(demand_percentile, 2),
                    "mom_delta": round(mom_delta, 2),
                    "adjacent_sectors": ADJACENT_SECTORS.get(field, [])
                })
    return data


def get_latest_demand(field, city_tier, db: Session):
    """
    Query the most recent demand record for a field + city_tier combination.

    Falls back to a default record if no match found.
    """
    from backend.models.schema import DemandIndex

    record = db.query(DemandIndex).filter(
        DemandIndex.field == field,
        DemandIndex.city_tier == city_tier
    ).order_by(DemandIndex.month.desc()).first()

    if record:
        return record

    # Try partial match — field names from Faker jobs won't match our sectors
    # Map common job titles to sectors
    field_lower = (field or "").lower()
    sector_map = {
        "software": "IT_software", "developer": "IT_software", "engineer": "IT_software",
        "data": "IT_software", "it": "IT_software", "tech": "IT_software",
        "bank": "BFSI", "financ": "BFSI", "account": "BFSI", "audit": "BFSI",
        "consult": "consulting", "manag": "consulting",
        "health": "healthcare", "nurse": "healthcare", "medic": "healthcare",
        "pharma": "healthcare", "doctor": "healthcare",
        "manufactur": "manufacturing", "mechanic": "core_engineering",
        "market": "FMCG", "sales": "FMCG", "retail": "FMCG",
        "media": "media", "journal": "media", "design": "media",
        "teach": "education", "professor": "education", "academ": "education",
    }

    mapped_sector = None
    for keyword, sector in sector_map.items():
        if keyword in field_lower:
            mapped_sector = sector
            break

    if mapped_sector:
        record = db.query(DemandIndex).filter(
            DemandIndex.field == mapped_sector,
            DemandIndex.city_tier == city_tier
        ).order_by(DemandIndex.month.desc()).first()

    return record
