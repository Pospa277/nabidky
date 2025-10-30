// ============================================
// DATA MANAGEMENT - LocalStorage
// ============================================

class DataManager {
    constructor() {
        this.PRODUCTS_KEY = 'quote_app_products';
        this.QUOTES_KEY = 'quote_app_quotes';
        this.VAT_RATE = 0.21; // 21% DPH
    }

    // Produkty
    getProducts() {
        const products = localStorage.getItem(this.PRODUCTS_KEY);
        return products ? JSON.parse(products) : [];
    }

    saveProducts(products) {
        localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    }

    addProduct(product) {
        const products = this.getProducts();
        product.id = Date.now().toString();
        products.push(product);
        this.saveProducts(products);
        return product;
    }

    updateProduct(id, updatedProduct) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updatedProduct, id };
            this.saveProducts(products);
            return products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== id);
        this.saveProducts(filtered);
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id);
    }

    // Nabídky
    getQuotes() {
        const quotes = localStorage.getItem(this.QUOTES_KEY);
        return quotes ? JSON.parse(quotes) : [];
    }

    saveQuotes(quotes) {
        localStorage.setItem(this.QUOTES_KEY, JSON.stringify(quotes));
    }

    addQuote(quote) {
        const quotes = this.getQuotes();
        quote.id = Date.now().toString();
        quote.createdAt = new Date().toISOString();
        quotes.push(quote);
        this.saveQuotes(quotes);
        return quote;
    }

    getQuoteById(id) {
        const quotes = this.getQuotes();
        return quotes.find(q => q.id === id);
    }

    // Výpočet ceny podle množství
    calculatePrice(product, quantity) {
        if (!product.priceTiers || product.priceTiers.length === 0) {
            return product.basePrice;
        }

        // Seřadit cenové stupně podle množství (sestupně)
        const sortedTiers = [...product.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);

        // Najít odpovídající cenový stupeň
        for (const tier of sortedTiers) {
            if (quantity >= tier.minQuantity) {
                return tier.price;
            }
        }

        return product.basePrice;
    }

    // Formátování částky
    formatPrice(amount) {
        return new Intl.NumberFormat('cs-CZ', {
            style: 'currency',
            currency: 'CZK'
        }).format(amount);
    }
}

// ============================================
// APP - Hlavní aplikační logika
// ============================================

class QuoteApp {
    constructor() {
        this.dataManager = new DataManager();
        this.currentEditingProductId = null;
        this.currentQuoteItems = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.renderProducts();
        this.renderQuoteHistory();
        this.updateProductSelect();
        this.setDefaultDate();
    }

    // ============================================
    // TABS NAVIGATION
    // ============================================

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;

                // Deaktivovat všechny taby
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Aktivovat vybraný tab
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');

