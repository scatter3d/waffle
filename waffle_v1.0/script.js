

// Define the grid dimensions
let numRows = 8;
let numCols = 12;
const gridContainer = document.querySelector(".grid-container");

function buildGrid(numRows, numCols) {

  // Create the grid
  for (let row = 0; row < numRows; row++) {
    // Create a row element
    const rowElement = document.createElement("div");
    rowElement.classList.add("grid-row");

    // Create the cells for the row
    for (let col = 0; col < numCols; col++) {
      // Create a cell element
      const cellElement = document.createElement("div");
      cellElement.classList.add("grid-cell");

      // Set the cell ID
      const cellId = String.fromCharCode(row + 65) + (col + 1);
      cellElement.dataset.cellId = cellId;

      // Create the content elements for the cell
      const labelElement = document.createElement("div");
      labelElement.classList.add("label");
      labelElement.textContent = cellId;

      const componentsElement = document.createElement("div");
      componentsElement.classList.add("components");

      const bufferElement = document.createElement("div");
      bufferElement.classList.add("buffers");

      // Add the content elements to the cell
      cellElement.appendChild(labelElement);
      cellElement.appendChild(componentsElement);
      cellElement.appendChild(bufferElement);

      // Add the cell to the row
      rowElement.appendChild(cellElement);
    }

    // Add the row to the grid container
    gridContainer.appendChild(rowElement);

  }
}

buildGrid(numRows,numCols);

const rebuildButton = document.querySelector("#rebuild-button");
rebuildButton.addEventListener("click", () => { 
  const rows_input = document.querySelector("#rows-input");
  const cols_input = document.querySelector("#cols-input");
  
  gridContainer.innerHTML = "";
  addedComponents = {};

  // Get all added component list items
  const addedComponentListItems = addedComponentsList.querySelectorAll("li");

  // Loop through each list item and remove it
  addedComponentListItems.forEach((item) => {
    item.remove();
  });

  buildGrid(rows_input.value,cols_input.value);
  
  // Add event listeners to the new cells
  addCellEventListeners();

});


// Get the component select element
const componentSelect = document.querySelector("#component-select");

// Get the buffer select element
const bufferSelect = document.querySelector("#buffer-select");


// Get the add component form element
const addComponentForm = document.querySelector("#add-component-form");

// Get the added components list element
const addedComponentsList = document.querySelector("#added-components-list");

// Define the added components object
let addedComponents = {};

// Define the highlighted cells array
let highlightedCells = [];

// Define the selected cells array
let selectedCells = [];

// Define the start and end cell elements
let startCell = null;
let endCell = null;

function addCellEventListeners() {
  const cells = document.querySelectorAll(".grid-cell");
  cells.forEach((cell) => {
    cell.addEventListener("mousedown", () => {
      // If there are already two cells selected, reset the selection
      if (selectedCells.length >= 2) {
        selectedCells.forEach((cell) => {
          cell.classList.remove("highlighted");
        });
        selectedCells = [];
        highlightedCells = [];
        startCell = null;
        endCell = null;
      }

      // Add the current cell to the selected cells array
      selectedCells.push(cell);
      cell.classList.add("highlighted");

      // If two cells have been selected, highlight the cells in the rectangle they define
      if (selectedCells.length === 2) {
        startCell = selectedCells[0];
        endCell = selectedCells[1];

        highlightCells(startCell, endCell);
      }
    });

    cell.addEventListener("dblclick", () => {
      selectedCells.forEach((cell) => {
        cell.classList.remove("highlighted");
      });
      selectedCells = [];
      highlightedCells.forEach((cell) => {
        cell.classList.remove("highlighted");
      });
      highlightedCells = [];
      startCell = null;
      endCell = null;
    });
  });
}

// Call the function initially
addCellEventListeners();

function highlightCells(startCell, endCell) {
  // Remove the previous highlighted cells
  highlightedCells.forEach((cell) => {
    cell.classList.remove("highlighted");
  });
  highlightedCells = [];

  // Define the row and column indexes of start and end cells
  const startCellId = startCell.dataset.cellId;
  const endCellId = endCell.dataset.cellId;
  const startRowIndex = parseInt(startCellId.substring(1)) - 1;
  const startColIndex = startCellId.charCodeAt(0) - 65;
  const endRowIndex = parseInt(endCellId.substring(1)) - 1;
  const endColIndex = endCellId.charCodeAt(0) - 65;

  // Loop through each cell and highlight it if it falls within the selected rectangle
  for (let row = Math.min(startRowIndex, endRowIndex); row <= Math.max(startRowIndex, endRowIndex); row++) {
    for (let col = Math.min(startColIndex, endColIndex); col <= Math.max(startColIndex, endColIndex); col++) {
      const cellId = String.fromCharCode(col + 65) + (row + 1);
      const cell = gridContainer.querySelector(`[data-cell-id='${cellId}']`);
      cell.classList.add("highlighted");
      selectedCells.push(cell);
      highlightedCells.push(cell);

    }
  }

}


// Get the add component button
const addComponentButton = document.querySelector("input[type='submit'][value='Add Component']");
let componentColors = ['#C2F0C2', '#FFF6CC', '#FFE9AF', '#FFD1D1', '#E6B8AF', '#E2B4E7', ];
const assignedColors = {}

