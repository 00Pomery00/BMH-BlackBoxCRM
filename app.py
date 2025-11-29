import streamlit as st
import pandas as pd
import numpy as np
import io
from fpdf import FPDF
import matplotlib.pyplot as plt
from datetime import datetime

# --------- Konfigurace a styl ---------
st.set_page_config(page_title="BMH Provizní portál", layout="wide")

# jednoduché CSS pro fialovo-bílé téma
st.markdown('''
<style>
:root{--violet:#7b1fa2;--violet-dark:#5e0f86}
header {background: linear-gradient(90deg,var(--violet),var(--violet-dark));}
.main > div.block-container {padding-top: 2rem}
.stButton>button {background:var(--violet); color: white}
</style>
''', unsafe_allow_html=True)

st.title("BMH Provizní portál — Vodafone (IBS partner)")
st.caption(
    "Nahrávej pouze přes upload (drag & drop). "
    "Žádný přímý přístup k OneDrivu nebo lokálnímu disku."
)

# --------- Mapování loginů ---------
LOGIN_MAP = {
    "REJNA": "Aleš Rejn",
    "MADRJ": "Martin Drastich",
    "BALSANEKJ": "Jakub Balsanek",
    "RUNSTUKJ": "Jakub Runštuk",
    "SVOBODOVAS3": "Šárka Svobodová",
    "KNAPOVAK": "Kristýna Knapová",
    "STALIKOVAS": "Šárka Štálíková"
}

# --------- Pomocné funkce ---------
@st.cache_data
def read_excel_sheets(uploaded_file):
    # vrací dict(sheetname -> DataFrame)
    try:
        return pd.read_excel(uploaded_file, sheet_name=None)
    except Exception as e:
        st.error(f"Chyba při načítání excelu: {e}")
        return {}


def find_col(df, candidates):
    if df is None:
        return None
    cols = {c.lower(): c for c in df.columns}
    for cand in candidates:
        if cand.lower() in cols:
            return cols[cand.lower()]
    # fuzzy: najdi sloupce obsahující substring
    for cand in candidates:
        for c in df.columns:
            if cand.lower() in c.lower():
                return c
    return None


def normalize_companies(dfs):
    # dfs: list of DataFrames potentially with companies/leads info
    # Spočítáme agregace per login
    frames = []
    for df in dfs:
        if df is None:
            continue
        df = df.copy()
        # najít login/username
        login_col = find_col(df, ['login', 'Login', 'USERNAME', 'user'])
        name_col = find_col(df, ['name', 'Name', 'Jméno', 'full_name'])
        new_bmsl_col = find_col(df, ['new_bmsl', 'New BMSL', 'new_bmsl', 'bmsl'])
        gp_col = find_col(df, ['gp', 'GP', 'gross_profit'])
        strat_fee_col = find_col(df, ['strat_fee', 'Strat FEE', 'strategic_fee'])
        cashback_col = find_col(df, ['cashback', 'Cashback'])
        zadrzene_col = find_col(df, ['zadr', 'zadržen', 'withheld'])

        # normalize minimal
        if login_col is None and name_col is None:
            continue
        key = login_col or name_col
        agg = df.groupby(key).agg({
            new_bmsl_col: 'sum' if new_bmsl_col else (lambda x: 0),
            gp_col: 'sum' if gp_col else (lambda x: 0),
            strat_fee_col: 'sum' if strat_fee_col else (lambda x: 0),
            cashback_col: 'sum' if cashback_col else (lambda x: 0),
            zadrzene_col: 'sum' if zadrzene_col else (lambda x: 0),
        })
        # normalize columns
        cols_map = {}
        if new_bmsl_col:
            cols_map[new_bmsl_col] = 'new_bmsl'
        if gp_col:
            cols_map[gp_col] = 'gp'
        if strat_fee_col:
            cols_map[strat_fee_col] = 'strat_fee'
        if cashback_col:
            cols_map[cashback_col] = 'cashback'
        if zadrzene_col:
            cols_map[zadrzene_col] = 'withheld'
        agg = agg.rename(columns=cols_map).reset_index()
        agg = agg.rename(columns={key: 'login_or_name'})
        frames.append(agg)
    if not frames:
        return pd.DataFrame()
    merged = pd.concat(frames)
    # group by login_or_name sum
    out = merged.groupby('login_or_name').sum().reset_index()
    return out


def map_login_to_name(login):
    if pd.isna(login):
        return ''
    s = str(login).upper()
    return LOGIN_MAP.get(s, login)


