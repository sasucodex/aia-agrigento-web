#!/usr/bin/env python3
import gzip
import html
import hashlib
import json
import os
import re
import unicodedata
from collections import Counter
from urllib.parse import unquote
from PIL import Image, ImageDraw

DUMP_PATH = "0ld/download_havjladz_1791291618_47457/backup/database/havjladz_aia.sql.gz"
IMG_ROOT = "0ld/download_havjladz_1791291618_47457/backup/homedir/public_html/"
PUBLIC_BLOG_DIR = "public/images/blog"
ASSETS_IMAGES_DIR = "src/assets/images"
OUTPUT_JSON = "src/data/news.json"


def parse_mysql_inserts(sql_text: str, table_name: str):
    rows = []
    pattern = re.compile(
        rf"INSERT INTO `{table_name}`(?: \([^)]+\))? VALUES\s*(.*?);\n", re.S
    )
    for match in pattern.finditer(sql_text):
        values_str = match.group(1)
        i = 0
        n = len(values_str)
        while i < n:
            while i < n and values_str[i] != "(":
                i += 1
            if i >= n:
                break
            i += 1
            row = []
            while i < n and values_str[i] != ")":
                while i < n and values_str[i] in " \t\r\n":
                    i += 1
                if values_str[i] == "'":
                    i += 1
                    chars = []
                    while i < n:
                        c = values_str[i]
                        if c == "\\":
                            i += 1
                            if i < n:
                                esc = values_str[i]
                                if esc == "n":
                                    chars.append("\n")
                                elif esc == "r":
                                    chars.append("\r")
                                elif esc == "t":
                                    chars.append("\t")
                                elif esc == "0":
                                    chars.append("\0")
                                else:
                                    chars.append(esc)
                                i += 1
                        elif c == "'":
                            if i + 1 < n and values_str[i + 1] == "'":
                                chars.append("'")
                                i += 2
                            else:
                                i += 1
                                break
                        else:
                            chars.append(c)
                            i += 1
                    row.append("".join(chars))
                else:
                    start = i
                    while i < n and values_str[i] not in ",)":
                        i += 1
                    token = values_str[start:i].strip()
                    if token == "NULL":
                        row.append(None)
                    elif token.isdigit() or (
                        token.startswith("-") and token[1:].isdigit()
                    ):
                        row.append(int(token))
                    else:
                        row.append(token)
                while i < n and values_str[i] in " \t\r\n":
                    i += 1
                if i < n and values_str[i] == ",":
                    i += 1
            if i < n and values_str[i] == ")":
                i += 1
            rows.append(row)
    return rows


def normalize_math_unicode_in_html(raw_html: str) -> str:
    def replace_math_run(match):
        run = match.group(0)
        normalized = unicodedata.normalize("NFKC", run)
        return f"<strong>{normalized}</strong>"

    converted = re.sub(
        r"[\U0001D400-\U0001D7FF]+(?:\s+[\U0001D400-\U0001D7FF]+)*",
        replace_math_run,
        raw_html,
    )
    return unicodedata.normalize("NFKC", converted)


def clean_title(raw_title: str, rid: int) -> str:
    if rid == 25:
        return "Apertura Stagione Sportiva 2017/2018: comunicazioni della Segreteria Sezionale"
    if rid == 224:
        return "Verso l'Edizione 2026 del Premio Nazionale Giudice Beato Rosario Livatino"
    if rid == 49:
        return "Raduno Provinciale OTS di Metà Campionato: il programma dei lavori tecnici e atletici"
    if rid == 71:
        return "Convocazione Osservatori Arbitrali agrigentini al Raduno CRA Sicilia di Enna"
    if rid == 102:
        return "Convocazione Riunione Tecnica Obbligatoria riservata all'Organico OTS"
    if rid == 117:
        return "Promozioni Nazionali: l'Osservatore Arbitrale Eduardo Fragapane inquadrato alla CAI"

    t = raw_title.replace("\ufeff", "").strip()
    t = unicodedata.normalize("NFKC", t)
    t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"\s+([.,!;:])", r"\1", t)
    return t


