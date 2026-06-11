#!/usr/bin/env node
/**
 * Grade 2 Kiswahili Journey Generator — Batch 1 (20 lessons)
 * Generates lesson-specific journeys in Kiswahili.
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
const BATCH_ID = 'g2-kiswahili-batch-1';

function step(type, title, student, owl, extra) {
  return { id: type, stepType: type, title, studentText: student, owlText: owl, visualType: 'owl_teacher', interaction: { type: 'none' }, media: {}, ...extra };
}
function mcq(q, opts, correct, expl) { return { type: 'multiple_choice', question: q, options: opts, correctIndex: correct, explanation: expl }; }
function openResp(p) { return { type: 'open_response', prompt: p, placeholder: 'Andika hapa...' }; }

// Kiswahili journey content — lesson-specific
function buildKiswahiliJourney(title, strand, subStrand, questTitle) {
  const t = (title || '').toLowerCase();
  const s = (strand || '').toLowerCase();
  const ss = (subStrand || '').toLowerCase();
  const q = (questTitle || '').toLowerCase();

  // === SAUTI NA HERUFI (Sounds and Letters) ===
  if (s.includes('sauti') || s.includes('herufi') || s.includes('alfabeti')) {
    if (ss.includes('sauti') || ss.includes('herufi') || ss.includes('alfabeti')) {
      return [
        step('welcome', 'Karibu!', 'Habari, rafiki! 🔤 Leo tutajifunza kuhusu sauti na herufi za Kiswahili. Tutasikiliza, tutazungumza, na kuandika herufi mpya!', 'Habari! Mimi ni OWL. Leo tutajifunza sauti na herufi. Tayari?'),
        step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kutambua na kusoma sauti na herufi za Kiswahili kwa usahihi!', 'Lengo letu ni kujua sauti na herufi za Kiswahili.'),
        step('think_first', 'Fanya Kwanza!', 'Unajua herufi gani za Kiswahili? Unaweza kusoma herufi A hadi Z? Tufanye kazi pamoja!', 'Tufikirie: unajua herufi gani? Tuoneshe!', { interaction: openResp('Unajua herufi gani za Kiswahili?') }),
        step('learn', 'Jifunza: Sauti na Herufi', 'Kila herufi ina sauti yake. A = /a/, B = /b/, C = /c/... Tunasikiliza sauti, kisha tunasoma herufi. Kisha tunasoma maneno yenye herufi hizo. Kwa mfano: "a" katika "baba," "e" katika "mama."', 'Kumbuka: kila herufi ina sauti. Tunasikiliza sauti, kisha tunasoma herufi, kisha tunasoma maneno.'),
        step('connect', 'Uhusiano na Maisha Halisi', 'Unapoaandika barua, unatumia herufi. Unaposoma kitabu, unasoma herufi. Herufi zinaotumika kila siku!', 'Herufi zinaotumika kila siku — kuandika, kusoma, kuongea.'),
        step('example', 'Tufanye Pamoja', 'Nitakusikiliza sauti, wewe unaniambia herufi. Sauti: /a/. Herufi ni: A! Sauti: /m/. Herufi ni: M! Sasa tufanye pamoja: /b/ = ?', 'Sikiliza sauti, kisha sema herufi. Unafanya vizuri!'),
        step('practice', 'Fanya Wewe!', 'Zoezi: Andika herufi 5 kwa sauti zinazotolewa. Kisha soma maneno yenye herufi hizo.', 'Unafanya vizuri! Endelea kufanya mazoezi.'),
        step('quick_check', 'Ukaguzi Mfupi!', 'Sauti /k/ inawakilishwa na herufi gani?', ['G', 'K', 'T', 'P'], 1, 'Sahihi! Sauti /k/ inawakilishwa na herufi K!'),
        step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza nini kuhusu sauti na herufi leo?', 'Umefanya kazi nzuri leo! Unajua sauti na herufi zaidi sasa.', { interaction: openResp('Ulifunza nini kuhusu sauti na herufi?') }),
        step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza sauti na herufi za Kiswahili. Unasoma vizuri sana!', 'Hongera, rafiki! Nilifurahi na kazi yako leo!'),
      ];
    }
  }

  // === KUSIKILIZA NA KUZUNGUMAZA (Listening and Speaking) ===
  if (s.includes('kusikiliza') || s.includes('kuzungumza')) {
    if (ss.includes('hadithi') || ss.includes('simulia') || ss.includes('masimulizi')) {
      return [
        step('welcome', 'Karibu!', 'Habari, rafiki! 👂 Leo tutajifunza kusikiliza na kusimulia hadithi. Tutasikiliza kwa makini na kisha tutasimulia hadithi yetu!', 'Habari! Mimi ni OWL. Leo tutajifunza kusikiliza na kusimulia hadithi.'),
        step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kusikiliza hadithi na kueleza kile kilichotokea!', 'Lengo letu ni kujua kusikiliza na kusimulia hadithi.'),
        step('think_first', 'Fanya Kwanza!', 'Unapomsikiliza mtu anasimulia hadithi, unafanya nini ili kuelewa? Unasikiliza kwa makini?', 'Tufikirie: wakati wa kusikiliza hadithi, tunasikiliza kwa makini na kuelewa kile kilichotokea.', { interaction: openResp('Unafanya nini ili kueleza hadithi?') }),
        step('learn', 'Jifunza: Kusikiliza na Kusimulia Hadithi', 'Wakati tunasikiliza hadhati, tunasikiliza kwa makini. Tunauliza: Nani? Nini? Lini? Wapi? Kisha tunasimulia kwa maneno yetu. Mfano: "Kulikuwa na mtoto mdogo. Alikwenda sokoni. Alinunua matunda."', 'Kumbuka: sikiliza kwa makini, kisha simulia kwa maneno yako.'),
        step('connect', 'Uhusiano na Maisha Halisi', 'Nyumbani, unapomsikiliza mama anasimulia hadithi, unaweza kumwambia kile ulichosikia. Simulia hadithi kwa ndugu yako!', 'Kusimulia hadithi ni muhimu sana. Tunasimulia hadithi kila siku.'),
        step('example', 'Tufanye Pamoja', 'Nitasimulia hadithi fupi. Sikiliza kwa makini. Kisha utanisimulia mimi. "Kulikuwa na paka mdogo. Alikwenda nyumbani. Alikula samaki." Simulia sasa!', 'Unasikiliza vizuri! Sasa simulia hadithi kwa maneno yako.'),
        step('practice', 'Fanya Wewe!', 'Zoezi: Sikiliza hadithi kutoka kwa mtu nyumbani. Kisha simulia hadithi hiyo kwa rafiki yako.', 'Unafanya vizuri! Endelea kusikiliza na kusimulia.'),
        step('quick_check', 'Ukaguzi Mfupi!', 'Tunapaswa kufanya nini ya kwanza wakati wa kusikiliza hadithi?', ['Kusoma kitabu', 'Kusikiliza kwa makini', 'Kuandika barua', 'Kuruka'], 1, 'Sahihi! Tunasikiliza kwa makini ya kwanza!'),
        step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza nini kuhusu kusikiliza na kusimulia hadithi?', 'Umefanya kazi nzuri leo!', { interaction: openResp('Ulifunza nini kuhusu kusimulia hadithi?') }),
        step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza kusikiliza na kusimulia hadithi. Wewe ni msikilizaji mzuri!', 'Hongera, rafiki! Nilifurahi na kazi yako leo!'),
      ];
    }

    if (ss.includes('maamkuzi') || ss.includes('nyakati') || ss.includes('salamu')) {
      return [
        step('welcome', 'Karibu!', 'Habari, rafiki! 🗣️ Leo tutajifunza kuhusu maamkuzi na salamu za Kiswahili. Tutajifunza kusema salamu kwa nyakati mbalimbali za siku!', 'Habari! Mimi ni OWL. Leo tutajifunza maamkuzi na salamu.'),
        step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kutoa salamu sahihi kwa nyakati mbalimbali za siku!', 'Lengo letu ni kujua maamkuzi na salamu.'),
        step('think_first', 'Fanya Kwanza!', 'Unasema nini wakati wa kusalimua mtu asubuhi? Na jioni? Unajua salamu gani?', 'Tufikirie: tunasema "Habari za asubuhi?" asubuhi na "Habari za jioni?" jioni.', { interaction: openResp('Unasema nini wakati wa kusalimua mtu asubuhi?') }),
        step('learn', 'Jifunza: Maamkuzi na Salamu', 'Asubuhi: "Habari za asubuhi?" Jioni: "Habari za jioni?" Usiku: "Usiku mwema." Kwa wazee: "Shikamoo." Kwa marafiki: "Habari yako?" Salamu zinaonyesheheshima na upendo.', 'Kumbuka: salamu zinaonyesheheshima. Tunasalimu kila siku.'),
        step('connect', 'Uhusiano na Maisha Halisi', 'Nyumbani, unasalimu wazee wako? Unasema "Shikamoo" kwa babu na nyanya. Unasema "Habari za asubuhi?" kwa mama. Tumia salamu kila siku!', 'Salamu ni muhimu sana katika maisha yetu.'),
        step('example', 'Tufanye Pamoja', 'Nitakwambia wakati, wewe unaniambia salamu. Asubuhi: "Habari za asubuhi?" Jioni: "Habari za jioni?" Usiku: "Usiku mwema."', 'Unafanya vizuri! Salamu zinaonyesheheshima.'),
        step('practice', 'Fanya Wewe!', 'Zoezi: Andika salamu 5 kwa nyakati mbalimbali za siku. Kisha salimu mtu nyumbani kwa Kiswahili.', 'Unafanya vizuri! Endelea kutumia salamu.'),
        step('quick_check', 'Ukaguzi Mfupi!', 'Unasema nini wakati wa kusalimua mtu jioni?', ['Habari za asubuhi', 'Habari za jioni', 'Usiku mwema', 'Shikamoo'], 1, 'Sahihi! "Habari za jioni" kwa jioni!'),
        step('reflect', 'Fikira kuhuso Jifunzo Lako', 'Ulifunza nini kuhusu maamkuzi na salamu?', 'Umefanya kazi nzuri leo!', { interaction: openResp('Ulifunza nini kuhusu salamu?') }),
        step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza maamkuzi na salamu za Kiswahili!', 'Hongera, rafiki! Nilifurahi na kazi yako leo!'),
      ];
    }

    // Generic listening/speaking
    return [
      step('welcome', 'Karibu!', 'Habari, rafiki! 👂🗣️ Leo tutajifunza ' + title.toLowerCase() + '. Tutasikiliza na kuzungumza kwa Kiswahili!', 'Habari! Mimi ni OWL. Leo tutajifunza pamoja.'),
      step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza ' + title.toLowerCase() + ' kwa Kiswahili sanifu!', 'Lengo letu ni kujua ' + title.toLowerCase() + '.'),
      step('think_first', 'Fanya Kwanza!', 'Unajua nini kuhusu ' + title.toLowerCase() + '? Tuoneshe!', 'Tufikirie: unajua nini?', { interaction: openResp('Unajua nini kuhusu ' + title.toLowerCase() + '?') }),
      step('learn', 'Jifunza', 'Leo tutajifunza ' + title.toLowerCase() + '. Tunasikiliza, tunazungumza, na kufanya mazoezi. Tayari?', 'Hile unayohitaji kujua. Sikiliza kwa makini!'),
      step('connect', 'Uhusiano na Maisha Halisi', 'Unatumia ' + title.toLowerCase() + ' wapi nyumbani au shulene?', 'Tunatumia hii kila siku!'),
      step('example', 'Tufanye Pamoja', 'Nitaonyesha mfano. Angalia kwa makini!', 'Angalia, kisha wewe utajaribu!'),
      step('practice', 'Fanya Wewe!', 'Zoezi: Jaribu kufanya ' + title.toLowerCase() + ' yako mwenyewe.', 'Unafanya vizuri!'),
      step('quick_check', 'Ukaguzi Mfupi!', 'Ulifunza nini leo?', ['Sijifunza kitu', 'Nilifunza ' + title.toLowerCase(), 'Nilijua yote', 'Sikusikiliza'], 1, 'Sahihi! Ulifunza ' + title.toLowerCase() + '!'),
      step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza nini leo?', 'Umefanya kazi nzuri!', { interaction: openResp('Ulifunza nini?') }),
      step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza ' + title.toLowerCase() + '!', 'Hongera, rafiki!'),
    ];
  }

  // === MSAMIATI (Vocabulary) ===
  if (s.includes('msamiati')) {
    return [
      step('welcome', 'Karibu!', 'Habari, rafiki! 📝 Leo tutajifunza maneno mapya ya Kiswahili. Tutasikiliza, tusome, na tuandike maneno!', 'Habari! Mimi ni OWL. Leo tutajifunza msamiati mpya.'),
      step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kutumia maneno mapya ya Kiswahili kwa usahihi!', 'Lengo letu ni kujua msamiati mpya.'),
      step('think_first', 'Fanya Kwanza!', 'Unajua maneno gani ya Kiswahili yanayohusiana na ' + title.toLowerCase() + '?', 'Tufikirie: unajua maneno gani?', { interaction: openResp('Unajua maneno gani ya Kiswahili?') }),
      step('learn', 'Jifunza: Msamiati', 'Leo tutajifunza maneno mapya. Tunasikiliza matamshi, tunasoma maneno, na kuandika. Kisha tunatumia maneno katika sentensi. Maneno mapya ni muhimu kwa mawasiliano!', 'Kumbuka: sikiliza matamshi, soma maneno, andika, kisha tumia katika sentensi.'),
      step('connect', 'Uhusiano na Maisha Halisi', 'Unatumia maneno ya Kiswahili wapi nyumbani au shulene? Tumia maneno mapya kila siku!', 'Msamiati ni muhimu kwa mawasiliano yetu ya kila siku.'),
      step('example', 'Tufanye Pamoja', 'Nitasema neno, wewe unalitaja maana. Kisha tunalitumia katika sentensi. "Mfano: Jiko — mahali pa kupikia."', 'Unafanya vizuri!'),
      step('practice', 'Fanya Wewe!', 'Zoezi: Andika maneno 5 mapya na uyatumie katika sentensi.', 'Unafanya vizuri!'),
      step('quick_check', 'Ukaguzi Mfupi!', 'Kwa nini msamiati ni muhimu?', ['Si muhimu', 'Kwa mawasiliano yetu ya kila siku', 'Kwa kuandika tu', 'Kwa kusoma tu'], 1, 'Sahihi! Msamiati ni muhimu kwa mawasiliano.'),
      step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza maneno gani mapya leo?', 'Umefanya kazi nzuri!', { interaction: openResp('Ulifunza maneno gani mapya?') }),
      step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza msamiati mpya ya Kiswahili!', 'Hongera, rafiki!'),
    ];
  }

  // === KUSOMA (Reading) ===
  if (s.includes('kusoma')) {
    return [
      step('welcome', 'Karibu!', 'Habari, rafiki! 📖 Leo tutajifunza kusoma kwa Kiswahili. Tutasoma kwa makini na kuelewa kile tunachosoma!', 'Habari! Mimi ni OWL. Leo tutajifunza kusoma pamoja.'),
      step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kusoma na kuelewa maandiko ya Kiswahili kwa usahihi!', 'Lengo letu ni kuwa wasomaji bora.'),
      step('think_first', 'Fanya Kwanza!', 'Unapendelea kusoma nini? Unajua kusoma kwa Kiswahili?', 'Tufikirie: unajua kusoma? Tuoneshe!', { interaction: openResp('Unapendelea kusoma nini?') }),
      step('learn', 'Jifunza: Kusoma', 'Wakati tunasoma, tunasoma kwa makini. Tunauliza: Hii inasema nini? Tunatafuta maana ya maneno. Kisha tunajibu maswali kuhusu kile tulichosoma. Kusoma kunasaidia kujifunza mambo mapya!', 'Kumbuka: soma kwa makini, uliza "Hii inasema nini?" kisha jibu maswali.'),
      step('connect', 'Uhusiano na Maisha Halisi', 'Unapotea wapi unaposoma? Nyumbani? Shulene? Maktabani? Kusoma kunasaidia kila siku!', 'Kusoma kinafanyika kila siku — kusoma barua, vitabu, maandiko.'),
      step('example', 'Tufanye Pamoja', 'Nitasoma kifupi. Sikiliza kwa makini. Kutanitaka kujibu maswali kuhusu kile nilichosoma.', 'Sikiliza kwa makini, kisha utajibu maswali.'),
      step('practice', 'Fanya Wewe!', 'Zoezi: Soma kifupi kwa Kiswahili. Kisha jibu maswali 5 kuhusu kile ulichosoma.', 'Unafanya vizuri!'),
      step('quick_check', 'Ukaguzi Mfupi!', 'Tunapaswa kufanya nini wakati wa kusoma?', ['Kusoma kwa sauti tu', 'Kusoma kwa makini na kuelewa', 'Kuruka maneno magumu', 'Kusoma haraka'], 1, 'Sahihi! Tunasoma kwa makini na kuelewa!'),
      step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza nini kuhusu kusoma?', 'Umefanya kazi nzuri!', { interaction: openResp('Ulifunza nini kuhusu kusoma?') }),
      step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza kusoma kwa Kiswahili. Wewe ni msomaji mzuri!', 'Hongera, rafiki!'),
    ];
  }

  // === KUANDIKA (Writing) ===
  if (s.includes('kuandika')) {
    return [
      step('welcome', 'Karibu!', 'Habari, rafiki! ✏️ Leo tutajifunza kuandika kwa Kiswahili. Tutakuandika kwa usanifu na kwa usahihi!', 'Habari! Mimi ni OWL. Leo tutajifunza kuandika pamoja.'),
      step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kuandika kwa Kiswahili kwa usahihi na kwa usanifu!', 'Lengo letu ni kuwa waandishi bora.'),
      step('think_first', 'Fanya Kwanza!', 'Unapendelea kuandika nini? Unajua kuandika sentensi za Kiswahili?', 'Tufikirie: unajua kuandika? Tuoneshe!', { interaction: openResp('Unapendelea kuandika nini?') }),
      step('learn', 'Jifunza: Kuandika', 'Wakati tunakuandika, tunakuandika kwa makini. Tunatumia herufi kubwa mwanzoni wa sentensi. Tunatumia nukta mwisho. Tunasoma kile tulichokuandika ili kuhakikisha ni sahihi. Kuandika kunasaidia kuwasilisha mawazo yetu!', 'Kumbuka: herufi kubwa mwanzoni, nukta mwisho, soma kile ulichokuandika.'),
      step('connect', 'Uhusiano na Maisha Halisi', 'Unapotea wapi unapoandika? Nyumbani? Shulene? Kuandika kunasaidia kila siku!', 'Kuandika kinafanyika kila siku — kuandika barua, orodha, sentensi.'),
      step('example', 'Tufanye Pamoja', 'Nitaandika sentensi. Angalia kwa makini. Kisha wewe utaandika sentensi yako mwenyewe.', 'Angalia, kisha uandike!'),
      step('practice', 'Fanya Wewe!', 'Zoezi: Andika sentensi 5 kwa Kiswahili. Tumia maneno uliyojifunza leo.', 'Unafanya vizuri!'),
      step('quick_check', 'Ukaguzi Mfupi!', 'Tunapaswa kutumia nini mwanzoni wa sentensi?', ['Herufi ndogo', 'Herufi kubwa', 'Nukta', 'Alama ya mshazari'], 1, 'Sahihi! Herufi kubwa mwanzoni wa sentensi!'),
      step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza nini kuhusu kuandika?', 'Umefanya kazi nzuri!', { interaction: openResp('Ulifunza nini kuhusu kuandika?') }),
      step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza kuandika kwa Kiswahili. Wewe ni mwandishi mzuri!', 'Hongera, rafiki!'),
    ];
  }

  // === SARUFI (Grammar) ===
  if (s.includes('sarufi')) {
    return [
      step('welcome', 'Karibu!', 'Habari, rafiki! 📝 Leo tutajifunza sarufi ya Kiswahili. Tutajifunza kanuni za lugha na kuzitumia kwa usahihi!', 'Habari! Mimi ni OWL. Leo tutajifunza sarufi pamoja.'),
      step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kutumia kanuni za sarufi ya Kiswahili kwa usahihi!', 'Lengo letu ni kujua sarufi.'),
      step('think_first', 'Fanya Kwanza!', 'Unajua kanuni gani za Kiswahili? Kwa mfano, unajua kuhusu ngeli au nyakati?', 'Tufikirie: unajua nini kuhusu sarufi?', { interaction: openResp('Unajua kanuni gani za Kiswahili?') }),
      step('learn', 'Jifunza: Sarufi', 'Sarufi ni kanuni za lugha. Kwa mfano: ngeli za nomino (a-wa, ki-vi, n-n), nyakati za vitenzi (na-, li-, ta-), na kanuni zingine. Tunajifunza kanuni, kisha tunazitumia katika sentensi.', 'Kumbuka: sarufi ni kanuni za lugha. Tunajifunza kanuni, kisha tunazitumia.'),
      step('connect', 'Uhusiano na Maisha Halisi', 'Unatumia sarufi wakati wote — wakati unazungumza, unaposoma, na unapoandika. Sarufi inasaidia kuwaelewa wengine!', 'Sarufi inatumiaka kila siku!'),
      step('example', 'Tufanye Pamoja', 'Nitaonyesha mfano wa kanuni. Angalia kwa makini. Kisha wewe utajaribu.', 'Angalia, kisha ujaribu!'),
      step('practice', 'Fanya Wewe!', 'Zoezi: Andika sentensi 5 kutumia kanuni ya sarufi uliyojifunza leo.', 'Unafanya vizuri!'),
      step('quick_check', 'Ukaguzi Mfupi!', 'Sarufi ni nini?', ['Maneno mapya', 'Kanuni za lugha', 'Hadithi fupi', 'Sauti za herufi'], 1, 'Sahihi! Sarufi ni kanuni za lugha!'),
      step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza kanuni gani za sarufi leo?', 'Umefanya kazi nzuri!', { interaction: openResp('Ulifunza kanuni gani za sarufi?') }),
      step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza sarufi ya Kiswahili!', 'Hongera, rafiki!'),
    ];
  }

  // === TATHMINI (Assessment) ===
  if (s.includes('tathmini')) {
    return [
      step('welcome', 'Karibu!', 'Habari, rafiki! 🌟 Leo tutapima yote tuliyojifunza. Tutasikiliza, tusome, tuandike, na tuzungumze kwa Kiswahili!', 'Habari! Mimi ni OWL. Leo tutapima yote tuliyojifunza.'),
      step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza kuonyesha yote uliyojifunza kwa Kiswahili!', 'Lengo letu ni kuonyesha yote tunayojua.'),
      step('think_first', 'Fanya Kwanza!', 'Ulifunza nini mwezi huu? Unaweza kukumbuka mada kubwa?', 'Tufikirie: tulifunza nini? Tuoneshe!', { interaction: openResp('Ulifunza nini mwezi huu?') }),
      step('learn', 'Jifunza: Marudio na Tathmini', 'Leo tutapima yote tuliyojifunza. Hii inatusaidia kukumbuka na kujua tunachohitaji kujifunza zaidi. Usiogope — unajua mengi sasa!', 'Kumbuka: tathmini inasaidia kujua tunachohitaji kujifunza zaidi.'),
      step('connect', 'Uhusiano na Maisha Halisi', 'Unapima wapi maarifa yako? Shulene? Nyumbani? Tathmini inasaidia kuendelea kujifunza!', 'Tathmini ni sehemu ya kujifunza.'),
      step('example', 'Tufanye Pamoja', 'Nitakuuliza maswali kuhusu yote tuliyojifunza. Jibu kwa ujasiri!', 'Jibu kwa ujasiri! Unajua mengi!'),
      step('practice', 'Fanya Wewe!', 'Zoezi: Jibu maswali 10 kuhusu yote uliyojifunza mwezi huu.', 'Unafanya vizuri!'),
      step('quick_check', 'Ukaguzi Mfupi!', 'Kwa nini tathmini ni muhimu?', ['Si muhimu', 'Inasaidia kujua tunachohitaji kujifunza zaidi', 'Inasaidia kushindwa', 'Inasaidia kuogopa'], 1, 'Sahihi! Tathmini inasaidia kujua tunachohitaji kujifunza zaidi!'),
      step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza nini mwezi huu? Unajua nini sasa?', 'Umefanya kazi nzuri!', { interaction: openResp('Ulifunza nini mwezi huu?') }),
      step('complete', 'Hongera!', 'Hongera! 🎉 Umepima yote uliyojifunza. Hongera sana!', 'Hongera, rafiki! Nilifurahi sana na kazi yako!'),
    ];
  }

  // === FALLBACK ===
  return [
    step('welcome', 'Karibu!', 'Habari, rafiki! 📚 Leo tutajifunza ' + title.toLowerCase() + '. Tayari?', 'Habari! Mimi ni OWL. Leo tutajifunza pamoja.'),
    step('mission', 'Lengo Letu', 'Mwisho wa somo hili, utaweza ' + title.toLowerCase() + ' kwa Kiswahili sanifu!', 'Lengo letu ni kujua ' + title.toLowerCase() + '.'),
    step('think_first', 'Fanya Kwanza!', 'Unajua nini kuhusu ' + title.toLowerCase() + '?', 'Tufikirie: unajua nini?', { interaction: openResp('Unajua nini?') }),
    step('learn', 'Jifunza', 'Leo tutajifunza ' + title.toLowerCase() + '. Tayari?', 'Hile unayohitaji kujua.'),
    step('connect', 'Uhusiano na Maisha Halisi', 'Unatumia ' + title.toLowerCase() + ' wapi?', 'Tunatumia hii kila siku!'),
    step('example', 'Tufanye Pamoja', 'Nitaonyesha mfano. Angalia!', 'Angalia, kisha ujaribu!'),
    step('practice', 'Fanya Wewe!', 'Zoezi: Jaribu kufanya yako mwenyewe.', 'Unafanya vizuri!'),
    step('quick_check', 'Ukaguzi Mfupi!', 'Ulifunza nini leo?', ['Sijifunza kitu', 'Nilifunza ' + title.toLowerCase(), 'Nilijua yote', 'Sikusikiliza'], 1, 'Sahihi!'),
    step('reflect', 'Fikira kuhusu Jifunzo Lako', 'Ulifunza nini leo?', 'Umefanya kazi nzuri!', { interaction: openResp('Ulifunza nini?') }),
    step('complete', 'Hongera!', 'Hongera! 🎉 Umefunza ' + title.toLowerCase() + '!', 'Hongera, rafiki!'),
  ];
}

async function main() {
  const { data: theme } = await db.from('Theme').select('id').eq('slug', 'g2-kiswahili').single();
  if (!theme) { console.error('Theme not found'); process.exit(1); }
  const { data: quests } = await db.from('Quest').select('id, title').eq('themeId', theme.id);
  if (!quests?.length) { console.error('No quests'); process.exit(1); }

  // Get first 20 lessons
  let all = [], off = 0;
  while (all.length < 20) {
    const { data, error } = await db.from('Lesson').select('id, title, contentBlocks').in('questId', quests.map(q => q.id)).order('orderIndex').range(off, off + 199);
    if (error) { console.error(error); process.exit(1); }
    if (!data?.length) break;
    all = all.concat(data); off += 200;
    if (data.length < 200) break;
  }
  all = all.slice(0, 20);

  console.log('Generating journeys for ' + all.length + ' Kiswahili lessons...\n');

  let saved = 0, errors = 0;
  for (const l of all) {
    let meta = {};
    try { meta = JSON.parse(l.contentBlocks || '{}'); } catch {}
    const strand = meta.strand || '';
    const subStrand = meta.subStrand || '';
    const questTitle = meta.questTitle || '';
    const journey = buildKiswahiliJourney(l.title, strand, subStrand, questTitle);

    const upd = { ...meta, studentJourneyDraft: journey, aiMetadata: { batchId: BATCH_ID, generatedAt: new Date().toISOString(), generator: 'kiswahili-v1' } };
    const { error: e2 } = await db.from('Lesson').update({ contentBlocks: JSON.stringify(upd) }).eq('id', l.id);
    if (e2) { console.error('  ERROR [' + l.title + ']: ' + e2.message); errors++; }
    else { console.log('  ✓ ' + l.title); saved++; }
  }

  console.log('\nSAVED: ' + saved + ' | ERRORS: ' + errors);
}
main().catch(e => { console.error(e); process.exit(1); });
