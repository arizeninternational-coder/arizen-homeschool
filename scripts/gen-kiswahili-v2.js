#!/usr/bin/env node
/**
 * Grade 2 Kiswahili Journey Generator — ALL 90 lessons
 * Generates lesson-specific journeys in Kiswahili.
 * Fixed: step() calls now use proper mcq() in extra parameter.
 */
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const t = line.trim();
  if (!t || t.startsWith('#')) return;
  const eqIdx = t.indexOf('=');
  if (eqIdx === -1) return;
  envVars[t.slice(0, eqIdx).trim()] = t.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
});
const { createClient } = require('@supabase/supabase-js');
const db = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const BATCH_ID = 'g2-kiswahili-v2';

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(p) { return { type: 'open_response', prompt: p, placeholder: 'Andika hapa...' }; }

function buildJourney(title, strand, subStrand, questTitle) {
  const t = (title || '').toLowerCase();
  const s = (strand || '').toLowerCase();
  const ss = (subStrand || '').toLowerCase();

  // Helper to create a standard 10-step journey with specific content
  const j = (welcomeS, welcomeO, missionS, missionO, thinkS, thinkO, learnS, learnO, connectS, connectO, exampleS, exampleO, practiceS, practiceO, qc, reflectS, reflectO, completeS, completeO) => [
    step('welcome', 'Karibu!', welcomeS, welcomeO),
    step('mission', 'Lengo Letu', missionS, missionO),
    step('think_first', 'Fanya Kwanza!', thinkS, thinkO, { interaction: openResp(thinkS.substring(0, 80)) }),
    step('learn', 'Jifunza', learnS, learnO),
    step('connect', 'Uhusiano na Maisha Halisi', connectS, connectO),
    step('example', 'Tufanye Pamoja', exampleS, exampleO),
    step('practice', 'Fanya Wewe!', practiceS, practiceO),
    step('quick_check', 'Ukaguzi Mfupi!', qc.q, qc.o, { interaction: mcq(qc.question, qc.options, qc.correct, qc.explanation) }),
    step('reflect', 'Fikira kuhusu Jifunzo Lako', reflectS, reflectO, { interaction: openResp(reflectS.substring(0, 80)) }),
    step('complete', 'Hongera!', completeS, completeO),
  ];

  // === SAUTI NA HERUFI / ALFABETI ===
  if (s.includes('sauti') || s.includes('herufi') || s.includes('alfabeti')) {
    const soundMatch = title.match(/\/([a-z']+)\//g);
    const sounds = soundMatch ? soundMatch.join(', ') : 'sauti';
    return j(
      `Habari, rafiki! 🔤 Leo tutajifunza kuhusu sauti ${sounds} na herufi zake. Tutasikiliza, tusome, na kuandika!`,
      `Habari! Mimi ni OWL. Leo tutajifunza sauti na herufi mpya.`,
      `Mwisho wa somo hili, utaweza kutambua na kusoma sauti ${sounds} kwa usahihi!`,
      `Lengo letu ni kujua sauti na herufi za Kiswahili.`,
      `Unajua herufi gani za Kiswahili? Tuoneshe!`,
      `Tufikirie: unajua sauti na herufi gani?`,
      `Kila herufi ina sauti yake. Tunasikiliza sauti, kisha tunasoma herufi, kisha tunasoma maneno yenye herufi hizo.`,
      `Kumbuka: kila herufi ina sauti. Tunasikiliza sauti, kisha tunasoma herufi.`,
      `Unapoaandika barua, unatumia herufi. Herufi zinaotumika kila siku!`,
      `Herufi zinaotumika kila siku — kuandika, kusoma, kuongea.`,
      `Nitakusikiliza sauti, wewe unaniambia herufi. Tayari?`,
      `Sikiliza sauti, kisha sema herufi. Unafanya vizuri!`,
      `Zoezi: Andika herufi 5 kwa sauti zinazotolewa.`,
      `Unafanya vizuri! Endelea kufanya mazoezi.`,
      { q: `Sauti inawakilishwa na herufi gani?`, o: 'Hili ni somo la ukaguzi! Chagua jibu sahihi.', question: `Sauti inawakilishwa na herufi gani?`, options: ['A', 'B', 'C', 'D'], correct: 0, explanation: 'Sahihi! Herufi inawakilishwa sahihi.' },
      `Ulifunza nini kuhusu sauti na herufi leo?`,
      `Umefanya kazi nzuri leo! Unajua sauti na herufi zaidi sasa.`,
      `Hongera! 🎉 Umefunza sauti na herufi za Kiswahili!`,
      `Hongera, rafiki! Nilifurahi na kazi yako leo!`
    );
  }

  // === KUSIKILIZA NA KUZUNGUMAZA ===
  if (s.includes('kusikiliza') || s.includes('kuzungumza')) {
    if (ss.includes('hadithi') || ss.includes('simulia') || ss.includes('masimulizi')) {
      return j(
        `Habari, rafiki! 👂 Leo tutajifunza kusikiliza na kusimulia hadithi. Tutasikiliza kwa makini na kisha tutasimulia!`,
        `Habari! Mimi ni OWL. Leo tutajifunza kusikiliza na kusimulia hadithi.`,
        `Mwisho wa somo hili, utaweza kusikiliza hadithi na kueleza kile kilichotokea!`,
        `Lengo letu ni kujua kusikiliza na kusimulia hadithi.`,
        `Unapomsikiliza mtu anasimulia hadithi, unafanya nini ili kuelewa?`,
        `Tufikirie: wakati wa kusikiliza hadithi, tunasikiliza kwa makini na kuelewa.`,
        `Wakati tunasikiliza hadhati, tunasikiliza kwa makini. Tunauliza: Nani? Nini? Lini? Wapi? Kisha tunasimulia kwa maneno yetu.`,
        `Kumbuka: sikiliza kwa makini, kisha simulia kwa maneno yako.`,
        `Nyumbani, unapomsikiliza mama anasimulia hadithi, unaweza kumwambia kile ulichosikia.`,
        `Kusimulia hadithi ni muhimu sana. Tunasimulia hadithi kila siku.`,
        `Nitasimulia hadithi fupi. Sikiliza kwa makini. Kisha utanisimulia mimi.`,
        `Unasikiliza vizuri! Sasa simulia hadithi kwa maneno yako.`,
        `Zoezi: Sikiliza hadithi kutoka kwa mtu nyumbani. Kisha simulia hadithi hiyo kwa rafiki yako.`,
        `Unafanya vizuri! Endelea kusikiliza na kusimulia.`,
        { q: `Tunapaswa kufanya nini ya kwanza wakati wa kusikiliza hadithi?`, o: 'Hili ni somo la ukaguzi! Chagua jibu sahihi.', question: 'Tunapaswa kufanya nini ya kwanza?', options: ['Kusoma kitabu', 'Kusikiliza kwa makini', 'Kuandika barua', 'Kuruka'], correct: 1, explanation: 'Sahihi! Tunasikiliza kwa makini ya kwanza!' },
        `Ulifunza nini kuhusu kusikiliza na kusimulia hadithi?`,
        `Umefanya kazi nzuri leo!`,
        `Hongera! 🎉 Umefunza kusikiliza na kusimulia hadithi.`,
        `Hongera, rafiki!`
      );
    }
    // Generic listening/speaking
    return j(
      `Habari, rafiki! 👂🗣️ Leo tutajifunza ${title.toLowerCase()}. Tutasikiliza na kuzungumza kwa Kiswahili!`,
      `Habari! Mimi ni OWL. Leo tutajifunza pamoja.`,
      `Mwisho wa somo hili, utaweza ${title.toLowerCase()} kwa Kiswahili sanifu!`,
      `Lengo letu ni kujua ${title.toLowerCase()}.`,
      `Unajua nini kuhusu ${title.toLowerCase()}? Tuoneshe!`,
      `Tufikirie: unajua nini?`,
      `Leo tutajifunza ${title.toLowerCase()}. Tunasikiliza, tunazungumza, na kufanya mazoezi.`,
      `Kumbuka: tunasikiliza kwa makini na kuzungumza kwa usahihi.`,
      `Unatumia ${title.toLowerCase()} wapi nyumbani au shulene?`,
      `Tunatumia hii kila siku!`,
      `Nitaonyesha mfano. Angalia kwa makini!`,
      `Angalia, kisha wewe utajaribu!`,
      `Zoezi: Jaribu kufanya ${title.toLowerCase()} yako mwenyewe.`,
      `Unafanya vizuri!`,
      { q: `Ulifunza nini leo?`, o: 'Hili ni somo la ukaguzi!', question: 'Ulifunza nini leo?', options: ['Sijifunza kitu', 'Nilifunza ' + title.toLowerCase(), 'Nilijua yote', 'Sikusikiliza'], correct: 1, explanation: 'Sahihi! Ulifunza ' + title.toLowerCase() + '!' },
      `Ulifunza nini leo?`,
      `Umefanya kazi nzuri!`,
      `Hongera! 🎉 Umefunza ${title.toLowerCase()}!`,
      `Hongera, rafiki!`
    );
  }

  // === MSAMIATI ===
  if (s.includes('msamiati')) {
    return j(
      `Habari, rafiki! 📝 Leo tutajifunza maneno mapya ya Kiswahili yanayohusiana na ${title.toLowerCase()}.`,
      `Habari! Mimi ni OWL. Leo tutajifunza msamiati mpya.`,
      `Mwisho wa somo hili, utaweza kutumia maneno mapya ya Kiswahili kwa usahihi!`,
      `Lengo letu ni kujua msamiati mpya.`,
      `Unajua maneno gani ya Kiswahili yanayohusiana na ${title.toLowerCase()}?`,
      `Tufikirie: unajua maneno gani?`,
      `Leo tutajifunza maneno mapya. Tunasikiliza matamshi, tunasoma maneno, na kuandika. Kisha tunatumia maneno katika sentensi.`,
      `Kumbuka: sikiliza matamshi, soma maneno, andika, kisha tumia katika sentensi.`,
      `Unatumia maneno ya Kiswahili wapi nyumbani au shulene?`,
      `Msamiati ni muhimu kwa mawasiliano yetu ya kila siku.`,
      `Nitasema neno, wewe unalitaja maana. Kisha tunalitumia katika sentensi.`,
      `Unafanya vizuri!`,
      `Zoezi: Andika maneno 5 mapya na uyatumie katika sentensi.`,
      `Unafanya vizuri!`,
      { q: `Kwa nini msamiati ni muhimu?`, o: 'Hili ni somo la ukaguzi!', question: 'Kwa nini msamiati ni muhimu?', options: ['Si muhimu', 'Kwa mawasiliano yetu ya kila siku', 'Kwa kuandika tu', 'Kwa kusoma tu'], correct: 1, explanation: 'Sahihi! Msamiati ni muhimu kwa mawasiliano.' },
      `Ulifunza maneno gani mapya leo?`,
      `Umefanya kazi nzuri!`,
      `Hongera! 🎉 Umefunza msamiati mpya ya Kiswahili!`,
      `Hongera, rafiki!`
    );
  }

  // === KUSOMA ===
  if (s.includes('kusoma')) {
    return j(
      `Habari, rafiki! 📖 Leo tutajifunza kusoma kwa Kiswahili. Tutasoma kwa makini na kuelewa kile tunachosoma!`,
      `Habari! Mimi ni OWL. Leo tutajifunza kusoma pamoja.`,
      `Mwisho wa somo hili, utaweza kusoma na kuelewa maandiko ya Kiswahili kwa usahihi!`,
      `Lengo letu ni kuwa wasomaji bora.`,
      `Unapendelea kusoma nini? Unajua kusoma kwa Kiswahili?`,
      `Tufikirie: unajua kusoma? Tuoneshe!`,
      `Wakati tunasoma, tunasoma kwa makini. Tunauliza: Hii inasema nini? Tunatafuta maana ya maneno.`,
      `Kumbuka: soma kwa makini, uliza "Hii inasema nini?" kisha jibu maswali.`,
      `Unapotea wapi unaposoma? Nyumbani? Shulene? Kusoma kunasaidia kila siku!`,
      `Kusoma kinafanyika kila siku — kusoma barua, vitabu, maandiko.`,
      `Nitasoma kifupi. Sikiliza kwa makini. Kutanitaka kujibu maswali.`,
      `Sikiliza kwa makini, kisha utajibu maswali.`,
      `Zoezi: Soma kifupi kwa Kiswahili. Kisha jibu maswali 5 kuhusu kile ulichosoma.`,
      `Unafanya vizuri!`,
      { q: `Tunapaswa kufanya nini wakati wa kusoma?`, o: 'Hili ni somo la ukaguzi!', question: 'Tunapaswa kufanya nini wakati wa kusoma?', options: ['Kusoma kwa sauti tu', 'Kusoma kwa makini na kuelewa', 'Kuruka maneno magumu', 'Kusoma haraka'], correct: 1, explanation: 'Sahihi! Tunasoma kwa makini na kuelewa!' },
      `Ulifunza nini kuhusu kusoma?`,
      `Umefanya kazi nzuri!`,
      `Hongera! 🎉 Umefunza kusoma kwa Kiswahili.`,
      `Hongera, rafiki!`
    );
  }

  // === KUANDIKA ===
  if (s.includes('kuandika')) {
    return j(
      `Habari, rafiki! ✏️ Leo tutajifunza kuandika kwa Kiswahili. Tutakuandika kwa usanifu na kwa usahihi!`,
      `Habari! Mimi ni OWL. Leo tutajifunza kuandika pamoja.`,
      `Mwisho wa somo hili, utaweza kuandika kwa Kiswahili kwa usahihi na kwa usanifu!`,
      `Lengo letu ni kuwa waandishi bora.`,
      `Unapendelea kuandika nini? Unajua kuandika sentensi za Kiswahili?`,
      `Tufikirie: unajua kuandika? Tuoneshe!`,
      `Wakati tunakuandika, tunakuandika kwa makini. Tunatumia herufi kubwa mwanzoni wa sentensi. Tunatumia nukta mwisho.`,
      `Kumbuka: herufi kubwa mwanzoni, nukta mwisho, soma kile ulichokuandika.`,
      `Unapotea wapi unapoandika? Nyumbani? Shulene? Kuandika kunasaidia kila siku!`,
      `Kuandika kinafanyika kila siku — kuandika barua, orodha, sentensi.`,
      `Nitaandika sentensi. Angalia kwa makini. Kisha wewe utaandika sentensi yako.`,
      `Angalia, kisha uandike!`,
      `Zoezi: Andika sentensi 5 kwa Kiswahili. Tumia maneno uliyojifunza leo.`,
      `Unafanya vizuri!`,
      { q: `Tunapaswa kutumia nini mwanzoni wa sentensi?`, o: 'Hili ni somo la ukaguzi!', question: 'Tunapaswa kutumia nini mwanzoni wa sentensi?', options: ['Herufi ndogo', 'Herufi kubwa', 'Nukta', 'Alama ya mshazari'], correct: 1, explanation: 'Sahihi! Herufi kubwa mwanzoni wa sentensi!' },
      `Ulifunza nini kuhusu kuandika?`,
      `Umefanya kazi nzuri!`,
      `Hongera! 🎉 Umefunza kuandika kwa Kiswahili.`,
      `Hongera, rafiki!`
    );
  }

  // === SARUFI ===
  if (s.includes('sarufi')) {
    return j(
      `Habari, rafiki! 📝 Leo tutajifunza sarufi ya Kiswahili — kanuni za lugha.`,
      `Habari! Mimi ni OWL. Leo tutajifunza sarufi pamoja.`,
      `Mwisho wa somo hili, utaweza kutumia kanuni za sarufi ya Kiswahili kwa usahihi!`,
      `Lengo letu ni kujua sarufi.`,
      `Unajua kanuni gani za Kiswahili? Kwa mfano, unajua kuhusu ngeli au nyakati?`,
      `Tufikirie: unajua nini kuhusu sarufi?`,
      `Sarufi ni kanuni za lugha. Kwa mfano: ngeli za nomino, nyakati za vitenzi, na kanuni zingine.`,
      `Kumbuka: sarufi ni kanuni za lugha. Tunajifunza kanuni, kisha tunazitumia.`,
      `Unatumia sarufi wakati wote — wakati unazungumza, unaposoma, na unapoandika.`,
      `Sarufi inasaidia kuwaelewa wengine!`,
      `Nitaonyesha mfano wa kanuni. Angalia kwa makini.`,
      `Angalia, kisha ujaribu!`,
      `Zoezi: Andika sentensi 5 kutumia kanuni ya sarufi uliyojifunza leo.`,
      `Unafanya vizuri!`,
      { q: `Sarufi ni nini?`, o: 'Hili ni somo la ukaguzi!', question: 'Sarufi ni nini?', options: ['Maneno mapya', 'Kanuni za lugha', 'Hadithi fupi', 'Sauti za herufi'], correct: 1, explanation: 'Sahihi! Sarufi ni kanuni za lugha!' },
      `Ulifunza kanuni gani za sarufi leo?`,
      `Umefanya kazi nzuri!`,
      `Hongera! 🎉 Umefunza sarufi ya Kiswahili!`,
      `Hongera, rafiki!`
    );
  }

  // === TATHMINI ===
  if (s.includes('tathmini')) {
    return j(
      `Habari, rafiki! 🌟 Leo tutapima yote tuliyojifunza. Tutasikiliza, tusome, tuandike, na tuzungumze kwa Kiswahili!`,
      `Habari! Mimi ni OWL. Leo tutapima yote tuliyojifunza.`,
      `Mwisho wa somo hili, utaweza kuonyesha yote uliyojifunza kwa Kiswahili!`,
      `Lengo letu ni kuonyesha yote tunayojua.`,
      `Ulifunza nini mwezi huu? Unaweza kukumbuka mada kubwa?`,
      `Tufikirie: tulifunza nini? Tuoneshe!`,
      `Leo tutapima yote tuliyojifunza. Hii inatusaidia kukumbuka na kujua tunachohitaji kujifunza zaidi.`,
      `Kumbuka: tathmini inasaidia kujua tunachohitaji kujifunza zaidi.`,
      `Unapima wapi maarifa yako? Shulene? Nyumbani?`,
      `Tathmini ni sehemu ya kujifunza.`,
      `Nitakuuliza maswali kuhusu yote tuliyojifunza. Jibu kwa ujasiri!`,
      `Jibu kwa ujasiri! Unajua mengi!`,
      `Zoezi: Jibu maswali 10 kuhusu yote uliyojifunza mwezi huu.`,
      `Unafanya vizuri!`,
      { q: `Kwa nini tathmini ni muhimu?`, o: 'Hili ni somo la ukaguzi!', question: 'Kwa nini tathmini ni muhimu?', options: ['Si muhimu', 'Inasaidia kujua tunachohitaji kujifunza zaidi', 'Inasaidia kushindwa', 'Inasaidia kuogopa'], correct: 1, explanation: 'Sahihi! Tathmini inasaidia kujua tunachohitaji kujifunza zaidi!' },
      `Ulifunza nini mwezi huu? Unajua nini sasa?`,
      `Umefanya kazi nzuri!`,
      `Hongera! 🎉 Umepima yote uliyojifunza. Hongera sana!`,
      `Hongera, rafiki! Nilifurahi sana na kazi yako!`
    );
  }

  // === FALLBACK ===
  return j(
    `Habari, rafiki! 📚 Leo tutajifunza ${title.toLowerCase()}. Tayari?`,
    `Habari! Mimi ni OWL. Leo tutajifunza pamoja.`,
    `Mwisho wa somo hili, utaweza ${title.toLowerCase()} kwa Kiswahili sanifu!`,
    `Lengo letu ni kujua ${title.toLowerCase()}.`,
    `Unajua nini kuhusu ${title.toLowerCase()}?`,
    `Tufikirie: unajua nini?`,
    `Leo tutajifunza ${title.toLowerCase()}. Tayari?`,
    `Hile unayohitaji kujua.`,
    `Unatumia ${title.toLowerCase()} wapi?`,
    `Tunatumia hii kila siku!`,
    `Nitaonyesha mfano. Angalia!`,
    `Angalia, kisha ujaribu!`,
    `Zoezi: Jaribu kufanya yako mwenyewe.`,
    `Unafanya vizuri!`,
    { q: `Ulifunza nini leo?`, o: 'Hili ni somo la ukaguzi!', question: 'Ulifunza nini leo?', options: ['Sijifunza kitu', 'Nilifunza ' + title.toLowerCase(), 'Nilijua yote', 'Sikusikiliza'], correct: 1, explanation: 'Sahihi!' },
    `Ulifunza nini leo?`,
    `Umefanya kazi nzuri!`,
    `Hongera! 🎉 Umefunza ${title.toLowerCase()}!`,
    `Hongera, rafiki!`
  );
}

async function main() {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', 'g2-kiswahili').single();
  if (!theme) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id').eq('themeId', theme.id);
  if (!quests?.length) { console.error('No quests'); process.exit(1); }

  let all = [], off = 0;
  while (true) {
    const { data, error } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q=>q.id)).order('orderIndex').range(off, off+199);
    if (error) { console.error(error); process.exit(1); }
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }

  console.log('Generating journeys for ' + all.length + ' Kiswahili lessons...\n');

  let saved = 0, errors = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const strand = meta.strand || '';
    const subStrand = meta.subStrand || '';
    const questTitle = meta.questTitle || '';
    const journey = buildJourney(l.title, strand, subStrand, questTitle);

    const upd = { ...meta, studentJourneyDraft: journey, aiMetadata: { batchId: BATCH_ID, generatedAt: new Date().toISOString(), generator: 'kiswahili-v2' } };
    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title.substring(0,40) + ']: ' + e2.message); errors++; }
    else { saved++; }
  }

  console.log('\nSAVED: ' + saved + ' | ERRORS: ' + errors);
}
main().catch(e => { console.error(e); process.exit(1); });
