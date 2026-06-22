#!/usr/bin/env node
/**
 * PHASES 3-7: Comprehensive Math audit from saved data.
 * Reads docs/audits/_math2-full-data.json (produced by phase 2b).
 * No database queries. No writes to DB.
 * Produces all audit files for phases 3-7.
 */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'audits', '_math2-full-data.json')));
const auditDir = path.join(__dirname, '..', 'docs', 'audits');

console.log(`Processing ${data.length} Grade 2 Math lessons...\n`);

// ============================================================
// PHASE 3: Topic Map
// ============================================================
const topicMap = {};

for (const lesson of data) {
  const cb = lesson.contentBlocks;
  const title = lesson.title.toLowerCase();
  const strand = cb.strand || '';
  const subStrand = cb.subStrand || '';

  // Determine topic from title + strand + subStrand
  let topic = 'Uncategorized';

  if (title.includes('fraction') || title.includes('half') || title.includes('halves') || title.includes('quarter')) {
    topic = 'Fractions';
  } else if (title.includes('subtract') || title.includes('subtraction') || title.includes('minus')) {
    topic = 'Subtraction';
  } else if (title.includes('add') || title.includes('addition') || title.includes('plus') || title.includes('sum')) {
    topic = 'Addition';
  } else if (title.includes('multiply') || title.includes('multiplication') || title.includes('repeated addition') || title.includes('equal group') || title.includes('array') || title.includes('times')) {
    topic = 'Multiplication';
  } else if (title.includes('place value') || title.includes('ones') || title.includes('tens') || title.includes('hundreds') || title.includes('digit')) {
    topic = 'Place Value';
  } else if (title.includes('count') || title.includes('skip') || title.includes('number pattern') || title.includes('missing number') || title.includes('filling')) {
    topic = 'Number Patterns & Counting';
  } else if (title.includes('read') || title.includes('write') || title.includes('symbol') || title.includes('word')) {
    topic = 'Reading & Writing Numbers';
  } else if (title.includes('measur') || title.includes('length') || title.includes('metre') || title.includes('capacity') || title.includes('litre') || title.includes('mass') || title.includes('weight') || title.includes('volume')) {
    topic = 'Measurement';
  } else if (title.includes('time') || title.includes('clock') || title.includes('hour') || title.includes('minute')) {
    topic = 'Time';
  } else if (title.includes('money') || title.includes('coin') || title.includes('shilling') || title.includes('purchase') || title.includes('buy') || title.includes('sell') || title.includes('change') || title.includes('budget')) {
    topic = 'Money';
  } else if (title.includes('shape') || title.includes('line') || title.includes('curve') || title.includes('rectangle') || title.includes('circle') || title.includes('triangle') || title.includes('oval') || title.includes('square') || title.includes('pattern') || title.includes('sort') || title.includes('group')) {
    topic = 'Geometry & Patterns';
  } else if (title.includes('data') || title.includes('graph') || title.includes('pictograph') || title.includes('table') || title.includes('chart')) {
    topic = 'Data Handling';
  } else if (title.includes('word problem') || title.includes('story') || title.includes('real life') || title.includes('apply') || title.includes('application') || title.includes('community')) {
    topic = 'Word Problems & Application';
  } else if (title.includes('number concept') || title.includes('number line') || title.includes('concrete object') || title.includes('represent') || title.includes('compare') || title.includes('order')) {
    topic = 'Number Concept';
  } else {
    topic = strand || 'Other';
  }

  if (!topicMap[topic]) {
    topicMap[topic] = {
      lessons: [],
      strands: new Set(),
      subStrands: new Set(),
    };
  }
  topicMap[topic].lessons.push(lesson);
  if (strand) topicMap[topic].strands.add(strand);
  if (subStrand) topicMap[topic].subStrands.add(subStrand);
}

