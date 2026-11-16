'use strict';
const tracks=[
 {title:'Entre luces',artist:'Luna Marea',kind:'track',genre:'electronic',label:'Canción · Electrónica',mood:'Nocturno',duration:180,image:'assets/artist-portrait-v02.png',description:'Texturas electrónicas y un pulso que se queda contigo cuando termina la noche.'},
 {title:'Pulso de la ciudad',artist:'Cimarrón Sonoro',kind:'session',genre:'pacific',label:'Session · Fusión Pacífico',mood:'Raíz y futuro',duration:224,image:'assets/live-session-v02.png',description:'Marimba, cuerdas y percusión se encuentran en una sesión íntima. Un diálogo entre tradición y nuevas búsquedas.'},
 {title:'Otra forma de estar',artist:'Kora',kind:'track',genre:'experimental',label:'Canción · Experimental',mood:'Exploración',duration:196,image:'assets/artist-portrait-v02.png',description:'Un paisaje de capas y pequeños detalles para bajar la velocidad y escuchar de otra manera.'}
];
const genreNames={electronic:'Electrónica',pacific:'Fusión Pacífico',indie:'Indie',hiphop:'Hip hop',tropical:'Tropical',experimental:'Experimental',rock:'Rock',pop:'Pop',metal:'Metal',jazz:'Jazz',soul:'Soul',salsa:'Salsa'};
tracks.push(
 {title:'Cerca del ruido',artist:'Vértice',kind:'track',genre:'indie',label:'Canción · Indie',mood:'Alternativo',duration:202,image:'assets/artist-portrait-v02.png',description:'Guitarras y una voz cercana en una canción de la escena independiente.'},
 {title:'Versos de esquina',artist:'La Resistencia',kind:'track',genre:'hiphop',label:'Canción · Hip hop',mood:'Urbano',duration:187,image:'assets/artist-portrait-v02.png',description:'Rimas y ritmos de una ciudad que siempre tiene algo que contar.'},
 {title:'A la vuelta del río',artist:'Pacífico Expande',kind:'session',genre:'tropical',label:'Session · Tropical',mood:'Encuentro',duration:218,image:'assets/live-session-v02.png',description:'Percusión y melodía para compartir el movimiento.'}
);

const artistBiographies={
 'Luna Marea':'Luna Marea explora la electrónica desde Cali: voces íntimas, sintetizadores cálidos y ritmos que conectan la noche con las raíces del Pacífico.',
 'Cimarrón Sonoro':'Marimba, cuerdas y percusión se cruzan con la producción electrónica. Cimarrón Sonoro lleva la energía del encuentro a canciones que nacen para tocarse en vivo.',
 'Kora':'Kora construye paisajes sonoros entre lo orgánico y lo digital. Sus sets recorren pulsos lentos, texturas industriales y espacios para la improvisación.',
 'Vértice':'Vértice reúne guitarras, bajo y batería alrededor de historias cotidianas. El proyecto busca un sonido directo: melodías cercanas y la intensidad de tocar juntos.',
 'La Resistencia':'Palabra, ritmo y ciudad. La Resistencia convierte las conversaciones de la calle en versos y bases que dialogan con el hip hop y la percusión local.',
 'Pacífico Expande':'Un ensamble de voces, cuerdas y percusión que explora nuevas formas de tocar juntos. Sus arreglos dejan espacio para la improvisación y el diálogo con el público.'
};
function artistBio(t){return artistBiographies[t.artist]||t.description;}


const concertSamples=[
 {day:'19',weekday:'Jue',month:'Nov',date:'2026-11-19',kind:'Encuentro',free:true,title:'Producer Meet',place:'Estudio Faro',time:'18:30',image:'assets/artist-portrait-v02.png',description:'Un encuentro para compartir procesos de producción, ideas y nuevas colaboraciones.'},
 {day:'22',weekday:'Dom',month:'Nov',date:'2026-11-22',kind:'Encuentro',free:true,title:'Open Studio',place:'Sonido Norte',time:'15:00',image:'assets/live-session-v02.png',description:'Una tarde de estudio abierto, conversación y exploración musical.'},
 {day:'28',weekday:'Sáb',month:'Nov',date:'2026-11-28',kind:'DJ set',free:false,title:'NOODO Night',place:'Club Sata',time:'22:00',image:'assets/artist-portrait-v02.png',description:'Una noche de selección electrónica y encuentros alrededor de la pista.'},
 {day:'29',weekday:'Dom',month:'Nov',date:'2026-11-29',kind:'Live',free:false,title:'Pacífico Expande',place:'Teatro La Máscara',time:'20:00',image:'assets/live-session-v02.png',description:'Raíces del Pacífico, voces y nuevas búsquedas en un mismo escenario.'}
];

