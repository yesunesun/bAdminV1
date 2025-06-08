// src/modules/owner/components/property/wizard/services/autoFill/domUtilsService.ts
// Version: 1.0.0
// Last Modified: 03-05-2025 19:30 IST
// Purpose: DOM manipulation utilities for auto-filling forms

export class DOMUtilsService {
  // Counter to track processed select elements for fallback ordering
  static processedSelectCount = 0;
  
  /**
   * Fill a Radix Select component based on a field mapping
   */
  static fillRadixSelectByMapping(mapping: {
    labelTexts: string[],
    values: string[],
    dataTestId?: string
  }): void {
    try {
      // Find all instances of SelectTrigger in the document
      const selectTriggers = document.querySelectorAll('[role="combobox"][aria-controls]');
      console.log(`Found ${selectTriggers.length} potential Radix Select triggers`);
      
      let targetTrigger: Element | null = null;
      
      // First, try to find by data-test-id if specified
      if (mapping.dataTestId) {
        const testIdSelector = `[data-test-id="${mapping.dataTestId}"]`;
        const byTestId = document.querySelector(testIdSelector);
        if (byTestId) {
          // Look for the select trigger within this element
          const nearbyTrigger = byTestId.querySelector('[role="combobox"][aria-controls]');
          if (nearbyTrigger) {
            targetTrigger = nearbyTrigger;
            console.log(`Found select by data-test-id: ${mapping.dataTestId}`);
          }
        }
      }
      
      // If not found by data-test-id, try by label text
      if (!targetTrigger) {
        for (const labelText of mapping.labelTexts) {
          const labels = Array.from(document.querySelectorAll('label')).filter(
            label => label.textContent?.toLowerCase().includes(labelText.toLowerCase())
          );
          
          for (const label of labels) {
            // Try by referenced element
            if (label.htmlFor) {
              const referencedEl = document.getElementById(label.htmlFor);
              if (referencedEl) {
                // Look for select trigger within or near the referenced element
                const nearbyTrigger = referencedEl.querySelector('[role="combobox"][aria-controls]') || 
                                     referencedEl.closest('[role="combobox"][aria-controls]');
                
                if (nearbyTrigger) {
                  targetTrigger = nearbyTrigger;
                  console.log(`Found select by label reference for: ${labelText}`);
                  break;
                }
              }
            }
            
            // Try nearby elements
            let parent = label.parentElement;
            while (parent && !targetTrigger) {
              const nearbyTrigger = parent.querySelector('[role="combobox"][aria-controls]');
              if (nearbyTrigger) {
                targetTrigger = nearbyTrigger;
                console.log(`Found select near label for: ${labelText}`);
                break;
              }
              parent = parent.parentElement;
            }
            
            if (targetTrigger) break;
          }
          
          if (targetTrigger) break;
        }
      }
      
      // If still not found, try selecting from all triggers by order
      if (!targetTrigger && selectTriggers.length > 0) {
        const index = Math.min(this.processedSelectCount, selectTriggers.length - 1);
        targetTrigger = selectTriggers[index];
        this.processedSelectCount = this.processedSelectCount + 1;
        console.log(`Using trigger by position: ${index}`);
      }
      
      // If we found a target trigger, click it to open the dropdown
      if (targetTrigger) {
        console.log(`Clicking select trigger for ${mapping.labelTexts[0]}`);
        
        // Click the trigger to open the dropdown
        (targetTrigger as HTMLElement).click();
        
        // Wait a moment for the dropdown to open
        setTimeout(() => {
          // Now look for the dropdown content and select an item
          const popover = document.querySelector('[role="listbox"]');
          if (popover) {
            console.log('Found popover content');
            
            // Look for items that match our desired values
            let foundMatch = false;
            for (const value of mapping.values) {
              // Look for items with text containing our value
              const items = Array.from(popover.querySelectorAll('[role="option"]')).filter(
                item => item.textContent?.toLowerCase().includes(value.toLowerCase())
              );
              
              if (items.length > 0) {
                console.log(`Found matching option for ${value}`);
                // Click the first matching item
                (items[0] as HTMLElement).click();
                foundMatch = true;
                break;
              }
            }
            
            // If no match found, just click the first option
            if (!foundMatch) {
              const firstItem = popover.querySelector('[role="option"]');
              if (firstItem) {
                console.log('Selecting first available option');
                (firstItem as HTMLElement).click();
              } else {
                // If all else fails, click the trigger again to close the dropdown
                (targetTrigger as HTMLElement).click();
              }
            }
          } else {
            console.log('No popover found, clicking trigger again to close');
            // If we couldn't find the popover, click the trigger again to close the dropdown
            (targetTrigger as HTMLElement).click();
          }
        }, 100);
      } else {
        console.log(`Could not find select for ${mapping.labelTexts[0]}`);
      }
    } catch (error) {
      console.error("Error filling Radix Select:", error);
    }
  }
  
