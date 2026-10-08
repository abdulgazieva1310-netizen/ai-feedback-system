/* ============================================================
   AI FEEDBACK SYSTEM — Sprint 1
   Features:
   1. Feedback Submission Form
   2. Save Feedback to Database (LocalStorage)
   3. Select Feedback Topic
   4. Admin Login Panel
   ============================================================ */

   /* ============================================================
   SENTIMENT ANALYSIS — Story 5
   Пікірдің оң/теріс екенін анықтайды
   ============================================================ */

// Оң сөздер (Positive words)
const POSITIVE_WORDS = [
    // English
    'good', 'great', 'excellent', 'amazing', 'wonderful',
    'best', 'love', 'like', 'nice', 'perfect',
    'helpful', 'friendly', 'clean', 'fast', 'useful',
    'awesome', 'fantastic', 'brilliant', 'super', 'cool',
    'happy', 'pleased', 'satisfied', 'recommend', 'impressive',
    
    // Қазақша
    'жақсы', 'керемет', 'тамаша', 'ұнады', 'әдемі',
    'түсінікті', 'пайдалы', 'жылдам', 'таза', 'риза',
    'қуанышты', 'ұнайды', 'жарайды', 'мықты', 'күшті',
    
    // Орысша
    'хорошо', 'отлично', 'супер', 'нравится', 'класс',
    'замечательно', 'прекрасно', 'полезно', 'быстро', 'чисто',
    'удобно', 'приятно', 'рекомендую', 'доволен', 'рад','удобный'
];

// Теріс сөздер (Negative words)
const NEGATIVE_WORDS = [
    // English
    'bad', 'terrible', 'awful', 'horrible', 'worst',
    'hate', 'dislike', 'poor', 'cold', 'slow',
    'broken', 'dirty', 'rude', 'late', 'problem',
    'boring', 'useless', 'expensive', 'noisy', 'crowded',
    'difficult', 'confusing', 'wrong', 'fail', 'error',
    
    // Қазақша
    'жаман', 'нашар', 'суық', 'ұнамайды', 'қиын',
    'лас', 'қымбат', 'шулы', 'қате', 'мәселе',
    'кеш', 'түсініксіз', 'қажетсіз', 'ашулы', 'ащы',
    
    // Орысша
    'плохо', 'ужасно', 'холодно', 'медленно', 'проблема',
    'грязно', 'дорого', 'шумно', 'ошибка', 'сломан',
    'поздно', 'сложно', 'непонятно', 'скучно', 'разочарован'
];

// AI: Sentiment Analysis
function analyzeSentiment(text) {
    if (!text || text.trim() === '') {
        return { sentiment: 'neutral', score: 0, emoji: '😐', color: '#FFC107' };
    }

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    // Оң сөздерді санау
    POSITIVE_WORDS.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
    });

    // Теріс сөздерді санау
    NEGATIVE_WORDS.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
    });

    // Нәтижені анықтау
    if (positiveCount > negativeCount) {
        return {
            sentiment: 'positive',
            score: positiveCount,
            emoji: '😊',
            color: '#4CAF50',
            label: 'Positive'
        };
    } else if (negativeCount > positiveCount) {
        return {
            sentiment: 'negative',
            score: negativeCount,
            emoji: '😞',
            color: '#F44336',
            label: 'Negative'
        };
    } else {
        return {
            sentiment: 'neutral',
            score: 0,
            emoji: '😐',
            color: '#FFC107',
            label: 'Neutral'
        };
    }
}

/* ============================================================
   LANGUAGE DETECTION — Story 6
   ============================================================ */

function detectLanguage(text) {
    if (!text || text.trim() === '') {
        return { lang: 'unknown', flag: '🌐', label: 'Unknown' };
    }

    const lowerText = text.toLowerCase();
    const kazakhChars = /[әғқңөұүһі]/i;
    const russianChars = /[ыэёъ]/i;
    const cyrillicChars = /[а-яё]/i;

    if (kazakhChars.test(lowerText)) {
        return { lang: 'kazakh', flag: '🇰🇿', label: 'Kazakh' };
    }
    if (russianChars.test(lowerText) || cyrillicChars.test(lowerText)) {
        return { lang: 'russian', flag: '🇷🇺', label: 'Russian' };
    }
    return { lang: 'english', flag: 'EN', label: 'English' };
}




// ================== DATABASE (LocalStorage) ==================
const STORAGE_KEY = 'ai_feedback_data';
const ADMIN_USER = 'admin';
const ADMIN_PASS = '1234';