                // Refresh dat při přepnutí
                if (targetTab === 'products') {
                    this.renderProducts();
                } else if (targetTab === 'history') {
                    this.renderQuoteHistory();
                }
            });
        });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================

    setupEventListeners() {
        // Produkty - tlačítka
        document.getElementById('addProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('addTierBtn').addEventListener('click', () => this.addPriceTierInput());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeProductModal());
        document.getElementById('productForm').addEventListener('submit', (e) => this.handleProductSubmit(e));

        // Modal zavření
        const closeButtons = document.querySelectorAll('.modal .close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeProductModal();
                this.closeQuotePreviewModal();
            });
        });

        // Kliknutí mimo modal
        window.addEventListener('click', (e) => {
            const productModal = document.getElementById('productModal');
            const previewModal = document.getElementById('quotePreviewModal');
            if (e.target === productModal) this.closeProductModal();
            if (e.target === previewModal) this.closeQuotePreviewModal();
        });

        // Nabídky - tlačítka
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItemToQuote());
        document.getElementById('clearQuoteBtn').addEventListener('click', () => this.clearQuote());
        document.getElementById('quoteForm').addEventListener('submit', (e) => this.handleQuoteSubmit(e));
        document.getElementById('closePreviewBtn').addEventListener('click', () => this.closeQuotePreviewModal());
        document.getElementById('printQuoteBtn').addEventListener('click', () => window.print());
    }

    setDefaultDate() {
        const dateInput = document.getElementById('quoteDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // ============================================
    // PRODUKTY - CRUD OPERACE
    // ============================================

    openProductModal(productId = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');

        this.currentEditingProductId = productId;

        if (productId) {
            // Editace existujícího produktu
            title.textContent = 'Upravit produkt';
            const product = this.dataManager.getProductById(productId);
            if (product) {
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productBasePrice').value = product.basePrice;

                // Načíst cenové stupně
                const container = document.getElementById('priceTiersContainer');
                container.innerHTML = '';
                if (product.priceTiers && product.priceTiers.length > 0) {
                    product.priceTiers.forEach(tier => {
                        this.addPriceTierInput(tier.minQuantity, tier.price);
                    });
                }
            }
        } else {
            // Nový produkt
            title.textContent = 'Přidat produkt';
            form.reset();
            document.getElementById('priceTiersContainer').innerHTML = '';
        }

        modal.classList.add('active');
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
        this.currentEditingProductId = null;
        document.getElementById('productForm').reset();
        document.getElementById('priceTiersContainer').innerHTML = '';
    }

    addPriceTierInput(minQuantity = '', price = '') {
        const container = document.getElementById('priceTiersContainer');
        const tierDiv = document.createElement('div');
        tierDiv.className = 'tier-input-row';
        tierDiv.innerHTML = `
            <div class="form-group">
                <label>Od množství</label>
                <input type="number" class="tier-min-qty" min="1" value="${minQuantity}" placeholder="např. 10">
            </div>
            <div class="form-group">
                <label>Cena (Kč)</label>
                <input type="number" class="tier-price" step="0.01" min="0" value="${price}" placeholder="např. 950">
            </div>
            <button type="button" class="btn btn-danger" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(tierDiv);
    }

    handleProductSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const basePrice = parseFloat(document.getElementById('productBasePrice').value);

        // Získat cenové stupně
        const priceTiers = [];
        const tierRows = document.querySelectorAll('.tier-input-row');
        tierRows.forEach(row => {
            const minQty = parseInt(row.querySelector('.tier-min-qty').value);
            const price = parseFloat(row.querySelector('.tier-price').value);
            if (minQty && price) {
                priceTiers.push({ minQuantity: minQty, price });
            }
        });

        const productData = {
            name,
            description,
            basePrice,
            priceTiers: priceTiers.sort((a, b) => a.minQuantity - b.minQuantity)
        };

        if (this.currentEditingProductId) {
            this.dataManager.updateProduct(this.currentEditingProductId, productData);
        } else {
            this.dataManager.addProduct(productData);
        }

        this.closeProductModal();
        this.renderProducts();
        this.updateProductSelect();
    }

    deleteProduct(productId) {
        if (confirm('Opravdu chcete smazat tento produkt?')) {
            this.dataManager.deleteProduct(productId);
            this.renderProducts();
            this.updateProductSelect();
        }
    }

    renderProducts() {
        const container = document.getElementById('productsList');
        const products = this.dataManager.getProducts();

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Zatím nemáte žádné produkty</p>
                    <p>Klikněte na "Přidat produkt" pro začátek</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>${product.description || 'Bez popisu'}</p>
                <div class="product-price">${this.dataManager.formatPrice(product.basePrice)}</div>

                ${product.priceTiers && product.priceTiers.length > 0 ? `
                    <div class="price-tiers">
                        <h4>Cenové stupně:</h4>
                        ${product.priceTiers.map(tier => `
                            <div class="tier-item">
                                <span>Od ${tier.minQuantity} ks</span>
                                <strong>${this.dataManager.formatPrice(tier.price)}</strong>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="product-actions">
                    <button class="btn btn-success" onclick="app.openProductModal('${product.id}')">Upravit</button>
                    <button class="btn btn-danger" onclick="app.deleteProduct('${product.id}')">Smazat</button>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // NABÍDKY - Vytváření
    // ============================================

    updateProductSelect() {
        const select = document.getElementById('selectProduct');
        const products = this.dataManager.getProducts();

        select.innerHTML = '<option value="">-- Vyberte produkt --</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${this.dataManager.formatPrice(product.basePrice)})`;
            select.appendChild(option);
        });
    }

    addItemToQuote() {
        const productId = document.getElementById('selectProduct').value;
        const quantity = parseInt(document.getElementById('itemQuantity').value);

        if (!productId || !quantity || quantity < 1) {
            alert('Vyberte produkt a zadejte platné množství');
            return;
        }

        const product = this.dataManager.getProductById(productId);
        if (!product) return;

        const price = this.dataManager.calculatePrice(product, quantity);
        const total = price * quantity;

        const item = {
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: price,
            total
        };

        this.currentQuoteItems.push(item);
        this.renderQuoteItems();
        this.calculateQuoteSummary();

        // Reset
        document.getElementById('selectProduct').value = '';
        document.getElementById('itemQuantity').value = '1';
    }

    removeItemFromQuote(index) {
        this.currentQuoteItems.splice(index, 1);
        this.renderQuoteItems();
        this.calculateQuoteSummary();
    }

    renderQuoteItems() {
        const container = document.getElementById('quoteItemsList');

        if (this.currentQuoteItems.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Zatím nemáte žádné položky v nabídce</p></div>';
            return;
        }

        container.innerHTML = this.currentQuoteItems.map((item, index) => `
            <div class="quote-item">
                <div class="quote-item-info">
                    <h4>${item.productName}</h4>
                    <p>${item.quantity} ks × ${this.dataManager.formatPrice(item.unitPrice)}</p>
                </div>
                <div class="quote-item-price">${this.dataManager.formatPrice(item.total)}</div>
                <button class="btn btn-danger" onclick="app.removeItemFromQuote(${index})">×</button>
            </div>
        `).join('');
    }

    calculateQuoteSummary() {
        const totalWithoutVAT = this.currentQuoteItems.reduce((sum, item) => sum + item.total, 0);
        const vat = totalWithoutVAT * this.dataManager.VAT_RATE;
        const totalWithVAT = totalWithoutVAT + vat;

        document.getElementById('totalWithoutVAT').textContent = this.dataManager.formatPrice(totalWithoutVAT);
        document.getElementById('totalVAT').textContent = this.dataManager.formatPrice(vat);
        document.getElementById('totalWithVAT').textContent = this.dataManager.formatPrice(totalWithVAT);
    }

    clearQuote() {
        if (confirm('Opravdu chcete vymazat celou nabídku?')) {
            this.currentQuoteItems = [];
            document.getElementById('quoteForm').reset();
            this.setDefaultDate();
            this.renderQuoteItems();
            this.calculateQuoteSummary();
        }
    }

    handleQuoteSubmit(e) {
        e.preventDefault();

        if (this.currentQuoteItems.length === 0) {
            alert('Přidejte alespoň jednu položku do nabídky');
            return;
        }

        const clientName = document.getElementById('clientName').value;
        const clientAddress = document.getElementById('clientAddress').value;
        const quoteDate = document.getElementById('quoteDate').value;

        const totalWithoutVAT = this.currentQuoteItems.reduce((sum, item) => sum + item.total, 0);
        const vat = totalWithoutVAT * this.dataManager.VAT_RATE;
        const totalWithVAT = totalWithoutVAT + vat;

        const quote = {
            clientName,
            clientAddress,
            date: quoteDate,
            items: this.currentQuoteItems,
            totalWithoutVAT,
            vat,
            totalWithVAT
        };

        const savedQuote = this.dataManager.addQuote(quote);
        this.showQuotePreview(savedQuote);
        this.renderQuoteHistory();

        // Reset
        this.currentQuoteItems = [];
        document.getElementById('quoteForm').reset();
        this.setDefaultDate();
        this.renderQuoteItems();
        this.calculateQuoteSummary();
    }

    // ============================================
    // NÁHLED A TISK NABÍDKY
    // ============================================

    showQuotePreview(quote) {
        const modal = document.getElementById('quotePreviewModal');
        const content = document.getElementById('quotePreviewContent');

        const formattedDate = new Date(quote.date).toLocaleDateString('cs-CZ');

        content.innerHTML = `
            <div class="quote-preview-header">
                <h2>NABÍDKA</h2>
                <p>Číslo: ${quote.id}</p>
                <p>Datum: ${formattedDate}</p>
            </div>

            <div class="quote-preview-info">
                <div>
                    <h3>Dodavatel:</h3>
                    <p><strong>Vaše společnost</strong></p>
                    <p>Vaše adresa</p>
                    <p>IČ: 12345678</p>
                </div>
                <div>
                    <h3>Odběratel:</h3>
                    <p><strong>${quote.clientName}</strong></p>
                    ${quote.clientAddress ? `<p>${quote.clientAddress.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
            </div>

            <table class="quote-preview-table">
                <thead>
                    <tr>
                        <th>Položka</th>
                        <th>Množství</th>
                        <th>Jedn. cena</th>
                        <th>Celkem</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.items.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity} ks</td>
                            <td>${this.dataManager.formatPrice(item.unitPrice)}</td>
                            <td>${this.dataManager.formatPrice(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="quote-preview-summary">
                <div class="summary-row">
                    <span>Celkem bez DPH:</span>
                    <strong>${this.dataManager.formatPrice(quote.totalWithoutVAT)}</strong>
                </div>
                <div class="summary-row">
                    <span>DPH (21%):</span>
                    <strong>${this.dataManager.formatPrice(quote.vat)}</strong>
                </div>
                <div class="summary-row total">
                    <span>Celkem s DPH:</span>
                    <strong>${this.dataManager.formatPrice(quote.totalWithVAT)}</strong>
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    closeQuotePreviewModal() {
        const modal = document.getElementById('quotePreviewModal');
        modal.classList.remove('active');
    }

    viewQuote(quoteId) {
        const quote = this.dataManager.getQuoteById(quoteId);
        if (quote) {
            this.showQuotePreview(quote);
        }
    }

    // ============================================
    // HISTORIE NABÍDEK
    // ============================================

    renderQuoteHistory() {
        const container = document.getElementById('quoteHistoryList');
        const quotes = this.dataManager.getQuotes().reverse(); // Nejnovější nahoře

        if (quotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Zatím nemáte žádné uložené nabídky</p>
                </div>
            `;
            return;
        }

        container.innerHTML = quotes.map(quote => {
            const formattedDate = new Date(quote.date).toLocaleDateString('cs-CZ');
            return `
                <div class="quote-history-item">
                    <div class="quote-history-info">
                        <h3>${quote.clientName}</h3>
                        <p>Datum: ${formattedDate}</p>
                        <p>Počet položek: ${quote.items.length}</p>
                    </div>
                    <div class="quote-history-total">${this.dataManager.formatPrice(quote.totalWithVAT)}</div>
                    <button class="btn btn-primary" onclick="app.viewQuote('${quote.id}')">Zobrazit</button>
                </div>
            `;
        }).join('');
    }
}

// ============================================
// INICIALIZACE APLIKACE
// ============================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new QuoteApp();
});
