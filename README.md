# search-select-js

No jQuery required! A lightweight, searchable select box component.

## Features

- Search filtering
- Vanilla JS
- WAI-ARIA compliant
- Mobile-friendly
- Mutation observer

## Usage example

See `dist/example.html`.

## Class Reference

### Installation

```javascript
import { SearchSelect } from 'search-select-js';
```

### Initialization

```javascript
// Create instance
const selectElement = document.querySelector('select');
const searchSelect = new SearchSelect(selectElement);
```

### Methods

- `selectOption(optionData)`: Programmatically selects an option based on provided option data.
  ```javascript
  searchSelect.selectOption({ value: 'value1' });
  ```

- `openDropdown()`: Opens the dropdown menu programmatically.

- `closeDropdown()`: Closes the dropdown menu programmatically.

- `toggleDropdown()`: Toggles the dropdown menu's open/closed state.

- `remove()`: Destroys the SearchSelect instance and restores the original select element.

### Event-handler

The component triggers the original select element's `change` event when options are selected:

```javascript
selectElement.addEventListener('change', (event) => {
  console.log('Selected value:', event.target.value);
});
```

## License

MIT