// ✅ LocalStorage — алу
function getFeedbacks() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// ✅ LocalStorage — сақтау
function saveFeedbacks(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

async function saveFeedbackToFirebase(feedback) {
    try {
        await db.collection('feedbacks').add(feedback);
        console.log('✅ Saved to Firebase');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function getFeedbacksFromFirebase() {
    try {
        const snapshot = await db.collection('feedbacks')
            .orderBy('date', 'desc')
            .get();
        
        const list = [];
        snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
        });
        return list;
    } catch (error) {
        console.error('❌ Error:', error);
        return [];
    }
}

function addFeedback(feedback) {
    // 1. Sentiment Analysis (Story 5)
    const sentiment = analyzeSentiment(feedback.text);
    feedback.sentiment = sentiment.sentiment;
    feedback.sentimentLabel = sentiment.label;
    feedback.sentimentEmoji = sentiment.emoji;
    feedback.sentimentColor = sentiment.color;
    feedback.sentimentScore = sentiment.score;

    // 2. Language Detection (Story 6)
    const language = detectLanguage(feedback.text);
    feedback.language = language.lang;
    feedback.languageFlag = language.flag;
    feedback.languageLabel = language.label;

    // 3. LocalStorage-ке сақтау
    const list = getFeedbacks();
    list.unshift(feedback);
    saveFeedbacks(list);

    // 4. Firebase-ке сақтау ✅ ЖАҢА!
    saveFeedbackToFirebase(feedback);

    // 5. AI нәтижесін сақтау (Story 7)
    saveAIResult(feedback);
}

/* ============================================================
   SAVE AI RESULTS — Story 7
   AI нәтижелерін жүйелі түрде сақтайды
   ============================================================ */

// AI Results үшін бөлек кілт
const AI_RESULTS_KEY = 'ai_analysis_results';

// AI нәтижелерін алу
function getAIResults() {
    const data = localStorage.getItem(AI_RESULTS_KEY);
    return data ? JSON.parse(data) : [];
}

// AI нәтижелерін сақтау
function saveAIResults(list) {
    localStorage.setItem(AI_RESULTS_KEY, JSON.stringify(list));
}

// AI нәтижесін қосу
function saveAIResult(feedback) {
    const result = {
        feedbackId: feedback.id,
        studentName: feedback.name,
        topic: feedback.topic,
        text: feedback.text,
        date: feedback.date,
        
        // AI талдау нәтижелері
        ai: {
            sentiment: feedback.sentiment,
            sentimentLabel: feedback.sentimentLabel,
            sentimentScore: feedback.sentimentScore,
            sentimentColor: feedback.sentimentColor,
            sentimentEmoji: feedback.sentimentEmoji,
            
            language: feedback.language,
            languageLabel: feedback.languageLabel,
            languageFlag: feedback.languageFlag,
            
            analyzedAt: new Date().toLocaleString('en-GB')
        }
    };

    const list = getAIResults();
    list.unshift(result);
    saveAIResults(list);
}


// ================== SECURITY ==================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================== 1. FEEDBACK FORM ==================
const feedbackForm = document.getElementById('feedbackForm');

if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('studentName').value.trim();
        const topic = document.getElementById('topic').value;
        const text = document.getElementById('feedbackText').value.trim();

        if (!name || !topic || !text) {
            alert('Please fill all fields!');
            return;
        }

        const feedback = {
            id: Date.now(),
            name: name,
            topic: topic,
            text: text,
            date: new Date().toLocaleString('en-GB')
        };

        addFeedback(feedback);

        const successMsg = document.getElementById('successMsg');
        successMsg.textContent = '✅ Your feedback has been saved! Thank you!';
        successMsg.style.display = 'block';

        feedbackForm.reset();
        renderRecentFeedbacks();

        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 4000);
    });
}

// ================== SHOW RECENT 3 FEEDBACKS ==================
function renderRecentFeedbacks() {
    const container = document.getElementById('recentFeedbacks');
    if (!container) return;

    const list = getFeedbacks().slice(0, 3);

    if (list.length === 0) {
        container.innerHTML = '<p class="empty">No feedback yet. Be the first to submit!</p>';
        return;
    }

    container.innerHTML = list.map(fb => `
    <div class="feedback-item" style="border-left-color: ${fb.sentimentColor || '#4a6cf7'}">
        <div class="meta">
            <span class="name">${escapeHtml(fb.name)}</span>
            <span>${fb.date}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; margin: 8px 0; flex-wrap: wrap;">
    <span class="topic-tag">${escapeHtml(fb.topic)}</span>
    ${fb.sentimentEmoji ? `
        <span class="sentiment-tag" style="background: ${fb.sentimentColor};">
            ${fb.sentimentEmoji} ${fb.sentimentLabel}
        </span>
    ` : ''}
    ${fb.languageFlag ? `
        <span class="language-tag">
            ${fb.languageFlag} ${fb.languageLabel}
        </span>
    ` : ''}
</div>
        <p class="text">${escapeHtml(fb.text)}</p>
    </div>
`).join('');
}

// ================== 2. ADMIN PANEL ==================
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const filterTopic = document.getElementById('filterTopic');

// Login
if (loginForm) {
    if (sessionStorage.getItem('adminLogged') === 'true') {
        showAdminPanel();
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value.trim();

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            sessionStorage.setItem('adminLogged', 'true');
            showAdminPanel();
        } else {
            document.getElementById('loginError').textContent = '❌ Wrong username or password!';
        }
    });
}

