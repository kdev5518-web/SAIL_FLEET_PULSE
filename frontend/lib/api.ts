export interface OptimizationRequest {
  origin_port: string;
  dest_port: string;
  cargo_mt: number;
  recent_bdi: number;
}

export interface OptimizationResponse {
  predicted_bdi: number;
  optimization_details: {
    distance_nm: number;
    recommended_vessel: string;
    cargo_allocated_mt: number;
    estimated_cost_usd: number;
    draft_check: string;
    loa_check: string;
  };
  carbon_emissions: {
    co2_emissions_tons: number;
    fuel_consumed_tons: number;
    voyage_days: number;
    cii_rating: string;
  };
}

export async function runOptimization(data: OptimizationRequest): Promise<OptimizationResponse> {
  const response = await fetch("http://localhost:8000/optimize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch optimization results from the backend.");
  }

  return response.json();
}