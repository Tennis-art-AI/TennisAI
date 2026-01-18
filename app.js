// ===================================
// Tennis Match - Telegram Mini App
// Main Application Logic
// ===================================

// Initialize Telegram WebApp
let tg = window.Telegram?.WebApp;

// App State
const AppState = {
    user: null,
    role: null,
    events: [],
    myEvents: [],
    currentTab: 'feed'
};

// Mock Data
const MockData = {
    events: [
        {
            id: 1, type: 'game', title: 'Товарищеский матч 1×1', format: '1v1',
            date: new Date(Date.now() + 86400000), time: '18:00',
            court: 'Теннисный центр "Динамо"', address: 'ул. Лавочкина, 32',
            creator: { name: 'Михаил К.', avatar: 'М', rating: 4.7 },
            slots: { total: 2, filled: 1 }, level: 'Средний', price: 1500
        },
        {
            id: 2, type: 'training', title: 'Групповая тренировка', format: 'group',
            date: new Date(Date.now() + 172800000), time: '10:00',
            court: 'СК "Олимпийский"', address: 'Олимпийский проспект, 16',
            creator: { name: 'Тренер Анна', avatar: 'А', rating: 4.9 },
            slots: { total: 4, filled: 2 }, level: 'Любой', price: 2000
        },
        {
            id: 3, type: 'tournament', title: 'Весенний турнир любителей', format: 'tournament',
            date: new Date(Date.now() + 604800000), time: '09:00',
            court: 'ТК "Мегаспорт"', address: 'Ходынский бульвар, 3',
            creator: { name: 'Организатор Петр', avatar: 'П', rating: 4.8 },
            slots: { total: 16, filled: 12 }, level: 'Средний+', price: 3000
        },
        {
            id: 4, type: 'game', title: 'Парная игра 2×2', format: '2v2',
            date: new Date(Date.now() + 259200000), time: '20:00',
            court: 'Теннисный клуб "Чемпион"', address: 'пр-т Вернадского, 78',
            creator: { name: 'Елена С.', avatar: 'Е', rating: 4.5 },
            slots: { total: 4, filled: 3 }, level: 'Начинающий', price: 800
        }
    ],
    partners: [
        { id: 1, name: 'Алексей Р.', avatar: 'А', level: 'Средний', rating: 4.6, games: 28 },
        { id: 2, name: 'Дмитрий В.', avatar: 'Д', level: 'Продвинутый', rating: 4.8, games: 45 },
        { id: 3, name: 'Ольга М.', avatar: 'О', level: 'Средний', rating: 4.4, games: 19 },
        { id: 4, name: 'Сергей К.', avatar: 'С', level: 'Начинающий', rating: 4.2, games: 8 },
        { id: 5, name: 'Ирина П.', avatar: 'И', level: 'Продвинутый', rating: 4.9, games: 67 }
    ],
    courts: [
        { id: 1, name: 'Теннисный центр "Динамо"', address: 'ул. Лавочкина, 32', surface: 'hard', courts: 8, price: '1500 ₽/час' },
        { id: 2, name: 'СК "Олимпийский"', address: 'Олимпийский проспект, 16', surface: 'clay', courts: 12, price: '2000 ₽/час' },
        { id: 3, name: 'ТК "Мегаспорт"', address: 'Ходынский бульвар, 3', surface: 'hard', courts: 6, price: '1800 ₽/час' },
        { id: 4, name: 'Теннисный клуб "Чемпион"', address: 'пр-т Вернадского, 78', surface: 'grass', courts: 4, price: '2500 ₽/час' }
    ],
    searchResults: [
        { id: 1, type: 'player', name: 'Александр Иванов', meta: 'Средний уровень • 4.7 ★', avatar: 'А' },
        { id: 2, type: 'coach', name: 'Тренер Мария Сидорова', meta: 'Опыт 10 лет • 4.9 ★', avatar: 'М' },
        { id: 3, type: 'player', name: 'Дмитрий Козлов', meta: 'Продвинутый • 4.8 ★', avatar: 'Д' },
        { id: 4, type: 'coach', name: 'Тренер Николай Петров', meta: 'Опыт 15 лет • 5.0 ★', avatar: 'Н' }
    ]
};

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initTelegram();
    initAuth();
    initNavigation();
    initTabs();
    initModal();
    initSearch();
    
    const savedUser = localStorage.getItem('tennisMatchUser');
    if (savedUser) {
        AppState.user = JSON.parse(savedUser);
        AppState.role = AppState.user.role;
        showMainScreen();
    }
});