// Show panel
function showAdminPanel() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    renderAdminFeedbacks();
    updateStats();
    updateAIStats();  // ← Story 7
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('adminLogged');
        window.location.href = 'admin.html';
    });
}

// Filter
if (filterTopic) {
    filterTopic.addEventListener('change', renderAdminFeedbacks);
}

// ================== SHOW ALL FEEDBACKS ==================
function renderAdminFeedbacks() {
    const container = document.getElementById('feedbackList');
    if (!container) return;

    let list = getFeedbacks();
    const filter = filterTopic ? filterTopic.value : '';

    if (filter) {
        list = list.filter(fb => fb.topic === filter);
    }

    if (list.length === 0) {
        container.innerHTML = '<div class="card"><p class="empty">No feedback found.</p></div>';
        return;
    }

    container.innerHTML = list.map(fb => `
    <div class="card">
        <div class="meta" style="display:flex;justify-content:space-between;margin-bottom:10px;color:#888;font-size:13px;">
            <span><b style="color:#2c3e50;">${escapeHtml(fb.name)}</b></span>
            <span>${fb.date}</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; margin: 8px 0; flex-wrap: wrap;">
    <span class="topic-tag">${escapeHtml(fb.topic)}</span>
    ${fb.sentimentEmoji ? `
        <span class="sentiment-tag" style="background: ${fb.sentimentColor};">
            ${fb.sentimentEmoji} ${fb.sentimentLabel}
        </span>
    ` : ''}
    ${fb.languageFlag ? `
        <span class="language-tag">
            ${fb.languageFlag} ${fb.languageLabel}
        </span>
    ` : ''}
</div>
        <p style="margin-top:10px;line-height:1.6;color:#444;">${escapeHtml(fb.text)}</p>
    </div>
`).join('');
}

// ================== STATISTICS ==================
function updateStats() {
    const list = getFeedbacks();

    const totalEl = document.getElementById('totalCount');
    const todayEl = document.getElementById('todayCount');
    const topicEl = document.getElementById('topicCount');

    if (!totalEl) return;

    totalEl.textContent = list.length;

    const today = new Date().toLocaleDateString('en-GB');
    const todayCount = list.filter(fb => fb.date.includes(today)).length;
    todayEl.textContent = todayCount;

    const uniqueTopics = new Set(list.map(fb => fb.topic));
    topicEl.textContent = uniqueTopics.size;
}

/* ============================================================
   AI STATISTICS — Story 7
   AI нәтижелерінің статистикасы
   ============================================================ */

function updateAIStats() {
    const results = getAIResults();

    const totalEl = document.getElementById('aiTotal');
    const positiveEl = document.getElementById('aiPositive');
    const negativeEl = document.getElementById('aiNegative');
    const neutralEl = document.getElementById('aiNeutral');

    if (totalEl) totalEl.textContent = results.length;

    

    // Sentiment бойынша
    const positive = results.filter(r => r.ai.sentiment === 'positive').length;
    const negative = results.filter(r => r.ai.sentiment === 'negative').length;
    const neutral = results.filter(r => r.ai.sentiment === 'neutral').length;

    if (positiveEl) positiveEl.textContent = positive;
    if (negativeEl) negativeEl.textContent = negative;
    if (neutralEl) neutralEl.textContent = neutral;

    // Language бойынша
    const kazakh = results.filter(r => r.ai.language === 'kazakh').length;
    const russian = results.filter(r => r.ai.language === 'russian').length;
    const english = results.filter(r => r.ai.language === 'english').length;

    const kazakhEl = document.getElementById('aiKazakh');
    const russianEl = document.getElementById('aiRussian');
    const englishEl = document.getElementById('aiEnglish');

    if (kazakhEl) kazakhEl.textContent = kazakh;
    if (russianEl) russianEl.textContent = russian;
    if (englishEl) englishEl.textContent = english;
}





// ================== PAGE LOAD ==================
document.addEventListener('DOMContentLoaded', function () {
    // 1. АЛДЫМЕН — LocalStorage-тен көрсету (жылдам!)
    renderRecentFeedbacks();
    console.log('✅ LocalStorage rendered');

    // 2. СОСЫН — Firebase-тен жүктеу (фонда)
    if (typeof db !== 'undefined' && db) {
        loadFromFirebaseAsync();
    }
});

// Firebase-тен фондық жүктеу
async function loadFromFirebaseAsync() {
    try {
        console.log('🔄 Loading from Firebase...');
        
        const firebaseFeedbacks = await getFeedbacksFromFirebase();
        
        if (firebaseFeedbacks.length > 0) {
            // LocalStorage-ке синхрондау
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseFeedbacks));
            console.log(`✅ Firebase: ${firebaseFeedbacks.length} feedbacks loaded`);
            
            // UI-ды жаңарту
            renderRecentFeedbacks();
            console.log('✅ UI updated with Firebase data');
        } else {
            console.log('ℹ️ Firebase: no feedbacks yet');
        }
    } catch (error) {
        console.error('❌ Firebase load error:', error);
    }
}

