export class SearchSelect {
    constructor(selectElement) {
        this.selectElement = selectElement;
        this.options = this.getOptionsItems();
        this.selectedOption = this.options.find(option => option.selected);
        this.highlightedIndex = -1;

        // Create main container
        this.searchSelectContainer = document.createElement('div');
        this.searchSelectContainer.classList.add('search-select-container');

        // Create display element
        this.displayElement = document.createElement('div');
        this.displayElement.classList.add('search-select-display');
        this.displayElement.setAttribute('tabindex', '0');
        this.displayElement.setAttribute('role', 'combobox');
        this.displayElement.setAttribute('aria-haspopup', 'listbox');
        this.displayElement.setAttribute('aria-expanded', 'false');
        this.updateDisplay();

        // Create dropdown
        this.dropdownElement = document.createElement('div');
        this.dropdownElement.classList.add('search-select-dropdown');
        this.dropdownElement.setAttribute('role', 'listbox');

        // Create search input
        this.searchContainer = document.createElement('div');
        this.searchContainer.classList.add('search-select-search');
        this.searchInput = document.createElement('input');
        this.searchInput.setAttribute('type', 'text');
        this.searchInput.setAttribute('placeholder', 'Search..');
        this.searchInput.setAttribute('aria-label', 'Search options');
        this.searchInput.classList.add('form-control');
        this.searchContainer.appendChild(this.searchInput);
        this.dropdownElement.appendChild(this.searchContainer);

        // Create options list
        this.optionsListElement = document.createElement('ul');
        this.optionsListElement.classList.add('search-select-options');
        this.optionsListElement.setAttribute('role', 'presentation');
        this.dropdownElement.appendChild(this.optionsListElement);

        this.buildOptions();

        this.searchSelectContainer.appendChild(this.displayElement);
        this.searchSelectContainer.appendChild(this.dropdownElement);

        this.selectElement.parentNode.insertBefore(this.searchSelectContainer, this.selectElement);
        this.selectElement.classList.add('search-select-hidden');
        this.selectElement.setAttribute('tabindex', '-1');
        this.selectElement.setAttribute('aria-hidden', 'true');

        this.addEventListeners();
    }

    getOptionsItems() {
        return Array.from(this.selectElement.options).map((option, index) => ({
            value: option.value,
            label: option.label || option.textContent,
            selected: option.selected,
            disabled: option.disabled,
            element: option,
            id: `search-select-option-${this.selectElement.id || Math.random().toString(36).substring(2)}-${index}`
        }));
    }

    buildOptions() {
        this.optionsListElement.innerHTML = '';
        this.options.forEach((optionData, index) => {
            const optionElement = document.createElement('li');
            optionElement.classList.add('search-select-option');
            optionElement.textContent = optionData.label;
            optionElement.dataset.value = optionData.value;
            optionElement.setAttribute('role', 'option');
            optionElement.setAttribute('id', optionData.id);
            optionElement.setAttribute('aria-selected', optionData.selected ? 'true' : 'false');

            if (optionData.disabled) {
                optionElement.classList.add('disabled');
                optionElement.setAttribute('aria-disabled', 'true');
            }
            if (optionData.selected) {
                optionElement.classList.add('selected');
                this.highlightedIndex = index;
            }

            optionData.searchElement = optionElement;
            this.optionsListElement.appendChild(optionElement);

            if (!optionData.disabled) {
                optionElement.addEventListener('click', () => {
                    this.selectOption(optionData);
                    this.closeDropdown();
                });
                optionElement.addEventListener('mouseenter', () => {
                    this.highlightOption(index);
                });
            }
        });
    }

    updateDisplay() {
        if (this.selectedOption && this.selectedOption.value) {
            this.displayElement.textContent = this.selectedOption.label;
            this.displayElement.classList.remove('placeholder');
            this.displayElement.setAttribute('aria-activedescendant', this.selectedOption.id);
        } else {
            const placeholder = this.selectElement.options[0]?.value === "" ? this.selectElement.options[0].textContent : "Select an option...";
            this.displayElement.textContent = placeholder;
            this.displayElement.classList.add('placeholder');
            this.displayElement.removeAttribute('aria-activedescendant');
        }
    }

