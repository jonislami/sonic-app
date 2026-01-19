export type InspectionStatus = "OK" | "WARN" | "FAIL";

export type InspectionTemplateItem = {
  key: string;
  label: string;
};

export type InspectionTemplateGroup = {
  title: string;
  items: InspectionTemplateItem[];
};


export const INSPECTION_TEMPLATE: InspectionGroup[] = [
  {
    title: "FRENAT",
    items: [
      { key: "frenat_cilinder_kryesor", label: "Cilindër kryesor i frenave" },
      { key: "frenat_cilinder_rrotave", label: "Cilindër të rrotave" },
      { key: "frenat_disqe", label: "Disqe frenash" },
      { key: "frenat_jastike", label: "JASTIKET E FRENAVE" },
      { key: "frenat_kalipere", label: "Kaliperë" },
      { key: "frenat_tuba_gypa", label: "Tuba dhe gypa frenash" },
    ],
  },
  {
    title: "NËN KAPAK (UNDER HOOD)",
    items: [
      { key: "hood_filtri_ajrit_motorit", label: "Filtri i ajrit të motorit" },
      { key: "hood_nivelet_lengjeve", label: "Nivelet e lëngjeve" },
      { key: "hood_rripat", label: "Rripat e motorit" },
    ],
  },
  {
    title: "PJESA E BRENDSHME (INTERIOR)",
    items: [
      { key: "interior_dritat", label: "Dritat" },
      { key: "interior_ndricimi_panel", label: "Ndriçimi i brendshëm/panel" },
      { key: "interior_rregullatoret_sediljeve", label: "Rregullatoret e sediljeve" },
      { key: "interior_rripat_sigurise", label: "Rripat e sigurisë" },
      { key: "interior_step_plates", label: "Step plates" },
      { key: "interior_tapetet", label: "Tapetet e dyshemesë" },
      { key: "interior_xhamat", label: "Xhamat dhe xhami i përparmë" },
    ],
  },
];
