let currentDate = new Date();
let streakData = {};
let currentStreak = 0;
let longestStreak = 0;

// Initialize calendar when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadStreakData();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  
  document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
}

function loadStreakData() {
  chrome.storage.local.get(['streakData', 'currentStreak', 'longestStreak'], (result) => {
    streakData = result.streakData || {};
    currentStreak = result.currentStreak || 0;
    longestStreak = result.longestStreak || 0;
    renderCalendar();
    updateStats();
  });
}

function saveStreakData() {
  chrome.storage.local.set({
    streakData: streakData,
    currentStreak: currentStreak,
    longestStreak: longestStreak
  });
}

function renderCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  
  const monthYear = document.getElementById('monthYear');
  monthYear.textContent = currentDate.toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Add day headers
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  days.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.textContent = day;
    dayHeader.className = 'day-header';
    calendar.appendChild(dayHeader);
  });
  
  // Get first day of month and total days
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Add blank spaces for days before start of month
  for (let i = 0; i < firstDay.getDay(); i++) {
    calendar.appendChild(document.createElement('div'));
  }
  
  // Add days of month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayElement = document.createElement('div');
    dayElement.textContent = day;
    dayElement.className = 'day';
    
    const dateStr = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    if (streakData[dateStr] === true) {
      dayElement.classList.add('completed');
    } else if (streakData[dateStr] === false) {
      dayElement.classList.add('missed');
    }
    
    // Only allow clicking on current month's days
    const clickableDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (clickableDate <= new Date()) {
      dayElement.addEventListener('click', () => toggleDay(dateStr));
    }
    
    calendar.appendChild(dayElement);
  }
}

function toggleDay(dateStr) {
  // Toggle between completed, missed, and unset
  if (streakData[dateStr] === undefined) {
    streakData[dateStr] = true;
  } else if (streakData[dateStr] === true) {
    streakData[dateStr] = false;
  } else {
    delete streakData[dateStr];
  }
  
  calculateStreaks();
  saveStreakData();
  renderCalendar();
  updateStats();
}

function calculateStreaks() {
  const today = new Date();
  let streak = 0;
  
  // Calculate current streak
  for (let d = new Date(); d >= new Date().setDate(today.getDate() - 30); d.setDate(d.getDate() - 1)) {
    const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (streakData[dateStr] === true) {
      streak++;
    } else {
      break;
    }
  }
  currentStreak = streak;
  
  // Update longest streak if current streak is longer
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }
}

function updateStats() {
  document.getElementById('currentStreak').textContent = currentStreak;
  document.getElementById('longestStreak').textContent = longestStreak;
}