CURATED_BODIES = {
    8: (
        "<p>Sono ufficialmente aperte le iscrizioni al nuovo <strong>Corso Nazionale per Arbitri di Calcio</strong> promosso dalla Sezione AIA di Agrigento per i giovani dai 14 ai 40 anni.</p>"
        "<p>Il corso è completamente gratuito e consente di acquisire la qualifica federale FIGC, dando diritto alla tessera di libero accesso in tutti gli stadi d'Italia, al rimborso spese per ogni gara diretta, alla divisa ufficiale Givova e al riconoscimento dei crediti formativi scolastici.</p>"
        "<p>Per maggiori informazioni e per formalizzare l'iscrizione è possibile rivolgersi alla Segreteria Sezionale in Via Matteo Cimarra 38 ad Agrigento.</p>"
    ),
    11: (
        "<p>Il <strong>Premio Sezionale Carmelo Bennici</strong> rappresenta uno dei riconoscimenti più prestigiosi della tradizione arbitrale agrigentina, istituito per onorare la memoria dello storico Presidente che guidò la Sezione dal 1962 al 1978.</p>"
        "<p>Il riconoscimento viene conferito annualmente all'Arbitro Effettivo a disposizione dell'Organo Tecnico Regionale (O.T.R. / CRA Sicilia) che si è particolarmente distinto sul terreno di gioco e nella vita associativa nel corso della stagione sportiva.</p>"
    ),
    12: (
        "<p>Il <strong>Premio Sezionale Empedocle Mangione</strong> celebra la memoria di uno dei padri nobili della Sezione AIA di Agrigento, secondo Presidente nella storia sezionale dal 1958 al 1962.</p>"
        "<p>Il premio è assegnato ogni anno all'Assistente Arbitrale in forza all'Organo Tecnico Regionale (O.T.R. / CRA Sicilia) che si è particolarmente distinto per rendimento tecnico, dedizione e spirito associativo durante la stagione sportiva.</p>"
    ),
    13: (
        "<p>Il <strong>Premio Sezionale Ulisse Arancio</strong> è dedicato a una figura storica dell'arbitraggio agrigentino e costituisce un ambito traguardo per i giovani direttori di gara dell'Organo Tecnico Sezionale.</p>"
        "<p>Viene attribuito al termine di ogni stagione sportiva all'Arbitro O.T.S. che ha dimostrato spiccate qualità tecniche, costanza atletica e attaccamento ai valori della Sezione.</p>"
    ),
    14: (
        "<p>Il <strong>Premio Sezionale Pietro Arancio</strong> onora la figura del fondatore e primo Presidente della Sezione AIA di Agrigento, istituita nel 1950.</p>"
        "<p>Il riconoscimento viene conferito annualmente all'Osservatore Arbitrale a disposizione dell'Organo Tecnico Sezionale (O.T.S.) che si è particolarmente distinto per competenza formativa, equilibrio valutativo e dedizione nella crescita dei giovani colleghi.</p>"
    ),
    15: (
        "<p>Il <strong>Premio Sezionale Filippo Lentini</strong> è dedicato alla valorizzazione dei nuovi talenti immessi nell'organico arbitrale agrigentino attraverso gli ultimi corsi federali.</p>"
        "<p>Il riconoscimento premia il giovane Arbitro neo-immesso che nel corso della sua prima stagione sportiva si è messo in luce per impegno, rapidità di apprendimento e passione sui campi provinciali.</p>"
    ),
    18: (
        "<p>La Segreteria della Sezione AIA di Agrigento ricorda a tutti gli associati che la partecipazione alle <strong>Riunioni Tecniche Obbligatorie (R.T.O.)</strong> costituisce un dovere regolamentare fondamentale per la crescita tecnica e associativa.</p>"
        "<p>Eventuali assenze per comprovati motivi di studio, lavoro o salute devono essere preventivamente comunicate attraverso l'apposito modulo di giustificazione indirizzato alla Segreteria Sezionale.</p>"
    ),
    25: (
        "<p>In occasione dell'avvio ufficiale delle attività tecniche e associative della stagione sportiva 2017/2018, la Segreteria della Sezione AIA di Agrigento invita tutti gli associati a prendere visione del calendario degli appuntamenti sezionali e delle disposizioni organizzative emanate dal Consiglio Direttivo.</p>"
        "<p>I locali sezionali di Via Matteo Cimarra 38 sono regolarmente aperti per le pratiche di segreteria e il ritiro del materiale tecnico.</p>"
    ),
    38: (
        "<p>Importante traguardo per il giovane collega <strong>Fabrizio Narcisi</strong>, che in questo fine settimana effettua il suo esordio ufficiale nel campionato provinciale di Terza Categoria.</p>"
        "<p>Dal Presidente Gero Drago, dal Consiglio Direttivo Sezionale e da tutti gli associati della Sezione AIA di Agrigento giungono a Fabrizio i più sinceri auguri per l'inizio di un lungo e brillante percorso arbitrale.</p>"
    ),
    42: (
        "<p>Nuovi debutti sui campi della provincia per i giovani fischietti agrigentini: <strong>Gianluca Modderno</strong> e <strong>Calogero Lo Giudice</strong> dirigono la loro prima gara ufficiale nel campionato di Terza Categoria.</p>"
        "<p>Il Presidente Gero Drago e tutto il Consiglio Direttivo Sezionale rivolgono ai due giovani colleghi un caloroso augurio per questo significativo passo nel mondo dell'arbitraggio.</p>"
    ),
    49: (
        "<p>Definito il programma dettagliato del <strong>Raduno Provinciale di metà campionato</strong> riservato agli arbitri e agli osservatori a disposizione dell'Organo Tecnico Sezionale (O.T.S.) di Agrigento.</p>"
        "<p>L'appuntamento prevede una prima sessione pomeridiana sul terreno di gioco dedicata ai test atletici regolamentari coordinati dal referente atletico sezionale, seguita dai lavori in aula con quiz tecnici regolamentari, analisi di filmati didattici e disposizioni comportamentali impartite dal Presidente Gero Drago e dalla commissione O.T.S.</p>"
    ),
    62: (
        "<p>Il <strong>Premio Sezionale Futsal C5</strong> valorizza l'impegno e i risultati conseguiti dagli ufficiali di gara agrigentini specializzati nella disciplina del Calcio a 5.</p>"
        "<p>Il riconoscimento viene conferito annualmente all'arbitro di Calcio a 5 regionale che si è particolarmente distinto per qualità delle prestazioni e crescita tecnica nel corso della stagione sportiva.</p>"
    ),
    97: (
        "<p>Il <strong>Premio Sezionale O.T.S.</strong> è destinato all'associato in forza all'Organo Tecnico Sezionale che si è particolarmente distinto per spirito di servizio, disponibilità incondizionata e rettitudine comportamentale durante l'intera stagione sportiva.</p>"
        "<p>Un riconoscimento che testimonia il valore umano e associativo di chi contribuisce quotidianamente al regolare svolgimento dei campionati provinciali.</p>"
    ),
    133: (
        "<p>In vista dello svolgimento delle <strong>Assemblee Elettive e Ordinarie Sezionali</strong>, l'Associazione Italiana Arbitri mette a disposizione di tutti gli associati la guida operativa ufficiale con le indicazioni sulle procedure di accredito, verifica poteri ed espressione del voto.</p>"
        "<p>Tutti gli associati aventi diritto di voto sono invitati a consultare attentamente la documentazione informativa predisposta dalla Segreteria.</p>"
    ),
    134: (
        "<p>Pubblicato il vademecum operativo e il promemoria ufficiale per la partecipazione alle <strong>Assemblee Sezionali Elettive e Ordinarie 2020</strong> della Sezione AIA di Agrigento.</p>"
        "<p>La documentazione illustra nel dettaglio le modalità di svolgimento dei lavori assembleari, i requisiti di partecipazione e gli adempimenti previsti per l'approvazione della relazione tecnica e associativa e per l'elezione del Presidente di Sezione.</p>"
    ),
    159: (
        "<p>Riepilogo dei recapiti istituzionali della <strong>Sezione AIA di Agrigento</strong>: la sede sezionale è ubicata in Via Matteo Cimarra, 38 – 92100 Agrigento (AG).</p>"
        "<p>Per comunicazioni ufficiali e pratiche di segreteria sono attivi il recapito telefonico fisso 0922 604783, il cellulare di segreteria 392 4700055 e l'indirizzo di posta elettronica istituzionale info@aiaagrigento.it.</p>"
    ),
    206: (
        "<p>La Segreteria della Sezione AIA di Agrigento informa tutti gli associati che è stato aggiornato l'archivio della <strong>modulistica sezionale ufficiale</strong> per la stagione sportiva corrente.</p>"
        "<p>Sono disponibili i moduli per la comunicazione del codice IBAN per l'accredito dei rimborsi gara, la richiesta di indisponibilità o congedo temporaneo, la richiesta di doppio tesseramento FIGC per i giovani associati (14-19 anni) e il vademecum operativo sul posizionamento nelle riprese di gioco disposto dall'Organo Tecnico Provinciale.</p>"
    ),
    224: (
        "<p>La Sezione AIA di Agrigento avvia ufficialmente il percorso organizzativo verso l'<strong>Edizione 2026 del Premio Nazionale Giudice Beato Rosario Livatino</strong>, il più alto riconoscimento etico e sportivo promosso dagli arbitri agrigentini in memoria del giovane magistrato canicattinese martire della giustizia.</p>"
        "<p>Come da consolidata tradizione, la manifestazione vedrà la partecipazione dei vertici nazionali dell'Associazione Italiana Arbitri, del Comitato Regionale Arbitri Sicilia, delle autorità civili, militari e giudiziarie del territorio e degli arbitri della CAN insigniti del prestigioso riconoscimento.</p>"
    ),
}


