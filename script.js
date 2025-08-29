class GachaMachine {
    constructor() {
        this.options = [
            'Dumplings',
            'Fried Dumplings', 
            'Noodles',
            'Pasta',
            'Hot Dogs'
        ];
        this.totalPicks = 0;
        this.lastPick = null;
        this.isSpinning = false;
        this.spinResults = []; // Array to store all spin results
        
        this.initializeElements();
        this.bindEvents();
        this.renderOptions();
        this.updateStats();
        this.renderResults();
    }
    
         initializeElements() {
         this.resultDisplay = document.getElementById('resultDisplay');
         this.spinButton = document.getElementById('spinButton');
         this.optionsList = document.getElementById('optionsList');
         this.newOptionInput = document.getElementById('newOption');
         this.addButton = document.getElementById('addButton');
         this.totalPicksElement = document.getElementById('totalPicks');
         this.lastPickElement = document.getElementById('lastPick');
         this.resetButton = document.getElementById('resetButton');
         this.resultsList = document.getElementById('resultsList');
     }
    
         bindEvents() {
         this.spinButton.addEventListener('click', () => this.spin());
         this.addButton.addEventListener('click', () => this.addOption());
         this.newOptionInput.addEventListener('keypress', (e) => {
             if (e.key === 'Enter') this.addOption();
         });
         this.resetButton.addEventListener('click', () => this.resetStats());
     }
    
    spin() {
        if (this.isSpinning || this.options.length === 0) return;
        
        // Check if all options have been selected
        const alreadySelected = this.spinResults.map(result => result.option);
        const availableOptions = this.options.filter(option => !alreadySelected.includes(option));
        
        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.spinButton.textContent = 'Spinning...';
        
        // Add spinning animation to the handle
        const handle = document.querySelector('.handle');
        handle.classList.add('spinning');
        
        // Simulate spinning with random delays
        const spinDuration = 2000 + Math.random() * 1000;
        const updateInterval = 100;
        let elapsed = 0;
        
        const spinInterval = setInterval(() => {
            elapsed += updateInterval;
            
            // Show random options during spin (only from available options if any remain)
            if (elapsed < spinDuration - 500) {
                let randomOption;
                if (availableOptions.length > 0) {
                    randomOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
                } else {
                    randomOption = this.options[Math.floor(Math.random() * this.options.length)];
                }
                this.resultDisplay.innerHTML = `<span class="spinning-text">${randomOption}</span>`;
            }
            
            if (elapsed >= spinDuration) {
                clearInterval(spinInterval);
                this.completeSpin();
            }
        }, updateInterval);
    }
    
    completeSpin() {
        // Get already selected options
        const alreadySelected = this.spinResults.map(result => result.option);
        
        // Get available options (not yet selected)
        const availableOptions = this.options.filter(option => !alreadySelected.includes(option));
        
        let selectedOption;
        let allItemsSelected = false;
        
        if (availableOptions.length === 0) {
            // All items have been selected, show special message
            allItemsSelected = true;
            selectedOption = "🎉 All options completed!";
        } else {
            // Select from remaining available options
            selectedOption = availableOptions[Math.floor(Math.random() * availableOptions.length)];
        }
        
        // Update result display with bounce animation
        this.resultDisplay.innerHTML = `<span class="bounce">${selectedOption}</span>`;
        
        if (!allItemsSelected) {
            // Update stats only if we selected a real option
            this.totalPicks++;
            this.lastPick = selectedOption;
            
            // Add result to spinResults array with timestamp
            const resultData = {
                option: selectedOption,
                timestamp: new Date(),
                pickNumber: this.totalPicks
            };
            this.spinResults.push(resultData);
            
            this.updateStats();
            this.renderResults();
            this.renderOptions(); // Update visual indicators for selected items
            
            // Show notification about remaining options
            const remainingCount = availableOptions.length - 1; // -1 because we just picked one
            if (remainingCount > 0) {
                setTimeout(() => {
                    this.showNotification(`${remainingCount} unique option${remainingCount === 1 ? '' : 's'} remaining!`, 'info');
                }, 1500);
            } else {
                setTimeout(() => {
                    this.showNotification('🎊 Congratulations! You\'ve tried all options!', 'success');
                }, 1500);
            }
        } else {
            // All options completed - show special notification
            setTimeout(() => {
                this.showNotification('All options have been selected! Reset stats to start over.', 'info');
            }, 1500);
        }
        
        // Reset UI
        setTimeout(() => {
            this.isSpinning = false;
            this.spinButton.disabled = false;
            this.spinButton.innerHTML = '<span class="button-text">SPIN!</span>';
            
            const handle = document.querySelector('.handle');
            handle.classList.remove('spinning');
            
            // Remove bounce class after animation
            const resultSpan = this.resultDisplay.querySelector('span');
            if (resultSpan) {
                resultSpan.classList.remove('bounce');
            }
        }, 1000);
        
        // Save to localStorage
        this.saveToLocalStorage();
    }
    
    addOption() {
        const newOption = this.newOptionInput.value.trim();
        
        if (!newOption) {
            this.showNotification('Please enter an option!', 'error');
            return;
        }
        
        if (this.options.includes(newOption)) {
            this.showNotification('This option already exists!', 'error');
            return;
        }
        
        if (newOption.length > 30) {
            this.showNotification('Option is too long! (max 30 characters)', 'error');
            return;
        }
        
        this.options.push(newOption);
        this.newOptionInput.value = '';
        this.renderOptions();
        this.saveToLocalStorage();
        this.showNotification('Option added successfully!', 'success');
    }
    
    removeOption(optionToRemove) {
        if (this.options.length <= 1) {
            this.showNotification('You need at least one option!', 'error');
            return;
        }
        
        this.options = this.options.filter(option => option !== optionToRemove);
        this.renderOptions();
        this.saveToLocalStorage();
        this.showNotification('Option removed successfully!', 'success');
    }
    
    renderOptions() {
        this.optionsList.innerHTML = '';
        
        // Get already selected options
        const alreadySelected = this.spinResults.map(result => result.option);
        
        this.options.forEach(option => {
            const optionItem = document.createElement('div');
            const isSelected = alreadySelected.includes(option);
            
            optionItem.className = `option-item ${isSelected ? 'selected' : ''}`;
            
            optionItem.innerHTML = `
                <span class="option-text">
                    ${isSelected ? '✓ ' : ''}${option}
                    ${isSelected ? '<span class="selected-badge">PICKED</span>' : ''}
                </span>
                <button class="remove-btn" onclick="gachaMachine.removeOption('${option}')">×</button>
            `;
            
            this.optionsList.appendChild(optionItem);
        });
    }
    
    renderResults() {
        if (this.spinResults.length === 0) {
            this.resultsList.innerHTML = `
                <div class="no-results">
                    <span class="placeholder-text">No spins yet! Press SPIN to start collecting results.</span>
                </div>
            `;
            return;
        }
        
        this.resultsList.innerHTML = '';
        
        // Display results in reverse order (newest first)
        const reversedResults = [...this.spinResults].reverse();
        
        reversedResults.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const timeString = this.formatTime(result.timestamp);
            
            resultItem.innerHTML = `
                <div>
                    <span class="result-text">${result.option}</span>
                    <span class="result-timestamp">${timeString}</span>
                </div>
                <span class="result-number">#${result.pickNumber}</span>
            `;
            
            this.resultsList.appendChild(resultItem);
        });
    }
    
    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes}m ago`;
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else {
            return timestamp.toLocaleDateString();
        }
    }
    
    updateStats() {
        this.totalPicksElement.textContent = this.totalPicks;
        this.lastPickElement.textContent = this.lastPick || '-';
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    saveToLocalStorage() {
        const data = {
            options: this.options,
            totalPicks: this.totalPicks,
            lastPick: this.lastPick,
            spinResults: this.spinResults
        };
        localStorage.setItem('gachaMachineData', JSON.stringify(data));
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('gachaMachineData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.options = data.options || this.options;
                this.totalPicks = data.totalPicks || 0;
                this.lastPick = data.lastPick || null;
                
                // Load spinResults and convert timestamp strings back to Date objects
                this.spinResults = (data.spinResults || []).map(result => ({
                    ...result,
                    timestamp: new Date(result.timestamp)
                }));
                
                this.renderOptions();
                this.updateStats();
                this.renderResults();
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
    
         resetStats() {
         // Show confirmation dialog
         if (confirm('Are you sure you want to reset your statistics? This will clear all your spin results and statistics.')) {
             this.totalPicks = 0;
             this.lastPick = null;
             this.spinResults = []; // Clear all spin results
             this.updateStats();
             this.renderResults(); // Re-render results list (will show empty state)
             this.renderOptions(); // Re-render options to clear "PICKED" labels
             this.saveToLocalStorage();
             this.showNotification('Statistics and results cleared successfully!', 'success');
             
             // Reset the result display to placeholder
             this.resultDisplay.innerHTML = '<span class="placeholder">Ready to pick?</span>';
         }
     }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gachaMachine = new GachaMachine();
    gachaMachine.loadFromLocalStorage();
    
    // Add some fun interactions
    const handle = document.querySelector('.handle');
    const machineBody = document.querySelector('.machine-body');
    
    // Add hover effect to machine body
    machineBody.addEventListener('mouseenter', () => {
        machineBody.style.transform = 'scale(1.02)';
        machineBody.style.transition = 'transform 0.3s ease';
    });
    
    machineBody.addEventListener('mouseleave', () => {
        machineBody.style.transform = 'scale(1)';
    });
    
    // Add click sound effect (optional)
    const spinButton = document.getElementById('spinButton');
    spinButton.addEventListener('click', () => {
        // You can add a sound effect here if desired
        // For now, we'll just add a subtle visual feedback
        spinButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            spinButton.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (!gachaMachine.isSpinning) {
                gachaMachine.spin();
            }
        }
    });
    
    // Add welcome message
    setTimeout(() => {
        gachaMachine.showNotification('Welcome to the Kitchen Gacha Machine! Press SPACE to spin and collect results!', 'info');
    }, 1000);
});

// Add some additional CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: 'Poppins', sans-serif;
    }
    
    .spinning-text {
        color: #e74c3c;
        font-weight: 700;
    }
    
    .machine-body {
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);
