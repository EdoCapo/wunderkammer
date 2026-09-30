/**
 * Wunderkammer — Il Quadro del Giorno (Daily Art & Poetic Curiosités)
 * Curated masterpieces with deep poetic narratives, secret details to seek,
 * comforting thoughts, and live fallback to museum APIs.
 */

export const MASTERPIECES_COLLECTION = [
  {
    id: 'klimt_il_bacio',
    title: 'Il Bacio (Der Kuss)',
    artist: 'Gustav Klimt',
    year: '1907–1908',
    medium: 'Olio e foglia d’oro su tela (180 × 180 cm)',
    museum: 'Österreichische Galerie Belvedere, Vienna',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/1024px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg',
    story: `Dipinto al culmine del suo "Periodo Aureo", Klimt realizzò quest'opera in un momento di profonda crisi interiore, quando le sue opere per l'Università di Vienna vennero aspramente criticate. Invece di ritirarsi nell'amarezza, l'artista si rifugiò nell'oro bizantino di Ravenna e nell'amore eterno.\n\nI due amanti si ergono sull'orlo di un prato fiorito, sospesi tra un abisso stellato e un manto dorato che li avvolge come un'armatura protettiva contro il resto del mondo. I motivi rettangolari e severi della tunica maschile si fondono dolcemente con i cerchi concentrici e floreali dell'abito femminile: un'unione di opposti che si completano.`,
    detailToSeek: `Osserva le dita della donna: la sua mano destra accarezza delicatamente la nuca dell'amato con dita abbandonate, mentre i suoi piedi poggiano proprio sul ciglio del dirupo fiorito, indicando una fiducia totale, cieca e serena.`,
    comfortThought: `L'oro non sbiadisce mai col tempo. Anche quando intorno sembra esserci un vuoto scuro, esiste sempre un abbraccio capace di diventare una cattedrale indistruttibile.`,
  },
  {
    id: 'van_gogh_notte_stellata',
    title: 'Notte Stellata',
    artist: 'Vincent van Gogh',
    year: '1889',
    medium: 'Olio su tela (73.7 × 92.1 cm)',
    museum: 'Museum of Modern Art (MoMA), New York',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1024px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    story: `Vincent dipinse la Notte Stellata guardando attraverso le sbarre della finestra del manicomio di Saint-Rémy-de-Provence, pochi mesi prima di lasciarci. In una lettera al fratello Theo scrisse: «Guardare le stelle mi fa sempre sognare, così come i punti neri che rappresentano città e villaggi su una mappa mi fanno sognare. Perché, mi chiedo, i punti luccicanti nel cielo dovrebbero esserci meno accessibili dei punti neri sulla mappa della Francia?».\n\nIl cielo non è calmo: è un fiume vorticoso di energia cosmica pulsante, dove la luce delle stelle è così potente da piegare lo spazio circostante, mentre il villaggio dorme pacifico sotto la sua coltre.`,
    detailToSeek: `Il grande cipresso scuro in primo piano si innalza come una fiamma vivente collegando la terra al cielo: è l'unico elemento che tocca contemporaneamente entrambi i mondi.`,
    comfortThought: `Perfino nei momenti di notte più profonda e solitaria, il cielo sta muovendo miliardi di galassie e di stelle solo per ricordarci che la luce non si spegne mai del tutto.`,
  },
  {
    id: 'monet_ninfee',
    title: 'Le Ninfee (Il Ponte Giapponese)',
    artist: 'Claude Monet',
    year: '1899',
    medium: 'Olio su tela (92.7 × 73.7 cm)',
    museum: 'National Gallery, Londra',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Claude_Monet_-_Water_Lilies_and_Japanese_Bridge_-_Google_Art_Project.jpg/1024px-Claude_Monet_-_Water_Lilies_and_Japanese_Bridge_-_Google_Art_Project.jpg',
    story: `Monet non dipinse semplicemente un giardino: creò prima il giardino reale nella sua casa di Giverny, deviando il corso di un ruscello e piantando personalmente centinaia di specie acquatiche, e solo dopo iniziò a dipingerlo per oltre trent'anni. Quando la cataratta cominciò a togliergli la vista, continuò a dipingere a memoria di luce e cuore.\n\nL'acqua non ha orizzonte: cielo, salici piangenti e riflessi sono una sola superficie liquida dove il confine tra ciò che sta sopra e ciò che sta sotto si dissolve completamente nella pace.`,
    detailToSeek: `Cerca la consistenza materica delle ninfee bianche: la pasta pittorica non è piatta, è spessa e palpabile, come se Monet avesse scolpito il fiore direttamente con la punta della spatola.`,
    comfortThought: `L'acqua non oppone resistenza a nulla: accoglie ogni riflesso, ogni foglia che cade, eppure rimane sempre limpida e profonda. A volte basta lasciar scorrere.`,
  },
  {
    id: 'friedrich_viandante',
    title: 'Viandante sul mare di nebbia',
    artist: 'Caspar David Friedrich',
    year: '1818',
    medium: 'Olio su tela (94.8 × 74.8 cm)',
    museum: 'Hamburger Kunsthalle, Amburgo',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg',
    story: `Il manifesto visivo del Romanticismo universale. Un viaggiatore solitario, avvolto in un cappotto verde scuro e con un bastone da passeggio, contempla dall'alto di uno sperone roccioso un oceano infinito di nubi e vette montuose.\n\nFriedrich scelse deliberatamente di dipingere la figura di spalle (il famoso *Rückenfigur*). In questo modo, noi non guardiamo il viandante: noi *diventiamo* il viandante. I suoi occhi sono i nostri occhi, il suo respiro sul vento gelido della montagna diventa il nostro.`,
    detailToSeek: `Tra le spire di nebbia emergono le cime lontane: non sono ostacoli, sono isole di terra ferma verso cui il cammino può proseguire.`,
    comfortThought: `Non serve vedere tutta la strada davanti a sé per fare il passo successivo. Anche quando il futuro sembra avvolto nella nebbia, sotto le nuvole la montagna è solida e il punto di vista dall'alto è già tuo.`,
  },
  {
    id: 'vermeer_ragazza_orecchino',
    title: 'Ragazza con il Turbante (Orecchino di Perla)',
    artist: 'Johannes Vermeer',
    year: '1665',
    medium: 'Olio su tela (44.5 × 39 cm)',
    museum: 'Mauritshuis, L\'Aia',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg',
    story: `Non è un ritratto su commissione, ma un *tronie*: uno studio di espressione e costume dell'età dell'oro olandese. Sullo sfondo nero come la pece, la figura emerge come un fulmine di grazia. La fanciulla si volta verso di noi come se qualcuno l'avesse appena chiamata per nome, con le labbra socchiuse sul punto di dire qualcosa che rimarrà per sempre sospeso.\n\nIl contrasto tra il tessuto orientale blu oltremare (il costosissimo lapislazzuli macinato) e la semplicità del viso crea un enigma che affascina da quasi quattro secoli.`,
    detailToSeek: `Guarda bene la perla: in realtà Vermeer non ha dipinto una perla! Ci sono solo due pennellate di biacca di piombo pura: un tocco di luce in alto a sinistra e un riflesso morbido del colletto in basso. Il nostro cervello fa tutto il resto, creando la perla più famosa della storia.`,
    comfortThought: `Spesso crediamo di dover essere perfetti e completi in ogni dettaglio, ma la vera magia nasce da un paio di tocchi autentici di luce posizionati al punto giusto.`,
  },
  {
    id: 'botticelli_venere',
    title: 'La Nascita di Venere',
    artist: 'Sandro Botticelli',
    year: '1485',
    medium: 'Tempera su tela di lino (172.5 × 278.5 cm)',
    museum: 'Galleria degli Uffizi, Firenze',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1024px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
    story: `Dipinta per la famiglia Medici su una tela di lino finissimo, la composizione celebra l'ideale neoplatonico dell'amore come forza motrice e purificatrice dell'universo. La dea della bellezza approda sull'isola di Cipro portata da una conchiglia scanalata, sospinta dal soffio impetuoso dei venti Zefiro e Clori mentre piovono rose profumate d'oro.\n\nSulla riva, una delle Ore (la Primavera) la attende trepidante con un manto decorato di miosotidi e primule per avvolgerla e proteggerla.`,
    detailToSeek: `I capelli dorati di Venere sono rifiniti uno a uno con sottilissime striature di vero oro zecchino, che riflettono la luce dell'ambiente in base all'angolo con cui ci si muove davanti alla tela.`,
    comfortThought: `La bellezza non deve fare alcuno sforzo per esistere: non combatte, non grida. Emerge semplicemente dal mare e il vento stesso soffia per accompagnarla alla riva.`,
  },
  {
    id: 'magritte_amanti',
    title: 'Gli Amanti (Les Amants)',
    artist: 'René Magritte',
    year: '1928',
    medium: 'Olio su tela (54 × 73 cm)',
    museum: 'Museum of Modern Art (MoMA), New York',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Les_Amants_%28The_Lovers%29_by_Ren%C3%A9_Magritte.jpg/800px-Les_Amants_%28The_Lovers%29_by_Ren%C3%A9_Magritte.jpg',
    story: `Due figure si baciano con passione, ma i loro volti sono interamente avvolti da panni bianchi che ne celano l'identità e ne impediscono il contatto diretto della pelle. È una delle immagini più evocative dell'arte del Novecento.\n\nMagritte affronta il mistero dell'intimità: amare significa toccarsi con l'anima anche quando non possiamo vedere tutto, accettando che nell'altra persona rimarrà sempre un territorio segreto, sacro e poetico da rispettare e custodire con cura.`,
    detailToSeek: `La stanza ha pareti rosse intense e modanature classiche, ma il soffitto blu sembra aprirsi verso l'esterno, come se la stanza stessa stesse sognando di essere cielo aperto.`,
    comfortThought: `L'affetto autentico non ha bisogno di vedere tutto per credere: sa riconoscere la persona amata anche a occhi chiusi, nel silenzio e oltre qualsiasi distanza.`,
  },
  {
    id: 'hopper_nighthawks',
    title: 'Nottambuli (Nighthawks)',
    artist: 'Edward Hopper',
    year: '1942',
    medium: 'Olio su tela (84.1 × 152.4 cm)',
    museum: 'Art Institute of Chicago',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1024px-Nighthawks_by_Edward_Hopper_1942.jpg',
    story: `Dipinto nelle settimane immediatamente successive all'attacco di Pearl Harbor, quando New York temeva bombardamenti aerei e viveva sotto blackout notturni. Hopper creò questa tavola calda luminosa come un acquario d'ambra e neon in mezzo alle strade deserte.\n\nI clienti non parlano tra loro, eppure non sono soli: condividono lo stesso rifugio caldo, la stessa tazza di caffè, la stessa quiete della notte. Hopper disse: «Non la vedevo particolarmente solitaria... forse ho dipinto inconsciamente la solitudine di una grande città, ma è anche un luogo accogliente dove sostare».`,
    detailToSeek: `Guarda bene l'edificio: non c'è nessuna porta visibile verso l'esterno. È uno spazio protetto, sospeso nel tempo, dove il trambusto e i problemi del mondo di fuori non possono entrare.`,
    comfortThought: `Anche quando ci sentiamo silenziosi in mezzo alla folla, c'è sempre un rifugio di luce accogliente che ci aspetta fino a tardi, dove non c'è bisogno di spiegare nulla per sentirsi al sicuro.`,
  },
  {
    id: 'hokusai_onda',
    title: 'La Grande Onda di Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    medium: 'Xilografia policroma su carta (25.7 × 37.8 cm)',
    museum: 'Metropolitan Museum of Art, New York',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg',
    story: `L'opera più celebre della serie "Trentasei vedute del Monte Fuji". Hokusai la realizzò a più di settant'anni, quando scrisse: «Tutto ciò che ho prodotto prima dei settant'anni non vale la pena di essere contato. A settantatré ho iniziato a comprendere la vera struttura della natura, degli animali, delle piante, delle onde».\n\nLa cresta dell'onda si frantuma in artigli di schiuma bianca che sembrano ghermire il cielo, ma i marinai sulle barche da pesca scivolano seguendo la curva dell'acqua, fiduciosi e sincronizzati con il ritmo del mare. Sullo sfondo, immutabile e sereno, veglia il sacro Monte Fuji.`,
    detailToSeek: `La forma del Monte Fuji innevato sullo sfondo è esattamente identica a quella delle piccole onde in primo piano: l'eterno e il passeggero hanno la medesima forma geometrica.`,
    comfortThought: `Le grandi onde arrivano impetuose, fanno paura e sembrano travolgere ogni cosa. Ma ogni onda, per quanto immensa, deve poi necessariamente sciogliersi e tornare ad essere mare calmo. E tu rimani.`,
  },
  {
    id: 'caravaggio_canestra',
    title: 'Canestra di Frutta',
    artist: 'Caravaggio (Michelangelo Merisi)',
    year: '1599',
    medium: 'Olio su tela (46 × 64.5 cm)',
    museum: 'Pinacoteca Ambrosiana, Milano',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Canestra_di_frutta_di_Caravaggio.jpg/800px-Canestra_di_frutta_di_Caravaggio.jpg',
    story: `Prima di Caravaggio, dipingere la frutta o gli oggetti inanimati era considerato un genere minore e senza valore. Il giovane Michelangelo Merisi rivoluzionò la storia dell'arte dichiarando che «tanta manifattura gli era a fare un quadro buono di fiori, come di figure».\n\nInvece di dipingere frutti perfetti e finti, Caravaggio dipinse la realtà: foglie secche e accartocciate, una mela intaccata dal verme, fichi maturi e polverosi. Ha trovato una bellezza commovente proprio nell'imperfezione e nella fragilità della vita terrena.`,
    detailToSeek: `La base della canestra di vimini sporge di un millimetro oltre il bordo del tavolo di legno, verso di noi: Caravaggio crea la prima illusione di spazio 3D moderno invitandoci a prenderla con le mani.`,
    comfortThought: `Non serve essere impeccabili o splendenti ogni giorno. È proprio nelle piccole crepe, nei petali stanchi e nelle giornate fragili che si nasconde la parte più vera, umana e poetica di noi.`,
  },
];

/**
 * Gets the painting of the day based on today's calendar date
 */
export function getDailyPainting() {
  const today = new Date();
  // Hash by year, month, date
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % MASTERPIECES_COLLECTION.length;
  return {
    ...MASTERPIECES_COLLECTION[index],
    dateFormatted: today.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}

/**
 * Gets a random painting from the curated collection
 */
export function getRandomCuratedPainting(excludeId = null) {
  let pool = MASTERPIECES_COLLECTION;
  if (excludeId) {
    pool = pool.filter((p) => p.id !== excludeId);
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
