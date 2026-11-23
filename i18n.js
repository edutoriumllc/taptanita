/* Taptanita — all on-screen text in English and Spanish.
   Plain strings, or functions that take an args object for text that needs numbers,
   seed names (s, s2) or Spanish gender (g: 'm' / 'f').
   Created by Edutorium of Excellence LLC. © 2026 Edutorium of Excellence LLC. All rights reserved. */
(function () {
  'use strict';

  function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
  // Spanish agreement helpers
  function un(s) { return s.g === 'f' ? 'una' : 'un'; }
  function los(s) { return s.g === 'f' ? 'las' : 'los'; }
  function og(s, m, f) { return s.g === 'f' ? f : m; }

  window.TAPTI_TEXT = {
    en: {
      seeds: [
        { one: 'corn', many: 'corn', label: 'CORN', short: 'Corn' },
        { one: 'bean', many: 'beans', label: 'BEANS', short: 'Beans' },
        { one: 'pea', many: 'peas', label: 'PEAS', short: 'Peas' },
        { one: 'lupin', many: 'lupins', label: 'LUPINS', short: 'Lupins' }
      ],
      // thousandths … thousands (used for base 10 place words and trade/break messages)
      places: [
        { one: 'thousandth', many: 'thousandths' }, { one: 'hundredth', many: 'hundredths' }, { one: 'tenth', many: 'tenths' },
        { one: 'one', many: 'ones' }, { one: 'ten', many: 'tens' }, { one: 'hundred', many: 'hundreds' }, { one: 'thousand', many: 'thousands' }
      ],
      decSep: '.',
      pickSeed: function (a) { return 'Which seed are your ' + a.p.many + '?'; },
      seedSet: function (a) { return 'Your ' + a.p.many + ' are now ' + a.s.many + '.'; },
      rangeToast: function (a) { return a.n + ' places: ×' + a.lo + ' to ×' + a.hi + '.'; },
      // base 10 place menu: whole numbers named by the biggest place, decimals by the smallest
      rHundreds: 'HUNDREDS', rThousands: 'THOUSANDS', rTenths: 'TENTHS', rHundredths: 'HUNDREDTHS', rThousandths: 'THOUSANDTHS',
      placesToast: function (a) { return cap(a.names.slice(0, -1).join(', ')) + ' and ' + a.names[a.names.length - 1] + '.'; },

      soundOff: 'SOUND OFF', soundOn: 'SOUND ON', help: 'Help', finish: 'FINISH', lang: 'Language',
      mFree: 'BUILD', mMake: 'MAKE', mAdd: 'ADD', mSub: 'SUB', mSubLabel: 'Subtract',
      baseLabel: 'Number base', advanced: 'Advanced', placeLabel: 'Places', placeTo: 'TO',
      sizeLabel: 'Number size', digits: function (a) { return a.n + (a.n === 1 ? ' digit' : ' digits'); },
      number: 'NUMBER', hide: 'HIDE', show: 'SHOW', added: 'ADDED', savedLabel: 'Saved numbers',
      viewLabel: 'View', vOne: 'ONE', vAll: 'ALL', vOneLabel: 'Show one kind of seed', vAllLabel: 'Show all seeds together',
      clear: 'CLEAR', save: 'SAVE', check: 'CHECK', next: 'NEXT ▶',
      helpTitle: 'HOW TO PLAY', gotIt: 'GOT IT', askTitle: 'PHASE CHANGE', doneTitle: 'NICE WORK!', keepPlaying: 'KEEP PLAYING',
      helpHtml: function (a) {
        return '<li>The Taptanita is shaped like a doll (<i>muñeca</i>). Its red half-moon is the <b class="t-red">Killa</b>, the Kichwa word for moon. Just as the moon completes a phase before a new one begins, the Killa completes each phase (place) before the next phase begins.</li>' +
          '<li>Each phase (place) has its own seed: ' + a.parts + '. In base 10, tap a place card to choose its seed; the place menu adds tenths, hundredths and thousandths.</li>' +
          '<li>Drag seeds from a cup into the <b class="t-blue">blue pozos</b>, clockwise from the top right. The glowing circle is next.</li>' +
          '<li>To take a seed away, double-tap it or drag it off the Taptanita.</li>' +
          '<li>All pozos full? Add one more seed (tap the cup or drop it on the Taptanita) and it goes to the <b class="t-red">red Killa</b> by itself and completes the phase. Answer the question to make the phase change: together they construct one seed of the next phase.</li>' +
          '<li>Taking away and not enough corn? Drag a bean from the Taptanita onto the <b class="t-red">red Killa</b> to go back a phase: it deconstructs into 10 corn (a pea deconstructs into 10 beans). Or tap <b class="t-yellow">+?</b> to count on instead.</li>' +
          '<li>ONE shows one kind of seed at a time (tap a place card to switch). ALL puts every kind of seed together on the Taptanita, one of each per pozo, so you see the whole number.</li>';
      },
      aboutTitle: 'ABOUT',
      aboutHtml: '<p>Based on the Taptana Cañari (Cañari counter) and the Taptanita of Ecuador\'s Secretaría de Educación Intercultural Bilingüe y la Etnoeducación (SEIBE). This app is not made, endorsed or sponsored by SEIBE or the Government of Ecuador.</p>' +
        '<p class="ref">Vásquez, M., Duchi, J. &amp; Antun, R. (2025). <i>Taptanita</i>. Quito: SEIBE.<br>' +
        'Vásquez, M. (2023). <i>Contador Cañari</i>, Colección Taptana. Azogues: Casa de la Cultura Ecuatoriana.</p>' +
        '<p>Created by Edutorium of Excellence LLC.<br>© 2026 Edutorium of Excellence LLC. All rights reserved. This app may not be copied, changed or shared without written permission from Edutorium of Excellence LLC.</p>',
      cupLabel: function (a) { return a.s.many + ' cup: drag one out, or press Enter to add one'; },

      inBase10: function (a) { return '= ' + a.v + ' in base 10'; },
      pBuild: function (a) { return 'Build any number. ' + a.parts + '.'; },
      pMake10: function (a) { return 'Make <b>' + a.n + '</b> with seeds.'; },
      pMakeB: function (a) { return 'Show <b>' + a.n + '</b> in base ' + a.b + '.'; },
      boardShows: 'The board shows', boardShort: 'Board:',
      pAdd: function (a) { return 'Add <b>' + a.n + '</b>.'; },
      pSub: function (a) { return 'Take away <b>' + a.n + '</b>.'; },
      pOn: function (a) { return 'Count on to <b>' + a.n + '</b>.'; },
      wayLabel: 'How to subtract',
      wayTakeLabel: function (a) { return 'Take away ' + a.n; },
      wayOnLabel: function (a) { return 'Count on from ' + a.n; },
      tipOn: function (a) { return 'Start at ' + a.b + '. Add seeds until the Taptanita shows ' + a.a + '.'; },
      onTitle: 'HOW MUCH DID YOU ADD?',
      askOn: function (a) { return 'You started at ' + a.b + ' and counted on to ' + a.a + '. How much did you add?'; },
      hintOn: function (a) { return 'Count up from ' + a.b + ' to ' + a.a + '.'; },
      yesOn: function (a) { return 'Yes! ' + a.a + ' − ' + a.b + ' = ' + a.d + ', because ' + a.b + ' + ' + a.d + ' = ' + a.a + '.'; },
      yes: function (a) { return 'Yes! ' + a.t + ' = ' + a.parts + '. Tap NEXT.'; },
      needMore: 'Need more seeds. ', tooMany: 'Too many seeds. ',
      putSeeds: 'Put some seeds on first.',
      saved: function (a) { return 'Saved ' + a.n + '! Keep building or CLEAR for a new one.'; },

      stopsAt: function (a) { return 'This Taptanita stops at the ×' + a.v + ' place.'; },
      pozosFull: function (a) { return 'All pozos are full! The next ' + a.s.one + ' goes in the red Killa to complete the phase.'; },
      killaBusy: function (a) { return 'The Killa already holds a ' + a.s.one + '. Take one away first.'; },
      takeFirst: function (a) { return 'Take away a ' + a.s.one + ' first.'; },
      needPlace: function (a) { return 'That needs another place — the Taptanita stops at ×' + a.v + '.'; },
      brokeExtra: function (a) { return 'Phase back! 1 ' + a.s2.one + ' deconstructs into ' + a.b + ' ' + a.s.many + '. The extra ' + a.s.many + ' wait in the middle until a pozo is free.'; },
      broke: function (a) { return 'Phase back! 1 ' + a.s2.one + ' deconstructs into ' + a.b + ' ' + a.s.many + '.'; },
      traded: function (a) { return 'Phase change! ' + a.b + ' ' + a.s.many + ' construct 1 ' + a.s2.one + '.'; },
      askCount: function (a) { return 'How many ' + a.s.many + ' are on the Taptanita now?'; },
      hintCount: function (a) { return 'Count them: ' + a.n + ' in the blue pozos + 1 in the red Killa.'; },
      askTrade: function (a) { return a.b + ' ' + a.s.many + ' complete the phase. How many ' + a.s2.many + ' do they construct?'; },
      hintTrade: function (a) { return 'All ' + a.b + ' ' + a.s.many + ' together complete the phase and construct one ' + a.s2.one + '.'; },
      notQuite: 'Not quite. ',
      wrongPlace: function (a) { return cap(a.s.many) + ' go in the ×' + a.v + ' Taptanita, not the ×' + a.w + '.'; },
      fillFirst: 'Fill every blue pozo before the red Killa.',
      clockwise: 'Go clockwise from the top right: drop it in the glowing circle.',
      baseToast: function (a) {
        return 'Base ' + a.b + ': ' + a.n + ' pozo' + (a.n > 1 ? 's' : '') + ', then the red Killa completes the phase: ' + a.b + ' ' + a.s.many + ' construct 1 ' + a.s2.one + '.';
      },
      sumBuilt: 'Numbers built: ',
      sumCorrect: function (a) { return 'Challenges correct: ' + a.n + ' of ' + a.m; },
      sumTrades: 'Phase changes (construct): ', sumBreaks: 'Phases back (deconstruct): ',
      sumAsk: function (a) { return 'Phase change questions right first try: ' + a.n + ' of ' + a.m; }
    },

    es: {
      // Ecuadorian names: maíz, fréjol, arveja, chocho
      seeds: [
        { one: 'grano de maíz', many: 'granos de maíz', label: 'MAÍZ', short: 'Maíz', g: 'm' },
        { one: 'fréjol', many: 'fréjoles', label: 'FRÉJOLES', short: 'Fréjoles', g: 'm' },
        { one: 'arveja', many: 'arvejas', label: 'ARVEJAS', short: 'Arvejas', g: 'f' },
        { one: 'chocho', many: 'chochos', label: 'CHOCHOS', short: 'Chochos', g: 'm' }
      ],
      // milésimas … unidades de mil; all feminine, so messages agree ("10 centésimas = 1 décima")
      places: [
        { one: 'milésima', many: 'milésimas', g: 'f' }, { one: 'centésima', many: 'centésimas', g: 'f' }, { one: 'décima', many: 'décimas', g: 'f' },
        { one: 'unidad', many: 'unidades', g: 'f' }, { one: 'decena', many: 'decenas', g: 'f' }, { one: 'centena', many: 'centenas', g: 'f' },
        { one: 'unidad de mil', many: 'unidades de mil', g: 'f' }
      ],
      // Ecuador writes decimals with a comma (2,35); change to '.' to use a point
      decSep: ',',
      pickSeed: function (a) { return '¿Qué semilla son tus ' + a.p.many + '?'; },
      seedSet: function (a) { return 'Ahora ' + los(a.s) + ' ' + a.s.many + ' son tus ' + a.p.many + '.'; },
      rangeToast: function (a) { return a.n + ' lugares: de ×' + a.lo + ' a ×' + a.hi + '.'; },
      // menú de lugares en base 10: enteros por el lugar más grande, decimales por el más pequeño
      // ("MILES" = unidades de mil, para que quepa)
      rHundreds: 'CENTENAS', rThousands: 'MILES', rTenths: 'DÉCIMAS', rHundredths: 'CENTÉSIMAS', rThousandths: 'MILÉSIMAS',
      placesToast: function (a) { return cap(a.names.slice(0, -1).join(', ')) + ' y ' + a.names[a.names.length - 1] + '.'; },

      soundOff: 'SONIDO NO', soundOn: 'SONIDO SÍ', help: 'Ayuda', finish: 'TERMINAR', lang: 'Idioma',
      mFree: 'CREAR', mMake: 'HACER', mAdd: 'SUMA', mSub: 'RESTA', mSubLabel: 'Restar',
      baseLabel: 'Base numérica', advanced: 'Avanzado', placeLabel: 'Lugares', placeTo: 'HASTA',
      sizeLabel: 'Tamaño del número', digits: function (a) { return a.n + (a.n === 1 ? ' cifra' : ' cifras'); },
      number: 'NÚMERO', hide: 'OCULTAR', show: 'MOSTRAR', added: 'AÑADIDO', savedLabel: 'Números guardados',
      viewLabel: 'Vista', vOne: 'UNO', vAll: 'TODO', vOneLabel: 'Ver un tipo de semilla', vAllLabel: 'Ver todas las semillas juntas',
      clear: 'BORRAR', save: 'GUARDAR', check: 'REVISAR', next: 'OTRO ▶',
      helpTitle: 'CÓMO JUGAR', gotIt: '¡LISTO!', askTitle: 'CAMBIO DE FASE', doneTitle: '¡BUEN TRABAJO!', keepPlaying: 'SEGUIR JUGANDO',
      helpHtml: function (a) {
        return '<li>La Taptanita tiene forma de muñeca. Su media luna roja es la <b class="t-red">Killa</b>, que en kichwa significa luna. Así como la luna completa una fase antes de empezar otra, la Killa completa cada fase antes de pasar a la siguiente.</li>' +
          '<li>Cada fase (lugar) tiene su semilla: ' + a.parts + '. En base 10, toca una tarjeta de lugar para elegir su semilla; el menú de lugares añade décimas, centésimas y milésimas.</li>' +
          '<li>Arrastra semillas de un vaso a los <b class="t-blue">pozos azules</b>, en el sentido del reloj desde arriba a la derecha. El círculo que brilla es el siguiente.</li>' +
          '<li>Para quitar una semilla, tócala dos veces o arrástrala fuera de la Taptanita.</li>' +
          '<li>¿Pozos llenos? Añade una semilla más (toca el vaso o suéltala en la Taptanita) y va sola a la <b class="t-red">Killa roja</b>: se completa la fase. Responde la pregunta para hacer el cambio de fase a una semilla de la fase siguiente.</li>' +
          '<li>¿Restando y no alcanza el maíz? Arrastra un fréjol de la Taptanita a la <b class="t-red">Killa roja</b> para regresar de fase: se cambia por 10 granos de maíz (una arveja se cambia por 10 fréjoles). O toca <b class="t-yellow">+?</b> para contar hacia adelante.</li>' +
          '<li>UNO muestra un tipo de semilla a la vez (toca una tarjeta de lugar para cambiar). TODO pone todas las semillas juntas en la Taptanita, una de cada tipo por pozo, para ver el número completo.</li>';
      },
      aboutTitle: 'ACERCA DE',
      aboutHtml: '<p>Basada en la Taptana Cañari (contador cañari) y en la Taptanita de la Secretaría de Educación Intercultural Bilingüe y la Etnoeducación (SEIBE) del Ecuador. Esta aplicación no fue creada, avalada ni patrocinada por la SEIBE ni por el Gobierno del Ecuador.</p>' +
        '<p class="ref">Vásquez, M., Duchi, J. y Antun, R. (2025). <i>Taptanita</i>. Quito: SEIBE.<br>' +
        'Vásquez, M. (2023). <i>Contador Cañari</i>, Colección Taptana. Azogues: Casa de la Cultura Ecuatoriana.</p>' +
        '<p>Creada por Edutorium of Excellence LLC.<br>© 2026 Edutorium of Excellence LLC. Todos los derechos reservados. Esta aplicación no se puede copiar, modificar ni compartir sin permiso por escrito de Edutorium of Excellence LLC.</p>',
      cupLabel: function (a) { return 'Vaso de ' + a.s.many + ': arrastra uno o pulsa Enter para añadir uno'; },

      inBase10: function (a) { return '= ' + a.v + ' en base 10'; },
      pBuild: function (a) { return 'Forma cualquier número. ' + a.parts + '.'; },
      pMake10: function (a) { return 'Forma <b>' + a.n + '</b> con semillas.'; },
      pMakeB: function (a) { return 'Muestra <b>' + a.n + '</b> en base ' + a.b + '.'; },
      boardShows: 'La Taptanita muestra', boardShort: 'Taptanita:',
      pAdd: function (a) { return 'Suma <b>' + a.n + '</b>.'; },
      pSub: function (a) { return 'Quita <b>' + a.n + '</b>.'; },
      pOn: function (a) { return 'Cuenta hasta <b>' + a.n + '</b>.'; },
      wayLabel: 'Cómo restar',
      wayTakeLabel: function (a) { return 'Quitar ' + a.n; },
      wayOnLabel: function (a) { return 'Contar desde ' + a.n + ' hacia adelante'; },
      tipOn: function (a) { return 'Empieza en ' + a.b + '. Añade semillas hasta que la Taptanita muestre ' + a.a + '.'; },
      onTitle: '¿CUÁNTO AÑADISTE?',
      askOn: function (a) { return 'Empezaste en ' + a.b + ' y contaste hasta ' + a.a + '. ¿Cuánto añadiste?'; },
      hintOn: function (a) { return 'Cuenta desde ' + a.b + ' hasta ' + a.a + '.'; },
      yesOn: function (a) { return '¡Sí! ' + a.a + ' − ' + a.b + ' = ' + a.d + ', porque ' + a.b + ' + ' + a.d + ' = ' + a.a + '.'; },
      yes: function (a) { return '¡Sí! ' + a.t + ' = ' + a.parts + '. Pulsa OTRO.'; },
      needMore: 'Faltan semillas. ', tooMany: 'Sobran semillas. ',
      putSeeds: 'Primero pon algunas semillas.',
      saved: function (a) { return '¡' + a.n + ' guardado! Sigue formando o pulsa BORRAR para uno nuevo.'; },

      stopsAt: function (a) { return 'Esta Taptanita llega solo hasta el lugar ×' + a.v + '.'; },
      pozosFull: function (a) { return '¡Todos los pozos están llenos! ' + og(a.s, 'El próximo ', 'La próxima ') + a.s.one + ' va a la Killa roja y completa la fase.'; },
      killaBusy: function (a) { return 'La Killa ya tiene ' + un(a.s) + ' ' + a.s.one + '. Primero quita ' + og(a.s, 'uno', 'una') + '.'; },
      takeFirst: function (a) { return 'Primero quita ' + un(a.s) + ' ' + a.s.one + '.'; },
      needPlace: function (a) { return 'Eso necesita otro lugar: la Taptanita llega solo hasta ×' + a.v + '.'; },
      brokeExtra: function (a) { return '¡Regreso de fase! 1 ' + a.s2.one + ' = ' + a.b + ' ' + a.s.many + '. ' + og(a.s, 'Los', 'Las') + ' que sobran esperan en el centro hasta que haya un pozo libre.'; },
      broke: function (a) { return '¡Regreso de fase! 1 ' + a.s2.one + ' = ' + a.b + ' ' + a.s.many + '.'; },
      traded: function (a) { return '¡Cambio de fase! ' + a.b + ' ' + a.s.many + ' = 1 ' + a.s2.one + '.'; },
      askCount: function (a) { return '¿' + og(a.s, 'Cuántos', 'Cuántas') + ' ' + a.s.many + ' hay ahora en la Taptanita?'; },
      hintCount: function (a) { return og(a.s, 'Cuéntalos', 'Cuéntalas') + ': ' + a.n + ' en los pozos azules + 1 en la Killa roja.'; },
      askTrade: function (a) { return a.b + ' ' + a.s.many + ' completan la fase. ¿Por ' + og(a.s2, 'cuántos', 'cuántas') + ' ' + a.s2.many + ' se cambian?'; },
      hintTrade: function (a) {
        return cap(los(a.s)) + ' ' + a.b + ' ' + a.s.many + ' ' + og(a.s, 'juntos', 'juntas') + ' completan la fase y se cambian por ' + un(a.s2) + ' ' + a.s2.one + '.';
      },
      notQuite: 'Casi. ',
      wrongPlace: function (a) { return cap(los(a.s)) + ' ' + a.s.many + ' van en la Taptanita ×' + a.v + ', no en la ×' + a.w + '.'; },
      fillFirst: 'Llena todos los pozos azules antes de la Killa roja.',
      clockwise: 'Sigue el sentido del reloj desde arriba a la derecha: suéltala en el círculo que brilla.',
      baseToast: function (a) {
        return 'Base ' + a.b + ': ' + a.n + ' pozo' + (a.n > 1 ? 's' : '') + '; luego la Killa roja completa la fase: ' + a.b + ' ' + a.s.many + ' = 1 ' + a.s2.one + '.';
      },
      sumBuilt: 'Números formados: ',
      sumCorrect: function (a) { return 'Retos correctos: ' + a.n + ' de ' + a.m; },
      sumTrades: 'Cambios de fase: ', sumBreaks: 'Regresos de fase: ',
      sumAsk: function (a) { return 'Preguntas de cambio de fase acertadas al primer intento: ' + a.n + ' de ' + a.m; }
    }
  };
})();
