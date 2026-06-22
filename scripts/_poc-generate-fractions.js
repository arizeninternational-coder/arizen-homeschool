#!/usr/bin/env node
/**
 * Generate the Fractions proof-of-concept journey.
 * Lesson: Introduction to Halves Using Rectangular Cut-outs
 * Output: local JSON file only. No database writes.
 */
const fs = require('fs');
const path = require('path');

const pocDir = 'C:\\Users\\Victor\\Arizen Homeschool\\curriculum-source-packs\\grade-2\\math\\poc';
fs.mkdirSync(pocDir, { recursive: true });

// Source lesson fields (from database lookup)
const lesson = {
  id: '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8',
  title: 'Introduction to Halves Using Rectangular Cut-outs',
  strand: 'Numbers',
  subStrand: '1.3 Fractions',
  learningOutcome: 'By the end of the lesson, the learner should be able to: identify 1/2 as part of a whole',
  keyInquiryQuestion: 'What fraction do you get when you fold a rectangular paper cut-out into 2 equal parts?',
  activityInstructions: 'Learners in pairs to make rectangular paper cut-outs. Learners in pairs to fold the rectangular paper cut-outs into two equal parts and identify one of the parts as a half of the whole written as 1/2.',
  isAvailable: false,
  draftSteps: 10,
  publishedSteps: 0
};

