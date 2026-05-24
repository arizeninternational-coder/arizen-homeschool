// @ts-nocheck
// Master content generator — combines all Grade 2 and Grade 5 content
import { generateGrade2Math } from "./grade2-math";
import { generateGrade2English } from "./grade2-english";
import { generateGrade2Kiswahili } from "./grade2-kiswahili";
import { generateGrade2Environmental } from "./grade2-environmental";
import { generateGrade2HygieneNutrition, generateGrade2Movement } from "./grade2-hygiene-movement";
import type { QuestGroup } from "./content-types";

export function generateAllGrade2(): QuestGroup[] {
  return [
    ...generateGrade2Math(),
    ...generateGrade2English(),
    ...generateGrade2Kiswahili(),
    ...generateGrade2Environmental(),
    ...generateGrade2HygieneNutrition(),
    ...generateGrade2Movement(),
  ];
}

export function getGrade2Stats() {
  const quests = generateAllGrade2();
  const totalLessons = quests.reduce((sum, q) => sum + q.lessons.length, 0);
  const totalContentBlocks = quests.reduce((sum, q) => sum + q.lessons.reduce((s, l) => s + l.contentBlocks.length, 0), 0);
  const subjects = [...new Set(quests.flatMap(q => q.subjects))];

  return {
    grade: 2,
    totalQuests: quests.length,
    totalLessons,
    totalContentBlocks,
    subjects,
    mainQuests: quests.filter(q => q.questType === "MAIN").length,
    sideQuests: quests.filter(q => q.questType === "SIDE").length,
  };
}

// Grade 5 content will be in a separate file due to size
export { generateAllGrade5 } from "./grade5-all";
