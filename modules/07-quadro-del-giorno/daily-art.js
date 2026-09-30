/**
 * Wunderkammer — Il Quadro del Giorno (Daily Art & Poetic Curiosités)
 * Curated masterpieces with deep poetic narratives, secret details to seek,
 * comforting thoughts, and resilient fallback museum image URLs.
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
    fallbackImage: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP145924.jpg',
    story: `Dipinto al culmine del suo "Periodo Aureo", Klimt realizzò quest'opera in un momento di profonda crisi interiore, quando le sue opere per l'Università di Vienna vennero aspramente criticate. Invece di ritirarsi nell'amarezza, l'artista si rifugiò nell'oro bizantino di Ravenna e nell'amore eterno.\n\nI due amanti si ergono sull'orlo di un prato fiorito, sospesi tra un abisso stellato e un manto dorato che li avvolge come un'armatura protettiva contro il resto del mondo. I motivi rettangolari e severi della tunica maschile si fondono dolcemente con i cerchi concentrici e floreali dell'abito femminile: un'unione di opposti che si completano.`,
    detailToSeek: `Osserva le dita della donna: la sua mano destra accarezza delicatamente la nuca dell'amato con dita abbandonate, mentre i suoi piedi poggiano proprio sul ciglio del dirupo fiorito, indicando una fiducia totale, cieca e serena.`,
    comfortThought: `L'oro non sbiadisce mai col tempo. Anche quando intorno sembra esserci un vuoto scuro, esiste sempre un abbraccio capace di diventare una cattedrale indistruttibile.`,
  },
  {
    id: 'hopper_nighthawks',
    title: 'I Nottambuli (Nighthawks)',
    artist: 'Edward Hopper',
    year: '1942',
    medium: 'Olio su tela (84.1 × 152.4 cm)',
    museum: 'Art Institute of Chicago',
    image: 'https://www.artic.edu/iiif/2/831a05de-d3f6-f4fa-a460-23008dd58dda/full/843,/0/default.jpg',
    fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1024px-Nighthawks_by_Edward_Hopper_1942.jpg',
    story: `Dipinto nelle settimane immediatamente successive all'attacco di Pearl Harbor, quando New York temeva incursioni e viveva sotto blackout notturni. Hopper creò questa tavola calda luminosa come un acquario d'ambra e neon in mezzo alle strade deserte.\n\nI clienti non parlano tra loro, eppure non sono soli: condividono lo stesso rifugio caldo, la stessa tazza di caffè, la stessa quiete della notte. Hopper disse: «Non la vedevo particolarmente solitaria... forse ho dipinto inconsciamente la solitudine di una grande città, ma è anche un luogo accogliente dove sostare».`,
    detailToSeek: `Guarda bene l'edificio: non c'è nessuna porta visibile verso l'esterno. È uno spazio protetto, sospeso nel tempo, dove il trambusto e i problemi del mondo di fuori non possono entrare.`,
    comfortThought: `Anche quando ci sentiamo silenziosi in mezzo alla folla, c'è sempre un rifugio di luce accogliente che ci aspetta fino a tardi, dove non c'è bisogno di spiegare nulla per sentirsi al sicuro.`,
  },
  {
    id: 'van_gogh_camera',
    title: 'La Camera da Letto ad Arles',
    artist: 'Vincent van Gogh',
    year: '1889',
    medium: 'Olio su tela (73 × 91 cm)',
    museum: 'Art Institute of Chicago',
    image: 'https://www.artic.edu/iiif/2/6644829f-f292-c5c4-a73c-0356a6fdbf0d/full/843,/0/default.jpg',
    fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg/1024px-Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg',
    story: `Vincent descrisse questa stanza in una lettera al fratello Theo come il luogo dove «la mente, o meglio l'immaginazione, deve riposare». Ha dipinto i mobili con proporzioni solide e colori caldi e schietti (pareti lilla chiaro, pavimento di mattoni rossi, letto giallo burro), voleva che guardare il quadro desse una sensazione di quiete assoluta.\n\nNonostante le tempeste della sua vita, questa stanza era il suo nido di pace, dove ogni sedia, brocca e finestra spalancata sulla luce del sud accoglieva la speranza di un nuovo inizio.`,
    detailToSeek: `Osserva i doppi ritratti appesi sopra la testiera del letto: sono i ritratti dei suoi amici Eugène Boch e Paul-Eugène Milliet, a ricordargli che non si è mai veramente soli finché si hanno persone a cui voler bene nel pensiero.`,
    comfortThought: `A volte basta un letto accogliente, un raggio di sole che entra dalla finestra e un rifugio calmo per ricaricare l'anima e ritrovare la rotta.`,
  },
  {
    id: 'monet_ninfee',
    title: 'Lo Stagno delle Ninfee',
    artist: 'Claude Monet',
    year: '1906',
    medium: 'Olio su tela (89.9 × 94.1 cm)',
    museum: 'Art Institute of Chicago',
    image: 'https://www.artic.edu/iiif/2/3c27b499-af56-f0d5-93b5-a7f2f1ad5813/full/843,/0/default.jpg',
    fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Claude_Monet_-_Water_Lilies_and_Japanese_Bridge_-_Google_Art_Project.jpg/1024px-Claude_Monet_-_Water_Lilies_and_Japanese_Bridge_-_Google_Art_Project.jpg',
    story: `Monet non dipinse semplicemente un giardino: creò prima il giardino reale nella sua casa di Giverny, deviando il corso di un ruscello e piantando personalmente centinaia di specie acquatiche, e solo dopo iniziò a dipingerlo per oltre trent'anni. Quando la cataratta cominciò a offuscargli la vista, continuò a dipingere a memoria di luce e cuore.\n\nL'acqua non ha orizzonte: cielo, salici piangenti e riflessi sono una sola superficie liquida dove il confine tra ciò che sta sopra e ciò che sta sotto si dissolve completamente nella pace.`,
    detailToSeek: `Cerca la consistenza materica delle ninfee galleggianti: la pasta pittorica non è piatta, è spessa e palpabile, come se Monet avesse scolpito il fiore direttamente con la punta della spatola.`,
    comfortThought: `L'acqua non oppone resistenza a nulla: accoglie ogni riflesso, ogni foglia che cade, eppure rimane sempre limpida e profonda. A volte basta lasciar scorrere.`,
  },
  {
    id: 'hokusai_onda',
    title: 'La Grande Onda di Kanagawa',
    artist: 'Katsushika Hokusai',
    year: '1831',
    medium: 'Xilografia policroma su carta (25.7 × 37.8 cm)',
    museum: 'Art Institute of Chicago',
    image: 'https://www.artic.edu/iiif/2/b3974542-b9b4-7568-fc4b-966738f61d78/full/843,/0/default.jpg',
    fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1024px-Tsunami_by_hokusai_19th_century.jpg',
    story: `L'opera più celebre della serie "Trentasei vedute del Monte Fuji". Hokusai la realizzò a più di settant'anni, quando scrisse: «Tutto ciò che ho prodotto prima dei settant'anni non vale la pena di essere contato. A settantatré ho iniziato a comprendere la vera struttura della natura, degli animali, delle piante, delle onde».\n\nLa cresta dell'onda si frantuma in artigli di schiuma bianca che sembrano ghermire il cielo, ma i marinai sulle barche da pesca scivolano seguendo la curva dell'acqua, fiduciosi e sincronizzati con il ritmo del mare. Sullo sfondo, immutabile e sereno, veglia il sacro Monte Fuji.`,
    detailToSeek: `La forma del Monte Fuji innevato sullo sfondo è esattamente identica a quella delle piccole onde in primo piano: l'eterno e il passeggero condividono la medesima armonia geometrica.`,
    comfortThought: `Le grandi onde arrivano impetuose, fanno rumore e sembrano travolgere ogni cosa. Ma ogni onda, per quanto immensa, deve poi necessariamente sciogliersi e tornare ad essere mare calmo. E tu rimani, più forte di prima.`,
  },
  {
    id: 'seurat_grande_jatte',
    title: 'Una Domenica alla Grande Jatte',
    artist: 'Georges Seurat',
    year: '1884–1886',
    medium: 'Olio su tela (207.6 × 308 cm)',
    museum: 'Art Institute of Chicago',
    image: 'https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg',
    fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1024px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg',
    story: `Per due anni interi, Seurat si recò all'isola della Grande Jatte sulla Senna con una scatola di colori di legno, dipingendo decine di bozzetti prima di realizzare questo monumentale capolavoro del puntinismo. Invece di mescolare i colori sulla tavolozza, applicò milioni di minuscoli punti cromatici puri accostati, lasciando che fosse la retina dell'osservatore a fonderli in luce viva.\n\nParigini di ogni classe sociale riposano sull'erba sotto il sole della domenica, tra vele bianche sul fiume e ombre gentili degli alberi.`,
    detailToSeek: `In basso a destra, la signora con l'elegante ombrellino tiene al guinzaglio una piccola scimmietta esotica che gioca sull'erba insieme a un cagnolino.`,
    comfortThought: `Anche i quadri più maestosi e complessi sono fatti di minuscoli punti singoli messi uno accanto all'altro con pazienza. Fai un piccolo punto alla volta.`,
  },
  {
    id: 'friedrich_viandante',
    title: 'Viandante sul mare di nebbia',
    artist: 'Caspar David Friedrich',
    year: '1818',
    medium: 'Olio su tela (94.8 × 74.8 cm)',
    museum: 'Hamburger Kunsthalle, Amburgo',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg',
    fallbackImage: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1871.jpg',
    story: `Il manifesto visivo del Romanticismo universale. Un viaggiatore solitario, avvolto in un cappotto verde scuro e con un bastone da passeggio, contempla dall'alto di uno sperone roccioso un oceano infinito di nubi e vette montuose.\n\nFriedrich scelse deliberatamente di dipingere la figura di spalle (il famoso Rückenfigur). In questo modo, noi non guardiamo il viandante: noi diventiamo il viandante. I suoi occhi sono i nostri occhi, il suo respiro sul vento gelido della montagna diventa il nostro.`,
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
    fallbackImage: 'https://images.metmuseum.org/CRDImages/ap/web-large/DP-14286-044.jpg',
    story: `Non è un semplice ritratto, ma un tronie: uno studio di espressione e costume dell'età dell'oro olandese. Sullo sfondo nero come la pece, la figura emerge come un fulmine di grazia. La fanciulla si volta verso di noi come se qualcuno l'avesse appena chiamata per nome, con le labbra socchiuse sul punto di dire qualcosa che rimarrà per sempre sospeso.\n\nIl contrasto tra il tessuto orientale blu oltremare (il costosissimo lapislazzuli macinato) e la morbidezza del viso crea un enigma che affascina da quattro secoli.`,
    detailToSeek: `Guarda bene la perla: in realtà Vermeer non ha dipinto una perla! Ci sono solo due pennellate di biacca di piombo pura: un tocco di luce in alto a sinistra e un riflesso morbido del colletto in basso. Il nostro cervello fa tutto il resto, creando la perla più famosa della storia.`,
    comfortThought: `Spesso crediamo di dover essere perfetti e completi in ogni dettaglio, ma la vera magia nasce da un paio di tocchi autentici di luce posizionati al punto giusto.`,
  },
  {
    id: 'turner_canal_grande',
    title: 'Il Canal Grande, Venezia',
    artist: 'J.M.W. Turner',
    year: '1835',
    medium: 'Olio su tela (91.4 × 122.2 cm)',
    museum: 'Metropolitan Museum of Art, New York',
    image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1871.jpg',
    fallbackImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    story: `Turner visitò Venezia tre volte nella sua vita, e ogni volta rimase estasiato dalla luce che rimbalza tra la laguna e i palazzi storici. In quest'opera, la chiesa di Santa Maria della Salute e il Canal Grande sembrano quasi dissolversi in una nebbia dorata e madreperlacea.\n\nTurner non cercava la precisione topografica degli architetti: cercava la poesia del sole che tramonta sull'acqua, quando la materia solida cede il passo al respiro della luce.`,
    detailToSeek: `Sulle gondole e sulle rive in primo piano ci sono minuscole macchie di rosso e giallo cadmio che rappresentano marinai e passanti: sono scintille vive che danno ritmo a tutta l'acqua.`,
    comfortThought: `La luce più calda e dorata arriva sempre verso il tramonto, quando la giornata si fa morbida e le ombre si allungano per accogliere il riposo.`,
  },
  {
    id: 'sargent_madame_x',
    title: 'Madame X (Virginie Gautreau)',
    artist: 'John Singer Sargent',
    year: '1884',
    medium: 'Olio su tela (208.6 × 109.9 cm)',
    museum: 'Metropolitan Museum of Art, New York',
    image: 'https://images.metmuseum.org/CRDImages/ap/web-large/DP-14286-044.jpg',
    fallbackImage: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP146452.jpg',
    story: `Quando fu esposto al Salon di Parigi del 1884, il dipinto scatenò un tremendo scandalo: l'aristocrazia parigina fu sconvolta dall'audacia della posa e dalla spallina dell'abito di raso nero originariamente dipinta scivolata sul braccio. Sargent dovette ridipingere la spallina alzata, ma non rinnegò mai l'opera, definendola: «Credo sia la cosa migliore che abbia mai fatto».\n\nLa posa fiera, il profilo scultoreo e l'incarnato di porcellana sfidano il tempo con un'eleganza senza tempo.`,
    detailToSeek: `La mano destra poggia delicatamente sul tavolino rotondo con le dita flesse all'indietro: una posa di grazia e controllo formidabile che bilancia tutta la silhouette.`,
    comfortThought: `Non aver mai paura di essere te stessa, anche quando il mondo intorno sembra non capire subito. Ciò che oggi sembra diverso o incompreso, domani sarà celebrato come pura grazia.`,
  },
  {
    id: 'bruegel_mietitori',
    title: 'I Mietitori (The Harvesters)',
    artist: 'Pieter Bruegel il Vecchio',
    year: '1565',
    medium: 'Olio su tavola di legno (119 × 162 cm)',
    museum: 'Metropolitan Museum of Art, New York',
    image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP130999.jpg',
    fallbackImage: 'https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg',
    story: `Parte di una serie dedicata ai mesi dell'anno commissionata dal mercante Niclaes Jongelinck ad Anversa. Bruegel dipinse il mese di agosto: campi di grano dorato che si estendono a perdita d'occhio verso una baia azzurra dove navigano navi mercantili.\n\nIn primo piano, alcuni contadini si sono fermati all'ombra di un pero per riposare, mangiare pane e latte e schiacciare un sonnellino ristoratore: è un inno alla generosità della terra e alla dignità del riposo umano.`,
    detailToSeek: `Un contadino dorme disteso beatamente sulla schiena contro un covone di grano, con le gambe allungate e la bocca aperta: l'immagine più pura e autentica del riposo meritato dopo la fatica.`,
    comfortThought: `C'è un tempo per seminare, un tempo per mietere e soprattutto un tempo per fermarsi all'ombra, mangiare qualcosa di buono e riposare. Non dimenticare di concederti il tuo riposo.`,
  },
  {
    id: 'rembrandt_aristotele',
    title: 'Aristotele con il Busto di Omero',
    artist: 'Rembrandt van Rijn',
    year: '1653',
    medium: 'Olio su tela (143.5 × 136.5 cm)',
    museum: 'Metropolitan Museum of Art, New York',
    image: 'https://images.metmuseum.org/CRDImages/ep/web-large/DP146452.jpg',
    fallbackImage: 'https://www.artic.edu/iiif/2/47c5bcb8-62ef-e5d7-55e7-f5121f409a30/full/843,/0/default.jpg',
    story: `Commissionato dal nobile siciliano Antonio Ruffo, è uno dei vertici assoluti del chiaroscuro di Rembrandt. Il grande filosofo Aristotele, avvolto in un sontuoso camice bianco dalle ampie maniche e con una catena d'oro al collo con il ritratto del suo allievo Alessandro Magno, poggia la mano destra sulla testa calva del busto di Omero, il poeta cieco.\n\nÈ un dialogo silenzioso tra la saggezza interiore (Omero) e il successo mondano (la catena d'oro): Aristotele sembra meditare su cosa abbia davvero valore nella vita.`,
    detailToSeek: `La manica bianca di lino sembra quasi dipinta con la luce pura: Rembrandt ha steso la biacca con pennellate libere e vibranti che anticipano l'arte moderna di due secoli.`,
    comfortThought: `Le cose più preziose che possediamo non si possono comprare né misurare con medaglie o catene d'oro: sono i pensieri gentili, l'ascolto e la poesia custodita nel cuore.`,
  },
];

/**
 * Gets the painting of the day based on today's calendar date
 */
export function getDailyPainting() {
  const today = new Date();
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