// Add event listener to add component button
addComponentButton.addEventListener("click", (event) => {
  event.preventDefault();

  // Get the selected component
  const selectedComponent = componentSelect.value;

  // Get the min and max values
  const minValue = parseFloat(document.querySelector("#min-value-input").value);
  const maxValue = parseFloat(document.querySelector("#max-value-input").value);

  // Get the gradient direction
  const gradientDirection = document.querySelector("#gradient-direction-select").value;

  // Get the highlighted cells
  const highlightedCells = document.querySelectorAll(".highlighted");
  const cellIds = Array.from(highlightedCells).map((cell) => cell.dataset.cellId);

  const comp_values = gradientCalc(minValue, maxValue, gradientDirection, cellIds)

  // Loop through each highlighted cell and add the component to it
  for (let i = 0; i < highlightedCells.length; i++) {
    const cellElement = highlightedCells[i];

    // Get the cell ID
    const cellId = cellElement.dataset.cellId;

    // Check if the added components object already has an entry for the cell ID
    if (!addedComponents[cellId]) {
      addedComponents[cellId] = {};
    }

    // if component already exists, remove it
    if (addedComponents[cellId][selectedComponent]) {
      const cellElement = document.querySelector(`[data-cell-id='${cellId}']`);
      const componentElement = cellElement.querySelector(`[data-component-name='${selectedComponent}']`);
      componentElement.remove();
    }

    const compValue = comp_values[cellId];
    // Assign a color to the added component
    let colorID;
    if (assignedColors[selectedComponent] && Object.keys(assignedColors[selectedComponent]).length > 0) {
      colorID = assignedColors[selectedComponent];
    } else {
      colorID = componentColors.shift();
      componentColors.push(colorID);
      assignedColors[selectedComponent] = colorID;
    }
    
    // Add the component to the added components object
    const units = (chem_list.find(obj => obj.Component === selectedComponent)).Units

    addedComponents[cellId][selectedComponent] = {
      compName: selectedComponent,
      compValue: compValue,
      units: units,
      colorIndex: colorID
    };

    // Add the component to the cell
    const componentElement = document.createElement("div");
    componentElement.classList.add("component");
    componentElement.dataset.componentName = selectedComponent;
    //componentElement.dataset.colorIndex = colorIndex;
    componentElement.style.backgroundColor = colorID;
    componentElement.textContent = selectedComponent + " (" + compValue + " " + units +")";
    cellElement.querySelector(".components").appendChild(componentElement);
  }

  // Add the component to the added components list
  const existingComponentListItem = addedComponentsList.querySelector(`li[data-selected-component="${selectedComponent}"]`);
  if (!existingComponentListItem) {
    const addedComponentListItem = document.createElement("li");
    addedComponentListItem.innerHTML =`<span class="circle" style="background-color:${assignedColors[selectedComponent]}"></span>` + "\t" + selectedComponent + '\t\t'+ '<button class="delete-component-button">Delete</button>';
    addedComponentListItem.dataset.selectedComponent = selectedComponent; 
    addedComponentsList.appendChild(addedComponentListItem);
  }

  // Reset the form
  addComponentForm.reset();
});

addedComponentsList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-component-button")) {
    // Get the list item element containing the delete button
    const listItem = event.target.parentNode;

    // Get the component name from the data attribute
    const componentName = listItem.dataset.selectedComponent;

    // Remove the component from addedComponents and from all cells that have it
    for (const cellId in addedComponents) {
      if (addedComponents[cellId][componentName]) {
        // Remove the component from the cell's DOM
        const cellElement = document.querySelector(`[data-cell-id='${cellId}']`);
        const componentElement = cellElement.querySelector(`[data-component-name='${componentName}']`);
        componentElement.remove();

        // Remove the component from addedComponents
        delete addedComponents[cellId][componentName];
        delete assignedColors[(componentName.split("/")[0])];
      }
    }

    // Remove the list item from the added components list
    listItem.remove();
  }
});

addedComponentsList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-buffer-button")) {
    // Get the list item element containing the delete button
    const listItem = event.target.parentNode;

    // Get the component name from the data attribute
    const bufferName = listItem.dataset.selectedBuffer;

    // Remove the component from addedComponents and from all cells that have it
    for (const cellId in addedComponents) {
      if (addedComponents[cellId][bufferName]) {
        // Remove the component from the cell's DOM
        const cellElement = document.querySelector(`[data-cell-id='${cellId}']`);
        const componentElement = cellElement.querySelector(`[data-buffer-name='${bufferName}']`);
        componentElement.remove();

        // Remove the component from addedComponents
        delete addedComponents[cellId][bufferName];
      }
    }

    // Remove the list item from the added components list
    listItem.remove();
  }
});


// Get the add pH button
const addPhButton = document.querySelector("input[type='submit'][value='Add Buffer']");

