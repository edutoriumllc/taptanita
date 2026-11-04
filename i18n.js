/* Taptinita — all on-screen text in English and Spanish.
   Plain strings, or functions that take an args object for text that needs numbers,
   seed names (s, s2) or Spanish gender (g: 'm' / 'f'). */
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
        { one: 'pea', many: 'peas', label: 'PEAS', short: 'Peas' },
        { one: 'bean', many: 'beans', label: 'BEANS', short: 'Beans' },
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
      helpTitle: 'HOW TO PLAY', gotIt: 'GOT IT', askTitle: 'BEFORE YOU TRADE', doneTitle: 'NICE WORK!', keepPlaying: 'KEEP PLAYING',
      helpHtml: function (a) {
        return '<li>Each place has its own seed: ' + a.parts + '. In base 10, tap a place card to choose its seed; the place menu adds tenths, hundredths and thousandths.</li>' +
          '<li>Drag seeds from a cup into the <b class="t-blue">blue pozos</b>, clockwise from the top right. The glowing circle is next.</li>' +
          '<li>To take a seed away, double-tap it or drag it off the Taptinita.</li>' +
          '<li>All pozos full? Add one more seed (tap the cup or drop it on the Taptinita) and it goes to the <b class="t-red">red Killa</b> by itself. Answer the question to trade them for one seed of the next place.</li>' +
          '<li>Taking away and not enough corn? Drag a pea from the Taptinita onto the <b class="t-red">red Killa</b> to break it into 10 corn (a bean breaks into 10 peas). Or tap <b class="t-yellow">+?</b> to count on instead.</li>' +
          '<li>ONE shows one kind of seed at a time (tap a place card to switch). ALL puts every kind of seed together on the Taptinita, one of each per pozo, so you see the whole number.</li>';
      },
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
      tipOn: function (a) { return 'Start at ' + a.b + '. Add seeds until the Taptinita shows ' + a.a + '.'; },
      onTitle: 'HOW MUCH DID YOU ADD?',
      askOn: function (a) { return 'You started at ' + a.b + ' and counted on to ' + a.a + '. How much did you add?'; },
      hintOn: function (a) { return 'Count up from ' + a.b + ' to ' + a.a + '.'; },
      yesOn: function (a) { return 'Yes! ' + a.a + ' − ' + a.b + ' = ' + a.d + ', because ' + a.b + ' + ' + a.d + ' = ' + a.a + '.'; },
      yes: function (a) { return 'Yes! ' + a.t + ' = ' + a.parts + '. Tap NEXT.'; },
      needMore: 'Need more seeds. ', tooMany: 'Too many seeds. ',
      putSeeds: 'Put some seeds on first.',
      saved: function (a) { return 'Saved ' + a.n + '! Keep building or CLEAR for a new one.'; },

      stopsAt: function (a) { return 'This Taptinita stops at the ×' + a.v + ' place.'; },
      pozosFull: function (a) { return 'All pozos are full! The next ' + a.s.one + ' goes in the red Killa.'; },
      killaBusy: function (a) { return 'The Killa already holds a ' + a.s.one + '. Take one away first.'; },
      takeFirst: function (a) { return 'Take away a ' + a.s.one + ' first.'; },
      needPlace: function (a) { return 'That needs another place — the Taptinita stops at ×' + a.v + '.'; },
      brokeExtra: function (a) { return '1 ' + a.s2.one + ' = ' + a.b + ' ' + a.s.many + '! The extra ' + a.s.many + ' wait in the middle until a pozo is free.'; },
      broke: function (a) { return '1 ' + a.s2.one + ' = ' + a.b + ' ' + a.s.many + '!'; },
      traded: function (a) { return a.b + ' ' + a.s.many + ' = 1 ' + a.s2.one + '!'; },
      askCount: function (a) { return 'How many ' + a.s.many + ' are on the Taptinita now?'; },
      hintCount: function (a) { return 'Count them: ' + a.n + ' in the blue pozos + 1 in the red Killa.'; },
      askTrade: function (a) { return a.b + ' ' + a.s.many + ' can be traded for how many ' + a.s2.many + '?'; },
      hintTrade: function (a) { return 'All ' + a.b + ' ' + a.s.many + ' together become one ' + a.s2.one + '.'; },
      notQuite: 'Not quite. ',
      wrongPlace: function (a) { return cap(a.s.many) + ' go in the ×' + a.v + ' Taptinita, not the ×' + a.w + '.'; },
      fillFirst: 'Fill every blue pozo before the red Killa.',
      clockwise: 'Go clockwise from the top right: drop it in the glowing circle.',
      baseToast: function (a) {
        return 'Base ' + a.b + ': ' + a.n + ' pozo' + (a.n > 1 ? 's' : '') + ', then the red Killa trades ' + a.b + ' ' + a.s.many + ' for 1 ' + a.s2.one + '.';
      },
      sumBuilt: 'Numbers built: ',
      sumCorrect: function (a) { return 'Challenges correct: ' + a.n + ' of ' + a.m; },
      sumTrades: 'Trades made: ', sumBreaks: 'Seeds broken apart: ',
      sumAsk: function (a) { return 'Trade questions right first try: ' + a.n + ' of ' + a.m; }
    },

    es: {
      // Ecuadorian names: maíz, arveja, fréjol, chocho
      seeds: [
        { one: 'grano de maíz', many: 'granos de maíz', label: 'MAÍZ', short: 'Maíz', g: 'm' },
        { one: 'arveja', many: 'arvejas', label: 'ARVEJAS', short: 'Arvejas', g: 'f' },
        { one: 'fréjol', many: 'fréjoles', label: 'FRÉJOLES', short: 'Fréjoles', g: 'm' },
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
      helpTitle: 'CÓMO JUGAR', gotIt: '¡LISTO!', askTitle: 'ANTES DE CAMBIAR', doneTitle: '¡BUEN TRABAJO!', keepPlaying: 'SEGUIR JUGANDO',
      helpHtml: function (a) {
        return '<li>Cada lugar tiene su semilla: ' + a.parts + '. En base 10, toca una tarjeta de lugar para elegir su semilla; el menú de lugares añade décimas, centésimas y milésimas.</li>' +
          '<li>Arrastra semillas de un vaso a los <b class="t-blue">pozos azules</b>, en el sentido del reloj desde arriba a la derecha. El círculo que brilla es el siguiente.</li>' +
          '<li>Para quitar una semilla, tócala dos veces o arrástrala fuera de la Taptinita.</li>' +
          '<li>¿Pozos llenos? Añade una semilla más (toca el vaso o suéltala en la Taptinita) y va sola a la <b class="t-red">Killa roja</b>. Responde la pregunta para cambiarlas por una semilla del siguiente lugar.</li>' +
          '<li>¿Restando y no alcanza el maíz? Arrastra una arveja de la Taptinita a la <b class="t-red">Killa roja</b> para romperla en 10 granos de maíz (un fréjol se rompe en 10 arvejas). O toca <b class="t-yellow">+?</b> para contar hacia adelante.</li>' +
          '<li>UNO muestra un tipo de semilla a la vez (toca una tarjeta de lugar para cambiar). TODO pone todas las semillas juntas en la Taptinita, una de cada tipo por pozo, para ver el número completo.</li>';
      },
      cupLabel: function (a) { return 'Vaso de ' + a.s.many + ': arrastra uno o pulsa Enter para añadir uno'; },

      inBase10: function (a) { return '= ' + a.v + ' en base 10'; },
      pBuild: function (a) { return 'Forma cualquier número. ' + a.parts + '.'; },
      pMake10: function (a) { return 'Forma <b>' + a.n + '</b> con semillas.'; },
      pMakeB: function (a) { return 'Muestra <b>' + a.n + '</b> en base ' + a.b + '.'; },
      boardShows: 'La Taptinita muestra', boardShort: 'Taptinita:',
      pAdd: function (a) { return 'Suma <b>' + a.n + '</b>.'; },
      pSub: function (a) { return 'Quita <b>' + a.n + '</b>.'; },
      pOn: function (a) { return 'Cuenta hasta <b>' + a.n + '</b>.'; },
      wayLabel: 'Cómo restar',
      wayTakeLabel: function (a) { return 'Quitar ' + a.n; },
      wayOnLabel: function (a) { return 'Contar desde ' + a.n + ' hacia adelante'; },
      tipOn: function (a) { return 'Empieza en ' + a.b + '. Añade semillas hasta que la Taptinita muestre ' + a.a + '.'; },
      onTitle: '¿CUÁNTO AÑADISTE?',
      askOn: function (a) { return 'Empezaste en ' + a.b + ' y contaste hasta ' + a.a + '. ¿Cuánto añadiste?'; },
      hintOn: function (a) { return 'Cuenta desde ' + a.b + ' hasta ' + a.a + '.'; },
      yesOn: function (a) { return '¡Sí! ' + a.a + ' − ' + a.b + ' = ' + a.d + ', porque ' + a.b + ' + ' + a.d + ' = ' + a.a + '.'; },
      yes: function (a) { return '¡Sí! ' + a.t + ' = ' + a.parts + '. Pulsa OTRO.'; },
      needMore: 'Faltan semillas. ', tooMany: 'Sobran semillas. ',
      putSeeds: 'Primero pon algunas semillas.',
      saved: function (a) { return '¡' + a.n + ' guardado! Sigue formando o pulsa BORRAR para uno nuevo.'; },

      stopsAt: function (a) { return 'Esta Taptinita llega solo hasta el lugar ×' + a.v + '.'; },
      pozosFull: function (a) { return '¡Todos los pozos están llenos! ' + og(a.s, 'El próximo ', 'La próxima ') + a.s.one + ' va a la Killa roja.'; },
      killaBusy: function (a) { return 'La Killa ya tiene ' + un(a.s) + ' ' + a.s.one + '. Primero quita ' + og(a.s, 'uno', 'una') + '.'; },
      takeFirst: function (a) { return 'Primero quita ' + un(a.s) + ' ' + a.s.one + '.'; },
      needPlace: function (a) { return 'Eso necesita otro lugar: la Taptinita llega solo hasta ×' + a.v + '.'; },
      brokeExtra: function (a) { return '¡1 ' + a.s2.one + ' = ' + a.b + ' ' + a.s.many + '! ' + og(a.s, 'Los', 'Las') + ' que sobran esperan en el centro hasta que haya un pozo libre.'; },
      broke: function (a) { return '¡1 ' + a.s2.one + ' = ' + a.b + ' ' + a.s.many + '!'; },
      traded: function (a) { return '¡' + a.b + ' ' + a.s.many + ' = 1 ' + a.s2.one + '!'; },
      askCount: function (a) { return '¿' + og(a.s, 'Cuántos', 'Cuántas') + ' ' + a.s.many + ' hay ahora en la Taptinita?'; },
      hintCount: function (a) { return og(a.s, 'Cuéntalos', 'Cuéntalas') + ': ' + a.n + ' en los pozos azules + 1 en la Killa roja.'; },
      askTrade: function (a) { return a.b + ' ' + a.s.many + ' se cambian por ¿' + og(a.s2, 'cuántos', 'cuántas') + ' ' + a.s2.many + '?'; },
      hintTrade: function (a) {
        return cap(los(a.s)) + ' ' + a.b + ' ' + a.s.many + ' ' + og(a.s, 'juntos', 'juntas') + ' se convierten en ' + un(a.s2) + ' ' + a.s2.one + '.';
      },
      notQuite: 'Casi. ',
      wrongPlace: function (a) { return cap(los(a.s)) + ' ' + a.s.many + ' van en la Taptinita ×' + a.v + ', no en la ×' + a.w + '.'; },
      fillFirst: 'Llena todos los pozos azules antes de la Killa roja.',
      clockwise: 'Sigue el sentido del reloj desde arriba a la derecha: suéltala en el círculo que brilla.',
      baseToast: function (a) {
        return 'Base ' + a.b + ': ' + a.n + ' pozo' + (a.n > 1 ? 's' : '') + '; luego la Killa roja cambia ' + a.b + ' ' + a.s.many + ' por 1 ' + a.s2.one + '.';
      },
      sumBuilt: 'Números formados: ',
      sumCorrect: function (a) { return 'Retos correctos: ' + a.n + ' de ' + a.m; },
      sumTrades: 'Cambios hechos: ', sumBreaks: 'Semillas separadas: ',
      sumAsk: function (a) { return 'Preguntas acertadas al primer intento: ' + a.n + ' de ' + a.m; }
    }
  };
})();
