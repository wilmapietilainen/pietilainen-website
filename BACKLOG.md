# Backlog

Priorisoidut kehityskohteet, arvioitu 4.7.2026. Päivitä tätä listaa kun kohteita valmistuu.

## Valmiit

- [x] Tietoturva: paljastuneet tokenit peruttu, tunnistautuminen Keychainin kautta, ei tokeneita URL:eissa (4.7.2026)
- [x] Tietoturva: repo siirretty pois Downloads-kansiosta omaan kansioonsa, .gitignore lisätty (4.7.2026)

## 1. Näkyvyyspaketti (SEO ja jako)

- [ ] Meta description ja Open Graph/Twitter Card -tagit (LinkedIn-jaon esikatselu: otsikko, kuvaus, kuva)
- [ ] Kuvaavampi title, esim. "Wilma Pietiläinen | Digital Health & AI Strategy"
- [ ] Favicon (esim. WP-monogrammi kuparilla) ja apple-touch-icon
- [ ] photo.png (1,6 Mt) muunnos WebP-muotoon, tavoite noin 0,2 Mt; width/height-attribuutit img-tagiin
- [ ] rel="noopener noreferrer" kaikkiin target="_blank"-linkkeihin (11 kpl puuttuu)

## 2. Saavutettavuuskierros

- [ ] scroll-margin-top osioille, ettei kiinteä ylävalikko peitä ankkurikohteita
- [ ] Lomakkeen virhetilanteen käsittely: try/catch, virheviesti, aria-live
- [ ] Karuselli: aria-live, aria-current dotteihin, prefers-reduced-motion pysäyttää automaattivaihdon, pause myös näppäimistöfokuksessa, setInterval tauolle kun välilehti piilossa
- [ ] lang="fi" suomenkielisiin testimonialeihin ja julkaisuotsikoihin
- [ ] Hampurilaisnapille aria-label ja aria-expanded
- [ ] Skip-to-content-linkki

## 3. Sisältö ja viimeistely

- [ ] Testimonialeihin attribuutio (rooli/konteksti), sitaatit ovat nyt anonyymejä
- [ ] Toiston poisto: "Responsible use is the foundation..." esiintyy sekä AI-ankkurikortissa että AI in Practice -ingressissä
- [ ] Speaking-osion inline-tyylit luokiksi (esim. .section-dark)
- [ ] JSON-LD Person -strukturoitu data
- [ ] Footeriin copyright-vuosi
- [ ] Harkittavaksi: privacy-first-analytiikka (Plausible/GoatCounter), ei evästebanneria
- [ ] Harkittavaksi: "(in Finnish)"-merkintä suomenkielisiin julkaisulinkkeihin
