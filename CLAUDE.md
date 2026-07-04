# CLAUDE.md

Ohjeet Claude Codelle tässä repossa.

## Projekti

- Wilma Pietiläisen henkilökohtainen portfoliosivusto: yksi staattinen `index.html` + `photo.png`. Ei build-vaihetta, ei riippuvuuksia, ei frameworkia.
- Julkinen repo `wilmapietilainen/pietilainen-website`. Vercel julkaisee `main`-haaran osoitteessa wilmapietilainen.com. **Push mainiin = julkaisu tuotantoon.**

## Työskentelytavat

- Push-tunnistautuminen: macOS Keychain. Älä koskaan upota tokenia git-URL:iin äläkä pyydä käyttäjää liittämään tokenia chattiin. Jos autentikointi katkeaa, pyydä käyttäjää ajamaan `git push` omassa Terminaalissaan, jolloin tunniste tallentuu Keychainiin.
- Esikatselu: `preview_start` nimellä `website` (`.claude/launch.json`, portti 8082, tarjoilee tämän kansion suoraan).
- Committaa ja pushaa vain käyttäjän pyynnöstä. Jos käyttäjä pyytää diffin ennen tallennusta, näytä se ja odota hyväksyntää.
- Commit-viestit englanniksi: lyhyt imperatiivinen otsikko ja perusteleva runko.
- Tee muutokset täsmällisesti ja rajatusti: älä muuta mitään, mitä ei ole pyydetty.

## Tyylisäännöt (tärkeät)

- **Ei ajatusviivoja (— tai –) missään tekstissä eikä commit-viesteissä.** Korvaa kaksoispisteellä, puolipisteellä tai pilkulla. Ainoa sallittu poikkeus: päivämäärävälit kuten "01/2026 – Present".
- Sivuston kieli on englanti. Osa testimonial-sitaateista ja julkaisuotsikoista on tarkoituksella suomeksi.
- Design: lämmin off-white pohja, kupariaksentit, oklch-värit CSS-muuttujina `:root`-lohkossa, fontit DM Serif Display (otsikot) ja DM Sans (leipäteksti). Kortit teräväkulmaisia, hover-tilat hillittyjä. Uudet elementit johdetaan olemassa olevasta tyylijärjestelmästä.

## Sivun rakenne (index.html)

- Osiot numeroitu 01-08: About, Testimonials, Experience, Core Skills, AI in Practice, Speaking, Featured In, Education. Lisäksi hero, Contact ja footer. Jos osioita lisätään tai poistetaan, numerointi ja ylävalikko päivitetään juoksevaksi.
- Hero: "Converging Currents" canvas-animaatio (uudelleenkäytettävä `runCurrents`-funktio scriptin lopussa), scrim luettavuuden takaamiseksi, porrastettu sisääntulokoreografia (animaatio, teksti, kuva), Ken Burns -efekti kuvassa.
- Core Skills: kuusi korttia 3+3-ruudukossa + täysleveä "Applied & Responsible AI" -ankkurikortti, jonka alareunassa sama aaltoanimaatio ohuena kaistaleena (`lines: 7, converge: false`).
- Testimonials: karuselli, automaattivaihto 11 s, pysähtyy hoveriin.
- Featured In: julkaisut uusin ensin.
- Contact: Formspree-lomake (AJAX).
- Kaikki animaatiot kunnioittavat `prefers-reduced-motion`-asetusta. Scroll-reveal toimii `.reveal`/`.visible`-luokilla ja IntersectionObserverilla.

## Jatkokehitys

Priorisoidut kehityskohteet: katso `BACKLOG.md`.
