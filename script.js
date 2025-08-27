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
        
        this.initializeElements();
        this.bindEvents();
        this.renderOptions();
        this.updateStats();
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
            
            // Show random options during spin
            if (elapsed < spinDuration - 500) {
                const randomOption = this.options[Math.floor(Math.random() * this.options.length)];
                this.resultDisplay.innerHTML = `<span class="spinning-text">${randomOption}</span>`;
            }
            
            if (elapsed >= spinDuration) {
                clearInterval(spinInterval);
                this.completeSpin();
            }
        }, updateInterval);
    }
    
    completeSpin() {
        // Select final result
        const selectedOption = this.options[Math.floor(Math.random() * this.options.length)];
        
        // Update result display with bounce animation
        this.resultDisplay.innerHTML = `<span class="bounce">${selectedOption}</span>`;
        
        // Update stats
        this.totalPicks++;
        this.lastPick = selectedOption;
        this.updateStats();
        
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
        
        this.options.forEach(option => {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            
            optionItem.innerHTML = `
                <span class="option-text">${option}</span>
                <button class="remove-btn" onclick="gachaMachine.removeOption('${option}')">×</button>
            `;
            
            this.optionsList.appendChild(optionItem);
        });
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
            lastPick: this.lastPick
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
                
                this.renderOptions();
                this.updateStats();
            } catch (e) {
                console.error('Error loading saved data:', e);
            }
        }
    }
    
         resetStats() {
         // Show confirmation dialog
         if (confirm('Are you sure you want to reset your statistics? This will reset your total picks and last pick history.')) {
             this.totalPicks = 0;
             this.lastPick = null;
             this.updateStats();
             this.saveToLocalStorage();
             this.showNotification('Statistics reset successfully!', 'success');
             
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
        gachaMachine.showNotification('Welcome to the Kitchen Gacha Machine! Press SPACE to spin!', 'info');
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
