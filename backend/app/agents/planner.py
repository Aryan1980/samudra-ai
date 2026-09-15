"""Planner Agent: Intent understanding, subtask decomposition, and execution plan formulation."""
from typing import Dict, Any, List, Optional
import re
from app.schemas.marine import Coordinates

class ExecutionPlan:
    def __init__(self, intent: str, subtasks: List[str], required_agents: List[str], target_time: str, language: str):
        self.intent = intent
        self.subtasks = subtasks
        self.required_agents = required_agents
        self.target_time = target_time
        self.language = language

class PlannerAgent:
    """Analyzes user queries, determines intent, and plans multi-agent workflows."""

    def detect_language(self, text: str) -> str:
        # Detect Indian scripts based on Unicode block ranges
        for char in text:
            code = ord(char)
            if 0x0900 <= code <= 0x097F:  # Devanagari (Hindi / Marathi)
                return "hi"
            elif 0x0B80 <= code <= 0x0BFF:  # Tamil
                return "ta"
            elif 0x0C00 <= code <= 0x0C7F:  # Telugu
                return "te"
            elif 0x0D00 <= code <= 0x0D7F:  # Malayalam
                return "ml"
            elif 0x0C80 <= code <= 0x0CFF:  # Kannada
                return "kn"
            elif 0x0980 <= code <= 0x09FF:  # Bengali
                return "bn"
            elif 0x0A80 <= code <= 0x0AFF:  # Gujarati
                return "gu"
            elif 0x0B00 <= code <= 0x0B7F:  # Odia
                return "or"
        return "en"

    def plan_query(self, query: str, active_coords: Coordinates, lang_override: Optional[str] = None) -> ExecutionPlan:
        q = query.lower()
        detected_lang = lang_override or self.detect_language(query)

        # 1. Intent Matching
        if any(w in q for w in ["route", "safest route", "navigate", "navigation", "?????", "????", "??????", "??????"]):
            intent = "safe_route"
            subtasks = [
                "Locate origin vessel coordinates",
                "Discover nearest target PFZ destination",
                "Retrieve geospatial hazard geofences (MPAs, IMBL, Restricted Zones)",
                "Compute direct shortest route versus hazard-avoiding safe corridor",
                "Execute deterministic risk scoring for both routes",
                "Synthesize explainable navigational recommendation"
            ]
            agents = ["gis", "pfz", "route", "risk", "visualization", "explanation"]

        elif any(w in q for w in ["safest pfz", "which pfz is safest", "safe fishing zone", "best pfz"]):
            intent = "safest_pfz"
            subtasks = [
                "Retrieve current PFZs within search radius",
                "Evaluate wave and wind hazards along transit vectors",
                "Sort and filter PFZ zones by deterministic safety index",
                "Generate ranked PFZ advisory cards and map pins"
            ]
            agents = ["pfz", "weather", "ocean", "risk", "visualization", "explanation"]

        elif any(w in q for w in ["nearest pfz", "pfz", "potential fishing zone", "fish zone", "??????", "????????", "????"]):
            intent = "pfz_query"
            subtasks = [
                "Retrieve spaceborne thermal and ocean color products from Oceansat-3",
                "Extract PFZ clusters around vessel location",
                "Calculate Haversine distance and compass bearing to each zone",
                "Evaluate environmental suitability index",
                "Render PFZ overlays on interactive map"
            ]
            agents = ["discovery", "ocean", "pfz", "gis", "visualization", "explanation"]

        elif any(w in q for w in ["safe", "safety", "tomorrow morning", "tomorrow", "weather tomorrow", "????????", "????????", "????????"]):
            intent = "safety_check"
            subtasks = [
                "Determine temporal target (tomorrow morning / 24h horizon)",
                "Fetch 24-hr wave height and swell forecast",
                "Fetch coastal wind speed and gust forecasts",
                "Check active cyclone watches and squall warnings",
                "Execute deterministic risk engine across 6 physical factors",
                "Produce official safety recommendation and evidence trail"
            ]
            agents = ["weather", "ocean", "gis", "risk", "alert", "visualization", "explanation"]

        elif any(w in q for w in ["wave", "wind", "swell", "sea state", "???", "?????", "??????", "???", "????", "????"]):
            intent = "wave_wind"
            subtasks = [
                "Retrieve high-resolution wave height, swell direction, and period",
                "Retrieve surface wind vectors and gust factors",
                "Calculate Douglas sea scale state",
                "Display marine cards and directional vectors"
            ]
            agents = ["weather", "ocean", "risk", "visualization", "explanation"]

        elif any(w in q for w in ["chlorophyll", "sst", "temperature", "plankton", "thermal", "?????????", "??????????"]):
            intent = "chlorophyll_sst"
            subtasks = [
                "Retrieve satellite sea surface temperature (SST) field",
                "Retrieve satellite ocean chlorophyll-a concentration",
                "Identify thermal-chlorophyll frontal confluence lines",
                "Generate raster/contour visualization layers"
            ]
            agents = ["discovery", "ocean", "visualization", "explanation"]

        elif any(w in q for w in ["cyclone", "lightning", "storm", "alert", "warning", "???????", "??????????", "????????"]):
            intent = "alerts_query"
            subtasks = [
                "Query active severe weather alerts from IMD",
                "Scan convective lightning discharge sensors",
                "Check tropical cyclone track advisories",
                "Filter and rank alerts by severity and radius"
            ]
            agents = ["weather", "alert", "visualization", "explanation"]

        elif any(w in q for w in ["restricted", "boundary", "imbl", "sanctuary", "protected", "????", "??????", "?????", "????????"]):
            intent = "boundary_check"
            subtasks = [
                "Calculate distance to sovereign International Maritime Boundary Line (IMBL)",
                "Check point-in-polygon containment against Marine Protected Areas (MPAs)",
                "Check proximity to defense and offshore energy exclusion zones",
                "Evaluate regulatory violation risks"
            ]
            agents = ["gis", "risk", "alert", "visualization", "explanation"]

        else:
            intent = "general_marine"
            subtasks = [
                "Retrieve comprehensive marine state around coordinates",
                "Check atmospheric and hydrodynamic observations",
                "Perform unified deterministic risk assessment",
                "Format conversational answer and map visualization"
            ]
            agents = ["discovery", "weather", "ocean", "gis", "risk", "visualization", "explanation"]

        target_time = "tomorrow_morning" if "tomorrow" in q else "current"

        return ExecutionPlan(
            intent=intent,
            subtasks=subtasks,
            required_agents=agents,
            target_time=target_time,
            language=detected_lang
        )
