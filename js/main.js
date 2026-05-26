// Main JavaScript for Flood Detection System

// ==================== DRAW FLOOD MAP ====================
function drawFloodMap() {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 800;
    const height = canvas.height = 500;
    
    // Draw background (land)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, width, height);
    
    // Draw some paddy field patterns
    ctx.fillStyle = '#66BB6A';
    for (let i = 0; i < 20; i++) {
        ctx.fillRect(50 + i * 40, height - 100, 30, 80);
    }
    
    // Draw flooded areas (blue patches)
    ctx.fillStyle = '#2196F3';
    ctx.globalAlpha = 0.7;
    
    // Simulate flood areas based on detection results
    const floodAreas = [
        { x: 100, y: 300, w: 150, h: 120 },
        { x: 400, y: 250, w: 180, h: 150 },
        { x: 600, y: 350, w: 120, h: 100 },
        { x: 250, y: 400, w: 100, h: 80 }
    ];
    
    floodAreas.forEach(area => {
        ctx.fillRect(area.x, area.y, area.w, area.h);
    });
    
    // Draw river
    ctx.fillStyle = '#1E88E5';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, height - 150);
    ctx.quadraticCurveTo(width/2, height - 200, width, height - 150);
    ctx.lineTo(width, height - 130);
    ctx.quadraticCurveTo(width/2, height - 180, 0, height - 130);
    ctx.fill();
    
    // Draw paddy icons
    ctx.fillStyle = '#8BC34A';
    ctx.globalAlpha = 1;
    for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.moveTo(30 + i * 25, height - 120);
        ctx.lineTo(35 + i * 25, height - 140);
        ctx.lineTo(40 + i * 25, height - 120);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    
    // Add labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('Kedah Region', 150, 280);
    ctx.fillText('Perlis Region', 450, 230);
    ctx.shadowColor = 'transparent';
}

// ==================== REFRESH ALERTS ====================
function refreshAlerts() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
    }
    
    setTimeout(() => {
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        }
        showNotification('Dashboard updated with latest satellite data!', 'success');
    }, 1500);
}

// ==================== UPDATE LAST UPDATE TIME ====================
function updateLastUpdateTime() {
    const lastUpdateSpan = document.getElementById('lastUpdate');
    if (lastUpdateSpan) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        lastUpdateSpan.textContent = timeString;
    }
}