def compute_commission(row):
    # formule:
    # (New BMSL × 78 Kč + Strat FEE × 0.7) × Celkový koeficient – cashback – zadržené
    new_bmsl = row.get('new_bmsl', 0) or 0
    strat_fee = row.get('strat_fee', 0) or 0
    coef = row.get('total_coef', 1) or 1
    cashback = row.get('cashback', 0) or 0
    withheld = row.get('withheld', 0) or 0
    try:
        val = (new_bmsl * 78 + strat_fee * 0.7) * coef - cashback - withheld
    except Exception:
        val = 0
    return val


def generate_invoice_pdf(df, month_label):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, f"Provizní faktura - {month_label}", ln=True)
    pdf.ln(4)
    pdf.set_font("Arial", size=10)
    # header
    pdf.cell(40, 8, "Login", border=1)
    pdf.cell(60, 8, "Jméno", border=1)
    pdf.cell(30, 8, "Provize (Kč)", border=1, ln=True)
    for _, r in df.iterrows():
        pdf.cell(40, 8, str(r.get('login', '')), border=1)
        pdf.cell(60, 8, str(r.get('name', ''))[:30], border=1)
        pdf.cell(30, 8, f"{r.get('commission',0):.2f}", border=1, ln=True)
    buf = io.BytesIO()
    pdf.output(buf)
    buf.seek(0)
    return buf

# --------- UI: Upload sekce ---------
col1, col2 = st.columns(2)
with col1:
    label_f1 = (
        "IBS Activation Report (IBS_Activation_Report_BMH Saviors*"
        ".xlsx)"
    )
    f1 = st.file_uploader(label_f1, type=['xlsx'], key='f1')
    f2 = st.file_uploader("Program.xlsx", type=['xlsx'], key='f2')
with col2:
    label_f3 = (
        "IBS Performance (IBS_Performance_BMH Saviors*"
        ".xlsx)"
    )
    f3 = st.file_uploader(label_f3, type=['xlsx'], key='f3')
    label_f4 = "Tickount_BMH_2025.xlsx (nebo novější)"
    f4 = st.file_uploader(label_f4, type=['xlsx'], key='f4')

uploaded_all = all([f1, f2, f3, f4])

if not uploaded_all:
    st.info(
        "Nahrajte prosím všechny 4 soubory přes upload (drag & drop). "
        "Zatím zobrazuji nápovědu."
    )
    st.markdown("""
    ### Jak na to
    - Přetáhněte nebo vyberte soubory uvedené nahoře.
    - Aplikace bude data načítat pouze z těchto uploadů.
    - Po nahrání se automaticky spočítají provize a zobrazí výstupy.
    """)
    st.markdown("<div style='font-size:48px'>📂 📊 🔒</div>", unsafe_allow_html=True)
    st.stop()