// Five-song artist selection. Every title is an illustrative silent demo.
tracks[0].profileIndex=0;
tracks.push(...[
 ['Cruzar la noche',206,'Una línea de sintetizadores que acompaña el regreso a casa.'],
 ['Aire violeta',192,'Capas de voz y percusión en un paisaje de electrónica cálida.'],
 ['De regreso al río',231,'Un encuentro entre ritmos del Pacífico y texturas contemporáneas.'],
 ['Raíz eléctrica',215,'El pulso de Cali convertido en una canción.']
].map(([title,duration,description])=>({title,duration,description,artist:'Luna Marea',profileIndex:0,kind:'track',genre:'electronic',label:'Canción · Electrónica',mood:'Nocturno',image:'assets/artist-portrait-v02.png'})));
const artistProfileIndex=i=>tracks[i]?.profileIndex??i;

// Complete the sample catalog for every artist profile, keeping existing indices stable.
const artistDemoTitles={
 1:['Patio abierto','El pulso vuelve','Una voz, muchas raíces','La última ronda'],
 2:['Lado B del aire','Pequeñas órbitas','Todo cambia de lugar','Todavía aquí'],
 3:['Calles de regreso','Ruido de fondo','Antes del amanecer','Donde empieza el eco'],
 4:['Otra esquina','Mapa de voces','De barrio en barrio','La ciudad responde'],
 5:['Bajo la misma luna','Agua que baila','Vuelta al sol','A ritmo de río']
};
for(const [profile,titles] of Object.entries(artistDemoTitles)){
 const profileIndex=Number(profile),source=tracks[profileIndex];
 tracks[profileIndex].profileIndex=profileIndex;
 titles.forEach((title,n)=>tracks.push({...source,profileIndex,title,kind:'track',label:'Canción · '+genreNames[source.genre],duration:[198,217,184,239][n],description:'Una canción de '+source.artist+' para explorar su repertorio en NOODO.'}));
}

const artistKinds={0:'Artista',1:'Banda',2:'DJ · Productora',3:'Banda',4:'Banda',5:'Banda'};
const profileKind=i=>artistKinds[artistProfileIndex(i)]||'Artista';

for(const [i,title] of [[1,'El patio canta'],[5,'Marea tropical']])tracks.push({...tracks[i],profileIndex:i,title,kind:'track',label:'Canción · '+genreNames[tracks[i].genre],duration:204});

