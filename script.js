// HealthMetric Pro - Complete BMI Calculator
class HealthMetricPro {
    constructor() {
        this.initializeApp();
        this.setupEventListeners();
        this.loadUserData();
    }

    // DOM Elements
    elements = {
        // Input Elements
        heightInput: document.getElementById('height-input'),
        weightInput: document.getElementById('weight-input'),
        heightSlider: document.getElementById('height-slider'),
        weightSlider: document.getElementById('weight-slider'),
        ageInput: document.getElementById('age-input'),
        
        // Action Buttons
        calculateBtn: document.getElementById('calculate-bmi-btn'),
        saveResultsBtn: document.getElementById('save-results-btn'),
        setGoalsBtn: document.getElementById('set-goals-btn'),
        shareResultsBtn: document.getElementById('share-results-btn'),
        historyBtn: document.getElementById('history-btn'),
        analyticsBtn: document.getElementById('analytics-btn'),
        exportBtn: document.getElementById('export-btn'),
        
        // Modal Controls
        closeHistoryModal: document.getElementById('close-history-modal'),
        closeAnalyticsModal: document.getElementById('close-analytics-modal'),
        closeGoalsModal: document.getElementById('close-goals-modal'),
        closeExportModal: document.getElementById('close-export-modal'),
        
        // Modal Containers
        historyModal: document.getElementById('history-modal'),
        analyticsModal: document.getElementById('analytics-modal'),
        goalsModal: document.getElementById('goals-modal'),
        exportModal: document.getElementById('export-modal'),
        
        // Results Display
        bmiScoreValue: document.getElementById('bmi-score-value'),
        healthCategoryTitle: document.getElementById('health-category-title'),
        healthCategoryDescription: document.getElementById('health-category-description'),
        healthStatusValue: document.getElementById('health-status-value'),
        healthyRangeValue: document.getElementById('healthy-range-value'),
        idealWeightValue: document.getElementById('ideal-weight-value'),
        healthRecommendations: document.getElementById('health-recommendations'),
        bmiProgressRing: document.getElementById('bmi-progress-ring'),
        
        // History
        historyListContainer: document.getElementById('history-list-container'),
        
        // Analytics
        averageBmi: document.getElementById('average-bmi'),
        totalChange: document.getElementById('total-change'),
        progressScore: document.getElementById('progress-score'),
        
        // Goals
        targetWeight: document.getElementById('target-weight'),
        targetDate: document.getElementById('target-date'),
        saveGoalBtn: document.getElementById('save-goal-btn')
    };

    // Application State
    state = {
        currentGender: 'male',
        currentActivity: 'moderate',
        currentBMI: 0,
        userData: {
            height: 170,
            weight: 70,
            age: 25,
            gender: 'male',
            activity: 'moderate'
        },
        calculationHistory: [],
        healthGoals: {},
        userPreferences: {
            unitSystem: 'metric',
            theme: 'auto'
        }
    };

    // BMI Categories with International Standards
    bmiCategories = {
        underweight: { 
            range: [0, 18.5], 
            status: 'Underweight', 
            color: '#4682B4',
            risk: 'Moderate',
            description: 'May indicate nutritional deficiency or other health issues'
        },
        healthy: { 
            range: [18.5, 25], 
            status: 'Healthy Weight', 
            color: '#32CD32',
            risk: 'Low',
            description: 'Associated with lowest health risks'
        },
        overweight: { 
            range: [25, 30], 
            status: 'Overweight', 
            color: '#FFA500',
            risk: 'Increased',
            description: 'May increase risk of health conditions'
        },
        obese1: { 
            range: [30, 35], 
            status: 'Obese Class I', 
            color: '#FF6347',
            risk: 'High',
            description: 'Significantly increased health risks'
        },
        obese2: { 
            range: [35, 40], 
            status: 'Obese Class II', 
            color: '#DC143C',
            risk: 'Very High',
            description: 'Substantial health risk increase'
        },
        obese3: { 
            range: [40, Infinity], 
            status: 'Obese Class III', 
            color: '#8B0000',
            risk: 'Extremely High',
            description: 'Severe health risk category'
        }
    };

