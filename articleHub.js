class ArticleHub {  
    constructor() {  
        // Navigation Elements  
        this.navLinks = document.querySelectorAll('.nav-link');  
        this.pages = document.querySelectorAll('.page');  

        // Articles Page Elements  
        this.articlesContainer = document.getElementById('articles-container');  
        this.articleSearchInput = document.getElementById('article-search-input');  
        this.categoryFilter = document.getElementById('category-filter');  
        this.prevArticlesButton = document.getElementById('prev-articles-button');  
        this.nextArticlesButton = document.getElementById('next-articles-button');  
        this.articlesPageInfo = document.getElementById('articles-page-info');  

        // Article View Page  
        this.articleViewContent = document.getElementById('article-view-content');  

        // Categories Manager (from previous implementation)  
        this.categoriesManager = new CategoriesManager();  

        // State  
        this.articles = [];  
        this.filteredArticles = [];  
        this.currentArticlePage = 1;  
        this.articlesPerPage = 6;  

        // Event Listeners  
        this.setupEventListeners();  
    }  

    setupEventListeners() {  
        // Navigation Links  
        this.navLinks.forEach(link => {  
            link.addEventListener('click', (e) => {  
                e.preventDefault();  
                const targetPage = e.target.getAttribute('data-page');  
                this.navigateToPage(targetPage);  
            });  
        });  

        // Articles Search and Filter  
        this.articleSearchInput.addEventListener('input', this.filterArticles.bind(this));  
        this.categoryFilter.addEventListener('change', this.filterArticles.bind(this));  

        // Pagination  
        this.prevArticlesButton.addEventListener('click', this.goToPreviousArticlesPage.bind(this));  
        this.nextArticlesButton.addEventListener('click', this.goToNextArticlesPage.bind(this));  
    }  

    navigateToPage(pageId) {  
        // Hide all pages  
        this.pages.forEach(page => page.classList.add('hidden'));  

        // Show selected page  
        const targetPage = document.getElementById(`${pageId}-page`);  
        if (targetPage) {  
            targetPage.classList.remove('hidden');  
        }  

        // Highlight active nav link  
        this.navLinks.forEach(link => {  
            link.classList.remove('text-brand-primary', 'font-bold');  
            if (link.getAttribute('data-page') === pageId) {  
                link.classList.add('text-brand-primary', 'font-bold');  
            }  
        });  

        // Special actions for specific pages  
        if (pageId === 'articles') {  
            this.fetchArticles();  
        } else if (pageId === 'categories') {  
            this.categoriesManager.fetchCategories();  
        }  
    }  

    async fetchArticles() {  
        try {  
            const response = await fetch('http://127.0.0.1:8000/api/articles');  

            if (!response.ok) {  
                throw new Error('Network response was not ok');  
            }  

            this.articles = await response.json();  
            this.filteredArticles = [...this.articles];  

            // Populate category filter  
            this.populateCategoryFilter();  

            this.renderArticles();  
            this.updateArticlesPagination();  
        } catch (error) {  
            this.showError(`Error fetching articles: ${error.message}`);  
        }  
    }  

    populateCategoryFilter() {  
        // Get unique categories  
        const categories = [...new Set(this.articles.map(article => article.category))];  

        // Clear existing options  
        this.categoryFilter.innerHTML = '<option value="">All Categories</option>';  

        // Add category options  
        categories.forEach(category => {  
            const option = document.createElement('option');  
            option.value = category;  
            option.textContent = category;  
            this.categoryFilter.appendChild(option);  
        });  
    }  

    filterArticles() {  
        const searchTerm = this.articleSearchInput.value.toLowerCase().trim();  
        const categoryFilter = this.categoryFilter.value;  

        this.filteredArticles = this.articles.filter(article => {  
            const matchesSearch = article.title.toLowerCase().includes(searchTerm) ||  
                                  article.description.toLowerCase().includes(searchTerm);  
            const matchesCategory = !categoryFilter || article.category === categoryFilter;  

            return matchesSearch && matchesCategory;  
        });  

        // Reset to first page  
        this.currentArticlePage = 1;  

        this.renderArticles();  
        this.updateArticlesPagination();  
    }  

    renderArticles() {  
        // Clear previous articles  
        this.articlesContainer.innerHTML = '';  

        // Calculate pagination  
        const startIndex = (this.currentArticlePage - 1) * this.articlesPerPage;  
        const endIndex = startIndex + this.articlesPerPage;  
        const paginatedArticles = this.filteredArticles.slice(startIndex, endIndex);  

        // Handle empty state  
        if (this.filteredArticles.length === 0) {  
            this.articlesContainer.innerHTML = `  
                <div class="col-span-full text-center text-gray-500 p-4">  
                    No articles found.  
                </div>  
            `;  
            return;  
        }  

        // Render paginated articles  
        paginatedArticles.forEach(article => {  
            const articleElement = document.createElement('div');  
            articleElement.classList.add(  
                'bg-white',  
                'rounded-lg',  
                'shadow-md',  
                'overflow-hidden',  
                'hover:shadow-xl',  
                'transition'  
            );  

            articleElement.innerHTML = `  
                <div class="p-4">  
                    <h3 class="text-xl font-semibold mb-2 text-brand-primary">${article.title}</h3>  
                    <p class="text-gray-600 mb-4">${this.truncateText(article.description, 100)}</p>  
                    <div class="flex justify-between items-center">  
                        <span class="text-sm text-gray-500">Category: ${article.category}</span>  
                        <button  
                            class="view-article-btn text-white bg-brand-secondary px-3 py-1 rounded hover:bg-green-700 transition"  
                            data-id="${article.id}"  
                        >  
                            Read More  
                        </button>  
                    </div>  
                </div>  
            `;  

            // Add event listener to view article  
            articleElement.querySelector('.view-article-btn').addEventListener('click', () => this.viewArticle(article.id));  

            this.articlesContainer.appendChild(articleElement);  
        });  
    }  

    truncateText(text, maxLength) {  
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;  
    }  

    async viewArticle(articleId) {  
        try {  
            const response = await fetch(`http://127.0.0.1:8000/api/articles/${articleId}`);  

            if (!response.ok) {  
                throw new Error('Network response was not ok');  
            }  

            const article = await response.json();  

            // Navigate to article view page  
            this.navigateToPage('article-view');  

            // Render full article content  
            this.articleViewContent.innerHTML = `  
                <h1 class="text-3xl font-bold mb-4 text-brand-primary">${article.title}</h1>  
                <div class="flex justify-between items-center mb-4">  
                    <span class="text-gray-600">Category: ${article.category}</span>  
                    <span class="text-gray-500">Published: ${new Date(article.published_date).toLocaleDateString()}</span>  
                </div>  
                <div class="prose max-w-none">  
                    ${article.content}  
                </div>  
            `;  
        } catch (error) {  
            this.showError(`Error fetching article: ${error.message}`);  
        }  
    }  

    updateArticlesPagination() {  
        const totalPages = Math.ceil(this.filteredArticles.length / this.articlesPerPage);  

        // Update page info  
        this.articlesPageInfo.textContent = `Page ${this.currentArticlePage} of ${totalPages || 1}`;  

        // Disable/enable previous button  
        this.prevArticlesButton.disabled = this.currentArticlePage === 1;  

        // Disable/enable next button  
        this.nextArticlesButton.disabled = this.currentArticlePage === totalPages || totalPages === 0;  
    }  

    goToPreviousArticlesPage() {  
        if (this.currentArticlePage > 1) {  
            this.currentArticlePage--;  
            this.renderArticles();  
            this.updateArticlesPagination();  
        }  
    }  

    goToNextArticlesPage() {  
        const totalPages = Math.ceil(this.filteredArticles.length / this.articlesPerPage);  
        if (this.currentArticlePage < totalPages) {  
            this.currentArticlePage++;  
            this.renderArticles();  
            this.updateArticlesPagination();  
        }  
    }  

    showError(message) {  
        // You can customize this to show a more user-friendly error  
        console.error(message);  
        alert(message);  
    }  

    init() {  
        // Default to home page  
        this.navigateToPage('home');  
    }  
}  

// Initialize the Article Hub when DOM is loaded  
document.addEventListener('DOMContentLoaded', () => {  
    const articleHub = new ArticleHub();  
    articleHub.init();  
});