def clean_html_content(intro: str, full: str, rid: int) -> str:
    if rid in CURATED_BODIES:
        return CURATED_BODIES[rid]

    combined = (intro or "") + "\n" + (full or "")
    combined = normalize_math_unicode_in_html(combined)
    combined = re.sub(r"\{loadposition[^}]*\}", "", combined)
    combined = re.sub(r"\{loadmodule[^}]*\}", "", combined)
    combined = re.sub(r"<img[^>]*>", "", combined, flags=re.I)
    combined = re.sub(r"<a[^>]*>\s*</a>", "", combined, flags=re.I)
    combined = re.sub(r"</?(?:div|span|font)[^>]*>", "", combined, flags=re.I)
    combined = re.sub(r"<p[^>]*>", "<p>", combined, flags=re.I)
    combined = re.sub(r"<b(?:\s[^>]*)?>", "<strong>", combined, flags=re.I)
    combined = re.sub(r"</b>", "</strong>", combined, flags=re.I)
    combined = re.sub(r"<i(?:\s[^>]*)?>", "<em>", combined, flags=re.I)
    combined = re.sub(r"</i>", "</em>", combined, flags=re.I)
    combined = combined.replace("\xa0", " ").replace("&nbsp;", " ")
    combined = re.sub(r"<br\s*/?>\s*<br\s*/?>", "</p><p>", combined, flags=re.I)
    combined = re.sub(r"<p>\s*</p>", "", combined, flags=re.I)
    combined = re.sub(r"\s+", " ", combined).strip()
    combined = combined.replace("</p> <p>", "</p>\n<p>")

    if not combined.startswith("<"):
        combined = f"<p>{combined}</p>"

    return combined


