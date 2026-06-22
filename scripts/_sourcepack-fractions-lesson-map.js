#!/usr/bin/env node
/**
 * Update math-lesson-map.csv for Fractions lessons only.
 * Fills in the Fractions-specific fields based on the source pack draft.
 */
const fs = require('fs');
const path = require('path');

const csvPath = 'C:\\Users\\Victor\\Arizen Homeschool\\curriculum-source-packs\\grade-2\\math\\math-lesson-map.csv';
const csv = fs.readFileSync(csvPath, 'utf-8');
const lines = csv.split('\n');
const header = lines[0];

// Fractions lesson data — 7 lessons from audit
const fractionsData = {
  '0767b9f0-4a75-4a27-b2a2-fa9833c8dae8': {
    title: 'Introduction to Halves Using Rectangular Cut-outs',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Halves',
    child_friendly_goal: 'Today you will learn what a half is. A half means one of two equal parts.',
    vocabulary_needed: 'whole, half, equal parts, fold, shade',
    representation_needed: 'paper folding, rectangular cut-outs, shading',
    example_type: 'Fold a rectangular paper into 2 equal parts. Each part is one half.',
    practice_type: 'Fold, shade, and identify halves in shapes',
    quick_check_type: 'identify-halves-shape',
    difficulty_limit: 'Halves only (1/2). NO arithmetic.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'rectangle_divided_2_equal_parts_shaded',
    visual_description: 'A rectangle divided into 2 equal parts with 1 part shaded. Shows 1/2.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  '9b887eb8-0a48-4f37-9689-b53113904728': {
    title: 'Introduction to Quarters Using Rectangular Cut-outs',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Quarters',
    child_friendly_goal: 'Today you will learn what a quarter is. A quarter means one of four equal parts.',
    vocabulary_needed: 'whole, quarter, equal parts, fold, shade',
    representation_needed: 'paper folding, rectangular cut-outs, shading',
    example_type: 'Fold a rectangular paper into 4 equal parts. Each part is one quarter.',
    practice_type: 'Fold, shade, and identify quarters in shapes',
    quick_check_type: 'identify-quarters-shape',
    difficulty_limit: 'Quarters only (1/4). NO arithmetic.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'rectangle_divided_4_equal_parts_shaded',
    visual_description: 'A rectangle divided into 4 equal parts with 1 part shaded. Shows 1/4.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  '839653eb-cd5e-405b-a483-b6d307fee352': {
    title: 'Comparing Fractions: 1/2 and 1/4',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Comparing Halves and Quarters',
    child_friendly_goal: 'Today you will learn to tell the difference between a half and a quarter.',
    vocabulary_needed: 'half, quarter, equal parts, whole, compare',
    representation_needed: 'side-by-side shapes, shading',
    example_type: 'Show a shape with 1/2 shaded and a shape with 1/4 shaded. Compare.',
    practice_type: 'Identify which fraction is shown: 1/2 or 1/4',
    quick_check_type: 'identify-fraction-halves-or-quarters',
    difficulty_limit: 'Halves and quarters only. NO comparing which is bigger.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'side_by_side_halves_quarters',
    visual_description: 'Two shapes side by side: one showing 1/2 shaded, one showing 1/4 shaded.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  'b163de06-c0e5-4a42-8bce-ba7dcab330a9': {
    title: 'Making Patterns with Fractions',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Fraction Patterns',
    child_friendly_goal: 'Today you will learn to make patterns using halves and quarters.',
    vocabulary_needed: 'half, quarter, pattern, repeat, sequence',
    representation_needed: 'shaped patterns, alternating fractions',
    example_type: 'Create a pattern: 1/2, 1/4, 1/2, 1/4... using shaded shapes.',
    practice_type: 'Continue a fraction pattern and create your own',
    quick_check_type: 'identify-next-in-fraction-pattern',
    difficulty_limit: 'Patterns using 1/2 and 1/4 only.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'fraction_pattern_sequence',
    visual_description: 'A sequence of shapes showing alternating 1/2 and 1/4 shaded parts.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  'dbadac3a-b59b-4f76-bebf-efda6fb3e261': {
    title: 'Digital Games with Fractions',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Digital Practice',
    child_friendly_goal: 'Today you will practice fractions by playing a fun digital game.',
    vocabulary_needed: 'half, quarter, equal parts, game, score',
    representation_needed: 'interactive game elements, shapes, shading',
    example_type: 'Play a game: match the fraction to the shaded shape.',
    practice_type: 'Interactive fraction matching and identification game',
    quick_check_type: 'identify-fraction-from-shape-game',
    difficulty_limit: 'Halves and quarters identification only.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'interactive_fraction_game',
    visual_description: 'Game-style layout with shapes showing fractions. Child selects the correct fraction.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  'c71a49c8-e9c6-41e5-b6ef-ad0aa386a59f': {
    title: 'Fractions: Practice and Application',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Practice and Application',
    child_friendly_goal: 'Today you will practice everything you know about halves and quarters.',
    vocabulary_needed: 'half, quarter, equal parts, whole, shade, identify',
    representation_needed: 'varied shapes, real objects, shading',
    example_type: 'Mixed practice: identify, shade, and create fractions.',
    practice_type: 'Mixed tasks: identify fractions, shade fractions, equal vs unequal',
    quick_check_type: 'mixed-fractions-practice',
    difficulty_limit: 'Halves and quarters. Equal vs unequal parts.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'mixed_fractions_practice',
    visual_description: 'Various shapes showing different fractions. Some equal, some unequal.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  '2e1869d6-f5df-46a1-9d02-b4b53a1062fe': {
    title: 'Fractions: Assessment and Reflection',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Assessment and Reflection',
    child_friendly_goal: 'Today you will show what you know about fractions and think about what you learned.',
    vocabulary_needed: 'half, quarter, equal parts, whole, reflect',
    representation_needed: 'assessment shapes, reflection prompts',
    example_type: 'Review: what is a half? what is a quarter? what are equal parts?',
    practice_type: 'Assessment questions + reflection prompt',
    quick_check_type: 'fractions-assessment-comprehensive',
    difficulty_limit: 'Halves and quarters. Equal vs unequal. Fair sharing.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'fractions_assessment',
    visual_description: 'Comprehensive assessment shapes covering all fractions concepts.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  // Also update the two "Identifying" lessons that were mapped to Numbers
  '159f92b9-69c7-45ea-8376-2b15af491360': {
    title: 'Identifying 1/2 in Everyday Objects',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Halves in Real Life',
    child_friendly_goal: 'Today you will find halves in everyday things like food and objects.',
    vocabulary_needed: 'half, equal parts, whole, share, fair',
    representation_needed: 'real objects (chapati, cake, fruit), shading',
    example_type: 'A chapati cut into 2 equal pieces. Each piece is one half.',
    practice_type: 'Identify halves in real-life objects',
    quick_check_type: 'identify-halves-real-object',
    difficulty_limit: 'Halves only (1/2). Real objects.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'real_objects_halves',
    visual_description: 'Everyday objects (chapati, cake, orange) divided into 2 equal parts.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  },
  '60441bd5-774f-4135-9871-666fc481b13b': {
    title: 'Identifying 1/4 in Everyday Objects',
    mapped_topic: 'Fractions',
    mapped_subtopic: 'Quarters in Real Life',
    child_friendly_goal: 'Today you will find quarters in everyday things like food and objects.',
    vocabulary_needed: 'quarter, equal parts, whole, share, fair',
    representation_needed: 'real objects (cake, pizza, chocolate), shading',
    example_type: 'A cake cut into 4 equal slices. Each slice is one quarter.',
    practice_type: 'Identify quarters in real-life objects',
    quick_check_type: 'identify-quarters-real-object',
    difficulty_limit: 'Quarters only (1/4). Real objects.',
    required_media_type: 'svg',
    optional_media_type: 'audio',
    visual_type: 'real_objects_quarters',
    visual_description: 'Everyday objects (cake, pizza, chocolate) divided into 4 equal parts.',
    audio_needed: 'YES',
    video_needed: 'NO',
    media_status: 'draft',
    fallback_required: 'YES',
    human_review_needed: 'YES',
    source_pack_status: 'fractions-draft-pending-review',
    safe_to_generate: 'NO'
  }
};

// Parse CSV, update Fractions rows, write back
const headers = header.split(',');
const updatedLines = [header];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) { updatedLines.push(lines[i]); continue; }

  // Parse the CSV row (simple split — our data doesn't have commas in fields)
  const cols = lines[i].split(',');
  const id = cols[0]?.replace(/"/g, '');

  const data = fractionsData[id];
  if (data) {
    // Update the relevant columns
    // Column indices based on header
    const colMap = {};
    headers.forEach((h, idx) => colMap[h] = idx);

    cols[colMap['mapped_topic']] = '"' + data.mapped_topic + '"';
    cols[colMap['mapped_subtopic']] = '"' + data.mapped_subtopic + '"';
    cols[colMap['child_friendly_goal']] = '"' + data.child_friendly_goal + '"';
    cols[colMap['vocabulary_needed']] = '"' + data.vocabulary_needed + '"';
    cols[colMap['representation_needed']] = '"' + data.representation_needed + '"';
    cols[colMap['example_type']] = '"' + data.example_type + '"';
    cols[colMap['practice_type']] = '"' + data.practice_type + '"';
    cols[colMap['quick_check_type']] = '"' + data.quick_check_type + '"';
    cols[colMap['difficulty_limit']] = '"' + data.difficulty_limit + '"';
    cols[colMap['required_media_type']] = '"' + data.required_media_type + '"';
    cols[colMap['optional_media_type']] = '"' + data.optional_media_type + '"';
    cols[colMap['visual_type']] = '"' + data.visual_type + '"';
    cols[colMap['visual_description']] = '"' + data.visual_description + '"';
    cols[colMap['audio_needed']] = '"' + data.audio_needed + '"';
    cols[colMap['video_needed']] = '"' + data.video_needed + '"';
    cols[colMap['media_status']] = '"' + data.media_status + '"';
    cols[colMap['fallback_required']] = '"' + data.fallback_required + '"';
    cols[colMap['human_review_needed']] = '"' + data.human_review_needed + '"';
    cols[colMap['source_pack_status']] = '"' + data.source_pack_status + '"';
    cols[colMap['safe_to_generate']] = '"' + data.safe_to_generate + '"';

    updatedLines.push(cols.join(','));
  } else {
    updatedLines.push(lines[i]);
  }
}

fs.writeFileSync(csvPath, updatedLines.join('\n'));
console.log('Updated Fractions lessons in math-lesson-map.csv');
console.log('Fractions lessons updated: ' + Object.keys(fractionsData).length);
