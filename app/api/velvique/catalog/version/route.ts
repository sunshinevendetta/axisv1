import { NextResponse } from "next/server";
import {
  GARNISHES,
  INGREDIENTS,
  MAX_COMPONENTS,
  SHOT_VOLUME_ML,
  UNIT_ML,
  VELVIQUE_CATALOG_VERSION,
  VELVIQUE_SENSORY_MODEL_VERSION,
} from "@/src/lib/velvique-catalog";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    catalogVersion: VELVIQUE_CATALOG_VERSION,
    sensoryModelVersion: VELVIQUE_SENSORY_MODEL_VERSION,
    shotVolumeMl: SHOT_VOLUME_ML,
    unitMl: UNIT_ML,
    maxComponents: MAX_COMPONENTS,
    ingredients: INGREDIENTS.map(({ id, name, profile, enabled, volumeMin, volumeMax, volumeStep, allergens }) => ({ id, name, profile, enabled, volumeMin, volumeMax, volumeStep, allergens })),
    garnishes: GARNISHES.map(({ id, name, purpose, contraindications }) => ({ id, name, purpose, contraindications })),
  });
}