    // Activity Level Multipliers
    activityMultipliers = {
        sedentary: 1.2,
        moderate: 1.55,
        active: 1.725,
        'very-active': 1.9
    };

    initializeApp() {
        // Set initial values
        this.elements.heightInput.value = this.state.userData.height;
        this.elements.weightInput.value = this.state.userData.weight;
        this.elements.ageInput.value = this.state.userData.age;
        this.elements.heightSlider.value = this.state.userData.height;
        this.elements.weightSlider.value = this.state.userData.weight;

        // Initialize gender and activity selections
        this.updateSelectionStates();
        
        // Perform initial calculation
        this.calculateBMI();
        
        // Update visual feedback
        this.updateVisualFeedback();
    }

    setupEventListeners() {
        // Input synchronization
        this.elements.heightInput.addEventListener('input', () => this.syncHeightInputs());
        this.elements.weightInput.addEventListener('input', () => this.syncWeightInputs());
        this.elements.heightSlider.addEventListener('input', () => this.syncHeightInputs());
        this.elements.weightSlider.addEventListener('input', () => this.syncWeightInputs());

        // Real-time calculations with debouncing
        const debouncedCalculate = this.debounce(() => this.calculateBMI(), 300);
        this.elements.heightInput.addEventListener('input', debouncedCalculate);
        this.elements.weightInput.addEventListener('input', debouncedCalculate);
        this.elements.ageInput.addEventListener('input', debouncedCalculate);

        // Main action buttons
        this.elements.calculateBtn.addEventListener('click', () => this.calculateBMI());
        this.elements.saveResultsBtn.addEventListener('click', () => this.saveResults());
        this.elements.setGoalsBtn.addEventListener('click', () => this.showGoalsModal());
        this.elements.shareResultsBtn.addEventListener('click', () => this.shareResults());

        // Floating action buttons
        this.elements.historyBtn.addEventListener('click', () => this.showHistoryModal());
        this.elements.analyticsBtn.addEventListener('click', () => this.showAnalyticsModal());
        this.elements.exportBtn.addEventListener('click', () => this.showExportModal());

        // Modal controls
        this.elements.closeHistoryModal.addEventListener('click', () => this.hideModal('history'));
        this.elements.closeAnalyticsModal.addEventListener('click', () => this.hideModal('analytics'));
        this.elements.closeGoalsModal.addEventListener('click', () => this.hideModal('goals'));
        this.elements.closeExportModal.addEventListener('click', () => this.hideModal('export'));

        // Gender selection
        document.querySelectorAll('.gender-option').forEach(button => {
            button.addEventListener('click', (e) => {
                this.state.currentGender = e.currentTarget.dataset.gender;
                this.updateSelectionStates();
                this.calculateBMI();
            });
        });

        // Activity level selection
        document.querySelectorAll('.activity-option').forEach(button => {
            button.addEventListener('click', (e) => {
                this.state.currentActivity = e.currentTarget.dataset.activity;
                this.updateSelectionStates();
                this.calculateBMI();
            });
        });

        // Goal setting
        this.elements.saveGoalBtn.addEventListener('click', () => this.saveHealthGoal());
        document.querySelectorAll('.goal-option-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectGoalType(e.currentTarget.dataset.goal);
            });
        });

        // Export functionality
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const exportType = e.currentTarget.querySelector('span').textContent;
                this.exportData(exportType);
            });
        });

        // Modal backdrop clicks
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                    this.hideAllModals();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideAllModals();
            if (e.key === 'Enter' && e.ctrlKey) this.calculateBMI();
        });
    }

    syncHeightInputs() {
        if (this.elements.heightInput.value !== this.elements.heightSlider.value) {
            this.elements.heightSlider.value = this.elements.heightInput.value;
        } else {
            this.elements.heightInput.value = this.elements.heightSlider.value;
        }
        this.updateVisualFeedback();
        this.calculateBMI(); // Add this to ensure BMI updates
    }

    syncWeightInputs() {
        if (this.elements.weightInput.value !== this.elements.weightSlider.value) {
            this.elements.weightSlider.value = this.elements.weightInput.value;
        } else {
            this.elements.weightInput.value = this.elements.weightSlider.value;
        }
        this.updateVisualFeedback();
        this.calculateBMI(); // Add this to ensure BMI updates
    }

    updateVisualFeedback() {
        // Update slider backgrounds
        const heightPercent = ((this.elements.heightInput.value - 50) / 200) * 100;
        const weightPercent = ((this.elements.weightInput.value - 20) / 180) * 100;
        
        this.elements.heightSlider.style.background = 
            `linear-gradient(to right, #2E8B57 ${heightPercent}%, #e0e0e0 ${heightPercent}%)`;
        this.elements.weightSlider.style.background = 
            `linear-gradient(to right, #2E8B57 ${weightPercent}%, #e0e0e0 ${weightPercent}%)`;
    }

    updateSelectionStates() {
        // Update gender selection
        document.querySelectorAll('.gender-option').forEach(button => {
            button.classList.toggle('selected', button.dataset.gender === this.state.currentGender);
        });

        // Update activity selection
        document.querySelectorAll('.activity-option').forEach(button => {
            button.classList.toggle('selected', button.dataset.activity === this.state.currentActivity);
        });
    }

    calculateBMI() {
        console.log('Calculating BMI...'); // Debug log
        
        const height = parseFloat(this.elements.heightInput.value) / 100; // Convert to meters
        const weight = parseFloat(this.elements.weightInput.value);
        const age = parseInt(this.elements.ageInput.value);

        console.log('Input values:', { height, weight, age }); // Debug log

        // Validate inputs
        if (!this.validateInputs(height, weight, age)) {
            this.showNotification('Please enter valid health information', 'warning');
            this.resetResults();
            return;
        }

        // Calculate BMI
        const bmi = weight / (height * height);
        this.state.currentBMI = parseFloat(bmi.toFixed(1));

        console.log('Calculated BMI:', this.state.currentBMI); // Debug log

        // Update display
        this.animateValueChange(this.elements.bmiScoreValue, parseFloat(this.elements.bmiScoreValue.textContent) || 0, this.state.currentBMI, 1000);
        this.updateProgressRing(bmi);
        this.updateHealthCategory(bmi, height);
        this.generateHealthRecommendations(bmi, age, this.state.currentGender, this.state.currentActivity);

        // Update state
        this.state.userData = {
            height: parseFloat(this.elements.heightInput.value),
            weight: weight,
            age: age,
            gender: this.state.currentGender,
            activity: this.state.currentActivity
        };
    }

    validateInputs(height, weight, age) {
        let isValid = true;
        
        // Clear previous errors
        [this.elements.heightInput, this.elements.weightInput, this.elements.ageInput].forEach(input => {
            input.classList.remove('input-error');
        });

        if (isNaN(height) || height <= 0 || height > 2.5) {
            this.elements.heightInput.classList.add('input-error');
            isValid = false;
        }

        if (isNaN(weight) || weight <= 0 || weight > 300) {
            this.elements.weightInput.classList.add('input-error');
            isValid = false;
        }

        if (isNaN(age) || age <= 0 || age > 120) {
            this.elements.ageInput.classList.add('input-error');
            isValid = false;
        }

        return isValid;
    }

    animateValueChange(element, start, end, duration) {
        const startTime = performance.now();
        const change = end - start;
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 4);
            const currentValue = start + (change * easeOut);
            
            element.textContent = currentValue.toFixed(1);
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            } else {
                element.textContent = end.toFixed(1);
            }
        }
        
        requestAnimationFrame(updateValue);
    }

    updateProgressRing(bmi) {
        const maxBMI = 40;
        const progress = Math.min(bmi / maxBMI, 1);
        const circumference = 628;
        const offset = circumference - (progress * circumference);
        
        console.log('Updating progress ring:', { bmi, progress, offset }); // Debug log
        
        // Remove previous classes
        this.elements.bmiProgressRing.classList.remove('underweight', 'healthy', 'overweight', 'obese');
        
        // Determine category and set color
        let categoryClass = 'healthy';
        if (bmi < 18.5) categoryClass = 'underweight';
        else if (bmi >= 25 && bmi < 30) categoryClass = 'overweight';
        else if (bmi >= 30) categoryClass = 'obese';
        
        this.elements.bmiProgressRing.classList.add(categoryClass);
        
        // Set the stroke color based on category
        const colors = {
            underweight: '#4682B4',
            healthy: '#32CD32',
            overweight: '#FFA500',
            obese: '#DC143C'
        };
        
        this.elements.bmiProgressRing.style.stroke = colors[categoryClass];
        this.elements.bmiProgressRing.style.transition = 'stroke-dashoffset 1s ease-out, stroke 0.5s ease';
        this.elements.bmiProgressRing.style.strokeDashoffset = offset;
    }

    updateHealthCategory(bmi, height) {
        let category, description, status, idealWeight;
        
        if (bmi < 16) {
            category = 'Severely Underweight';
            description = 'Your BMI indicates severe underweight. Professional medical consultation is strongly recommended.';
            status = 'High Risk';
            idealWeight = this.calculateIdealWeight(height);
        } else if (bmi >= 16 && bmi < 18.5) {
            category = 'Underweight';
            description = 'You may be underweight. Consider nutritional assessment and healthcare consultation.';
            status = 'Moderate Risk';
            idealWeight = this.calculateIdealWeight(height);
        } else if (bmi >= 18.5 && bmi < 25) {
            category = 'Healthy Weight';
            description = 'Your weight is within the healthy range. Maintain your balanced lifestyle and regular activity.';
            status = 'Optimal';
            idealWeight = 'Within Range';
        } else if (bmi >= 25 && bmi < 30) {
            category = 'Overweight';
            description = 'You may be overweight. Consider lifestyle modifications for improved health outcomes.';
            status = 'Increased Risk';
            idealWeight = this.calculateIdealWeight(height);
        } else if (bmi >= 30 && bmi < 35) {
            category = 'Obese (Class I)';
            description = 'Your BMI indicates obesity. Healthcare professional consultation is recommended.';
            status = 'High Risk';
            idealWeight = this.calculateIdealWeight(height);
        } else if (bmi >= 35 && bmi < 40) {
            category = 'Obese (Class II)';
            description = 'Your BMI indicates severe obesity. Comprehensive medical assessment is advised.';
            status = 'Very High Risk';
            idealWeight = this.calculateIdealWeight(height);
        } else {
            category = 'Obese (Class III)';
            description = 'Your BMI indicates very severe obesity. Immediate medical consultation is essential.';
            status = 'Extreme Risk';
            idealWeight = this.calculateIdealWeight(height);
        }

        // Update display with animations
        this.animateCategoryChange(category, description, status, idealWeight);
    }

    animateCategoryChange(category, description, status, idealWeight) {
        // Animate category title
        this.elements.healthCategoryTitle.style.opacity = '0';
        this.elements.healthCategoryTitle.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            this.elements.healthCategoryTitle.textContent = category;
            this.elements.healthCategoryTitle.style.opacity = '1';
            this.elements.healthCategoryTitle.style.transform = 'translateY(0)';
        }, 200);

        // Animate description
        this.elements.healthCategoryDescription.style.opacity = '0';
        setTimeout(() => {
            this.elements.healthCategoryDescription.textContent = description;
            this.elements.healthCategoryDescription.style.opacity = '1';
        }, 300);

        // Update status and ideal weight
        this.elements.healthStatusValue.textContent = status;
        this.elements.idealWeightValue.textContent = idealWeight;

        // Animate metric cards
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
    }

    calculateIdealWeight(height) {
        const minWeight = (18.5 * height * height).toFixed(1);
        const maxWeight = (24.9 * height * height).toFixed(1);
        return `${minWeight} - ${maxWeight} kg`;
    }

    generateHealthRecommendations(bmi, age, gender, activity) {
        let recommendationsHTML = '';

        if (bmi < 18.5) {
            recommendationsHTML = `
                <h4>💪 Healthy Weight Gain Strategy</h4>
                <ul>
                    <li><strong>Nutrition:</strong> Increase calorie intake with nutrient-dense foods</li>
                    <li><strong>Protein:</strong> Consume 1.2-1.6g protein per kg of body weight daily</li>
                    <li><strong>Exercise:</strong> Strength training 3x weekly to build muscle mass</li>
                    <li><strong>Monitoring:</strong> Regular weight tracking and medical follow-up</li>
                </ul>
                ${age < 25 ? '<p class="age-specific"><strong>Young Adults:</strong> Focus on establishing sustainable eating patterns.</p>' : ''}
            `;
        } else if (bmi >= 18.5 && bmi < 25) {
            recommendationsHTML = `
                <h4>🎯 Weight Maintenance Guidelines</h4>
                <ul>
                    <li><strong>Nutrition:</strong> Balanced diet with variety of food groups</li>
                    <li><strong>Activity:</strong> 150-300 minutes moderate exercise weekly</li>
                    <li><strong>Hydration:</strong> 2-3 liters of water daily</li>
                    <li><strong>Prevention:</strong> Regular health screenings and check-ups</li>
                </ul>
                ${gender === 'female' ? '<p class="gender-specific"><strong>Women\'s Health:</strong> Ensure adequate iron and calcium intake.</p>' : ''}
            `;
        } else {
            recommendationsHTML = `
                <h4>🏃 Sustainable Weight Management</h4>
                <ul>
                    <li><strong>Nutrition:</strong> Create 500-calorie daily deficit for gradual loss</li>
                    <li><strong>Exercise:</strong> Combine cardio and strength training</li>
                    <li><strong>Behavior:</strong> Mindful eating and portion control strategies</li>
                    <li><strong>Support:</strong> Consider professional guidance and support systems</li>
                </ul>
                ${age > 40 ? '<p class="age-specific"><strong>Adults 40+:</strong> Include resistance training for muscle preservation.</p>' : ''}
            `;
        }

        // Add activity-specific recommendations
        const activityTips = {
            sedentary: 'Gradually increase daily movement and reduce sitting time.',
            moderate: 'Maintain current activity level and consider adding variety.',
            active: 'Excellent activity level - focus on consistency and recovery.',
            'very-active': 'Ensure adequate rest and nutrition to support high activity levels.'
        };

        recommendationsHTML += `<p class="activity-specific"><strong>Activity Advice:</strong> ${activityTips[activity]}</p>`;

        // Animate recommendations display
        this.elements.healthRecommendations.style.opacity = '0';
        setTimeout(() => {
            this.elements.healthRecommendations.innerHTML = recommendationsHTML;
            this.elements.healthRecommendations.style.opacity = '1';
        }, 400);
    }

    saveResults() {
        if (this.state.currentBMI === 0) {
            this.showNotification('Please calculate BMI before saving', 'warning');
            return;
        }

        const timestamp = new Date();
        const record = {
            id: Date.now(),
            date: timestamp.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            timestamp: timestamp.getTime(),
            height: this.state.userData.height,
            weight: this.state.userData.weight,
            bmi: this.state.currentBMI,
            age: this.state.userData.age,
            gender: this.state.userData.gender,
            category: this.elements.healthCategoryTitle.textContent
        };

        this.state.calculationHistory.unshift(record);
        
        // Keep last 20 records
        if (this.state.calculationHistory.length > 20) {
            this.state.calculationHistory = this.state.calculationHistory.slice(0, 20);
        }

        // Save to localStorage
        this.saveToLocalStorage();
        
        // Update history display
        this.renderHistory();
        
        // Show confirmation
        this.showNotification('Health record saved successfully', 'success');
        
        // Visual feedback
        this.elements.saveResultsBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            this.elements.saveResultsBtn.innerHTML = '<i class="fas fa-save"></i> Save Results';
        }, 2000);
    }

    showHistoryModal() {
        this.renderHistory();
        this.showModal('history');
    }

    showAnalyticsModal() {
        if (this.state.calculationHistory.length < 2) {
            this.showNotification('Need at least 2 records for analytics', 'info');
            return;
        }
        this.updateAnalytics();
        this.showModal('analytics');
    }

    showGoalsModal() {
        this.showModal('goals');
    }

    showExportModal() {
        this.showModal('export');
    }

    showModal(modalType) {
        this.hideAllModals();
        const modal = this.elements[`${modalType}Modal`];
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalType) {
        const modal = this.elements[`${modalType}Modal`];
        if (modal) {
            modal.style.display = 'none';
        }
        document.body.style.overflow = '';
    }

    hideAllModals() {
        Object.keys(this.elements).forEach(key => {
            if (key.endsWith('Modal')) {
                this.elements[key].style.display = 'none';
            }
        });
        document.body.style.overflow = '';
    }

    renderHistory() {
        if (this.state.calculationHistory.length === 0) {
            this.elements.historyListContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No Records Yet</h3>
                    <p>Your BMI measurements will appear here</p>
                </div>
            `;
            return;
        }

        this.elements.historyListContainer.innerHTML = this.state.calculationHistory.map((record, index) => {
            let categoryClass = '';
            if (record.bmi < 18.5) categoryClass = 'underweight';
            else if (record.bmi >= 18.5 && record.bmi < 25) categoryClass = 'healthy';
            else if (record.bmi >= 25 && record.bmi < 30) categoryClass = 'overweight';
            else categoryClass = 'obese';

            return `
                <div class="history-item" style="animation-delay: ${index * 50}ms">
                    <div class="record-info">
                        <div class="record-date">${record.date}</div>
                        <div class="record-details">${record.height}cm • ${record.weight}kg • ${record.age}y</div>
                    </div>
                    <div class="record-results">
                        <div class="record-bmi">${record.bmi}</div>
                        <div class="record-category ${categoryClass}">${record.category.split(' ')[0]}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Animate history items
        const historyItems = this.elements.historyListContainer.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
                item.style.transition = 'all 0.3s ease';
            }, 100);
        });
    }

    updateAnalytics() {
        if (this.state.calculationHistory.length < 2) return;

        const bmiValues = this.state.calculationHistory.map(record => record.bmi);
        const averageBMI = (bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length).toFixed(1);
        const totalChange = (bmiValues[0] - bmiValues[bmiValues.length - 1]).toFixed(1);
        
        // Calculate progress score (0-100%)
        let progressScore = 50; // Default middle value
        if (bmiValues.length >= 5) {
            const recent = bmiValues.slice(0, 5);
            const improvements = recent.filter((val, idx) => idx > 0 && val < recent[idx - 1]).length;
            progressScore = Math.round((improvements / (recent.length - 1)) * 100);
        }

        this.elements.averageBmi.textContent = averageBMI;
        this.elements.totalChange.textContent = totalChange;
        this.elements.progressScore.textContent = `${progressScore}%`;

        // Update chart if available
        this.updateTrendsChart();
    }

    updateTrendsChart() {
        const ctx = document.getElementById('health-trends-chart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: this.state.calculationHistory.map(record => 
                    new Date(record.timestamp).toLocaleDateString()
                ).reverse(),
                datasets: [{
                    label: 'BMI Trend',
                    data: this.state.calculationHistory.map(record => record.bmi).reverse(),
                    borderColor: '#2E8B57',
                    backgroundColor: 'rgba(46, 139, 87, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: '#2E8B57',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: false 
                    },
                    tooltip: {
                        backgroundColor: 'rgba(46, 139, 87, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#2E8B57',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6C757D'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6C757D'
                        }
                    }
                }
            }
        });
    }

    selectGoalType(goalType) {
        document.querySelectorAll('.goal-option-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        // Set default target weight based on goal type
        const currentWeight = this.state.userData.weight;
        let targetWeight = currentWeight;
        
        switch(goalType) {
            case 'lose':
                targetWeight = Math.max(currentWeight - 5, this.state.userData.height - 100); // Minimum healthy weight
                break;
            case 'gain':
                targetWeight = currentWeight + 5;
                break;
            case 'maintain':
                targetWeight = currentWeight;
                break;
        }
        
        this.elements.targetWeight.value = targetWeight.toFixed(1);
        
        // Set target date (default 3 months from now)
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 3);
        this.elements.targetDate.value = targetDate.toISOString().split('T')[0];
    }

    saveHealthGoal() {
        const goalType = document.querySelector('.goal-option-card.selected')?.dataset.goal;
        const targetWeight = parseFloat(this.elements.targetWeight.value);
        const targetDate = this.elements.targetDate.value;

        if (!goalType || !targetWeight || !targetDate) {
            this.showNotification('Please complete all goal fields', 'warning');
            return;
        }

        this.state.healthGoals = {
            type: goalType,
            targetWeight: targetWeight,
            targetDate: targetDate,
            startWeight: this.state.userData.weight,
            startDate: new Date().toISOString()
        };

        this.saveToLocalStorage();
        this.hideModal('goals');
        this.showNotification('Health goal saved successfully', 'success');
    }

    exportData(exportType) {
        const data = {
            exportDate: new Date().toISOString(),
            app: 'HealthMetric Pro',
            version: '1.0',
            userData: this.state.userData,
            currentBMI: this.state.currentBMI,
            calculationHistory: this.state.calculationHistory,
            healthGoals: this.state.healthGoals
        };

        let blob, filename, mimeType;

        switch(exportType) {
            case 'PDF Report':
                this.exportAsPDF(data);
                return;
            case 'CSV Data':
                const csv = this.convertToCSV(data);
                blob = new Blob([csv], { type: 'text/csv' });
                filename = `healthmetric-data-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'Excel Spreadsheet':
                // For Excel, we'll create a CSV that can be opened in Excel
                const excelData = this.convertToExcel(data);
                blob = new Blob([excelData], { type: 'application/vnd.ms-excel' });
                filename = `healthmetric-data-${new Date().toISOString().split('T')[0]}.xls`;
                mimeType = 'application/vnd.ms-excel';
                break;
            default:
                // Default to JSON
                blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                filename = `healthmetric-data-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
        }

        this.downloadFile(blob, filename, mimeType);
        this.hideModal('export');
        this.showNotification(`${exportType} downloaded successfully`, 'success');
    }

    convertToCSV(data) {
        let csv = 'HealthMetric Pro Export\n\n';
        csv += 'User Information:\n';
        csv += `Height,${data.userData.height} cm\n`;
        csv += `Weight,${data.userData.weight} kg\n`;
        csv += `Age,${data.userData.age} years\n`;
        csv += `Gender,${data.userData.gender}\n`;
        csv += `Activity Level,${data.userData.activity}\n`;
        csv += `Current BMI,${data.currentBMI}\n\n`;

        csv += 'Calculation History:\n';
        csv += 'Date,Height (cm),Weight (kg),BMI,Category\n';
        data.calculationHistory.forEach(record => {
            csv += `"${record.date}",${record.height},${record.weight},${record.bmi},"${record.category}"\n`;
        });

        return csv;
    }

    convertToExcel(data) {
        // Simple tab-delimited format that Excel can open
        let excel = 'HealthMetric Pro Export\t\t\t\t\n\n';
        excel += 'User Information:\t\t\t\t\n';
        excel += `Height\t${data.userData.height} cm\t\t\t\n`;
        excel += `Weight\t${data.userData.weight} kg\t\t\t\n`;
        excel += `Age\t${data.userData.age} years\t\t\t\n`;
        excel += `Gender\t${data.userData.gender}\t\t\t\n`;
        excel += `Activity Level\t${data.userData.activity}\t\t\t\n`;
        excel += `Current BMI\t${data.currentBMI}\t\t\t\n\n`;

        excel += 'Calculation History:\t\t\t\t\n';
        excel += 'Date\tHeight (cm)\tWeight (kg)\tBMI\tCategory\n';
        data.calculationHistory.forEach(record => {
            excel += `"${record.date}"\t${record.height}\t${record.weight}\t${record.bmi}\t"${record.category}"\n`;
        });

        return excel;
    }

    exportAsPDF(data) {
        // Create a simple PDF-like report
        let pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>HealthMetric Pro Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; color: #2E8B57; border-bottom: 2px solid #2E8B57; padding-bottom: 20px; }
                    .section { margin: 30px 0; }
                    .section h2 { color: #2E8B57; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f8f9fa; }
                    .bmi-score { font-size: 2em; color: #2E8B57; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>HealthMetric Pro Report</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="section">
                    <h2>Current Health Status</h2>
                    <p><strong>BMI Score:</strong> <span class="bmi-score">${data.currentBMI}</span></p>
                    <p><strong>Height:</strong> ${data.userData.height} cm</p>
                    <p><strong>Weight:</strong> ${data.userData.weight} kg</p>
                    <p><strong>Age:</strong> ${data.userData.age} years</p>
                    <p><strong>Gender:</strong> ${data.userData.gender}</p>
                    <p><strong>Activity Level:</strong> ${data.userData.activity}</p>
                </div>
        `;

        if (data.calculationHistory.length > 0) {
            pdfContent += `
                <div class="section">
                    <h2>Measurement History</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Height (cm)</th>
                                <th>Weight (kg)</th>
                                <th>BMI</th>
                                <th>Category</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            data.calculationHistory.forEach(record => {
                pdfContent += `
                    <tr>
                        <td>${record.date}</td>
                        <td>${record.height}</td>
                        <td>${record.weight}</td>
                        <td>${record.bmi}</td>
                        <td>${record.category}</td>
                    </tr>
                `;
            });
            
            pdfContent += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        pdfContent += `
            </body>
            </html>
        `;

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            this.showNotification('PDF report generated for printing', 'success');
        }, 500);
        
        this.hideModal('export');
    }

    downloadFile(blob, filename, mimeType) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    shareResults() {
        const result = {
            bmi: this.state.currentBMI,
            category: this.elements.healthCategoryTitle.textContent,
            message: `My HealthMetric Pro Results: BMI ${this.state.currentBMI} - ${this.elements.healthCategoryTitle.textContent}`
        };

        if (navigator.share) {
            navigator.share({
                title: 'My Health Results',
                text: result.message,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(result.message).then(() => {
                this.showNotification('Results copied to clipboard', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = result.message;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Results copied to clipboard', 'success');
            });
        }
    }

    resetResults() {
        this.elements.bmiScoreValue.textContent = '00.0';
        this.elements.healthCategoryTitle.textContent = 'Ready for Analysis';
        this.elements.healthCategoryDescription.textContent = 'Enter your details to begin health assessment';
        this.elements.healthStatusValue.textContent = '-';
        this.elements.idealWeightValue.textContent = '-';
        this.elements.bmiProgressRing.style.strokeDashoffset = '628';
        this.elements.bmiProgressRing.style.stroke = '#4CD964';
        this.elements.healthRecommendations.innerHTML = '<p>Complete your profile to receive personalized health guidance.</p>';
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.health-notification').forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `health-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    loadUserData() {
        const savedHistory = localStorage.getItem('healthMetricHistory');
        const savedGoals = localStorage.getItem('healthMetricGoals');
        const savedPreferences = localStorage.getItem('healthMetricPreferences');

        if (savedHistory) {
            this.state.calculationHistory = JSON.parse(savedHistory);
        }
        if (savedGoals) {
            this.state.healthGoals = JSON.parse(savedGoals);
        }
        if (savedPreferences) {
            this.state.userPreferences = JSON.parse(savedPreferences);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('healthMetricHistory', JSON.stringify(this.state.calculationHistory));
        localStorage.setItem('healthMetricGoals', JSON.stringify(this.state.healthGoals));
        localStorage.setItem('healthMetricPreferences', JSON.stringify(this.state.userPreferences));
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HealthMetricPro();
});

// Add notification styles dynamically
const notificationStyles = `
    .health-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 10000;
        border-left: 4px solid #2E8B57;
        max-width: 320px;
    }
    
    .health-notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-success {
        border-left-color: #32CD32;
    }
    
    .notification-error {
        border-left-color: #DC143C;
    }
    
    .notification-warning {
        border-left-color: #FFA500;
    }
    
    .notification-info {
        border-left-color: #4682B4;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification-success .notification-content i { color: #32CD32; }
    .notification-error .notification-content i { color: #DC143C; }
    .notification-warning .notification-content i { color: #FFA500; }
    .notification-info .notification-content i { color: #4682B4; }
    
    .input-error {
        border-color: #DC143C !important;
        box-shadow: 0 0 0 3px rgba(220, 20, 60, 0.1) !important;
    }
`;

const style = document.createElement('style');
style.textContent = notificationStyles;
document.head.appendChild(style);