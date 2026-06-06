/**
 * CBC core subjects by grade level.
 * Shared between admin grade pages and student subject listings.
 * Based on the Kenya CBC (Competency-Based Curriculum) framework.
 */

export interface CbcSubject {
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export const CBC_SUBJECTS_BY_GRADE: Record<number, CbcSubject[]> = {
  1: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Kiswahili", slug: "kiswahili", icon: "🌍", color: "#ECFDF5" },
    { name: "Environmental", slug: "environmental", icon: "🌱", color: "#EAF3FF" },
    { name: "Movement", slug: "movement", icon: "🏃", color: "#FFF1F2" },
    { name: "Hygiene & Nutrition", slug: "hygiene", icon: "🚿", color: "#FEF3C7" },
  ],
  2: [
    { name: "Mathematical Activities", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English Language", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Kiswahili Language", slug: "kiswahili", icon: "🌍", color: "#ECFDF5" },
    { name: "Environmental Activities", slug: "environmental", icon: "🌱", color: "#EAF3FF" },
    { name: "Hygiene & Nutrition", slug: "hygiene", icon: "🚿", color: "#FEF3C7" },
    { name: "Movement Activities", slug: "movement", icon: "🏃", color: "#FFF1F2" },
  ],
  3: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "🔬", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "📚", color: "#FEF3C7" },
    { name: "Creative Arts", slug: "creative-arts", icon: "🎨", color: "#FFF1F2" },
  ],
  4: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "🔬", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "📚", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "🌾", color: "#ECFDF5" },
  ],
  5: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Science & Technology", slug: "science", icon: "🔬", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "📚", color: "#FEF3C7" },
    { name: "Agriculture & Nutrition", slug: "agriculture", icon: "🌾", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "🎨", color: "#FFF1F2" },
  ],
  6: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "🔬", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "📚", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "🌾", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "🎨", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "🛐", color: "#FEF3C7" },
  ],
  7: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "🔬", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "📚", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "🌾", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "🎨", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "🛐", color: "#FEF3C7" },
    { name: "Business Studies", slug: "business", icon: "📈", color: "#EAF3FF" },
    { name: "Computing", slug: "computing", icon: "💻", color: "#EDE9FE" },
  ],
  8: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "🔬", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "📚", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "🌾", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "🎨", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "🛐", color: "#FEF3C7" },
    { name: "Business Studies", slug: "business", icon: "📈", color: "#EAF3FF" },
    { name: "Computing", slug: "computing", icon: "💻", color: "#EDE9FE" },
  ],
  9: [
    { name: "Mathematics", slug: "mathematics", icon: "📊", color: "#EDE9FE" },
    { name: "English", slug: "english", icon: "📖", color: "#FFF4D8" },
    { name: "Science", slug: "science", icon: "🔬", color: "#ECFDF5" },
    { name: "Social Studies", slug: "social-studies", icon: "🌍", color: "#EAF3FF" },
    { name: "Kiswahili", slug: "kiswahili", icon: "📚", color: "#FEF3C7" },
    { name: "Agriculture", slug: "agriculture", icon: "🌾", color: "#ECFDF5" },
    { name: "Creative Arts", slug: "creative-arts", icon: "🎨", color: "#FFF1F2" },
    { name: "IRE / CRE", slug: "religious-education", icon: "🛐", color: "#FEF3C7" },
    { name: "Business Studies", slug: "business", icon: "📈", color: "#EAF3FF" },
    { name: "Computing", slug: "computing", icon: "💻", color: "#EDE9FE" },
  ],
};

/**
 * Get the canonical CBC subject list for a given grade.
 */
export function getCbcSubjectsForGrade(grade: number): CbcSubject[] {
  return CBC_SUBJECTS_BY_GRADE[grade] || [];
}
