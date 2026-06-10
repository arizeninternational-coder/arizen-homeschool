/**
 * Fix remaining Grade 2 Math journey issues:
 * 1. Shapes journey: 11 steps → 10 (merge two practice steps)
 * 2. Subtracting step 4: change "the answer is" to "is the same as"
 * 3. Adding horizontally step 4: change "the answer is" to "is the same as"
 */

const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n').filter(l => l.trim());
const envObj = {};
lines.forEach(l => {
  const idx = l.indexOf('=');
  if (idx > 0) envObj[l.substring(0, idx)] = l.substring(idx + 1);
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envObj['NEXT_PUBLIC_SUPABASE_URL'], envObj['NEXT_PUBLIC_SUPABASE_ANON_KEY']);

async function main() {
  let fixed = 0;

  // === FIX 1: Shapes journey — merge steps 7+8 (two practice steps → one) ===
  console.log('--- Fix 1: Shapes 11→10 steps ---');
  const { data: shapes } = await db
    .from('Lesson')
    .select('id, contentBlocks')
    .eq('slug', 'g2-mathematics-identifying-rectangles-circles-triangles-ovals-and-squares')
    .single();

  if (shapes) {
    const cb = typeof shapes.contentBlocks === 'string' ? JSON.parse(shapes.contentBlocks) : shapes.contentBlocks;
    const journey = cb.studentJourneyDraft || cb.studentJourney;
    const steps = Array.isArray(journey) ? journey : (journey?.steps || []);

    if (steps.length === 11) {
      // Merge step 8 (index 7, "Try It Yourself: Draw and Color") into step 7 (index 6, "Try Together: Shape Hunt")
      const merged = {
        ...steps[6],
        title: 'Shape Hunt & Draw',
        studentText: steps[6].studentText + '\n\n' + steps[7].studentText,
        owlText: steps[6].owlText + ' ' + steps[7].owlText,
        materials: [...(steps[6].materials || []), ...(steps[7].materials || [])],
      };

      // Remove step 8 (index 7), keep merged step 7
      const newSteps = [...steps];
      newSteps[6] = merged;
      newSteps.splice(7, 1); // remove the duplicate practice step

      // Update the journey
      if (Array.isArray(journey)) {
        cb.studentJourneyDraft = newSteps;
      } else {
        cb.studentJourneyDraft = { ...journey, steps: newSteps };
      }

      const { error } = await db
        .from('Lesson')
        .update({ contentBlocks: JSON.stringify(cb) })
        .eq('id', shapes.id);

      if (error) {
        console.log('  ERROR:', error.message);
      } else {
        console.log('  ✓ Merged practice steps. Now ' + newSteps.length + ' steps.');
        fixed++;
      }
    } else {
      console.log('  Already ' + steps.length + ' steps, skipping.');
    }
  }

  // === FIX 2: Subtracting step 4 — change "the answer is" phrasing ===
  console.log('--- Fix 2: Subtracting step 4 owlText ---');
  const { data: sub } = await db
    .from('Lesson')
    .select('id, contentBlocks')
    .eq('slug', 'g2-mathematics-subtracting-single-digit-numbers')
    .single();

  if (sub) {
    const cb = typeof sub.contentBlocks === 'string' ? JSON.parse(sub.contentBlocks) : sub.contentBlocks;
    const journey = cb.studentJourneyDraft || cb.studentJourney;
    const steps = Array.isArray(journey) ? journey : (journey?.steps || []);

    // Step 4 is index 3
    const step4 = steps[3];
    if (step4 && step4.owlText && step4.owlText.includes("the answer is")) {
      const oldText = step4.owlText;
      step4.owlText = "The − sign means take away. The = sign means 'is the same as'. So 7 − 2 = 5!";

      if (Array.isArray(journey)) {
        cb.studentJourneyDraft = steps;
      } else {
        cb.studentJourneyDraft = { ...journey, steps };
      }

      const { error } = await db
        .from('Lesson')
        .update({ contentBlocks: JSON.stringify(cb) })
        .eq('id', sub.id);

      if (error) {
        console.log('  ERROR:', error.message);
      } else {
        console.log('  ✓ Changed: "' + oldText.substring(0, 60) + '..."');
        console.log('    To:      "' + step4.owlText.substring(0, 60) + '..."');
        fixed++;
      }
    } else {
      console.log('  No change needed or step not found.');
    }
  }

  // === FIX 3: Adding horizontally step 4 — change "the answer is" phrasing ===
  console.log('--- Fix 3: Adding horizontally step 4 owlText ---');
  const { data: add } = await db
    .from('Lesson')
    .select('id, contentBlocks')
    .eq('slug', 'g2-mathematics-adding-single-digit-numbers-horizontally')
    .single();

  if (add) {
    const cb = typeof add.contentBlocks === 'string' ? JSON.parse(add.contentBlocks) : add.contentBlocks;
    const journey = cb.studentJourneyDraft || cb.studentJourney;
    const steps = Array.isArray(journey) ? journey : (journey?.steps || []);

    const step4 = steps[3];
    if (step4 && step4.owlText && step4.owlText.includes("the answer is")) {
      const oldText = step4.owlText;
      step4.owlText = "The + sign means put together. The = sign means 'is the same as'.";

      if (Array.isArray(journey)) {
        cb.studentJourneyDraft = steps;
      } else {
        cb.studentJourneyDraft = { ...journey, steps };
      }

      const { error } = await db
        .from('Lesson')
        .update({ contentBlocks: JSON.stringify(cb) })
        .eq('id', add.id);

      if (error) {
        console.log('  ERROR:', error.message);
      } else {
        console.log('  ✓ Changed: "' + oldText.substring(0, 60) + '..."');
        console.log('    To:      "' + step4.owlText.substring(0, 60) + '..."');
        fixed++;
      }
    } else {
      console.log('  No change needed or step not found.');
    }
  }

  console.log('\\n=== DONE: ' + fixed + ' fixes applied ===');
}

main().catch(e => console.error('FATAL:', e.message));