// ==================== RUN DETECTION ====================
async function runDetection() {
    const detectBtn = document.getElementById('detectBtn');
    const regionSelect = document.getElementById('regionSelect');
    const region = regionSelect.value;
    
    if (!region) {
        showNotification('Please select a region first!', 'warning');
        return;
    }
    
    // Show loading state
    const originalBtnText = detectBtn.innerHTML;
    detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    detectBtn.disabled = true;
    
    // Simulate ML processing
    setTimeout(() => {
        // Random but realistic detection results
        const results = generateDetectionResults(region);
        
        // Display results
        displayResults(results);
        
        // Update map
        updateMapBasedOnResults(results);
        
        // Add alert for new detection
        addNewAlert(region, results);
        
        // Reset button
        detectBtn.innerHTML = originalBtnText;
        detectBtn.disabled = false;
        
        showNotification('Detection completed successfully!', 'success');
        
        // Scroll to results
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 2500);
}

// ==================== GENERATE DETECTION RESULTS ====================
function generateDetectionResults(region) {
    const regionData = {
        kedah: { floodExtent: 2450, confidence: 87, ndwi: 0.42, classification: 'Flooded', risk: 'High' },
        perlis: { floodExtent: 1800, confidence: 85, ndwi: 0.38, classification: 'Flooded', risk: 'High' },
        selangor: { floodExtent: 450, confidence: 78, ndwi: 0.25, classification: 'Minor Flooding', risk: 'Medium' },
        kelantan: { floodExtent: 3200, confidence: 89, ndwi: 0.48, classification: 'Severe Flooding', risk: 'Critical' }
    };
    
    const data = regionData[region] || regionData.kedah;
    
    return {
        region: region,
        floodExtent: data.floodExtent,
        confidence: data.confidence,
        ndwi: data.ndwi,
        classification: data.classification,
        riskLevel: data.risk,
        timestamp: new Date().toISOString()
    };
}

// ==================== DISPLAY RESULTS ====================
function displayResults(results) {
    document.getElementById('confidenceScore').textContent = results.confidence;
    document.getElementById('ndwiValue').textContent = results.ndwi;
    document.getElementById('floodExtent').textContent = results.floodExtent.toLocaleString();
    document.getElementById('classification').textContent = results.classification;
    
    const riskElement = document.getElementById('riskLevel');
    riskElement.textContent = results.riskLevel;
    
    // Set risk color
    const riskColors = {
        'Low': 'var(--info)',
        'Medium': 'var(--warning)',
        'High': 'var(--danger)',
        'Critical': 'var(--danger)'
    };
    riskElement.style.color = riskColors[results.riskLevel] || 'var(--danger)';
    
    // Update recommendations based on risk level
    updateRecommendations(results);
    
    // Update dashboard stats
    updateDashboardStats(results);
}

// ==================== UPDATE RECOMMENDATIONS ====================
function updateRecommendations(results) {
    const recommendationsList = document.getElementById('recommendationsList');
    if (!recommendationsList) return;
    
    let recommendations = [];
    
    switch(results.riskLevel) {
        case 'Critical':
            recommendations = [
                '🚨 URGENT: Immediate evacuation required for all paddy field workers!',
                '🌊 Activate emergency flood response protocols',
                '📢 Broadcast emergency alerts to all farmers in the area',
                '🆘 Coordinate with disaster response teams'
            ];
            break;
        case 'High':
            recommendations = [
                '⚠️ Immediate evacuation recommended for low-lying paddy areas',
                '🌾 Consider early harvesting for unaffected sections',
                '📢 Alert local agricultural authorities',
                '🚜 Move equipment and livestock to higher ground'
            ];
            break;
        case 'Medium':
            recommendations = [
                '📊 Monitor water levels closely',
                '🌾 Prepare for potential harvesting if flooding worsens',
                '📢 Inform farmers in surrounding areas',
                '🔍 Conduct regular field inspections'
            ];
            break;
        default:
            recommendations = [
                '✅ Continue regular monitoring',
                '📱 Keep farmers informed of weather forecasts',
                '🔧 Maintain drainage systems',
                '📊 Update flood risk maps with new data'
            ];
    }
    
    recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
}

// ==================== UPDATE DASHBOARD STATS ====================
function updateDashboardStats(results) {
    // Update the main flood percentage in the circle chart
    const floodedPercent = (results.floodExtent / 12450) * 100;
    const circleChart = document.querySelector('.circular-chart');
    if (circleChart) {
        const circumference = 283; // 2 * pi * 45
        const dashOffset = circumference - (circumference * floodedPercent / 100);
        circleChart.style.strokeDashoffset = dashOffset;
    }
    
    const percentageSpan = document.querySelector('.percentage');
    if (percentageSpan) {
        percentageSpan.textContent = Math.round(floodedPercent) + '%';
    }
    
    // Update stats values
    const floodedValue = document.querySelector('.stat-value.danger');
    if (floodedValue) {
        const newTotal = parseInt(floodedValue.textContent.replace(',', '')) + results.floodExtent;
        floodedValue.textContent = newTotal.toLocaleString() + ' ha';
    }
}

// ==================== UPDATE MAP ====================
function updateMapBasedOnResults(results) {
    const canvas = document.getElementById('mapCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Redraw map with updated flood areas
    drawFloodMap();
    
    // Add highlight for selected region
    ctx.fillStyle = '#FF9800';
    ctx.globalAlpha = 0.4;
    
    let regionX, regionY;
    switch(results.region) {
        case 'kedah':
            regionX = 100; regionY = 300;
            break;
        case 'perlis':
            regionX = 400; regionY = 250;
            break;
        case 'selangor':
            regionX = 600; regionY = 350;
            break;
        case 'kelantan':
            regionX = 250; regionY = 400;
            break;
        default:
            regionX = 100; regionY = 300;
    }
    
    ctx.fillRect(regionX - 10, regionY - 10, 200, 160);
    ctx.globalAlpha = 1;
    
    // Add selection indicator
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 3;
    ctx.strokeRect(regionX - 10, regionY - 10, 200, 160);
}

// ==================== ADD NEW ALERT ====================
function addNewAlert(region, results) {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;
    
    const regionNames = {
        kedah: 'Kedah - MADA Region',
        perlis: 'Perlis - Chuping Valley',
        selangor: 'Selangor - Sekinchan',
        kelantan: 'Kelantan - Ketereh'
    };
    
    const regionName = regionNames[region] || region;
    
    const newAlert = document.createElement('div');
    newAlert.className = `alert-item ${results.riskLevel.toLowerCase()}`;
    newAlert.style.animation = 'fadeIn 0.5s ease';
    
    let icon = 'exclamation-triangle';
    if (results.riskLevel === 'Medium') icon = 'exclamation-circle';
    if (results.riskLevel === 'Low') icon = 'info-circle';
    
    newAlert.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <div class="alert-info">
            <strong>${regionName}</strong>
            <p>${results.floodExtent.toLocaleString()} hectares detected - ${results.classification}</p>
            <small><i class="far fa-clock"></i> Just now</small>
        </div>
    `;
    
    alertsList.insertBefore(newAlert, alertsList.firstChild);
    
    // Keep only last 5 alerts
    while (alertsList.children.length > 5) {
        alertsList.removeChild(alertsList.lastChild);
    }
}

// ==================== SHOW NOTIFICATION ====================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== ADD CSS FOR NOTIFICATIONS ====================
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// ==================== FILE UPLOAD HANDLING ====================
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');
    const fileInfo = document.getElementById('fileInfo');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(26,95,122,0.05)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-light)';
        uploadArea.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-light)';
        uploadArea.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
}

function handleFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.tif')) {
        showNotification('Please upload a valid satellite image (JPEG, PNG, TIFF)', 'warning');
        return;
    }
    
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.innerHTML = `
            <i class="fas fa-check-circle" style="color: #4CAF50"></i>
            File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
        `;
        fileInfo.style.color = '#4CAF50';
        fileInfo.style.marginTop = '15px';
    }
    
    showNotification('Satellite image uploaded successfully! Ready for analysis.', 'success');
}

// ==================== SCROLL FUNCTIONS ====================
function scrollToDetection() {
    const detectionSection = document.getElementById('detection');
    if (detectionSection) {
        detectionSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToDashboard() {
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== ACTIVE NAV LINK ====================
function setActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ==================== MOBILE MENU ====================
function setupMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '70px';
                navLinks.style.left = '0';
                navLinks.style.right = '0';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            }
        });
        
        // Reset on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'row';
                navLinks.style.position = 'relative';
                navLinks.style.top = 'auto';
                navLinks.style.padding = '0';
                navLinks.style.boxShadow = 'none';
            } else {
                navLinks.style.display = 'none';
            }
        });
    }
}

// ==================== AUTO REFRESH DATA ====================
function startAutoRefresh() {
    // Update time every minute
    updateLastUpdateTime();
    setInterval(updateLastUpdateTime, 60000);
    
    // Refresh data every 5 minutes
    setInterval(() => {
        refreshAlerts();
    }, 300000);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    // Draw the flood map
    drawFloodMap();
    
    // Setup file upload
    setupFileUpload();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Set active nav link
    setActiveNavLink();
    
    // Start auto refresh
    startAutoRefresh();
    
    // Update last update time
    updateLastUpdateTime();
    
    // Add window resize handler for map
    window.addEventListener('resize', () => {
        drawFloodMap();
    });
    
    // Add some initial demo alerts animation
    setTimeout(() => {
        showNotification('System ready! Upload satellite data to begin flood detection.', 'info');
    }, 1000);
});

// Display real satellite image on map
function displaySatelliteImage(imageDataUrl, regionName) {
    const satelliteImg = document.getElementById('satelliteDisplayImage');
    const placeholder = document.getElementById('placeholderOverlay');
    const regionSpan = document.getElementById('currentRegion');
    
    if (satelliteImg && placeholder) {
        // Show the image
        satelliteImg.src = imageDataUrl;
        satelliteImg.classList.add('active');
        
        // Hide placeholder
        placeholder.classList.add('hide');
        
        // Update region text
        if (regionSpan && regionName) {
            regionSpan.textContent = regionName;
        }
        
        showNotification('Satellite image loaded successfully!', 'success');
    }
}

// Clear satellite image (reset to blank)
function clearSatelliteImage() {
    const satelliteImg = document.getElementById('satelliteDisplayImage');
    const placeholder = document.getElementById('placeholderOverlay');
    
    if (satelliteImg && placeholder) {
        satelliteImg.src = '';
        satelliteImg.classList.remove('active');
        placeholder.classList.remove('hide');
    }
}

// Update the existing runDetection function to display real data
async function runDetection() {
    const detectBtn = document.getElementById('detectBtn');
    const regionSelect = document.getElementById('regionSelect');
    const region = regionSelect.value;
    
    if (!region) {
        showNotification('Please select a region first!', 'warning');
        return;
    }
    
    // Show loading on map
    showMapLoading(true);
    
    // Show loading state
    const originalBtnText = detectBtn.innerHTML;
    detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    detectBtn.disabled = true;
    
    // Simulate ML processing
    setTimeout(() => {
        const results = generateDetectionResults(region);
        displayResults(results);
        
        // Simulate loading a real satellite image
        // In production, this would come from your backend
        const demoImageUrl = getDemoImageForRegion(region);
        displaySatelliteImage(demoImageUrl, results.region_name || region);
        
        addNewAlert(region, results);
        
        detectBtn.innerHTML = originalBtnText;
        detectBtn.disabled = false;
        showMapLoading(false);
        
        showNotification('Detection completed successfully!', 'success');
        
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 2500);
}

// Get demo image for region (replace with your actual images)
function getDemoImageForRegion(region) {
    // You can replace these with paths to your actual satellite images
    const demoImages = {
        'kedah': 'images/kedah-satellite.jpg',
        'perlis': 'images/perlis-satellite.jpg',
        'selangor': 'images/selangor-satellite.jpg',
        'kelantan': 'images/kelantan-satellite.jpg'
    };
    
    // Return demo image or empty if not found
    return demoImages[region] || '';
}

// Show/hide map loading indicator
function showMapLoading(show) {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    let loadingElement = document.querySelector('.map-loading');
    
    if (show) {
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.className = 'map-loading';
            loadingElement.innerHTML = '<div class="spinner"></div><p>Loading satellite data...</p>';
            loadingElement.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
                color: white;
            `;
            mapContainer.appendChild(loadingElement);
        }
    } else {
        if (loadingElement) {
            loadingElement.remove();
        }
    }
}

