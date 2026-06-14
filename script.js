// World Cup Predictor Dashboard - JavaScript
// Handles all interactive functionality

const API_BASE = 'http://localhost:5000/api';

// State Management
const state = {
    teams: [],
    argentina_predictions: null,
    tournament_predictions: null,
    currentSection: 'argentina'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadTeams();
    loadArgentiaPredictions();
    loadTournamentWinner();
});

// Navigation Setup
function initializeNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Mark button as active
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

    state.currentSection = sectionId;
}

// ============================================
// Argentina Group Stage Section
// ============================================

async function loadArgentiaPredictions() {
    try {
        const response = await fetch(`${API_BASE}/predict-argentina-group`);
        const data = await response.json();

        if (data.matches) {
            state.argentina_predictions = data.matches;
            displayArgentiaPredictions(data.matches);
        }
    } catch (error) {
        console.error('Error loading Argentina predictions:', error);
        showError('argentina-grid', 'Failed to load Argentina predictions');
    }
}

function displayArgentiaPredictions(matches) {
    const container = document.getElementById('argentina-grid');
    const loading = document.getElementById('argentina-loading');

    loading.style.display = 'none';
    container.innerHTML = '';

    matches.forEach((match, index) => {
        if (match.error) return;

        const card = createMatchCard(match, index + 1);
        container.appendChild(card);
    });
}

function createMatchCard(prediction, matchNumber) {
    const card = document.createElement('div');
    card.className = 'match-card';

    const goals1 = Math.round(prediction.predicted_goals_team1);
    const goals2 = Math.round(prediction.predicted_goals_team2);

    const winnerBadge = prediction.winner !== 'Draw'
        ? `<span class="winner-badge">🏆 ${prediction.winner}</span>`
        : `<span class="winner-badge" style="background: #8b5cf6;">🤝 Draw Expected</span>`;

    const confidencePercent = prediction.confidence;
    const confidenceColor = getConfidenceColor(confidencePercent);

    card.innerHTML = `
        <div class="match-header">
            <div class="team-names">
                <strong>${prediction.team1}</strong>
                <span class="vs-text">vs</span>
                <strong>${prediction.team2}</strong>
            </div>
            <span class="match-id">Match ${matchNumber}</span>
        </div>

        <div class="score-prediction" style="background: linear-gradient(135deg, ${getTeamColor(prediction.team1)}, ${getTeamColor(prediction.team2)});">
            <div class="score-display">${goals1} : ${goals2}</div>
            <div class="score-label">Predicted Final Score</div>
        </div>

        <div class="prediction-details">
            <div class="detail-box">
                <div class="detail-label">${prediction.team1}</div>
                <div class="detail-value">${(prediction.team1_win_probability * 100).toFixed(1)}%</div>
            </div>
            <div class="detail-box">
                <div class="detail-label">Draw</div>
                <div class="detail-value">${(prediction.draw_probability * 100).toFixed(1)}%</div>
            </div>
            <div class="detail-box">
                <div class="detail-label">${prediction.team2}</div>
                <div class="detail-value">${(prediction.team2_win_probability * 100).toFixed(1)}%</div>
            </div>
        </div>

        <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidencePercent}%; background: linear-gradient(90deg, ${confidenceColor}, ${getTeamColor(prediction.winner)});"></div>
        </div>

        <p style="text-align: center; color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px;">Confidence: ${confidencePercent}%</p>

        ${winnerBadge}
    `;

    return card;
}

// ============================================
// Tournament Winner Section
// ============================================

async function loadTournamentWinner() {
    try {
        const response = await fetch(`${API_BASE}/predict-tournament-winner`);
        const data = await response.json();

        if (data.predictions) {
            state.tournament_predictions = data;
            displayTournamentWinner(data);
        }
    } catch (error) {
        console.error('Error loading tournament predictions:', error);
        showError('tournament-container', 'Failed to load tournament predictions');
    }
}

