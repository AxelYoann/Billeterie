#!/bin/bash

# Multi-Billeterie - Script de Setup Rapide pour Linux/macOS
# Ce script automatise l'installation et la configuration du projet

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}"
    echo "========================================"
    echo "   MULTI-BILLETERIE - SETUP RAPIDE"
    echo "========================================"
    echo -e "${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    print_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé"
        print_info "Veuillez installer Node.js depuis https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js détecté : $NODE_VERSION"
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        print_error "npm n'est pas installé"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm détecté : $NPM_VERSION"
    
    # Vérifier Git (optionnel)
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git détecté : $GIT_VERSION"
    else
        print_warning "Git n'est pas installé (optionnel pour le développement)"
    fi
    
    echo
}

# Installer les dépendances
install_dependencies() {
    print_info "Installation des dépendances..."
    
    if npm install; then
        print_success "Dépendances installées avec succès"
    else
        print_error "L'installation des dépendances a échoué"
        exit 1
    fi
    
    echo
}

# Configurer le projet
setup_project() {
    print_info "Configuration du projet..."
    
    if npm run setup; then
        print_success "Configuration terminée"
    else
        print_error "La configuration du projet a échoué"
        exit 1
    fi
    
    echo
}

# Afficher les instructions finales
show_final_instructions() {
    echo -e "${CYAN}"
    echo "========================================"
    echo "     INSTALLATION TERMINÉE !"
    echo "========================================"
    echo -e "${NC}"
    echo
    print_success "Le projet Multi-Billeterie est prêt !"
    echo
    print_info "PROCHAINES ÉTAPES :"
    echo "  1. Démarrer le serveur : npm run dev"
    echo "  2. Ouvrir le navigateur : http://localhost:3000"
    echo "  3. Consulter README.md pour plus d'infos"
    echo
    print_info "FICHIERS IMPORTANTS :"
    echo "  - README.md         : Documentation complète"
    echo "  - DEPLOYMENT.md     : Guide de déploiement"
    echo "  - CONTRIBUTING.md   : Guide de contribution"
    echo "  - .env              : Configuration environnement"
    echo
}

# Démarrer le serveur (optionnel)
start_server() {
    echo -n "Voulez-vous démarrer le serveur maintenant ? (o/N): "
    read -r choice
    
    if [[ $choice =~ ^[Oo]$ ]]; then
        echo
        print_info "Démarrage du serveur..."
        print_info "Ouvrez http://localhost:3000 dans votre navigateur"
        print_info "Appuyez sur Ctrl+C pour arrêter le serveur"
        echo
        npm run dev
    else
        echo
        print_info "Pour démarrer le serveur plus tard, exécutez : npm run dev"
    fi
}

# Fonction principale
main() {
    clear
    print_header
    
    check_prerequisites
    install_dependencies
    setup_project
    show_final_instructions
    start_server
    
    echo
    print_success "Merci d'utiliser Multi-Billeterie ! 🚀"
}

# Gestion des erreurs
set -e
trap 'print_error "Script interrompu par une erreur"' ERR

# Exécuter le script principal
main "$@"