// Write topic map
let topicMapMd = '# Grade 2 Mathematics — Topic Map\n\n';
topicMapMd += `**Generated:** ${new Date().toISOString()}\n\n`;
topicMapMd += `**Total lessons:** ${data.length}\n\n`;

const topicOrder = Object.keys(topicMap).sort((a, b) => topicMap[b].lessons.length - topicMap[a].lessons.length);

for (const topic of topicOrder) {
  const info = topicMap[topic];
  topicMapMd += `## ${topic} (${info.lessons.length} lessons)\n\n`;
  topicMapMd += `**Strands:** ${[...info.strands].join(', ') || 'N/A'}\n`;
  topicMapMd += `**Sub-strands:** ${[...info.subStrands].join(', ') || 'N/A'}\n\n`;

  // What are these lessons trying to teach?
  topicMapMd += `**Learning outcomes:**\n`;
  const outcomes = new Set();
  for (const l of info.lessons) {
    const cb = l.contentBlocks;
    if (cb.learningOutcome) outcomes.add(cb.learningOutcome.substring(0, 120));
  }
  for (const o of [...outcomes].slice(0, 5)) {
    topicMapMd += `- ${o}\n`;
  }
  if (outcomes.size > 5) topicMapMd += `- ... and ${outcomes.size - 5} more\n`;

  topicMapMd += `\n**Lessons:**\n`;
  for (const l of info.lessons) {
    const isRecovery = (l.contentBlocks.aiMetadata?.batchId || '').includes('g2-math-hq');
    const draftSteps = (l.contentBlocks.studentJourneyDraft || []).length;
    const pubSteps = (l.contentBlocks.studentJourney || []).length;
    topicMapMd += `- ${l.title} ${isRecovery ? '[RECOVERY]' : ''} (Draft: ${draftSteps}, Pub: ${pubSteps})\n`;
  }
  topicMapMd += '\n';
}

fs.writeFileSync(path.join(auditDir, 'grade-2-math-topic-map.md'), topicMapMd);
console.log(`Phase 3: Topic map written (${topicOrder.length} topics)`);

// ============================================================
// PHASE 4: Journey Quality Audit
// ============================================================
const defects = [];
const DEFECT_COLS = [
  'lesson_id', 'title', 'journey_field', 'defect_type', 'severity', 'evidence', 'recommended_fix', 'needs_source_pack'
];