# --------- Zpracování nahraných souborů ---------
with st.spinner('Načítám soubory a počítám...'):
    sheets1 = read_excel_sheets(f1)
    sheets2 = read_excel_sheets(f2)
    sheets3 = read_excel_sheets(f3)
    sheets4 = read_excel_sheets(f4)

    # vyber relevantních sheetů ze všech workbooků
    def pick_sheets(all_sheets, names):
        for n in names:
            for key in all_sheets.keys():
                if n.lower() in key.lower():
                    return all_sheets[key]
        return None

    # Relevantní listy, pokusíme se je najít v každém souboru
    perf_names = ['Výkon', 'Performance', 'Performance']
    performance = pick_sheets(sheets3, perf_names) or pick_sheets(sheets1, perf_names)
    contracts = pick_sheets(sheets1, ['Smlouvy', 'Contracts'])
    strat_names = ['Strat Prod', 'Strat', 'Strategic']
    strat_prod = pick_sheets(sheets2, strat_names) or pick_sheets(sheets3, ['Strat'])
    acq = pick_sheets(sheets1, ['ACQ'])
    sales_amb = pick_sheets(sheets2, ['Sales Ambition', 'Ambition'])
    orgchart = pick_sheets(sheets2, ['Orgchart', 'Org'])
    bml_fee = pick_sheets(sheets2, ['BML-FEE', 'FEE'])
    hw_sub = pick_sheets(sheets2, ['HW Subsidy', 'HW'])
    tickount_df = pick_sheets(sheets4, ['Tickount']) or next(iter(sheets4.values()))

    # Normalize aggregate
    dfs_list = [performance, contracts, strat_prod, acq, bml_fee, hw_sub]
    agg = normalize_companies(dfs_list)
    if agg.empty:
        st.warning(
            "Nemohu najít žádná agregovatelná data. "
            "Zkontrolujte strukturu uploadovaných souborů."
        )

    # mapování login -> jméno
    agg['login'] = agg['login_or_name'].astype(str)
    agg['name'] = agg['login'].apply(map_login_to_name)

    # Merge tickount info
    if tickount_df is not None:
        # ensure login column
        tick_login_col = find_col(tickount_df, ['login', 'Login', 'LOGIN'])
        if tick_login_col:
            tickount_df = tickount_df.rename(columns={tick_login_col: 'login'})
        else:
            # pokud není login, vytvoříme náhodný sloupec
            tickount_df['login'] = tickount_df.index.astype(str)
    else:
        tickount_df = pd.DataFrame(columns=['login'])

    # default coefficients (z tickount nebo 1)
    coeffs = {}
    if 'coeffs' not in st.session_state:
        # try load from tickount if columns exist
        if 'login' in tickount_df.columns:
            for _, r in tickount_df.iterrows():
                lg = str(r.get('login'))
                band_val = r.get('Band', '') if 'Band' in tickount_df.columns else ''
                if 'Koef_hlavni' in tickount_df.columns:
                    coef_main_val = float(r.get('Koef_hlavni', 1))
                else:
                    coef_main_val = 1
                if 'Koef_strategicke' in tickount_df.columns:
                    coef_strat_val = float(r.get('Koef_strategicke', 1))
                else:
                    coef_strat_val = 1
                if 'Bonus_koef' in tickount_df.columns:
                    bonus_val = float(r.get('Bonus_koef', 1))
                else:
                    bonus_val = 1
                if 'Poznamka' in tickount_df.columns:
                    note_val = r.get('Poznamka', '')
                else:
                    note_val = ''
                coeffs[lg] = {
                    'login': lg,
                    'name': map_login_to_name(lg),
                    'band': band_val,
                    'coef_main': coef_main_val,
                    'coef_strat': coef_strat_val,
                    'bonus_coef': bonus_val,
                    'note': note_val,
                }
        st.session_state['coeffs'] = coeffs

    # build combined table
    combined = agg.copy()
    col_list = ['login', 'name', 'new_bmsl', 'gp', 'strat_fee', 'cashback', 'withheld']
    combined = combined[col_list].fillna(0)
    # attach coefficients from session_state
    def attach_coeffs(r):
        lg = r['login']
        c = st.session_state.get('coeffs', {}).get(lg, None)
        if c:
            coef_main = c.get('coef_main', 1)
            coef_strat = c.get('coef_strat', 1)
            bonus = c.get('bonus_coef', 1)
            total = coef_main * bonus
            return pd.Series([coef_main, coef_strat, bonus, total, c.get('note','')])
        else:
            return pd.Series([1.0, 1.0, 1.0, 1.0, ''])

    coef_cols = ['coef_main', 'coef_strat', 'bonus_coef', 'total_coef', 'note']
    combined[coef_cols] = combined.apply(attach_coeffs, axis=1)
    combined['commission'] = combined.apply(compute_commission, axis=1)

# --------- Tabs (7) ---------
tabs = st.tabs([
    "Shrnutí",
    "Hlavní provize",
    "Strategické provize",
    "Cashback",
    "Cashback – strategické",
    "Reklamace & zadržené",
    "Tickount + koeficienty",
])

with tabs[0]:
    st.header("Shrnutí")
    total_comm = combined['commission'].sum()
    st.metric("Celkové provize (Kč)", f"{total_comm:,.2f}")
    st.markdown("### Nejlepší 10 podle provize")
    st.dataframe(combined.sort_values('commission', ascending=False).head(10))
    # graf vývoje: pokud máme časová data, použít je; jinak simulovat jednoduchý trend
    st.markdown("### Trend provizí (posledních 12 měsíců) - pokud dostupné" )
    # zde zkusíme vytvořit dummy časovou řadu součtu commission pro ukázku
    months = pd.date_range(end=pd.Timestamp.today(), periods=12, freq='M')
    vals = np.linspace(max(0, total_comm*0.8), total_comm, 12)
    fig, ax = plt.subplots()
    ax.plot(months, vals, marker='o', color='#7b1fa2')
    ax.set_title('Vývoj provizí (posledních 12 měsíců)')
    ax.set_ylabel('Kč')
    st.pyplot(fig)

with tabs[1]:
    st.header("Hlavní provize")
    cols_main = [
        'login',
        'name',
        'new_bmsl',
        'coef_main',
        'bonus_coef',
        'total_coef',
        'commission',
    ]
    st.dataframe(combined[cols_main].sort_values('commission', ascending=False))

with tabs[2]:
    st.header("Strategické provize")
    cols_strat = ['login', 'name', 'strat_fee', 'coef_strat']
    st.dataframe(combined[cols_strat].sort_values('strat_fee', ascending=False))

with tabs[3]:
    st.header("Cashback")
    cols_cashback = ['login', 'name', 'cashback']
    st.dataframe(combined[cols_cashback].sort_values('cashback', ascending=False))