// Add event listener to add pH button
addPhButton.addEventListener("click", (event) => {
  event.preventDefault();

  // Get the highlighted cells
  const highlightedCells = document.querySelectorAll(".highlighted");
  const selectedBuffer = bufferSelect.value;

  // Get the cell IDs and check if they are not empty
  const cellIds = Array.from(highlightedCells).map((cell) => cell.dataset.cellId);
  if (cellIds.length === 0) {
    alert("Please select at least one cell to add pH value to.");
    return;
  }

  // Get the pH value
  const buffer = parseFloat(document.querySelector("#buffer-select").value);
  const bufferValue = parseFloat(document.querySelector("#buffer-value-input").value);
  const minpHValue = parseFloat(document.querySelector("#min-ph-input").value);
  const maxpHValue = parseFloat(document.querySelector("#max-ph-input").value);
  const gradientDirection = document.querySelector("#gradient-direction-select-ph").value;

  const ph_values = gradientCalc(minpHValue, maxpHValue, gradientDirection, cellIds)

  // Loop through each cell and add the pH value to it
  for (let i = 0; i < cellIds.length; i++) {
    const cellId = cellIds[i];
    const cellElement = highlightedCells[i];

    // Check if the added components object already has an entry for the cell ID
    if (!addedComponents[cellId]) {
      addedComponents[cellId] = {};
    }

    // if component already exists, remove it
    // Remove any existing buffer from the cell
    const existingBuffers = cellElement.querySelectorAll(".buffer");
    existingBuffers.forEach((bufferElement) => bufferElement.remove());

    // remove existing buffer from the addedComponents list for the affected cellId
    // if component already exists, remove it
    if (addedComponents[cellId]) {
      const cellElement = document.querySelector(`[data-cell-id='${cellId}']`);
      const bufferElements = cellElement.querySelectorAll("[data-buffer-name]");
      bufferElements.forEach(bufferElement => {
        bufferElement.remove();
      });
      for (const bufferName in addedComponents[cellId]) {
        if (addedComponents[cellId].hasOwnProperty(bufferName) && addedComponents[cellId][bufferName].hasOwnProperty('bufferName')) {
          delete addedComponents[cellId][bufferName];
        }
      }
    }




    const units = (buffer_list.find(obj => obj.Component === selectedBuffer)).Units;
    const pkaList = (buffer_list.find(obj => obj.Component === selectedBuffer)).pka;
    let pDist = 7;
    let pka;
    for (p in pkaList) {
      if (Math.abs(ph_values[cellId]-pkaList[p]) < pDist) {
        
  

        pka = pkaList[p];
        pDist = (Math.abs(ph_values[cellId])-pkaList[p]);
      }
    }

    addedComponents[cellId][selectedBuffer] = {
      bufferName: (selectedBuffer.split("/"))[0],
      bufferConj: (selectedBuffer.split("/"))[1],
      bufferValue: bufferValue,
      units: units,
      pH: ph_values[cellId],
      pKa: pka
    };

    // Add the pH value to the cell
    const bufferElement = document.createElement("div");
    bufferElement.classList.add("buffer");
    bufferElement.dataset.bufferName = selectedBuffer;
    bufferElement.style.backgroundColor = "#c6c5c7";
    bufferElement.textContent = (selectedBuffer.split("/"))[0] + " (" + bufferValue+ " " + units + ") pH: " + ph_values[cellId];
    cellElement.querySelector(".buffers").appendChild(bufferElement);
  }

// Add the buffer to the added components list
  const existingComponentListItem = addedComponentsList.querySelector(`li[data-selected-buffer="${selectedBuffer}"]`);
  if (!existingComponentListItem) {
    const addedComponentListItem = document.createElement("li");
    addedComponentListItem.innerHTML = `<span class="circle" style="background-color: #c6c5c7;"></span>` + "\t" + selectedBuffer + '\t\t'+ '<button class="delete-buffer-button">Delete</button>';
    addedComponentListItem.dataset.selectedBuffer = selectedBuffer; 
    addedComponentsList.appendChild(addedComponentListItem);
  }

  // Remove the added component list item if it's no longer in any cell
  const addedComponentListItems = addedComponentsList.querySelectorAll("li");
  addedComponentListItems.forEach((addedComponentListItem) => {
    const bufferName = addedComponentListItem.dataset.selectedBuffer;
    let found = false;
    for (const cellId in addedComponents) {
      if ((addedComponents[cellId][bufferName]) || (buffer_list.find(obj => obj.Component === bufferName)) == null) {
        found = true;
        break;
      }
    }
    if (!found) {
      addedComponentListItem.remove();
    }
  });

  // Reset the pH input field
  document.querySelector("#min-ph-input").value = "";
});


//
// Exports Data
//
let filename = "grid-data.csv"