    selectOption(optionData) {
        if (optionData.disabled) return;

        // Find matching option if element is not provided
        if (!optionData.element) {
            const matchingOption = this.options.find(opt => opt.value === optionData.value);
            if (!matchingOption) return;
            optionData = matchingOption;
        }

        const previouslySelected = this.options.find(opt => opt.selected);
        if (previouslySelected) {
            previouslySelected.selected = false;
            previouslySelected.element.selected = false;
            if (previouslySelected.searchElement) {
                previouslySelected.searchElement.classList.remove('selected');
                previouslySelected.searchElement.setAttribute('aria-selected', 'false');
            }
        }

        optionData.selected = true;
        optionData.element.selected = true;
        this.selectedOption = optionData;
        if (optionData.searchElement) {
            optionData.searchElement.classList.add('selected');
            optionData.searchElement.setAttribute('aria-selected', 'true');
        }
        this.updateDisplay();
        this.selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }

    toggleDropdown() {
        if (this.dropdownElement.classList.contains('show')) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        document.querySelectorAll('.search-select-dropdown.show').forEach(dropdown => {
            if (dropdown !== this.dropdownElement) {
                dropdown.classList.remove('show');
                const display = dropdown.previousElementSibling;
                if (display && display.classList.contains('search-select-display')) {
                    display.classList.remove('open');
                    display.setAttribute('aria-expanded', 'false');
                }
            }
        });

        this.dropdownElement.classList.add('show');
        this.displayElement.classList.add('open');
        this.displayElement.setAttribute('aria-expanded', 'true');
        this.searchInput.focus();
        this.resetHighlight();
        this.scrollToHighlightedOption();
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('show');
        this.displayElement.classList.remove('open');
        this.displayElement.setAttribute('aria-expanded', 'false');
        this.searchInput.value = '';
        this.filterOptions('');
        this.resetHighlight();
        this.displayElement.focus();
    }

    filterOptions(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        let firstVisibleIndex = -1;

        this.options.forEach((optionData, index) => {
            const isMatch = optionData.label.toLowerCase().includes(lowerCaseSearchTerm);
            optionData.hidden = !isMatch;
            if (optionData.searchElement) {
                optionData.searchElement.classList.toggle('hidden', !isMatch);
            }
            if (isMatch && firstVisibleIndex === -1 && !optionData.disabled) {
                firstVisibleIndex = index;
            }
        });

        this.highlightOption(firstVisibleIndex);
    }

    highlightOption(index) {
        const previouslyHighlighted = this.optionsListElement.querySelector('.highlighted');
        if (previouslyHighlighted) {
            previouslyHighlighted.classList.remove('highlighted');
        }

        const visibleOptions = this.options.filter(opt => !opt.hidden && !opt.disabled);
        if (visibleOptions.length === 0) {
            this.highlightedIndex = -1;
            this.displayElement.removeAttribute('aria-activedescendant');
            return;
        }

        let actualIndex = -1;
        if (index !== -1) {
            const targetOption = this.options[index];
            if (targetOption && !targetOption.hidden && !targetOption.disabled) {
                actualIndex = visibleOptions.findIndex(opt => opt === targetOption);
            } else {
                actualIndex = 0;
            }
        }

        if (actualIndex !== -1) {
            const optionToHighlight = visibleOptions[actualIndex];
            if (optionToHighlight && optionToHighlight.searchElement) {
                optionToHighlight.searchElement.classList.add('highlighted');
                this.highlightedIndex = this.options.indexOf(optionToHighlight);
                this.displayElement.setAttribute('aria-activedescendant', optionToHighlight.id);
                this.scrollToHighlightedOption();
            } else {
                this.highlightedIndex = -1;
                this.displayElement.removeAttribute('aria-activedescendant');
            }
        } else {
            this.highlightedIndex = -1;
            this.displayElement.removeAttribute('aria-activedescendant');
        }
    }

    resetHighlight() {
        const previouslyHighlighted = this.optionsListElement.querySelector('.highlighted');
        if (previouslyHighlighted) {
            previouslyHighlighted.classList.remove('highlighted');
        }
        const selectedIndex = this.options.findIndex(opt => opt.selected && !opt.hidden && !opt.disabled);
        this.highlightedIndex = selectedIndex;
        if (selectedIndex !== -1) {
            this.highlightOption(selectedIndex);
        } else {
            this.displayElement.removeAttribute('aria-activedescendant');
        }
    }

    scrollToHighlightedOption() {
        if (this.highlightedIndex === -1) return;
        const highlightedElement = this.options[this.highlightedIndex]?.searchElement;
        if (highlightedElement) {
            const dropdownRect = this.dropdownElement.getBoundingClientRect();
            const optionRect = highlightedElement.getBoundingClientRect();
            if (optionRect.bottom > dropdownRect.bottom) {
                this.dropdownElement.scrollTop += (optionRect.bottom - dropdownRect.bottom);
            } else if (optionRect.top < dropdownRect.top + this.searchContainer.offsetHeight) {
                this.dropdownElement.scrollTop -= (dropdownRect.top + this.searchContainer.offsetHeight - optionRect.top);
            }
        }
    }