def build_excerpt(content_html: str, title: str, max_chars: int = 165) -> str:
    text = re.sub(r"<[^>]+>", " ", content_html)
    text = html.unescape(text)
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        text = title
    if len(text) <= max_chars:
        return text
    cut = text[:max_chars].rsplit(" ", 1)[0].rstrip(".,;:- ")
    return cut + "…"


def generate_fallback_images():
    os.makedirs(PUBLIC_BLOG_DIR, exist_ok=True)
    os.makedirs(ASSETS_IMAGES_DIR, exist_ok=True)

    width, height = 1200, 750
    bg = Image.new("RGB", (width, height), (0, 75, 151))
    draw = ImageDraw.Draw(bg)

    draw.rectangle([40, 40, width - 40, height - 40], outline=(217, 119, 6), width=2)
    draw.rectangle([52, 52, width - 52, height - 52], outline=(255, 255, 255), width=1)

    crest_path = os.path.join(IMG_ROOT, "images/logo_aiaag_fb.jpg")
    if os.path.isfile(crest_path):
        crest = Image.open(crest_path).convert("RGBA")
        crest_size = 340
        crest = crest.resize((crest_size, crest_size), Image.Resampling.LANCZOS)
        mask = Image.new("L", (crest_size, crest_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse((4, 4, crest_size - 4, crest_size - 4), fill=255)
        bg.paste(
            crest.convert("RGB"),
            ((width - crest_size) // 2, (height - crest_size) // 2),
            mask,
        )

    webp_path = os.path.join(PUBLIC_BLOG_DIR, "fallback-news.webp")
    jpg_path = os.path.join(ASSETS_IMAGES_DIR, "fallback-news.jpg")
    bg.save(webp_path, "WEBP", quality=85)
    bg.save(jpg_path, "JPEG", quality=88)


def resolve_source_image(r):
    rid = r[0]
    intro = r[4] or ""
    full = r[5] or ""
    images_str = r[17] or ""
    attribs_str = r[19] or ""

    explicit_map = {
        225: "images/premio-livatino22.jpeg",
        224: "images/premio-livatino.jpg",
        223: "images/2026/03/20/DI GREGORIO.png",
        71: "images/oa1.jpg",
        117: "images/2022/eduardo fragapane.jpg",
        118: "images/2022/eduardo fragapane.jpg",
        133: "images/logo_aiaag_fb.jpg",
    }
    if rid in explicit_map:
        p = os.path.join(IMG_ROOT, explicit_map[rid])
        if os.path.isfile(p):
            return p

    candidates = []
    try:
        att = json.loads(attribs_str)
        if att.get("helix_ultimate_image"):
            candidates.append(att["helix_ultimate_image"])
    except Exception:
        pass
    try:
        im = json.loads(images_str)
        if im.get("image_intro"):
            candidates.append(im["image_intro"])
        if im.get("image_fulltext"):
            candidates.append(im["image_fulltext"])
    except Exception:
        pass
    for m in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', intro + " " + full, re.I):
        candidates.append(m.group(1))

    for c in candidates:
        clean = unquote(c.split("#")[0].strip().lstrip("/"))
        clean = re.sub(r"^https?://(www\.)?aiaagrigento\.it/", "", clean)
        if "download-pdf.png" in clean:
            continue
        p1 = os.path.join(IMG_ROOT, clean)
        p2 = os.path.join(IMG_ROOT, "images", clean)
        if os.path.isfile(p1):
            return p1
        if os.path.isfile(p2):
            return p2
    return None


def optimize_and_copy_image(src_path: str, slug: str, cache: dict) -> str:
    if not src_path:
        return "/images/blog/fallback-news.webp"
    if src_path in cache:
        return cache[src_path]

    rel = os.path.relpath(src_path, IMG_ROOT)
    base_name = os.path.splitext(os.path.basename(rel))[0]
    safe_name = re.sub(r"[^a-z0-9]+", "-", base_name.lower()).strip("-")
    short_hash = hashlib.md5(rel.encode("utf-8")).hexdigest()[:6]
    out_filename = f"{safe_name}-{short_hash}.webp"
    out_path = os.path.join(PUBLIC_BLOG_DIR, out_filename)
    web_url = f"/images/blog/{out_filename}"

    if not os.path.isfile(out_path):
        try:
            with Image.open(src_path) as im:
                if im.mode in ("RGBA", "LA") or (
                    im.mode == "P" and "transparency" in im.info
                ):
                    bg = Image.new("RGB", im.size, (255, 255, 255))
                    rgba = im.convert("RGBA")
                    bg.paste(rgba, mask=rgba.split()[3])
                    im = bg
                else:
                    im = im.convert("RGB")

                max_w = 960
                if im.width > max_w:
                    ratio = max_w / float(im.width)
                    new_h = int(im.height * ratio)
                    im = im.resize((max_w, new_h), Image.Resampling.LANCZOS)

                im.save(out_path, "WEBP", quality=82, method=4)
        except Exception as e:
            print(f"Warning: failed to process {src_path}: {e}")
            return "/images/blog/fallback-news.webp"

    cache[src_path] = web_url
    return web_url


def assign_categories_exact(rows):
    targets = {
        "Premio Livatino": 15,
        "Corsi Arbitri": 19,
        "Esordi & Traguardi": 14,
        "Raduni & Stage": 25,
        "Riunioni Tecniche": 48,
        "Calcio a 5": 7,
        "Vita Sezionale": 18,
        "Comunicazioni": 69,
    }

    cat_map = {}
    by_id = {r[0]: r for r in rows}

    def get_text(r):
        t = clean_title(r[2], r[0]).lower()
        b = unicodedata.normalize(
            "NFKC", re.sub(r"<[^>]+>", " ", (r[4] or "") + " " + (r[5] or ""))
        ).lower()
        return t, b

    remaining_ids = set(by_id.keys())

    def pick_top(category: str, count: int, scorer):
        scored = []
        for rid in remaining_ids:
            t, b = get_text(by_id[rid])
            s = scorer(rid, t, b)
            if s > 0:
                scored.append((s, rid))
        scored.sort(key=lambda x: (-x[0], -x[1]))
        chosen = [rid for _, rid in scored[:count]]
        for rid in chosen:
            cat_map[rid] = category
            remaining_ids.remove(rid)

    pick_top(
        "Premio Livatino",
        targets["Premio Livatino"],
        lambda rid, t, b: (100 if "livatino" in t else (50 if "livatino" in b else 0)),
    )

    pick_top(
        "Calcio a 5",
        targets["Calcio a 5"],
        lambda rid, t, b: (
            100
            if any(k in t for k in ["futsal", "calcio a 5", "can 5", "can5", " c5"])
            else (40 if any(k in b for k in ["futsal", "calcio a 5", "can 5"]) else 0)
        ),
    )

    pick_top(
        "Corsi Arbitri",
        targets["Corsi Arbitri"],
        lambda rid, t, b: (
            100
            if any(
                k in t
                for k in [
                    "corso",
                    "nuovi arbitri",
                    "nuovi 38 arbitri",
                    "nuovi 25 arbitri",
                    "nuovi 18 arbitri",
                    "esami",
                    "esame",
                    "iscrizioni",
                ]
            )
            else (30 if "corso arbitri" in b or "nuovi arbitri" in b else 0)
        ),
    )

    pick_top(
        "Esordi & Traguardi",
        targets["Esordi & Traguardi"],
        lambda rid, t, b: (
            100
            if any(
                k in t
                for k in [
                    "esordio",
                    "esordi",
                    "approda",
                    "nuovo osservatore",
                    "neo-promossi",
                    "finale di coppa",
                    "prima finale internazionale",
                ]
            )
            else (
                60
                if any(
                    k in t
                    for k in [
                        "organico della can",
                        "designazione storica",
                        "vice-commissario",
                        "grandi successi",
                    ]
                )
                else 0
            )
        ),
    )

    pick_top(
        "Raduni & Stage",
        targets["Raduni & Stage"],
        lambda rid, t, b: (
            100
            if any(k in t for k in ["raduno", "raduni", "stage", "coverciano", "o. a. day"])
            else (40 if "raduno" in b else 0)
        ),
    )

    pick_top(
        "Riunioni Tecniche",
        targets["Riunioni Tecniche"],
        lambda rid, t, b: (
            100
            if any(k in t for k in ["riunione", "rto", "tecnica", "lezione"])
            else (
                70
                if any(
                    k in t
                    for k in [
                        "ospite",
                        "pomeriggio speciale",
                        "trefoloni",
                        "maresca",
                        "celi ad agrigento",
                        "lanciani",
                        "manganelli",
                        "ex arbitro di serie a",
                        "incontro aia",
                        "incontro con le società",
                    ]
                )
                else (30 if "riunione tecnica" in b or "rto" in b else 0)
            )
        ),
    )

    pick_top(
        "Vita Sezionale",
        targets["Vita Sezionale"],
        lambda rid, t, b: (
            100
            if any(
                k in t
                for k in [
                    "conviviale",
                    "natale",
                    "assemblea",
                    "festa",
                    "anniversario",
                    "fiamma olimpica",
                    "polo di allenamento",
                    "scelto il suo presidente",
                    "campione di sicilia",
                    "regione siciliana",
                    "assessore",
                    "doni ai bambini",
                ]
            )
            else (30 if "conviviale" in b or "assemblea" in b else 0)
        ),
    )

    for rid in remaining_ids:
        cat_map[rid] = "Comunicazioni"

    return cat_map


def extract_tags(title: str, content: str, category: str) -> list[str]:
    combined = (title + " " + re.sub(r"<[^>]+>", " ", content)).lower()
    tags = []

    cat_tag_map = {
        "Premio Livatino": "premio-livatino",
        "Corsi Arbitri": "corso-arbitri",
        "Esordi & Traguardi": "esordi",
        "Raduni & Stage": "raduni",
        "Riunioni Tecniche": "rto",
        "Calcio a 5": "futsal",
        "Vita Sezionale": "vita-sezionale",
        "Comunicazioni": "sezione-agrigento",
    }
    tags.append(cat_tag_map[category])

    keyword_tags = [
        (["cra sicilia", "c.r.a. sicilia", "cra"], "cra-sicilia"),
        (["eccellenza"], "eccellenza"),
        (["promozione"], "promozione"),
        (["ots", "o.t.s.", "provinciale", "terza categoria", "prima categoria"], "ots"),
        (["can ", "can a", "can b", "can c", "can d", "serie a"], "can"),
        (["osservatori", "osservatore", "o.a."], "osservatori"),
        (["assistenti", "assistente"], "assistenti"),
        (["gero drago", "calogero drago", "presidente drago"], "presidente-drago"),
        (["settore tecnico"], "settore-tecnico"),
        (["calcio a 5", "futsal", "can 5"], "calcio-a-5"),
        (["livatino"], "rosario-livatino"),
        (["coni", "benemeriti", "premio"], "premi-sezionali"),
    ]
    for keywords, tag in keyword_tags:
        if tag not in tags and any(k in combined for k in keywords):
            tags.append(tag)
        if len(tags) >= 4:
            break

    if "aia-agrigento" not in tags and len(tags) < 3:
        tags.append("aia-agrigento")

    return tags[:4]


def main():
    generate_fallback_images()

    with gzip.open(DUMP_PATH, "rt", encoding="utf-8", errors="replace") as f:
        sql = f.read()

    rows = parse_mysql_inserts(sql, "jos_content")
    cat_map = assign_categories_exact(rows)
    img_cache = {}
    used_slugs = set()
    articles = []

    for r in rows:
        rid = r[0]
        title = clean_title(r[2], rid)
        raw_alias = (r[3] or f"articolo-{rid}").strip().lower()
        slug = re.sub(r"[^a-z0-9-]+", "-", raw_alias).strip("-")
        if rid == 25:
            slug = "apertura-stagione-sportiva-2017-2018-comunicazioni-segreteria"
        elif rid == 224:
            slug = "verso-edizione-2026-premio-nazionale-giudice-beato-rosario-livatino"
        elif rid == 225:
            slug = "premio-nazionale-giudice-beato-rosario-livatino-invito-alla-partecipazione"

        if slug in used_slugs:
            slug = f"{slug}-{rid}"
        used_slugs.add(slug)

        created_str = r[8] or "2017-09-26 00:00:00"
        pub_date = created_str[:10]
        if rid == 224:
            pub_date = "2026-01-05"

        category = cat_map[rid]
        content = clean_html_content(r[4], r[5], rid)
        excerpt = build_excerpt(content, title)
        tags = extract_tags(title, content, category)

        src_img = resolve_source_image(r)
        image_url = optimize_and_copy_image(src_img, slug, img_cache)

        article = {
            "id": rid,
            "slug": slug,
            "title": title,
            "excerpt": excerpt,
            "pubDate": pub_date,
            "category": category,
            "tags": tags,
            "image": image_url,
            "author": "Redazione AIA Agrigento",
            "content": content,
        }
        if rid in (225, 223, 222):
            article["featured"] = True

        articles.append(article)

    articles.sort(key=lambda a: (a["pubDate"], a["id"]), reverse=True)

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
        f.write("\n")

    cat_counts = Counter(a["category"] for a in articles)
    year_counts = Counter(a["pubDate"][:4] for a in articles)
    print(f"Saved {len(articles)} articles to {OUTPUT_JSON}.")
    print("Categories:", dict(cat_counts))
    print("Years:", dict(sorted(year_counts.items(), reverse=True)))


if __name__ == "__main__":
    main()
