# Generátor nabídek

Jednoduchá webová aplikace pro tvorbu profesionálních nabídek s podporou proměnlivých cen podle množství a automatickým výpočtem DPH.

## ✨ Funkce

- 📦 **Správa produktů** - Přidávání, úprava a mazání produktů z portfolia
- 💰 **Cenové stupně** - Automatické úpravy cen podle zadaného množství
- 📋 **Generování nabídek** - Vytváření profesionálních nabídek pro klienty
- 🧮 **Automatický výpočet DPH** - Výpočet s 21% sazbou DPH
- 🖨️ **Tisk a export** - Možnost vytisknout nebo uložit nabídku
- 💾 **Automatické ukládání** - Veškerá data se ukládají lokálně v prohlížeči
- 📱 **Responzivní design** - Funguje na počítačích, tabletech i mobilech

## 🚀 Jak začít

### Spuštění aplikace

1. Otevřete soubor `index.html` v moderním webovém prohlížeči (Chrome, Firefox, Edge, Safari)
2. To je vše! Aplikace běží kompletně v prohlížeči, nepotřebuje server

### Nebo použijte jednoduchý HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (pokud máte nainstalovaný http-server)
npx http-server

# PHP
php -S localhost:8000
```

Pak otevřete prohlížeč na adrese `http://localhost:8000`

## 📖 Použití

### 1. Přidání produktů

1. Klikněte na záložku **"Produkty"**
2. Klikněte na tlačítko **"+ Přidat produkt"**
3. Vyplňte údaje o produktu:
   - Název produktu
   - Popis (nepovinné)
   - Základní cena v Kč

4. **Přidejte cenové stupně** (nepovinné):
   - Klikněte na "Přidat cenový stupeň"
   - Zadejte minimální množství a cenu pro daný stupeň
   - Příklad: Od 10 ks → 950 Kč, Od 50 ks → 850 Kč
   - Můžete přidat libovolný počet stupňů

5. Klikněte na **"Uložit"**

### 2. Vytvoření nabídky

1. Přejděte na záložku **"Vytvořit nabídku"**
2. Vyplňte údaje o klientovi:
   - Název klienta
   - Adresa (nepovinné)
   - Datum nabídky

3. Přidejte položky:
   - Vyberte produkt ze seznamu
   - Zadejte množství
   - Klikněte na **"Přidat položku"**
   - Opakujte pro další produkty

4. Zkontrolujte souhrn:
   - Celkem bez DPH
   - DPH (21%)
   - Celkem s DPH

5. Klikněte na **"Uložit a zobrazit náhled"**

### 3. Tisk a export

1. Po vytvoření nabídky se zobrazí náhled
2. Klikněte na tlačítko **"🖨️ Vytisknout"**
3. V dialogu tisku můžete:
   - Vytisknout na tiskárnu
   - Uložit jako PDF
   - Změnit nastavení tisku

### 4. Historie nabídek

1. Klikněte na záložku **"Historie nabídek"**
2. Zobrazí se seznam všech vytvořených nabídek
3. Kliknutím na **"Zobrazit"** můžete znovu otevřít jakoukoliv nabídku

## 💡 Příklad použití

**Scénář:** Prodáváte firemní trička

1. Vytvoříte produkt "Firemní tričko"
   - Základní cena: 350 Kč
   - Od 10 ks: 320 Kč
   - Od 50 ks: 290 Kč
   - Od 100 ks: 250 Kč

2. Klient chce objednat 75 kusů
   - Aplikace automaticky použije cenu 290 Kč (od 50 ks)
   - Celkem bez DPH: 21 750 Kč
   - DPH (21%): 4 567,50 Kč
   - Celkem s DPH: 26 317,50 Kč

3. Vygenerujete profesionální nabídku a vytisknete ji

## 🔧 Technické informace

### Technologie

- **HTML5** - Struktura aplikace
- **CSS3** - Moderní responzivní design
- **Vanilla JavaScript** - Aplikační logika bez závislostí
- **LocalStorage** - Ukládání dat v prohlížeči

### Datová struktura

**Produkt:**
```javascript
{
  id: "1234567890",
  name: "Název produktu",
  description: "Popis produktu",
  basePrice: 1000,
  priceTiers: [
    { minQuantity: 10, price: 950 },
    { minQuantity: 50, price: 850 }
  ]
}
```

**Nabídka:**
```javascript
{
  id: "1234567890",
  clientName: "Jméno klienta",
  clientAddress: "Adresa klienta",
  date: "2024-01-15",
  items: [
    {
      productId: "...",
      productName: "...",
      quantity: 10,
      unitPrice: 950,
      total: 9500
    }
  ],
  totalWithoutVAT: 9500,
  vat: 1995,
  totalWithVAT: 11495
}
```

## 🎨 Vzhled aplikace

Aplikace používá moderní design s:
- Modrou primární barvou (#2563eb)
- Čistým bílým pozadím
- Stíny pro hloubku
- Animace pro lepší UX
- Responzivní layout pro všechna zařízení

## 🔒 Bezpečnost a data

- Všechna data se ukládají **pouze lokálně** v prohlížeči (LocalStorage)
- Data **nejsou** odesílána na žádný server
- Data zůstávají uložena i po zavření prohlížeče
- Pro smazání dat smažte LocalStorage v prohlížeči nebo data v aplikaci

## 🌐 Kompatibilita prohlížečů

Aplikace funguje ve všech moderních prohlížečích:
- ✅ Chrome / Edge (verze 90+)
- ✅ Firefox (verze 88+)
- ✅ Safari (verze 14+)
- ✅ Opera (verze 76+)

## 📝 Poznámky

- DPH je fixně nastaveno na 21% (lze změnit v souboru `app.js`, konstanta `VAT_RATE`)
- Měna je nastavena na CZK (České koruny)
- Aplikace nepotřebuje připojení k internetu po načtení
- Data jsou specifická pro každý prohlížeč/doménu

## 🤝 Podpora

Pro otázky nebo problémy vytvořte issue v repozitáři nebo kontaktujte vývojáře.

## 📄 Licence

Tato aplikace je poskytována "jak je" pro interní použití.

---

**Vytvořeno s pomocí Claude** 🤖