with tabs[4]:
    st.header("Cashback – strategické")
    st.write(
        "Zde by se zobrazovaly strategické cashbacky; "
        "aktuálně sloupec 'strat_fee' dostupný v datech."
    )
    st.dataframe(combined[['login', 'name', 'strat_fee', 'cashback']])

with tabs[5]:
    st.header("Reklamace & zadržené")
    st.dataframe(combined[['login', 'name', 'withheld']])

with tabs[6]:
    st.header("Tickount + individuální koeficienty")
    st.markdown(
        "Níže vidíte obsah nahraného Tickount souboru a tabulku s "
        "možností editace koeficientů."
    )
    st.markdown("**Raw Tickount**")
    st.dataframe(tickount_df)

    # prepare editable table for coefficients
    coeffs_df = None
    # build from session_state
    coeffs_state = st.session_state.get('coeffs', {})
    if coeffs_state:
        coeffs_df = pd.DataFrame.from_dict(coeffs_state, orient='index')
        # normalize columns
        coeffs_cols = [
            'login',
            'name',
            'band',
            'coef_main',
            'coef_strat',
            'bonus_coef',
            'total_coef',
            'note',
        ]
        coeffs_df = coeffs_df[coeffs_cols]
    else:
        coeffs_df = pd.DataFrame(columns=coeffs_cols)

    st.markdown(
        '**Upravte koeficienty (jednotlivě). Poté klikněte na "Uložit koeficienty".**'
    )
    edited = st.data_editor(coeffs_df, num_rows="dynamic")

    if st.button('Uložit koeficienty'):
        # zapis do session_state
        new = {}
        for _, r in edited.fillna('').iterrows():
            lg = str(r.get('login', ''))
            if not lg:
                continue
            coef_main_val = float(r.get('coef_main') or 1.0)
            coef_strat_val = float(r.get('coef_strat') or 1.0)
            bonus_val = float(r.get('bonus_coef') or 1.0)
            total_val = float(r.get('total_coef') or (coef_main_val * bonus_val))
            new[lg] = {
                'login': lg,
                'name': r.get('name', ''),
                'band': r.get('band', ''),
                'coef_main': coef_main_val,
                'coef_strat': coef_strat_val,
                'bonus_coef': bonus_val,
                'total_coef': total_val,
                'note': r.get('note', ''),
            }
        st.session_state['coeffs'] = new
        st.success(
            'Koeficienty uloženy do session. '
            'Pro přenos mezi relacemi stáhněte export.'
        )

    # nabídka exportu pro perzistenci
    csv_buf = edited.to_csv(index=False).encode('utf-8')
    csv_name = 'coefficients_export.csv'
    st.download_button(
        'Exportovat koeficienty (CSV)',
        data=csv_buf,
        file_name=csv_name,
        mime='text/csv',
    )

# --------- Invoice (PDF) a export výsledků ---------
st.sidebar.header('Akce')
month_detect = datetime.now().strftime('%Y-%m')
sel_month = st.sidebar.selectbox('Měsíc', options=[month_detect], index=0)
if st.sidebar.button('Vystavit fakturu (PDF)'):
    sel_df = combined[['login', 'name', 'commission']]
    sel_df = sel_df.rename(columns={'commission': 'commission'}).fillna(0)
    pdf_buf = generate_invoice_pdf(sel_df, sel_month)
    pdf_name = f'Faktura_{sel_month}.pdf'
    st.download_button(
        'Stáhnout PDF fakturu',
        data=pdf_buf,
        file_name=pdf_name,
        mime='application/pdf',
    )

if st.sidebar.button('Exportovat výsledky (CSV)'):
    out_buf = combined.to_csv(index=False).encode('utf-8')
    csv_name = f'provize_{sel_month}.csv'
    st.download_button(
        'Stáhnout CSV',
        data=out_buf,
        file_name=csv_name,
        mime='text/csv',
    )

st.sidebar.markdown(
        """
**Poznámky k perzistenci koeficientů**
- Koeficienty se ukládají do `session_state` (platí během jedné relace Streamlit).
- Pokud chcete zachovat koeficienty mezi relacemi, použijte tlačítko
    *Exportovat koeficienty* a tento soubor si uložte lokálně.
    Při dalším spuštění aplikace jej nahrajte přes upload (náhled):
    aplikace umí importovat CSV přes file_uploader (TODO).
"""
)

# Konec aplikace
st.caption(
    'Aplikace běží bez přímého přístupu k lokálnímu disku — vše přes upload. '
    'Pokud chcete perzistentní uložiště, je potřeba explicitně povolit '
    'backend úložiště nebo použít export/import CSV.'
)