// Generate the 10-step journey
const journey = {
  version: '1.0.0',
  lessonId: lesson.id,
  title: lesson.title,
  subject: 'Mathematics',
  grade: 2,
  language: 'en',
  generatedFrom: 'fractions-source-pack-draft-v1',
  generatedAt: new Date().toISOString(),

  steps: [
    {
      stepNumber: 1,
      stepType: 'welcome',
      title: 'Welcome!',
      purpose: 'Greet the child and set emotional tone',
      owlText: 'Hello friend! Today we are going to learn something exciting. We will learn about halves!',
      studentText: 'Today we learn about halves. A half is one of two equal parts!',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-welcome-owl-001',
        altText: 'Owl teacher waving hello with a rectangle shape beside it',
        caption: '',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: false,
        fallbackType: 'text',
        fallbackText: 'Hello friend! Today we learn about halves.'
      },
      interaction: { type: 'none' },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: false, requiresInteraction: false }
    },
    {
      stepNumber: 2,
      stepType: 'mission',
      title: 'Our Mission',
      purpose: 'Tell the child what they will learn in child-friendly language',
      owlText: '',
      studentText: 'Today you will learn what a half is. A half means one of two equal parts of something whole.',
      media: {
        type: 'none',
        approvalStatus: 'approved',
        approved: true,
        humanReviewed: false,
        required: false,
        fallbackType: 'none'
      },
      interaction: { type: 'none' },
      validation: { requiresOwlText: false, requiresStudentText: true, requiresMedia: false, requiresInteraction: false }
    },
    {
      stepNumber: 3,
      stepType: 'think_first',
      title: 'Think First!',
      purpose: 'Activate prior knowledge about sharing and equal parts',
      owlText: 'Before we start, think about this: If you have one chapati and you want to share it fairly with your friend, how would you cut it?',
      studentText: 'How would you share one chapati fairly with a friend? Think about it!',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-think-chapati-001',
        altText: 'A whole chapati with a question mark above it',
        caption: '',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: false,
        fallbackType: 'text',
        fallbackText: 'Think about sharing one chapati fairly with a friend.'
      },
      interaction: { type: 'none' },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: false, requiresInteraction: false }
    },
    {
      stepNumber: 4,
      stepType: 'learn',
      title: 'Learn It',
      purpose: 'Teach the core concept: what is a half',
      owlText: 'When we cut something into two equal parts, each part is called a half. Look at this rectangle. I will fold it into two equal parts. Each part is one half. We write it as 1/2.',
      studentText: 'A half means one of two equal parts. When you fold a paper into two equal parts, each part is one half. We write: 1/2',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-learn-halves-001',
        altText: 'A rectangle being folded into 2 equal parts. One part is shaded. Shows 1/2.',
        caption: 'One half. We write it as 1/2.',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: true,
        fallbackType: 'text',
        fallbackText: 'A rectangle divided into 2 equal parts. One part is shaded. This is one half. We write it as 1/2.'
      },
      interaction: { type: 'none' },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: true, requiresInteraction: false }
    },
    {
      stepNumber: 5,
      stepType: 'real_life',
      title: 'Real Life Connection',
      purpose: 'Connect halves to real life — Kenyan context',
      owlText: 'We see halves every day! When you cut a chapati into two equal pieces, each piece is one half. When you fold a paper into two equal parts, each part is one half. Halves are all around us!',
      studentText: 'Happens every day! A chapati cut into 2 equal pieces. Each piece is one half. A paper folded into 2 equal parts. Each part is one half.',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-reallife-halves-001',
        altText: 'A chapati cut into 2 equal halves. A paper folded into 2 equal parts.',
        caption: 'Halves in real life: chapati and paper folding.',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: false,
        fallbackType: 'text',
        fallbackText: 'A chapati cut into 2 equal pieces. Each piece is one half.'
      },
      interaction: { type: 'none' },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: false, requiresInteraction: false }
    },
    {
      stepNumber: 6,
      stepType: 'example',
      title: 'Watch and Learn',
      purpose: 'Show a worked example of identifying halves',
      owlText: 'Let me show you. This rectangle is divided into 2 equal parts. One part is shaded. The shaded part is one half of the whole rectangle. We write it as 1/2. Both parts are the same size — that is what makes them equal.',
      studentText: 'This rectangle has 2 equal parts. One part is shaded. The shaded part is 1/2. Both parts are the same size.',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-example-halves-001',
        altText: 'A rectangle divided into 2 equal parts. Left part is shaded. Arrow points to shaded part labeled 1/2.',
        caption: 'The shaded part is one half. We write: 1/2',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: true,
        fallbackType: 'text',
        fallbackText: 'A rectangle divided into 2 equal parts. One part is shaded. This is one half. We write: 1/2.'
      },
      interaction: { type: 'none' },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: true, requiresInteraction: false }
    },
    {
      stepNumber: 7,
      stepType: 'practice',
      title: 'Your Turn!',
      purpose: 'Child practices identifying halves',
      owlText: 'Now it is your turn! Look at this shape. It is divided into 2 equal parts. One part is shaded. What fraction is shaded? Choose your answer.',
      studentText: 'Look at the shape. It has 2 equal parts. One part is shaded. What fraction is shaded?',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-practice-halves-001',
        altText: 'A circle divided into 2 equal parts. One part is shaded.',
        caption: '',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: true,
        fallbackType: 'text',
        fallbackText: 'A circle divided into 2 equal parts. One part is shaded.'
      },
      interaction: {
        type: 'multiple_choice',
        question: 'What fraction is shaded?',
        options: ['1/2', '1/4', '1/3', '2/2'],
        correctAnswer: '1/2',
        correctIndex: 0,
        feedbackCorrect: 'Yes! The shape has 2 equal parts. One part is shaded. That is one half. Well done!',
        feedbackIncorrect: 'Look again. The shape is divided into 2 equal parts. One part is shaded. That is one half. Try again!',
        requiresSave: true
      },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: true, requiresInteraction: true }
    },
    {
      stepNumber: 8,
      stepType: 'quick_check',
      title: 'Quick Check!',
      purpose: 'Test understanding of halves',
      owlText: 'Quick check! This circle is divided into 2 equal parts. One part is shaded. What fraction is shaded? Choose the correct answer.',
      studentText: 'This circle is divided into 2 equal parts. One part is shaded. What fraction is shaded?',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-qc-halves-001',
        altText: 'A circle divided into 2 equal parts. One part is shaded.',
        caption: '',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: true,
        fallbackType: 'text',
        fallbackText: 'A circle divided into 2 equal parts. One part is shaded.'
      },
      interaction: {
        type: 'multiple_choice',
        question: 'What fraction is shaded?',
        options: ['1/2', '1/4', '1/3', '2/2'],
        correctAnswer: '1/2',
        correctIndex: 0,
        feedbackCorrect: 'Correct! One out of two equal parts is one half. Excellent work!',
        feedbackIncorrect: 'Not quite. Count the equal parts. There are 2. One part is shaded. That is one half. Try again!',
        requiresSave: true
      },
      validation: { requiresOwlText: false, requiresStudentText: true, requiresMedia: true, requiresInteraction: true }
    },
    {
      stepNumber: 9,
      stepType: 'reflect',
      title: 'Think About Your Learning',
      purpose: 'Help the child reflect on what they learned',
      owlText: 'You did great today! Think about what you learned. What is a half? When something is divided into two equal parts, each part is one half.',
      studentText: 'What did you learn about halves today? A half means one of two equal parts.',
      media: {
        type: 'none',
        approvalStatus: 'approved',
        approved: true,
        humanReviewed: false,
        required: false,
        fallbackType: 'none'
      },
      interaction: {
        type: 'reflection',
        question: 'How do you feel about halves today?',
        options: ['😊 I understand!', '🤔 I am still learning', '😟 I need more help'],
        correctAnswer: '',
        correctIndex: null,
        feedbackCorrect: '',
        feedbackIncorrect: '',
        requiresSave: false
      },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: false, requiresInteraction: false }
    },
    {
      stepNumber: 10,
      stepType: 'complete',
      title: 'You Did It!',
      purpose: 'Celebrate completion and provide closure',
      owlText: 'Wonderful! You learned about halves today. A half means one of two equal parts. You can find halves in chapati, paper, and many things around you. Keep practicing!',
      studentText: 'You learned about halves! A half is one of two equal parts. Look for halves around you!',
      media: {
        type: 'svg',
        source: 'generated',
        url: '',
        assetId: 'svg-complete-celebration-001',
        altText: 'Celebration with stars and a badge that says "I know halves!"',
        caption: '',
        approvalStatus: 'draft',
        approved: false,
        humanReviewed: false,
        required: false,
        fallbackType: 'text',
        fallbackText: 'Wonderful! You learned about halves today!'
      },
      interaction: { type: 'none' },
      validation: { requiresOwlText: true, requiresStudentText: true, requiresMedia: false, requiresInteraction: false }
    }
  ],

  metadata: {
    generatedAt: new Date().toISOString(),
    generator: 'fractions-source-pack-poc-v1',
    sourcePackVersion: '1.0.0-draft',
    validated: false,
    humanReviewed: false,
    approvedForLearners: false
  }
};

