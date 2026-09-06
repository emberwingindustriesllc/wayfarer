// The Wayfarer's Journey - Game Engine

class Game {
    constructor() {
        this.state = {
            currentArc: 'grief',
            stats: { resilience: 100, wisdom: 0, faith: 10, patience: 5, community: 5 },
            inventory: [],
            completedChallenges: [],
            userId: null
        };
        this.challenges = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadGame();
        this.showLoadingComplete();
    }

    setupEventListeners() {
        document.getElementById('rest-btn')?.addEventListener('click', () => this.enterRestArea());
        document.getElementById('journal-btn')?.addEventListener('click', () => this.openJournal());
    }

    showLoadingComplete() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'flex';
        this.showArc('grief');
    }

    showArc(arcName) {
        this.state.currentArc = arcName;
        const content = document.getElementById('game-content');
        content.innerHTML = this.getArcContent(arcName);
        content.classList.add('fade-in');
        this.updateUI();
    }

    getArcContent(arcName) {
        const arcData = this.challenges[arcName];
        if (!arcData) return '<p>Loading...</p>';
        
        return `
            <div class="challenge-card">
                <h2>${arcData.title}</h2>
                <p>${arcData.description}</p>
                ${arcData.challenges.map(c => `
                    <div class="challenge" id="challenge-${c.id}">
                        <h3>${c.title}</h3>
                        <p>${c.description}</p>
                        <div class="choices">
                            ${c.choices.map((ch, i) => `
                                <button class="choice-btn" onclick="game.makeChoice('${c.id}', ${i})">
                                    <div class="choice-label">${ch.label}</div>
                                    <div class="choice-desc">${ch.desc}</div>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                <div class="scripture">${arcData.scripture || ''}</div>
            </div>
        `;
    }

    async makeChoice(challengeId, choiceIndex) {
        const arc = this.state.currentArc;
        const challenge = this.challenges[arc]?.challenges.find(c => c.id === challengeId);
        if (!challenge) return;
        
        const choice = challenge.choices[choiceIndex];
        
        // Apply effects
        this.state.stats.resilience = Math.max(0, Math.min(100, this.state.stats.resilience + (choice.resilienceGain || 0) - (choice.resilienceCost || 0) - (choice.resiliencePenalty || 0)));
        this.state.stats.wisdom += choice.wisdomGain || 0;
        this.state.stats.faith += choice.faithGain || 0;
        this.state.stats.patience += choice.patienceGain || 0;
        this.state.stats.community += choice.communityGain || 0;
        
        this.state.completedChallenges.push(challengeId);
        await this.saveProgress();
        this.updateUI();
        
        // Show result
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div class="challenge-card fade-in">
                <h2>Result</h2>
                <p>You chose: <strong>${choice.label}</strong></p>
                ${choice.wisdomGain ? `<p>+${choice.wisdomGain} Wisdom</p>` : ''}
                ${choice.resilienceGain ? `<p>+${choice.resilienceGain} Resilience</p>` : ''}
                <p>Resilience: ${this.state.stats.resilience}/100 | Wisdom: ${this.state.stats.wisdom}</p>
                ${this.state.stats.resilience <= 0 ? '<p style="color:var(--accent-coral);">Your resilience has reached zero...</p>' : ''}
                <button class="btn-primary" onclick="game.nextChallenge()">Continue</button>
            </div>
        `;
        
        if (this.state.stats.resilience <= 0) this.triggerStasis();
    }

    async enterRestArea() {
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div class="rest-area fade-in">
                <h2>The Campfire</h2>
                <div class="campsite">🔥</div>
                <p>Take a moment to rest and reflect.</p>
                <button class="btn-primary" onclick="game.rest()">Rest by the Campfire</button>
            </div>
        `;
    }

    async rest() {
        const r = 10 + Math.floor(Math.random() * 10);
        const w = 2 + Math.floor(Math.random() * 5);
        this.state.stats.resilience = Math.min(100, this.state.stats.resilience + r);
        this.state.stats.wisdom += w;
        await this.saveProgress();
        this.updateUI();
        
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div class="challenge-card fade-in">
                <h2>Rest Complete</h2>
                <p>+${r} Resilience | +${w} Wisdom</p>
                <button class="btn-primary" onclick="game.showArc('${this.state.currentArc}')">Return to Journey</button>
            </div>
        `;
    }

    async openJournal() {
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div class="challenge-card fade-in">
                <h2>Your Journal</h2>
                <textarea id="journal-text" placeholder="Write your reflections..." style="width:100%;min-height:120px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:1rem;color:var(--text-primary);font-family:inherit;"></textarea>
                <button class="btn-primary" style="margin-top:0.75rem;" onclick="game.saveJournal()">Save Entry</button>
            </div>
        `;
    }

    async saveJournal() {
        const text = document.getElementById('journal-text').value;
        if (!text) return;
        this.state.stats.community += 3;
        await this.saveProgress();
        this.updateUI();
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div class="challenge-card fade-in">
                <h2>Journal Saved</h2>
                <p>Your reflection has been recorded. +3 Community</p>
                <button class="btn-primary" onclick="game.showArc('${this.state.currentArc}')">Return to Journey</button>
            </div>
        `;
    }

    triggerStasis() {
        const content = document.getElementById('game-content');
        content.innerHTML = `
            <div class="challenge-card fade-in" style="text-align:center;">
                <h2 style="color:var(--accent-coral);">Stasis Period</h2>
                <p>Your resilience has reached zero. You enter a period of rest and reflection.</p>
                <p>This is not failure — it is how the journey works.</p>
                <button class="btn-primary" onclick="game.recoverFromStasis()">Begin Recovery</button>
            </div>
        `;
    }

    async recoverFromStasis() {
        this.state.stats.resilience = 50;
        await this.saveProgress();
        this.updateUI();
        this.showArc('grief');
    }

    nextChallenge() {
        const arcs = ['grief', 'work', 'self'];
        const idx = (arcs.indexOf(this.state.currentArc) + 1) % arcs.length;
        this.showArc(arcs[idx]);
    }

    updateUI() {
        const rf = document.getElementById('resilience-fill');
        const wf = document.getElementById('wisdom-fill');
        if (rf) rf.style.width = `${this.state.stats.resilience}%`;
        if (wf) wf.style.width = `${Math.min(100, this.state.stats.wisdom)}%`;
    }

    async saveProgress() {
        // Save to Supabase if connected
        try {
            if (window.supabase && this.state.userId) {
                await supabase.from('game_progress').upsert({
                    user_id: this.state.userId,
                    stats: this.state.stats,
                    completed_challenges: this.state.completedChallenges
                });
            }
        } catch (e) { console.error('Save error:', e); }
    }

    loadGame() {
        fetch('data/challenges.json')
            .then(r => r.json())
            .then(d => { this.challenges = d; })
            .catch(e => console.error('Load challenges error:', e));
    }
}

const game = new Game();
window.game = game;
