from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class BatteryTelemetryInput(BaseModel):
    voltage: float = Field(395.4, description="Battery terminal voltage in Volts (e.g. 395.4)")
    current: float = Field(45.2, description="Charge/discharge current in Amperes (e.g. 45.2)")
    temperature: float = Field(31.5, description="Battery pack temperature in Celsius (e.g. 31.5)")
    capacity: float = Field(68.5, description="Current measured capacity in Ah (e.g. 68.5)")
    internal_resistance: float = Field(18.2, description="Internal resistance in mOhm (e.g. 18.2)")
    charge_cycles: int = Field(340, description="Total completed charge cycles (e.g. 340)")
    charging_time: float = Field(65.0, description="Average charging duration in minutes")
    discharging_time: float = Field(210.0, description="Average discharging duration in minutes")
    energy_throughput: float = Field(2450.0, description="Cumulative energy throughput in kWh")
    chemistry: Optional[str] = Field("NMC", description="Cell chemistry: LFP, NMC, NCA, LMO")
    fast_charge_ratio: Optional[float] = Field(0.35, description="Ratio of DC fast charging sessions 0.0 - 1.0")
    depth_of_discharge: Optional[float] = Field(65.0, description="Average depth of discharge (DoD %)")
    ambient_temp: Optional[float] = Field(28.0, description="Ambient operating temperature in °C")
    peak_fast_charge_temp: Optional[float] = Field(32.0, description="Peak temperature recorded during DC fast charging in °C")

class SOHPredictionResponse(BaseModel):
    soh: float = Field(..., description="Predicted State of Health percentage (e.g. 91.4)")
    status: str = Field(..., description="Battery condition status: EXCELLENT, GOOD, MODERATE, CRITICAL")
    health_score: float = Field(..., description="Normalized health score 0.0 - 1.0")
    model_name: str
    model_version: str
    confidence: float
    failure_risk: str
    factors: Dict[str, Any]

class DegradationPoint(BaseModel):
    cycle: int
    predicted_soh: float
    actual_baseline: Optional[float] = None

class RULPredictionResponse(BaseModel):
    estimated_remaining_cycles: int
    estimated_remaining_km: int
    end_of_life_threshold_soh: float = 70.0
    current_soh: float
    degradation_curve: List[DegradationPoint]
    status: str
    failure_risk: str
    recommendation: str

class BatteryFullDiagnosticsResponse(BaseModel):
    soh: float
    rul_cycles: int
    estimated_remaining_km: int
    status: str
    health_score: float
    failure_risk: str
    failure_risk_score: float
    model_name: str
    degradation_trajectory: List[DegradationPoint]
    chemistry: str
    chemistry_profile: Dict[str, Any]
    anomalies: List[str]
    longevity_recommendations: List[str]
    pack_vitals: Dict[str, Any]

class ModelEvaluationResponse(BaseModel):
    dataset_info: Dict[str, Any]
    models_comparison: Dict[str, Any]
    best_model: str
    feature_importances: Dict[str, float]
    top_factors_explained: List[Dict[str, Any]]
    chemistry_insights: Dict[str, Any]
    chemistry_curves: List[Dict[str, Any]]