function initTelegram() {
    if (tg) {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.user) {
            const tgUser = tg.initDataUnsafe.user;
            document.getElementById('nameInput').value = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
        }
    }
}

// ===================================
// Authentication
// ===================================
function initAuth() {
    const roleCards = document.querySelectorAll('.role-card');
    const roleInput = document.getElementById('roleInput');
    const authSubmit = document.getElementById('authSubmit');
    const emailInput = document.getElementById('emailInput');
    const nameInput = document.getElementById('nameInput');
    
    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            roleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            roleInput.value = card.dataset.role;
            validateAuthForm();
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });
    });
    
    emailInput.addEventListener('input', validateAuthForm);
    nameInput.addEventListener('input', validateAuthForm);
    
    document.getElementById('authForm').addEventListener('submit', handleAuth);
}

function validateAuthForm() {
    const email = document.getElementById('emailInput').value;
    const name = document.getElementById('nameInput').value;
    const role = document.getElementById('roleInput').value;
    document.getElementById('authSubmit').disabled = !(email.includes('@') && name.length >= 2 && role);
}

function handleAuth(e) {
    e.preventDefault();
    
    AppState.user = {
        email: document.getElementById('emailInput').value,
        name: document.getElementById('nameInput').value,
        role: document.getElementById('roleInput').value,
        avatar: document.getElementById('nameInput').value.charAt(0).toUpperCase(),
        games: Math.floor(Math.random() * 50),
        rating: (4 + Math.random()).toFixed(1)
    };
    AppState.role = AppState.user.role;
    
    localStorage.setItem('tennisMatchUser', JSON.stringify(AppState.user));
    
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    
    showMainScreen();
}

function showMainScreen() {
    document.getElementById('authScreen').classList.remove('active');
    document.getElementById('mainScreen').classList.add('active');
    
    updateUserInfo();
    updateQuickActions();
    renderEvents();
    renderPartners();
    renderCourts();
    renderMyEvents();
    renderSearchResults();
}

function updateUserInfo() {
    document.getElementById('headerName').textContent = AppState.user.name.split(' ')[0];
    document.getElementById('headerAvatar').textContent = AppState.user.avatar;
    
    const roleNames = {
        player: { icon: '🎾', text: 'Игрок' },
        coach: { icon: '🏆', text: 'Тренер' },
        organizer: { icon: '📋', text: 'Организатор' }
    };
    
    const roleBadge = document.getElementById('userRoleBadge');
    roleBadge.className = 'role-badge ' + AppState.role;
    roleBadge.innerHTML = `
        <span class="role-badge-icon">${roleNames[AppState.role].icon}</span>
        <span class="role-badge-text">${roleNames[AppState.role].text}</span>
    `;
    
    document.getElementById('gamesCount').textContent = AppState.user.games;
    document.getElementById('ratingValue').textContent = AppState.user.rating;
}

