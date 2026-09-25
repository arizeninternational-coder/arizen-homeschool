// Diagnostic: Check journey steps, concept mappings, and potential crash points
const { buildPlaceValueJourney } = require('./src/lib/curriculum/grade4-journeys.ts');
const { STEP_TYPE_ICONS } = require('./src/lib/curriculum/lesson-journey.ts');
const { STEP_CONCEPT_MAPPINGS, getStepConceptMapping } = require('./src/lib/curriculum/step-concept-mappings.ts');
const { buildAdaptivePlaceValueJourney } = require('./src/lib/curriculum/adaptive-journey.ts');

try {
  const steps = buildPlaceValueJourney();
  console.log('=== Journey Steps ===');
  steps.forEach((s, i) => {
    console.log(`Index ${i}: id=${s.id}, stepType=${s.stepType}, title=${s.title}, interactionSpec.type=${s.interactionSpec?.type}`);
  });
  
  console.log('\n=== STEP_TYPE_ICONS ===');
  const allTypes = [...new Set(steps.map(s => s.stepType))];
  allTypes.forEach(t => {
    console.log(`  ${t}: ${STEP_TYPE_ICONS[t] !== undefined ? 'OK' : 'MISSING!'}`);
  });
  
  console.log('\n=== Concept Mappings ===');
  steps.forEach(s => {
    const mapping = getStepConceptMapping(s.id);
    console.log(`  ${s.id}: conceptId=${mapping?.conceptId || 'NO MAPPING'}`);
  });
  
  console.log('\n=== Adaptive Journey ===');
  const adaptiveResult = buildAdaptivePlaceValueJourney('Grade 4 Place Value', '');
  console.log(`Steps count: ${adaptiveResult.steps.length}`);
  console.log(`adaptiveInserted: ${adaptiveResult.adaptiveInserted}`);
  console.log(`remediationStepIds: ${adaptiveResult.remediationStepIds}`);
} catch(e) {
  console.error('ERROR:', e.message);
  console.error('Stack:', e.stack);
}