for (const lesson of data) {
  const cb = lesson.contentBlocks;
  const draft = cb.studentJourneyDraft || [];
  const published = cb.studentJourney || [];
  const title = lesson.title;
  const outcome = (cb.learningOutcome || '').toLowerCase();
  const subject = (cb.subject || '').toLowerCase();

  // Determine which journey fields to check
  const checkDraft = draft.length > 0;
  const checkPublished = published.length > 0;

  if (checkDraft) {
    checkJourney(title, lesson.id, 'studentJourneyDraft', draft, outcome, subject, cb, topicMap);
  }
  if (checkPublished) {
    checkJourney(title, lesson.id, 'studentJourney', published, outcome, subject, cb, topicMap);
  }

  function checkJourney(title, id, field, steps, outcome, subject, cb, topicMap) {
    // Step count
    if (steps.length !== 10) {
      defects.push([id, title, field, `wrong_step_count`, 'high', `${steps.length} steps (expected 10)`, 'regenerate with 10-step template', 'no']);
    }

    // Check each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepType = step.stepType || '';

      // Generic mission text
      if (stepType === 'mission') {
        const text = (step.studentText || step.owlText || '').toLowerCase();
        if (text.includes('learn something new') || text.includes('exciting adventure') || text.includes('have fun')) {
          defects.push([id, title, field, 'generic_mission', 'medium', `Step ${i+1}: generic mission text`, 'use lesson-specific mission', 'yes']);
        }
      }

      // Title-copying in studentText or owlText
      if (step.studentText && step.studentText.includes(title)) {
        defects.push([id, title, field, 'title_copying', 'low', `Step ${i+1}: studentText contains lesson title`, 'rewrite studentText', 'yes']);
      }

      // Repeated greetings
      if (stepType === 'welcome') {
        const text = (step.studentText || step.owlText || '').toLowerCase();
        if (text.includes('welcome to today') || text.includes('welcome to this') || text.includes('hello there')) {
          defects.push([id, title, field, 'generic_greeting', 'low', `Step ${i+1}: generic welcome`, 'use lesson-specific welcome', 'yes']);
        }
      }

      // MCQ issues
      if (step.interaction?.type === 'multiple_choice' || stepType === 'quick_check') {
        const mcq = step.interaction;
        if (!mcq) {
          defects.push([id, title, field, 'missing_mcq', 'critical', `Step ${i+1}: quick_check has no interaction`, 'add proper MCQ', 'yes']);
          continue;
        }
        if (!mcq.options || !Array.isArray(mcq.options) || mcq.options.length < 2) {
          defects.push([id, title, field, 'malformed_mcq_options', 'high', `Step ${i+1}: MCQ has < 2 options`, 'provide 4 answer options', 'yes']);
        }
        if (mcq.correctIndex === undefined || mcq.correctIndex === null) {
          defects.push([id, title, field, 'missing_correct_index', 'critical', `Step ${i+1}: no correctIndex`, 'set correctIndex', 'yes']);
        } else {
          const correctAns = mcq.options?.[mcq.correctIndex];
          if (!correctAns) {
            defects.push([id, title, field, 'wrong_correct_index', 'critical', `Step ${i+1}: correctIndex ${mcq.correctIndex} out of range`, 'fix correctIndex', 'yes']);
          }
          // Check mathematically wrong
          const q = (mcq.question || '').toLowerCase();
          if (q.includes('4 × 4') || q.includes('4 x 4')) {
            if (correctAns && correctAns !== '16' && !correctAns.includes('16')) {
              defects.push([id, title, field, 'wrong_math_answer', 'critical', `4×4=${correctAns} (should be 16)`, 'fix correct answer', 'yes']);
            }
          }
          if (q.includes('6 × 10') || q.includes('6 x 10')) {
            if (correctAns && correctAns !== '60' && !correctAns.includes('60')) {
              defects.push([id, title, field, 'wrong_math_answer', 'critical', `6×10=${correctAns} (should be 60)`, 'fix correct answer', 'yes']);
            }
          }
          if (q.includes('4 × 2') || q.includes('4 x 2')) {
            if (correctAns && correctAns !== '8' && !correctAns.includes('8')) {
              defects.push([id, title, field, 'wrong_math_answer', 'critical', `4×2=${correctAns} (should be 8)`, 'fix correct answer', 'yes']);
            }
          }
        }

        // Check if question matches topic
        const questionText = (mcq.question || '').toLowerCase();
        const titleLower = title.toLowerCase();
        if ((titleLower.includes('fraction') || titleLower.includes('half') || titleLower.includes('quarter')) &&
            !questionText.includes('fraction') && !questionText.includes('half') && !questionText.includes('quarter') &&
            !questionText.includes('part') && !questionText.includes('whole') && !questionText.includes('/')) {
          defects.push([id, title, field, 'qc_unrelated_to_topic', 'high', `QC doesn't match fractions topic`, 'rewrite QC for fractions', 'yes']);
        }
        if ((titleLower.includes('subtract')) &&
            !questionText.includes('-') && !questionText.includes('minus') && !questionText.includes('subtract') && !questionText.includes('left') && !questionText.includes('take away')) {
          defects.push([id, title, field, 'qc_unrelated_to_topic', 'high', `QC doesn't match subtraction topic`, 'rewrite QC for subtraction', 'yes']);
        }
        if ((titleLower.includes('add')) &&
            !questionText.includes('+') && !questionText.includes('add') && !questionText.includes('plus') && !questionText.includes('altogether') && !questionText.includes('total')) {
          defects.push([id, title, field, 'qc_unrelated_to_topic', 'high', `QC doesn't match addition topic`, 'rewrite QC for addition', 'yes']);
        }
      }

      // Answer leaks
      if (stepType === 'connect' || stepType === 'practice' || stepType === 'example') {
        const text = JSON.stringify(step).toLowerCase();
        if (text.includes('the answer is') || text.includes('correct answer is') || text.includes('equals')) {
          // Only flag if it reveals a specific numeric answer
          const ansMatch = text.match(/answer is (\d+)/);
          if (ansMatch) {
            defects.push([id, title, field, 'answer_leak', 'high', `Step ${i+1} (${stepType}) reveals answer`, 'remove answer from non-QC step', 'yes']);
          }
        }
      }
    }

    // Check for SVG/illustration
    let hasSvg = false;
    for (const step of steps) {
      if (JSON.stringify(step).includes('data:image/svg')) {
        hasSvg = true;
        break;
      }
    }
    if (!hasSvg && steps.length > 0) {
      defects.push([id, title, field, 'missing_svg', 'medium', 'No SVG illustration found in journey', 'add SVG illustrations', 'yes']);
    }

    // Check for video
    let hasVideo = false;
    for (const step of steps) {
      const stepStr = JSON.stringify(step);
      if (stepStr.includes('youtube') || stepStr.includes('youtu.be')) {
        hasVideo = true;
        break;
      }
    }
    if (!hasVideo && steps.length > 0) {
      defects.push([id, title, field, 'missing_video', 'low', 'No video URL in journey', 'add relevant YouTube video', 'yes']);
    }

    // Check for generic/old template content
    const fullJourney = JSON.stringify(steps).toLowerCase();
    if (fullJourney.includes('owl teacher says') && fullJourney.includes('welcome to today')) {
      defects.push([id, title, field, 'old_template', 'medium', 'Journey matches old generic template', 'regenerate from source pack', 'yes']);
    }
  }
}

