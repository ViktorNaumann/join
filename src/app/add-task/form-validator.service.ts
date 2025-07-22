import { Injectable } from '@angular/core';
import { CategoryManager } from './category-manager';

export interface FormData {
  title: string;
  description: string;
  dueDate: string;
}

export interface ValidationErrors {
  showTitleError: boolean;
  showDateError: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class FormValidatorService {
  
  /**
   * Validates all form fields and returns validation errors.
   */
  validateForm(formData: FormData, categoryManager: CategoryManager): ValidationErrors {
    return {
      showTitleError: this.validateTitle(formData.title),
      showDateError: this.validateDueDate(formData.dueDate)
    };
  }

  /**
   * Checks if form has any validation errors.
   */
  hasFormErrors(formData: FormData, categoryManager: CategoryManager): boolean {
    const titleError = this.validateTitle(formData.title);
    const categoryError = this.validateCategory(categoryManager);
    const dateError = this.validateDueDate(formData.dueDate);
    
    categoryManager.showCategoryError = categoryError;
    return titleError || categoryError || dateError;
  }

  private validateTitle(title: string): boolean {
    return !title.trim();
  }

  private validateCategory(categoryManager: CategoryManager): boolean {
    return !categoryManager.hasSelectedCategory();
  }

  private validateDueDate(dueDate: string): boolean {
    return !dueDate;
  }

  /**
   * Returns today's date in ISO format for date input validation.
   */
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