function exportToCsv(filename, data) {
  const csvContent = "data:text/csv;charset=utf-8," +
                     data.map(row => row.map(quoteIfNeeded).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for FF
  link.click();
}

function quoteIfNeeded(value) {
  if (/[,"]/.test(value)) {
    // Escape any double quotes by replacing them with two double quotes, and then wrap the value in quotes
    return `"${value.replace(/"/g, '""')}"`;
  } else {
    return value;
  }
}


// Rebuild based on new data sctructure 
const exportButton = document.querySelector("#export-button");
exportButton.addEventListener("click", () => {

  // Create an array to hold the data for each cell
  const data = [["Well", "Buffer", "Conjugate", "[Buffer]", "PH", "PKA"]]; // Header row

  // Define custom sorting function
  function compareWells(a, b) {
    if (a === b) {
      return 0;
    }
    const aMatch = a.match(/^([a-zA-Z]+)(\d+)?$/);
    const bMatch = b.match(/^([a-zA-Z]+)(\d+)?$/);
    if (!aMatch || !bMatch) {
      return a.localeCompare(b);
    }
    const aLetters = aMatch[1];
    const bLetters = bMatch[1];
    const aDigits = aMatch[2] ? parseInt(aMatch[2]) : 0;
    const bDigits = bMatch[2] ? parseInt(bMatch[2]) : 0;
    if (aLetters < bLetters) {
      return -1;
    }
    if (aLetters > bLetters) {
      return 1;
    }
    if (aDigits < bDigits) {
      return -1;
    }
    if (aDigits > bDigits) {
      return 1;
    }
    return compareWells(a.slice(aLetters.length + aDigits.toString().length), b.slice(bLetters.length + bDigits.toString().length));
  }

  // Create a list to hold the rows of data for the CSV file
  const keys = Object.keys(addedComponents);

  // Sort the addedComponents list by well
  keys.sort(compareWells);

  // Iterate over each cell in the sorted addedComponents list
  for (const i of keys) {
    let row = [];
    for (let j in addedComponents[i]) {
      
      if (!addedComponents[i][j]['bufferName']) {
        continue;
      } else {
        row.push(i);
        row.push(addedComponents[i][j]['bufferName']);
        row.push(addedComponents[i][j]['bufferConj']);
        row.push(addedComponents[i][j]['bufferValue'] + ' ' + addedComponents[i][j]['units']);
        row.push(addedComponents[i][j]['pH']);
        row.push(addedComponents[i][j]['pKa']);
        break
      }
    }
    if (!(row[0] === i)) {
      row = [i, " ", " ", " ", " ", " "]
    }

    // Iterate over each component in this cell
    for (const component in addedComponents[i]) {
      if (!(addedComponents[i][component]['bufferName'])) {
        row.push(addedComponents[i][component]['compName']);
        row.push(addedComponents[i][component]['compValue'] + ' ' + addedComponents[i][component]['units']);
      }
    }

    // Check if the row has the same length as the header row
    if (row.length < data[0].length) {
      const emptyValues = new Array(data[0].length - row.length).fill("");
      row = row.concat(emptyValues);
    }

    // Add this row to the rows list
    data.push(row);    
  }

  // Add headers to the header row until its length equals the length of the longest row in the data array
  const maxRowLength = data.reduce((max, row) => Math.max(max, row.length), 0);
  let count = 1;
  while (data[0].length < maxRowLength) {
    data[0].push(`Chem${count}`);
    data[0].push(`[Chem${count}]`);
    count++;
  }
  filename = document.querySelector("#name-input").value + ".csv";
  // Export the data to a csv file
  exportToCsv(filename, data);
});


// calculates linear gradients for hightlighted cells in the chosen direction
function gradientCalc(minValue, maxValue, gradientDirection, selected_cells) {
  // create dictionary to store values cellID:value
  const cellValues = {};
  // get minimum row letter
  const minRowLetter = Math.min(...selected_cells.map(cell => cell.charCodeAt(0))) - 65;
  // assumes row letters start from A
  const selectRows = Math.max(...selected_cells.map(cell => cell.charCodeAt(0) - 64)) - Math.min(...selected_cells.map(cell => cell.charCodeAt(0) - 64)) + 1; 
  // assumes column numbers follow row letters
  const selectCols = Math.max(...selected_cells.map(cell => parseInt(cell.slice(1)))) - Math.min(...selected_cells.map(cell => parseInt(cell.slice(1)))) + 1; 
  let gradientValues;
  if (gradientDirection === 'right') {
    const step = (maxValue - minValue) / (selectCols - 1);
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (minValue + (colIndex * step)).toFixed(2);
        const currentCell = String.fromCharCode(65+minRowLetter + rowIndex) + (colIndex + Math.min(...selected_cells.map(cell => parseInt(cell.slice(1)))));
        return {cell: currentCell, value: currentValue};
      });
    });
  } else if (gradientDirection === 'left') {
    const step = (maxValue - minValue) / (selectCols - 1);
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (minValue + ((selectCols - colIndex - 1) * step)).toFixed(2);
        const currentCell = String.fromCharCode(65+minRowLetter + rowIndex) + (colIndex + Math.min(...selected_cells.map(cell => parseInt(cell.slice(1)))));
        return {cell: currentCell, value: currentValue};
      });
    });
  } else if (gradientDirection === 'up') {
    const step = (maxValue - minValue) / (selectRows - 1);
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (minValue + ((selectRows - rowIndex - 1) * step)).toFixed(2);
        const currentCell = String.fromCharCode(65+minRowLetter + rowIndex) + (colIndex + Math.min(...selected_cells.map(cell => parseInt(cell.slice(1)))));
        return {cell: currentCell, value: currentValue};
      });
    });
  } else if (gradientDirection === 'down') {
    const step = (maxValue - minValue) / (selectRows - 1);
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (minValue + (rowIndex * step)).toFixed(2);
        const currentCell = String.fromCharCode(65+minRowLetter + rowIndex) + (colIndex + Math.min(...selected_cells.map(cell => parseInt(cell.slice(1)))));
        return {cell: currentCell, value: currentValue};
      });
    });
  } else if (gradientDirection === 'step-wise') {
    const totalCells = selectRows * selectCols;
    const step = (maxValue - minValue) / (totalCells - 1);
    let cellCounter = 0;
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (minValue + (cellCounter * step)).toFixed(2);
        const currentCell = String.fromCharCode(65 + minRowLetter + rowIndex) + (colIndex + Math.min(...selected_cells.map(cell => parseInt(cell.slice(1)))));
        cellCounter++;
        return {cell: currentCell, value: currentValue};
      });
    });
  } else if (gradientDirection === 'step-rev') {
    const totalCells = selectRows * selectCols;
    const step = (maxValue - minValue) / (totalCells - 1);
    let cellCounter = 0;
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (maxValue - (cellCounter * step)).toFixed(2);
        const currentCell = String.fromCharCode(65 + minRowLetter + rowIndex) + (colIndex + Math.min(...selected_cells.map(cell => parseInt(cell.slice(1)))));
        cellCounter++;
        return {cell: currentCell, value: currentValue};
      });
    });
  } else if (gradientDirection === 'zig-zag') {
    const totalCells = selectRows * selectCols;
    const step = (maxValue - minValue) / (totalCells - 1);
    let cellCounter = 0;
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (minValue + (cellCounter * step)).toFixed(2);
        const currentCell = String.fromCharCode(65 + minRowLetter + rowIndex) + 
          (rowIndex % 2 === 0 ? colIndex + 1 : selectCols - colIndex);
        cellCounter++;
        return {cell: currentCell, value: currentValue};
      });
    }).flat();
  } else if (gradientDirection === 'zig-rev') {
    const totalCells = selectRows * selectCols;
    const step = (maxValue - minValue) / (totalCells - 1);
    let cellCounter = 0;
    gradientValues = Array.from({length: selectRows}, (_, rowIndex) => {
      return Array.from({length: selectCols}, (_, colIndex) => {
        const currentValue = (maxValue - (cellCounter * step)).toFixed(2);
        const currentCell = String.fromCharCode(65 + minRowLetter + rowIndex) + 
          (rowIndex % 2 === 0 ? colIndex + 1 : selectCols - colIndex);
        cellCounter++;
        return {cell: currentCell, value: currentValue};
      });
    }).flat();
  } else {
    throw new Error(`Invalid gradientDirection "${gradientDirection}"`);
  }
  // convert gradientValues to cellValues dictionary
  gradientValues.flat().forEach(({cell, value}) => cellValues[cell] = value);
  // return dictionary of assigned values
  return cellValues;
}


function filterOptions(selectElement, inputElement) {
  const filterValue = inputElement.value.toUpperCase();
  const options = selectElement.querySelectorAll("option");
  options.forEach((option) => {
    const text = option.textContent.toUpperCase();
    if (text.indexOf(filterValue) > -1) {
      option.style.display = "";
    } else {
      option.style.display = "none";
    }
  });
}

const addComponentInput = document.querySelector("#component-select");
const addComponentInputFilter = document.querySelector("#component-input-filter");

addComponentInputFilter.addEventListener("keyup", () => {
  filterOptions(addComponentInput, addComponentInputFilter);
});

const addBufferInput = document.querySelector("#buffer-select");
const addBufferInputFilter = document.querySelector("#buffer-input-filter");

addBufferInputFilter.addEventListener("keyup", () => {
  filterOptions(addBufferInput, addBufferInputFilter);
});




