# ⚽ World Cup Score Predictor

A sophisticated AI-powered system to predict World Cup match outcomes and tournament winners using statistical models and team ratings.

## 🎯 Features

- **Argentina Group Stage Predictions** - AI predictions for Argentina's matches
- **Tournament Winner Analysis** - Probability analysis for tournament champions  
- **Custom Match Predictor** - Predict outcomes for any team matchup
- **Team Statistics Dashboard** - View FIFA ratings, current form, and home advantage
- **Beautiful Dark UI** - Modern, responsive design with smooth animations
- **Intelligent Predictions** - Uses Poisson distribution and logistic regression models

## 📁 Project Structure

```
Predict-Word-Cup-Scores/
├── index.html          # Main dashboard frontend
├── script.js           # Client-side JavaScript logic
├── styles.css          # UI styling (dark theme)
├── app.py              # Flask backend API server
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/KarringtonLeonard/Predict-Word-Cup-Scores.git
   cd Predict-Word-Cup-Scores
   ```

2. **Create a virtual environment** (recommended)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the Flask backend**
   ```bash
   python app.py
   ```
   
   You should see:
   ```
   ==================================================
   World Cup Score Predictor API
   ==================================================
   Starting Flask server on http://localhost:5000
   Documentation: http://localhost:5000/
   ==================================================
   ```

5. **Open the dashboard** in a new terminal/window:
   
   **Option A: Using Python's built-in server**
   ```bash
   # Windows
   python -m http.server 8000
   
   # macOS/Linux
   python3 -m http.server 8000
   ```
   
   Then open: `http://localhost:8000`

   **Option B: Using Live Server extension (VSCode)**
   - Install "Live Server" extension in VSCode
   - Right-click `index.html` → "Open with Live Server"

   **Option C: Direct file opening**
   - Simply double-click `index.html` to open in your browser

---

## 🔌 API Endpoints

The Flask backend provides the following endpoints:

### 1. Get All Teams
```
GET http://localhost:5000/api/teams
```
Returns list of all World Cup teams.

### 2. Predict Argentina Group Matches
```
GET http://localhost:5000/api/predict-argentina-group
```
Returns AI predictions for Argentina's 3 group stage matches.

### 3. Predict Tournament Winner
```
GET http://localhost:5000/api/predict-tournament-winner
```
Returns tournament winner probabilities for all teams.

### 4. Predict Custom Match
```
POST http://localhost:5000/api/predict-match
Content-Type: application/json

{
  "team1": "Argentina",
  "team2": "France",
  "neutral_venue": false
}
```
Returns prediction for any team matchup.

### 5. Get Team Statistics
```
GET http://localhost:5000/api/team-stats/Argentina
```
Returns detailed stats for a specific team (FIFA rating, form, home advantage).

### 6. Health Check
```
GET http://localhost:5000/api/health
```
Returns API status and timestamp.

---

## 🤖 Prediction Algorithm

The predictor uses multiple statistical models:

1. **Poisson Distribution Model**
   - Calculates expected goals based on team ratings and current form
   - Models realistic goal distributions

2. **Logistic Regression**
   - Converts goal differences to win probabilities
   - Accounts for draw likelihood

3. **Team Rating System**
   - FIFA-like ratings for each team (70-92)
   - Current form factor (6.0-8.8)
   - Home advantage multiplier (1.08-1.20)

4. **Confidence Score**
   - 0-100% confidence in prediction
   - Based on probability spread

---

## 📊 Dashboard Sections

### 🇦🇷 Argentina Group Stage
View AI predictions for Argentina's matches with:
- Predicted final scores
- Win/draw/loss probabilities
- Confidence scores
- Visual confidence bars

### 🏆 Tournament Winner
See tournament predictions featuring:
- Tournament favorite with probability
- Top 20 teams ranked by championship odds
- Medal rankings (🥇🥈🥉)
- Probability bars for each team

### ⚽ Match Predictor
Custom prediction tool:
- Search any World Cup team
- Choose neutral venue option
- Get instant predictions
- View detailed probabilities

### 📈 Team Stats
Detailed team metrics:
- FIFA Ratings
- Current Form (0-10 scale)
- Home Advantage Factor
- Search any team

---

## 🎨 UI Features

- **Dark Theme** - Easy on the eyes with gold accents
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Fade-ins, slides, and pulses
- **Gradient Backgrounds** - Modern visual effects
- **Interactive Elements** - Hover effects and transitions
- **Loading States** - Spinner animations while fetching data

---

## 🔧 Troubleshooting

### "Connection refused" when opening dashboard
- Make sure Flask backend is running: `python app.py`
- Check that it's listening on `http://localhost:5000`

### CORS errors in browser console
- Flask-CORS is already configured in `app.py`
- Make sure you're not in a private/incognito window (some restrictions apply)

### Teams not appearing in autocomplete
- Flask backend must be running
- Check browser console for errors
- Verify `/api/teams` endpoint is accessible

### Predictions not loading
- Check Flask server logs for errors
- Ensure backend API is responding to requests
- Try refreshing the page

---

## 📝 Team Database

The system includes 56+ World Cup teams:

**Top Rated Teams:**
- Argentina (92)
- Brazil (91)
- France (89)
- Germany (88)
- England (87)
- Spain (86)
- Italy (85)
- Netherlands (84)
- Belgium (83)
- Portugal (82)

Plus teams from Europe, South America, Africa, Asia, North America, and Oceania.

---

## 🛠️ Development

### To modify predictions:
Edit the `predict_match()` function in `app.py`:
```python
def predict_match(team1, team2, neutral_venue=False, is_home_match=False):
    # Adjust model parameters here
    attack1 = (rating1 / 100) * 2.5
    attack2 = (rating2 / 100) * 2.5
```

### To add more teams:
Add to `WORLD_CUP_TEAMS` list and optionally to `TEAM_STATS` dict in `app.py`

### To customize UI:
Edit `styles.css` - all colors use CSS variables for easy theming:
```css
--primary-color: #1e3a8a;
--accent-color: #f59e0b;
```

---

## 📜 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

Created by **KarringtonLeonard**

---

## 🙌 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Flask/browser console logs
3. Verify all files are in the correct directory
4. Ensure Python 3.7+ is installed

---

## 🚀 Future Enhancements

- [ ] Database persistence for predictions
- [ ] Historical prediction accuracy tracking
- [ ] Advanced ML models (Neural Networks)
- [ ] Real-time match updates
- [ ] Betting odds integration
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Social sharing features

---

Enjoy predicting the World Cup! ⚽🏆