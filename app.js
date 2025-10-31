// ============================================
// DATA MANAGEMENT - LocalStorage
// ============================================

class DataManager {
    constructor() {
        this.PRODUCTS_KEY = 'quote_app_products';
        this.QUOTES_KEY = 'quote_app_quotes';
        this.CATEGORIES_KEY = 'quote_app_categories';
        this.VAT_RATE = 0.21; // 21% DPH

        // Inicializovat výchozí kategorie při prvním spuštění
        this.initializeDefaultCategories();
    }

    // Kategorie
    getCategories() {
        const categories = localStorage.getItem(this.CATEGORIES_KEY);
        return categories ? JSON.parse(categories) : [];
    }

    saveCategories(categories) {
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    }

    addCategory(category) {
        const categories = this.getCategories();
        // Použít Date.now() + random pro zajištění unikátnosti
        category.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
        categories.push(category);
        this.saveCategories(categories);
        return category;
    }

    updateCategory(id, updatedCategory) {
        const categories = this.getCategories();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...updatedCategory, id };
            this.saveCategories(categories);
            return categories[index];
        }
        return null;
    }

    deleteCategory(id) {
        const categories = this.getCategories();
        const filtered = categories.filter(c => c.id !== id);
        this.saveCategories(filtered);

        // Smazat všechny produkty v této kategorii
        const products = this.getProducts();
        const filteredProducts = products.filter(p => p.categoryId !== id);
        this.saveProducts(filteredProducts);
    }

    getCategoryById(id) {
        const categories = this.getCategories();
        return categories.find(c => c.id === id);
    }

    initializeDefaultCategories() {
        const categories = this.getCategories();

        // Pokud už kategorie existují, nepřepisovat
        if (categories.length > 0) return;

        // Výchozí kategorie
        const defaultCategories = [
            { name: 'Osobní péče' },
            { name: 'Voňavá reklama' },
            { name: 'Reklamní kosmetika' },
            { name: 'Sladkosti' },
            { name: 'Nápoje' },
            { name: 'Kancelář' },
            { name: 'Textil' }
        ];

        defaultCategories.forEach(cat => this.addCategory(cat));
    }

    getProductsByCategory(categoryId) {
        const products = this.getProducts();
        const filtered = products.filter(p => {
            console.log(`Produkt "${p.name}": categoryId="${p.categoryId}", hledám categoryId="${categoryId}", shoda: ${p.categoryId === categoryId}`);
            return p.categoryId === categoryId;
        });
        console.log(`Kategorie ${categoryId}: nalezeno ${filtered.length} produktů z ${products.length}`);
        return filtered;
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
        // Použít Date.now() + random pro zajištění unikátnosti
        product.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
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
        // Použít Date.now() + random pro zajištění unikátnosti
        quote.id = Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
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

    // Reset všech dat (vymazání a znovu vytvoření výchozích kategorií)
    resetAllData() {
        if (confirm('VAROVÁNÍ: Tímto smažete VŠECHNY kategorie, produkty a nabídky!\n\nOpravdu chcete pokračovat?')) {
            localStorage.removeItem(this.CATEGORIES_KEY);
            localStorage.removeItem(this.PRODUCTS_KEY);
            localStorage.removeItem(this.QUOTES_KEY);
            // Znovu inicializovat výchozí kategorie
            this.initializeDefaultCategories();
            alert('Všechna data byla vymazána a výchozí kategorie byly znovu vytvořeny.');
            return true;
        }
        return false;
    }

    // Export všech dat do JSON souboru
    exportData() {
        const data = {
            categories: this.getCategories(),
            products: this.getProducts(),
            quotes: this.getQuotes(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        link.download = `nabidky-zaloha-${dateStr}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert('Data byla úspěšně exportována!');
    }

    // Import dat z JSON souboru
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Validace struktury dat
            if (!data.categories || !data.products || !data.quotes) {
                throw new Error('Neplatný formát dat');
            }

            // Uložit importovaná data
            this.saveCategories(data.categories);
            this.saveProducts(data.products);
            this.saveQuotes(data.quotes);

            alert('Data byla úspěšně importována!');
            return true;
        } catch (error) {
            alert('Chyba při importu dat: ' + error.message);
            return false;
        }
    }
}

// ============================================
// APP - Hlavní aplikační logika
// ============================================

class QuoteApp {
    constructor() {
        this.dataManager = new DataManager();
        this.currentEditingProductId = null;
        this.currentEditingCategoryId = null;
        this.currentQuoteItems = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.renderCategories();
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
                    this.renderCategories();
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
        // Export/Import dat
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.dataManager.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (this.dataManager.importData(event.target.result)) {
                        this.renderCategories();
                        this.updateProductSelect();
                        this.renderQuoteHistory();
                    }
                    // Reset file input
                    e.target.value = '';
                };
                reader.readAsText(file);
            }
        });

        // Kategorie - tlačítka
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            if (this.dataManager.resetAllData()) {
                this.renderCategories();
                this.updateProductSelect();
                this.renderQuoteHistory();
            }
        });
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.handleCategorySubmit(e));

        // Produkty - tlačítka
        document.getElementById('addTierBtn').addEventListener('click', () => this.addPriceTierInput());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeProductModal());
        document.getElementById('productForm').addEventListener('submit', (e) => this.handleProductSubmit(e));

        // Modal zavření
        const closeButtons = document.querySelectorAll('.modal .close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeProductModal();
                this.closeCategoryModal();
                this.closeQuotePreviewModal();
            });
        });

        // Kliknutí mimo modal
        window.addEventListener('click', (e) => {
            const productModal = document.getElementById('productModal');
            const categoryModal = document.getElementById('categoryModal');
            const previewModal = document.getElementById('quotePreviewModal');
            if (e.target === productModal) this.closeProductModal();
            if (e.target === categoryModal) this.closeCategoryModal();
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
    // KATEGORIE - CRUD OPERACE
    // ============================================

    renderCategories() {
        const container = document.getElementById('categoriesList');
        const categories = this.dataManager.getCategories();

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Zatím nemáte žádné kategorie</p>
                    <p>Klikněte na "Přidat kategorii" pro začátek</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(category => {
            const products = this.dataManager.getProductsByCategory(category.id);
            const productCount = products.length;

            console.log(`Rendering category: ${category.name}, ID: ${category.id}`);

            return `
                <div class="category-item" id="category-${category.id}">
                    <div class="category-header" onclick="app.toggleCategory('${category.id}')">
                        <div class="category-header-left">
                            <span class="category-toggle">▶</span>
                            <h3>${category.name}</h3>
                            <span class="category-count">(${productCount} produkt${productCount === 1 ? '' : productCount < 5 ? 'y' : 'ů'})</span>
                        </div>
                        <div class="category-actions" onclick="event.stopPropagation()">
                            <button class="btn btn-success" onclick="app.openCategoryModal('${category.id}')">Upravit</button>
                            <button class="btn btn-danger" onclick="app.deleteCategory('${category.id}')">Smazat</button>
                        </div>
                    </div>
                    <div class="category-content">
                        <div class="category-products">
                            ${productCount > 0 ? `
                                <div class="products-grid">
                                    ${products.map(product => `
                                        <div class="product-card">
                                            <h3>${product.name}</h3>
                                            <p>${product.description || 'Bez popisu'}</p>

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
                                            ` : '<p class="help-text">Žádné cenové stupně</p>'}

                                            <div class="product-actions">
                                                <button class="btn btn-success" onclick="app.openProductModal('${category.id}', '${product.id}')">Upravit</button>
                                                <button class="btn btn-danger" onclick="app.deleteProduct('${product.id}')">Smazat</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="empty-category">
                                    <p>V této kategorii zatím nejsou žádné produkty</p>
                                </div>
                            `}
                            <div class="category-add-product">
                                <button class="btn btn-primary" onclick="app.openProductModal('${category.id}')">+ Přidat produkt do kategorie</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleCategory(categoryId) {
        console.log('toggleCategory called with ID:', categoryId);
        const categoryElement = document.getElementById(`category-${categoryId}`);
        console.log('Found element:', categoryElement);
        if (categoryElement) {
            const categoryName = categoryElement.querySelector('h3').textContent;
            console.log('Toggling category:', categoryName);
            categoryElement.classList.toggle('active');
        } else {
            console.error('Category element not found for ID:', categoryId);
        }
    }

    openCategoryModal(categoryId = null) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');

        this.currentEditingCategoryId = categoryId;

        if (categoryId) {
            // Editace existující kategorie
            title.textContent = 'Upravit kategorii';
            const category = this.dataManager.getCategoryById(categoryId);
            if (category) {
                document.getElementById('categoryName').value = category.name;
            }
        } else {
            // Nová kategorie
            title.textContent = 'Přidat kategorii';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeCategoryModal() {
        const modal = document.getElementById('categoryModal');
        modal.classList.remove('active');
        this.currentEditingCategoryId = null;
        document.getElementById('categoryForm').reset();
    }

    handleCategorySubmit(e) {
        e.preventDefault();

        const name = document.getElementById('categoryName').value;

        if (this.currentEditingCategoryId) {
            this.dataManager.updateCategory(this.currentEditingCategoryId, { name });
        } else {
            this.dataManager.addCategory({ name });
        }

        this.closeCategoryModal();
        this.renderCategories();
    }

    deleteCategory(categoryId) {
        const products = this.dataManager.getProductsByCategory(categoryId);
        const confirmMsg = products.length > 0
            ? `Opravdu chcete smazat tuto kategorii? Bude smazáno i ${products.length} produkt${products.length === 1 ? '' : products.length < 5 ? 'y' : 'ů'}.`
            : 'Opravdu chcete smazat tuto kategorii?';

        if (confirm(confirmMsg)) {
            this.dataManager.deleteCategory(categoryId);
            this.renderCategories();
            this.updateProductSelect();
        }
    }

    // ============================================
    // PRODUKTY - CRUD OPERACE
    // ============================================

    openProductModal(categoryId, productId = null) {
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
                document.getElementById('productCategoryId').value = product.categoryId || categoryId;

                // Načíst cenové stupně
                const container = document.getElementById('priceTiersContainer');
                container.innerHTML = '';
                if (product.priceTiers && product.priceTiers.length > 0) {
                    product.priceTiers.forEach(tier => {
                        this.addPriceTierInput(tier.minQuantity, tier.price);
                    });
                } else {
                    // Pokud produkt nemá cenové stupně, přidat 3 prázdné řádky
                    this.addPriceTierInput();
                    this.addPriceTierInput();
                    this.addPriceTierInput();
                }
            }
        } else {
            // Nový produkt
            title.textContent = 'Přidat produkt';
            form.reset();
            document.getElementById('productCategoryId').value = categoryId;
            document.getElementById('priceTiersContainer').innerHTML = '';
            // Přidat 3 prázdné řádky pro cenové stupně
            this.addPriceTierInput();
            this.addPriceTierInput();
            this.addPriceTierInput();
        }

        modal.classList.add('active');
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
        this.currentEditingProductId = null;
        document.getElementById('productForm').reset();
        document.getElementById('productCategoryId').value = '';
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
        const categoryId = document.getElementById('productCategoryId').value;

        // Validace - musí být vybraná kategorie
        if (!categoryId) {
            alert('Chyba: Nebyla vybrána kategorie pro produkt!');
            return;
        }

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

        // Validace - musí být alespoň jeden cenový stupeň
        if (priceTiers.length === 0) {
            alert('Musíte zadat alespoň jeden cenový stupeň!');
            return;
        }

        // Seřadit cenové stupně a nastavit basePrice na nejnižší cenu
        const sortedTiers = priceTiers.sort((a, b) => a.minQuantity - b.minQuantity);
        const basePrice = sortedTiers[0].price; // Použít cenu z nejnižšího stupně

        const productData = {
            name,
            description,
            basePrice,
            categoryId,
            priceTiers: sortedTiers
        };

        if (this.currentEditingProductId) {
            this.dataManager.updateProduct(this.currentEditingProductId, productData);
        } else {
            this.dataManager.addProduct(productData);
        }

        this.closeProductModal();
        this.renderCategories();
        this.updateProductSelect();
    }

    deleteProduct(productId) {
        if (confirm('Opravdu chcete smazat tento produkt?')) {
            this.dataManager.deleteProduct(productId);
            this.renderCategories();
            this.updateProductSelect();
        }
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

            // Zobrazit rozsah cen ze stupňů
            let priceInfo = '';
            if (product.priceTiers && product.priceTiers.length > 0) {
                const prices = product.priceTiers.map(t => t.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                if (minPrice === maxPrice) {
                    priceInfo = this.dataManager.formatPrice(minPrice);
                } else {
                    priceInfo = `${this.dataManager.formatPrice(minPrice)} - ${this.dataManager.formatPrice(maxPrice)}`;
                }
            } else {
                priceInfo = 'bez ceny';
            }

            option.textContent = `${product.name} (${priceInfo})`;
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
        const clientStreet = document.getElementById('clientStreet').value;
        const clientCity = document.getElementById('clientCity').value;
        const clientCountry = document.getElementById('clientCountry').value;
        const quoteDate = document.getElementById('quoteDate').value;

        const totalWithoutVAT = this.currentQuoteItems.reduce((sum, item) => sum + item.total, 0);
        const vat = totalWithoutVAT * this.dataManager.VAT_RATE;
        const totalWithVAT = totalWithoutVAT + vat;

        const quote = {
            clientName,
            clientStreet,
            clientCity,
            clientCountry,
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
                <div class="quote-header-logo">
                    <img src="logo_twin.svg" alt="TWIN PRODUCTION logo" class="quote-logo">
                </div>
                <div class="quote-header-text">
                    <h2>NABÍDKA</h2>
                    <p>Datum: ${formattedDate}</p>
                </div>
            </div>

            <div class="quote-preview-info">
                <div>
                    <h3>Dodavatel:</h3>
                    <p><strong>TWIN PRODUCTION s.r.o.</strong></p>
                    <p>Dobrovského 31</p>
                    <p>Olomouc 779 00</p>
                    <p>Česko</p>
                </div>
                <div>
                    <h3>Odběratel:</h3>
                    <p><strong>${quote.clientName}</strong></p>
                    ${quote.clientStreet ? `<p>${quote.clientStreet}</p>` : ''}
                    ${quote.clientCity ? `<p>${quote.clientCity}</p>` : ''}
                    ${quote.clientCountry ? `<p>${quote.clientCountry}</p>` : ''}
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