//
// DATA
// in JSON format
// used to populated reagent lists
//
const chem_list = [
  {
    "Component": "1,2,4-Butanetriol",
    "Units": "%v/v"
  },
  {
    "Component": "1,2-Propanediol",
    "Units": "%v/v"
  },
  {
    "Component": "1,4- Dioxane",
    "Units": "%v/v"
  },
  {
    "Component": "1,4-butanediol",
    "Units": "%v/v"
  },
  {
    "Component": "1,6- Hexanediol",
    "Units": "mM"
  },
  {
    "Component": "10x MORPH-ALCOHOL",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-AMINO",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER1-IMID",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER1-MES",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER2-HEPES",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER2-MOPS",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER3-BICINE",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER3-TRIZMA",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER6-AMPD",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-BUFFER6-Gly-Gly",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-CARBOXYLIC",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-Divalent",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-ETHYLENEGLYCOL",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-Halide",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-MONOSACCHARIDE",
    "Units": "%v/v"
  },
  {
    "Component": "10x MORPH-NPS",
    "Units": "%v/v"
  },
  {
    "Component": "1-propanol",
    "Units": "%v/v"
  },
  {
    "Component": "2,5-Hexanediol",
    "Units": "%v/v"
  },
  {
    "Component": "2-Ethoxyethanol",
    "Units": "%v/v"
  },
  {
    "Component": "2-propanol",
    "Units": "%v/v"
  },
  {
    "Component": "2X MORPH-PPT1",
    "Units": "%v/v"
  },
  {
    "Component": "2x MORPH-PPT2",
    "Units": "%v/v"
  },
  {
    "Component": "2x MORPH-PPT3",
    "Units": "%v/v"
  },
  {
    "Component": "2x MORPH-PPT4",
    "Units": "%v/v"
  },
  {
    "Component": "acetonitrile",
    "Units": "%v/v"
  },
  {
    "Component": "Alcohol, Reagent",
    "Units": "%v/v"
  },
  {
    "Component": "ammonium acetate",
    "Units": "mM"
  },
  {
    "Component": "ammonium bromide",
    "Units": "%w/v"
  },
  {
    "Component": "ammonium chloride",
    "Units": "mM"
  },
  {
    "Component": "ammonium citrate dibasic",
    "Units": "mM"
  },
  {
    "Component": "ammonium citrate tribasic",
    "Units": "mM"
  },
  {
    "Component": "ammonium fluoride",
    "Units": "mM"
  },
  {
    "Component": "ammonium formate",
    "Units": "mM"
  },
  {
    "Component": "ammonium iodide",
    "Units": "mM"
  },
  {
    "Component": "ammonium nitrate",
    "Units": "mM"
  },
  {
    "Component": "ammonium phosphate dibasic",
    "Units": "mM"
  },
  {
    "Component": "ammonium phosphate monobasic",
    "Units": "mM"
  },
  {
    "Component": "ammonium sulfate",
    "Units": "mM"
  },
  {
    "Component": "ammonium sulfite",
    "Units": "mM"
  },
  {
    "Component": "ammonium tartrate dibasic",
    "Units": "mM"
  },
  {
    "Component": "Betaine Monohydrate",
    "Units": "mM"
  },
  {
    "Component": "beta-mercaptoethanol",
    "Units": "%v/v"
  },
  {
    "Component": "butanediol -2,3",
    "Units": "%v/v"
  },
  {
    "Component": "butanol -2",
    "Units": "%v/v"
  },
  {
    "Component": "cadmium chloride",
    "Units": "mM"
  },
  {
    "Component": "cadmium sulfate",
    "Units": "mM"
  },
  {
    "Component": "calcium acetate",
    "Units": "mM"
  },
  {
    "Component": "calcium chloride",
    "Units": "mM"
  },
  {
    "Component": "cesium chloride",
    "Units": "mM"
  },
  {
    "Component": "cesium sulfate",
    "Units": "mM"
  },
  {
    "Component": "citric acid",
    "Units": "%v/v"
  },
  {
    "Component": "Cobalt chloride",
    "Units": "mM"
  },
  {
    "Component": "cobalt(iii) chloride| hexammine",
    "Units": "mM"
  },
  {
    "Component": "ctab",
    "Units": "mM"
  },
  {
    "Component": "cupric chloride",
    "Units": "mM"
  },
  {
    "Component": "cupric sulfate",
    "Units": "mM"
  },
  {
    "Component": "cymal-3",
    "Units": "%w/v"
  },
  {
    "Component": "dextran sulfate",
    "Units": "%w/v"
  },
  {
    "Component": "DL Malic acid pH 7.0",
    "Units": "mM"
  },
  {
    "Component": "dmf",
    "Units": "%v/v"
  },
  {
    "Component": "dmso",
    "Units": "%v/v"
  },
  {
    "Component": "dodecylnonaglycol",
    "Units": "%v/v"
  },
  {
    "Component": "dtt",
    "Units": "mM"
  },
  {
    "Component": "edta",
    "Units": "mM"
  },
  {
    "Component": "ethyl acetate",
    "Units": "%v/v"
  },
  {
    "Component": "ethyl alcohol 200 proof",
    "Units": "%v/v"
  },
  {
    "Component": "ethylene glycol",
    "Units": "%v/v"
  },
  {
    "Component": "gly gly gly",
    "Units": "mM"
  },
  {
    "Component": "glycerol",
    "Units": "%v/v"
  },
  {
    "Component": "Guanidine HCl",
    "Units": "mM"
  },
  {
    "Component": "iron iii chloride",
    "Units": "mM"
  },
  {
    "Component": "isobutanol",
    "Units": "%v/v"
  },
  {
    "Component": "isopropanol",
    "Units": "%v/v"
  },
  {
    "Component": "jeffamine ed-2003",
    "Units": "%v/v"
  },
  {
    "Component": "jeffamine ed-2003 pH7",
    "Units": "%v/v"
  },
  {
    "Component": "jeffamine m-600",
    "Units": "%v/v"
  },
  {
    "Component": "Jeffamine M-600 pH 7.0",
    "Units": "mM"
  },
  {
    "Component": "jeffamine m-600 pH7",
    "Units": "%v/v"
  },
  {
    "Component": "K/Na mono/di phosphate",
    "Units": "mM"
  },
  {
    "Component": "ldao",
    "Units": "%w/v"
  },
  {
    "Component": "lithium acetate",
    "Units": "mM"
  },
  {
    "Component": "lithium chloride",
    "Units": "mM"
  },
  {
    "Component": "lithium citrate",
    "Units": "mM"
  },
  {
    "Component": "lithium nitrate",
    "Units": "mM"
  },
  {
    "Component": "lithium sulfate",
    "Units": "mM"
  },
  {
    "Component": "L-Proline",
    "Units": "mM"
  },
  {
    "Component": "magnesium acetate",
    "Units": "mM"
  },
  {
    "Component": "magnesium bromide",
    "Units": "mM"
  },
  {
    "Component": "magnesium chloride",
    "Units": "mM"
  },
  {
    "Component": "magnesium formate",
    "Units": "mM"
  },
  {
    "Component": "magnesium formate (pH 5.9)",
    "Units": "mM"
  },
  {
    "Component": "magnesium nitrate",
    "Units": "mM"
  },
  {
    "Component": "magnesium sulfate",
    "Units": "mM"
  },
  {
    "Component": "malic acid -dl disodium salt",
    "Units": "mM"
  },
  {
    "Component": "malic acid -dl disodium salt/sodium hydroxide pH 7.0",
    "Units": "mM"
  },
  {
    "Component": "malonic acid",
    "Units": "mM"
  },
  {
    "Component": "maltose -d-(+)",
    "Units": "%w/v"
  },
  {
    "Component": "manganese chloride",
    "Units": "mM"
  },
  {
    "Component": "methanol",
    "Units": "%v/v"
  },
  {
    "Component": "MIB Buffer pH 4",
    "Units": "mM"
  },
  {
    "Component": "MIB Buffer pH 9",
    "Units": "mM"
  },
  {
    "Component": "MMT Buffer pH 4",
    "Units": "mM"
  },
  {
    "Component": "MMT Buffer pH 9",
    "Units": "mM"
  },
  {
    "Component": "mpd",
    "Units": "%v/v"
  },
  {
    "Component": "nad",
    "Units": "mM"
  },
  {
    "Component": "n-Dodecyl-beta-D-maltoside",
    "Units": "%w/v"
  },
  {
    "Component": "Nickel ii chloride",
    "Units": "mM"
  },
  {
    "Component": "PCB Buffer pH 4",
    "Units": "mM"
  },
  {
    "Component": "PCB Buffer pH 9",
    "Units": "mM"
  },
  {
    "Component": "peg 1000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 10000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 12,000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 1500",
    "Units": "%w/v"
  },
  {
    "Component": "peg 200",
    "Units": "%v/v"
  },
  {
    "Component": "peg 2000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 2000 dme",
    "Units": "%w/v"
  },
  {
    "Component": "peg 2000 mme",
    "Units": "%w/v"
  },
  {
    "Component": "peg 20000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 250 dme",
    "Units": "%v/v"
  },
  {
    "Component": "peg 300",
    "Units": "%v/v"
  },
  {
    "Component": "peg 3000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 3350",
    "Units": "%w/v"
  },
  {
    "Component": "peg 350 mme",
    "Units": "%v/v"
  },
  {
    "Component": "peg 400",
    "Units": "%v/v"
  },
  {
    "Component": "peg 4000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 500 mme",
    "Units": "%w/v"
  },
  {
    "Component": "peg 5000 mme",
    "Units": "%w/v"
  },
  {
    "Component": "peg 550 mme",
    "Units": "%v/v"
  },
  {
    "Component": "peg 600",
    "Units": "%v/v"
  },
  {
    "Component": "peg 6000",
    "Units": "%w/v"
  },
  {
    "Component": "peg 750 mme",
    "Units": "%v/v"
  },
  {
    "Component": "peg 8000",
    "Units": "%w/v"
  },
  {
    "Component": "pei",
    "Units": "%w/v"
  },
  {
    "Component": "pentaerythritol ethoxylate 15/4",
    "Units": "%v/v"
  },
  {
    "Component": "pentaerythritol ethoxylate 3/4",
    "Units": "%v/v"
  },
  {
    "Component": "pentaerythritol propoxylate 17/8",
    "Units": "%v/v"
  },
  {
    "Component": "pentaerythritol propoxylate 5/4",
    "Units": "%v/v"
  },
  {
    "Component": "phenol",
    "Units": "mM"
  },
  {
    "Component": "pipes",
    "Units": "mM"
  },
  {
    "Component": "poly(vinyl alcohol)",
    "Units": "%v/v"
  },
  {
    "Component": "Polyacrylic acid 5100",
    "Units": "%w/v"
  },
  {
    "Component": "Polyvinylpyrrolidone K15",
    "Units": "%w/v"
  },
  {
    "Component": "potassium acetate",
    "Units": "mM"
  },
  {
    "Component": "potassium bromide",
    "Units": "mM"
  },
  {
    "Component": "potassium chloride",
    "Units": "mM"
  },
  {
    "Component": "potassium citrate tribasic",
    "Units": "mM"
  },
  {
    "Component": "potassium fluoride",
    "Units": "mM"
  },
  {
    "Component": "potassium formate",
    "Units": "mM"
  },
  {
    "Component": "potassium iodide",
    "Units": "mM"
  },
  {
    "Component": "potassium nitrate",
    "Units": "mM"
  },
  {
    "Component": "potassium phosphate dibasic",
    "Units": "mM"
  },
  {
    "Component": "potassium phosphate monobasic",
    "Units": "mM"
  },
  {
    "Component": "Potassium phosphate monobasic/Sodium phosphate dibasic",
    "Units": "mM"
  },
  {
    "Component": "potassium sodium tartrate",
    "Units": "mM"
  },
  {
    "Component": "potassium sulfate",
    "Units": "mM"
  },
  {
    "Component": "potassium tartrate",
    "Units": "mM"
  },
  {
    "Component": "potassium thiocyanate",
    "Units": "mM"
  },
  {
    "Component": "ppg 400",
    "Units": "%v/v"
  },
  {
    "Component": "propanediol -1,3",
    "Units": "%v/v"
  },
  {
    "Component": "propanol -1",
    "Units": "%v/v"
  },
  {
    "Component": "Reagent alcohol",
    "Units": "%v/v"
  },
  {
    "Component": "sodium acetate",
    "Units": "mM"
  },
  {
    "Component": "sodium acetate trihydrate",
    "Units": "mM"
  },
  {
    "Component": "sodium bromide",
    "Units": "mM"
  },
  {
    "Component": "sodium chloride",
    "Units": "mM"
  },
  {
    "Component": "sodium citrate tribasic",
    "Units": "mM"
  },
  {
    "Component": "sodium fluoride",
    "Units": "mM"
  },
  {
    "Component": "sodium formate",
    "Units": "mM"
  },
  {
    "Component": "sodium iodide",
    "Units": "mM"
  },
  {
    "Component": "sodium malonate dibasic",
    "Units": "mM"
  },
  {
    "Component": "sodium malonate dibasic pH 7.0",
    "Units": "mM"
  },
  {
    "Component": "sodium nitrate",
    "Units": "mM"
  },
  {
    "Component": "sodium phosphate dibasic",
    "Units": "mM"
  },
  {
    "Component": "sodium phosphate monobasic",
    "Units": "mM"
  },
  {
    "Component": "sodium pyruvate",
    "Units": "mM"
  },
  {
    "Component": "sodium selenate",
    "Units": "mM"
  },
  {
    "Component": "sodium succinate dibasic",
    "Units": "mM"
  },
  {
    "Component": "sodium sulfate",
    "Units": "mM"
  },
  {
    "Component": "sodium tartrate dibasic",
    "Units": "mM"
  },
  {
    "Component": "sodium thiocyanate",
    "Units": "mM"
  },
  {
    "Component": "sodium/potassium monobasic/dibasic phosphate (1:1:1:1 molar ratio)",
    "Units": "mM"
  },
  {
    "Component": "spermidine",
    "Units": "mM"
  },
  {
    "Component": "spermine",
    "Units": "mM"
  },
  {
    "Component": "spg buffer",
    "Units": "mM"
  },
  {
    "Component": "SPG Buffer pH 4",
    "Units": "mM"
  },
  {
    "Component": "SPG Buffer pH 9",
    "Units": "mM"
  },
  {
    "Component": "strontium chloride",
    "Units": "mM"
  },
  {
    "Component": "Succinic acid pH 7.0",
    "Units": "mM"
  },
  {
    "Component": "sucrose",
    "Units": "mM"
  },
  {
    "Component": "Tacsimate",
    "Units": "%v/v"
  },
  {
    "Component": "taurine",
    "Units": "mM"
  },
  {
    "Component": "trimethylamine hydrochloride",
    "Units": "mM"
  },
  {
    "Component": "trimethylamine n-oxide",
    "Units": "mM"
  },
  {
    "Component": "tris base",
    "Units": "mM"
  },
  {
    "Component": "Triton X-100",
    "Units": "%v/v"
  },
  {
    "Component": "water (de-ionized| filtered)",
    "Units": "mM"
  },
  {
    "Component": "xylitol",
    "Units": "%w/v"
  },
  {
    "Component": "yttrium chloride",
    "Units": "mM"
  },
  {
    "Component": "zinc acetate",
    "Units": "mM"
  },
  {
    "Component": "zinc bromide",
    "Units": "mM"
  },
  {
    "Component": "zinc chloride",
    "Units": "mM"
  },
  {
    "Component": "zinc sulfate",
    "Units": "mM"
  }
]

