document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let selectedColor = null;
    const countryColors = {};
    const mapImage = document.getElementById('map-image');
    const mapContainer = document.querySelector('.map-container');
    const selectedCountryName = document.getElementById('selected-country-name');
    
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
        colorButtons[0].click();
    }
    
    // Function to fetch map areas from the existing index.html
    function fetchMapAreas() {
        // Get the map element
        const countryMap = document.getElementById('country-map');
        
        // Create a new XMLHttpRequest to get the index.html content
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'index.html', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                // Parse the HTML content
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(xhr.responseText, 'text/html');
                
                // Get all area elements from the map
                const areas = htmlDoc.querySelectorAll('map[name="image-maps-2019-10-06-144806"] area');
                
                // Clone and add each area to our map
                areas.forEach(area => {
                    const newArea = document.createElement('area');
                    
                    // Copy attributes
                    Array.from(area.attributes).forEach(attr => {
                        newArea.setAttribute(attr.name, attr.value);
                    });
                    
                    // Set href to # to prevent navigation
                    newArea.setAttribute('href', '#');
                    
                    // Add click event listener
                    newArea.addEventListener('click', function(e) {
                        e.preventDefault();
                        handleCountryClick(this);
                    });
                    
                    // Add to our map
                    countryMap.appendChild(newArea);
                });
                
                // Create SVG overlay for the map
                createSvgOverlay();
            }
        };
        xhr.send();
    }
    
    // Function to create SVG overlay for the map
    function createSvgOverlay() {
        // Get the dimensions of the map image
        const width = mapImage.width;
        const height = mapImage.height;
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';
        
        // Add SVG to the map container
        mapContainer.appendChild(svg);
        
        // Get all areas
        const areas = document.querySelectorAll('#country-map area');
        
        // Create polygon for each area
        areas.forEach(area => {
            const id = area.getAttribute('id');
            if (!id) return;
            
            // Get coordinates
            const coords = area.getAttribute('coords').split(',');
            
            // Create polygon element
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            polygon.setAttribute('id', `overlay-${id}`);
            
            // Set polygon attributes based on coordinates (assuming rect coords)
            const x = parseInt(coords[0]);
            const y = parseInt(coords[1]);
            const width = parseInt(coords[2]) - x;
            const height = parseInt(coords[3]) - y;
            
            polygon.setAttribute('x', x);
            polygon.setAttribute('y', y);
            polygon.setAttribute('width', width);
            polygon.setAttribute('height', height);
            polygon.setAttribute('fill', 'transparent');
            polygon.setAttribute('stroke', 'transparent');
            polygon.setAttribute('stroke-width', '1');
            polygon.setAttribute('data-country-id', id);
            
            // Add to SVG
            svg.appendChild(polygon);
        });
    }
    
    // Function to handle country click
    function handleCountryClick(area) {
        const countryId = area.getAttribute('id');
        const countryTitle = area.getAttribute('title');
        
        // Update selected country display
        selectedCountryName.textContent = countryTitle || countryId;
        
        // If a color is selected, apply it to the country
        if (selectedColor) {
            applyColorToCountry(countryId, selectedColor);
        }
    }
    
    // Function to apply color to a country
    function applyColorToCountry(countryId, color) {
        // Store the color in our tracking object
        countryColors[countryId] = color;
        
        // Find the overlay for this country
        const overlay = document.getElementById(`overlay-${countryId}`);
        if (overlay) {
            // Apply the color with opacity
            overlay.setAttribute('fill', color);
            overlay.setAttribute('fill-opacity', '0.5');
        }
    }
    
    // Call the function to fetch map areas
    fetchMapAreas();
    
    // Function to handle window resize
    window.addEventListener('resize', function() {
        // Get the SVG element
        const svg = mapContainer.querySelector('svg');
        if (!svg) return;
        
        // Update SVG dimensions
        const width = mapImage.width;
        const height = mapImage.height;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        
        // Get the current scale of the image
        const imageWidth = mapImage.offsetWidth;
        const originalWidth = 680; // Original width of the image
        const scale = imageWidth / originalWidth;
        
        // Update all polygons
        const polygons = svg.querySelectorAll('rect');
        polygons.forEach(polygon => {
            const id = polygon.getAttribute('data-country-id');
            const area = document.querySelector(`#country-map area[id="${id}"]`);
            
            if (area) {
                const coords = area.getAttribute('coords').split(',');
                const x = parseInt(coords[0]) * scale;
                const y = parseInt(coords[1]) * scale;
                const width = (parseInt(coords[2]) - parseInt(coords[0])) * scale;
                const height = (parseInt(coords[3]) - parseInt(coords[1])) * scale;
                
                polygon.setAttribute('x', x);
                polygon.setAttribute('y', y);
                polygon.setAttribute('width', width);
                polygon.setAttribute('height', height);
            }
        });
    });
});
