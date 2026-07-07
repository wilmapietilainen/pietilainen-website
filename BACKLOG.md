# Backlog

Priorisoidut kehityskohteet, arvioitu 4.7.2026. Päivitä tätä listaa kun kohteita valmistuu.

## Valmiit

- [x] Tietoturva: paljastuneet tokenit peruttu, tunnistautuminen Keychainin kautta, ei tokeneita URL:eissa (4.7.2026)
- [x] Tietoturva: repo siirretty pois Downloads-kansiosta omaan kansioonsa, .gitignore lisätty (4.7.2026)
- [x] Näkyvyyspaketti: meta description, Open Graph/Twitter Card -tagit, uusi title, favicon.png ja apple-touch-icon (WP-monogrammi kuparilla), photo.webp (46 kt, oli 1,6 Mt PNG) width/height-attribuuteilla, og-image.jpg jakoesikatseluun, rel="noopener noreferrer" kaikkiin target="_blank"-linkkeihin (4.7.2026)
- [x] Saavutettavuuskierros: scroll-margin-top osioille, lomakkeen virhekäsittely (try/catch, virheviesti, role="alert"/"status"), karusellin aria-live + aria-current + tauko fokuksessa, hoverissa, piilotetussa välilehdessä ja prefers-reduced-motion-tilassa, lang="fi" suomenkielisiin testimonialeihin ja julkaisuotsikoihin, hampurilaisnapille aria-expanded ja aria-controls, skip-to-content-linkki (5.7.2026)
- [x] Sisältö ja viimeistely: toiston poisto ("Responsible use..." jäi vain AI in Practice -ingressiin), Speaking-osion inline-tyylit luokiksi (.section-dark, .speaking-cta, yleistetty .section-ingress), JSON-LD Person -strukturoitu data, footeriin copyright-vuosi (5.7.2026)

## Jäljellä

- [ ] Testimonialeihin attribuutio (rooli/konteksti), sitaatit ovat nyt anonyymejä. Jokaisen sitaatin alle on lisätty kommentoitu `<footer class="testimonial-attribution">` placeholder (index.html, tyyliin "Colleague, national digital health programme"); poista kommentti ja täytä oikea rooli/konteksti kun tiedot on saatu, älä keksi nimiä tai rooleja. Käyttäjä haluaa harkita tätä vielä; tehdään viimeisenä.
- [ ] Harkittavaksi: privacy-first-analytiikka (Plausible/GoatCounter), ei evästebanneria
- [ ] Harkittavaksi: "(in Finnish)"-merkintä suomenkielisiin julkaisulinkkeihin
- [ ] Harkittavaksi: oma domain-sähköposti (esim. wilma@wilmapietilainen.com) nykyisen wilma.pietilainen@hotmail.com -osoitteen sijaan; vaikuttaa index.html:n mailto-linkkeihin, JSON-LD:hen ja Formspree-lomakkeen virheviestiin