// Original fictional catalog for local design review; asset provenance is recorded outside the UI.
const newArtistCatalog=[{"name": "Bruma Roja", "slug": "bruma-roja", "genre": "rock", "bio": "Cuatro amigos, amplificadores encendidos y canciones que nacen de caminar Cali. Bruma Roja cruza guitarras ásperas con melodías para cantar juntos.", "titles": ["Arder despacio", "Una calle más", "Todo lo que queda", "Piedra y sol", "Volver a empezar"], "lyrics": ["La ciudad se queda sin reloj,", "yo dibujo puertas en la pared.", "Tu guitarra corta el apagón,", "hay un camino que no se ve.", "Vamos a arder despacio,", "sin pedirle permiso al sol.", "Que nos encuentre el día", "con el pecho lleno de voz.", "Cae la lluvia sobre el metal,", "cada gota nos vuelve a encender.", "Si la noche insiste en callar,", "esta canción nos pone de pie."]}, {"name": "Órbita Sur", "slug": "orbita-sur", "genre": "electronic", "bio": "Un dúo de sintetizadores, voces procesadas y percusión electrónica. Órbita Sur transforma sonidos cotidianos en canciones que se mueven entre la pista y la intimidad.", "titles": ["Señal de regreso", "Cuerpo celeste", "Satélites", "La última frecuencia", "Gravedad"], "lyrics": ["Una señal cruza la habitación,", "marca tu nombre sobre el cristal.", "Sigo la luz de tu respiración,", "nadie nos dice dónde aterrizar.", "Gira conmigo, órbita sur,", "que esta distancia se vuelve luz.", "Todo el silencio cambia de color,", "cuando tu pulso encuentra mi voz.", "Vuelve la noche a sincronizar,", "los dos planetas del mismo lugar.", "Bajo este cielo de electricidad,", "somos la frecuencia que vuelve a empezar."]}, {"name": "Abril Neón", "slug": "abril-neon", "genre": "pop", "bio": "Pop luminoso desde las terrazas de Cali. Dos voces y un teclado encuentran estribillos en las pequeñas historias: los mensajes a medianoche, el verano y las ganas de quedarse.", "titles": ["Domingo contigo", "Fotos sin borrar", "Azotea", "Algo bonito", "Hasta mañana"], "lyrics": ["Dejaste flores en mi bicicleta,", "yo puse música para los dos.", "La tarde cabe dentro de una vuelta,", "y la ciudad se aprende nuestra voz.", "Domingo contigo, no quiero correr,", "que dure este rato, que empiece otra vez.", "Si el mundo nos llama, lo hacemos esperar,", "hoy todas las calles terminan acá.", "Guardé tu risa dentro de un bolsillo,", "para encontrarla cuando falte el sol.", "Volvemos lento por el mismo sitio,", "hay mil domingos en esta canción."]}, {"name": "Hierro Vivo", "slug": "hierro-vivo", "genre": "metal", "bio": "Riffs densos, batería precisa y una voz que se niega a bajar el volumen. Hierro Vivo reúne cuatro músicos de la escena caleña alrededor del metal y la energía del escenario.", "titles": ["Bajo el concreto", "Sin retroceder", "Pulso de acero", "La grieta", "Seguimos aquí"], "lyrics": ["Bajo el concreto respira una raíz,", "rompe la piedra, se niega a dormir.", "No queda miedo que pueda apagar,", "toda la fuerza que aprende a brotar.", "Hierro vivo, vuelve a latir,", "somos el ruido que sigue aquí.", "Cada caída nos hizo crecer,", "nadie decide cuándo ceder.", "Sobre las ruinas levantamos la voz,", "somos ceniza buscando calor.", "Abre la grieta, deja entrar el sol,", "hasta la piedra conoce el temblor."]}, {"name": "Río Lento", "slug": "rio-lento", "genre": "soul", "genres": ["soul", "jazz"], "bio": "Voz, saxofón y contrabajo en una conversación sin prisa. Río Lento mezcla soul y jazz con la calidez de una noche junto al río, dejando espacio para improvisar.", "titles": ["Donde baja el agua", "La pausa", "A media luz", "Orillas", "Un poco más"], "lyrics": ["Donde baja el agua dejo mi canción,", "para que la lleve cerca de tu voz.", "Nada tiene prisa cuando estás aquí,", "hasta las estrellas quieren repetir.", "Río lento, llévame,", "por la curva de tu piel.", "Que la noche aprenda a ser,", "una casa para volver.", "Suena un saxo lejos, huele a lluvia y pan,", "somos dos orillas que se encontrarán.", "Cuando calle el mundo, déjame escuchar,", "ese pulso suave que nos trae acá."]}];
const originalLyrics={};const newArtistIndices=[];
for(const artist of newArtistCatalog){const profileIndex=tracks.length;newArtistIndices.push(profileIndex);artistKinds[profileIndex]='Banda';artistBiographies[artist.name]=artist.bio;artist.titles.forEach((title,n)=>tracks.push({title,artist:artist.name,profileIndex,kind:'track',genre:artist.genre,genres:artist.genres||[artist.genre],label:'Canción · '+genreNames[artist.genre],mood:'En vivo',duration:[204,193,221,207,184][n],image:'assets/'+artist.slug+'-v16.png',description:artist.bio}));originalLyrics[profileIndex]=artist.lyrics;}
const recommendedArtists=[...newArtistIndices,1,3,5];
