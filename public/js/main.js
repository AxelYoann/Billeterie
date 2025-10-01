/**
 * Main JavaScript file for Multi-Billeterie
 * Handles common functionality across the application
 */

// ===== GLOBAL VARIABLES =====
const API_BASE_URL = '/api';
let authToken = localStorage.getItem('authToken');

// ===== UTILITY FUNCTIONS =====

/**
 * Display flash messages
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error, warning, info)
 */
function showFlashMessage(message, type = 'info') {
  const flashContainer = document.getElementById('flash-messages');
  if (!flashContainer) return;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  flashContainer.appendChild(alertDiv);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.classList.remove('show');
      setTimeout(() => alertDiv.remove(), 150);
    }
  }, 5000);
}

/**
 * Make authenticated API requests
 * @param {string} url - API endpoint
 * @param {object} options - Request options
 * @returns {Promise} - Fetch promise
 */
async function apiRequest(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add auth token if available
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Format date to French locale
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format price in Euro
 * @param {number} price - Price to format
 * @returns {string} - Formatted price
 */
function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Is valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show loading spinner
 * @param {HTMLElement} element - Element to show spinner in
 */
function showLoading(element) {
  if (!element) return;
  
  element.innerHTML = `
    <div class="d-flex justify-content-center">
      <div class="spinner-custom"></div>
    </div>
  `;
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
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

// ===== EVENT HANDLERS =====

/**
 * Handle form submissions with validation
 */
function setupFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  
  forms.forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
}

/**
 * Handle search functionality
 */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  const debouncedSearch = debounce(async (query) => {
    if (query.length < 2) return;

    try {
      const results = await apiRequest(`/events/search?q=${encodeURIComponent(query)}`);
      displaySearchResults(results.data);
    } catch (error) {
      console.error('Search error:', error);
      showFlashMessage('Erreur lors de la recherche', 'error');
    }
  }, 300);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });
}

/**
 * Display search results
 * @param {Array} results - Search results
 */
function displaySearchResults(results) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  if (!results || results.length === 0) {
    resultsContainer.innerHTML = '<p class="text-muted">Aucun résultat trouvé</p>';
    return;
  }

  resultsContainer.innerHTML = results.map(result => `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${result.title}</h5>
        <p class="card-text">${result.description}</p>
        <p class="text-muted">
          <i class="fas fa-calendar me-2"></i>${formatDate(result.dateTime.start)}
          <i class="fas fa-map-marker-alt ms-3 me-2"></i>${result.venue.name}
        </p>
        <a href="/events/${result._id}" class="btn btn-primary">Voir détails</a>
      </div>
    </div>
  `).join('');
}

// ===== AUTHENTICATION =====

/**
 * Check if user is authenticated
 * @returns {boolean} - Is authenticated
 */
function isAuthenticated() {
  return !!authToken;
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Login promise
 */
async function login(email, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    authToken = response.data.token;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    showFlashMessage('Connexion réussie', 'success');
    return response.data;
  } catch (error) {
    showFlashMessage(error.message, 'danger');
    throw error;
  }
}

/**
 * Logout user
 */
function logout() {
  authToken = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  showFlashMessage('Déconnexion réussie', 'info');
  window.location.href = '/';
}

/**
 * Get current user from localStorage
 * @returns {Object|null} - Current user or null
 */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// ===== NAVIGATION UPDATES =====

/**
 * Update navigation based on authentication status
 */
function updateNavigation() {
  const user = getCurrentUser();
  const navbarNav = document.querySelector('.navbar-nav:last-child');
  
  if (!navbarNav) return;

  if (user) {
    navbarNav.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          <i class="fas fa-user me-1"></i>
          ${user.firstName} ${user.lastName}
        </a>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="/dashboard">
            <i class="fas fa-tachometer-alt me-2"></i>Tableau de bord
          </a></li>
          <li><a class="dropdown-item" href="/profile">
            <i class="fas fa-user-edit me-2"></i>Mon profil
          </a></li>
          <li><a class="dropdown-item" href="/tickets">
            <i class="fas fa-ticket-alt me-2"></i>Mes tickets
          </a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" onclick="logout()">
            <i class="fas fa-sign-out-alt me-2"></i>Déconnexion
          </a></li>
        </ul>
      </li>
    `;
  }
}

// ===== INITIALIZATION =====

/**
 * Initialize the application
 */
function initApp() {
  // Setup form validation
  setupFormValidation();
  
  // Setup search
  setupSearch();
  
  // Update navigation
  updateNavigation();
  
  // Add smooth scrolling to anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add animation classes to elements when they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card, .stat-item').forEach(el => {
    observer.observe(el);
  });
}

// ===== GLOBAL EVENT LISTENERS =====

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle online/offline status
window.addEventListener('online', () => {
  showFlashMessage('Connexion rétablie', 'success');
});

window.addEventListener('offline', () => {
  showFlashMessage('Connexion perdue. Certaines fonctionnalités peuvent être indisponibles.', 'warning');
});

// Export functions for use in other scripts
window.MultiBilleterie = {
  showFlashMessage,
  apiRequest,
  formatDate,
  formatPrice,
  isValidEmail,
  showLoading,
  login,
  logout,
  getCurrentUser,
  isAuthenticated
};