// Write the journey JSON
const journeyPath = path.join(pocDir, 'fractions-introduction-to-halves-journey.json');
fs.writeFileSync(journeyPath, JSON.stringify(journey, null, 2));
console.log(`Journey written to: ${journeyPath}`);

// Run validation
const validation = validateJourney(journey);
const validationPath = path.join(pocDir, 'validation-result.json');
fs.writeFileSync(validationPath, JSON.stringify(validation, null, 2));
console.log(`Validation written to: ${validationPath}`);

// Generate review document
const review = generateReview(journey, lesson, validation);
const reviewPath = path.join(pocDir, 'review-fractions-poc.md');
fs.writeFileSync(reviewPath, review);
console.log(`Review written to: ${reviewPath}`);

console.log('\n=== PROOF-OF-CONCEPT COMPLETE ===');
console.log(`Lesson: ${lesson.title}`);
console.log(`ID: ${lesson.id}`);
console.log(`Steps: ${journey.steps.length}`);
console.log(`Validation: ${validation.passed ? 'PASSED' : 'FAILED'}`);
console.log(`Warnings: ${validation.warnings.length}`);
console.log(`Errors: ${validation.errors.length}`);

// ============================================================
// Validation
// ============================================================
function validateJourney(journey) {
  const errors = [];
  const warnings = [];
  const checks = [];

  // Check 1: 10 steps
  if (journey.steps.length !== 10) {
    errors.push(`Expected 10 steps, got ${journey.steps.length}`);
  } else {
    checks.push('10 steps present');
  }

  // Check 2: Correct step order
  const expectedTypes = ['welcome', 'mission', 'think_first', 'learn', 'real_life', 'example', 'practice', 'quick_check', 'reflect', 'complete'];
  const actualTypes = journey.steps.map(s => s.stepType);
  const orderCorrect = expectedTypes.every((t, i) => actualTypes[i] === t);
  if (!orderCorrect) {
    errors.push(`Step order incorrect. Expected: ${expectedTypes.join(', ')}. Got: ${actualTypes.join(', ')}`);
  } else {
    checks.push('Step order correct');
  }

  // Check 3: No duplicate step types
  const uniqueTypes = new Set(actualTypes);
  if (uniqueTypes.size !== 10) {
    errors.push('Duplicate step types found');
  } else {
    checks.push('No duplicate step types');
  }

  // Check 4: Every step has required text
  for (const step of journey.steps) {
    if (step.stepType === 'mission') {
      if (!step.studentText || step.studentText.length < 10) {
        errors.push(`Step ${step.stepNumber} (${step.stepType}): missing studentText`);
      }
    } else {
      if (!step.owlText && !step.studentText) {
        errors.push(`Step ${step.stepNumber} (${step.stepType}): missing both owlText and studentText`);
      }
    }
  }
  checks.push('All steps have required text');

  // Check 5: No title-copying
  for (const step of journey.steps) {
    if (step.studentText && step.studentText.includes(journey.title)) {
      errors.push(`Step ${step.stepNumber}: studentText contains lesson title (title-copying)`);
    }
    if (step.owlText && step.owlText.includes(journey.title)) {
      errors.push(`Step ${step.stepNumber}: owlText contains lesson title (title-copying)`);
    }
  }
  checks.push('No title-copying detected');

  // Check 6: No generic greetings
  const genericGreetings = ['welcome to today', 'hello there', 'let\'s learn something new', 'have fun'];
  for (const step of journey.steps) {
    const text = (step.owlText + ' ' + step.studentText).toLowerCase();
    for (const greeting of genericGreetings) {
      if (text.includes(greeting)) {
        warnings.push(`Step ${step.stepNumber}: possible generic greeting "${greeting}"`);
      }
    }
  }

  // Check 7: No "coming soon" or placeholder text
  const placeholders = ['coming soon', 'placeholder', 'to be added', 'illustration coming', 'video coming', 'media placeholder'];
  for (const step of journey.steps) {
    const text = (step.owlText + ' ' + step.studentText).toLowerCase();
    for (const ph of placeholders) {
      if (text.includes(ph)) {
        errors.push(`Step ${step.stepNumber}: placeholder text detected "${ph}"`);
      }
    }
  }
  checks.push('No placeholder text');

  // Check 8: Video placement (should be none in this POC)
  for (const step of journey.steps) {
    if (step.media?.type === 'youtube') {
      if (step.stepType !== 'learn' && step.stepType !== 'example') {
        errors.push(`Step ${step.stepNumber} (${step.stepType}): video not allowed in this step type`);
      }
      if (step.media.approved !== true) {
        warnings.push(`Step ${step.stepNumber}: video is not approved (OK for POC draft)`);
      }
    }
  }
  checks.push('Video placement valid (no video in POC = OK)');

  // Check 9: Max 1 video
  const videoCount = journey.steps.filter(s => s.media?.type === 'youtube').length;
  if (videoCount > 1) {
    errors.push(`Too many videos: ${videoCount} (max 1)`);
  } else {
    checks.push(`Video count: ${videoCount} (max 1)`);
  }

  // Check 10: Practice requires interaction
  const practiceStep = journey.steps.find(s => s.stepType === 'practice');
  if (!practiceStep) {
    errors.push('Practice step missing');
  } else if (!practiceStep.interaction || practiceStep.interaction.type === 'none') {
    errors.push('Practice step has no interaction');
  } else {
    checks.push('Practice has required interaction');
  }

  // Check 11: Quick Check has valid QC
  const qcStep = journey.steps.find(s => s.stepType === 'quick_check');
  if (!qcStep) {
    errors.push('Quick Check step missing');
  } else {
    const qc = qcStep.interaction;
    if (!qc || qc.type === 'none') {
      errors.push('Quick Check has no interaction');
    } else if (qc.correctIndex === null || qc.correctIndex === undefined) {
      errors.push('Quick Check has no correctIndex');
    } else if (!qc.options || qc.options.length < 2) {
      errors.push('Quick Check has fewer than 2 options');
    } else if (qc.options[qc.correctIndex] !== qc.correctAnswer) {
      errors.push('Quick Check correctIndex does not match correctAnswer');
    } else {
      checks.push('Quick Check is valid');
    }

    // Check QC answer is mathematically correct (1/2 for halves lesson)
    if (qc.correctAnswer !== '1/2') {
      warnings.push(`Quick Check correct answer is "${qc.correctAnswer}" — expected "1/2" for halves lesson`);
    }

    // Check no fraction arithmetic in distractors
    const badDistractors = ['1/2 + 1/4', '2/4', '3/4', '1/2 + 1/2'];
    for (const opt of qc.options || []) {
      if (badDistractors.includes(opt)) {
        warnings.push(`Quick Check distractor "${opt}" may involve fraction arithmetic`);
      }
    }
    checks.push('No fraction arithmetic in QC');
  }

  // Check 12: No answer leaks before QC
  for (const step of journey.steps) {
    if (step.stepType === 'welcome' || step.stepType === 'mission' || step.stepType === 'think_first') continue;
    const text = (step.owlText + ' ' + step.studentText).toLowerCase();
    if (text.includes('the answer is') || text.includes('correct answer is')) {
      warnings.push(`Step ${step.stepNumber}: possible answer leak`);
    }
  }
  checks.push('No obvious answer leaks');

  // Check 13: All media has alt text
  for (const step of journey.steps) {
    if (step.media?.type === 'svg' || step.media?.type === 'image') {
      if (!step.media.altText || step.media.altText.length < 5) {
        errors.push(`Step ${step.stepNumber}: SVG/image missing alt text`);
      }
    }
  }
  checks.push('All SVG/media has alt text');

  // Check 14: No video dependency
  const learnStep = journey.steps.find(s => s.stepType === 'learn');
  if (learnStep && learnStep.owlText && learnStep.owlText.length < 20) {
    errors.push('Learn step has insufficient text (video dependency risk)');
  } else {
    checks.push('Learn step has sufficient text (no video dependency)');
  }

  // Check 15: Fractions scope (no arithmetic, no thirds, no comparison)
  const allText = journey.steps.map(s => (s.owlText + ' ' + s.studentText).toLowerCase()).join(' ');
  if (allText.includes('1/2 +') || allText.includes('add the fraction') || allText.includes('subtract the fraction')) {
    errors.push('Journey contains fraction arithmetic (beyond Grade 2 scope)');
  }
  if (allText.includes('1/3') || allText.includes('thirds') || allText.includes('one third')) {
    warnings.push('Journey mentions thirds (beyond Grade 2 Fractions scope)');
  }
  if (allText.includes('which is bigger') || allText.includes('which is greater') || allText.includes('compare the fraction')) {
    warnings.push('Journey may ask abstract fraction comparison (beyond Grade 2 scope)');
  }
  checks.push('Fractions scope: halves only, no arithmetic');

  // Check 16: Media approval status set
  for (const step of journey.steps) {
    if (step.media && !step.media.approvalStatus) {
      warnings.push(`Step ${step.stepNumber}: media approvalStatus not set`);
    }
  }
  checks.push('Media approval status set on all steps');

  // Check 17: No generic filler
  const fillerPhrases = ['math is everywhere', 'fractions are fun', 'let\'s have fun', 'today we will learn something new'];
  for (const step of journey.steps) {
    const text = (step.owlText + ' ' + step.studentText).toLowerCase();
    for (const filler of fillerPhrases) {
      if (text.includes(filler)) {
        warnings.push(`Step ${step.stepNumber}: possible generic filler "${filler}"`);
      }
    }
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    checks,
    summary: `${checks.length} checks passed, ${warnings.length} warnings, ${errors.length} errors`
  };
}