function displayTournamentWinner(data) {
    const loading = document.getElementById('tournament-loading');
    const favoriteCard = document.getElementById('favorite-card');
    const topTeams = document.getElementById('top-teams');

    loading.style.display = 'none';

    // Favorite Card
    const favorite = data.favorite;
    const favoriteProb = data.predictions[favorite];

    favoriteCard.innerHTML = `
        <div class="favorite-label">🏆 Tournament Favorite</div>
        <div class="favorite-team">${favorite}</div>
        <div class="favorite-odds">
            ${(favoriteProb * 100).toFixed(1)}% Chance
        </div>
    `;

    // Top Teams List
    topTeams.innerHTML = '';

    const sortedTeams = Object.entries(data.predictions).sort((a, b) => b[1] - a[1]);

    sortedTeams.forEach((entry, index) => {
        const [team, probability] = entry;
        const rank = index + 1;

        let rankClass = '';
        if (rank === 1) rankClass = 'gold';
        else if (rank === 2) rankClass = 'silver';
        else if (rank === 3) rankClass = 'bronze';

        const teamRank = document.createElement('div');
        teamRank.className = 'team-rank';
        teamRank.style.animationDelay = `${index * 0.1}s`;

        const probabilityPercent = (probability * 100).toFixed(1);

        teamRank.innerHTML = `
            <div class="rank-position ${rankClass}">
                ${rank <= 3 ? getMedalEmoji(rank) : rank}
            </div>
            <div class="team-name-rank">${team}</div>
            <div class="team-probability">${probabilityPercent}%</div>
            <div class="probability-bar" style="width: 100%; margin: 0;">
                <div class="probability-fill" style="width: ${probabilityPercent}%;"></div>
            </div>
        `;

        topTeams.appendChild(teamRank);
    });
}

// ============================================
// Match Predictor Section
// ============================================

function initializeMatchPredictor() {
    const team1Input = document.getElementById('team1');
    const team2Input = document.getElementById('team2');
    const predictBtn = document.getElementById('btn-predict');

    // Autocomplete listeners
    team1Input.addEventListener('input', (e) => {
        handleAutocomplete(e, 'team1-list');
    });

    team2Input.addEventListener('input', (e) => {
        handleAutocomplete(e, 'team2-list');
    });

    // Predict button
    predictBtn.addEventListener('click', predictCustomMatch);

    // Close autocomplete on blur
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.team-input')) {
            document.querySelectorAll('.autocomplete-list').forEach(list => {
                list.classList.remove('show');
            });
        }
    });
}

function handleAutocomplete(event, listId) {
    const input = event.target.value.toLowerCase();
    const list = document.getElementById(listId);

    if (input.length === 0) {
        list.classList.remove('show');
        return;
    }

    const filtered = state.teams.filter(team =>
        team.toLowerCase().includes(input)
    );

    list.innerHTML = '';
    list.classList.add('show');

    filtered.forEach(team => {
        const li = document.createElement('li');
        li.textContent = team;
        li.addEventListener('click', () => {
            const inputField = listId === 'team1-list'
                ? document.getElementById('team1')
                : document.getElementById('team2');
            inputField.value = team;
            list.classList.remove('show');
        });
        list.appendChild(li);
    });

    if (filtered.length === 0) {
        list.classList.remove('show');
    }
}

async function predictCustomMatch() {
    const team1 = document.getElementById('team1').value.trim();
    const team2 = document.getElementById('team2').value.trim();
    const neutralVenue = document.getElementById('neutral-venue').checked;
    const resultDiv = document.getElementById('match-result');

    if (!team1 || !team2) {
        showError('match-result', 'Please enter both team names');
        return;
    }

    if (team1 === team2) {
        showError('match-result', 'Teams must be different');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/predict-match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                team1: team1,
                team2: team2,
                neutral_venue: neutralVenue
            })
        });

        const data = await response.json();

        if (data.error) {
            showError('match-result', data.error);
            return;
        }

        displayMatchResult(data);
    } catch (error) {
        console.error('Error predicting match:', error);
        showError('match-result', 'Error predicting match. Please try again.');
    }
}

