#!/usr/bin/env node

/**
 * 🚀 Script de Setup Automatique - Multi-Billeterie
 * 
 * Ce script automatise l'installation et la configuration initiale du projet.
 * Il vérifie les prérequis, installe les dépendances, configure l'environnement
 * et prépare la base de données.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Interface readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Affiche un message coloré
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Affiche un titre avec séparateur
 */
function title(message) {
  console.log('\n' + '='.repeat(60));
  log(`🚀 ${message}`, 'cyan');
  console.log('='.repeat(60) + '\n');
}

/**
 * Pose une question à l'utilisateur
 */
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Exécute une commande et affiche le résultat
 */
function exec(command, options = {}) {
  try {
    log(`📦 Exécution: ${command}`, 'dim');
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
      ...options 
    });
    return result;
  } catch (error) {
    log(`❌ Erreur lors de l'exécution de: ${command}`, 'red');
    throw error;
  }
}

/**
 * Vérifie si une commande existe
 */
function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Vérifie les prérequis système
 */
async function checkPrerequisites() {
  title('Vérification des Prérequis');
  
  const requirements = [
    { name: 'Node.js', command: 'node', minVersion: '18.0.0' },
    { name: 'npm', command: 'npm', minVersion: '8.0.0' },
    { name: 'Git', command: 'git', minVersion: '2.0.0' }
  ];
  
  let allGood = true;
  
  for (const req of requirements) {
    if (commandExists(req.command)) {
      const version = exec(`${req.command} --version`, { silent: true }).trim();
      log(`✅ ${req.name}: ${version}`, 'green');
    } else {
      log(`❌ ${req.name} n'est pas installé`, 'red');
      allGood = false;
    }
  }
  
  if (!allGood) {
    log('\n❌ Certains prérequis ne sont pas satisfaits.', 'red');
    log('Veuillez installer les outils manquants avant de continuer.', 'yellow');
    process.exit(1);
  }
  
  log('\n✅ Tous les prérequis sont satisfaits !', 'green');
}

/**
 * Configure les variables d'environnement
 */
