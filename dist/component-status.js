/* Product implementations are explicit; everything else remains a catalogue contract/sample. */
const componentImplementations={};
function implemented(names,source,demo){for(const name of names)componentImplementations[name]={status:'Prototipo implementado',source,demo};}
implemented(['HomeDiscovery','CatalogCoverGrid','ReleaseCard','GenreCard','RecommendedArtistGrid'],'catalog-cards.js','listen.html');
implemented(['TrackRow','CompactTrackRow','PlayerControls','PlayerProgress / Volume','PlayerExpanded / Mini','Queue / Repeat / Shuffle','ContextPanel','ArtistContext / ProfileLink'],'listen.js','listen.html');
implemented(['PlaylistLibrary / PlaylistDetail'],'experience.js','listen.html');
implemented(['TextField / Search'],'unified-search.js','listen.html');
implemented(['Dialog / Drawer'],'external-navigation.js','listen.html?section=radar');
implemented(['LibraryNavigation','MobileNavigation / Options','PlayerSidebar','UnifiedBack'],'navigation.js','listen.html');
implemented(['AdvertisingBanner','SectionDisclosure','FeaturedSession','SessionVideoCard'],'listen.js','listen.html');
implemented(['SectionPlayer / VolumePopover'],'section-player.js','listen.html?section=radar');
implemented(['RadarEventCard / RadarMap','RadarFilters / MapPopup','MapPin / LocationList'],'radar.js','listen.html?section=radar');
implemented(['EventDetail / Checkout','EventCard','ContextConcertCard'],'event-page.js','event.html?event=ND-R26-001');
implemented(['TicketType / Quantity','CheckoutSummary / Payment','DigitalTicket / QR'],'checkout.js','checkout.html?event=ND-R26-001');
implemented(['CommunityGate / Chat / Match / Forum'],'community.js','listen.html?section=community');
implemented(['ArtistCard','ArtistIdentity','ArtistBio / Credits','ArtistAlbums / Gallery / Contact','ArtistProfileLayout','IndependentArtistPlayer','InlinePhotoViewer','ArtistStructuralSurface'],'artist.js','artist.html?artist=0');
implemented(['EditorialFeature / EditorialArticle'],'editorial.js','article.html?story=luna-marea');
function implementationFor(name){return componentImplementations[name]||{status:'Contrato / muestra de catálogo',source:null,demo:null};}