function updateQuickActions() {
    const quickActions = document.getElementById('quickActions');
    let html = '';
    
    if (AppState.role === 'player') {
        html = `
            <div class="quick-action" data-action="create-game">
                <div class="quick-action-icon game">🎾</div>
                <div class="quick-action-info">
                    <div class="quick-action-title">Создать игру</div>
                    <div class="quick-action-desc">1×1 или 2×2</div>
                </div>
            </div>
            <div class="quick-action" data-action="find-partner">
                <div class="quick-action-icon search">🔍</div>
                <div class="quick-action-info">
                    <div class="quick-action-title">Найти партнёра</div>
                    <div class="quick-action-desc">По уровню игры</div>
                </div>
            </div>
        `;
    } else if (AppState.role === 'coach') {
        html = `
            <div class="quick-action" data-action="create-training">
                <div class="quick-action-icon training">🏋️</div>
                <div class="quick-action-info">
                    <div class="quick-action-title">Тренировка</div>
                    <div class="quick-action-desc">1-4+ игроков</div>
                </div>
            </div>
            <div class="quick-action" data-action="my-students">
                <div class="quick-action-icon search">👥</div>
                <div class="quick-action-info">
                    <div class="quick-action-title">Мои ученики</div>
                    <div class="quick-action-desc">Управление</div>
                </div>
            </div>
        `;
    } else if (AppState.role === 'organizer') {
        html = `
            <div class="quick-action" data-action="create-tournament">
                <div class="quick-action-icon tournament">🏆</div>
                <div class="quick-action-info">
                    <div class="quick-action-title">Создать турнир</div>
                    <div class="quick-action-desc">4-32 участника</div>
                </div>
            </div>
            <div class="quick-action" data-action="my-tournaments">
                <div class="quick-action-icon search">📊</div>
                <div class="quick-action-info">
                    <div class="quick-action-title">Мои турниры</div>
                    <div class="quick-action-desc">Статистика</div>
                </div>
            </div>
        `;
    }
    
    quickActions.innerHTML = html;
    
    quickActions.querySelectorAll('.quick-action').forEach(action => {
        action.addEventListener('click', () => handleQuickAction(action.dataset.action));
    });
}

function handleQuickAction(action) {
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    
    switch (action) {
        case 'create-game': openCreateModal('game'); break;
        case 'create-training': openCreateModal('training'); break;
        case 'create-tournament': openCreateModal('tournament'); break;
        case 'find-partner': switchTab('search'); break;
        default: showToast('Функция в разработке');
    }
}

// ===================================
// Navigation
// ===================================
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.id === 'createBtn') {
                openCreateModalByRole();
                return;
            }
            
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
            
            const nav = item.dataset.nav;
            if (nav === 'home') switchTab('feed');
            else if (nav === 'calendar') switchTab('my');
            else showToast('Раздел в разработке');
        });
    });
    
    document.getElementById('createBtn').addEventListener('click', () => {
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
        openCreateModalByRole();
    });
}

function openCreateModalByRole() {
    const modalMap = { player: 'game', coach: 'training', organizer: 'tournament' };
    openCreateModal(modalMap[AppState.role]);
}

// ===================================
// Tabs
// ===================================
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId + 'Pane').classList.add('active');
    
    AppState.currentTab = tabId;
}

// ===================================
// Render Functions
// ===================================
function renderEvents() {
    const html = MockData.events.map(event => {
        const day = event.date.getDate();
        const month = event.date.toLocaleDateString('ru-RU', { month: 'short' });
        const slotsClass = event.slots.filled >= event.slots.total ? 'slots-full' : 'slots-available';
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-date">
                    <div class="event-day">${day}</div>
                    <div class="event-month">${month}</div>
                </div>
                <div class="event-info">
                    <div class="event-type ${event.type}">${getEventTypeLabel(event.type)}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-meta">
                        <div class="event-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            ${event.time}
                        </div>
                        <div class="event-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${event.court}
                        </div>
                    </div>
                </div>
                <div class="event-slots">
                    <div class="slots-count ${slotsClass}">${event.slots.filled}/${event.slots.total}</div>
                    <div class="slots-label">мест</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('eventsList').innerHTML = html;
    
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => openEventDetail(parseInt(card.dataset.eventId)));
    });
}

function getEventTypeLabel(type) {
    return { game: '🎾 Игра', training: '🏋️ Тренировка', tournament: '🏆 Турнир' }[type] || type;
}

function renderPartners() {
    const html = MockData.partners.map(p => `
        <div class="partner-card">
            <div class="partner-avatar">${p.avatar}</div>
            <div class="partner-name">${p.name}</div>
            <div class="partner-level">${p.level}</div>
            <div class="partner-rating">⭐ ${p.rating}</div>
        </div>
    `).join('');
    document.getElementById('partnersList').innerHTML = html;
}

