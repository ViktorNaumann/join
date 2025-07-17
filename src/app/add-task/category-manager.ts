import { Injectable } from '@angular/core';

export interface Category {
  value: string;
  label: string;
  color: string;
}

/**
 * CategoryManager handles all category-related operations for the AddTaskComponent.
 * This includes category selection, display, and dropdown management.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryManager {
  private selectedCategory: string = '';
  private showCategoryDropdown: boolean = false;
  
  private categories: Category[] = [
    { value: 'technical', label: 'Technical Task', color: '#1FD7C1' },
    { value: 'user story', label: 'User Story', color: '#0038FF' }
  ];

  /**
   * Gets the currently selected category
   */
  getSelectedCategory(): string {
    return this.selectedCategory;
  }

  /**
   * Sets the selected category
   */
  setSelectedCategory(category: string): void {
    this.selectedCategory = category;
  }

  /**
   * Gets the category dropdown visibility state
   */
  getShowCategoryDropdown(): boolean {
    return this.showCategoryDropdown;
  }

  /**
   * Sets the category dropdown visibility state
   */
  setShowCategoryDropdown(value: boolean): void {
    this.showCategoryDropdown = value;
  }

  /**
   * Gets all available categories
   */
  getCategories(): Category[] {
    return this.categories;
  }

  /**
   * Toggles the category dropdown visibility.
   */
  toggleCategoryDropdown(): void {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  /**
   * Selects a category and closes the dropdown.
   * @param category - The category to select.
   */
  selectCategory(category: Category): void {
    this.selectedCategory = category.value;
    this.showCategoryDropdown = false;
  }

  /**
   * Returns the text to display for the selected category.
   * @returns The category label or default text.
   */
  getCategoryText(): string {
    if (!this.selectedCategory) {
      return 'Select task category';
    }
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.label : 'Select task category';
  }

  /**
   * Returns the color for the selected category.
   * @returns The category color or default color.
   */
  getCategoryColor(): string {
    if (!this.selectedCategory) {
      return '#ccc';
    }
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.color : '#ccc';
  }

  /**
   * Checks if a category is currently selected.
   * @returns True if a category is selected, false otherwise.
   */
  hasSelectedCategory(): boolean {
    return !!this.selectedCategory;
  }

  /**
   * Clears the selected category and resets dropdown state.
   */
  clearAll(): void {
    this.selectedCategory = '';
    this.showCategoryDropdown = false;
  }
}
