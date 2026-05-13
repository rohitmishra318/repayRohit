from typing import Dict, List

SEASON_CALENDAR: Dict[str, Dict[str, List[int]]] = {
    "Engineering": {"in_season": [2, 3, 4, 10, 11], "pre_season": [1, 9]},
    "MBA":         {"in_season": [2, 3, 4, 11, 12], "pre_season": [1, 10]},
    "CA":          {"in_season": [1, 2, 7, 8],      "pre_season": [12, 6]},
    "Nursing":     {"in_season": [6, 7, 8],         "pre_season": [4, 5]},
    "Arts":        {"in_season": [],                "pre_season": []},
    "Law":         {"in_season": [5, 6],            "pre_season": [3, 4]},
    "Architecture":{"in_season": [5, 6],            "pre_season": [3, 4]},
    "Humanities":  {"in_season": [],                "pre_season": []},
}

BOARD_EXAM_WAIT: Dict[str, Dict[str, int]] = {
    "Nursing":      {"months": 4},
    "Law":          {"months": 6},
    "Architecture": {"months": 5},
}

def get_course_family(course_type: str) -> str:
    course = course_type.strip() if course_type else ""
    if course in ["Engineering", "MBA", "CA"]:
        return "campus"
    elif course in ["Nursing", "Law", "Architecture"]:
        return "regulatory"
    return "market"

def get_season_phase(course_type: str, current_month: int) -> int:
    course = course_type.strip() if course_type else ""
    calendar = SEASON_CALENDAR.get(course, {"in_season": [], "pre_season": []})
    
    if current_month in calendar["in_season"]:
        return 2
    if current_month in calendar["pre_season"]:
        return 1
    return 0

def get_regulatory_delay_months(course_type: str) -> int:
    course = course_type.strip() if course_type else ""
    return BOARD_EXAM_WAIT.get(course, {"months": 0})["months"]