// Handle file upload for real satellite image
function handleFile(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.tif')) {
        showNotification('Please upload a valid satellite image (JPEG, PNG, TIFF)', 'warning');
        return;
    }
    
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.innerHTML = `
            <i class="fas fa-check-circle" style="color: #4CAF50"></i>
            File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)
        `;
        fileInfo.style.color = '#4CAF50';
        fileInfo.style.marginTop = '15px';
    }
    
    // Display the uploaded image on the map
    const reader = new FileReader();
    reader.onload = function(e) {
        displaySatelliteImage(e.target.result, 'Uploaded Satellite Image');
    };
    reader.readAsDataURL(file);
    
    showNotification('Satellite image uploaded successfully! Ready for analysis.', 'success');
}

// =========================
// LEAFLET MAP INITIALIZATION
// =========================

const map = L.map('map').setView([4.2105, 101.9758], 6);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

let currentSatelliteLayer = null;
let currentDownloadURL = null;

// =========================
// SEARCH LOCATION FUNCTION
// =========================

async function searchFloodLocation() {

  const location = document
    .getElementById('locationSearch')
    .value;

  if(!location) {
    alert("Please enter location");
    return;
  }

  // loading state
  floodPercentageSpan.innerText = "...";
  floodMessageP.innerText = 
    "Connecting to Google Earth Engine...";

  try {

    const response = await fetch(
      'http://127.0.0.1:5000/search-location',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          location: location
        })
      }
    );

    const data = await response.json();

    // remove previous satellite layer
    if(currentSatelliteLayer) {
      map.removeLayer(currentSatelliteLayer);
    }

    // add Earth Engine tiles
    currentSatelliteLayer = L.tileLayer(
      data.tile_url,
      {
        attribution: 'Google Earth Engine'
      }
    ).addTo(map);

    // fly to searched location
    map.setView(
      [data.latitude, data.longitude],
      10
    );

    // save tif download url
    currentDownloadURL = data.download_url;

    // update UI
    floodPercentageSpan.innerText =
      data.flood_probability + "%";

    floodMessageP.innerText =
      "Real-time Sentinel-1 flood analysis generated from Google Earth Engine.";

    ndwiStatusSpan.innerText =
      "NDWI = " + data.ndwi;

    updateRiskClass(data.risk_level);

    renderNotifications('dynamic', {
      floodProb: data.flood_probability,
      ndwiValue: data.ndwi,
      recommendations: data.recommendation
    });

  } catch(error) {

    console.error(error);

    floodMessageP.innerText =
      "Earth Engine connection failed.";

  }
}

// =========================
// SEARCH BUTTON
// =========================

document
  .getElementById('searchBtn')
  .addEventListener(
    'click',
    searchFloodLocation
  );

// ENTER KEY SUPPORT
document
  .getElementById('locationSearch')
  .addEventListener('keypress', function(e) {

    if(e.key === 'Enter') {
      searchFloodLocation();
    }

});

// =========================
// DOWNLOAD TIFF
// =========================

document
  .getElementById('downloadTifBtn')
  .addEventListener('click', () => {

    if(currentDownloadURL) {
      window.open(currentDownloadURL);
    } else {
      alert("No GeoTIFF available yet.");
    }

});

// Export functions for global access
window.runDetection = runDetection;
window.refreshAlerts = refreshAlerts;
window.scrollToDetection = scrollToDetection;
window.scrollToDashboard = scrollToDashboard;