// Write defects CSV
const defectsCsv = [DEFECT_COLS.join(',')];
for (const d of defects) {
  defectsCsv.push(d.map(v => '"' + String(v || '').replace(/"/g, '""').replace(/\n/g, ' ') + '"').join(','));
}
fs.writeFileSync(path.join(auditDir, 'grade-2-math-journey-defects.csv'), defectsCsv.join('\n'));
console.log(`Phase 4: ${defects.length} defects found, written to CSV`);

// ============================================================
// PHASE 6: Video & Visual Audit
// ============================================================
const videoAudit = [];
const visualAudit = [];

for (const lesson of data) {
  const cb = lesson.contentBlocks;
  const meta = cb.aiMetadata || {};
  const videoId = meta.videoId || '';

  // Find video in steps too
  const allSteps = [...(cb.studentJourneyDraft || []), ...(cb.studentJourney || [])];
  let videoInSteps = '';
  for (const step of allSteps) {
    const s = JSON.stringify(step);
    const m = s.match(/https?:\/\/[^\s"'<>]*(?:youtube\.com|youtu\.be)[^\s"'<>]*/);
    if (m) { videoInSteps = m[0]; break; }
  }

  const finalVideoId = videoId || (videoInSteps.match(/[a-zA-Z0-9_-]{11}/)?.[0] || '');
  const videoUrl = finalVideoId ? `https://www.youtube.com/watch?v=${finalVideoId}` : '';

  videoAudit.push({
    lesson_id: lesson.id,
    title: lesson.title,
    video_id: finalVideoId,
    video_url: videoUrl,
    expected_topic: Object.keys(topicMap).find(k => topicMap[k].lessons.includes(lesson)) || '',
    in_ai_metadata: !!videoId,
    in_steps: !!videoInSteps,
    needs_human_review: true,
    reusable: false,
  });

  // Visual/SVG audit
  let hasSvg = false;
  let svgGeneric = false;
  let svgMatches = 0;
  let svgTotal = 0;
  for (const step of allSteps) {
    const s = JSON.stringify(step);
    if (s.includes('data:image/svg')) {
      hasSvg = true;
      svgTotal++;
      // Check if SVG is generic (no lesson-specific content)
      if (s.includes('default') || s.includes('placeholder')) {
        svgGeneric = true;
      } else {
        svgMatches++;
      }
    }
  }

  visualAudit.push({
    lesson_id: lesson.id,
    title: lesson.title,
    has_svg: hasSvg,
    svg_count: svgTotal,
    svg_generic: svgGeneric,
    svg_useful: svgMatches > 0,
    needs_replacement: !hasSvg || svgGeneric,
  });
}

// Write video audit CSV
const videoCsv = ['lesson_id,title,video_id,video_url,expected_topic,in_ai_metadata,in_steps,needs_human_review,reusable'];
for (const v of videoAudit) {
  videoCsv.push([v.lesson_id, v.title, v.video_id, v.video_url, v.expected_topic, v.in_ai_metadata, v.in_steps, v.needs_human_review, v.reusable].map(x => '"' + String(x || '').replace(/"/g, '""') + '"').join(','));
}
fs.writeFileSync(path.join(auditDir, 'grade-2-math-video-audit.csv'), videoCsv.join('\n'));

// Write visual audit CSV
const visualCsv = ['lesson_id,title,has_svg,svg_count,svg_generic,svg_useful,needs_replacement'];
for (const v of visualAudit) {
  visualCsv.push([v.lesson_id, v.title, v.has_svg, v.svg_count, v.svg_generic, v.svg_useful, v.needs_replacement].map(x => '"' + String(x || '').replace(/"/g, '""') + '"').join(','));
}
fs.writeFileSync(path.join(auditDir, 'grade-2-math-visual-audit.csv'), visualCsv.join('\n'));

console.log(`Phase 6: Video audit (${videoAudit.length} lessons), Visual audit (${visualAudit.length} lessons)`);

// ============================================================
// Count unique videos for reuse analysis
// ============================================================
const videoCounts = {};
for (const v of videoAudit) {
  if (v.video_id) {
    if (!videoCounts[v.video_id]) videoCounts[v.video_id] = [];
    videoCounts[v.video_id].push(v.title);
  }
}
console.log(`  Unique videos: ${Object.keys(videoCounts).length}`);
for (const [vid, titles] of Object.entries(videoCounts)) {
  if (titles.length > 1) console.log(`  ⚠️  ${vid} reused in ${titles.length} lessons`);
}

// ============================================================
// PHASE 7: Source Pack Needs
// ============================================================
let sourcePackMd = '# Grade 2 Mathematics — Source Pack Information Needs\n\n';
sourcePackMd += `**Generated:** ${new Date().toISOString()}\n\n`;
sourcePackMd += `This report identifies what information we need to create manually before building the Math source pack.\n\n`;

const sourcePackAreas = {
  'Number Concept': {
    has_outcomes: topicMap['Number Concept']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['child-friendly goal', 'concrete object examples (stones, sticks, bottle caps)', 'vocabulary: represent, show, count', 'Grade 2 range: 1-1000'],
  },
  'Reading & Writing Numbers': {
    has_outcomes: topicMap['Reading & Writing Numbers']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['number-word mapping table', 'place value chart examples', 'common errors (reversing digits)', 'Grade 2 range: 1-1000'],
  },
  'Place Value': {
    has_outcomes: topicMap['Place Value']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['base-ten block diagrams', 'tens and ones decomposition', 'vocabulary: tens, ones, digit, value', 'common error: 6 vs 60'],
  },
  'Number Patterns & Counting': {
    has_outcomes: topicMap['Number Patterns & Counting']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['skip counting rules (2s, 5s, 10s)', 'number line usage', 'pattern recognition examples', 'missing number strategies'],
  },
  'Addition': {
    has_outcomes: topicMap['Addition']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['without regrouping method', 'with regrouping method (carrying)', 'number line addition', 'word problem templates', 'max: 3-digit + 3-digit'],
  },
  'Subtraction': {
    has_outcomes: topicMap['Subtraction']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['without regrouping method', 'with regrouping method (borrowing)', 'number line subtraction', 'NO negative answers — Grade 2 rule', 'word problem templates'],
  },
  'Multiplication': {
    has_outcomes: topicMap['Multiplication']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['equal groups model', 'repeated addition connection', 'arrays', 'vocabulary: groups of, times, multiply', 'max: 5 × 5 and 10 × 10'],
  },
  'Fractions': {
    has_outcomes: topicMap['Fractions']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['halves: equal parts of a whole', 'quarters: four equal parts', 'vocabulary: half, quarter, equal parts, fraction', 'NO fraction arithmetic in Grade 2', 'real-life examples (food, shapes)'],
  },
  'Measurement': {
    has_outcomes: topicMap['Measurement']?.lessons.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['length: metres, centimetres', 'capacity: litres', 'mass: kilograms', 'classroom object references', 'non-standard units first', 'measuring tools'],
  },
  'Time': {
    has_outcomes: topicMap['Time']?.lessons?.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['clock reading: hour and minute', 'vocabulary: o\'clock, half past', 'days of week, months of year', 'NO 24-hour time in Grade 2'],
  },
  'Money': {
    has_outcomes: topicMap['Money']?.lessons?.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['Kenyan shillings: coins and notes', 'counting money', 'simple purchases', 'change calculation', 'real-market examples'],
  },
  'Geometry & Patterns': {
    has_outcomes: topicMap['Geometry & Patterns']?.lessons?.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['shapes: rectangle, circle, triangle, oval, square', 'straight and curved lines', 'sorting by attributes', 'pattern creation'],
  },
  'Word Problems & Application': {
    has_outcomes: topicMap['Word Problems & Application']?.lessons?.some(l => l.contentBlocks.learningOutcome) || false,
    needs: ['Kenyan context problems', 'step-by-step solving', 'real-life scenarios (market, home, school)'],
  },
};

for (const [topic, info] of Object.entries(sourcePackAreas)) {
  const lessons = topicMap[topic]?.lessons || [];
  if (lessons.length === 0) continue;

  sourcePackMd += `## ${topic} (${lessons.length} lessons)\n\n`;
  sourcePackMd += `**Has learning outcomes in DB:** ${info.has_outcomes ? 'YES' : 'NO'}\n\n`;
  sourcePackMd += `**Information needed for source pack:**\n`;
  for (const need of info.needs) {
    sourcePackMd += `- [ ] ${need}\n`;
  }
  sourcePackMd += `\n**Lessons in this topic:**\n`;
  for (const l of lessons) {
    sourcePackMd += `- ${l.title}\n`;
  }

  // What's already available?
  const sampleLesson = lessons[0];
  const cb = sampleLesson.contentBlocks;
  sourcePackMd += `\n**Currently available from DB:**\n`;
  sourcePackMd += `- Learning outcome: ${cb.learningOutcome ? 'YES' : 'NO'}\n`;
  sourcePackMd += `- Activities: ${cb.suggestedLearningExperience ? 'YES' : 'NO'}\n`;
  sourcePackMd += `- Activity instructions: ${cb.activityInstructions ? 'YES' : 'NO'}\n`;
  sourcePackMd += `- Key inquiry question: ${cb.keyInquiryQuestion ? 'YES' : 'NO'}\n`;
  sourcePackMd += `- Assessment method: ${cb.assessmentMethod ? 'YES' : 'NO'}\n\n`;
}

fs.writeFileSync(path.join(auditDir, 'grade-2-math-source-pack-needs.md'), sourcePackMd);
console.log(`Phase 7: Source pack needs written`);
