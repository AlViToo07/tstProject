class CategoriesManager {
    constructor() {
        this.categoriesContainer = document.getElementById(
            "categories-container"
        );
        this.searchInput = document.getElementById("search-input");
        this.prevButton = document.getElementById("prev-button");
        this.nextButton = document.getElementById("next-button");
        this.pageInfo = document.getElementById("page-info");

        this.categories = [];
        this.filteredCategories = [];
        this.currentPage = 1;
        this.categoriesPerPage = 5;

        this.setupEventListeners();
        this.fetchCategories();
    }

    setupEventListeners() {
        this.searchInput.addEventListener(
            "input",
            this.filterCategories.bind(this)
        );
        this.prevButton.addEventListener(
            "click",
            this.goToPreviousPage.bind(this)
        );
        this.nextButton.addEventListener("click", this.goToNextPage.bind(this));
    }

    async fetchCategories() {
        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/categories"
            ); // Ganti dengan URL API Anda
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            this.categories = await response.json();
            this.filteredCategories = [...this.categories];
            this.renderCategories();
            this.updatePagination();
        } catch (error) {
            console.error(`Error fetching categories: ${error.message}`);
        }
    }

    filterCategories() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        this.filteredCategories = this.categories.filter((category) =>
            category.name.toLowerCase().includes(searchTerm)
        );
        this.currentPage = 1; // Reset to first page
        this.renderCategories();
        this.updatePagination();
    }

    renderCategories() {
        this.categoriesContainer.innerHTML = "";
        const startIndex = (this.currentPage - 1) * this.categoriesPerPage;
        const endIndex = startIndex + this.categoriesPerPage;
        const paginatedCategories = this.filteredCategories.slice(
            startIndex,
            endIndex
        );

        if (paginatedCategories.length === 0) {
            this.categoriesContainer.innerHTML = `<div class="text-center text-gray-500">No categories found.</div>`;
            return;
        }

        paginatedCategories.forEach((category) => {
            const categoryElement = document.createElement("div");
            categoryElement.classList.add(
                "bg-white",
                "p-4",
                "rounded-lg",
                "shadow-md"
            );
            categoryElement.innerHTML = `<h3 class="text-lg font-semibold">${category.name}</h3>`;
            this.categoriesContainer.appendChild(categoryElement);
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(
            this.filteredCategories.length / this.categoriesPerPage
        );
        this.pageInfo.textContent = `Page ${this.currentPage} of ${
            totalPages || 1
        }`;
        this.prevButton.disabled = this.currentPage === 1;
        this.nextButton.disabled =
            this.currentPage === totalPages || totalPages === 0;
    }

    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderCategories();
            this.updatePagination();
        }
    }

    goToNextPage() {
        const totalPages = Math.ceil(
            this.filteredCategories.length / this.categoriesPerPage
        );
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderCategories();
            this.updatePagination();
        }
    }
}

// Initialize Categories Manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new CategoriesManager();
});
