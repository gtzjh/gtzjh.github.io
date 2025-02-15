class SearchManager {
    constructor() {
        this.index = null;
        this.searchData = null;
        this.initialize();
    }

    async initialize() {
        await this.loadIndex();
        if (!this.index) {
            console.error('Search index failed to initialize');
            return;
        }
        this.initializeSearch();
    }

    async loadIndex() {
        try {
            const response = await fetch('./search.json');
            this.searchData = await response.json();
            
            const self = this;
            this.index = lunr(function() {
                this.ref('url');
                this.field('title', { boost: 10 });
                this.field('content', { boost: 1 });
                
                this.pipeline.remove(lunr.stemmer);
                this.searchPipeline.remove(lunr.stemmer);
                
                if (self.searchData) {
                    self.searchData.forEach(doc => {
                        this.add(doc);
                    });
                }
            });
        } catch (error) {
            console.error('Error loading search index:', error);
        }
    }

    initializeSearch() {
        const searchInput = document.getElementById('global-search');
        const resultsContainer = document.getElementById('search-results');

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                const results = this.search(query);
                this.displayResults(results);
            } else {
                resultsContainer.innerHTML = '';
                resultsContainer.classList.remove('show');
            }
        });
    }

    search(query) {
        if (!this.index) {
            console.warn('Search index not initialized');
            return [];
        }
        
        const terms = query.split(/\s+/)
                          .map(term => term + '*')
                          .join(' ');
        
        return this.index.search(terms).map(result => {
            const doc = this.searchData.find(d => d.url === result.ref);
            return doc ? { ...doc, score: result.score } : null;
        }).filter(Boolean);
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = results
            .map(result => this.createResultItem(result))
            .join('');
        resultsContainer.classList.add('show');
    }

    createResultItem(result) {
        const excerpt = this.createExcerpt(result.content, 100);
        return `
            <a class="dropdown-item" href="${result.url}">
                <div class="search-result-item">
                    <h6>${result.title}</h6>
                    <small class="text-muted">${excerpt}</small>
                </div>
            </a>
        `;
    }

    createExcerpt(text, maxLength) {
        const ellipsis = text.length > maxLength ? '...' : '';
        return text.substring(0, maxLength) + ellipsis;
    }
}

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
}); 