async function setupEnvironment() {
  title('Configuration de l\'Environnement');
  
  if (fs.existsSync('.env')) {
    const overwrite = await question('Un fichier .env existe déjà. Le remplacer ? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('⚠️ Configuration d\'environnement ignorée.', 'yellow');
      return;
    }
  }
  
  log('Configuration des variables d\'environnement...', 'blue');
  
  const port = await question('Port de l\'application (3000): ') || '3000';
  const mongoUri = await question('URI MongoDB (mongodb://localhost:27017/multi-billeterie): ') || 'mongodb://localhost:27017/multi-billeterie';
  const jwtSecret = await question('JWT Secret (généré automatiquement si vide): ') || generateJwtSecret();
  const nodeEnv = await question('Environnement (development): ') || 'development';
  
  const envContent = `# Configuration Multi-Billeterie
# Généré automatiquement le ${new Date().toISOString()}

# Application
PORT=${port}
NODE_ENV=${nodeEnv}

# Base de données
MONGODB_URI=${mongoUri}

# Authentification
JWT_SECRET=${jwtSecret}

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Autres
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
  
  fs.writeFileSync('.env', envContent);
  log('✅ Fichier .env créé avec succès !', 'green');
}

/**
 * Génère un JWT secret aléatoirement
 */
function generateJwtSecret() {
  return require('crypto').randomBytes(64).toString('hex');
}

/**
 * Installe les dépendances
 */
async function installDependencies() {
  title('Installation des Dépendances');
  
  const packageManager = await question('Gestionnaire de paquets (npm/yarn): ') || 'npm';
  
  if (packageManager === 'yarn' && !commandExists('yarn')) {
    log('❌ Yarn n\'est pas installé, utilisation de npm...', 'yellow');
    packageManager = 'npm';
  }
  
  log(`📦 Installation avec ${packageManager}...`, 'blue');
  
  if (packageManager === 'yarn') {
    exec('yarn install');
  } else {
    exec('npm install');
  }
  
  log('✅ Dépendances installées avec succès !', 'green');
}

/**
 * Configure Git si nécessaire
 */
async function setupGit() {
  title('Configuration Git');
  
  if (!fs.existsSync('.git')) {
    const initGit = await question('Initialiser un repository Git ? (Y/n): ');
    if (initGit.toLowerCase() !== 'n') {
      exec('git init');
      exec('git add .');
      exec('git commit -m "Initial commit - Multi-Billeterie setup"');
      log('✅ Repository Git initialisé !', 'green');
    }
  } else {
    log('✅ Repository Git déjà présent.', 'green');
  }
}

/**
 * Vérifie la connexion MongoDB
 */
async function checkMongoDB() {
  title('Vérification MongoDB');
  
  try {
    // Essayer de se connecter avec mongoose
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/multi-billeterie';
    
    log('🔍 Test de connexion à MongoDB...', 'blue');
    await mongoose.connect(mongoUri, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000 
    });
    
    log('✅ Connexion MongoDB réussie !', 'green');
    await mongoose.disconnect();
  } catch (error) {
    log('⚠️ Impossible de se connecter à MongoDB:', 'yellow');
    log(`   ${error.message}`, 'dim');
    log('\n💡 Assurez-vous que MongoDB est démarré ou utilisez MongoDB Atlas.', 'cyan');
  }
}

/**
 * Exécute les tests pour vérifier l'installation
 */
async function runTests() {
  title('Tests de Validation');
  
  const runTests = await question('Exécuter les tests pour valider l\'installation ? (Y/n): ');
  if (runTests.toLowerCase() === 'n') {
    return;
  }
  
  try {
    log('🧪 Exécution des tests...', 'blue');
    exec('npm test');
    log('✅ Tous les tests passent !', 'green');
  } catch (error) {
    log('⚠️ Certains tests ont échoué.', 'yellow');
    log('Ce n\'est pas critique pour le développement.', 'dim');
  }
}

/**
 * Affiche les instructions finales
 */
function showFinalInstructions() {
  title('Installation Terminée !');
  
  log('🎉 Multi-Billeterie est prêt à être utilisé !', 'green');
  console.log();
  
  log('📋 Prochaines étapes:', 'cyan');
  log('   1. Démarrer l\'application:', 'dim');
  log('      npm run dev', 'yellow');
  console.log();
  
  log('   2. Ouvrir dans le navigateur:', 'dim');
  log('      http://localhost:3000', 'yellow');
  console.log();
  
  log('   3. Consulter la documentation:', 'dim');
  log('      README.md - Guide utilisateur', 'yellow');
  log('      DEPLOYMENT.md - Guide de déploiement', 'yellow');
  log('      CONTRIBUTING.md - Guide de contribution', 'yellow');
  console.log();
  
  log('🆘 Besoin d\'aide ?', 'cyan');
  log('   - GitHub Issues: https://github.com/your-username/multi-billeterie/issues', 'dim');
  log('   - Documentation: Consultez les fichiers .md', 'dim');
  console.log();
  
  log('Bon développement ! 🚀', 'magenta');
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.clear();
    
    log(`
███╗   ███╗██╗   ██╗██╗  ████████╗██╗      ██████╗ ██╗██╗     ██╗     ███████╗████████╗████████╗███████╗██████╗ ██╗███████╗
████╗ ████║██║   ██║██║  ╚══██╔══╝██║      ██╔══██╗██║██║     ██║     ██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗██║██╔════╝
██╔████╔██║██║   ██║██║     ██║   ██║█████╗██████╔╝██║██║     ██║     █████╗     ██║      ██║   █████╗  ██████╔╝██║█████╗  
██║╚██╔╝██║██║   ██║██║     ██║   ██║╚════╝██╔══██╗██║██║     ██║     ██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗██║██╔══╝  
██║ ╚═╝ ██║╚██████╔╝███████╗██║   ██║      ██████╔╝██║███████╗███████╗███████╗   ██║      ██║   ███████╗██║  ██║██║███████╗
╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝      ╚═════╝ ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝
    `, 'cyan');
    
    log('🚀 Installation et Configuration Automatique', 'bright');
    log('   Plateforme multi-billeterie moderne avec architecture MVC\n', 'dim');
    
    await checkPrerequisites();
    await setupEnvironment();
    await installDependencies();
    await setupGit();
    await checkMongoDB();
    await runTests();
    
    showFinalInstructions();
    
  } catch (error) {
    log(`\n❌ Erreur durant l'installation: ${error.message}`, 'red');
    log('Consultez la documentation ou ouvrez une issue sur GitHub.', 'yellow');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Exécution du script
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  setupEnvironment,
  installDependencies,
  setupGit,
  checkMongoDB,
  runTests
};