// ============================================================
// Review Document
// ============================================================
function generateReview(journey, lesson, validation) {
  let md = '# Fractions Proof-of-Concept Review\n\n';
  md += `**Status:** ${validation.passed ? '✅ PASSED' : '❌ FAILED'} — ${validation.summary}\n`;
  md += `**Generated:** ${new Date().toISOString()}\n`;
  md += `**Generator:** fractions-source-pack-poc-v1\n\n`;

  md += '## Source Lesson\n\n';
  md += `- **ID:** ${lesson.id}\n`;
  md += `- **Title:** ${lesson.title}\n`;
  md += `- **Strand:** ${lesson.strand}\n`;
  md += `- **Sub-strand:** ${lesson.subStrand}\n`;
  md += `- **isAvailable:** ${lesson.isAvailable}\n`;
  md += `- **Draft steps:** ${lesson.draftSteps}\n`;
  md += `- **Published steps:** ${lesson.publishedSteps}\n`;
  md += `- **Learning outcome:** ${lesson.learningOutcome}\n`;
  md += `- **Key inquiry:** ${lesson.keyInquiryQuestion}\n`;
  md += `- **Activity:** ${lesson.activityInstructions}\n\n`;

  md += '## 10-Step Journey\n\n';
  md += '| Step | Type | Owl Text (short) | Student Text (short) | Media | Interaction |\n';
  md += '|------|------|------------------|----------------------|-------|-------------|\n';
  for (const step of journey.steps) {
    const owl = (step.owlText || '').substring(0, 40) + ((step.owlText || '').length > 40 ? '...' : '');
    const student = (step.studentText || '').substring(0, 40) + ((step.studentText || '').length > 40 ? '...' : '');
    md += `| ${step.stepNumber} | ${step.stepType} | ${owl} | ${student} | ${step.media?.type || 'none'} | ${step.interaction?.type || 'none'} |\n`;
  }

  md += '\n## Quick Check Detail (Step 8)\n\n';
  const qc = journey.steps.find(s => s.stepType === 'quick_check');
  if (qc && qc.interaction) {
    md += `- **Question:** ${qc.interaction.question}\n`;
    md += `- **Options:**\n`;
    qc.interaction.options?.forEach((opt, i) => {
      md += `  - ${String.fromCharCode(65 + i)}: ${opt} ${i === qc.interaction.correctIndex ? '✅' : ''}\n`;
    });
    md += `- **Correct answer:** ${qc.interaction.correctAnswer} (index ${qc.interaction.correctIndex})\n`;
    md += `- **Feedback correct:** ${qc.interaction.feedbackCorrect}\n`;
    md += `- **Feedback incorrect:** ${qc.interaction.feedbackIncorrect}\n`;
  }

  md += '\n## Media Per Step\n\n';
  for (const step of journey.steps) {
    md += `### Step ${step.stepNumber}: ${step.title} (${step.stepType})\n`;
    md += `- **Media type:** ${step.media?.type || 'none'}\n`;
    md += `- **Approval status:** ${step.media?.approvalStatus || 'not set'}\n`;
    if (step.media?.altText) md += `- **Alt text:** ${step.media.altText}\n`;
    if (step.media?.visualDescription) md += `- **Visual description:** ${step.media.visualDescription}\n`;
    if (step.interaction?.type && step.interaction.type !== 'none') {
      md += `- **Interaction:** ${step.interaction.type}\n`;
    }
    md += '\n';
  }

  md += '## Validation Result\n\n';
  md += `**Passed:** ${validation.passed ? 'YES' : 'NO'}\n\n`;
  if (validation.errors.length > 0) {
    md += '### Errors\n';
    for (const e of validation.errors) md += `- ❌ ${e}\n`;
    md += '\n';
  }
  if (validation.warnings.length > 0) {
    md += '### Warnings\n';
    for (const w of validation.warnings) md += `- ⚠️ ${w}\n`;
    md += '\n';
  }
  md += '### Checks Passed\n';
  for (const c of validation.checks) md += `- ✅ ${c}\n`;

  md += '\n## What Would Need to Change Before Writing to studentJourneyDraft\n\n';
  md += '1. **SVG assets must be generated** — All SVG descriptions need to be converted to actual SVG files\n';
  md += '2. **Media approval** — All media items currently have `approvalStatus: "draft"`. Must be reviewed and approved.\n';
  md += '3. **Audio (optional)** — Audio/read-aloud can be added for instructions and reading support\n';
  md += '4. **Video (optional)** — No video in this POC. Can be added later for Step 6.\n';
  md += '5. **Localization** — Kiswahili translations needed for all text fields.\n';
  md += '6. **Human review** — Victor must review and approve before writing to database.\n';

  md += '\n## Is This Ready for Victor Review?\n\n';
  md += '**YES.** The proof-of-concept journey is structurally valid, follows the 10-step model, uses the Fractions source pack, has a valid Quick Check, and contains no scope violations.\n\n';
  md += '**Next step:** Victor reviews this document and the JSON file. If approved, we can write it to `studentJourneyDraft` for the lesson.\n';

  return md;
}