const buffer_list = [
  {
    "Component": "ada/sodium hydroxide",
    "pka": [6.59],
    "Units": "mM"
  },
  {
    "Component": "ammonium acetate/acetic acid",
    "pka": [4.8, 9.2],
    "Units": "mM"
  },
  {
    "Component": "ammonium acetate/hydrochloric acid",
    "pka": [4.8, 9.2],
    "Units": "mM"
  },
  {
    "Component": "ammonium chloride/sodium hydroxide",
    "pka": [9.25],
    "Units": "mM"
  },
  {
    "Component": "ammonium citrate dibasic/citric acid",
    "pka": [3.14, 6.39],
    "Units": "mM"
  },
  {
    "Component": "ammonium citrate tribasic/ammonium hydroxide",
    "pka": [5.4],
    "Units": "mM"
  },
  {
    "Component": "ammonium citrate tribasic/citric acid",
    "pka": [3.13, 4.76, 5.4, 6.4],
    "Units": "mM"
  },
  {
    "Component": "ammonium formate/sodium hydroxide",
    "pka": [5.3],
    "Units": "mM"
  },
  {
    "Component": "ammonium nitrate/sodium hydroxide",
    "pka": [4.1],
    "Units": "mM"
  },
  {
    "Component": "ammonium tartrate dibasic/hydrochloric acid",
    "pka": [6],
    "Units": "mM"
  },
  {
    "Component": "bicine/sodium hydroxide",
    "pka": [8.3],
    "Units": "mM"
  },
  {
    "Component": "Bis-Tris Propane/Hydrochloric acid",
    "pka": [6.8],
    "Units": "mM"
  },
  {
    "Component": "Bis-Tris/Hydrochloric acid",
    "pka": [6.5],
    "Units": "mM"
  },
  {
    "Component": "caps/sodium hydroxide",
    "pka": [10.4],
    "Units": "mM"
  },
  {
    "Component": "capso/sodium hydroxide",
    "pka": [9.74],
    "Units": "mM"
  },
  {
    "Component": "ches/sodium hydroxide",
    "pka": [9.55],
    "Units": "mM"
  },
  {
    "Component": "citric acid/sodium hydroxide",
    "pka": [3.13],
    "Units": "mM"
  },
  {
    "Component": "DL-Malic acid disodium salt/sodium hydroxide",
    "pka": [7],
    "Units": "mM"
  },
  {
    "Component": "gly gly/sodium hydroxide",
    "pka": [8.2],
    "Units": "mM"
  },
  {
    "Component": "glycine/sodium hydroxide",
    "pka": [9.6],
    "Units": "mM"
  },
  {
    "Component": "hepes free acid/sodium hydroxide",
    "pka": [7.48],
    "Units": "mM"
  },
  {
    "Component": "hepes sodium salt/hydrochloric acid",
    "pka": [7.48],
    "Units": "mM"
  },
  {
    "Component": "Histadine/Sodium hydroxide",
    "pka": [6],
    "Units": "mM"
  },
  {
    "Component": "imidazole/hydrochloric acid",
    "pka": [6.95],
    "Units": "mM"
  },
  {
    "Component": "Imidazole/malic acid",
    "pka": [6.95],
    "Units": "mM"
  },
  {
    "Component": "Imidazole/Sodium malonate",
    "pka": [6.95],
    "Units": "mM"
  },
  {
    "Component": "lithium acetate/hydrochloric acid",
    "pka": [4.65],
    "Units": "mM"
  },
  {
    "Component": "magnesium formate/hydrochloric acid",
    "pka": [3.75],
    "Units": "mM"
  },
  {
    "Component": "maleic acid/sodium hydroxide",
    "pka": [1.83, 6.07],
    "Units": "mM"
  },
  {
    "Component": "malic acid -dl disodium salt/sodium hydroxide",
    "pka": [7],
    "Units": "mM"
  },
  {
    "Component": "malonic acid/sodium hydroxide",
    "pka": [2.83, 5.69],
    "Units": "mM"
  },
  {
    "Component": "MES Potassium salt/Sodium hydroxide",
    "pka": [6],
    "Units": "mM"
  },
  {
    "Component": "mes sodium salt/hydrochloric acid",
    "pka": [6.1],
    "Units": "mM"
  },
  {
    "Component": "Mes/bistris",
    "pka": [6],
    "Units": "mM"
  },
  {
    "Component": "mes/sodium hydroxide",
    "pka": [6.1],
    "Units": "mM"
  },
  {
    "Component": "mops/sodium hydroxide",
    "pka": [7.2],
    "Units": "mM"
  },
  {
    "Component": "MOPSO/Sodium hydroxide",
    "pka": [7],
    "Units": "mM"
  },
  {
    "Component": "pipes/sodium hydroxide",
    "pka": [6.76],
    "Units": "mM"
  },
  {
    "Component": "potassium citrate tribasic/sodium hydroxide",
    "pka": [3.13],
    "Units": "mM"
  },
  {
    "Component": "potassium citrate/sodium hydroxide",
    "pka": [3.13],
    "Units": "mM"
  },
  {
    "Component": "potassium formate/sodium hydroxide",
    "pka": [3.75],
    "Units": "mM"
  },
  {
    "Component": "potassium phosphate dibasic/potassium phosphate monobasic",
    "pka": [6.4, 7.2],
    "Units": "mM"
  },
  {
    "Component": "potassium phosphate dibasic/sodium phosphate monobasic",
    "pka": [6.4, 7.2],
    "Units": "mM"
  },
  {
    "Component": "Potassium phosphate monobasic/Sodium phosphate dibasic",
    "pka": [7.22],
    "Units": "mM"
  },
  {
    "Component": "sodium acetate/acetic acid",
    "pka": [4.76],
    "Units": "mM"
  },
  {
    "Component": "sodium acetate/hydrochloric acid",
    "pka": [4.75],
    "Units": "mM"
  },
  {
    "Component": "sodium cacodylate/hydrochloric acid",
    "pka": [6.27],
    "Units": "mM"
  },
  {
    "Component": "sodium citrate tribasic/citric acid",
    "pka": [4.76],
    "Units": "mM"
  },
  {
    "Component": "sodium citrate tribasic/hydrochloric acid",
    "pka": [4.76],
    "Units": "mM"
  },
  {
    "Component": "sodium formate/hydrochloric acid",
    "pka": [3.87],
    "Units": "mM"
  },
  {
    "Component": "sodium lactate/hydrochloric acid",
    "pka": [3.86],
    "Units": "mM"
  },
  {
    "Component": "sodium malonate dibasic/hydrochloric acid",
    "pka": [2.8, 5.7],
    "Units": "mM"
  },
  {
    "Component": "sodium phosphate dibasic/citric acid",
    "pka": [6.82],
    "Units": "mM"
  },
  {
    "Component": "Sodium phosphate dibasic/potassium phosphate monobasic",
    "pka": [7.2],
    "Units": "mM"
  },
  {
    "Component": "sodium phosphate monobasic/potassium phosphate dibasic",
    "pka": [7.22],
    "Units": "mM"
  },
  {
    "Component": "sodium proprionate/hydrochloric acid",
    "pka": [4.75],
    "Units": "mM"
  },
  {
    "Component": "sodium succinate dibasic/hydrochloric acid",
    "pka": [4.21, 5.64],
    "Units": "mM"
  },
  {
    "Component": "sodium tartrate dibasic/hydrochloric acid",
    "pka": [4.37],
    "Units": "mM"
  },
  {
    "Component": "sodium tartrate/hydrochloric acid",
    "pka": [4.37],
    "Units": "mM"
  },
  {
    "Component": "succinic acid/sodium hydroxide",
    "pka": [4.21, 5.64],
    "Units": "mM"
  },
  {
    "Component": "taps/sodium hydroxide",
    "pka": [8.44],
    "Units": "mM"
  },
  {
    "Component": "tris base/acetic acid",
    "pka": [4.75, 8.1],
    "Units": "mM"
  },
  {
    "Component": "tris base/hydrochloric acid",
    "pka": [8.3],
    "Units": "mM"
  },
  {
    "Component": "Tris HCl/Sodium hydroxide",
    "pka": [8.3],
    "Units": "mM"
  }
]


// Populate the component select element
chem_list.forEach((component) => {
  const optionElement = document.createElement("option");
  optionElement.value = component.Component;
  optionElement.textContent = component.Component + " (" + component.Units + ")";
  componentSelect.appendChild(optionElement);
});

buffer_list.forEach((buffer) => {
  const optionElement = document.createElement("option");
  optionElement.value = buffer.Component;
  optionElement.textContent = buffer.Component + " (" + buffer.Units + ") | pKa: " + buffer.pka;
  bufferSelect.appendChild(optionElement);
});