    handleKeyboard(event) {
        if (!this.dropdownElement.classList.contains('show')) {
            if ((event.key === 'Enter' || event.key === ' ') && document.activeElement === this.displayElement) {
                event.preventDefault();
                this.openDropdown();
            }
            return;
        }

        const visibleOptions = this.options.filter(opt => !opt.hidden && !opt.disabled);
        if (visibleOptions.length === 0 && event.key !== 'Escape') return;

        let currentHighlightIndexInVisible = -1;
        if (this.highlightedIndex !== -1) {
            currentHighlightIndexInVisible = visibleOptions.findIndex(opt => this.options.indexOf(opt) === this.highlightedIndex);
        }

        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault();
                const nextIndex = (currentHighlightIndexInVisible + 1) % visibleOptions.length;
                this.highlightOption(this.options.indexOf(visibleOptions[nextIndex]));
                break;
            }
            case 'ArrowUp': {
                event.preventDefault();
                const prevIndex = (currentHighlightIndexInVisible - 1 + visibleOptions.length) % visibleOptions.length;
                this.highlightOption(this.options.indexOf(visibleOptions[prevIndex]));
                break;
            }
            case 'Enter':
            case ' ': {
                event.preventDefault();
                if (this.highlightedIndex !== -1) {
                    const selectedOptionData = this.options[this.highlightedIndex];
                    if (selectedOptionData && !selectedOptionData.disabled) {
                        this.selectOption(selectedOptionData);
                        this.closeDropdown();
                    }
                }
                break;
            }
            case 'Escape':
                event.preventDefault();
                this.closeDropdown();
                break;
            case 'Tab':
                this.closeDropdown();
                break;
            case 'Home':
                event.preventDefault();
                if (visibleOptions.length > 0) {
                    this.highlightOption(this.options.indexOf(visibleOptions[0]));
                }
                break;
            case 'End':
                event.preventDefault();
                if (visibleOptions.length > 0) {
                    this.highlightOption(this.options.indexOf(visibleOptions[visibleOptions.length - 1]));
                }
                break;
        }
    }

    addEventListeners() {
        this.displayElement.addEventListener('click', (event) => {
            event.stopPropagation();
            this.toggleDropdown();
        });

        this.displayElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                this.openDropdown();
                if (event.key === 'ArrowDown') {
                    this.highlightOption(this.options.findIndex(opt => !opt.hidden && !opt.disabled));
                } else if (event.key === 'ArrowUp') {
                    const visible = this.options.filter(opt => !opt.hidden && !opt.disabled);
                    this.highlightOption(this.options.indexOf(visible[visible.length - 1]));
                }
            }
        });

        document.addEventListener('click', (event) => {
            if (!this.searchSelectContainer.contains(event.target) && this.dropdownElement.classList.contains('show')) {
                this.closeDropdown();
            }
        });

        this.searchInput.addEventListener('input', () => {
            this.filterOptions(this.searchInput.value);
        });

        this.dropdownElement.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        this.searchSelectContainer.addEventListener('keydown', this.handleKeyboard.bind(this));

        const observer = new MutationObserver(mutations => {
            const optionsChanged = mutations.some(mutation => mutation.type === 'childList');
            const attributeChanged = mutations.some(mutation =>
                mutation.type === 'attributes' &&
                mutation.target.tagName === 'OPTION' &&
                ['selected', 'disabled', 'value', 'label'].includes(mutation.attributeName)
            );
            if (optionsChanged || attributeChanged) {
                this.options = this.getOptionsItems();
                this.selectedOption = this.options.find(option => option.selected);
                this.buildOptions();
                this.updateDisplay();
                if (this.dropdownElement.classList.contains('show')) {
                    this.filterOptions(this.searchInput.value);
                    this.resetHighlight();
                }
            }
        });

        observer.observe(this.selectElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['selected', 'disabled', 'value', 'label']
        });

        this.mutationObserver = observer;
    }

    remove() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        if (this.searchSelectContainer.parentNode) {
            this.searchSelectContainer.parentNode.removeChild(this.searchSelectContainer);
        }
        this.selectElement.classList.remove('search-select-hidden');
        this.selectElement.removeAttribute('tabindex');
        this.selectElement.removeAttribute('aria-hidden');
    }
}