  /**
   * Fill an input field based on label text
   */
  static fillInputByLabel(labelTexts: string[], value: string): boolean {
    try {
      // Find input by its label
      for (const labelText of labelTexts) {
        const labels = Array.from(document.querySelectorAll('label')).filter(
          label => label.textContent?.toLowerCase().includes(labelText.toLowerCase())
        );
        
        for (const label of labels) {
          // Try by referenced input
          if (label.htmlFor) {
            const input = document.getElementById(label.htmlFor) as HTMLInputElement;
            if (input?.tagName === 'INPUT') {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`Set input for ${labelText} to ${value}`);
              return true;
            }
          }
          
          // Look for input elements near the label
          const nearbyInput = label.closest('div, form')?.querySelector('input');
          if (nearbyInput) {
            (nearbyInput as HTMLInputElement).value = value;
            nearbyInput.dispatchEvent(new Event('input', { bubbles: true }));
            nearbyInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Set input near ${labelText} to ${value}`);
            return true;
          }
        }
      }
      
      // Try placeholder text as a fallback
      for (const labelText of labelTexts) {
        const inputs = document.querySelectorAll(`input[placeholder*="${labelText}" i]`);
        if (inputs.length > 0) {
          (inputs[0] as HTMLInputElement).value = value;
          inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`Set input with placeholder ${labelText} to ${value}`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error filling input:", error);
      return false;
    }
  }
  
  /**
   * Fill a date input field by label
   */
  static fillDateByLabel(labelTexts: string[], dateValue: string): boolean {
    try {
      // Try to find the date input by its label
      for (const labelText of labelTexts) {
        const labels = Array.from(document.querySelectorAll('label')).filter(
          label => label.textContent?.toLowerCase().includes(labelText.toLowerCase())
        );
        
        for (const label of labels) {
          // Try by referenced input
          if (label.htmlFor) {
            const input = document.getElementById(label.htmlFor) as HTMLInputElement;
            if (input?.type === 'date' || input?.placeholder?.includes('dd/mm/yyyy')) {
              input.value = dateValue;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`Set date for ${labelText} to ${dateValue}`);
              return true;
            }
          }
          
          // Look for date inputs near the label
          const dateInput = label.closest('div, form')?.querySelector('input[type="date"], input[placeholder*="dd/mm"], input[placeholder*="date"]');
          if (dateInput) {
            (dateInput as HTMLInputElement).value = dateValue;
            dateInput.dispatchEvent(new Event('input', { bubbles: true }));
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Set date near ${labelText} to ${dateValue}`);
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error filling date field:", error);
      return false;
    }
  }
  
  /**
   * Check a checkbox based on label text
   */
  static checkCheckboxByLabel(labelTexts: string[], checked: boolean): boolean {
    try {
      // Find checkboxes by their labels
      for (const labelText of labelTexts) {
        // First try standard HTML checkboxes
        const labels = Array.from(document.querySelectorAll('label')).filter(
          label => label.textContent?.toLowerCase().includes(labelText.toLowerCase())
        );
        
        for (const label of labels) {
          // Try by referenced input
          if (label.htmlFor) {
            const checkbox = document.getElementById(label.htmlFor) as HTMLInputElement;
            if (checkbox?.type === 'checkbox') {
              checkbox.checked = checked;
              checkbox.dispatchEvent(new Event('change', { bubbles: true }));
              console.log(`Set checkbox for ${labelText} to ${checked}`);
              return true;
            }
          }
          
          // Look for checkbox inputs near the label
          const checkboxInput = label.closest('div, form')?.querySelector('input[type="checkbox"]');
          if (checkboxInput) {
            (checkboxInput as HTMLInputElement).checked = checked;
            checkboxInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Set checkbox near ${labelText} to ${checked}`);
            return true;
          }
        }
        
        // Try to find custom checkbox components
        const customCheckboxes = document.querySelectorAll('[role="checkbox"]');
        for (const checkbox of Array.from(customCheckboxes)) {
          if (checkbox.textContent?.toLowerCase().includes(labelText.toLowerCase())) {
            // Check if it's already in the desired state
            const isChecked = checkbox.getAttribute('aria-checked') === 'true';
            if (isChecked !== checked) {
              // Click to toggle the state
              (checkbox as HTMLElement).click();
              console.log(`Clicked custom checkbox for ${labelText}`);
            }
            return true;
          }
        }
      }
      
      // If we reach this point, we couldn't find the checkbox
      return false;
    } catch (error) {
      console.error("Error checking checkbox:", error);
      return false;
    }
  }
}