function renderCourts() {
    const surfaceLabels = { hard: 'Хард', clay: 'Грунт', grass: 'Трава' };
    const html = MockData.courts.map(c => `
        <div class="court-card">
            <div class="court-image">
                <div class="court-image-icon">🎾</div>
                <div class="court-surface ${c.surface}">${surfaceLabels[c.surface]}</div>
            </div>
            <div class="court-info">
                <div class="court-name">${c.name}</div>
                <div class="court-address">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${c.address}
                </div>
                <div class="court-footer">
                    <div class="court-courts">${c.courts} кортов</div>
                    <div class="court-price">${c.price}</div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('courtsList').innerHTML = html;
}

function renderMyEvents() {
    const html = `
        <div class="my-event-card">
            <div class="my-event-header">
                <div class="event-type game">🎾 Игра 1×1</div>
                <div class="my-event-status active">Активно</div>
            </div>
            <div class="my-event-title">Товарищеский матч</div>
            <div class="my-event-details">
                <div class="my-event-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Завтра, 18:00
                </div>
                <div class="my-event-detail">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    ТК "Динамо"
                </div>
            </div>
            <div class="my-event-participants">
                <div class="participants-avatars">
                    <div class="participant-avatar">${AppState.user?.avatar || 'А'}</div>
                    <div class="participant-avatar">?</div>
                </div>
                <div class="participants-count">Ожидаем ещё 1 игрока</div>
            </div>
        </div>
        <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <div class="empty-state-title">Создайте своё первое событие</div>
            <div class="empty-state-text">Нажмите + чтобы создать игру, тренировку или турнир</div>
        </div>
    `;
    document.getElementById('myEventsList').innerHTML = html;
}

function renderSearchResults() {
    const html = MockData.searchResults.map(r => `
        <div class="search-result-card">
            <div class="search-result-avatar">${r.avatar}</div>
            <div class="search-result-info">
                <div class="search-result-name">${r.name}</div>
                <div class="search-result-meta">${r.meta}</div>
            </div>
            <div class="search-result-badge ${r.type}">${r.type === 'player' ? 'Игрок' : 'Тренер'}</div>
        </div>
    `).join('');
    document.getElementById('searchResults').innerHTML = html;
}

// ===================================
// Modal Functions
// ===================================
function initModal() {
    document.getElementById('modalClose').addEventListener('click', closeCreateModal);
    document.getElementById('eventDetailClose').addEventListener('click', closeEventDetail);
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            closeCreateModal();
            closeEventDetail();
        });
    });
}

function openCreateModal(type) {
    const modal = document.getElementById('createModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    let title = '', formHTML = '';
    
    if (type === 'game') {
        title = 'Создать игру';
        formHTML = `
            <form class="modal-form" id="createGameForm">
                <div class="form-group">
                    <label class="form-label">Формат игры</label>
                    <div class="format-selector">
                        <div class="format-option selected" data-format="1v1">
                            <div class="format-icon">👤</div>
                            <div class="format-title">1 на 1</div>
                            <div class="format-desc">Одиночная игра</div>
                        </div>
                        <div class="format-option" data-format="2v2">
                            <div class="format-icon">👥</div>
                            <div class="format-title">2 на 2</div>
                            <div class="format-desc">Парная игра</div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Дата и время</label>
                    <div class="form-row">
                        <input type="date" class="form-input" required>
                        <input type="time" class="form-input" value="18:00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Корт</label>
                    <select class="form-select" required>
                        <option value="">Выберите корт</option>
                        ${MockData.courts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Уровень игры</label>
                    <select class="form-select" required>
                        <option value="any">Любой</option>
                        <option value="beginner">Начинающий</option>
                        <option value="medium">Средний</option>
                        <option value="advanced">Продвинутый</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Комментарий</label>
                    <textarea class="form-textarea" placeholder="Дополнительная информация..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">Создать игру</button>
            </form>
        `;
    } else if (type === 'training') {
        title = 'Создать тренировку';
        formHTML = `
            <form class="modal-form" id="createTrainingForm">
                <div class="form-group">
                    <label class="form-label">Количество участников</label>
                    <div class="participants-selector">
                        <button type="button" class="participants-btn" id="decreaseParticipants">−</button>
                        <div class="participants-value">
                            <div class="participants-number" id="participantsCount">2</div>
                            <div class="participants-label">игрока</div>
                        </div>
                        <button type="button" class="participants-btn" id="increaseParticipants">+</button>
                    </div>
                    <p class="form-hint">От 1 до 4+ игроков</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Тип тренировки</label>
                    <select class="form-select" required>
                        <option value="individual">Индивидуальная</option>
                        <option value="group">Групповая</option>
                        <option value="technique">Работа над техникой</option>
                        <option value="cardio">Кардио + теннис</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Дата и время</label>
                    <div class="form-row">
                        <input type="date" class="form-input" required>
                        <input type="time" class="form-input" value="10:00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Корт</label>
                    <select class="form-select" required>
                        <option value="">Выберите корт</option>
                        ${MockData.courts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Стоимость (₽)</label>
                    <input type="number" class="form-input" placeholder="2000" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Описание</label>
                    <textarea class="form-textarea" placeholder="Опишите программу тренировки..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">Создать тренировку</button>
            </form>
        `;
    } else if (type === 'tournament') {
        title = 'Создать турнир';
        formHTML = `
            <form class="modal-form" id="createTournamentForm">
                <div class="form-group">
                    <label class="form-label">Название турнира</label>
                    <input type="text" class="form-input" placeholder="Весенний кубок 2025" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Количество участников</label>
                    <div class="participants-selector">
                        <button type="button" class="participants-btn" id="decreaseTournament">−</button>
                        <div class="participants-value">
                            <div class="participants-number" id="tournamentCount">8</div>
                            <div class="participants-label">участников</div>
                        </div>
                        <button type="button" class="participants-btn" id="increaseTournament">+</button>
                    </div>
                    <p class="form-hint">От 4 до 32 участников (степень двойки)</p>
                </div>
                <div class="bracket-preview">
                    <div class="bracket-title">Сетка турнира на <span id="bracketCount">8</span> участников</div>
                    <div class="bracket-visual" id="bracketVisual"></div>
                </div>
                <div class="form-group">
                    <label class="form-label">Формат</label>
                    <select class="form-select" required>
                        <option value="single">Одиночный разряд</option>
                        <option value="double">Парный разряд</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Дата проведения</label>
                    <div class="form-row">
                        <input type="date" class="form-input" required>
                        <input type="time" class="form-input" value="09:00" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Корт</label>
                    <select class="form-select" required>
                        <option value="">Выберите корт</option>
                        ${MockData.courts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Взнос участника (₽)</label>
                    <input type="number" class="form-input" placeholder="3000" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Уровень игроков</label>
                    <select class="form-select" required>
                        <option value="any">Любой</option>
                        <option value="beginner">Начинающий</option>
                        <option value="medium">Средний</option>
                        <option value="advanced">Продвинутый</option>
                        <option value="pro">Профессиональный</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Описание и правила</label>
                    <textarea class="form-textarea" placeholder="Опишите турнир, призы, правила..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg">Создать турнир</button>
            </form>
        `;
    }
    
    modalTitle.textContent = title;
    modalBody.innerHTML = formHTML;
    modal.classList.add('active');
    
    // Initialize form interactions
    initFormInteractions(type);
}

function initFormInteractions(type) {
    // Format selector for games
    document.querySelectorAll('.format-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.format-option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });
    
    // Participants counter for training
    if (type === 'training') {
        let count = 2;
        const countEl = document.getElementById('participantsCount');
        
        document.getElementById('decreaseParticipants')?.addEventListener('click', () => {
            if (count > 1) { count--; countEl.textContent = count; }
        });
        document.getElementById('increaseParticipants')?.addEventListener('click', () => {
            if (count < 10) { count++; countEl.textContent = count; }
        });
    }
    
    // Tournament participants counter
    if (type === 'tournament') {
        const validCounts = [4, 8, 16, 32];
        let idx = 1; // Start at 8
        const countEl = document.getElementById('tournamentCount');
        const bracketCount = document.getElementById('bracketCount');
        
        const updateBracket = () => {
            const count = validCounts[idx];
            countEl.textContent = count;
            bracketCount.textContent = count;
            renderBracketPreview(count);
        };
        
        document.getElementById('decreaseTournament')?.addEventListener('click', () => {
            if (idx > 0) { idx--; updateBracket(); }
        });
        document.getElementById('increaseTournament')?.addEventListener('click', () => {
            if (idx < validCounts.length - 1) { idx++; updateBracket(); }
        });
        
        updateBracket();
    }
    
    // Form submissions
    document.querySelectorAll('.modal-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            showToast('Событие успешно создано!');
            closeCreateModal();
        });
    });
}

function renderBracketPreview(count) {
    const visual = document.getElementById('bracketVisual');
    if (!visual) return;
    
    const rounds = Math.log2(count);
    let html = '';
    
    for (let r = 0; r < rounds; r++) {
        const matches = count / Math.pow(2, r + 1);
        html += '<div class="bracket-round">';
        for (let m = 0; m < Math.min(matches, 4); m++) {
            html += '<div class="bracket-match"></div>';
        }
        if (matches > 4) html += '<div class="bracket-match" style="opacity:0.5">...</div>';
        html += '</div>';
    }
    
    visual.innerHTML = html;
}

function closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
}

function openEventDetail(eventId) {
    const event = MockData.events.find(e => e.id === eventId);
    if (!event) return;
    
    const modal = document.getElementById('eventDetailModal');
    const body = document.getElementById('eventDetailBody');
    
    const day = event.date.getDate();
    const month = event.date.toLocaleDateString('ru-RU', { month: 'long' });
    const weekday = event.date.toLocaleDateString('ru-RU', { weekday: 'long' });
    
    body.innerHTML = `
        <div class="event-detail">
            <div class="event-type ${event.type}" style="margin-bottom: 16px;">${getEventTypeLabel(event.type)}</div>
            <h2 style="font-size: 24px; margin-bottom: 8px;">${event.title}</h2>
            <p style="color: var(--text-muted); margin-bottom: 24px;">Создал: ${event.creator.name} ⭐ ${event.creator.rating}</p>
            
            <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: var(--bg-tertiary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">📅</div>
                    <div>
                        <div style="font-weight: 600;">${day} ${month}</div>
                        <div style="font-size: 13px; color: var(--text-muted);">${weekday}, ${event.time}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: var(--bg-tertiary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">📍</div>
                    <div>
                        <div style="font-weight: 600;">${event.court}</div>
                        <div style="font-size: 13px; color: var(--text-muted);">${event.address}</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: var(--bg-tertiary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">💰</div>
                    <div>
                        <div style="font-weight: 600;">${event.price} ₽</div>
                        <div style="font-size: 13px; color: var(--text-muted);">Стоимость участия</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: var(--bg-tertiary); border-radius: 12px; display: flex; align-items: center; justify-content: center;">🎯</div>
                    <div>
                        <div style="font-weight: 600;">${event.level}</div>
                        <div style="font-size: 13px; color: var(--text-muted);">Уровень игры</div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 16px; background: var(--bg-tertiary); border-radius: 12px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--text-secondary);">Участники</span>
                    <span style="font-weight: 700; font-size: 18px;">${event.slots.filled} / ${event.slots.total}</span>
                </div>
                <div style="height: 8px; background: var(--bg-elevated); border-radius: 4px; margin-top: 12px; overflow: hidden;">
                    <div style="height: 100%; width: ${(event.slots.filled / event.slots.total) * 100}%; background: var(--primary); border-radius: 4px;"></div>
                </div>
            </div>
            
            <button class="btn btn-primary btn-lg" onclick="joinEvent(${event.id})">
                ${event.slots.filled >= event.slots.total ? 'Записаться в лист ожидания' : 'Присоединиться'}
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeEventDetail() {
    document.getElementById('eventDetailModal').classList.remove('active');
}

function joinEvent(eventId) {
    if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    showToast('Вы записаны на событие!');
    closeEventDetail();
}

// ===================================
// Search
// ===================================
function initSearch() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            // Filter logic would go here
        });
    });
    
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        // Search logic would go here
        console.log('Search:', e.target.value);
    });
}

// ===================================
// Toast Notifications
// ===================================
function showToast(message) {
    // Remove existing toast
    document.querySelector('.toast')?.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: var(--bg-elevated);
        border: 1px solid var(--border);
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: toastIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Add toast animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    @keyframes toastOut { from { opacity: 1; transform: translateX(-50%) translateY(0); } to { opacity: 0; transform: translateX(-50%) translateY(20px); } }
`;
document.head.appendChild(style);

// ===================================
// Logout (for testing)
// ===================================
function logout() {
    localStorage.removeItem('tennisMatchUser');
    location.reload();
}
