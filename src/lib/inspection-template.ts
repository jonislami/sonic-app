// src/lib/inspection-template.ts

export type InspectionStatus = "OK" | "WARN" | "FAIL";

export type InspectionTemplateItem = {
  key: string;
  label: string;
};

export type InspectionTemplateGroup = {
  title: string;
  items: InspectionTemplateItem[];
};

// ✅ Template default (mundesh me e ndryshu kur t'dush)
export const INSPECTION_TEMPLATE: InspectionTemplateGroup[] = [
  {
    title: "FRENAT",
    items: [
      { key: "brake_master", label: "Cilindër kryesor i frenave" },
      { key: "brake_wheel", label: "Cilindër të rrotave" },
      { key: "brake_discs", label: "Disqe frenash" },
      { key: "brake_pads", label: "Jastiket e frenave" },
      { key: "brake_caliper", label: "Kaliperë" },
      { key: "brake_hoses", label: "Tuba dhe gypa frenash" },
    ],
  },
  {
    title: "NËN KAPAK (UNDER HOOD)",
    items: [
      { key: "air_filter", label: "Filtri i ajrit të motorit" },
      { key: "fluid_levels", label: "Nivelet e lëngjeve" },
      { key: "engine_mounts", label: "Riprat e motorit" },
    ],
  },
  {
    title: "PJESA E BRENDSHME (INTERIOR)",
    items: [
      { key: "interior_lights", label: "Dritat" },
      { key: "panel_lights", label: "Ndriçimi i brendshëm/panel" },
      { key: "seat_adjust", label: "Rregullatoret e sediljeve" },
      { key: "seatbelts", label: "Riprat e sigurisë" },
      { key: "step_plates", label: "Step plates" },
    ],
  },
];