function displayMatchResult(prediction) {
    const resultDiv = document.getElementById('match-result');
    const goals1 = Math.round(prediction.predicted_goals_team1);
    const goals2 = Math.round(prediction.predicted_goals_team2);

    const winnerText = prediction.winner === 'Draw'
        ? '🤝 Draw Expected'
        : `🏆 ${prediction.winner} to Win`;

    resultDiv.innerHTML = `
        <div class="match-result-content">
            <div class="result-teams">
                ${prediction.team1} vs ${prediction.team2}
            </div>
            <div class="result-score">${goals1} : ${goals2}</div>
            <div class="result-winner">${winnerText}</div>
            
            <div class="probabilities-grid">
                <div class="prob-item">
                    <div class="prob-label">${prediction.team1} Win</div>
                    <div class="prob-value">${(prediction.team1_win_probability * 100).toFixed(1)}%</div>
                </div>
                <div class="prob-item">
                    <div class="prob-label">Draw</div>
                    <div class="prob-value">${(prediction.draw_probability * 100).toFixed(1)}%</div>
                </div>
                <div class="prob-item">
                    <div class="prob-label">${prediction.team2} Win</div>
                    <div class="prob-value">${(prediction.team2_win_probability * 100).toFixed(1)}%</div>
                </div>
            </div>
        </div>
    `;

    resultDiv.classList.add('show');
}

// ============================================
// Team Stats Section
// ============================================

function initializeTeamStats() {
    const statsSearch = document.getElementById('stats-search');

    statsSearch.addEventListener('input', (e) => {
        handleAutocomplete(e, 'stats-list');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.stats-search')) {
            document.getElementById('stats-list').classList.remove('show');
        }
    });

    // Add click handler to autocomplete items
    document.addEventListener('click', (e) => {
        if (e.target.closest('#stats-list li')) {
            const team = e.target.textContent;
            loadTeamStats(team);
        }
    });
}

async function loadTeamStats(teamName) {
    try {
        const response = await fetch(`${API_BASE}/team-stats/${teamName}`);
        const data = await response.json();

        if (data.error) {
            showError('stats-result', data.error);
            return;
        }

        displayTeamStats(data);
    } catch (error) {
        console.error('Error loading team stats:', error);
        showError('stats-result', 'Error loading team statistics');
    }
}

function displayTeamStats(teamData) {
    const resultDiv = document.getElementById('stats-result');

    resultDiv.innerHTML = `
        <div class="stats-card">
            <div class="stats-team-name">${teamData.team}</div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">FIFA Rating</div>
                    <div class="stat-value">${teamData.rating}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Current Form</div>
                    <div class="stat-value">${teamData.current_form}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Home Advantage</div>
                    <div class="stat-value">${teamData.home_advantage}</div>
                </div>
            </div>
        </div>
    `;

    resultDiv.classList.add('show');
}

// ============================================
// Utility Functions
// ============================================

async function loadTeams() {
    try {
        const response = await fetch(`${API_BASE}/teams`);
        const data = await response.json();

        if (data.teams) {
            state.teams = data.teams;
            initializeMatchPredictor();
            initializeTeamStats();
        }
    } catch (error) {
        console.error('Error loading teams:', error);
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `❌ ${message}`;
    container.innerHTML = '';
    container.appendChild(errorDiv);
}

function getTeamColor(teamName) {
    const colors = {
        'Argentina': '#1e3a8a',
        'Brazil': '#7c2d12',
        'France': '#1e40af',
        'Germany': '#1f2937',
        'England': '#991b1b',
        'Spain': '#dc2626',
        'Italy': '#065f46',
    };
    return colors[teamName] || '#0369a1';
}

function getConfidenceColor(confidence) {
    if (confidence >= 80) return '#10b981';
    if (confidence >= 60) return '#f59e0b';
    return '#ef4444';
}

function getMedalEmoji(rank) {
    const medals = {
        1: '🥇',
        2: '🥈',
        3: '🥉'
    };
    return medals[rank] || '•';
}
