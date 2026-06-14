"""
World Cup Score Predictor - Flask Backend API
Provides AI-powered predictions for World Cup matches and tournament outcomes
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# ============================================
# Sample Data & Configuration
# ============================================

WORLD_CUP_TEAMS = [
    'Argentina', 'Brazil', 'France', 'Germany', 'England', 'Spain', 
    'Italy', 'Netherlands', 'Belgium', 'Portugal', 'Poland', 'Mexico',
    'Japan', 'South Korea', 'Uruguay', 'Croatia', 'Denmark', 'Sweden',
    'Switzerland', 'Austria', 'Czech Republic', 'Wales', 'Scotland', 'Hungary',
    'Norway', 'Finland', 'Iceland', 'Greece', 'Turkey', 'Russia',
    'Ukraine', 'Serbia', 'Romania', 'Bulgaria', 'Slovenia', 'Slovakia',
    'Cameroon', 'Ghana', 'Nigeria', 'Senegal', 'Morocco', 'Tunisia',
    'Egypt', 'South Africa', 'Kenya', 'Algeria', 'Mali', 'Ivory Coast',
    'Australia', 'New Zealand', 'Saudi Arabia', 'Iran', 'Iraq', 'Qatar',
    'United States', 'Canada', 'Costa Rica', 'Honduras', 'Jamaica', 'Panama'
]

# Team statistics (simulated FIFA-like ratings)
TEAM_STATS = {
    'Argentina': {'rating': 92, 'form': 8.5, 'home_advantage': 1.15},
    'Brazil': {'rating': 91, 'form': 8.8, 'home_advantage': 1.12},
    'France': {'rating': 89, 'form': 8.2, 'home_advantage': 1.18},
    'Germany': {'rating': 88, 'form': 7.9, 'home_advantage': 1.20},
    'England': {'rating': 87, 'form': 8.1, 'home_advantage': 1.15},
    'Spain': {'rating': 86, 'form': 8.0, 'home_advantage': 1.17},
    'Italy': {'rating': 85, 'form': 7.8, 'home_advantage': 1.16},
    'Netherlands': {'rating': 84, 'form': 8.3, 'home_advantage': 1.14},
    'Belgium': {'rating': 83, 'form': 7.6, 'home_advantage': 1.12},
    'Portugal': {'rating': 82, 'form': 8.2, 'home_advantage': 1.10},
}

# Argentina's group stage matches (simulated)
ARGENTINA_GROUP_MATCHES = [
    {'team1': 'Argentina', 'team2': 'Saudi Arabia'},
    {'team1': 'Argentina', 'team2': 'Mexico'},
    {'team1': 'Argentina', 'team2': 'Poland'},
]

# ============================================
# Prediction Models
# ============================================

def get_team_stats(team_name):
    """Get team statistics with fallback to default values"""
    if team_name in TEAM_STATS:
        return TEAM_STATS[team_name]
    else:
        # Generate pseudo-random stats based on team name hash
        hash_val = sum(ord(c) for c in team_name) % 100
        return {
            'rating': 70 + hash_val % 20,
            'form': 6.0 + (hash_val % 30) / 10,
            'home_advantage': 1.08 + (hash_val % 12) / 100
        }


def predict_match(team1, team2, neutral_venue=False, is_home_match=False):
    """
    Predict match outcome using Poisson distribution
    Returns predicted goals and win probabilities
    """
    stats1 = get_team_stats(team1)
    stats2 = get_team_stats(team2)
    
    # Base ratings
    rating1 = stats1['rating']
    rating2 = stats2['rating']
    
    # Normalize ratings to attack/defense capabilities
    attack1 = (rating1 / 100) * 2.5
    attack2 = (rating2 / 100) * 2.5
    
    defense1 = (rating1 / 100) * 1.0
    defense2 = (rating2 / 100) * 1.0
    
    # Current form factor
    form1 = 0.8 + (stats1['form'] / 10) * 0.2
    form2 = 0.8 + (stats2['form'] / 10) * 0.2
    
    # Home advantage
    home_factor = stats1['home_advantage'] if is_home_match and not neutral_venue else 1.0
    
    # Expected goals using Poisson model
    expected_goals1 = (attack1 * form1 / defense2) * home_factor
    expected_goals2 = (attack2 * form2 / defense1)
    
    # Add small random variation
    np.random.seed(int(datetime.now().timestamp() * 1000) % (2**31))
    goals1 = np.random.poisson(expected_goals1)
    goals2 = np.random.poisson(expected_goals2)
    
    # Clamp to realistic range
    goals1 = max(0, min(goals1, 6))
    goals2 = max(0, min(goals2, 6))
    
    # Calculate win probabilities using logistic regression
    goal_diff = goals1 - goals2
    
    # Sigmoid function for probability
    def sigmoid(x):
        return 1 / (1 + np.exp(-x / 2))
    
    team1_win_prob = sigmoid(goal_diff + 0.3)  # Small bias towards home team
    draw_prob = 0.25 * (1 - abs(goal_diff) / 6)  # Higher for close matches
    team2_win_prob = 1 - team1_win_prob - draw_prob
    
    # Clamp probabilities
    draw_prob = max(0, min(draw_prob, 0.3))
    team1_win_prob = (1 - draw_prob) * team1_win_prob / (team1_win_prob + team2_win_prob)
    team2_win_prob = 1 - team1_win_prob - draw_prob
    
    # Determine winner
    if goals1 > goals2:
        winner = team1
    elif goals2 > goals1:
        winner = team2
    else:
        winner = 'Draw'
    
    # Confidence score (0-100)
    max_prob = max(team1_win_prob, team2_win_prob, draw_prob)
    confidence = int(min(100, 50 + max_prob * 50))
    
    return {
        'team1': team1,
        'team2': team2,
        'predicted_goals_team1': expected_goals1,
        'predicted_goals_team2': expected_goals2,
        'team1_win_probability': max(0, min(1, team1_win_prob)),
        'team2_win_probability': max(0, min(1, team2_win_prob)),
        'draw_probability': max(0, min(1, draw_prob)),
        'winner': winner,
        'confidence': confidence
    }


def predict_tournament_winner():
    """Predict tournament winner based on team ratings"""
    predictions = {}
    
    # Get top 16 teams for tournament
    tournament_teams = list(TEAM_STATS.keys())[:16]
    
    # Also add a few other strong teams
    if 'Poland' not in tournament_teams:
        tournament_teams.append('Poland')
    if 'Mexico' not in tournament_teams:
        tournament_teams.append('Mexico')
    
    total_rating = 0
    ratings = {}
    
    for team in tournament_teams:
        rating = get_team_stats(team)['rating']
        ratings[team] = rating
        total_rating += rating
    
    # Convert ratings to tournament win probabilities
    # Using power law: stronger teams have exponentially higher chances
    for team in tournament_teams:
        rating = ratings[team]
        # Exponential weighting favors top teams
        probability = (rating / 80) ** 2.5
        predictions[team] = probability
    
    # Normalize to sum to 1
    total_prob = sum(predictions.values())
    predictions = {team: prob / total_prob for team, prob in predictions.items()}
    
    # Sort by probability
    sorted_predictions = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
    favorite = sorted_predictions[0][0]
    
    return {
        'favorite': favorite,
        'favorite_probability': predictions[favorite],
        'predictions': predictions
    }


# ============================================
# API Routes
# ============================================

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Get list of all World Cup teams"""
    return jsonify({
        'teams': sorted(WORLD_CUP_TEAMS),
        'count': len(WORLD_CUP_TEAMS)
    })


