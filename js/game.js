document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let selectedColor = 'red';
    let countryColors = {};
    const mapContainer = document.getElementById('map-container');
    const mapImage = document.getElementById('map-image');
    
    // Game state variables
    let gameActive = false;
    let gameColors = [];
    let currentRound = 0;
    let currentTurnIndex = 0;
    let turnOrder = [];
    let turnsRemaining = 0;
    let turnHistory = [];
    
    // DOM elements
    const startGameBtn = document.getElementById('start-game-btn');
    const nextTurnBtn = document.getElementById('next-turn-btn');
    const nextRoundBtn = document.getElementById('next-round-btn');
    const resetGameBtn = document.getElementById('reset-game-btn');
    const gameStatusDiv = document.querySelector('.game-status');
    const currentTurnColorSpan = document.getElementById('current-turn-color');
    const currentTurnIndicator = document.getElementById('current-turn-indicator');
    const currentRoundSpan = document.getElementById('current-round');
    const turnsRemainingSpan = document.getElementById('turns-remaining');
    const turnHistoryList = document.getElementById('turn-history-list');
    
    // Define all available colors
    const allColors = ['red', 'blue', 'yellow', 'brown', 'green', 'purple', 'white', 'black'];
    
    // Define spheres and their zones
    const spheres = [
        {
            name: "Canada",
            zones: ['alaska-1-oil', 'canada-1-card', 'canada-1-oil', 'canada-2-capital']
        },
        {
            name: "US",
            zones: ['us-3', 'us-2-capital', 'us-2-oil', 'us-1-card', 'us_ne-3']
        },
        {
            name: "Mexico",
            zones: ['mx-3-capital-oil', 'mx-1-card', 'cuba-1-card', 'colombia-1', 'venezuala-1-oil']
        },
        {
            name: "South America",
            zones: ['brazil-4-oil-capital', 'chile-1', 'argentina-1-card']
        },
        {
            name: "Northern Europe",
            zones: ['iceland-1-card', 'uk-4-capital', 'norway-2-oil', 'sweden-1']
        },
        {
            name: "Western Europe",
            zones: ['spain-2-card', 'france-3', 'germany-4-capital', 'austria-2-card', 'italy-2']
        },
        {
            name: "Eastern Europe",
            zones: ['poland-2', 'ukraine-2', 'balkans-1-card', 'turkey-3-capital']
        },
        {
            name: "Russia",
            zones: ['russia-1', 'russia-4-capital', 'russia-3-oil', 'russia-1-card', 'russia-1-oil']
        },
        {
            name: "Middle East",
            zones: ['middle_east-3-oil-capital', 'middle_east-1-oil', 'middle_east-2-card', 'middle_east-1', 'middle_east-2-oil', 'middle_east-1-card']
        },
        {
            name: "Stans",
            zones: ['kazakhstan-1-capital-oil', 'uzbekistan-1', 'turkmenistan-1-card']
        },
        {
            name: "India",
            zones: ['pakistan-2', 'india-6-capital', 'myanmar-2', 'thailand-1']
        },
        {
            name: "China",
            zones: ['china-1-oil', 'china-5-capital', 'china-1', 'china-1-card', 'china-3']
        },
        {
            name: "Japan",
            zones: ['japan-4-capital', 'korea-3', 'taiwan-2-card']
        },
        {
            name: "Indonesia",
            zones: ['vietnam-2-card', 'philippines-1-card', 'indonesia-2-oil-capital', 'guinea-1-card']
        },
        {
            name: "Australia",
            zones: ['australia-1-oil', 'australia-3-capital', 'nz-1-card']
        },
        {
            name: "Northern Africa",
            zones: ['morocco-1-card', 'algeria-1-oil', 'libya-1-oil', 'egypt-2-capital']
        },
        {
            name: "Western Africa",
            zones: ['liberia-1', 'nigeria-2-oil-capital', 'congo-1-card']
        },
        {
            name: "Southern Africa",
            zones: ['angola-1-oil', 'south_africa-2-capital', 'tanzia-1-card', 'madagascar-1-card', 'ethiopia-1']
        }
    ];
    
    // Initialize DataTable
    const statsTable = $('#stats-table').DataTable({
        paging: false,
        searching: false,
        info: false,
        ordering: false
    });
    
    // Set up color selection
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            colorButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Set the selected color
            selectedColor = this.getAttribute('data-color');
        });
    });
    
    // Select the first color by default
    if (colorButtons.length > 0) {
        colorButtons[0].classList.add('selected');
    }
    
    // Add click event listeners to all areas
    const areas = document.querySelectorAll('#country-map area');
    areas.forEach(area => {
        area.addEventListener('click', function(e) {
            e.preventDefault();
            handleCountryClick(this);
        });
    });
    
    // Create overlays for all countries
    createCountryOverlays();
    
    // Function to create overlays for all countries
    function createCountryOverlays() {
        const areas = document.querySelectorAll('#country-map area');
        
        areas.forEach(area => {
            const id = area.getAttribute('id');
            if (!id) return;
            
            // Create overlay div
            const overlay = document.createElement('div');
            overlay.id = `overlay-${id}`;
            overlay.className = 'country-overlay';
            
            // Position the overlay based on the area coordinates
            const coords = area.getAttribute('coords').split(',');
            const x = parseInt(coords[0]);
            const y = parseInt(coords[1]);
            const width = parseInt(coords[2]) - x;
            const height = parseInt(coords[3]) - y;
            
            overlay.style.left = `${x}px`;
            overlay.style.top = `${y}px`;
            overlay.style.width = `${width}px`;
            overlay.style.height = `${height}px`;
            
            // Add to map container
            mapContainer.appendChild(overlay);
        });
    }
    
    // Function to handle country click
    function handleCountryClick(area) {
        const countryId = area.getAttribute('id');
        
        // Check if we're in a game
        if (gameActive) {
            // In game mode, only allow colors that are part of the game
            if (gameColors.includes(selectedColor)) {
                // Check if the country is already controlled by the selected color
                if (countryColors[countryId] === selectedColor) {
                    // Reset the country control
                    resetCountryControl(countryId);
                } else {
                    // Apply the selected color to the country
                    applyColorToCountry(countryId, selectedColor);
                }
                
                // Update stats table
                updateStatsTable();
            }
        } else {
            // Not in game mode, any color can be applied
            // Check if the country is already controlled by the selected color
            if (countryColors[countryId] === selectedColor) {
                // Reset the country control
                resetCountryControl(countryId);
            } else {
                // Apply the selected color to the country
                applyColorToCountry(countryId, selectedColor);
            }
            
            // Update stats table
            updateStatsTable();
        }
    }
    
    // Function to reset a country's control
    function resetCountryControl(countryId) {
        // Remove the country from our tracking object
        delete countryColors[countryId];
        
        // Find the overlay for this country
        const overlay = document.getElementById(`overlay-${countryId}`);
        if (overlay) {
            // Reset the color
            overlay.style.backgroundColor = 'transparent';
            overlay.style.opacity = '0.5';
            overlay.style.border = 'none';
        }
    }
    
    // Function to apply color to a country
    function applyColorToCountry(countryId, color) {
        // Store the color in our tracking object
        countryColors[countryId] = color;
        
        // Find the overlay for this country
        const overlay = document.getElementById(`overlay-${countryId}`);
        if (overlay) {
            // Apply the color
            overlay.style.backgroundColor = color;
            
            // For white and black colors, adjust opacity for better visibility
            if (color === 'white') {
                overlay.style.opacity = '0.7';
                overlay.style.border = '1px solid #999';
            } else if (color === 'black') {
                overlay.style.opacity = '0.7';
            } else {
                overlay.style.opacity = '0.5';
                overlay.style.border = 'none';
            }
        }
    }
    
    // Function to get resource points for a country
    function getResourcePoints(countryId) {
        // Extract the number from the country ID
        const match = countryId.match(/(\d+)/);
        return match ? parseInt(match[0]) : 0;
    }
    
    // Function to check if a country is an oil zone
    function isOilZone(countryId) {
        return countryId.includes('-oil');
    }
    
    // Function to check if a country is a capital
    function isCapital(countryId) {
        return countryId.includes('-capital');
    }
    
    // Function to calculate resource points to units
    function resourcePointsToUnits(resourcePoints) {
        if (resourcePoints === 0) {
            return 0;
        }
        return 1 + Math.floor(resourcePoints / 3);
    }
    
    // Function to check if a color controls a sphere
    function controlsSphere(color, sphere) {
        // Check if all zones in the sphere are controlled by the color
        return sphere.zones.every(zoneId => countryColors[zoneId] === color);
    }
    
    // Function to update the stats table
    function updateStatsTable() {
        // Clear the table
        statsTable.clear();
        
        // For each color, calculate stats
        allColors.forEach(color => {
            // Get all countries with this color
            const colorCountries = Object.keys(countryColors).filter(id => countryColors[id] === color);
            
            // Calculate resource points
            const resourcePoints = colorCountries.reduce((sum, id) => sum + getResourcePoints(id), 0);
            
            // Count oil zones
            const oilZones = colorCountries.filter(id => isOilZone(id)).length;
            
            // Calculate turns
            const turns = 2 + oilZones;
            
            // Count capital cities
            const capitals = colorCountries.filter(id => isCapital(id)).length;
            
            // Count controlled spheres
            const controlledSpheres = spheres.filter(sphere => controlsSphere(color, sphere)).length;
            
            // Calculate units
            const units = resourcePointsToUnits(resourcePoints) + capitals + controlledSpheres;
            
            // Add row to table
            statsTable.row.add([
                `<div class="color-display" style="background-color: ${color};"></div><span class="color-name">${color}</span>`,
                resourcePoints,
                units,
                oilZones,
                turns,
                capitals,
                controlledSpheres
            ]);
        });
        
        // Draw the table
        statsTable.draw();
    }
    
    // Game functions
    
    // Start a new game
    startGameBtn.addEventListener('click', startNewGame);
    
    // Reset game
    resetGameBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to end the current game?')) {
            // Reset game state
            gameActive = false;
            gameColors = [];
            currentRound = 0;
            currentTurnIndex = 0;
            turnOrder = [];
            turnsRemaining = 0;
            turnHistory = [];
            
            // Reset the UI
            resetGameUI();
        }
    });
    
    function startNewGame() {
        // Get selected colors for the game
        gameColors = [];
        document.querySelectorAll('.game-color-checkbox:checked').forEach(checkbox => {
            gameColors.push(checkbox.value);
        });
        
        // Ensure at least 2 colors are selected
        if (gameColors.length < 2) {
            alert('Please select at least 2 colors for the game.');
            return;
        }
        
        // Reset game state
        gameActive = true;
        currentRound = 1;
        turnHistory = [];
        
        // Show game status, color selector, and map, hide game setup
        gameStatusDiv.style.display = 'block';
        document.querySelector('.game-setup').style.display = 'none';
        document.getElementById('color-selector').style.display = 'block';
        document.getElementById('map-container').style.display = 'block';
        
        // Make sure only game colors are visible and selectable
        colorButtons.forEach(btn => {
            const btnColor = btn.getAttribute('data-color');
            if (gameColors.includes(btnColor)) {
                btn.style.display = 'block';
            } else {
                btn.style.display = 'none';
            }
        });
        
        // Select the first game color by default
        if (gameColors.length > 0) {
            selectedColor = gameColors[0];
            colorButtons.forEach(btn => {
                if (btn.getAttribute('data-color') === selectedColor) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        }
        
        // Start the first round
        startNewRound();
    }
    
    // Start a new round
    function startNewRound() {
        // Update round display
        currentRoundSpan.textContent = currentRound;
        
        // Create turn order for this round
        createTurnOrder();
        
        // Reset turn index
        currentTurnIndex = 0;
        
        // Update turns remaining
        turnsRemaining = turnOrder.length;
        turnsRemainingSpan.textContent = turnsRemaining;
        
        // Clear turn history for the new round
        turnHistoryList.innerHTML = '';
        turnHistory = [];
        
        // Start the first turn
        startNextTurn();
        
        // Hide next round button, show next turn button
        nextRoundBtn.style.display = 'none';
        nextTurnBtn.style.display = 'inline-block';
    }
    
    // Create randomized turn order for the round
    function createTurnOrder() {
        turnOrder = [];
        
        // For each color, calculate how many turns they get
        gameColors.forEach(color => {
            // Get all countries with this color
            const colorCountries = Object.keys(countryColors).filter(id => countryColors[id] === color);
            
            // Count oil zones
            const oilZones = colorCountries.filter(id => isOilZone(id)).length;
            
            // Calculate turns (base 2 + oil zones)
            const turns = 2 + oilZones;
            
            // Add this color to the turn order the appropriate number of times
            for (let i = 0; i < turns; i++) {
                turnOrder.push(color);
            }
        });
        
        // Shuffle the turn order
        shuffleArray(turnOrder);
    }
    
    // Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Start the next turn
    nextTurnBtn.addEventListener('click', startNextTurn);
    
    function startNextTurn() {
        if (currentTurnIndex < turnOrder.length) {
            // Get the current turn color
            const currentColor = turnOrder[currentTurnIndex];
            
            // Update the display
            currentTurnColorSpan.textContent = currentColor;
            currentTurnIndicator.style.backgroundColor = currentColor;
            
            // Add to turn history
            addToTurnHistory(currentColor);
            
            // Update turns remaining
            turnsRemaining--;
            turnsRemainingSpan.textContent = turnsRemaining;
            
            // Increment turn index
            currentTurnIndex++;
            
            // If this is the last turn, show the next round button
            if (currentTurnIndex >= turnOrder.length) {
                nextTurnBtn.style.display = 'none';
                nextRoundBtn.style.display = 'inline-block';
            }
        }
    }
    
    // Start the next round
    nextRoundBtn.addEventListener('click', function() {
        currentRound++;
        startNewRound();
    });
    
    // Function to reset the game UI
    function resetGameUI() {
        // Show game setup and hide game status, color selector, and map
        document.querySelector('.game-setup').style.display = 'block';
        gameStatusDiv.style.display = 'none';
        document.getElementById('color-selector').style.display = 'none';
        document.getElementById('map-container').style.display = 'none';
        
        // Reset color buttons to show all colors
        colorButtons.forEach(btn => {
            btn.style.display = 'block';
        });
        
        // Clear turn history
        turnHistoryList.innerHTML = '';
        
        // Reset country colors
        const overlays = document.querySelectorAll('.country-overlay');
        overlays.forEach(overlay => {
            overlay.style.backgroundColor = 'transparent';
            overlay.style.opacity = '0.5';
            overlay.style.border = 'none';
        });
        
        // Reset countryColors object
        countryColors = {};
        
        // Update stats table
        updateStatsTable();
    }
    
    // Add a turn to the history
    function addToTurnHistory(color) {
        // Create a new turn history item
        const historyItem = document.createElement('div');
        historyItem.className = 'turn-history-item';
        historyItem.style.backgroundColor = color;
        
        // Add to the history list
        turnHistoryList.appendChild(historyItem);
        
        // Add to the history array
        turnHistory.push(color);
    }
    
    // Get the current turn color
    function getCurrentTurnColor() {
        if (currentTurnIndex < turnOrder.length) {
            return turnOrder[currentTurnIndex];
        } else if (turnOrder.length > 0) {
            // We're at the end of the round, return the last color
            return turnOrder[turnOrder.length - 1];
        }
        return null;
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Get the current scale of the image
        const imageWidth = mapImage.offsetWidth;
        const originalWidth = 680; // Original width of the image
        const scale = imageWidth / originalWidth;
        
        // Update all overlays
        const overlays = document.querySelectorAll('.country-overlay');
        overlays.forEach(overlay => {
            const id = overlay.id.replace('overlay-', '');
            const area = document.querySelector(`#country-map area[id="${id}"]`);
            
            if (area) {
                const coords = area.getAttribute('coords').split(',');
                const x = parseInt(coords[0]) * scale;
                const y = parseInt(coords[1]) * scale;
                const width = (parseInt(coords[2]) - parseInt(coords[0])) * scale;
                const height = (parseInt(coords[3]) - parseInt(coords[1])) * scale;
                
                overlay.style.left = `${x}px`;
                overlay.style.top = `${y}px`;
                overlay.style.width = `${width}px`;
                overlay.style.height = `${height}px`;
            }
        });
    });
    
    // Initialize the stats table
    updateStatsTable();
});