@app.route('/api/predict-match', methods=['POST'])
def predict_match_endpoint():
    """Predict a custom match outcome"""
    try:
        data = request.get_json()
        
        team1 = data.get('team1', '').strip()
        team2 = data.get('team2', '').strip()
        neutral_venue = data.get('neutral_venue', False)
        
        if not team1 or not team2:
            return jsonify({'error': 'Both team names are required'}), 400
        
        if team1.lower() == team2.lower():
            return jsonify({'error': 'Teams must be different'}), 400
        
        # Check if teams are valid (case-insensitive)
        valid_teams = [t.lower() for t in WORLD_CUP_TEAMS]
        team1_valid = team1.lower() in valid_teams
        team2_valid = team2.lower() in valid_teams
        
        if not team1_valid or not team2_valid:
            invalid = team1 if not team1_valid else team2
            return jsonify({'error': f'Team "{invalid}" not found in World Cup teams'}), 400
        
        # Get properly capitalized team names
        team1_proper = next(t for t in WORLD_CUP_TEAMS if t.lower() == team1.lower())
        team2_proper = next(t for t in WORLD_CUP_TEAMS if t.lower() == team2.lower())
        
        prediction = predict_match(team1_proper, team2_proper, neutral_venue)
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict-argentina-group', methods=['GET'])
def predict_argentina_group():
    """Predict Argentina's group stage matches"""
    try:
        matches = []
        for match in ARGENTINA_GROUP_MATCHES:
            prediction = predict_match(
                match['team1'],
                match['team2'],
                neutral_venue=False,
                is_home_match=True
            )
            matches.append(prediction)
        
        return jsonify({
            'matches': matches,
            'total_matches': len(matches)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/predict-tournament-winner', methods=['GET'])
def predict_tournament_winner_endpoint():
    """Predict tournament winner probabilities"""
    try:
        prediction = predict_tournament_winner()
        return jsonify(prediction)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/team-stats/<team_name>', methods=['GET'])
def get_team_stats_endpoint(team_name):
    """Get detailed statistics for a team"""
    try:
        team_name_proper = None
        
        # Find team (case-insensitive)
        for team in WORLD_CUP_TEAMS:
            if team.lower() == team_name.lower():
                team_name_proper = team
                break
        
        if not team_name_proper:
            return jsonify({'error': f'Team "{team_name}" not found'}), 404
        
        stats = get_team_stats(team_name_proper)
        
        return jsonify({
            'team': team_name_proper,
            'rating': stats['rating'],
            'current_form': round(stats['form'], 2),
            'home_advantage': round(stats['home_advantage'], 3)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'World Cup Predictor API is running',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/', methods=['GET'])
def root():
    """API documentation"""
    return jsonify({
        'name': 'World Cup Score Predictor API',
        'version': '1.0.0',
        'endpoints': {
            'GET /api/teams': 'Get list of all World Cup teams',
            'POST /api/predict-match': 'Predict a custom match outcome',
            'GET /api/predict-argentina-group': 'Predict Argentina\'s group stage matches',
            'GET /api/predict-tournament-winner': 'Predict tournament winner probabilities',
            'GET /api/team-stats/<team_name>': 'Get statistics for a specific team',
            'GET /api/health': 'Health check',
        }
    })


# ============================================
# Error Handlers
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("World Cup Score Predictor API")
    print("=" * 50)
    print("Starting Flask server on http://localhost:5000")
    print("Documentation: http://localhost:5000/")
    print("=" * 50)
    app.run(debug=True, host='localhost', port=5000)
